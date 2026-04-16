"use client";

import { useState } from "react";

// Spezifische Heizlast in W/m² nach Baujahr und Dämmstandard
const heizlastTabelle: Record<string, Record<string, number>> = {
  "vor1978": { unsaniert: 120, teilsaniert: 90, vollsaniert: 60 },
  "1979-1994": { unsaniert: 90, teilsaniert: 70, vollsaniert: 50 },
  "1995-2001": { unsaniert: 70, teilsaniert: 55, vollsaniert: 40 },
  "2002-2009": { unsaniert: 55, teilsaniert: 45, vollsaniert: 35 },
  "2010-2015": { unsaniert: 45, teilsaniert: 38, vollsaniert: 30 },
  "ab2016": { unsaniert: 35, teilsaniert: 30, vollsaniert: 25 },
};

const baujahreLabels: Record<string, string> = {
  "vor1978": "vor 1978",
  "1979-1994": "1979–1994",
  "1995-2001": "1995–2001",
  "2002-2009": "2002–2009",
  "2010-2015": "2010–2015",
  "ab2016": "ab 2016",
};

// Gebäudetyp-Faktoren (Eckhäuser/EFH haben mehr Außenfläche)
const gebaeudetypFaktoren: Record<string, { label: string; faktor: number }> = {
  efh: { label: "Einfamilienhaus (freistehend)", faktor: 1.15 },
  dhh: { label: "Doppelhaushälfte", faktor: 1.0 },
  rh: { label: "Reihenhaus (Mittelhaus)", faktor: 0.85 },
  etw: { label: "Etagenwohnung", faktor: 0.75 },
};

// Regionale Außentemperaturen (Normdaten)
const regionen: Record<string, { label: string; normTemp: number; beschreibung: string }> = {
  nord: { label: "Norddeutschland", normTemp: -12, beschreibung: "z.B. Hamburg, Bremen, Kiel" },
  mitte: { label: "Mitteldeutschland", normTemp: -14, beschreibung: "z.B. Frankfurt, Köln, Leipzig" },
  sued: { label: "Süddeutschland", normTemp: -16, beschreibung: "z.B. München, Stuttgart, Freiburg" },
};

export function HeizlastRechner() {
  const [wohnflaeche, setWohnflaeche] = useState<number>(140);
  const [baujahr, setBaujahr] = useState<string>("1979-1994");
  const [gebaeudetyp, setGebaeudetyp] = useState<string>("efh");
  const [daemmstandard, setDaemmstandard] = useState<string>("teilsaniert");
  const [region, setRegion] = useState<string>("mitte");

  const formatNum = (val: number, digits: number = 1) =>
    val.toLocaleString("de-DE", { minimumFractionDigits: digits, maximumFractionDigits: digits });

  // Berechnung
  const spezHeizlast = heizlastTabelle[baujahr]?.[daemmstandard] || 60;
  const typFaktor = gebaeudetypFaktoren[gebaeudetyp]?.faktor || 1.0;
  const regionDaten = regionen[region];

  // Regionaler Korrekturfaktor basierend auf Außentemperatur
  // Bezug: -14°C als Norm (Mitteldeutschland)
  const tempKorrektur = 1 + (Math.abs(regionDaten.normTemp) - 14) * 0.02;

  const heizlastGesamt = (wohnflaeche * spezHeizlast * typFaktor * tempKorrektur) / 1000; // kW
  const heizlastProQm = spezHeizlast * typFaktor * tempKorrektur;

  // Empfohlene Vorlauftemperatur
  let vorlaufTemp: string;
  let wpGeeignet: boolean;
  let wpHinweis: string;

  if (heizlastProQm <= 40) {
    vorlaufTemp = "35°C";
    wpGeeignet = true;
    wpHinweis = "Sehr gut für Wärmepumpe geeignet. Fußbodenheizung ideal.";
  } else if (heizlastProQm <= 60) {
    vorlaufTemp = "45°C";
    wpGeeignet = true;
    wpHinweis = "Gut für Wärmepumpe geeignet. Fußbodenheizung oder große Heizkörper empfohlen.";
  } else if (heizlastProQm <= 80) {
    vorlaufTemp = "55°C";
    wpGeeignet = true;
    wpHinweis = "Wärmepumpe möglich, aber Heizkörper ggf. vergrößern. Effizienz sinkt bei hoher Vorlauftemperatur.";
  } else {
    vorlaufTemp = "65–75°C";
    wpGeeignet = false;
    wpHinweis = "Wärmepumpe nur bedingt geeignet. Erst Gebäudehülle sanieren (Dämmung, Fenster), um die Heizlast zu senken.";
  }

  // Heizkörper-Dimensionierung (Richtwerte)
  const anzahlRaeume = Math.max(1, Math.round(wohnflaeche / 20));
  const leistungProRaum = (heizlastGesamt * 1000) / anzahlRaeume;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Wohnfläche (m²)</label>
          <input
            type="number"
            min={1}
            value={wohnflaeche}
            onChange={(e) => setWohnflaeche(Math.max(1, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Baujahr</label>
          <select
            value={baujahr}
            onChange={(e) => setBaujahr(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          >
            {Object.entries(baujahreLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gebäudetyp</label>
          <select
            value={gebaeudetyp}
            onChange={(e) => setGebaeudetyp(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          >
            {Object.entries(gebaeudetypFaktoren).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dämmstandard</label>
          <select
            value={daemmstandard}
            onChange={(e) => setDaemmstandard(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          >
            <option value="unsaniert">Unsaniert</option>
            <option value="teilsaniert">Teilsaniert</option>
            <option value="vollsaniert">Vollsaniert / Neubau</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          >
            {Object.entries(regionen).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label} ({val.beschreibung})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ergebnis */}
      <div className="rounded-lg border-2 border-primary-600 bg-primary-50 p-6">
        <h3 className="mb-4 text-lg font-bold text-gray-900">Heizlastberechnung</h3>

        <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Heizlast gesamt
            </p>
            <p className="mt-1 text-3xl font-bold text-primary-700">
              {formatNum(heizlastGesamt)} kW
            </p>
            <p className="text-xs text-gray-500">
              ({formatNum(heizlastGesamt * 1000, 0)} Watt)
            </p>
          </div>

          <div className="rounded-lg bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Spez. Heizlast
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {formatNum(heizlastProQm, 0)} W/m²
            </p>
            <p className="text-xs text-gray-500">inkl. Korrekturfaktoren</p>
          </div>

          <div className="rounded-lg bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Empf. Vorlauftemperatur
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{vorlaufTemp}</p>
            <p className="text-xs text-gray-500">
              Norm-Außentemp.: {regionDaten.normTemp}°C
            </p>
          </div>

          <div className="rounded-lg bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Heizkörper (ca. {anzahlRaeume} Räume)
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {formatNum(leistungProRaum, 0)} W
            </p>
            <p className="text-xs text-gray-500">pro Raum (Richtwert)</p>
          </div>
        </div>

        {/* Wärmepumpen-Eignung */}
        <div
          className={`rounded-lg p-4 shadow-sm ${
            wpGeeignet ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                wpGeeignet ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {wpGeeignet ? "\u2713" : "\u2717"}
            </div>
            <div>
              <h4
                className={`text-sm font-semibold ${
                  wpGeeignet ? "text-green-800" : "text-red-800"
                }`}
              >
                Wärmepumpe: {wpGeeignet ? "Geeignet" : "Bedingt geeignet"}
              </h4>
              <p
                className={`mt-1 text-sm ${
                  wpGeeignet ? "text-green-700" : "text-red-700"
                }`}
              >
                {wpHinweis}
              </p>
            </div>
          </div>
        </div>

        {/* Berechnungsdetails */}
        <details className="mt-4 rounded-lg bg-white p-4 shadow-sm">
          <summary className="cursor-pointer text-sm font-semibold text-gray-800">
            Berechnungsgrundlagen anzeigen
          </summary>
          <div className="mt-3 space-y-2 text-sm text-gray-700">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="flex justify-between border-b border-gray-100 py-1">
                <span>Basis-Heizlast ({baujahreLabels[baujahr]}, {daemmstandard})</span>
                <span className="font-medium">{spezHeizlast} W/m²</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 py-1">
                <span>Gebäudetyp-Faktor ({gebaeudetypFaktoren[gebaeudetyp].label})</span>
                <span className="font-medium">{formatNum(typFaktor, 2)}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 py-1">
                <span>Regionaler Korrekturfaktor ({regionDaten.normTemp}°C)</span>
                <span className="font-medium">{formatNum(tempKorrektur, 2)}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 py-1">
                <span>Wohnfläche</span>
                <span className="font-medium">{wohnflaeche} m²</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Formel: Heizlast = Wohnfläche × Basis-Heizlast × Gebäudetyp-Faktor × Regionaler Korrekturfaktor
            </p>
          </div>
        </details>
      </div>

      <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
        <strong>Hinweis:</strong> Diese Berechnung ist eine vereinfachte Abschätzung nach DIN EN
        12831. Für die genaue Dimensionierung einer Heizungsanlage ist eine raumweise
        Heizlastberechnung durch einen Fachbetrieb oder Energieberater erforderlich. Faktoren wie
        Raumhöhe, Fensterflächen, Wärmebrücken und Lüftungsverluste werden hier vereinfacht
        berücksichtigt.
      </div>
    </div>
  );
}
