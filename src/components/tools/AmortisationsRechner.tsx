"use client";

import { useState } from "react";

type Eingabemodus = "direkt" | "berechnet";

export function AmortisationsRechner() {
  const [investition, setInvestition] = useState<number>(30000);
  const [foerderung, setFoerderung] = useState<number>(10000);
  const [eingabemodus, setEingabemodus] = useState<Eingabemodus>("berechnet");
  const [jaehrlicheEinsparung, setJaehrlicheEinsparung] = useState<number>(1500);
  const [alterVerbrauch, setAlterVerbrauch] = useState<number>(25000);
  const [neuerVerbrauch, setNeuerVerbrauch] = useState<number>(8000);
  const [energietraeger, setEnergietraeger] = useState<string>("gas");
  const [energiepreis, setEnergiepreis] = useState<number>(0.12);
  const [preissteigerung, setPreissteigerung] = useState<number>(3);
  const [instandhaltung, setInstandhaltung] = useState<number>(1);

  const formatEur = (val: number) =>
    val.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const formatEurDecimal = (val: number) =>
    val.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const energiePreise: Record<string, { label: string; preis: number }> = {
    gas: { label: "Erdgas", preis: 0.12 },
    oel: { label: "Heizöl", preis: 0.10 },
    strom: { label: "Strom (Wärmepumpe)", preis: 0.35 },
    fernwaerme: { label: "Fernwärme", preis: 0.10 },
    pellets: { label: "Pellets", preis: 0.06 },
  };

  const handleEnergietraeger = (val: string) => {
    setEnergietraeger(val);
    setEnergiepreis(energiePreise[val]?.preis || 0.12);
  };

  // Berechnung
  const nettoInvestition = Math.max(0, investition - foerderung);
  const einsparungKwh = Math.max(0, alterVerbrauch - neuerVerbrauch);
  const berechnetEinsparung = einsparungKwh * energiepreis;
  const jahresEinsparung =
    eingabemodus === "direkt" ? jaehrlicheEinsparung : berechnetEinsparung;
  const jahresInstandhaltung = investition * (instandhaltung / 100);

  // Jahr-für-Jahr Berechnung mit Preissteigerung
  const maxJahre = 30;
  interface JahresDetail {
    jahr: number;
    einsparung: number;
    instandhaltungKosten: number;
    nettoEinsparung: number;
    kumuliert: number;
  }

  const jahresDetails: JahresDetail[] = [];
  let kumuliert = -nettoInvestition;
  let breakEvenJahr = -1;

  for (let j = 1; j <= maxJahre; j++) {
    const steigerungsFaktor = Math.pow(1 + preissteigerung / 100, j - 1);
    const einsparung = jahresEinsparung * steigerungsFaktor;
    const netto = einsparung - jahresInstandhaltung;
    kumuliert += netto;
    jahresDetails.push({
      jahr: j,
      einsparung,
      instandhaltungKosten: jahresInstandhaltung,
      nettoEinsparung: netto,
      kumuliert,
    });
    if (breakEvenJahr === -1 && kumuliert >= 0) {
      breakEvenJahr = j;
    }
  }

  const ersparnis20 = jahresDetails[19]?.kumuliert || 0;
  const maxKumuliert = Math.max(...jahresDetails.map((j) => Math.abs(j.kumuliert)), 1);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Investitionskosten (€)
          </label>
          <input
            type="number"
            min={0}
            step={1000}
            value={investition}
            onChange={(e) => setInvestition(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Erhaltene Förderung (€)
          </label>
          <input
            type="number"
            min={0}
            step={1000}
            value={foerderung}
            onChange={(e) => setFoerderung(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-800">Jährliche Energieeinsparung</h3>
        <div className="mb-3 flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={eingabemodus === "berechnet"}
              onChange={() => setEingabemodus("berechnet")}
              className="h-4 w-4 text-primary-600 focus:ring-primary-600"
            />
            <span className="text-sm text-gray-700">Aus Verbrauch berechnen</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={eingabemodus === "direkt"}
              onChange={() => setEingabemodus("direkt")}
              className="h-4 w-4 text-primary-600 focus:ring-primary-600"
            />
            <span className="text-sm text-gray-700">Direkt eingeben</span>
          </label>
        </div>

        {eingabemodus === "berechnet" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alter Verbrauch (kWh/Jahr)
              </label>
              <input
                type="number"
                min={0}
                step={500}
                value={alterVerbrauch}
                onChange={(e) => setAlterVerbrauch(Math.max(0, Number(e.target.value)))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Neuer Verbrauch (kWh/Jahr)
              </label>
              <input
                type="number"
                min={0}
                step={500}
                value={neuerVerbrauch}
                onChange={(e) => setNeuerVerbrauch(Math.max(0, Number(e.target.value)))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Energieträger
              </label>
              <select
                value={energietraeger}
                onChange={(e) => handleEnergietraeger(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
              >
                {Object.entries(energiePreise).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Energiepreis (€/kWh)
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={energiepreis}
                onChange={(e) => setEnergiepreis(Math.max(0, Number(e.target.value)))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
              />
            </div>
          </div>
        ) : (
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jährliche Einsparung (€)
            </label>
            <input
              type="number"
              min={0}
              step={100}
              value={jaehrlicheEinsparung}
              onChange={(e) => setJaehrlicheEinsparung(Math.max(0, Number(e.target.value)))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
            />
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preissteigerung Energie (%/Jahr)
          </label>
          <input
            type="number"
            min={0}
            max={20}
            step={0.5}
            value={preissteigerung}
            onChange={(e) => setPreissteigerung(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instandhaltungskosten (%/Jahr der Investition)
          </label>
          <input
            type="number"
            min={0}
            max={10}
            step={0.5}
            value={instandhaltung}
            onChange={(e) => setInstandhaltung(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>
      </div>

      <div className="rounded-lg border-2 border-primary-600 bg-primary-50 p-6">
        <h3 className="mb-4 text-lg font-bold text-gray-900">Amortisationsergebnis</h3>

        <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Netto-Investition
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{formatEur(nettoInvestition)} €</p>
            <p className="text-xs text-gray-500">nach Förderung</p>
          </div>

          <div className="rounded-lg bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Jährl. Einsparung (Jahr 1)
            </p>
            <p className="mt-1 text-2xl font-bold text-green-700">
              {formatEur(Math.round(jahresEinsparung))} €
            </p>
            <p className="text-xs text-gray-500">
              abzgl. {formatEur(Math.round(jahresInstandhaltung))} € Instandhaltung
            </p>
          </div>

          <div className="rounded-lg bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Break-even nach
            </p>
            <p
              className={`mt-1 text-2xl font-bold ${
                breakEvenJahr > 0 ? "text-primary-700" : "text-red-700"
              }`}
            >
              {breakEvenJahr > 0 ? `${breakEvenJahr} Jahren` : "> 30 Jahre"}
            </p>
            <p className="text-xs text-gray-500">Amortisationszeit</p>
          </div>

          <div className="rounded-lg bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Gesamtersparnis (20 J.)
            </p>
            <p
              className={`mt-1 text-2xl font-bold ${
                ersparnis20 >= 0 ? "text-green-700" : "text-red-700"
              }`}
            >
              {ersparnis20 >= 0 ? "+" : ""}
              {formatEur(Math.round(ersparnis20))} €
            </p>
            <p className="text-xs text-gray-500">kumuliert</p>
          </div>
        </div>

        {/* Balkendiagramm kumulierte Ersparnisse */}
        <div className="mb-4">
          <h4 className="mb-2 text-sm font-semibold text-gray-800">
            Kumulierte Ersparnisse (Jahr 1–20)
          </h4>
          <div className="space-y-1">
            {jahresDetails.slice(0, 20).map((j) => {
              const isPositive = j.kumuliert >= 0;
              const barWidth = Math.abs(j.kumuliert) / maxKumuliert * 50;
              return (
                <div key={j.jahr} className="flex items-center gap-2 text-xs">
                  <span className="w-6 text-right text-gray-500">{j.jahr}</span>
                  <div className="flex flex-1 items-center">
                    {/* Negative Seite */}
                    <div className="flex w-1/2 justify-end">
                      {!isPositive && (
                        <div
                          className="h-4 rounded-l bg-red-400 transition-all duration-300"
                          style={{ width: `${barWidth}%` }}
                        />
                      )}
                    </div>
                    {/* Mittellinie */}
                    <div className="w-px bg-gray-400 h-4" />
                    {/* Positive Seite */}
                    <div className="flex w-1/2">
                      {isPositive && (
                        <div
                          className="h-4 rounded-r bg-green-500 transition-all duration-300"
                          style={{ width: `${barWidth}%` }}
                        />
                      )}
                    </div>
                  </div>
                  <span
                    className={`w-24 text-right font-medium ${
                      isPositive ? "text-green-700" : "text-red-600"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {formatEur(Math.round(j.kumuliert))} €
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailtabelle */}
        <details className="rounded-lg bg-white p-4 shadow-sm">
          <summary className="cursor-pointer text-sm font-semibold text-gray-800">
            Detaillierte Jahresübersicht anzeigen
          </summary>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-300 text-left font-semibold uppercase tracking-wide text-gray-500">
                  <th className="py-2 pr-2">Jahr</th>
                  <th className="py-2 pr-2 text-right">Einsparung</th>
                  <th className="py-2 pr-2 text-right">Instandhaltung</th>
                  <th className="py-2 pr-2 text-right">Netto</th>
                  <th className="py-2 text-right">Kumuliert</th>
                </tr>
              </thead>
              <tbody>
                {jahresDetails.slice(0, 20).map((j) => (
                  <tr key={j.jahr} className="border-b border-gray-100">
                    <td className="py-1.5 pr-2 text-gray-700">{j.jahr}</td>
                    <td className="py-1.5 pr-2 text-right text-green-700">
                      +{formatEur(Math.round(j.einsparung))} €
                    </td>
                    <td className="py-1.5 pr-2 text-right text-red-600">
                      -{formatEur(Math.round(j.instandhaltungKosten))} €
                    </td>
                    <td className="py-1.5 pr-2 text-right font-medium text-gray-900">
                      {formatEur(Math.round(j.nettoEinsparung))} €
                    </td>
                    <td
                      className={`py-1.5 text-right font-bold ${
                        j.kumuliert >= 0 ? "text-green-700" : "text-red-600"
                      }`}
                    >
                      {j.kumuliert >= 0 ? "+" : ""}
                      {formatEur(Math.round(j.kumuliert))} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </div>
  );
}
