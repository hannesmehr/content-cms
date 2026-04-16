"use client";

import { useState } from "react";

interface Material {
  name: string;
  lambda: number;
}

interface Schicht {
  materialIdx: number;
  dicke: number; // mm
}

const materialien: Material[] = [
  { name: "Beton", lambda: 2.1 },
  { name: "Mauerwerk Ziegel (Vollziegel)", lambda: 0.96 },
  { name: "Mauerwerk Ziegel (Hochlochziegel)", lambda: 0.5 },
  { name: "Porenbeton (600 kg/m³)", lambda: 0.21 },
  { name: "Porenbeton (400 kg/m³)", lambda: 0.12 },
  { name: "Holz (Nadelholz)", lambda: 0.13 },
  { name: "EPS Dämmung (032)", lambda: 0.032 },
  { name: "EPS Dämmung (040)", lambda: 0.04 },
  { name: "Mineralwolle (035)", lambda: 0.035 },
  { name: "XPS Dämmung (030)", lambda: 0.03 },
  { name: "XPS Dämmung (040)", lambda: 0.04 },
  { name: "PUR/PIR Dämmung", lambda: 0.024 },
  { name: "Gipskartonplatte", lambda: 0.25 },
  { name: "Innenputz (Kalk-Gips)", lambda: 0.51 },
  { name: "Außenputz (Kalk-Zement)", lambda: 0.87 },
];

type Bauteil = "aussenwand" | "dach" | "kellerdecke";

const gegGrenzwerte: Record<Bauteil, { label: string; maxU: number }> = {
  aussenwand: { label: "Außenwand", maxU: 0.24 },
  dach: { label: "Dach / oberste Geschossdecke", maxU: 0.24 },
  kellerdecke: { label: "Kellerdecke / Bodenplatte", maxU: 0.3 },
};

export function UWertRechner() {
  const [schichten, setSchichten] = useState<Schicht[]>([
    { materialIdx: 14, dicke: 15 }, // Außenputz
    { materialIdx: 2, dicke: 240 }, // Hochlochziegel
    { materialIdx: 8, dicke: 120 }, // Mineralwolle
    { materialIdx: 13, dicke: 10 }, // Innenputz
  ]);
  const [bauteil, setBauteil] = useState<Bauteil>("aussenwand");

  const Rsi = 0.13; // Innerer Wärmeübergangswiderstand
  const Rse = 0.04; // Äußerer Wärmeübergangswiderstand

  const formatNum = (val: number, digits: number = 3) =>
    val.toLocaleString("de-DE", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });

  const addSchicht = () => {
    setSchichten([...schichten, { materialIdx: 0, dicke: 100 }]);
  };

  const removeSchicht = (idx: number) => {
    if (schichten.length > 1) {
      setSchichten(schichten.filter((_, i) => i !== idx));
    }
  };

  const updateSchicht = (idx: number, field: keyof Schicht, value: number) => {
    const next = [...schichten];
    next[idx] = { ...next[idx], [field]: value };
    setSchichten(next);
  };

  // Berechnung
  const schichtDetails = schichten.map((s) => {
    const mat = materialien[s.materialIdx];
    const dMeter = s.dicke / 1000;
    const R = dMeter / mat.lambda;
    return { ...s, material: mat, dMeter, R };
  });

  const sumR = schichtDetails.reduce((sum, s) => sum + s.R, 0);
  const Rtotal = Rsi + sumR + Rse;
  const uWert = 1 / Rtotal;

  const grenzwert = gegGrenzwerte[bauteil];
  const erfuellt = uWert <= grenzwert.maxU;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bauteil (für GEG-Prüfung)
        </label>
        <select
          value={bauteil}
          onChange={(e) => setBauteil(e.target.value as Bauteil)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600 sm:w-auto"
        >
          {Object.entries(gegGrenzwerte).map(([key, val]) => (
            <option key={key} value={key}>
              {val.label} (max. {formatNum(val.maxU, 2)} W/m²K)
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">
            Wandaufbau (von außen nach innen)
          </h3>
          <button
            onClick={addSchicht}
            className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 transition-colors"
          >
            + Schicht hinzufügen
          </button>
        </div>

        <div className="space-y-3">
          {schichten.map((s, idx) => (
            <div
              key={idx}
              className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-3"
            >
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Schicht {idx + 1}: Material
                </label>
                <select
                  value={s.materialIdx}
                  onChange={(e) => updateSchicht(idx, "materialIdx", Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                >
                  {materialien.map((m, i) => (
                    <option key={i} value={i}>
                      {m.name} (λ = {formatNum(m.lambda, 3)} W/mK)
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-28">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Dicke (mm)
                </label>
                <input
                  type="number"
                  min={1}
                  value={s.dicke}
                  onChange={(e) =>
                    updateSchicht(idx, "dicke", Math.max(1, Number(e.target.value)))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                />
              </div>
              <button
                onClick={() => removeSchicht(idx)}
                disabled={schichten.length <= 1}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 transition-colors"
              >
                Entfernen
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Visualisierung des Wandaufbaus */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h4 className="mb-2 text-sm font-semibold text-gray-800">Wandaufbau-Visualisierung</h4>
        <div className="flex h-20 w-full overflow-hidden rounded-lg border border-gray-300">
          {schichtDetails.map((s, idx) => {
            const totalDicke = schichtDetails.reduce((sum, x) => sum + x.dMeter, 0);
            const percent = totalDicke > 0 ? (s.dMeter / totalDicke) * 100 : 0;
            // Farbe basierend auf Lambda-Wert (niedrig = gut = grün, hoch = rot)
            const hue = Math.max(0, Math.min(120, (1 - Math.min(s.material.lambda / 2.5, 1)) * 120));
            return (
              <div
                key={idx}
                className="flex items-center justify-center border-r border-gray-300 last:border-r-0 text-xs font-medium text-white"
                style={{
                  width: `${Math.max(percent, 3)}%`,
                  backgroundColor: `hsl(${hue}, 70%, 45%)`,
                }}
                title={`${s.material.name}: ${s.dicke} mm`}
              >
                {percent > 12 ? `${s.dicke}mm` : ""}
              </div>
            );
          })}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Grün = gute Dämmwirkung (niedriger λ-Wert), Rot = geringe Dämmwirkung
        </p>
      </div>

      {/* Ergebnis */}
      <div className="rounded-lg border-2 border-primary-600 bg-primary-50 p-6">
        <h3 className="mb-4 text-lg font-bold text-gray-900">Berechnungsergebnis</h3>

        {/* Detailtabelle */}
        <div className="mb-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-300 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="py-2 pr-3">Schicht</th>
                <th className="py-2 pr-3">Material</th>
                <th className="py-2 pr-3 text-right">Dicke</th>
                <th className="py-2 pr-3 text-right">λ (W/mK)</th>
                <th className="py-2 text-right">R (m²K/W)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 text-gray-500">
                <td className="py-1.5 pr-3">—</td>
                <td className="py-1.5 pr-3">Rsi (Innenübergang)</td>
                <td className="py-1.5 pr-3 text-right">—</td>
                <td className="py-1.5 pr-3 text-right">—</td>
                <td className="py-1.5 text-right">{formatNum(Rsi)}</td>
              </tr>
              {schichtDetails.map((s, idx) => (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="py-1.5 pr-3 text-gray-700">{idx + 1}</td>
                  <td className="py-1.5 pr-3 text-gray-700">{s.material.name}</td>
                  <td className="py-1.5 pr-3 text-right text-gray-700">{s.dicke} mm</td>
                  <td className="py-1.5 pr-3 text-right text-gray-700">
                    {formatNum(s.material.lambda)}
                  </td>
                  <td className="py-1.5 text-right font-medium text-gray-900">
                    {formatNum(s.R)}
                  </td>
                </tr>
              ))}
              <tr className="border-b border-gray-200 text-gray-500">
                <td className="py-1.5 pr-3">—</td>
                <td className="py-1.5 pr-3">Rse (Außenübergang)</td>
                <td className="py-1.5 pr-3 text-right">—</td>
                <td className="py-1.5 pr-3 text-right">—</td>
                <td className="py-1.5 text-right">{formatNum(Rse)}</td>
              </tr>
              <tr className="font-bold">
                <td className="py-2 pr-3" colSpan={4}>
                  R gesamt
                </td>
                <td className="py-2 text-right">{formatNum(Rtotal)} m²K/W</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">U-Wert</p>
            <p
              className={`mt-1 text-3xl font-bold ${
                erfuellt ? "text-green-700" : "text-red-700"
              }`}
            >
              {formatNum(uWert)}
            </p>
            <p className="text-xs text-gray-500">W/m²K</p>
          </div>

          <div className="rounded-lg bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              GEG-Grenzwert ({grenzwert.label})
            </p>
            <p className="mt-1 text-3xl font-bold text-gray-700">{formatNum(grenzwert.maxU, 2)}</p>
            <p className="text-xs text-gray-500">W/m²K (max.)</p>
          </div>

          <div className="rounded-lg bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              GEG-Anforderung
            </p>
            <p
              className={`mt-1 text-2xl font-bold ${
                erfuellt ? "text-green-700" : "text-red-700"
              }`}
            >
              {erfuellt ? "Erfüllt ✓" : "Nicht erfüllt ✗"}
            </p>
            <p className="text-xs text-gray-500">
              {erfuellt
                ? `${formatNum(((grenzwert.maxU - uWert) / grenzwert.maxU) * 100, 0)}% besser als Grenzwert`
                : `${formatNum(((uWert - grenzwert.maxU) / grenzwert.maxU) * 100, 0)}% über Grenzwert`}
            </p>
          </div>
        </div>

        {/* Balken-Vergleich */}
        <div className="mt-4">
          <div className="mb-1 text-xs text-gray-600">
            U-Wert im Vergleich zum GEG-Grenzwert
          </div>
          <div className="relative h-8 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                erfuellt ? "bg-green-500" : "bg-red-500"
              }`}
              style={{
                width: `${Math.min((uWert / (grenzwert.maxU * 2)) * 100, 100)}%`,
              }}
            />
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-gray-800"
              style={{
                left: `${(grenzwert.maxU / (grenzwert.maxU * 2)) * 100}%`,
              }}
              title={`GEG-Grenzwert: ${formatNum(grenzwert.maxU, 2)}`}
            />
          </div>
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>0 W/m²K (besser)</span>
            <span>|← GEG-Grenzwert</span>
            <span>{formatNum(grenzwert.maxU * 2, 2)} W/m²K (schlechter)</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
        <strong>Formel:</strong> U = 1 / (R<sub>si</sub> + ΣR + R<sub>se</sub>), wobei R = d / λ.
        R<sub>si</sub> = 0,13 m²K/W (innen), R<sub>se</sub> = 0,04 m²K/W (außen). Grenzwerte
        gemäß GEG (Gebäudeenergiegesetz). Wärmebrücken sind in dieser vereinfachten Berechnung
        nicht berücksichtigt.
      </div>
    </div>
  );
}
