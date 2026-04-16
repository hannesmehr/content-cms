"use client";

import { useState } from "react";

type Geraet = {
  name: string;
  watt: number;
  stundenProTag: number;
  aktiv: boolean;
};

const standardGeraete: Geraet[] = [
  { name: "LED-Beleuchtung", watt: 5, stundenProTag: 5, aktiv: true },
  { name: "Kühlschrank 12V (Absorber)", watt: 45, stundenProTag: 12, aktiv: true },
  { name: "Wasserpumpe", watt: 30, stundenProTag: 0.5, aktiv: true },
  { name: "Handy laden", watt: 10, stundenProTag: 2, aktiv: true },
  { name: "TV / Monitor", watt: 40, stundenProTag: 2, aktiv: false },
  { name: "Laptop laden", watt: 60, stundenProTag: 3, aktiv: false },
  { name: "Heizgebläse (Truma)", watt: 20, stundenProTag: 6, aktiv: false },
  { name: "Kompressorkühlbox", watt: 50, stundenProTag: 8, aktiv: false },
];

const batterieGroessen = [50, 100, 150, 200];

function formatNumber(n: number, decimals = 0): string {
  return n.toLocaleString("de-DE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function StromverbrauchRechner() {
  const [geraete, setGeraete] = useState<Geraet[]>(
    standardGeraete.map((g) => ({ ...g }))
  );
  const [customName, setCustomName] = useState("");
  const [customWatt, setCustomWatt] = useState("");
  const [customStunden, setCustomStunden] = useState("");

  const toggleGeraet = (index: number) => {
    setGeraete((prev) =>
      prev.map((g, i) =>
        i === index ? { ...g, aktiv: !g.aktiv } : g
      )
    );
  };

  const updateWatt = (index: number, watt: number) => {
    setGeraete((prev) =>
      prev.map((g, i) => (i === index ? { ...g, watt } : g))
    );
  };

  const updateStunden = (index: number, stundenProTag: number) => {
    setGeraete((prev) =>
      prev.map((g, i) => (i === index ? { ...g, stundenProTag } : g))
    );
  };

  const addCustom = () => {
    const watt = parseFloat(customWatt);
    const stunden = parseFloat(customStunden);
    if (customName && watt > 0 && stunden > 0) {
      setGeraete((prev) => [
        ...prev,
        { name: customName, watt, stundenProTag: stunden, aktiv: true },
      ]);
      setCustomName("");
      setCustomWatt("");
      setCustomStunden("");
    }
  };

  const removeGeraet = (index: number) => {
    setGeraete((prev) => prev.filter((_, i) => i !== index));
  };

  const aktiveGeraete = geraete.filter((g) => g.aktiv);
  const tagesverbrauchWh = aktiveGeraete.reduce(
    (sum, g) => sum + g.watt * g.stundenProTag,
    0
  );
  const tagesverbrauchAh = tagesverbrauchWh / 12;
  const gesamtWattGleichzeitig = aktiveGeraete.reduce(
    (sum, g) => sum + g.watt,
    0
  );

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="space-y-6">
      {/* Geräteliste */}
      <div>
        <label className={labelClass}>Verbraucher auswählen und anpassen</label>
        <div className="space-y-2">
          {geraete.map((geraet, index) => (
            <div
              key={index}
              className={`flex flex-wrap items-center gap-3 rounded-lg border p-3 transition ${
                geraet.aktiv
                  ? "border-primary-300 bg-primary-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={geraet.aktiv}
                  onChange={() => toggleGeraet(index)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                />
                <span
                  className={`text-sm font-medium ${
                    geraet.aktiv ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {geraet.name}
                </span>
              </label>

              {geraet.aktiv && (
                <div className="ml-auto flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={geraet.watt}
                      onChange={(e) =>
                        updateWatt(index, parseFloat(e.target.value) || 0)
                      }
                      className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                      min={0}
                    />
                    <span className="text-xs text-gray-500">W</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={geraet.stundenProTag}
                      onChange={(e) =>
                        updateStunden(
                          index,
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                      min={0}
                      max={24}
                      step={0.5}
                    />
                    <span className="text-xs text-gray-500">h/Tag</span>
                  </div>
                  {index >= standardGeraete.length && (
                    <button
                      type="button"
                      onClick={() => removeGeraet(index)}
                      className="ml-1 text-xs text-red-500 hover:text-red-700"
                      title="Entfernen"
                    >
                      &#10005;
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Eigenes Gerät hinzufügen */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-800">
          Eigenes Gerät hinzufügen
        </h3>
        <div className="grid gap-3 sm:grid-cols-4">
          <div>
            <label className={labelClass}>Name</label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="z.B. Ventilator"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Leistung (W)</label>
            <input
              type="number"
              value={customWatt}
              onChange={(e) => setCustomWatt(e.target.value)}
              placeholder="z.B. 25"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Stunden/Tag</label>
            <input
              type="number"
              value={customStunden}
              onChange={(e) => setCustomStunden(e.target.value)}
              placeholder="z.B. 4"
              step={0.5}
              className={inputClass}
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={addCustom}
              className="w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700"
            >
              Hinzufügen
            </button>
          </div>
        </div>
      </div>

      {/* Ergebnis */}
      <div className="rounded-lg border-2 border-primary-600 bg-primary-50 p-6">
        <h3 className="mb-4 text-lg font-bold text-gray-900">Ergebnis</h3>

        {aktiveGeraete.length > 0 ? (
          <>
            <div className="mb-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-white p-4 text-center shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Tagesverbrauch
                </p>
                <p className="mt-1 text-2xl font-bold text-primary-700">
                  {formatNumber(tagesverbrauchWh)} Wh
                </p>
                <p className="text-xs text-gray-500">
                  = {formatNumber(tagesverbrauchAh, 1)} Ah bei 12V
                </p>
              </div>

              <div className="rounded-lg bg-white p-4 text-center shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Gleichzeitige Leistung
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {formatNumber(gesamtWattGleichzeitig)} W
                </p>
                <p className="text-xs text-gray-500">alle Geräte zusammen</p>
              </div>

              <div className="rounded-lg bg-white p-4 text-center shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Aktive Geräte
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {aktiveGeraete.length}
                </p>
                <p className="text-xs text-gray-500">von {geraete.length}</p>
              </div>
            </div>

            {/* Aufschlüsselung */}
            <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
              <h4 className="mb-2 text-sm font-semibold text-gray-800">
                Aufschlüsselung pro Gerät
              </h4>
              <div className="space-y-2">
                {aktiveGeraete
                  .sort(
                    (a, b) =>
                      b.watt * b.stundenProTag - a.watt * a.stundenProTag
                  )
                  .map((g, i) => {
                    const whTag = g.watt * g.stundenProTag;
                    const percent =
                      tagesverbrauchWh > 0
                        ? (whTag / tagesverbrauchWh) * 100
                        : 0;
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{g.name}</span>
                          <span className="font-medium text-gray-900">
                            {formatNumber(whTag)} Wh ({formatNumber(percent)}%)
                          </span>
                        </div>
                        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-primary-500 transition-all"
                            style={{
                              width: `${Math.max(percent, 1)}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Batterie-Reichweite */}
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <h4 className="mb-2 text-sm font-semibold text-gray-800">
                Batterie-Reichweite (LiFePO4, 80% DoD)
              </h4>
              <div className="grid gap-3 sm:grid-cols-4">
                {batterieGroessen.map((ah) => {
                  const nutzbar = ah * 0.8 * 12; // nutzbare Wh
                  const tage =
                    tagesverbrauchWh > 0 ? nutzbar / tagesverbrauchWh : 0;
                  return (
                    <div
                      key={ah}
                      className="rounded-md border border-gray-200 p-3 text-center"
                    >
                      <p className="text-sm font-medium text-gray-700">
                        {ah} Ah
                      </p>
                      <p className="text-xl font-bold text-primary-700">
                        {formatNumber(tage, 1)}
                      </p>
                      <p className="text-xs text-gray-500">Tage</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Wechselrichter-Hinweis */}
            {gesamtWattGleichzeitig > 0 && (
              <div className="mt-4 rounded-md bg-white/60 p-3">
                <p className="text-xs text-gray-600">
                  <strong>Wechselrichter-Hinweis:</strong> Wenn du alle aktiven
                  Geräte gleichzeitig über einen 230V-Wechselrichter betreiben
                  möchten, benötigst du mindestens{" "}
                  <strong>
                    {formatNumber(
                      Math.ceil(gesamtWattGleichzeitig * 1.2 / 100) * 100
                    )}{" "}
                    W
                  </strong>{" "}
                  Dauerleistung (inkl. 20% Sicherheitsmarge). Beachten Sie, dass
                  manche Geräte hohe Anlaufströme haben.
                </p>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-500">
            Aktiviere mindestens ein Gerät, um den Verbrauch zu berechnen.
          </p>
        )}
      </div>

      {/* Info */}
      <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
        <p>
          Die Watt-Angaben sind typische Durchschnittswerte. Der tatsächliche
          Verbrauch kann je nach Gerät und Betriebsmodus abweichen. Kühlgeräte
          laufen nicht durchgehend auf Volllast – der angegebene Wert ist ein
          Mittelwert inkl. Kompressor-Pausen.
        </p>
      </div>
    </div>
  );
}
