"use client";

import { useState } from "react";

interface Gewerk {
  id: string;
  label: string;
  typ: "pro_qm" | "pauschal" | "pro_stueck" | "pro_qm_extra";
  minKosten: number;
  maxKosten: number;
  einheit: string;
  color: string;
}

const gewerke: Gewerk[] = [
  { id: "dach", label: "Dach neu eindecken", typ: "pro_qm", minKosten: 100, maxKosten: 200, einheit: "€/m²", color: "#dc2626" },
  { id: "fassade", label: "Fassadendämmung (WDVS)", typ: "pro_qm", minKosten: 120, maxKosten: 200, einheit: "€/m²", color: "#ea580c" },
  { id: "fenster", label: "Fenster austauschen", typ: "pro_stueck", minKosten: 500, maxKosten: 900, einheit: "€/Fenster", color: "#d97706" },
  { id: "wp", label: "Heizungstausch (Wärmepumpe)", typ: "pauschal", minKosten: 15000, maxKosten: 30000, einheit: "€ pauschal", color: "#65a30d" },
  { id: "gas", label: "Heizungstausch (Gas-Brennwert)", typ: "pauschal", minKosten: 6000, maxKosten: 12000, einheit: "€ pauschal", color: "#16a34a" },
  { id: "bad", label: "Bad komplett sanieren", typ: "pro_qm_extra", minKosten: 800, maxKosten: 1500, einheit: "€/m² Bad", color: "#0891b2" },
  { id: "elektrik", label: "Elektrik erneuern", typ: "pro_qm", minKosten: 40, maxKosten: 80, einheit: "€/m²", color: "#2563eb" },
  { id: "putz", label: "Innenputz / Malerarbeiten", typ: "pro_qm", minKosten: 20, maxKosten: 40, einheit: "€/m²", color: "#7c3aed" },
  { id: "boden", label: "Bodenbeläge", typ: "pro_qm", minKosten: 30, maxKosten: 80, einheit: "€/m²", color: "#c026d3" },
];

export function SanierungskostenRechner() {
  const [wohnflaeche, setWohnflaeche] = useState<number>(120);
  const [selectedGewerke, setSelectedGewerke] = useState<Set<string>>(new Set());
  const [fensterAnzahl, setFensterAnzahl] = useState<number>(12);
  const [badQm, setBadQm] = useState<number>(8);

  const formatEur = (val: number) =>
    val.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const toggleGewerk = (id: string) => {
    const next = new Set(selectedGewerke);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedGewerke(next);
  };

  const berechneKosten = (g: Gewerk): { min: number; max: number } => {
    switch (g.typ) {
      case "pro_qm":
        return { min: g.minKosten * wohnflaeche, max: g.maxKosten * wohnflaeche };
      case "pauschal":
        return { min: g.minKosten, max: g.maxKosten };
      case "pro_stueck":
        return { min: g.minKosten * fensterAnzahl, max: g.maxKosten * fensterAnzahl };
      case "pro_qm_extra":
        return { min: g.minKosten * badQm, max: g.maxKosten * badQm };
      default:
        return { min: 0, max: 0 };
    }
  };

  const ausgewaehlteGewerke = gewerke.filter((g) => selectedGewerke.has(g.id));
  const kostenDetails = ausgewaehlteGewerke.map((g) => ({
    ...g,
    kosten: berechneKosten(g),
  }));

  const totalMin = kostenDetails.reduce((sum, g) => sum + g.kosten.min, 0);
  const totalMax = kostenDetails.reduce((sum, g) => sum + g.kosten.max, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Wohnfläche (m²)
          </label>
          <input
            type="number"
            min={1}
            value={wohnflaeche}
            onChange={(e) => setWohnflaeche(Math.max(1, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Anzahl Fenster
          </label>
          <input
            type="number"
            min={0}
            value={fensterAnzahl}
            onChange={(e) => setFensterAnzahl(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Badezimmer-Fläche (m²)
          </label>
          <input
            type="number"
            min={0}
            value={badQm}
            onChange={(e) => setBadQm(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-800">
          Gewerke auswählen
        </h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {gewerke.map((g) => (
            <label
              key={g.id}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                selectedGewerke.has(g.id)
                  ? "border-primary-600 bg-primary-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedGewerke.has(g.id)}
                onChange={() => toggleGewerk(g.id)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">{g.label}</p>
                <p className="text-xs text-gray-500">
                  {formatEur(g.minKosten)}–{formatEur(g.maxKosten)} {g.einheit}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {ausgewaehlteGewerke.length > 0 && (
        <div className="rounded-lg border-2 border-primary-600 bg-primary-50 p-6">
          <h3 className="mb-4 text-lg font-bold text-gray-900">Kostenschätzung</h3>

          <div className="mb-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Minimum
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{formatEur(totalMin)} €</p>
            </div>
            <div className="rounded-lg bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Durchschnitt
              </p>
              <p className="mt-1 text-2xl font-bold text-primary-700">
                {formatEur(Math.round((totalMin + totalMax) / 2))} €
              </p>
            </div>
            <div className="rounded-lg bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Maximum
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{formatEur(totalMax)} €</p>
            </div>
          </div>

          {/* Kostenaufstellung mit Balken */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Aufschlüsselung nach Gewerk</h4>
            {kostenDetails.map((g) => {
              const anteilMax = totalMax > 0 ? (g.kosten.max / totalMax) * 100 : 0;
              return (
                <div key={g.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-700">
                      <span
                        className="inline-block h-3 w-3 rounded-sm"
                        style={{ backgroundColor: g.color }}
                      />
                      {g.label}
                    </span>
                    <span className="font-medium text-gray-900">
                      {formatEur(g.kosten.min)}–{formatEur(g.kosten.max)} €
                    </span>
                  </div>
                  <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(anteilMax, 2)}%`,
                        backgroundColor: g.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Kostenverteilung */}
          <div className="mt-6 rounded-lg bg-white p-4 shadow-sm">
            <h4 className="mb-2 text-sm font-semibold text-gray-800">
              Kostenverteilung (Durchschnitt)
            </h4>
            <div className="flex h-8 w-full overflow-hidden rounded-full">
              {kostenDetails.map((g) => {
                const avg = (g.kosten.min + g.kosten.max) / 2;
                const totalAvg = (totalMin + totalMax) / 2;
                const percent = totalAvg > 0 ? (avg / totalAvg) * 100 : 0;
                return (
                  <div
                    key={g.id}
                    className="flex items-center justify-center text-xs font-bold text-white transition-all duration-500"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: g.color,
                      minWidth: percent > 0 ? "2px" : "0",
                    }}
                    title={`${g.label}: ${Math.round(percent)}%`}
                  >
                    {percent > 8 ? `${Math.round(percent)}%` : ""}
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {kostenDetails.map((g) => {
                const avg = (g.kosten.min + g.kosten.max) / 2;
                const totalAvg = (totalMin + totalMax) / 2;
                const percent = totalAvg > 0 ? Math.round((avg / totalAvg) * 100) : 0;
                return (
                  <span key={g.id} className="flex items-center gap-1 text-xs text-gray-600">
                    <span
                      className="inline-block h-2 w-2 rounded-sm"
                      style={{ backgroundColor: g.color }}
                    />
                    {g.label}: {percent}%
                  </span>
                );
              })}
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
            <strong>Hinweis:</strong> Die Kosten sind Durchschnittswerte und können je nach Region,
            Zustand des Gebäudes und Qualität der Materialien stark variieren. Hole dir immer
            mehrere Angebote von Fachbetrieben ein.
          </div>
        </div>
      )}

      {ausgewaehlteGewerke.length === 0 && (
        <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
          Wähle mindestens ein Gewerk aus, um eine Kostenschätzung zu erhalten.
        </div>
      )}
    </div>
  );
}
