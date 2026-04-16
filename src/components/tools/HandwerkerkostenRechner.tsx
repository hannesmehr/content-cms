"use client";

import { useState } from "react";

interface Gewerk {
  id: string;
  label: string;
  stundensatzMin: number;
  stundensatzMax: number;
  anfahrt: number;
  materialAufschlag: number; // Faktor auf Arbeit
  typischeStunden: { label: string; stunden: number }[];
}

const gewerkeDaten: Gewerk[] = [
  {
    id: "elektriker",
    label: "Elektriker",
    stundensatzMin: 55,
    stundensatzMax: 85,
    anfahrt: 50,
    materialAufschlag: 0.3,
    typischeStunden: [
      { label: "Steckdose setzen", stunden: 1.5 },
      { label: "Sicherungskasten erneuern", stunden: 8 },
      { label: "Wohnung komplett neu verkabeln (80m²)", stunden: 40 },
      { label: "Smart-Home Grundinstallation", stunden: 16 },
    ],
  },
  {
    id: "klempner",
    label: "Klempner / Sanitär",
    stundensatzMin: 55,
    stundensatzMax: 90,
    anfahrt: 50,
    materialAufschlag: 0.35,
    typischeStunden: [
      { label: "Wasserhahn austauschen", stunden: 1 },
      { label: "WC montieren", stunden: 3 },
      { label: "Badezimmer komplett (ohne Fliesen)", stunden: 24 },
      { label: "Rohrleitungssanierung (Wohnung)", stunden: 32 },
    ],
  },
  {
    id: "maler",
    label: "Maler / Lackierer",
    stundensatzMin: 45,
    stundensatzMax: 65,
    anfahrt: 40,
    materialAufschlag: 0.25,
    typischeStunden: [
      { label: "Zimmer streichen (15m²)", stunden: 4 },
      { label: "Wohnung streichen (80m²)", stunden: 24 },
      { label: "Fassade streichen (EFH)", stunden: 40 },
      { label: "Tapezieren (Zimmer 15m²)", stunden: 6 },
    ],
  },
  {
    id: "fliesenleger",
    label: "Fliesenleger",
    stundensatzMin: 50,
    stundensatzMax: 80,
    anfahrt: 45,
    materialAufschlag: 0.4,
    typischeStunden: [
      { label: "Bad fliesen (8m²)", stunden: 16 },
      { label: "Küchenspiegel (2m²)", stunden: 4 },
      { label: "Terrassenplatten (20m²)", stunden: 16 },
      { label: "Bodenfliesen Flur (10m²)", stunden: 8 },
    ],
  },
  {
    id: "tischler",
    label: "Tischler / Schreiner",
    stundensatzMin: 50,
    stundensatzMax: 80,
    anfahrt: 50,
    materialAufschlag: 0.35,
    typischeStunden: [
      { label: "Innentür einbauen", stunden: 3 },
      { label: "Einbauschrank (2m breit)", stunden: 16 },
      { label: "Treppe renovieren", stunden: 24 },
      { label: "Dachfenster einbauen", stunden: 8 },
    ],
  },
  {
    id: "dachdecker",
    label: "Dachdecker",
    stundensatzMin: 55,
    stundensatzMax: 85,
    anfahrt: 60,
    materialAufschlag: 0.4,
    typischeStunden: [
      { label: "Dachziegel reparieren (5m²)", stunden: 4 },
      { label: "Dach neu eindecken (100m²)", stunden: 60 },
      { label: "Dachdämmung (100m²)", stunden: 40 },
      { label: "Dachrinne erneuern (EFH)", stunden: 8 },
    ],
  },
  {
    id: "maurer",
    label: "Maurer",
    stundensatzMin: 45,
    stundensatzMax: 75,
    anfahrt: 50,
    materialAufschlag: 0.3,
    typischeStunden: [
      { label: "Wanddurchbruch (Innenwand)", stunden: 8 },
      { label: "Garage mauern", stunden: 80 },
      { label: "Außenputz erneuern (100m²)", stunden: 40 },
      { label: "Schornstein sanieren", stunden: 16 },
    ],
  },
  {
    id: "heizungsbauer",
    label: "Heizungsbauer",
    stundensatzMin: 55,
    stundensatzMax: 90,
    anfahrt: 55,
    materialAufschlag: 0.2,
    typischeStunden: [
      { label: "Heizkörper tauschen", stunden: 3 },
      { label: "Gastherme installieren", stunden: 12 },
      { label: "Wärmepumpe installieren", stunden: 24 },
      { label: "Fußbodenheizung (80m²)", stunden: 40 },
    ],
  },
  {
    id: "trockenbauer",
    label: "Trockenbauer",
    stundensatzMin: 40,
    stundensatzMax: 65,
    anfahrt: 40,
    materialAufschlag: 0.3,
    typischeStunden: [
      { label: "Rigipswand (10m²)", stunden: 8 },
      { label: "Abgehängte Decke (20m²)", stunden: 12 },
      { label: "Dachausbau trocken (40m²)", stunden: 32 },
      { label: "Raumteiler errichten", stunden: 6 },
    ],
  },
];

type Regionsfaktor = "grossstadt" | "kleinstadt" | "laendlich";

const regionsFaktoren: Record<Regionsfaktor, { label: string; faktor: number }> = {
  grossstadt: { label: "Großstadt (>200.000 Einw.)", faktor: 1.2 },
  kleinstadt: { label: "Kleinstadt / Vorort", faktor: 1.0 },
  laendlich: { label: "Ländlich", faktor: 0.85 },
};

export function HandwerkerkostenRechner() {
  const [gewerkIdx, setGewerkIdx] = useState<number>(0);
  const [regionKey, setRegionKey] = useState<Regionsfaktor>("kleinstadt");
  const [geschaetzteStunden, setGeschaetzteStunden] = useState<number>(8);
  const [inklusiveMaterial, setInklusiveMaterial] = useState(true);
  const [wochenende, setWochenende] = useState(false);
  const [notdienst, setNotdienst] = useState(false);

  const formatEur = (val: number) =>
    val.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const formatEurDecimal = (val: number) =>
    val.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const g = gewerkeDaten[gewerkIdx];
  const regionFaktor = regionsFaktoren[regionKey].faktor;

  // Aufschläge
  let aufschlag = 1.0;
  if (wochenende) aufschlag += 0.5;
  if (notdienst) aufschlag += 1.0;

  const effStundensatzMin = g.stundensatzMin * regionFaktor * aufschlag;
  const effStundensatzMax = g.stundensatzMax * regionFaktor * aufschlag;
  const effAnfahrt = g.anfahrt * regionFaktor;

  const arbeitskostenMin = geschaetzteStunden * effStundensatzMin;
  const arbeitskostenMax = geschaetzteStunden * effStundensatzMax;
  const materialMin = inklusiveMaterial ? arbeitskostenMin * g.materialAufschlag : 0;
  const materialMax = inklusiveMaterial ? arbeitskostenMax * g.materialAufschlag : 0;

  const gesamtMin = arbeitskostenMin + materialMin + effAnfahrt;
  const gesamtMax = arbeitskostenMax + materialMax + effAnfahrt;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Gewerk</label>
          <select
            value={gewerkIdx}
            onChange={(e) => setGewerkIdx(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          >
            {gewerkeDaten.map((gw, i) => (
              <option key={gw.id} value={i}>
                {gw.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
          <select
            value={regionKey}
            onChange={(e) => setRegionKey(e.target.value as Regionsfaktor)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          >
            {Object.entries(regionsFaktoren).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label} (Faktor {val.faktor.toLocaleString("de-DE")}×)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Geschätzte Stunden
          </label>
          <input
            type="number"
            min={0.5}
            step={0.5}
            value={geschaetzteStunden}
            onChange={(e) => setGeschaetzteStunden(Math.max(0.5, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-800">Optionen</h3>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={inklusiveMaterial}
              onChange={(e) => setInklusiveMaterial(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
            />
            <span className="text-sm text-gray-700">
              Material pauschal einrechnen (+{Math.round(g.materialAufschlag * 100)}%)
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={wochenende}
              onChange={(e) => setWochenende(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
            />
            <span className="text-sm text-gray-700">Wochenend-Aufschlag (+50%)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={notdienst}
              onChange={(e) => setNotdienst(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
            />
            <span className="text-sm text-gray-700">Notdienst-Aufschlag (+100%)</span>
          </label>
        </div>
      </div>

      {/* Stundensätze & typische Arbeiten */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-800">
          {g.label} — Stundensätze & typische Arbeiten
        </h3>
        <div className="mb-3 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-gray-50 p-3 text-center">
            <p className="text-xs text-gray-500">Stundensatz (Basis)</p>
            <p className="text-lg font-bold text-gray-900">
              {formatEur(g.stundensatzMin)}–{formatEur(g.stundensatzMax)} €
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-center">
            <p className="text-xs text-gray-500">Anfahrtspauschale</p>
            <p className="text-lg font-bold text-gray-900">{formatEur(g.anfahrt)} €</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-center">
            <p className="text-xs text-gray-500">Material-Aufschlag</p>
            <p className="text-lg font-bold text-gray-900">
              ca. {Math.round(g.materialAufschlag * 100)}%
            </p>
          </div>
        </div>

        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Typische Arbeiten & Zeitaufwand
        </h4>
        <div className="space-y-1">
          {g.typischeStunden.map((ts, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded border border-gray-100 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
              onClick={() => setGeschaetzteStunden(ts.stunden)}
            >
              <span className="text-gray-700">{ts.label}</span>
              <span className="font-medium text-primary-700">ca. {ts.stunden} Std.</span>
            </div>
          ))}
          <p className="text-xs text-gray-400 mt-1">
            Klicke auf eine Arbeit, um die Stunden zu übernehmen.
          </p>
        </div>
      </div>

      {/* Regionaler Vergleich */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-800">
          Regionaler Kostenvergleich ({geschaetzteStunden} Std. {g.label})
        </h3>
        <div className="space-y-2">
          {Object.entries(regionsFaktoren).map(([key, val]) => {
            const minR = geschaetzteStunden * g.stundensatzMin * val.faktor + g.anfahrt * val.faktor;
            const maxR = geschaetzteStunden * g.stundensatzMax * val.faktor + g.anfahrt * val.faktor;
            const isSelected = key === regionKey;
            return (
              <div key={key} className="flex items-center gap-3">
                <span className={`w-36 text-sm ${isSelected ? "font-bold text-primary-700" : "text-gray-600"}`}>
                  {val.label.split("(")[0].trim()}
                </span>
                <div className="flex-1">
                  <div className="relative h-6 rounded-full bg-gray-200">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isSelected ? "bg-primary-600" : "bg-gray-400"
                      }`}
                      style={{
                        width: `${Math.min(
                          (maxR / (geschaetzteStunden * g.stundensatzMax * 1.2 + g.anfahrt * 1.2)) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
                <span className={`w-32 text-right text-sm ${isSelected ? "font-bold text-primary-700" : "text-gray-600"}`}>
                  {formatEur(Math.round(minR))}–{formatEur(Math.round(maxR))} €
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-gray-500">Nur Arbeitskosten + Anfahrt, ohne Material</p>
      </div>

      {/* Kostenberechnung */}
      <div className="rounded-lg border-2 border-primary-600 bg-primary-50 p-6">
        <h3 className="mb-4 text-lg font-bold text-gray-900">
          Kostenschätzung: {geschaetzteStunden} Stunden {g.label}
        </h3>

        <div className="mb-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-300 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="py-2 pr-4">Position</th>
                <th className="py-2 pr-4 text-right">Min.</th>
                <th className="py-2 text-right">Max.</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-2 pr-4 text-gray-700">
                  Arbeitskosten ({geschaetzteStunden} Std. × {formatEur(Math.round(effStundensatzMin))}–{formatEur(Math.round(effStundensatzMax))} €)
                  {(wochenende || notdienst) && (
                    <span className="ml-1 text-xs text-red-600">
                      {wochenende && !notdienst && "(+50% WE)"}
                      {notdienst && !wochenende && "(+100% Notdienst)"}
                      {wochenende && notdienst && "(+50% WE, +100% Notdienst)"}
                    </span>
                  )}
                </td>
                <td className="py-2 pr-4 text-right font-medium text-gray-900">
                  {formatEur(Math.round(arbeitskostenMin))} €
                </td>
                <td className="py-2 text-right font-medium text-gray-900">
                  {formatEur(Math.round(arbeitskostenMax))} €
                </td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 pr-4 text-gray-700">Anfahrtspauschale</td>
                <td className="py-2 pr-4 text-right font-medium text-gray-900" colSpan={2}>
                  {formatEur(Math.round(effAnfahrt))} €
                </td>
              </tr>
              {inklusiveMaterial && (
                <tr className="border-b border-gray-200">
                  <td className="py-2 pr-4 text-gray-700">
                    Material (ca. {Math.round(g.materialAufschlag * 100)}% Aufschlag)
                  </td>
                  <td className="py-2 pr-4 text-right font-medium text-gray-900">
                    {formatEur(Math.round(materialMin))} €
                  </td>
                  <td className="py-2 text-right font-medium text-gray-900">
                    {formatEur(Math.round(materialMax))} €
                  </td>
                </tr>
              )}
              <tr className="font-bold text-primary-700">
                <td className="py-3 pr-4 text-base">Gesamtkosten</td>
                <td className="py-3 pr-4 text-right text-base">
                  {formatEur(Math.round(gesamtMin))} €
                </td>
                <td className="py-3 text-right text-base">
                  {formatEur(Math.round(gesamtMax))} €
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Geschätzter Preis
            </p>
            <p className="mt-1 text-2xl font-bold text-primary-700">
              {formatEur(Math.round(gesamtMin))}–{formatEur(Math.round(gesamtMax))} €
            </p>
            <p className="text-xs text-gray-500">
              inkl. MwSt. (Region: {regionsFaktoren[regionKey].label.split("(")[0].trim()})
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Effektiver Stundensatz
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {formatEurDecimal(effStundensatzMin)}–{formatEurDecimal(effStundensatzMax)} €
            </p>
            <p className="text-xs text-gray-500">
              pro Stunde (Region + Aufschläge)
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
        <strong>Tipp:</strong> Hole dir immer mindestens 3 Angebote ein und vergleiche nicht
        nur den Preis, sondern auch Referenzen und Bewertungen. Handwerkerkosten variieren stark
        nach Region und Auslastung. Die Materialkosten hängen zusätzlich von der gewählten Qualität ab.
      </div>
    </div>
  );
}
