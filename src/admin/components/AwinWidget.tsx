"use client";

import { useState, useEffect, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

function fmt(n: number): string { return n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function fmtInt(n: number): string { return n.toLocaleString("de-DE"); }

type AwinSummary = {
  totalTransactions: number;
  totalCommission: number;
  totalSales: number;
  pendingCommission: number;
  approvedCommission: number;
  byAdvertiser: { advertiserId: number; advertiserName: string; transactions: number; commission: number; sales: number }[];
  byClickRef: { clickRef: string; transactions: number; commission: number }[];
  byDay: { date: string; transactions: number; commission: number }[];
  programmes: { id: number; name: string }[];
};

const RANGES = [
  { label: "7T", days: 7 },
  { label: "14T", days: 14 },
  { label: "30T", days: 30 },
];

export default function AwinWidget() {
  const [data, setData] = useState<AwinSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeRange, setActiveRange] = useState(2); // 30T

  const fetchData = useCallback(async (days: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/awin?days=${days}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(30); }, [fetchData]);

  const handleRange = (i: number) => {
    setActiveRange(i);
    fetchData(RANGES[i].days);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">AW</span>
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Awin Affiliate</h2>
            <p className="text-xs text-gray-400">{data?.programmes.length ?? 0} Programme</p>
          </div>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          {RANGES.map((r, i) => (
            <button key={r.label} onClick={() => handleRange(i)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${activeRange === i ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className={`transition-opacity duration-200 ${loading ? "opacity-50" : ""}`}>
        {error ? (
          <div className="p-5 text-center">
            <p className="text-sm text-gray-400">{error}</p>
            <button onClick={() => fetchData(RANGES[activeRange].days)} className="mt-2 text-xs text-blue-500 hover:underline">Erneut versuchen</button>
          </div>
        ) : !data || data.totalTransactions === 0 ? (
          <div className="p-8 text-center">
            <p className="text-2xl mb-2">📊</p>
            <p className="text-sm text-gray-500">Noch keine Transaktionen</p>
            <p className="text-xs text-gray-400 mt-1">{data?.programmes.length ?? 0} Programme aktiv, warte auf erste Conversions</p>
          </div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-gray-100">
              <KpiCell label="Transaktionen" value={fmtInt(data.totalTransactions)} />
              <KpiCell label="Provision" value={`${fmt(data.totalCommission)} €`} accent />
              <KpiCell label="Umsatz" value={`${fmt(data.totalSales)} €`} />
              <KpiCell label="Pending" value={`${fmt(data.pendingCommission)} €`} sub={`Approved: ${fmt(data.approvedCommission)} €`} />
            </div>

            {/* Commission Chart */}
            {data.byDay.length > 1 && (
              <div className="px-5 pt-4 pb-2">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Provision pro Tag</p>
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.byDay} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(v) => v.slice(5)} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "0.5rem", fontSize: "12px" }} itemStyle={{ color: "#e2e8f0" }} labelStyle={{ color: "#94a3b8" }}
                        formatter={(value) => [`${fmt(Number(value))} €`, "Provision"]} />
                      <Bar dataKey="commission" fill="#6366f1" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* By Advertiser */}
            {data.byAdvertiser.length > 0 && (
              <div className="px-5 py-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Nach Advertiser</p>
                <div className="space-y-2">
                  {data.byAdvertiser.map((adv) => (
                    <div key={adv.advertiserId} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 truncate max-w-[200px]">{adv.advertiserName}</span>
                      <div className="flex items-center gap-3 text-xs tabular-nums">
                        <span className="text-gray-400">{adv.transactions} Tx</span>
                        <span className="font-semibold text-gray-900">{fmt(adv.commission)} €</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top clickRefs (Articles) */}
            {data.byClickRef.length > 0 && data.byClickRef[0].clickRef !== "(kein clickRef)" && (
              <div className="px-5 py-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Top Artikel (clickRef)</p>
                <div className="space-y-1.5">
                  {data.byClickRef.slice(0, 10).map((cr) => (
                    <div key={cr.clickRef} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 truncate max-w-[200px] font-mono">{cr.clickRef}</span>
                      <div className="flex items-center gap-2 tabular-nums">
                        <span className="text-gray-400">{cr.transactions}×</span>
                        <span className="font-semibold text-gray-700">{fmt(cr.commission)} €</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function KpiCell({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className="bg-white p-4">
      <p className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
      <p className={`text-lg font-bold tabular-nums mt-0.5 ${accent ? "text-indigo-600" : "text-gray-900"}`}>{value}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}
