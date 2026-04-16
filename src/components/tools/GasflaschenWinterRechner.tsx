"use client";

import { useState } from "react";

type Flaschentyp = {
  label: string;
  gas: number; // kg Gas
  leergewicht: number; // kg
  material: "stahl" | "alu";
};

const flaschenTypen: Record<string, Flaschentyp> = {
  "5-stahl": { label: "5 kg Stahl", gas: 5, leergewicht: 6.5, material: "stahl" },
  "11-stahl": { label: "11 kg Stahl", gas: 11, leergewicht: 13.5, material: "stahl" },
  "6-alu": { label: "6 kg Alugas", gas: 6, leergewicht: 3.5, material: "alu" },
  "11-alu": { label: "11 kg Alugas", gas: 11, leergewicht: 5.8, material: "alu" },
};

// Affiliate-Platzhalter
const affiliateLinks: { name: string; url: string; info: string }[] = [
  // { name: "Alugas Online-Shop", url: "https://...", info: "Leichte Alu-Gasflaschen" },
];

export function GasflaschenWinterRechner() {
  const [flaschenTyp, setFlaschenTyp] = useState<string>("11-stahl");
  const [anzahl, setAnzahl] = useState<number>(2);
  const [temperatur, setTemperatur] = useState<number>(0);
  const [isolierung, setIsolierung] = useState<string>("mittel");
  const [heizstunden, setHeizstunden] = useState<number>(12);
  const [kochen, setKochen] = useState(true);
  const [warmwasser, setWarmwasser] = useState(false);

  const flasche = flaschenTypen[flaschenTyp];
  const isAlugas = flasche.material === "alu";

  // Temperaturabhängiger Heizverbrauch (g/Stunde)
  // Bei 20°C: ~30g/h, bei 0°C: ~80g/h, bei -10°C: ~140g/h, bei -15°C: ~180g/h
  const basisVerbrauchProStunde = 30;
  const tempFaktor = Math.max(1, 1 + (20 - temperatur) * 0.055 + Math.max(0, -temperatur) * 0.03);

  // Isolierungsfaktor
  const isolierungsFaktor: Record<string, number> = {
    gut: 0.75,
    mittel: 1.0,
    schlecht: 1.35,
  };

  const heizVerbrauchProStunde =
    basisVerbrauchProStunde * tempFaktor * (isolierungsFaktor[isolierung] || 1);
  const tagesverbrauchHeizung = Math.round(heizVerbrauchProStunde * heizstunden);
  const tagesverbrauchKochen = kochen ? 250 : 0; // ~250g/Tag (2 Mahlzeiten à 30 Min)
  const tagesverbrauchWarmwasser = warmwasser ? 120 : 0; // Truma Boiler: ~60g/Aufheizung × 2/Tag

  const tagesverbrauchGesamt =
    tagesverbrauchHeizung + tagesverbrauchKochen + tagesverbrauchWarmwasser;

  const gesamtGas = anzahl * flasche.gas * 1000; // Gramm
  const reichweite =
    tagesverbrauchGesamt > 0 ? Math.floor(gesamtGas / tagesverbrauchGesamt) : 0;

  // Kosten pro Füllung (Stand 2026, Richtwerte)
  // Stahl: 5kg ~15€, 11kg ~27€ | Alugas: 6kg ~12€, 11kg ~21€ (LPG-Tankstelle)
  const kostenMap: Record<string, number> = {
    "5-stahl": 15,
    "11-stahl": 27,
    "6-alu": 12,
    "11-alu": 21,
  };
  const kostenProFuellung = kostenMap[flaschenTyp] || 20;
  const gesamtKosten = anzahl * kostenProFuellung;
  const kostenProTag =
    tagesverbrauchGesamt > 0
      ? ((gesamtKosten / reichweite) || 0).toFixed(2)
      : "0";

  // Gewichtsvergleich Stahl vs. Alu
  const stahlPendant = flaschenTyp === "6-alu" ? flaschenTypen["5-stahl"] : flaschenTypen["11-stahl"];
  const gewichtsErsparnis = isAlugas
    ? (stahlPendant.leergewicht - flasche.leergewicht) * anzahl
    : 0;

  // Fortschrittsbalken
  const barMaxDays = 30;
  const barPercent = Math.min((reichweite / barMaxDays) * 100, 100);
  const getBarColor = () => {
    if (reichweite <= 3) return "bg-red-500";
    if (reichweite <= 7) return "bg-yellow-500";
    return "bg-green-500";
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Flaschentyp
          </label>
          <select
            value={flaschenTyp}
            onChange={(e) => setFlaschenTyp(e.target.value)}
            className={inputClass}
          >
            <optgroup label="Stahl">
              <option value="5-stahl">5 kg Stahl (6,5 kg leer)</option>
              <option value="11-stahl">11 kg Stahl (13,5 kg leer)</option>
            </optgroup>
            <optgroup label="Alugas">
              <option value="6-alu">6 kg Alugas (3,5 kg leer)</option>
              <option value="11-alu">11 kg Alugas (5,8 kg leer)</option>
            </optgroup>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Anzahl Flaschen
          </label>
          <select
            value={anzahl}
            onChange={(e) => setAnzahl(parseInt(e.target.value))}
            className={inputClass}
          >
            <option value={1}>1 Flasche</option>
            <option value={2}>2 Flaschen</option>
          </select>
        </div>
      </div>

      {/* Alugas-Hinweis */}
      {isAlugas && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p className="text-sm text-blue-800">
            <strong>Alugas-Vorteil:</strong> Deine {anzahl} Alugas-Flasche{anzahl > 1 ? "n" : ""}{" "}
            spar{anzahl > 1 ? "en" : "t"} dir ca.{" "}
            <strong>{gewichtsErsparnis.toFixed(1)} kg</strong> Leergewicht gegenüber Stahl
            — mehr Zuladung für Gepäck und Vorräte!
          </p>
        </div>
      )}

      {/* Bedingungen */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-800">
          Winterbedingungen
        </h3>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Außentemperatur: <strong>{temperatur}°C</strong>
            </label>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">-15°C</span>
              <input
                type="range"
                min={-15}
                max={15}
                value={temperatur}
                onChange={(e) => setTemperatur(parseInt(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-300 accent-primary-600"
              />
              <span className="text-xs text-gray-500">+15°C</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Isolierung des Wohnwagens
              </label>
              <select
                value={isolierung}
                onChange={(e) => setIsolierung(e.target.value)}
                className={inputClass}
              >
                <option value="gut">Gut (Winterfest, dicke Wände)</option>
                <option value="mittel">Mittel (Standard-Wohnwagen)</option>
                <option value="schlecht">Schlecht (Älteres Modell, dünn)</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Heizstunden pro Tag: <strong>{heizstunden}h</strong>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={24}
                  value={heizstunden}
                  onChange={(e) => setHeizstunden(parseInt(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-300 accent-primary-600"
                />
                <span className="w-12 text-right text-sm font-medium text-gray-700">
                  {heizstunden}h
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setKochen(!kochen)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  kochen ? "bg-primary-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                    kochen ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <label className="text-sm font-medium text-gray-700">
                Kochen auf Gas (~250g/Tag)
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setWarmwasser(!warmwasser)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  warmwasser ? "bg-primary-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                    warmwasser ? "translate-x-5" : "translate-x-0"
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

      {/* Temperatur-Warnung */}
      {temperatur <= 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
          <p className="text-sm text-yellow-800">
            <strong>Hinweis:</strong> Butan verdampft unter 0°C nicht mehr.
            Nutze im Winter ausschließlich <strong>Propangas</strong>.
            {temperatur <= -10 && (
              <> Bei extremer Kälte unter -10°C kann auch die Gasanlage
              einfrieren — halte den Gaskasten wenn möglich frostfrei.</>
            )}
          </p>
        </div>
      )}

      {/* Ergebnis */}
      <div className="rounded-lg border-2 border-primary-600 bg-primary-50 p-6">
        <h3 className="mb-4 text-lg font-bold text-gray-900">Ergebnis</h3>

        <div className="mb-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Gasvorrat
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {anzahl * flasche.gas} kg
            </p>
            <p className="text-xs text-gray-500">
              {anzahl}× {flasche.label}
            </p>
          </div>

          <div className="rounded-lg bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Tagesverbrauch
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {tagesverbrauchGesamt > 0
                ? `${tagesverbrauchGesamt.toLocaleString("de-DE")} g`
                : "\u2013"}
            </p>
            <p className="text-xs text-gray-500">bei {temperatur}°C</p>
          </div>

          <div className="rounded-lg bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Reichweite
            </p>
            <p className="mt-1 text-2xl font-bold text-primary-700">
              {tagesverbrauchGesamt > 0 ? `${reichweite} Tage` : "\u2013"}
            </p>
            <p className="text-xs text-gray-500">
              ~{kostenProTag} €/Tag
            </p>
          </div>
        </div>

        {/* Fortschrittsbalken */}
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
                Sehr geringe Reichweite! Plane einen Flaschentausch ein oder reduziere
                die Heizleistung. Tipp: Nachts Temperatur senken und gut zudecken.
              </p>
            )}
          </div>
        )}

        {/* Aufschlüsselung */}
        {tagesverbrauchGesamt > 0 && (
          <div className="mt-4 rounded-md bg-white/60 p-3">
            <p className="text-xs text-gray-600">
              <strong>Aufschlüsselung Tagesverbrauch:</strong>{" "}
              Heizung {tagesverbrauchHeizung.toLocaleString("de-DE")}g
              ({heizstunden}h bei {temperatur}°C, Isolierung {isolierung})
              {tagesverbrauchKochen > 0 && ` + Kochen ${tagesverbrauchKochen}g`}
              {tagesverbrauchWarmwasser > 0 && ` + Warmwasser ${tagesverbrauchWarmwasser}g`}
              {" = "}
              <strong>{tagesverbrauchGesamt.toLocaleString("de-DE")}g/Tag</strong>
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Geschätzte Kosten pro Füllung: ~{gesamtKosten} € ({anzahl}× {isAlugas ? "Alugas" : "Stahl"})
            </p>
          </div>
        )}
      </div>

      {/* Affiliate-Bereich */}
      {affiliateLinks.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
            Anzeige
          </p>
          <h3 className="mb-3 text-sm font-semibold text-gray-800">
            Alugas-Flaschen kaufen
          </h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {affiliateLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="nofollow sponsored noopener"
                className="rounded-lg border border-gray-200 p-3 text-center transition hover:border-primary-600 hover:shadow-sm"
              >
                <p className="font-medium text-gray-900">{link.name}</p>
                <p className="mt-1 text-xs text-gray-500">{link.info}</p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
