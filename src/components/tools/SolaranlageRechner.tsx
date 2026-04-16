"use client";

import { useState } from "react";

type Reisezeit = {
  label: string;
  peakSunHours: number;
};

const reisezeiten: Record<string, Reisezeit> = {
  sommer: { label: "Sommer (Mai–August)", peakSunHours: 5 },
  uebergang: { label: "Übergangszeit (März/April, Sept/Okt)", peakSunHours: 3.5 },
  winter: { label: "Winter (Nov–Februar)", peakSunHours: 2 },
};

const verbrauchPresets = [
  { label: "Minimal (Licht, Handy)", wh: 200 },
  { label: "Normal (Licht, Kühlbox, Handy, Pumpe)", wh: 500 },
  { label: "Komfort (TV, Laptop, Kühlschrank, Licht)", wh: 1000 },
  { label: "Individuell eingeben", wh: 0 },
];

function formatNumber(n: number, decimals = 0): string {
  return n.toLocaleString("de-DE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function SolaranlageRechner() {
  const [preset, setPreset] = useState<number>(1);
  const [customWh, setCustomWh] = useState<string>("500");
  const [reisezeit, setReisezeit] = useState<string>("sommer");
  const [pufferFaktor, setPufferFaktor] = useState<number>(1.5);

  const tagesverbrauch =
    preset < 3 ? verbrauchPresets[preset].wh : parseFloat(customWh) || 0;

  const peakSun = reisezeiten[reisezeit]?.peakSunHours || 5;

  // Benötigte Panelleistung: Verbrauch * Puffer / Sonnenstunden
  const benoetigteWp =
    peakSun > 0 ? Math.ceil((tagesverbrauch * pufferFaktor) / peakSun) : 0;

  // Batteriegröße: Verbrauch * Puffer / 12V, nur 50% Entladetiefe bei Blei, 80% bei LiFePO4
  const batterieBrutto = tagesverbrauch * pufferFaktor;
  const batterieAhBlei = Math.ceil(batterieBrutto / 12 / 0.5);
  const batterieAhLithium = Math.ceil(batterieBrutto / 12 / 0.8);

  // Panelanzahl
  const panels100 = Math.ceil(benoetigteWp / 100);
  const panels200 = Math.ceil(benoetigteWp / 200);

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="space-y-6">
      {/* Verbrauch */}
      <div>
        <label className={labelClass}>Täglicher Stromverbrauch</label>
        <div className="grid gap-2 sm:grid-cols-2">
          {verbrauchPresets.map((p, i) => (
            <label
              key={i}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition ${
                preset === i
                  ? "border-primary-600 bg-primary-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="verbrauch"
                checked={preset === i}
                onChange={() => setPreset(i)}
                className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-600"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">
                  {p.label}
                </span>
                {p.wh > 0 && (
                  <span className="ml-1 text-xs text-gray-500">
                    ({formatNumber(p.wh)} Wh/Tag)
                  </span>
                )}
              </div>
            </label>
          ))}
        </div>
        {preset === 3 && (
          <div className="mt-3">
            <label className={labelClass}>Verbrauch in Wh/Tag</label>
            <input
              type="number"
              value={customWh}
              onChange={(e) => setCustomWh(e.target.value)}
              placeholder="z.B. 750"
              min={0}
              max={5000}
              className={inputClass}
            />
          </div>
        )}
      </div>

      {/* Reisezeit */}
      <div>
        <label className={labelClass}>Reisezeit</label>
        <select
          value={reisezeit}
          onChange={(e) => setReisezeit(e.target.value)}
          className={inputClass}
        >
          {Object.entries(reisezeiten).map(([key, rz]) => (
            <option key={key} value={key}>
              {rz.label} – ca. {formatNumber(rz.peakSunHours, 1)}{" "}
              Sonnenstunden/Tag
            </option>
          ))}
        </select>
      </div>

      {/* Pufferfaktor */}
      <div>
        <label className={labelClass}>
          Pufferfaktor (Schlechtwetter-Reserve)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1.2}
            max={2.0}
            step={0.1}
            value={pufferFaktor}
            onChange={(e) => setPufferFaktor(parseFloat(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-300 accent-primary-600"
          />
          <span className="w-16 text-right text-sm font-medium text-gray-700">
            {formatNumber(pufferFaktor, 1)}x
          </span>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          1,2x = wenig Reserve, 2,0x = viel Reserve für bewölkte Tage
        </p>
      </div>

      {/* Ergebnis */}
      <div className="rounded-lg border-2 border-primary-600 bg-primary-50 p-6">
        <h3 className="mb-4 text-lg font-bold text-gray-900">Ergebnis</h3>

        {tagesverbrauch > 0 ? (
          <>
            <div className="mb-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-white p-4 text-center shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Tagesverbrauch
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {formatNumber(tagesverbrauch)} Wh
                </p>
                <p className="text-xs text-gray-500">
                  mit Puffer: {formatNumber(tagesverbrauch * pufferFaktor)} Wh
                </p>
              </div>

              <div className="rounded-lg bg-white p-4 text-center shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Benötigte Panelleistung
                </p>
                <p className="mt-1 text-2xl font-bold text-primary-700">
                  {formatNumber(benoetigteWp)} Wp
                </p>
                <p className="text-xs text-gray-500">
                  bei {formatNumber(peakSun, 1)}h Sonne/Tag
                </p>
              </div>

              <div className="rounded-lg bg-white p-4 text-center shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Batteriekapazität
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {formatNumber(batterieAhLithium)} Ah
                </p>
                <p className="text-xs text-gray-500">LiFePO4 (80% DoD)</p>
              </div>
            </div>

            {/* Paneloptionen */}
            <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
              <h4 className="mb-2 text-sm font-semibold text-gray-800">
                Panel-Empfehlung
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border border-gray-200 p-3">
                  <p className="text-sm font-medium text-gray-900">
                    100-Watt-Panels
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {panels100} Stück
                  </p>
                  <p className="text-xs text-gray-500">
                    = {formatNumber(panels100 * 100)} Wp Gesamtleistung
                  </p>
                </div>
                <div className="rounded-md border border-gray-200 p-3">
                  <p className="text-sm font-medium text-gray-900">
                    200-Watt-Panels
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {panels200} Stück
                  </p>
                  <p className="text-xs text-gray-500">
                    = {formatNumber(panels200 * 200)} Wp Gesamtleistung
                  </p>
                </div>
              </div>
            </div>

            {/* Batterievergleich */}
            <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
              <h4 className="mb-2 text-sm font-semibold text-gray-800">
                Batterie-Vergleich
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border border-gray-200 p-3">
                  <p className="text-sm font-medium text-gray-900">
                    AGM/Gel-Batterie
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatNumber(batterieAhBlei)} Ah
                  </p>
                  <p className="text-xs text-gray-500">
                    bei 50% Entladetiefe, schwerer, günstiger
                  </p>
                </div>
                <div className="rounded-md border-2 border-primary-300 bg-primary-50 p-3">
                  <p className="text-sm font-medium text-gray-900">
                    LiFePO4-Batterie
                  </p>
                  <p className="text-lg font-bold text-primary-700">
                    {formatNumber(batterieAhLithium)} Ah
                  </p>
                  <p className="text-xs text-gray-500">
                    bei 80% Entladetiefe, leichter, langlebiger
                  </p>
                </div>
              </div>
            </div>

            {/* Tipps */}
            <div className="rounded-md bg-white/60 p-3">
              <h4 className="mb-1 text-sm font-semibold text-gray-700">
                Tipps zur Montage
              </h4>
              <ul className="space-y-1 text-xs text-gray-600">
                <li>
                  &#8226; Panels möglichst flach auf dem Dach montieren, um
                  Windwiderstand zu minimieren
                </li>
                <li>
                  &#8226; Aufständerung bringt 10–20 % mehr Ertrag, erhöht
                  aber die Windangriffsfläche
                </li>
                <li>
                  &#8226; MPPT-Laderegler sind effizienter als PWM-Regler
                  (ca. 20–30 % mehr Ertrag)
                </li>
                <li>
                  &#8226; Teilschatten auf einem Panel reduziert die Leistung
                  überproportional – Bypass-Dioden helfen
                </li>
                <li>
                  &#8226; Kabelquerschnitte ausreichend dimensionieren, um
                  Leitungsverluste zu minimieren
                </li>
              </ul>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500">
            Gib deinen täglichen Stromverbrauch ein, um die Berechnung zu
            starten.
          </p>
        )}
      </div>

      {/* Info */}
      <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
        <p>
          Die Berechnung basiert auf durchschnittlichen Sonnenstunden in
          Mitteleuropa. In Südeuropa kann der Ertrag deutlich höher sein. Der
          Pufferfaktor berücksichtigt Schlechtwetterperioden und
          Systemverluste (Laderegler, Kabel, Batterie-Wirkungsgrad).
        </p>
      </div>
    </div>
  );
}
