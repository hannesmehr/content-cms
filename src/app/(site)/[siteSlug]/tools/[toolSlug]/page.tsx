// @ts-nocheck
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllSiteSlugs, getSiteBySlug } from "@/lib/get-sites";
import { getToolsForSite, getToolBySlug } from "@/lib/tools";
import { getToolContent } from "@/lib/get-tools";
import { ToolIcon } from "@/components/tools/ToolIcon";
import LexicalContent from "@/components/LexicalContent";
import { ToolSchema } from "@/components/ToolSchema";

// ─── Wohnwagen ────────────────────────────────────────────
import { ZuladungsRechner } from "@/components/tools/ZuladungsRechner";
import { FuehrerscheinCheck } from "@/components/tools/FuehrerscheinCheck";
import { GasverbrauchRechner } from "@/components/tools/GasverbrauchRechner";
import { GespannRechner } from "@/components/tools/GespannRechner";
import { StuetzlastRechner } from "@/components/tools/StuetzlastRechner";
import { KfzSteuerRechner } from "@/components/tools/KfzSteuerRechner";
import { SaisonkennzeichenRechner } from "@/components/tools/SaisonkennzeichenRechner";
import { PacklistenGenerator } from "@/components/tools/PacklistenGenerator";
import { JahresKostenRechner } from "@/components/tools/JahresKostenRechner";
import { CampingplatzBudgetRechner } from "@/components/tools/CampingplatzBudgetRechner";
import { ChecklisteEinwintern } from "@/components/tools/ChecklisteEinwintern";
import { ChecklisteAuswintern } from "@/components/tools/ChecklisteAuswintern";
import { ChecklisteAbfahrt } from "@/components/tools/ChecklisteAbfahrt";
import { ChecklisteAnkunft } from "@/components/tools/ChecklisteAnkunft";
import { EAutoReichweitenRechner } from "@/components/tools/EAutoReichweitenRechner";
import { MautRechnerEuropa } from "@/components/tools/MautRechnerEuropa";
import { SolaranlageRechner } from "@/components/tools/SolaranlageRechner";
import { StromverbrauchRechner } from "@/components/tools/StromverbrauchRechner";
import { FrischwasserRechner } from "@/components/tools/FrischwasserRechner";
import { WertverlustRechner } from "@/components/tools/WertverlustRechner";
import { ReifendruckTabelle } from "@/components/tools/ReifendruckTabelle";
import { VorzeltGroessenRechner } from "@/components/tools/VorzeltGroessenRechner";
import { GasflaschenWinterRechner } from "@/components/tools/GasflaschenWinterRechner";
import { KuehlschrankVergleich } from "@/components/tools/KuehlschrankVergleich";
import { VersicherungsRechner } from "@/components/tools/VersicherungsRechner";
import { WohnwagenFinder } from "@/components/tools/WohnwagenFinder";

// ─── Immobiliensanierung ──────────────────────────────────
import { KfwFoerderrechner } from "@/components/tools/KfwFoerderrechner";
import { SanierungskostenRechner } from "@/components/tools/SanierungskostenRechner";
import { UWertRechner } from "@/components/tools/UWertRechner";
import { AmortisationsRechner } from "@/components/tools/AmortisationsRechner";
import { EnergieeffizienzCheck } from "@/components/tools/EnergieeffizienzCheck";
import { HeizlastRechner } from "@/components/tools/HeizlastRechner";
import { HandwerkerkostenRechner } from "@/components/tools/HandwerkerkostenRechner";
import { ModernisierungsUmlageRechner } from "@/components/tools/ModernisierungsUmlageRechner";

// ─── Fahrschule ───────────────────────────────────────────
import { FuehrerscheinkostenRechner } from "@/components/tools/FuehrerscheinkostenRechner";
import { BussgeldRechner } from "@/components/tools/BussgeldRechner";
import { ProbezeitRechner } from "@/components/tools/ProbezeitRechner";
import { TheoriepruefungQuiz } from "@/components/tools/TheoriepruefungQuiz";
import { ChecklisteFuehrerschein } from "@/components/tools/ChecklisteFuehrerschein";

// ─── Wohnung ──────────────────────────────────────────────
import { MieterhoehungsRechner } from "@/components/tools/MieterhoehungsRechner";
import { NebenkostenRechner } from "@/components/tools/NebenkostenRechner";
import { KautionsRechner } from "@/components/tools/KautionsRechner";
import { KuendigungsfristRechner } from "@/components/tools/KuendigungsfristRechner";
import { UmzugskostenRechner } from "@/components/tools/UmzugskostenRechner";
import { WohnflaecheRechner } from "@/components/tools/WohnflaecheRechner";
import { MietminderungRechner } from "@/components/tools/MietminderungRechner";
import { ChecklisteWohnungsbesichtigung } from "@/components/tools/ChecklisteWohnungsbesichtigung";

// ─── Beziehung ────────────────────────────────────────────
import { FernbeziehungKostenRechner } from "@/components/tools/FernbeziehungKostenRechner";
import { BesuchsCountdown } from "@/components/tools/BesuchsCountdown";
import { DateIdeenGenerator } from "@/components/tools/DateIdeenGenerator";

export const revalidate = 3600;

type Props = {
  params: Promise<{ siteSlug: string; toolSlug: string }>;
};

const componentMap: Record<string, React.ComponentType> = {
  // Wohnwagen
  "zuladungsrechner": ZuladungsRechner,
  "fuehrerschein-check": FuehrerscheinCheck,
  "gasverbrauch-rechner": GasverbrauchRechner,
  "gespann-rechner": GespannRechner,
  "stuetzlast-rechner": StuetzlastRechner,
  "kfz-steuer-rechner": KfzSteuerRechner,
  "saisonkennzeichen-rechner": SaisonkennzeichenRechner,
  "packlisten-generator": PacklistenGenerator,
  "jahreskosten-rechner": JahresKostenRechner,
  "campingplatz-budget-rechner": CampingplatzBudgetRechner,
  "checkliste-einwintern": ChecklisteEinwintern,
  "checkliste-auswintern": ChecklisteAuswintern,
  "checkliste-abfahrt": ChecklisteAbfahrt,
  "checkliste-ankunft": ChecklisteAnkunft,
  "e-auto-reichweiten-rechner": EAutoReichweitenRechner,
  "maut-rechner-europa": MautRechnerEuropa,
  "solaranlage-rechner": SolaranlageRechner,
  "stromverbrauch-rechner": StromverbrauchRechner,
  "frischwasser-rechner": FrischwasserRechner,
  "wertverlust-rechner": WertverlustRechner,
  "reifendruck-tabelle": ReifendruckTabelle,
  "vorzelt-groessen-rechner": VorzeltGroessenRechner,
  "gasflaschen-winter-rechner": GasflaschenWinterRechner,
  "kuehlschrank-vergleich": KuehlschrankVergleich,
  "versicherungs-rechner": VersicherungsRechner,
  "wohnwagen-finder": WohnwagenFinder,
  // Immobiliensanierung
  "kfw-foerderrechner": KfwFoerderrechner,
  "sanierungskosten-rechner": SanierungskostenRechner,
  "u-wert-rechner": UWertRechner,
  "amortisationsrechner": AmortisationsRechner,
  "energieeffizienz-check": EnergieeffizienzCheck,
  "heizlast-rechner": HeizlastRechner,
  "handwerkerkosten-rechner": HandwerkerkostenRechner,
  "modernisierungsumlage-rechner": ModernisierungsUmlageRechner,
  // Fahrschule
  "fuehrerscheinkosten-rechner": FuehrerscheinkostenRechner,
  "bussgeld-rechner": BussgeldRechner,
  "probezeit-rechner": ProbezeitRechner,
  "theoriepruefung-quiz": TheoriepruefungQuiz,
  "checkliste-fuehrerschein": ChecklisteFuehrerschein,
  // Wohnung
  "mieterhoehungs-rechner": MieterhoehungsRechner,
  "nebenkosten-rechner": NebenkostenRechner,
  "kautions-rechner": KautionsRechner,
  "kuendigungsfrist-rechner": KuendigungsfristRechner,
  "umzugskosten-rechner": UmzugskostenRechner,
  "wohnflaeche-rechner": WohnflaecheRechner,
  "mietminderung-rechner": MietminderungRechner,
  "checkliste-wohnungsbesichtigung": ChecklisteWohnungsbesichtigung,
  // Beziehung
  "fernbeziehung-kosten-rechner": FernbeziehungKostenRechner,
  "besuchs-countdown": BesuchsCountdown,
  "date-ideen-generator": DateIdeenGenerator,
};

export async function generateStaticParams() {
  const siteSlugs = await getAllSiteSlugs();
  const params: { siteSlug: string; toolSlug: string }[] = [];

  for (const siteSlug of siteSlugs) {
    const siteTools = getToolsForSite(siteSlug);
    for (const tool of siteTools) {
      params.push({ siteSlug, toolSlug: tool.slug });
    }
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { siteSlug, toolSlug } = await params;
  const tool = getToolBySlug(toolSlug);
  const site = await getSiteBySlug(siteSlug);
  if (!tool || !site) return {};

  const toolContent = await getToolContent(toolSlug, siteSlug);
  const title = toolContent?.seoTitle || tool.title;
  const description = toolContent?.seoDescription || tool.description;
  const toolUrl = `https://${site.domain}/tools/${tool.slug}`;

  return {
    title,
    description,
    alternates: { canonical: toolUrl },
    openGraph: {
      title,
      description,
      type: "website",
      url: toolUrl,
      siteName: site.name,
      locale: "de_DE",
    },
  };
}

export default async function ToolPage({ params }: Props) {
  const { siteSlug, toolSlug } = await params;
  const tool = getToolBySlug(toolSlug);

  if (!tool || !tool.sites.includes(siteSlug)) {
    notFound();
  }

  const ToolComponent = componentMap[tool.slug];
  if (!ToolComponent) {
    notFound();
  }

  const [site, toolContent] = await Promise.all([
    getSiteBySlug(siteSlug),
    getToolContent(toolSlug, siteSlug),
  ]);

  const siteUrl = site ? `https://${site.domain}` : "";
  const toolUrl = `${siteUrl}/tools/${tool.slug}`;

  // Find related tools from the same site (exclude current)
  const siteTools = getToolsForSite(siteSlug);
  const relatedTools = siteTools.filter((t) => t.slug !== tool.slug).slice(0, 3);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <ToolSchema
        title={toolContent?.seoTitle || tool.title}
        shortTitle={tool.shortTitle}
        description={toolContent?.seoDescription || tool.description}
        url={toolUrl}
        siteName={site?.name || ""}
        siteUrl={siteUrl}
        faqItems={toolContent?.faqItems}
      />

      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/tools" className="hover:text-primary-700 transition-colors">
          Tools & Rechner
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{tool.shortTitle}</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900 mb-3">{tool.title}</h1>
      <p className="text-gray-600 mb-8">{tool.description}</p>

      {toolContent?.contentAbove && (
        <div className="prose prose-gray max-w-none mb-8">
          <LexicalContent
            data={toolContent.contentAbove}
            enableAffiliates={site?.enableAffiliates}
          />
        </div>
      )}

      <ToolComponent />

      {toolContent?.contentBelow && (
        <div className="prose prose-gray max-w-none mt-12">
          <LexicalContent
            data={toolContent.contentBelow}
            enableAffiliates={site?.enableAffiliates}
          />
        </div>
      )}

      {relatedTools.length > 0 && (
        <div className="mt-16 border-t border-gray-200 pt-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Weitere Tools
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {relatedTools.map((t) => (
              <Link
                key={t.slug}
                href={`/tools/${t.slug}`}
                className="group flex items-center gap-3 rounded-lg border border-gray-200 p-3 transition-all hover:border-primary-600"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
                  <ToolIcon icon={t.icon} className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-primary-700">
                  {t.shortTitle}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
