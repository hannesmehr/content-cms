"use client";

import { useState, useMemo } from "react";

type Fahrzeug = {
  name: string;
  akkuKwh: number;
  verbrauchSolo: number; // kWh/100km WLTP
  anhaengelast: number; // kg
};

const fahrzeuge: Fahrzeug[] = [
  // Tesla
  { name: "Tesla Model Y Long Range (Juniper)", akkuKwh: 75, verbrauchSolo: 14.8, anhaengelast: 1600 },
  { name: "Tesla Model X", akkuKwh: 100, verbrauchSolo: 18.5, anhaengelast: 2250 },
  { name: "Tesla Model 3 Long Range", akkuKwh: 75, verbrauchSolo: 14.9, anhaengelast: 1000 },
  // BMW
  { name: "BMW iX xDrive50", akkuKwh: 105.2, verbrauchSolo: 19.8, anhaengelast: 2500 },
  { name: "BMW iX3 Neue Klasse (xDrive50)", akkuKwh: 109, verbrauchSolo: 16.5, anhaengelast: 2000 },
  // Mercedes
  { name: "Mercedes EQA 250+", akkuKwh: 70.5, verbrauchSolo: 14.5, anhaengelast: 750 },
  { name: "Mercedes EQB 350 4MATIC", akkuKwh: 70.5, verbrauchSolo: 17.0, anhaengelast: 1700 },
  { name: "Mercedes EQE SUV", akkuKwh: 90.6, verbrauchSolo: 20.1, anhaengelast: 1800 },
  { name: "Mercedes EQS SUV", akkuKwh: 108.4, verbrauchSolo: 20.6, anhaengelast: 1800 },
  { name: "Mercedes CLA 250+ EQ", akkuKwh: 85, verbrauchSolo: 12.5, anhaengelast: 1500 },
  { name: "Mercedes CLA 350 4MATIC EQ", akkuKwh: 85, verbrauchSolo: 14.0, anhaengelast: 1800 },
  // Audi (kWh = nutzbar)
  { name: "Audi A6 e-tron", akkuKwh: 76, verbrauchSolo: 15.0, anhaengelast: 2100 },
  { name: "Audi A6 e-tron Performance", akkuKwh: 95, verbrauchSolo: 14.9, anhaengelast: 2100 },
  { name: "Audi Q6 e-tron", akkuKwh: 76, verbrauchSolo: 17.0, anhaengelast: 2000 },
  { name: "Audi Q6 e-tron Performance", akkuKwh: 95, verbrauchSolo: 17.0, anhaengelast: 2400 },
  { name: "Audi Q8 e-tron 55", akkuKwh: 95, verbrauchSolo: 20.6, anhaengelast: 2400 },
  { name: "Audi Q4 e-tron", akkuKwh: 77, verbrauchSolo: 17.0, anhaengelast: 1200 },
  // VW / Skoda
  { name: "VW ID.4 / ID.5 (77 kWh)", akkuKwh: 77, verbrauchSolo: 16.3, anhaengelast: 1200 },
  { name: "VW ID.7 Pro S", akkuKwh: 86, verbrauchSolo: 15.5, anhaengelast: 1400 },
  { name: "Skoda Enyaq iV 80", akkuKwh: 77, verbrauchSolo: 16.3, anhaengelast: 1200 },
  // Hyundai / Kia
  { name: "Hyundai Ioniq 5 Long Range (Facelift)", akkuKwh: 84, verbrauchSolo: 16.7, anhaengelast: 1600 },
  { name: "Hyundai Ioniq 6 Long Range", akkuKwh: 77.4, verbrauchSolo: 14.3, anhaengelast: 1500 },
  { name: "Kia EV6 Long Range", akkuKwh: 77.4, verbrauchSolo: 16.6, anhaengelast: 1600 },
  { name: "Kia EV9", akkuKwh: 99.8, verbrauchSolo: 20.2, anhaengelast: 2500 },
  // Volvo / Polestar
  { name: "Volvo EX90", akkuKwh: 107, verbrauchSolo: 19.5, anhaengelast: 2200 },
  { name: "Polestar 2 Long Range", akkuKwh: 79, verbrauchSolo: 16.7, anhaengelast: 1500 },
  { name: "Polestar 3 Long Range Dual Motor", akkuKwh: 107, verbrauchSolo: 20.0, anhaengelast: 2200 },
  // Sonstige
  { name: "Ford Mustang Mach-E ER AWD", akkuKwh: 91, verbrauchSolo: 18.7, anhaengelast: 750 },
  { name: "BYD Seal U", akkuKwh: 71.8, verbrauchSolo: 20.0, anhaengelast: 1300 },
  { name: "Porsche Taycan 4S", akkuKwh: 93.4, verbrauchSolo: 20.4, anhaengelast: 2200 },
  { name: "Porsche Macan Electric 4", akkuKwh: 95, verbrauchSolo: 18.0, anhaengelast: 2000 },
].sort((a, b) => a.name.localeCompare(b.name));

const jahreszeitFaktor: Record<string, { label: string; faktor: number }> = {
  sommer: { label: "Sommer (20–25 °C)", faktor: 1.0 },
  fruehling: { label: "Frühling / Herbst (10–15 °C)", faktor: 1.1 },
  winter: { label: "Winter (0–5 °C)", faktor: 1.3 },
  kaelte: { label: "Starke Kälte (unter 0 °C)", faktor: 1.5 },
};

const streckenProfile: Record<string, { label: string; faktor: number }> = {
  autobahn: { label: "Überwiegend Autobahn (120 km/h)", faktor: 1.35 },
  gemischt: { label: "Gemischt (Autobahn + Landstraße)", faktor: 1.2 },
  landstrasse: { label: "Überwiegend Landstraße (80 km/h)", faktor: 1.0 },
};

function formatNumber(n: number, decimals = 0): string {
  return n.toLocaleString("de-DE", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function EAutoReichweitenRechner() {
  const [modus, setModus] = useState<"auswahl" | "manuell">("auswahl");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [manuellAkku, setManuellAkku] = useState(77);
  const [manuellVerbrauch, setManuellVerbrauch] = useState(17);
  const [manuellAnhaengelast, setManuellAnhaengelast] = useState(1600);
  const [wohnwagenGewicht, setWohnwagenGewicht] = useState(1200);
  const [jahreszeit, setJahreszeit] = useState("sommer");
  const [strecke, setStrecke] = useState("gemischt");
  const [klimaAn, setKlimaAn] = useState(false);
  const [ladeSoc, setLadeSoc] = useState(80);

  const fahrzeug = fahrzeuge[selectedIndex];
  const akkuKwh = modus === "auswahl" ? fahrzeug.akkuKwh : manuellAkku;
  const verbrauchSolo = modus === "auswahl" ? fahrzeug.verbrauchSolo : manuellVerbrauch;
  const anhaengelast = modus === "auswahl" ? fahrzeug.anhaengelast : manuellAnhaengelast;

  const result = useMemo(() => {
    // Nutzbare Kapazität (SoC 100% → ladeSoc-Grenze, abzüglich ~10% Puffer unten)
    const nutzbareKwh = akkuKwh * ((ladeSoc - 10) / 100);

    // Anhänger-Mehrverbrauch: ca. 40-70% je nach Gewicht und Aerodynamik
    // Basis: +50% bei 1000kg, linear skaliert
    const gewichtsFaktor = 1 + (wohnwagenGewicht / 1000) * 0.5;
    const aeroDrag = 0.15; // zusätzlich 15% für die Stirnfläche
    const anhaengerMehrverbrauch = gewichtsFaktor + aeroDrag - 1;

    const verbrauchMitAnhaenger = verbrauchSolo * (1 + anhaengerMehrverbrauch);

    // Jahreszeit
    const jzFaktor = jahreszeitFaktor[jahreszeit]?.faktor || 1.0;

    // Streckenprofil
    const strFaktor = streckenProfile[strecke]?.faktor || 1.2;

    // Klima/Heizung
    const klimaFaktor = klimaAn ? 1.08 : 1.0;

    // Gesamtverbrauch
    const gesamtVerbrauch = verbrauchMitAnhaenger * jzFaktor * strFaktor * klimaFaktor;

    // Reichweite solo
    const reichweiteSolo = (nutzbareKwh / (verbrauchSolo * jzFaktor * strFaktor * klimaFaktor)) * 100;

    // Reichweite mit Gespann
    const reichweiteGespann = (nutzbareKwh / gesamtVerbrauch) * 100;

    // Gewichtswarnung
    const uebergewicht = wohnwagenGewicht > anhaengelast;

    return {
      nutzbareKwh,
      verbrauchSolo,
      verbrauchGespann: gesamtVerbrauch,
      reichweiteSolo,
      reichweiteGespann,
      uebergewicht,
      reduktion: ((1 - reichweiteGespann / reichweiteSolo) * 100),
      ladestopps100km: Math.max(0, Math.ceil(100 / reichweiteGespann) - 1),
      ladestopps300km: Math.max(0, Math.ceil(300 / reichweiteGespann) - 1),
      ladestopps500km: Math.max(0, Math.ceil(500 / reichweiteGespann) - 1),
    };
  }, [akkuKwh, verbrauchSolo, wohnwagenGewicht, jahreszeit, strecke, klimaAn, ladeSoc, anhaengelast]);

  const inputClass = "w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="space-y-6">
      {/* Eingabemodus */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setModus("auswahl")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            modus === "auswahl"
              ? "bg-primary-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Fahrzeug wählen
        </button>
        <button
          type="button"
          onClick={() => setModus("manuell")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            modus === "manuell"
              ? "bg-primary-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Werte manuell eingeben
        </button>
      </div>

      {/* Fahrzeug */}
      {modus === "auswahl" ? (
        <div>
          <label className={labelClass}>E-Auto</label>
          <select
            value={selectedIndex}
            onChange={(e) => setSelectedIndex(Number(e.target.value))}
            className={inputClass}
          >
            {fahrzeuge.map((f, i) => (
              <option key={f.name} value={i}>
                {f.name} ({f.akkuKwh} kWh, max. {formatNumber(f.anhaengelast)} kg)
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            WLTP-Verbrauch: {formatNumber(fahrzeug.verbrauchSolo, 1)} kWh/100 km · Akku: {formatNumber(fahrzeug.akkuKwh, 1)} kWh · Anhängelast: {formatNumber(fahrzeug.anhaengelast)} kg
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass}>Akkukapazität (kWh)</label>
            <input
              type="number"
              value={manuellAkku}
              onChange={(e) => setManuellAkku(Number(e.target.value))}
              min={20}
              max={200}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Verbrauch solo (kWh/100km)</label>
            <input
              type="number"
              value={manuellVerbrauch}
              onChange={(e) => setManuellVerbrauch(Number(e.target.value))}
              min={10}
              max={40}
              step={0.1}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Max. Anhängelast (kg)</label>
            <input
              type="number"
              value={manuellAnhaengelast}
              onChange={(e) => setManuellAnhaengelast(Number(e.target.value))}
              min={0}
              max={5000}
              className={inputClass}
            />
          </div>
        </div>
      )}

      {/* Wohnwagen */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Gewicht Wohnwagen beladen (kg)</label>
          <input
            type="number"
            value={wohnwagenGewicht}
            onChange={(e) => setWohnwagenGewicht(Number(e.target.value))}
            min={500}
            max={3500}
            step={50}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Laden bis SoC (%)</label>
          <select
            value={ladeSoc}
            onChange={(e) => setLadeSoc(Number(e.target.value))}
            className={inputClass}
          >
            <option value={100}>100 % (Volladung)</option>
            <option value={90}>90 % (empfohlen für Langstrecke)</option>
            <option value={80}>80 % (schnellstes Laden)</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Laden bis 80 % ist am schnellsten, darüber wird es deutlich langsamer.
          </p>
        </div>
      </div>

      {/* Bedingungen */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Jahreszeit / Temperatur</label>
          <select
            value={jahreszeit}
            onChange={(e) => setJahreszeit(e.target.value)}
            className={inputClass}
          >
            {Object.entries(jahreszeitFaktor).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Streckenprofil</label>
          <select
            value={strecke}
            onChange={(e) => setStrecke(e.target.value)}
            className={inputClass}
          >
            {Object.entries(streckenProfile).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={klimaAn}
            onChange={(e) => setKlimaAn(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
          />
          <span className="text-sm text-gray-700">Klimaanlage / Heizung während der Fahrt aktiv</span>
        </label>
      </div>

      {/* Warnung bei Übergewicht */}
      {result.uebergewicht && (
        <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <div>
              <p className="font-semibold text-red-800">Anhängelast überschritten!</p>
              <p className="text-sm text-red-700 mt-1">
                Dein Wohnwagen wiegt {formatNumber(wohnwagenGewicht)} kg, aber die maximale Anhängelast beträgt nur {formatNumber(anhaengelast)} kg.
                Diese Kombination ist nicht zulässig.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Ergebnis */}
      <div className="rounded-lg border-2 border-primary-600 bg-primary-50 p-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Geschätzte Reichweite</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-white p-4 border border-gray-200">
            <p className="text-sm text-gray-500">Solo (ohne Anhänger)</p>
            <p className="text-2xl font-bold text-gray-700">{formatNumber(result.reichweiteSolo)} km</p>
            <p className="text-xs text-gray-400 mt-1">{formatNumber(result.verbrauchSolo, 1)} kWh/100 km</p>
          </div>
          <div className="rounded-lg bg-white p-4 border-2 border-primary-600">
            <p className="text-sm text-gray-500">Mit Wohnwagen</p>
            <p className="text-2xl font-bold text-primary-700">{formatNumber(result.reichweiteGespann)} km</p>
            <p className="text-xs text-gray-400 mt-1">{formatNumber(result.verbrauchGespann, 1)} kWh/100 km</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Reichweiten-Reduktion durch Anhänger:</span>
          <span className={`font-semibold ${result.reduktion > 50 ? "text-red-600" : result.reduktion > 40 ? "text-amber-600" : "text-green-600"}`}>
            −{formatNumber(result.reduktion)}%
          </span>
        </div>

        {/* Visueller Vergleich */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-20 shrink-0">Solo</span>
            <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gray-400 rounded-full" style={{ width: "100%" }} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-20 shrink-0">Gespann</span>
            <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-600 rounded-full transition-all"
                style={{ width: `${Math.min(100, (result.reichweiteGespann / result.reichweiteSolo) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Ladestopps */}
        <div className="border-t border-primary-100 pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Geschätzte Ladestopps</h4>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-white p-3 border border-gray-200">
              <p className="text-lg font-bold text-gray-900">{result.ladestopps100km}</p>
              <p className="text-xs text-gray-500">bei 100 km</p>
            </div>
            <div className="rounded-lg bg-white p-3 border border-gray-200">
              <p className="text-lg font-bold text-gray-900">{result.ladestopps300km}</p>
              <p className="text-xs text-gray-500">bei 300 km</p>
            </div>
            <div className="rounded-lg bg-white p-3 border border-gray-200">
              <p className="text-lg font-bold text-gray-900">{result.ladestopps500km}</p>
              <p className="text-xs text-gray-500">bei 500 km</p>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="rounded-lg bg-gray-100 p-4 text-xs text-gray-500 space-y-2">
        <p className="font-semibold text-gray-700">Hinweis: Nur Richtwerte!</p>
        <p>
          Die berechnete Reichweite ist eine <strong>grobe Schätzung</strong> und kann in der Praxis
          erheblich abweichen. Der tatsächliche Verbrauch hängt von vielen Faktoren ab:
          Fahrweise, Topografie, Wind, exakte Beladung, Aerodynamik des Wohnwagens,
          Reifendruck, Batteriezustand und Alter des Fahrzeugs.
        </p>
        <p>
          Erfahrungsgemäß liegt der Mehrverbrauch mit Wohnwagen-Anhänger bei <strong>50–80 %</strong> gegenüber
          der Solo-Fahrt. Bei ungünstigen Bedingungen (Gegenwind, Steigungen, Kälte) kann er noch höher ausfallen.
          Plane immer einen Sicherheitspuffer ein und informiere dich vorab über Ladestationen entlang deiner Route.
        </p>
        <p>
          Die WLTP-Verbrauchswerte der Fahrzeuge dienen als Berechnungsbasis. Der reale Solo-Verbrauch
          liegt in der Regel 10–20 % darüber. Die Fahrzeugdaten wurden sorgfältig zusammengestellt,
          können aber von der tatsächlichen Konfiguration abweichen.
        </p>
      </div>
    </div>
  );
}
