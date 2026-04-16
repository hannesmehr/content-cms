"use client";

import { useState } from "react";

const MONATE = [
  { value: 3, label: "März" },
  { value: 4, label: "April" },
  { value: 5, label: "Mai" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Dezember" },
];

export function SaisonkennzeichenRechner() {
  const [gewicht, setGewicht] = useState<number>(1200);
  const [saisonStart, setSaisonStart] = useState<number>(4);
  const [saisonEnde, setSaisonEnde] = useState<number>(10);
  const [versicherungGanzjahr, setVersicherungGanzjahr] = useState<number>(150);
  const [stellplatzkosten, setStellplatzkosten] = useState<number>(0);

  const saisonMonate = saisonEnde - saisonStart + 1;
  const ruheMonate = 12 - saisonMonate;

  const steuerGanzjahr = Math.min(Math.ceil(gewicht / 200) * 7.46, 373.24);
  const steuerSaison = steuerGanzjahr * (saisonMonate / 12);
  const steuerErsparnis = steuerGanzjahr - steuerSaison;

  const versicherungSaison = versicherungGanzjahr * (saisonMonate / 12);
  const versicherungErsparnis = versicherungGanzjahr - versicherungSaison;

  const stellplatzGesamt = stellplatzkosten * ruheMonate;

  const nettoErsparnis = steuerErsparnis + versicherungErsparnis - stellplatzGesamt;

  const formatEur = (val: number) =>
    val.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gesamtgewicht Wohnwagen (kg)
          </label>
          <input
            type="number"
            min={1}
            max={20000}
            value={gewicht}
            onChange={(e) => setGewicht(Math.max(1, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jährliche Versicherungsprämie Ganzjahr (€)
          </label>
          <input
            type="number"
            min={0}
            step={10}
            value={versicherungGanzjahr}
            onChange={(e) => setVersicherungGanzjahr(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Saisonbeginn
          </label>
          <select
            value={saisonStart}
            onChange={(e) => {
              const val = Number(e.target.value);
              setSaisonStart(val);
              if (val >= saisonEnde) setSaisonEnde(val + 1);
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          >
            {MONATE.filter((m) => m.value < 12).map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Saisonende
          </label>
          <select
            value={saisonEnde}
            onChange={(e) => setSaisonEnde(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          >
            {MONATE.filter((m) => m.value > saisonStart).map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monatliche Stellplatzkosten in Ruhemonaten (€)
          </label>
          <input
            type="number"
            min={0}
            step={5}
            value={stellplatzkosten}
            onChange={(e) => setStellplatzkosten(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
          <p className="mt-1 text-xs text-gray-500">
            Kosten für Unterstellplatz, wenn der Wohnwagen nicht zugelassen ist
          </p>
        </div>
      </div>

      <div className="rounded-lg border-2 border-primary-600 bg-primary-50 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Vergleich: Ganzjahr vs. Saisonkennzeichen ({saisonMonate} Monate)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-primary-600">
                <th className="py-2 pr-4 text-left font-medium text-gray-700">Kostenart</th>
                <th className="py-2 px-4 text-right font-medium text-gray-700">Ganzjahr</th>
                <th className="py-2 px-4 text-right font-medium text-gray-700">
                  Saison ({saisonMonate} Mon.)
                </th>
                <th className="py-2 pl-4 text-right font-medium text-gray-700">Ersparnis</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-2 pr-4 text-gray-700">Kfz-Steuer</td>
                <td className="py-2 px-4 text-right">{formatEur(steuerGanzjahr)} €</td>
                <td className="py-2 px-4 text-right">{formatEur(steuerSaison)} €</td>
                <td className="py-2 pl-4 text-right text-green-700 font-medium">
                  {formatEur(steuerErsparnis)} €
                </td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 pr-4 text-gray-700">Versicherung</td>
                <td className="py-2 px-4 text-right">{formatEur(versicherungGanzjahr)} €</td>
                <td className="py-2 px-4 text-right">{formatEur(versicherungSaison)} €</td>
                <td className="py-2 pl-4 text-right text-green-700 font-medium">
                  {formatEur(versicherungErsparnis)} €
                </td>
              </tr>
              {stellplatzkosten > 0 && (
                <tr className="border-b border-gray-200">
                  <td className="py-2 pr-4 text-gray-700">
                    Stellplatzkosten ({ruheMonate} Ruhemonate)
                  </td>
                  <td className="py-2 px-4 text-right">–</td>
                  <td className="py-2 px-4 text-right text-red-600">
                    +{formatEur(stellplatzGesamt)} €
                  </td>
                  <td className="py-2 pl-4 text-right text-red-600 font-medium">
                    −{formatEur(stellplatzGesamt)} €
                  </td>
                </tr>
              )}
              <tr className="font-semibold">
                <td className="py-3 pr-4 text-gray-900">Netto-Ersparnis / Jahr</td>
                <td className="py-3 px-4"></td>
                <td className="py-3 px-4"></td>
                <td
                  className={`py-3 pl-4 text-right text-lg ${
                    nettoErsparnis > 0 ? "text-green-700" : "text-red-600"
                  }`}
                >
                  {nettoErsparnis >= 0 ? "" : "−"}
                  {formatEur(Math.abs(nettoErsparnis))} €
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          className={`mt-4 rounded-lg p-4 ${
            nettoErsparnis > 0
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <p
            className={`font-semibold ${
              nettoErsparnis > 0 ? "text-green-800" : "text-red-800"
            }`}
          >
            {nettoErsparnis > 0
              ? `✓ Ein Saisonkennzeichen lohnt sich! Du sparst ${formatEur(nettoErsparnis)} € pro Jahr.`
              : nettoErsparnis === 0
              ? "Kein finanzieller Unterschied – entscheide nach Komfort."
              : `✗ Ein Saisonkennzeichen lohnt sich finanziell nicht. Die Stellplatzkosten übersteigen die Ersparnis um ${formatEur(Math.abs(nettoErsparnis))} €.`}
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
        <p className="font-medium text-gray-700 mb-1">Hinweis</p>
        <p>
          Die Versicherungsersparnis ist vereinfacht berechnet (anteilig). Tatsächliche Tarife
          können je nach Versicherer abweichen. Beachte auch, dass ein Saisonkennzeichen
          bedeutet, dass der Wohnwagen außerhalb der Saison nicht bewegt werden darf.
        </p>
      </div>
    </div>
  );
}
