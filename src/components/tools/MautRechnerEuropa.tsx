"use client";

import { useState } from "react";

type LandConfig = {
  name: string;
  key: string;
  system: string;
  kmPreis: number; // €/km für Streckenmaut, 0 bei Vignette
  vignetten?: { label: string; preis: number }[];
  sondermaut?: { label: string; preis: number }[];
  hinweis?: string;
  gespannFaktor: number;
};

const laender: LandConfig[] = [
  {
    name: "Österreich",
    key: "at",
    system: "Vignette + Sondermaut",
    kmPreis: 0,
    vignetten: [
      { label: "10-Tage-Vignette", preis: 12.8 },
      { label: "2-Monats-Vignette", preis: 32.0 },
      { label: "Jahres-Vignette", preis: 106.8 },
    ],
    sondermaut: [
      { label: "Brenner Autobahn (A13)", preis: 12.5 },
      { label: "Tauern Tunnel", preis: 15.0 },
      { label: "Karawanken Tunnel (AT-Seite)", preis: 9.0 },
      { label: "Arlberg Tunnel", preis: 13.0 },
      { label: "Pyhrn Autobahn (A9 Gleinalm + Bosruck)", preis: 19.0 },
    ],
    hinweis:
      "Gespanne über 3,5 t zGG brauchen eine Go-Box statt Vignette. Die Sondermautstrecken sind zusätzlich zur Vignette fällig.",
    gespannFaktor: 1.0,
  },
  {
    name: "Schweiz",
    key: "ch",
    system: "Vignette pauschal",
    kmPreis: 0,
    vignetten: [{ label: "Jahres-Vignette (Pflicht)", preis: 37.0 }],
    hinweis:
      "Die Schweizer Vignette gilt für das Zugfahrzeug. Bei PKW-Gespannen ist kein Anhänger-Zuschlag fällig. Kosten 40 CHF (~37 €). Preiserhöhung auf 100 CHF wurde 2024 per Volksabstimmung abgelehnt.",
    gespannFaktor: 1.0,
  },
  {
    name: "Italien",
    key: "it",
    system: "Streckenmaut",
    kmPreis: 0.08,
    hinweis:
      "Streckenmaut auf den meisten Autobahnen. PKW = Klasse A, Gespann mit Anhänger = Klasse 3 (3 Achsen, ca. Faktor 1,35). Preis variiert je nach Betreibergesellschaft und Strecke.",
    gespannFaktor: 1.35,
  },
  {
    name: "Frankreich",
    key: "fr",
    system: "Streckenmaut",
    kmPreis: 0.09,
    hinweis:
      "Gespanne mit Gesamthöhe über 2 m zahlen Klasse 2 (ca. 50 % Aufschlag). Die meisten Wohnwagen-Gespanne fallen in Klasse 2. Viele Autoroutes sind mautpflichtig.",
    gespannFaktor: 1.5,
  },
  {
    name: "Spanien",
    key: "es",
    system: "Streckenmaut (Autopistas)",
    kmPreis: 0.08,
    hinweis:
      "Nur Autopistas sind mautpflichtig. Viele Autovías (Schnellstraßen) sind kostenlos. Anteil mautpflichtiger Strecke variiert stark.",
    gespannFaktor: 1.0,
  },
  {
    name: "Kroatien",
    key: "hr",
    system: "Streckenmaut",
    kmPreis: 0.08,
    hinweis:
      "Streckenmaut auf Autobahnen. Gespanne (Kategorie II) zahlen ca. 50 % Aufschlag gegenüber PKW (Kategorie I).",
    gespannFaktor: 1.5,
  },
  {
    name: "Slowenien",
    key: "si",
    system: "Vignette + Tunnel",
    kmPreis: 0,
    vignetten: [
      { label: "7-Tage-Vignette", preis: 16.0 },
      { label: "1-Monats-Vignette", preis: 32.0 },
      { label: "Jahres-Vignette", preis: 117.5 },
    ],
    sondermaut: [{ label: "Karawanken-Tunnel (SI-Seite)", preis: 9.0 }],
    hinweis:
      "E-Vignette (DarsGo) erforderlich. PKW-Gespanne benötigen die PKW-Vignette, sofern das zGG unter 3,5 t liegt.",
    gespannFaktor: 1.0,
  },
  {
    name: "Tschechien",
    key: "cz",
    system: "E-Vignette",
    kmPreis: 0,
    vignetten: [
      { label: "10-Tage-Vignette", preis: 12.3 },
      { label: "30-Tage-Vignette", preis: 19.7 },
      { label: "Jahres-Vignette", preis: 105.3 },
    ],
    hinweis:
      "Elektronische Vignette, online kaufbar. Gilt für Fahrzeuge bis 3,5 t.",
    gespannFaktor: 1.0,
  },
  {
    name: "Ungarn",
    key: "hu",
    system: "E-Vignette",
    kmPreis: 0,
    vignetten: [
      { label: "10-Tage-Vignette (Kat. D1)", preis: 18.0 },
      { label: "Monats-Vignette (Kat. D1)", preis: 29.0 },
      { label: "Jahres-Vignette (Kat. D1)", preis: 162.0 },
    ],
    hinweis:
      "E-Vignette für Autobahnen und Schnellstraßen. Preise in HUF, hier umgerechnet in EUR (Kurs kann schwanken). Gespanne mit Anhänger benötigen ggf. Kategorie D2.",
    gespannFaktor: 1.0,
  },
];

type LandState = {
  selected: boolean;
  km: string;
  vignetteIndex: number;
  sondermautSelected: boolean[];
};

function formatEuro(n: number): string {
  return n.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function MautRechnerEuropa() {
  const initialState: Record<string, LandState> = {};
  laender.forEach((l) => {
    initialState[l.key] = {
      selected: false,
      km: "",
      vignetteIndex: 0,
      sondermautSelected: l.sondermaut ? l.sondermaut.map(() => false) : [],
    };
  });

  const [state, setState] = useState<Record<string, LandState>>(initialState);

  const toggleLand = (key: string) => {
    setState((prev) => ({
      ...prev,
      [key]: { ...prev[key], selected: !prev[key].selected },
    }));
  };

  const setKm = (key: string, km: string) => {
    setState((prev) => ({
      ...prev,
      [key]: { ...prev[key], km },
    }));
  };

  const setVignetteIndex = (key: string, index: number) => {
    setState((prev) => ({
      ...prev,
      [key]: { ...prev[key], vignetteIndex: index },
    }));
  };

  const toggleSondermaut = (key: string, index: number) => {
    setState((prev) => {
      const newSondermaut = [...prev[key].sondermautSelected];
      newSondermaut[index] = !newSondermaut[index];
      return {
        ...prev,
        [key]: { ...prev[key], sondermautSelected: newSondermaut },
      };
    });
  };

  const selectedLaender = laender.filter((l) => state[l.key].selected);

  const berechnungen = selectedLaender.map((land) => {
    const ls = state[land.key];
    const km = parseFloat(ls.km) || 0;

    let kosten = 0;

    // Streckenmaut
    if (land.kmPreis > 0) {
      kosten += km * land.kmPreis * land.gespannFaktor;
    }

    // Vignette
    if (land.vignetten && land.vignetten.length > 0) {
      kosten += land.vignetten[ls.vignetteIndex]?.preis || 0;
    }

    // Sondermaut
    if (land.sondermaut) {
      land.sondermaut.forEach((sm, i) => {
        if (ls.sondermautSelected[i]) {
          kosten += sm.preis;
        }
      });
    }

    return { land, kosten, km };
  });

  const gesamtkosten = berechnungen.reduce((sum, b) => sum + b.kosten, 0);

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="space-y-6">
      {/* Länderauswahl */}
      <div>
        <label className={labelClass}>Reiseländer auswählen</label>
        <div className="grid gap-2 sm:grid-cols-3">
          {laender.map((land) => (
            <label
              key={land.key}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition ${
                state[land.key].selected
                  ? "border-primary-600 bg-primary-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <input
                type="checkbox"
                checked={state[land.key].selected}
                onChange={() => toggleLand(land.key)}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">
                  {land.name}
                </span>
                <span className="ml-1 text-xs text-gray-500">
                  ({land.system})
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Details pro Land */}
      {selectedLaender.length > 0 && (
        <div className="space-y-4">
          {selectedLaender.map((land) => {
            const ls = state[land.key];
            return (
              <div
                key={land.key}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <h3 className="mb-3 text-sm font-semibold text-gray-800">
                  {land.name}
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Kilometer (nur bei Streckenmaut) */}
                  {land.kmPreis > 0 && (
                    <div>
                      <label className={labelClass}>
                        Geschätzte Autobahnkilometer
                      </label>
                      <input
                        type="number"
                        value={ls.km}
                        onChange={(e) => setKm(land.key, e.target.value)}
                        placeholder="z.B. 500"
                        className={inputClass}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        ca. {formatEuro(land.kmPreis * land.gespannFaktor)}
                        €/km für Gespann
                      </p>
                    </div>
                  )}

                  {/* Vignette */}
                  {land.vignetten && land.vignetten.length > 0 && (
                    <div>
                      <label className={labelClass}>Vignette</label>
                      <select
                        value={ls.vignetteIndex}
                        onChange={(e) =>
                          setVignetteIndex(land.key, parseInt(e.target.value))
                        }
                        className={inputClass}
                      >
                        {land.vignetten.map((v, i) => (
                          <option key={i} value={i}>
                            {v.label} – {formatEuro(v.preis)} €
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Sondermaut */}
                {land.sondermaut && land.sondermaut.length > 0 && (
                  <div className="mt-3">
                    <label className={labelClass}>
                      Sondermautstrecken (einfache Fahrt)
                    </label>
                    <div className="space-y-1">
                      {land.sondermaut.map((sm, i) => (
                        <label
                          key={i}
                          className="flex items-center gap-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={ls.sondermautSelected[i]}
                            onChange={() => toggleSondermaut(land.key, i)}
                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                          />
                          <span className="text-gray-700">
                            {sm.label} – {formatEuro(sm.preis)} €
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hinweis */}
                {land.hinweis && (
                  <p className="mt-3 text-xs text-gray-500">{land.hinweis}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Ergebnis */}
      {selectedLaender.length > 0 && (
        <div className="rounded-lg border-2 border-primary-600 bg-primary-50 p-6">
          <h3 className="mb-4 text-lg font-bold text-gray-900">
            Geschätzte Mautkosten
          </h3>

          <div className="space-y-3">
            {berechnungen.map((b) => (
              <div
                key={b.land.key}
                className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {b.land.name}
                  </p>
                  {b.km > 0 && (
                    <p className="text-xs text-gray-500">
                      {b.km.toLocaleString("de-DE")} km Strecke
                    </p>
                  )}
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {formatEuro(b.kosten)} €
                </span>
              </div>
            ))}

            <hr className="border-primary-200" />

            <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm">
              <span className="text-base font-bold text-gray-900">
                Gesamtkosten (geschätzt)
              </span>
              <span className="text-2xl font-bold text-primary-700">
                {formatEuro(gesamtkosten)} €
              </span>
            </div>
          </div>
        </div>
      )}

      {selectedLaender.length === 0 && (
        <div className="rounded-lg border-2 border-primary-600 bg-primary-50 p-6">
          <p className="text-sm text-gray-500">
            Wähle mindestens ein Reiseland aus, um die Mautkosten zu
            berechnen.
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
        <p className="font-semibold text-gray-700">
          Hinweis: Alle Preise sind Richtwerte!
        </p>
        <p className="mt-1">
          Mautgebühren ändern sich regelmäßig und können je nach Strecke,
          Fahrzeugklasse und Zahlungsmethode variieren. Die tatsächlichen Kosten
          können von dieser Schätzung abweichen. Bei Streckenmaut hängt der
          Preis vom konkreten Autobahnabschnitt ab. Prüfe die aktuellen
          Tarife vor deiner Reise auf den offiziellen Mautbetreiber-Webseiten.
        </p>
      </div>
    </div>
  );
}
