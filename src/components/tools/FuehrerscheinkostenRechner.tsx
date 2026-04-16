"use client";

import { useState } from "react";

type FuehrerscheinKlasse = "B" | "A" | "A2" | "AM" | "BE";

type BundeslandKey =
  | "BW" | "BY" | "BE" | "BB" | "HB" | "HH" | "HE" | "MV"
  | "NI" | "NW" | "RP" | "SL" | "SN" | "ST" | "SH" | "TH";

interface BundeslandPreise {
  name: string;
  grundgebuehr: number;
  fahrstundeNormal: number;
  fahrstundeSonder: number;
}

const bundeslaender: Record<BundeslandKey, BundeslandPreise> = {
  BW: { name: "Baden-Württemberg", grundgebuehr: 350, fahrstundeNormal: 65, fahrstundeSonder: 75 },
  BY: { name: "Bayern", grundgebuehr: 370, fahrstundeNormal: 68, fahrstundeSonder: 78 },
  BE: { name: "Berlin", grundgebuehr: 300, fahrstundeNormal: 58, fahrstundeSonder: 68 },
  BB: { name: "Brandenburg", grundgebuehr: 250, fahrstundeNormal: 50, fahrstundeSonder: 60 },
  HB: { name: "Bremen", grundgebuehr: 280, fahrstundeNormal: 55, fahrstundeSonder: 65 },
  HH: { name: "Hamburg", grundgebuehr: 340, fahrstundeNormal: 63, fahrstundeSonder: 73 },
  HE: { name: "Hessen", grundgebuehr: 320, fahrstundeNormal: 60, fahrstundeSonder: 70 },
  MV: { name: "Mecklenburg-Vorpommern", grundgebuehr: 230, fahrstundeNormal: 48, fahrstundeSonder: 58 },
  NI: { name: "Niedersachsen", grundgebuehr: 290, fahrstundeNormal: 56, fahrstundeSonder: 66 },
  NW: { name: "Nordrhein-Westfalen", grundgebuehr: 310, fahrstundeNormal: 58, fahrstundeSonder: 68 },
  RP: { name: "Rheinland-Pfalz", grundgebuehr: 280, fahrstundeNormal: 55, fahrstundeSonder: 65 },
  SL: { name: "Saarland", grundgebuehr: 270, fahrstundeNormal: 54, fahrstundeSonder: 64 },
  SN: { name: "Sachsen", grundgebuehr: 220, fahrstundeNormal: 46, fahrstundeSonder: 56 },
  ST: { name: "Sachsen-Anhalt", grundgebuehr: 220, fahrstundeNormal: 45, fahrstundeSonder: 55 },
  SH: { name: "Schleswig-Holstein", grundgebuehr: 300, fahrstundeNormal: 57, fahrstundeSonder: 67 },
  TH: { name: "Thüringen", grundgebuehr: 230, fahrstundeNormal: 47, fahrstundeSonder: 57 },
};

const klassenDefaults: Record<FuehrerscheinKlasse, {
  label: string;
  normalStunden: number;
  autobahn: number;
  ueberland: number;
  nacht: number;
  pruefungPraxis: number;
}> = {
  B: { label: "B (PKW)", normalStunden: 30, autobahn: 4, ueberland: 5, nacht: 3, pruefungPraxis: 129.83 },
  A: { label: "A (Motorrad)", normalStunden: 25, autobahn: 4, ueberland: 5, nacht: 3, pruefungPraxis: 162.67 },
  A2: { label: "A2 (Leichtkraftrad)", normalStunden: 20, autobahn: 4, ueberland: 5, nacht: 3, pruefungPraxis: 162.67 },
  AM: { label: "AM (Moped/Roller)", normalStunden: 15, autobahn: 0, ueberland: 0, nacht: 0, pruefungPraxis: 101.99 },
  BE: { label: "BE (PKW mit Anhänger)", normalStunden: 10, autobahn: 1, ueberland: 3, nacht: 1, pruefungPraxis: 129.83 },
};

export function FuehrerscheinkostenRechner() {
  const [klasse, setKlasse] = useState<FuehrerscheinKlasse>("B");
  const [bundesland, setBundesland] = useState<BundeslandKey>("NW");
  const [normalStunden, setNormalStunden] = useState(klassenDefaults.B.normalStunden);
  const [autobahn, setAutobahn] = useState(klassenDefaults.B.autobahn);
  const [ueberland, setUeberland] = useState(klassenDefaults.B.ueberland);
  const [nacht, setNacht] = useState(klassenDefaults.B.nacht);

  function handleKlasseChange(k: FuehrerscheinKlasse) {
    setKlasse(k);
    const d = klassenDefaults[k];
    setNormalStunden(d.normalStunden);
    setAutobahn(d.autobahn);
    setUeberland(d.ueberland);
    setNacht(d.nacht);
  }

  const preise = bundeslaender[bundesland];
  const kd = klassenDefaults[klasse];

  const kostenGrundgebuehr = preise.grundgebuehr;
  const kostenNormal = normalStunden * preise.fahrstundeNormal;
  const sonderStunden = autobahn + ueberland + nacht;
  const kostenSonder = sonderStunden * preise.fahrstundeSonder;
  const kostenTheoriePruefung = 24.99;
  const kostenPraxisPruefung = kd.pruefungPraxis;
  const kostenSehtest = 6.43;
  const kostenErsteHilfe = 50;
  const kostenPassbilder = 15;

  const posten = [
    { label: "Grundgebühr Fahrschule", betrag: kostenGrundgebuehr },
    { label: `${normalStunden} Übungsfahrstunden × ${formatEur(preise.fahrstundeNormal)} €`, betrag: kostenNormal },
    { label: `${sonderStunden} Sonderfahrten × ${formatEur(preise.fahrstundeSonder)} €`, betrag: kostenSonder },
    { label: "Theorieprüfung (TÜV/DEKRA)", betrag: kostenTheoriePruefung },
    { label: "Praktische Prüfung (TÜV/DEKRA)", betrag: kostenPraxisPruefung },
    { label: "Sehtest", betrag: kostenSehtest },
    { label: "Erste-Hilfe-Kurs (9 UE)", betrag: kostenErsteHilfe },
    { label: "Passbilder (biometrisch)", betrag: kostenPassbilder },
  ];

  const gesamt = posten.reduce((sum, p) => sum + p.betrag, 0);

  function formatEur(val: number) {
    return val.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Führerscheinklasse
          </label>
          <select
            value={klasse}
            onChange={(e) => handleKlasseChange(e.target.value as FuehrerscheinKlasse)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          >
            {(Object.keys(klassenDefaults) as FuehrerscheinKlasse[]).map((k) => (
              <option key={k} value={k}>{klassenDefaults[k].label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bundesland
          </label>
          <select
            value={bundesland}
            onChange={(e) => setBundesland(e.target.value as BundeslandKey)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          >
            {(Object.keys(bundeslaender) as BundeslandKey[]).map((k) => (
              <option key={k} value={k}>{bundeslaender[k].name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Übungsfahrstunden
          </label>
          <input
            type="number"
            min={0}
            max={100}
            value={normalStunden}
            onChange={(e) => setNormalStunden(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
          <p className="mt-1 text-xs text-gray-500">à {formatEur(preise.fahrstundeNormal)} €</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Autobahnfahrten
          </label>
          <input
            type="number"
            min={0}
            max={20}
            value={autobahn}
            onChange={(e) => setAutobahn(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
          <p className="mt-1 text-xs text-gray-500">Pflichtstunden: {kd.autobahn}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Überlandfahrten
          </label>
          <input
            type="number"
            min={0}
            max={20}
            value={ueberland}
            onChange={(e) => setUeberland(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
          <p className="mt-1 text-xs text-gray-500">Pflichtstunden: {kd.ueberland}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nachtfahrten
          </label>
          <input
            type="number"
            min={0}
            max={20}
            value={nacht}
            onChange={(e) => setNacht(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
          <p className="mt-1 text-xs text-gray-500">Pflichtstunden: {kd.nacht}</p>
        </div>
      </div>

      <div className="rounded-lg border-2 border-primary-600 bg-primary-50 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Kostenaufstellung</h3>

        <table className="w-full text-sm">
          <tbody>
            {posten.map((p) => (
              <tr key={p.label} className="border-b border-gray-200">
                <td className="py-2 pr-4 text-gray-700">{p.label}</td>
                <td className="py-2 text-right font-medium text-gray-900">
                  {formatEur(p.betrag)} €
                </td>
              </tr>
            ))}
            <tr className="font-bold text-primary-700">
              <td className="py-3 pr-4 text-base">Geschätzte Gesamtkosten</td>
              <td className="py-3 text-right text-base">{formatEur(gesamt)} €</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-white p-4 shadow-sm text-center">
            <p className="text-sm text-gray-500">Gesamtkosten</p>
            <p className="text-2xl font-bold text-primary-700">{formatEur(gesamt)} €</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm text-center">
            <p className="text-sm text-gray-500">Davon Fahrschule</p>
            <p className="text-2xl font-bold text-primary-700">
              {formatEur(kostenGrundgebuehr + kostenNormal + kostenSonder)} €
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
        <p className="font-medium text-gray-700 mb-1">Hinweis</p>
        <p>
          Die angezeigten Preise sind Durchschnittswerte für {preise.name} und können
          je nach Fahrschule deutlich abweichen. Hole dir immer mehrere Angebote ein.
          Bei nicht bestandenen Prüfungen fallen zusätzliche Kosten für Nachprüfungen und
          weitere Fahrstunden an.
        </p>
      </div>
    </div>
  );
}
