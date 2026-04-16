"use client";

import { useState } from "react";

interface KostenPosten {
  label: string;
  betrag: number;
  color: string;
}

export function JahresKostenRechner() {
  const [gewicht, setGewicht] = useState<number>(1200);
  const [steuerManuell, setSteuerManuell] = useState<boolean>(false);
  const [steuerOverride, setSteuerOverride] = useState<number>(0);
  const [versicherung, setVersicherung] = useState<number>(150);
  const [stellplatz, setStellplatz] = useState<number>(75);
  const [tuev, setTuev] = useState<number>(120);
  const [gaspruefung, setGaspruefung] = useState<number>(50);
  const [wartung, setWartung] = useState<number>(350);
  const [gasAnzahl, setGasAnzahl] = useState<number>(4);
  const [gasPreis, setGasPreis] = useState<number>(20);
  const [adac, setAdac] = useState<number>(0);
  const [kaufpreis, setKaufpreis] = useState<number>(15000);
  const [wertverlustRate, setWertverlustRate] = useState<number>(5);
  const [reisetage, setReisetage] = useState<number>(30);

  const steuerBerechnet = Math.min(Math.ceil(gewicht / 200) * 7.46, 373.24);
  const steuer = steuerManuell ? steuerOverride : steuerBerechnet;
  const stellplatzJahr = stellplatz * 12;
  const tuevJahr = tuev / 2;
  const gaspruefungJahr = gaspruefung / 2;
  const gasKosten = gasAnzahl * gasPreis;
  const wertverlust = kaufpreis * (wertverlustRate / 100);

  const posten: KostenPosten[] = [
    { label: "Kfz-Steuer", betrag: steuer, color: "#d97706" },
    { label: "Versicherung", betrag: versicherung, color: "#f59e0b" },
    { label: "Stellplatz", betrag: stellplatzJahr, color: "#fbbf24" },
    { label: "TÜV / HU (anteilig)", betrag: tuevJahr, color: "#92400e" },
    { label: "Gasprüfung G607 (anteilig)", betrag: gaspruefungJahr, color: "#b45309" },
    { label: "Wartung & Reparaturen", betrag: wartung, color: "#78350f" },
    { label: "Gasfüllungen", betrag: gasKosten, color: "#ca8a04" },
    { label: "ADAC / Pannenhilfe", betrag: adac, color: "#a16207" },
    { label: "Wertverlust", betrag: wertverlust, color: "#854d0e" },
  ];

  const gesamt = posten.reduce((sum, p) => sum + p.betrag, 0);
  const monatlich = gesamt / 12;
  const proTag = reisetage > 0 ? gesamt / reisetage : 0;

  const formatEur = (val: number) =>
    val.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Simple CSS pie chart using conic gradient
  const pieSegments = posten.filter((p) => p.betrag > 0);
  let cumPercent = 0;
  const conicStops = pieSegments
    .map((p) => {
      const percent = gesamt > 0 ? (p.betrag / gesamt) * 100 : 0;
      const start = cumPercent;
      cumPercent += percent;
      return `${p.color} ${start}% ${cumPercent}%`;
    })
    .join(", ");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Zul. Gesamtgewicht (kg)
          </label>
          <input
            type="number"
            min={1}
            value={gewicht}
            onChange={(e) => setGewicht(Math.max(1, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs text-gray-500">
              Steuer: {formatEur(steuerBerechnet)} €/Jahr
            </span>
            <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
              <input
                type="checkbox"
                checked={steuerManuell}
                onChange={(e) => setSteuerManuell(e.target.checked)}
                className="h-3 w-3 rounded border-gray-300 text-primary-600"
              />
              manuell
            </label>
          </div>
          {steuerManuell && (
            <input
              type="number"
              min={0}
              step={1}
              value={steuerOverride}
              onChange={(e) => setSteuerOverride(Math.max(0, Number(e.target.value)))}
              placeholder="Steuer manuell (€)"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Versicherung (€/Jahr)
          </label>
          <input
            type="number"
            min={0}
            step={10}
            value={versicherung}
            onChange={(e) => setVersicherung(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stellplatz (€/Monat)
          </label>
          <input
            type="number"
            min={0}
            step={5}
            value={stellplatz}
            onChange={(e) => setStellplatz(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            TÜV / HU alle 2 Jahre (€)
          </label>
          <input
            type="number"
            min={0}
            step={10}
            value={tuev}
            onChange={(e) => setTuev(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gasprüfung G607 alle 2 Jahre (€)
          </label>
          <input
            type="number"
            min={0}
            step={5}
            value={gaspruefung}
            onChange={(e) => setGaspruefung(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Wartung & Reparaturen (€/Jahr)
          </label>
          <input
            type="number"
            min={0}
            step={50}
            value={wartung}
            onChange={(e) => setWartung(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gasfüllungen pro Jahr
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              value={gasAnzahl}
              onChange={(e) => setGasAnzahl(Math.max(0, Number(e.target.value)))}
              className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
              placeholder="Anz."
            />
            <span className="flex items-center text-sm text-gray-500">×</span>
            <input
              type="number"
              min={0}
              step={1}
              value={gasPreis}
              onChange={(e) => setGasPreis(Math.max(0, Number(e.target.value)))}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
              placeholder="€ / Füllung"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ADAC / Pannenhilfe (€/Jahr)
          </label>
          <input
            type="number"
            min={0}
            step={10}
            value={adac}
            onChange={(e) => setAdac(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Wertverlust
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              step={1000}
              value={kaufpreis}
              onChange={(e) => setKaufpreis(Math.max(0, Number(e.target.value)))}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
              placeholder="Kaufpreis €"
            />
            <input
              type="number"
              min={0}
              max={50}
              step={0.5}
              value={wertverlustRate}
              onChange={(e) =>
                setWertverlustRate(Math.max(0, Math.min(50, Number(e.target.value))))
              }
              className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
              placeholder="%"
            />
            <span className="flex items-center text-sm text-gray-500">%/Jahr</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Geplante Reisetage pro Jahr
        </label>
        <input
          type="number"
          min={1}
          max={365}
          value={reisetage}
          onChange={(e) => setReisetage(Math.max(1, Number(e.target.value)))}
          className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
        />
      </div>

      <div className="rounded-lg border-2 border-primary-600 bg-primary-50 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Jährliche Kostenübersicht</h3>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <table className="w-full text-sm">
              <tbody>
                {posten.map((p) => (
                  <tr key={p.label} className="border-b border-gray-200">
                    <td className="py-2 pr-4 text-gray-700">
                      <span
                        className="inline-block w-3 h-3 rounded-sm mr-2 align-middle"
                        style={{ backgroundColor: p.color }}
                      />
                      {p.label}
                    </td>
                    <td className="py-2 text-right font-medium text-gray-900">
                      {formatEur(p.betrag)} €
                    </td>
                  </tr>
                ))}
                <tr className="font-bold text-primary-700">
                  <td className="py-3 pr-4 text-base">Gesamtkosten / Jahr</td>
                  <td className="py-3 text-right text-base">{formatEur(gesamt)} €</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-center justify-center gap-4">
            {gesamt > 0 && (
              <div
                className="w-48 h-48 rounded-full"
                style={{
                  background: `conic-gradient(${conicStops})`,
                }}
              />
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-4 shadow-sm text-center">
            <p className="text-sm text-gray-500">Monatliche Kosten</p>
            <p className="text-xl font-bold text-primary-700">{formatEur(monatlich)} €</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm text-center">
            <p className="text-sm text-gray-500">Jährliche Kosten</p>
            <p className="text-xl font-bold text-primary-700">{formatEur(gesamt)} €</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm text-center">
            <p className="text-sm text-gray-500">
              Kosten pro Urlaubstag ({reisetage} Tage)
            </p>
            <p className="text-xl font-bold text-primary-700">{formatEur(proTag)} €</p>
          </div>
        </div>
      </div>
    </div>
  );
}
