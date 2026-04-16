// Awin Publisher API Client
// Docs: https://help.awin.com/apidocs/

const AWIN_TOKEN = process.env.AWIN_API_TOKEN;
const PUBLISHER_ID = "399675";
const API_BASE = "https://api.awin.com";

async function awinGet<T>(path: string): Promise<T | null> {
  if (!AWIN_TOKEN) return null;
  try {
    const separator = path.includes("?") ? "&" : "?";
    const res = await fetch(`${API_BASE}${path}${separator}accessToken=${AWIN_TOKEN}`, {
      next: { revalidate: 3600 }, // Cache 1h
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// --- Types ---

export type AwinTransaction = {
  id: number;
  advertiserId: number;
  advertiserName?: string;
  publisherId: number;
  commissionStatus: "pending" | "approved" | "declined" | "deleted";
  commissionAmount: { amount: number; currency: string };
  saleAmount: { amount: number; currency: string };
  clickRef?: string;
  transactionDate: string;
  validationDate?: string;
  type: string;
  orderRef?: string;
  paidToPublisher: boolean;
};

export type AwinProgramme = {
  id: number;
  name: string;
  primaryRegion?: { name: string; countryCode: string };
};

// --- Public API ---

export async function getTransactions(
  startDate: string,
  endDate: string,
  options: { status?: string; advertiserId?: string } = {}
): Promise<AwinTransaction[] | null> {
  let path = `/publishers/${PUBLISHER_ID}/transactions/?startDate=${startDate}&endDate=${endDate}&timezone=Europe/Berlin`;
  if (options.status) path += `&status=${options.status}`;
  if (options.advertiserId) path += `&advertiserId=${options.advertiserId}`;
  return awinGet(path);
}

export async function getJoinedProgrammes(): Promise<AwinProgramme[] | null> {
  return awinGet(`/publishers/${PUBLISHER_ID}/programmes/?relationship=joined`);
}

// --- Aggregated helpers ---

export type AwinSummary = {
  totalTransactions: number;
  totalCommission: number;
  totalSales: number;
  pendingCommission: number;
  approvedCommission: number;
  byAdvertiser: {
    advertiserId: number;
    advertiserName: string;
    transactions: number;
    commission: number;
    sales: number;
  }[];
  byClickRef: {
    clickRef: string;
    transactions: number;
    commission: number;
  }[];
  byDay: {
    date: string;
    transactions: number;
    commission: number;
  }[];
  programmes: AwinProgramme[];
};

export async function getAwinSummary(days = 30): Promise<AwinSummary | null> {
  const endDate = new Date().toISOString().slice(0, 19);
  const startDate = new Date(Date.now() - days * 86400_000).toISOString().slice(0, 19);

  const [transactions, programmes] = await Promise.all([
    getTransactions(startDate, endDate),
    getJoinedProgrammes(),
  ]);

  if (!transactions) return null;

  let totalCommission = 0;
  let totalSales = 0;
  let pendingCommission = 0;
  let approvedCommission = 0;

  const advMap = new Map<number, { name: string; transactions: number; commission: number; sales: number }>();
  const clickRefMap = new Map<string, { transactions: number; commission: number }>();
  const dayMap = new Map<string, { transactions: number; commission: number }>();

  for (const tx of transactions) {
    const comm = tx.commissionAmount?.amount ?? 0;
    const sale = tx.saleAmount?.amount ?? 0;

    totalCommission += comm;
    totalSales += sale;

    if (tx.commissionStatus === "pending") pendingCommission += comm;
    if (tx.commissionStatus === "approved") approvedCommission += comm;

    // By advertiser
    const advId = tx.advertiserId;
    const advName = tx.advertiserName || `Advertiser ${advId}`;
    const adv = advMap.get(advId) || { name: advName, transactions: 0, commission: 0, sales: 0 };
    adv.transactions++;
    adv.commission += comm;
    adv.sales += sale;
    advMap.set(advId, adv);

    // By clickRef (article slug)
    const ref = tx.clickRef || "(kein clickRef)";
    const cr = clickRefMap.get(ref) || { transactions: 0, commission: 0 };
    cr.transactions++;
    cr.commission += comm;
    clickRefMap.set(ref, cr);

    // By day
    const day = tx.transactionDate?.slice(0, 10) || "unknown";
    const d = dayMap.get(day) || { transactions: 0, commission: 0 };
    d.transactions++;
    d.commission += comm;
    dayMap.set(day, d);
  }

  return {
    totalTransactions: transactions.length,
    totalCommission: Math.round(totalCommission * 100) / 100,
    totalSales: Math.round(totalSales * 100) / 100,
    pendingCommission: Math.round(pendingCommission * 100) / 100,
    approvedCommission: Math.round(approvedCommission * 100) / 100,
    byAdvertiser: Array.from(advMap.entries())
      .map(([advertiserId, data]) => ({ advertiserId, advertiserName: data.name, ...data }))
      .sort((a, b) => b.commission - a.commission),
    byClickRef: Array.from(clickRefMap.entries())
      .map(([clickRef, data]) => ({ clickRef, ...data }))
      .sort((a, b) => b.commission - a.commission)
      .slice(0, 20),
    byDay: Array.from(dayMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    programmes: programmes || [],
  };
}

// --- Link Builder ---

export type GeneratedLink = {
  url: string;
  shortUrl?: string;
};

export async function generateDeepLink(
  advertiserId: number,
  destinationUrl: string,
  options: { clickref?: string; campaign?: string; shorten?: boolean } = {}
): Promise<GeneratedLink | null> {
  if (!AWIN_TOKEN) return null;

  try {
    const res = await fetch(
      `${API_BASE}/publishers/${PUBLISHER_ID}/linkbuilder/generate?accessToken=${AWIN_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          advertiserId,
          destinationUrl,
          parameters: {
            clickref: options.clickref,
            campaign: options.campaign,
          },
          shorten: options.shorten ?? false,
        }),
      }
    );

    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// Manual deep link construction (no API call needed)
// Format: https://www.awin1.com/cread.php?awinmid={advertiserId}&awinaffid={publisherId}&ued={encodedUrl}&clickref={clickref}
export function buildDeepLinkManual(
  advertiserId: number,
  destinationUrl: string,
  clickref?: string
): string {
  const encoded = encodeURIComponent(destinationUrl);
  let url = `https://www.awin1.com/cread.php?awinmid=${advertiserId}&awinaffid=${PUBLISHER_ID}&ued=${encoded}`;
  if (clickref) url += `&clickref=${encodeURIComponent(clickref)}`;
  return url;
}

// Known advertiser IDs for quick access
export const AWIN_ADVERTISERS = {
  FRITZ_BERGER: 70949,
  ANKER_SOLIX: 32623,
  REIFEN_DE: 10719,
  CAMPING_INFO: 44063,
  CAMPING_4_YOU: 51479,
  CAMPERDAYS: 52889,
  ALLPOWERS: 67914,
  SOUNDCORE: 30687,
  EUFYLIFE: 30691,
  OHNE_MAKLER: 13450,
  BEAUTYWELT: 22835,
} as const;
