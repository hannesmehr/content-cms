"use client";

import { useState } from "react";

export function KautionsRechner() {
  const [kaltmiete, setKaltmiete] = useState<number>(750);
  const [kautionshoehe, setKautionshoehe] = useState<number>(2250);
  const [mietdauer, setMietdauer] = useState<number>(5);
  const [zinssatz, setZinssatz] = useState<number>(0.5);
  const [berechnet, setBerechnet] = useState(false);

  const formatEur = (val: number) =>
    val.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Maximale Kaution: 3 × Kaltmiete (§ 551 BGB)
  const maxKaution = kaltmiete * 3;
  const kautionZulaessig = kautionshoehe <= maxKaution;

  // Ratenzahlung: 3 gleiche Monatsraten (§ 551 Abs. 2 BGB)
  const rate = kautionshoehe / 3;

  // Zinseszins-Berechnung
  const zinsFaktor = 1 + zinssatz / 100;
  const endbetrag = kautionshoehe * Math.pow(zinsFaktor, mietdauer);
  const zinsenGesamt = endbetrag - kautionshoehe;

  // Jährliche Aufschlüsselung
  const jahresDetails: { jahr: number; anfang: number; zinsen: number; ende: number }[] = [];
  let laufenderBetrag = kautionshoehe;
  for (let j = 1; j <= Math.min(mietdauer, 30); j++) {
    const anfang = laufenderBetrag;
    const zinsen = anfang * (zinssatz / 100);
    laufenderBetrag = anfang + zinsen;
    jahresDetails.push({
      jahr: j,
      anfang,
      zinsen,
      ende: laufenderBetrag,
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kaltmiete (€/Monat)
          </label>
          <input
            type="number"
            min={0}
            step={10}
            value={kaltmiete}
            onChange={(e) => {
              setKaltmiete(Math.max(0, Number(e.target.value)));
              setBerechnet(false);
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Geforderte Kautionshöhe (€)
          </label>
          <input
            type="number"
            min={0}
            step={50}
            value={kautionshoehe}
            onChange={(e) => {
              setKautionshoehe(Math.max(0, Number(e.target.value)));
              setBerechnet(false);
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Voraussichtliche Mietdauer (Jahre)
          </label>
          <input
            type="number"
            min={1}
            step={1}
            value={mietdauer}
            onChange={(e) => {
              setMietdauer(Math.max(1, Number(e.target.value)));
              setBerechnet(false);
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Zinssatz (% p.a.)
          </label>
          <input
            type="number"
            min={0}
            step={0.1}
            value={zinssatz}
            onChange={(e) => {
              setZinssatz(Math.max(0, Number(e.target.value)));
              setBerechnet(false);
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>
      </div>

      <button
        onClick={() => setBerechnet(true)}
        className="w-full rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 transition-colors sm:w-auto"
      >
        Kaution berechnen
      </button>

      {berechnet && (
        <div className="rounded-lg border-2 border-primary-600 bg-primary-50 p-6">
          <h3 className="mb-4 text-lg font-bold text-gray-900">Kautionsberechnung</h3>

          {/* Zulässigkeitsprüfung */}
          <div
            className={`mb-4 rounded-lg p-4 text-center text-lg font-bold ${
              kautionZulaessig
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {kautionZulaessig
              ? "Die geforderte Kaution ist zulässig"
              : "Die geforderte Kaution ist zu hoch!"}
          </div>

          <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Maximale Kaution
              </p>
              <p className="mt-1 text-2xl font-bold text-primary-700">
                {formatEur(maxKaution)} €
              </p>
              <p className="text-xs text-gray-500">3 x Kaltmiete (§ 551 BGB)</p>
            </div>

            <div className="rounded-lg bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Geforderte Kaution
              </p>
              <p className={`mt-1 text-2xl font-bold ${kautionZulaessig ? "text-gray-900" : "text-red-700"}`}>
                {formatEur(kautionshoehe)} €
              </p>
              <p className="text-xs text-gray-500">
                {((kautionshoehe / kaltmiete)).toLocaleString("de-DE", { maximumFractionDigits: 1 })} Monatsmieten
              </p>
            </div>

            <div className="rounded-lg bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Zinsen nach {mietdauer} Jahren
              </p>
              <p className="mt-1 text-2xl font-bold text-green-700">
                +{formatEur(zinsenGesamt)} €
              </p>
              <p className="text-xs text-gray-500">bei {zinssatz.toLocaleString("de-DE")}% p.a.</p>
            </div>

            <div className="rounded-lg bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Rückzahlungsbetrag
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {formatEur(endbetrag)} €
              </p>
              <p className="text-xs text-gray-500">Kaution + Zinsen</p>
            </div>
          </div>

          {/* Ratenzahlungsplan */}
          <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
            <h4 className="mb-3 text-sm font-semibold text-gray-800">
              Ratenzahlung (§ 551 Abs. 2 BGB)
            </h4>
            <p className="mb-3 text-sm text-gray-600">
              Du darfst die Kaution in 3 gleichen Monatsraten zahlen. Die erste Rate ist zu
              Beginn des Mietverhältnisses fällig.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center">
                <p className="text-xs text-gray-500">1. Rate (bei Einzug)</p>
                <p className="text-lg font-bold text-gray-900">{formatEur(rate)} €</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center">
                <p className="text-xs text-gray-500">2. Rate (2. Monat)</p>
                <p className="text-lg font-bold text-gray-900">{formatEur(rate)} €</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center">
                <p className="text-xs text-gray-500">3. Rate (3. Monat)</p>
                <p className="text-lg font-bold text-gray-900">{formatEur(rate)} €</p>
              </div>
            </div>
          </div>

          {/* Zinsentwicklung */}
          {mietdauer > 1 && (
            <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
              <h4 className="mb-3 text-sm font-semibold text-gray-800">
                Zinsentwicklung (Zinseszins)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      <th className="pb-2 pr-4">Jahr</th>
                      <th className="pb-2 pr-4 text-right">Anfangsbestand</th>
                      <th className="pb-2 pr-4 text-right">Zinsen</th>
                      <th className="pb-2 text-right">Endbestand</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {jahresDetails.map((j) => (
                      <tr key={j.jahr}>
                        <td className="py-2 pr-4 text-gray-700">{j.jahr}</td>
                        <td className="py-2 pr-4 text-right text-gray-900">
                          {formatEur(j.anfang)} €
                        </td>
                        <td className="py-2 pr-4 text-right text-green-700">
                          +{formatEur(j.zinsen)} €
                        </td>
                        <td className="py-2 text-right font-medium text-gray-900">
                          {formatEur(j.ende)} €
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
            <strong>Deine Rechte als Mieter (§ 551 BGB):</strong>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Die Kaution darf maximal 3 Nettokaltmieten betragen.</li>
              <li>Sie dürfen in 3 gleichen Monatsraten zahlen.</li>
              <li>Der Vermieter muss die Kaution getrennt von seinem Vermögen auf einem Sparkonto anlegen.</li>
              <li>Die Zinsen stehen dir zu und werden bei Auszug mit der Kaution zurückgezahlt.</li>
              <li>Nach Mietende hat der Vermieter in der Regel 3-6 Monate Zeit zur Rückzahlung.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
