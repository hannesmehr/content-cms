"use client";

import { useState } from "react";

export function CampingplatzBudgetRechner() {
  const [stellplatz, setStellplatz] = useState<number>(15);
  const [strom, setStrom] = useState<number>(3.5);
  const [erwachsene, setErwachsene] = useState<number>(2);
  const [kurtaxeErwachsene, setKurtaxeErwachsene] = useState<number>(2);
  const [kinder, setKinder] = useState<number>(0);
  const [kurtaxeKinder, setKurtaxeKinder] = useState<number>(1);
  const [wlan, setWlan] = useState<number>(0);
  const [waschkosten, setWaschkosten] = useState<number>(3);
  const [waschNutzungen, setWaschNutzungen] = useState<number>(2);
  const [naechte, setNaechte] = useState<number>(7);
  const [hundGebuehr, setHundGebuehr] = useState<number>(0);

  const kurtaxeTag =
    erwachsene * kurtaxeErwachsene + kinder * kurtaxeKinder;
  const tageskosten = stellplatz + strom + kurtaxeTag + wlan + hundGebuehr;
  const waschGesamt = waschkosten * waschNutzungen;
  const gesamtkosten = tageskosten * naechte + waschGesamt;
  const personenGesamt = erwachsene + kinder;
  const proPersonNacht = personenGesamt > 0 ? gesamtkosten / (personenGesamt * naechte) : 0;

  const formatEur = (val: number) =>
    val.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const kostenzeilen = [
    { label: "Stellplatzgebühr", tag: stellplatz, gesamt: stellplatz * naechte },
    { label: "Strom", tag: strom, gesamt: strom * naechte },
    {
      label: `Kurtaxe Erwachsene (${erwachsene}×)`,
      tag: erwachsene * kurtaxeErwachsene,
      gesamt: erwachsene * kurtaxeErwachsene * naechte,
    },
    ...(kinder > 0
      ? [
          {
            label: `Kurtaxe Kinder (${kinder}×)`,
            tag: kinder * kurtaxeKinder,
            gesamt: kinder * kurtaxeKinder * naechte,
          },
        ]
      : []),
    ...(wlan > 0 ? [{ label: "WLAN", tag: wlan, gesamt: wlan * naechte }] : []),
    ...(hundGebuehr > 0
      ? [{ label: "Hund", tag: hundGebuehr, gesamt: hundGebuehr * naechte }]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stellplatzgebühr pro Nacht (€)
          </label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={stellplatz}
            onChange={(e) => setStellplatz(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stromkosten pro Tag (€)
          </label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={strom}
            onChange={(e) => setStrom(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Anzahl Nächte
          </label>
          <input
            type="number"
            min={1}
            max={365}
            value={naechte}
            onChange={(e) => setNaechte(Math.max(1, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Anzahl Erwachsene
          </label>
          <input
            type="number"
            min={1}
            max={10}
            value={erwachsene}
            onChange={(e) => setErwachsene(Math.max(1, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kurtaxe pro Erwachsener / Tag (€)
          </label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={kurtaxeErwachsene}
            onChange={(e) => setKurtaxeErwachsene(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Anzahl Kinder (kurtaxpflichtig)
          </label>
          <input
            type="number"
            min={0}
            max={10}
            value={kinder}
            onChange={(e) => setKinder(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>

        {kinder > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kurtaxe pro Kind / Tag (€)
            </label>
            <input
              type="number"
              min={0}
              step={0.5}
              value={kurtaxeKinder}
              onChange={(e) => setKurtaxeKinder(Math.max(0, Number(e.target.value)))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            WLAN Kosten pro Tag (€)
          </label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={wlan}
            onChange={(e) => setWlan(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Waschmaschine / Trockner pro Nutzung (€)
          </label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={waschkosten}
            onChange={(e) => setWaschkosten(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Geschätzte Nutzungen (Waschmaschine)
          </label>
          <input
            type="number"
            min={0}
            value={waschNutzungen}
            onChange={(e) => setWaschNutzungen(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hund – Gebühr pro Tag (€)
          </label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={hundGebuehr}
            onChange={(e) => setHundGebuehr(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>
      </div>

      <div className="rounded-lg border-2 border-primary-600 bg-primary-50 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Kostenübersicht – {naechte} Nächte
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-primary-600">
                <th className="py-2 pr-4 text-left font-medium text-gray-700">Kostenart</th>
                <th className="py-2 px-4 text-right font-medium text-gray-700">Pro Tag</th>
                <th className="py-2 pl-4 text-right font-medium text-gray-700">
                  Gesamt ({naechte} Nächte)
                </th>
              </tr>
            </thead>
            <tbody>
              {kostenzeilen.map((z) => (
                <tr key={z.label} className="border-b border-gray-200">
                  <td className="py-2 pr-4 text-gray-700">{z.label}</td>
                  <td className="py-2 px-4 text-right">{formatEur(z.tag)} €</td>
                  <td className="py-2 pl-4 text-right">{formatEur(z.gesamt)} €</td>
                </tr>
              ))}
              {waschGesamt > 0 && (
                <tr className="border-b border-gray-200">
                  <td className="py-2 pr-4 text-gray-700">
                    Waschmaschine / Trockner ({waschNutzungen}× Nutzung)
                  </td>
                  <td className="py-2 px-4 text-right text-gray-400">–</td>
                  <td className="py-2 pl-4 text-right">{formatEur(waschGesamt)} €</td>
                </tr>
              )}
              <tr className="font-bold text-primary-700">
                <td className="py-3 pr-4 text-base">Tageskosten</td>
                <td className="py-3 px-4 text-right text-base">{formatEur(tageskosten)} €</td>
                <td className="py-3 pl-4 text-right text-base"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-4 shadow-sm text-center">
            <p className="text-sm text-gray-500">Gesamtkosten</p>
            <p className="text-2xl font-bold text-primary-700">{formatEur(gesamtkosten)} €</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm text-center">
            <p className="text-sm text-gray-500">Kosten pro Tag</p>
            <p className="text-2xl font-bold text-primary-700">{formatEur(tageskosten)} €</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm text-center">
            <p className="text-sm text-gray-500">Pro Person / Nacht</p>
            <p className="text-2xl font-bold text-primary-700">{formatEur(proPersonNacht)} €</p>
          </div>
        </div>

        <p className="mt-4 text-center text-sm text-gray-600">
          Das entspricht{" "}
          <strong className="text-primary-700">{formatEur(proPersonNacht)} €</strong> pro Person pro
          Nacht bei {personenGesamt} {personenGesamt === 1 ? "Person" : "Personen"} und{" "}
          {naechte} {naechte === 1 ? "Nacht" : "Nächten"}.
        </p>
      </div>

      <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
        <p className="font-medium text-gray-700 mb-1">Tipp</p>
        <p>
          Viele Campingplätze bieten Rabatte bei längeren Aufenthalten oder in der Nebensaison.
          Frage vor Ort nach Wochen- oder Monatstarifen. Mit einer ACSI-Karte kannst du in
          der Nebensaison auf vielen europäischen Campingplätzen zu reduzierten Preisen stehen.
        </p>
      </div>
    </div>
  );
}
