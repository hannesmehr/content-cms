"use client";

import { useState } from "react";

export function GasverbrauchRechner() {
  const [flaschenGroesse, setFlaschenGroesse] = useState<number>(11);
  const [flaschenAnzahl, setFlaschenAnzahl] = useState<number>(1);
  const [heizung, setHeizung] = useState<string>("aus");
  const [kochEinheiten, setKochEinheiten] = useState<number>(2);
  const [kuehlschrank, setKuehlschrank] = useState(false);
  const [boiler, setBoiler] = useState(false);

  // Truma S 3004: 30–280 g/h, S 5004: 60–480 g/h
  // Low: ~50g/h × 12h, Medium: ~120g/h × 16h, High: ~200g/h × 22h
  const heizungVerbrauch: Record<string, number> = {
    aus: 0,
    niedrig: 600,
    mittel: 2000,
    hoch: 4500,
  };

  const heizungLabel: Record<string, string> = {
    aus: "Aus (Sommer)",
    niedrig: "Niedrig (~600g/Tag, Herbst/Frühling)",
    mittel: "Mittel (~2.000g/Tag, Winter 0°C)",
    hoch: "Hoch (~4.500g/Tag, Winter unter -5°C)",
  };

  const tagesverbrauchHeizung = heizungVerbrauch[heizung] || 0;
  // Campingkocher 2 Flammen: ~200g/h bei moderater Nutzung, 30 Min = ~100g
  // Realistisch mit Aufwärmen/Volllast: ~125g pro 30-Min-Einheit
  const tagesverbrauchKochen = kochEinheiten * 125;
  // Absorber-Kühlschrank: 15–20g/h = 360–480g/Tag, Mittelwert ~400g
  const tagesverbrauchKuehlschrank = kuehlschrank ? 400 : 0;
  // Truma Boiler 10L: ~60g pro Aufheizung, 2x/Tag = 120g
  const tagesverbrauchBoiler = boiler ? 120 : 0;

  const tagesverbrauchGesamt =
    tagesverbrauchHeizung +
    tagesverbrauchKochen +
    tagesverbrauchKuehlschrank +
    tagesverbrauchBoiler;

  const gesamtGas = flaschenAnzahl * flaschenGroesse * 1000; // in Gramm
  const reichweite =
    tagesverbrauchGesamt > 0
      ? Math.floor(gesamtGas / tagesverbrauchGesamt)
      : 0;

  const barMaxDays = 30;
  const barPercent = Math.min((reichweite / barMaxDays) * 100, 100);

  const getBarColor = () => {
    if (reichweite <= 3) return "bg-red-500";
    if (reichweite <= 7) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Flaschengröße
          </label>
          <select
            value={flaschenGroesse}
            onChange={(e) => setFlaschenGroesse(parseInt(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          >
            <option value={5}>5 kg Flasche</option>
            <option value={11}>11 kg Flasche</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Anzahl Flaschen
          </label>
          <select
            value={flaschenAnzahl}
            onChange={(e) => setFlaschenAnzahl(parseInt(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          >
            <option value={1}>1 Flasche</option>
            <option value={2}>2 Flaschen</option>
          </select>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-800">
          Täglicher Verbrauch
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Heizung
            </label>
            <select
              value={heizung}
              onChange={(e) => setHeizung(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
            >
              {Object.entries(heizungLabel).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Kochen (30-Min-Einheiten/Tag)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={8}
                value={kochEinheiten}
                onChange={(e) => setKochEinheiten(parseInt(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-300 accent-primary-600"
              />
              <span className="w-20 text-right text-sm font-medium text-gray-700">
                {kochEinheiten === 0
                  ? "Aus"
                  : `${kochEinheiten * 30} Min (~${kochEinheiten * 125}g)`}
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setKuehlschrank(!kuehlschrank)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  kuehlschrank ? "bg-primary-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                    kuehlschrank ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <label className="text-sm font-medium text-gray-700">
                Kühlschrank auf Gas (~400g/Tag)
              </label>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBoiler(!boiler)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  boiler ? "bg-primary-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                    boiler ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <label className="text-sm font-medium text-gray-700">
                Warmwasser-Boiler (~120g/Tag)
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border-2 border-primary-600 bg-primary-50 p-6">
        <h3 className="mb-4 text-lg font-bold text-gray-900">Ergebnis</h3>

        <div className="mb-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Gasvorrat
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {flaschenAnzahl * flaschenGroesse} kg
            </p>
            <p className="text-xs text-gray-500">
              ({gesamtGas.toLocaleString("de-DE")} g)
            </p>
          </div>

          <div className="rounded-lg bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Tagesverbrauch
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {tagesverbrauchGesamt > 0
                ? `${tagesverbrauchGesamt} g`
                : "\u2013"}
            </p>
            <p className="text-xs text-gray-500">pro Tag geschätzt</p>
          </div>

          <div className="rounded-lg bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Reichweite
            </p>
            <p className="mt-1 text-2xl font-bold text-primary-700">
              {tagesverbrauchGesamt > 0
                ? `${reichweite} Tage`
                : "\u2013"}
            </p>
            <p className="text-xs text-gray-500">bis die Flaschen leer sind</p>
          </div>
        </div>

        {tagesverbrauchGesamt > 0 && (
          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
              <span>0 Tage</span>
              <span>{barMaxDays}+ Tage</span>
            </div>
            <div className="h-6 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={`flex h-full items-center justify-end rounded-full px-2 text-xs font-bold text-white transition-all duration-500 ${getBarColor()}`}
                style={{ width: `${Math.max(barPercent, 8)}%` }}
              >
                {reichweite}d
              </div>
            </div>
            {reichweite <= 3 && (
              <p className="mt-2 text-sm font-medium text-red-700">
                Sehr geringe Reichweite! Plane einen Flaschentausch ein oder
                reduziere den Verbrauch.
              </p>
            )}
          </div>
        )}

        {tagesverbrauchGesamt > 0 && (
          <div className="mt-4 rounded-md bg-white/60 p-3">
            <p className="text-xs text-gray-600">
              <strong>Aufschlüsselung Tagesverbrauch:</strong>{" "}
              {tagesverbrauchHeizung > 0 &&
                `Heizung ${tagesverbrauchHeizung}g`}
              {tagesverbrauchHeizung > 0 && tagesverbrauchKochen > 0 && " + "}
              {tagesverbrauchKochen > 0 && `Kochen ${tagesverbrauchKochen}g`}
              {(tagesverbrauchHeizung > 0 || tagesverbrauchKochen > 0) &&
                tagesverbrauchKuehlschrank > 0 &&
                " + "}
              {tagesverbrauchKuehlschrank > 0 &&
                `Kühlschrank ${tagesverbrauchKuehlschrank}g`}
              {(tagesverbrauchHeizung > 0 ||
                tagesverbrauchKochen > 0 ||
                tagesverbrauchKuehlschrank > 0) &&
                tagesverbrauchBoiler > 0 &&
                " + "}
              {tagesverbrauchBoiler > 0 && `Boiler ${tagesverbrauchBoiler}g`}
              {" = "}
              <strong>{tagesverbrauchGesamt}g/Tag</strong>
            </p>
          </div>
        )}

        {tagesverbrauchGesamt === 0 && (
          <p className="text-sm text-gray-500">
            Aktiviere mindestens einen Verbraucher, um die Reichweite zu
            berechnen.
          </p>
        )}
      </div>
    </div>
  );
}
