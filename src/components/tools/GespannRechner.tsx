"use client";

import { useState } from "react";

interface TempoLimit {
  land: string;
  innerorts: number;
  ausserorts: number;
  autobahn: string;
  hinweis?: string;
}

const tempoLimits: TempoLimit[] = [
  {
    land: "Deutschland",
    innerorts: 50,
    ausserorts: 80,
    autobahn: "80",
    hinweis: "100 km/h mit Tempo-100-Plakette möglich",
  },
  {
    land: "Österreich",
    innerorts: 50,
    ausserorts: 80,
    autobahn: "100",
  },
  {
    land: "Italien",
    innerorts: 50,
    ausserorts: 70,
    autobahn: "80",
  },
  {
    land: "Frankreich",
    innerorts: 50,
    ausserorts: 80,
    autobahn: "90",
    hinweis: "Bei Regen: Autobahn 110 km/h für Pkw (Gespann bleibt 90)",
  },
  {
    land: "Niederlande",
    innerorts: 50,
    ausserorts: 80,
    autobahn: "90",
  },
  {
    land: "Schweiz",
    innerorts: 50,
    ausserorts: 80,
    autobahn: "80",
  },
  {
    land: "Dänemark",
    innerorts: 50,
    ausserorts: 70,
    autobahn: "80",
  },
  {
    land: "Spanien",
    innerorts: 50,
    ausserorts: 70,
    autobahn: "80",
    hinweis: "Auf Autovías (mautfrei) teilweise 90 km/h erlaubt",
  },
  {
    land: "Kroatien",
    innerorts: 50,
    ausserorts: 80,
    autobahn: "90",
  },
  {
    land: "Schweden",
    innerorts: 50,
    ausserorts: 70,
    autobahn: "80",
  },
];

export function GespannRechner() {
  const [laengeZugfahrzeug, setLaengeZugfahrzeug] = useState<string>("");
  const [laengeWohnwagen, setLaengeWohnwagen] = useState<string>("");

  const zugNum = parseFloat(laengeZugfahrzeug) || 0;
  const wwNum = parseFloat(laengeWohnwagen) || 0;
  const gesamtlaenge = zugNum + wwNum;
  const hasInput = laengeZugfahrzeug !== "" && laengeWohnwagen !== "";

  const ueberLaenge = gesamtlaenge > 18;
  const langesGespann = gesamtlaenge > 7;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Länge Zugfahrzeug (m)
          </label>
          <input
            type="number"
            step="0.1"
            value={laengeZugfahrzeug}
            onChange={(e) => setLaengeZugfahrzeug(e.target.value)}
            placeholder="z.B. 4.8"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Länge Wohnwagen inkl. Deichsel (m)
          </label>
          <input
            type="number"
            step="0.1"
            value={laengeWohnwagen}
            onChange={(e) => setLaengeWohnwagen(e.target.value)}
            placeholder="z.B. 7.5"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>
      </div>

      {hasInput && (
        <div
          className={`rounded-lg border-2 p-6 ${
            ueberLaenge
              ? "border-red-500 bg-red-50"
              : "border-primary-600 bg-primary-50"
          }`}
        >
          <h3 className="mb-2 text-lg font-bold text-gray-900">
            Gesamtlänge des Gespanns
          </h3>

          <div className="mb-4 flex items-baseline gap-2">
            <span
              className={`text-3xl font-bold ${
                ueberLaenge ? "text-red-700" : "text-primary-700"
              }`}
            >
              {gesamtlaenge.toFixed(1)} m
            </span>
            <span className="text-sm text-gray-500">
              ({zugNum.toFixed(1)} m + {wwNum.toFixed(1)} m)
            </span>
          </div>

          {ueberLaenge && (
            <div className="mb-4 flex items-start gap-2 rounded-md bg-red-100 p-3">
              <span className="text-lg">&#9888;</span>
              <p className="text-sm font-medium text-red-800">
                Achtung: Die gesetzliche Höchstlänge für Gespanne in Deutschland
                beträgt 18,00 m. Ihr Gespann überschreitet dieses Limit um{" "}
                {(gesamtlaenge - 18).toFixed(1)} m!
              </p>
            </div>
          )}

          {!ueberLaenge && gesamtlaenge > 16 && (
            <div className="mb-4 flex items-start gap-2 rounded-md bg-yellow-100 p-3">
              <span className="text-lg">&#9888;</span>
              <p className="text-sm font-medium text-yellow-800">
                Ihr Gespann ist zwar noch unter dem 18-m-Limit, aber mit{" "}
                {gesamtlaenge.toFixed(1)} m schon recht lang. Beachte die
                eingeschränkte Manövrierfähigkeit.
              </p>
            </div>
          )}

          {langesGespann && !ueberLaenge && (
            <p className="mb-2 text-sm text-gray-600">
              Hinweis: Bei Gespannen über 7 m Gesamtlänge gelten in einigen
              Ländern abweichende Tempolimits.
            </p>
          )}
        </div>
      )}

      <div className="rounded-lg border-2 border-primary-600 bg-primary-50 p-6">
        <h3 className="mb-4 text-lg font-bold text-gray-900">
          Tempolimits für Wohnwagen-Gespanne
        </h3>
        <p className="mb-4 text-sm text-gray-600">
          Übersicht der zulässigen Höchstgeschwindigkeiten für Pkw mit
          Wohnwagen-Anhänger in beliebten Reiseländern.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-sm">
            <thead>
              <tr className="border-b-2 border-primary-600">
                <th className="px-3 py-2 text-left font-semibold text-gray-900">
                  Land
                </th>
                <th className="px-3 py-2 text-center font-semibold text-gray-900">
                  Innerorts
                </th>
                <th className="px-3 py-2 text-center font-semibold text-gray-900">
                  Außerorts
                </th>
                <th className="px-3 py-2 text-center font-semibold text-gray-900">
                  Autobahn
                </th>
              </tr>
            </thead>
            <tbody>
              {tempoLimits.map((limit, index) => (
                <tr
                  key={limit.land}
                  className={`border-b border-gray-200 ${
                    index % 2 === 0 ? "bg-white/50" : ""
                  }`}
                >
                  <td className="px-3 py-2">
                    <span className="font-medium text-gray-900">
                      {limit.land}
                    </span>
                    {limit.hinweis && (
                      <p className="mt-0.5 text-xs text-gray-500">
                        {limit.hinweis}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center font-mono text-gray-700">
                    {limit.innerorts}
                  </td>
                  <td className="px-3 py-2 text-center font-mono text-gray-700">
                    {limit.ausserorts}
                  </td>
                  <td className="px-3 py-2 text-center font-mono font-medium text-primary-700">
                    {limit.autobahn}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-gray-500">
          Alle Angaben in km/h. Bei Gespannen über 3,5 t zulässigem
          Gesamtgewicht können in einigen Ländern niedrigere Limits gelten.
          Informiere dich vor Reiseantritt über die aktuellen Vorschriften
          des jeweiligen Landes.
        </p>
      </div>
    </div>
  );
}
