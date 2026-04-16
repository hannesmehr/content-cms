"use client";

import { useState } from "react";

const tankGroessen = [30, 45, 60, 80, 100];

function formatNumber(n: number, decimals = 0): string {
  return n.toLocaleString("de-DE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function FrischwasserRechner() {
  const [tankGroesse, setTankGroesse] = useState<number>(60);
  const [customTank, setCustomTank] = useState<string>("");
  const [useCustomTank, setUseCustomTank] = useState(false);
  const [personen, setPersonen] = useState<number>(2);
  const [duschen, setDuschen] = useState(true);
  const [duschenProTag, setDuschenProTag] = useState<number>(1);
  const [kochen, setKochen] = useState(true);
  const [abwaschen, setAbwaschen] = useState(true);
  const [trinken, setTrinken] = useState(true);
  const [haendeWaschen, setHaendeWaschen] = useState(true);

  const tank = useCustomTank ? parseFloat(customTank) || 0 : tankGroesse;

  // Verbrauch pro Tag
  const verbrauchDuschen = duschen ? duschenProTag * personen * 25 : 0;
  const verbrauchKochen = kochen ? 3 : 0;
  const verbrauchAbwaschen = abwaschen ? 8 : 0;
  const verbrauchTrinken = trinken ? personen * 2 : 0;
  const verbrauchHaende = haendeWaschen ? personen * 3 : 0;

  const tagesverbrauch =
    verbrauchDuschen +
    verbrauchKochen +
    verbrauchAbwaschen +
    verbrauchTrinken +
    verbrauchHaende;

  const reichweiteTage =
    tagesverbrauch > 0 ? tank / tagesverbrauch : 0;

  const barMaxDays = 7;
  const barPercent = Math.min((reichweiteTage / barMaxDays) * 100, 100);

  const getBarColor = () => {
    if (reichweiteTage < 1) return "bg-red-500";
    if (reichweiteTage < 2) return "bg-yellow-500";
    return "bg-green-500";
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  const ToggleSwitch = ({
    checked,
    onChange,
    label,
    detail,
  }: {
    checked: boolean;
    onChange: () => void;
    label: string;
    detail?: string;
  }) => (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
          checked ? "bg-primary-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
      <div>
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {detail && <p className="text-xs text-gray-500">{detail}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tankgröße */}
      <div>
        <label className={labelClass}>Tankgröße</label>
        {!useCustomTank ? (
          <div className="flex flex-wrap gap-2">
            {tankGroessen.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setTankGroesse(size)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  tankGroesse === size
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {size} L
              </button>
            ))}
            <button
              type="button"
              onClick={() => setUseCustomTank(true)}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Andere...
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={customTank}
              onChange={(e) => setCustomTank(e.target.value)}
              placeholder="z.B. 70"
              className={inputClass}
              min={1}
              max={500}
            />
            <span className="text-sm text-gray-500">Liter</span>
            <button
              type="button"
              onClick={() => setUseCustomTank(false)}
              className="text-xs text-primary-600 hover:underline"
            >
              Vorauswahl
            </button>
          </div>
        )}
      </div>

      {/* Personen */}
      <div>
        <label className={labelClass}>Anzahl Personen</label>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPersonen(n)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                personen === n
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Verbrauch */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-800">
          Wasserverbrauch einstellen
        </h3>
        <div className="space-y-4">
          <div>
            <ToggleSwitch
              checked={duschen}
              onChange={() => setDuschen(!duschen)}
              label="Duschen"
              detail={`ca. 25 L pro Dusche × ${personen} Person${personen > 1 ? "en" : ""}`}
            />
            {duschen && (
              <div className="ml-13 mt-2 flex items-center gap-2 pl-12">
                <label className="text-xs text-gray-500">Duschen/Person/Tag:</label>
                <select
                  value={duschenProTag}
                  onChange={(e) => setDuschenProTag(parseInt(e.target.value))}
                  className="rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                >
                  <option value={0.5}>Jeden 2. Tag</option>
                  <option value={1}>1× täglich</option>
                  <option value={2}>2× täglich</option>
                </select>
              </div>
            )}
          </div>

          <ToggleSwitch
            checked={kochen}
            onChange={() => setKochen(!kochen)}
            label="Kochen"
            detail="ca. 3 L/Tag"
          />

          <ToggleSwitch
            checked={abwaschen}
            onChange={() => setAbwaschen(!abwaschen)}
            label="Abwaschen"
            detail="ca. 8 L/Tag"
          />

          <ToggleSwitch
            checked={trinken}
            onChange={() => setTrinken(!trinken)}
            label="Trinkwasser"
            detail={`ca. 2 L pro Person/Tag × ${personen}`}
          />

          <ToggleSwitch
            checked={haendeWaschen}
            onChange={() => setHaendeWaschen(!haendeWaschen)}
            label="Händewaschen & Zähneputzen"
            detail={`ca. 3 L pro Person/Tag × ${personen}`}
          />
        </div>
      </div>

      {/* Ergebnis */}
      <div className="rounded-lg border-2 border-primary-600 bg-primary-50 p-6">
        <h3 className="mb-4 text-lg font-bold text-gray-900">Ergebnis</h3>

        {tagesverbrauch > 0 ? (
          <>
            <div className="mb-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-white p-4 text-center shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Tankgröße
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {formatNumber(tank)} L
                </p>
              </div>

              <div className="rounded-lg bg-white p-4 text-center shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Tagesverbrauch
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {formatNumber(tagesverbrauch)} L
                </p>
                <p className="text-xs text-gray-500">
                  für {personen} Person{personen > 1 ? "en" : ""}
                </p>
              </div>

              <div className="rounded-lg bg-white p-4 text-center shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Reichweite
                </p>
                <p className="mt-1 text-2xl font-bold text-primary-700">
                  {formatNumber(reichweiteTage, 1)} Tage
                </p>
                <p className="text-xs text-gray-500">
                  bis der Tank leer ist
                </p>
              </div>
            </div>

            {/* Balken */}
            <div className="mb-4">
              <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
                <span>0 Tage</span>
                <span>{barMaxDays}+ Tage</span>
              </div>
              <div className="h-6 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`flex h-full items-center justify-end rounded-full px-2 text-xs font-bold text-white transition-all duration-500 ${getBarColor()}`}
                  style={{ width: `${Math.max(barPercent, 8)}%` }}
                >
                  {formatNumber(reichweiteTage, 1)}d
                </div>
              </div>
            </div>

            {/* Aufschlüsselung */}
            <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
              <h4 className="mb-2 text-sm font-semibold text-gray-800">
                Aufschlüsselung
              </h4>
              <div className="space-y-1 text-sm">
                {verbrauchDuschen > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duschen</span>
                    <span className="font-medium">
                      {formatNumber(verbrauchDuschen)} L/Tag
                    </span>
                  </div>
                )}
                {verbrauchKochen > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kochen</span>
                    <span className="font-medium">
                      {formatNumber(verbrauchKochen)} L/Tag
                    </span>
                  </div>
                )}
                {verbrauchAbwaschen > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Abwaschen</span>
                    <span className="font-medium">
                      {formatNumber(verbrauchAbwaschen)} L/Tag
                    </span>
                  </div>
                )}
                {verbrauchTrinken > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trinkwasser</span>
                    <span className="font-medium">
                      {formatNumber(verbrauchTrinken)} L/Tag
                    </span>
                  </div>
                )}
                {verbrauchHaende > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Händewaschen / Zähneputzen
                    </span>
                    <span className="font-medium">
                      {formatNumber(verbrauchHaende)} L/Tag
                    </span>
                  </div>
                )}
                <hr className="my-2 border-gray-300" />
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-900">Gesamt</span>
                  <span className="text-gray-900">
                    {formatNumber(tagesverbrauch)} L/Tag
                  </span>
                </div>
              </div>
            </div>

            {/* Tipps */}
            <div className="rounded-md bg-white/60 p-3">
              <h4 className="mb-1 text-sm font-semibold text-gray-700">
                Tipps zum Wassersparen
              </h4>
              <ul className="space-y-1 text-xs text-gray-600">
                <li>
                  &#8226; Sparduschkopf einbauen: reduziert den Verbrauch um
                  bis zu 50%
                </li>
                <li>
                  &#8226; Beim Einseifen und Zähneputzen Wasser abstellen
                </li>
                <li>
                  &#8226; Geschirr in einer Schüssel spülen statt unter
                  fließendem Wasser
                </li>
                <li>
                  &#8226; Trinkwasser separat in Flaschen kaufen, um den
                  Frischwassertank zu schonen
                </li>
                <li>
                  &#8226; Campingplatz-Sanitäranlagen nutzen, wenn verfügbar
                </li>
                <li>
                  &#8226; Regenwasser sammeln für Abwaschen (nur bei
                  Freistehern)
                </li>
              </ul>
            </div>

            {reichweiteTage < 1 && (
              <div className="mt-4 flex items-start gap-2 rounded-md bg-red-100 p-3">
                <span className="text-lg">&#9888;</span>
                <p className="text-sm font-medium text-red-800">
                  Ihr Tank reicht nicht einmal einen vollen Tag! Reduzieren Sie
                  den Verbrauch (z.B. seltener Duschen) oder planen Sie
                  häufigere Tankstopps ein.
                </p>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-500">
            Aktiviere mindestens einen Verbraucher, um die Reichweite zu
            berechnen.
          </p>
        )}
      </div>

      {/* Info */}
      <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
        <p>
          Die Verbrauchswerte sind Durchschnittswerte und können je nach
          Nutzungsverhalten variieren. Bei Wohnwagen mit Sparduschkopf kann der
          Duschverbrauch auf 10–15 L pro Dusche sinken. Warmwasser über den
          Boiler benötigt zusätzlich Energie (Gas oder Strom).
        </p>
      </div>
    </div>
  );
}
