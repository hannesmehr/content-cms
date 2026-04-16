"use client";

import { useState } from "react";

interface GasBottle {
  typ: "Keine" | "Stahl" | "Alugas";
  groesse: number;
}

function gasBottleWeight(bottle: GasBottle): number {
  if (bottle.typ === "Keine") return 0;
  const leer =
    bottle.typ === "Alugas"
      ? bottle.groesse <= 6
        ? 3
        : 6
      : bottle.groesse <= 5
        ? 12
        : 16;
  return bottle.groesse + leer;
}

function gasBottleSizes(typ: string): number[] {
  return typ === "Alugas" ? [6, 11] : [5, 11];
}

export function ZuladungsRechner() {
  const [gesamtgewicht, setGesamtgewicht] = useState<string>("");
  const [leergewicht, setLeergewicht] = useState<string>("");
  const [wasserTank, setWasserTank] = useState<string>("50");
  const [wasserProzent, setWasserProzent] = useState<number>(100);
  const [flasche1, setFlasche1] = useState<GasBottle>({
    typ: "Stahl",
    groesse: 11,
  });
  const [flasche2, setFlasche2] = useState<GasBottle>({
    typ: "Keine",
    groesse: 11,
  });
  const [erwachsene, setErwachsene] = useState<number>(2);
  const [kinder, setKinder] = useState<number>(0);

  const gesamtGewichtNum = parseFloat(gesamtgewicht) || 0;
  const leerGewichtNum = parseFloat(leergewicht) || 0;
  const wasserTankNum = parseFloat(wasserTank) || 0;
  const wasserGewicht = wasserTankNum * (wasserProzent / 100);
  const gas1Gewicht = gasBottleWeight(flasche1);
  const gas2Gewicht = gasBottleWeight(flasche2);
  const gasGewicht = gas1Gewicht + gas2Gewicht;
  const gepaeckGewicht = erwachsene * 20 + kinder * 10;

  const basisZuladung = gesamtGewichtNum - leerGewichtNum;
  const verbraucht = wasserGewicht + gasGewicht + gepaeckGewicht;
  const verbleibend = basisZuladung - verbraucht;

  const hasInput = gesamtgewicht !== "" && leergewicht !== "";

  const statusColor =
    verbleibend < 0 ? "red" : verbleibend <= 50 ? "yellow" : "green";

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600";
  const selectClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600";

  function updateBottle(
    setter: typeof setFlasche1,
    current: GasBottle,
    update: Partial<GasBottle>,
  ) {
    const next = { ...current, ...update };
    // Validate size for new type
    if (update.typ && update.typ !== "Keine") {
      const valid = gasBottleSizes(update.typ);
      if (!valid.includes(next.groesse)) {
        next.groesse = valid[valid.length - 1];
      }
    }
    setter(next);
  }

  return (
    <div className="space-y-6">
      {/* Gewichte */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Zulässiges Gesamtgewicht (kg)
          </label>
          <input
            type="number"
            value={gesamtgewicht}
            onChange={(e) => setGesamtgewicht(e.target.value)}
            placeholder="z.B. 1500"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Leergewicht (kg)
          </label>
          <input
            type="number"
            value={leergewicht}
            onChange={(e) => setLeergewicht(e.target.value)}
            placeholder="z.B. 1100"
            className={inputClass}
          />
        </div>
      </div>

      {/* Wasser */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-800">Wasser</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Tankgröße (Liter)
            </label>
            <input
              type="number"
              value={wasserTank}
              onChange={(e) => setWasserTank(e.target.value)}
              placeholder="50"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Füllstand: {wasserProzent} %
            </label>
            <input
              type="range"
              min={0}
              max={100}
              step={10}
              value={wasserProzent}
              onChange={(e) => setWasserProzent(parseInt(e.target.value))}
              className="mt-2 w-full accent-primary-600"
            />
            {wasserGewicht > 0 && (
              <p className="mt-1 text-xs text-gray-500">
                = {Math.round(wasserGewicht)} kg Wasser
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Gasflaschen */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-800">
          Gasflaschen
        </h3>
        <div className="space-y-4">
          <GasBottleEditor
            label="Flasche 1"
            bottle={flasche1}
            onChange={(update) => updateBottle(setFlasche1, flasche1, update)}
            selectClass={selectClass}
          />
          <hr className="border-gray-200" />
          <GasBottleEditor
            label="Flasche 2"
            bottle={flasche2}
            onChange={(update) => updateBottle(setFlasche2, flasche2, update)}
            selectClass={selectClass}
          />
          {gasGewicht > 0 && (
            <>
              <hr className="border-gray-200" />
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">Gesamt Gas</span>
                <span className="text-gray-500">
                  {Math.round(gasGewicht)} kg (inkl. Flaschen)
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Gepäck pro Person */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-800">
          Gepäck pro Person
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Erwachsene (à 20 kg)
            </label>
            <select
              value={erwachsene}
              onChange={(e) => setErwachsene(parseInt(e.target.value))}
              className={selectClass}
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Kinder (à 10 kg)
            </label>
            <select
              value={kinder}
              onChange={(e) => setKinder(parseInt(e.target.value))}
              className={selectClass}
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Kleidung, Bettwäsche und persönliche Gegenstände im Wohnwagen.
          Personen selbst fahren im Zugfahrzeug.
        </p>
        {gepaeckGewicht > 0 && (
          <p className="mt-1 text-xs text-gray-500">
            = {gepaeckGewicht} kg Gepäck
          </p>
        )}
      </div>

      {/* Ergebnis */}
      {hasInput && (
        <div
          className={`rounded-lg border-2 p-6 ${
            statusColor === "red"
              ? "border-red-500 bg-red-50"
              : statusColor === "yellow"
                ? "border-yellow-500 bg-yellow-50"
                : "border-green-500 bg-green-50"
          }`}
        >
          <h3 className="mb-4 text-lg font-bold text-gray-900">Ergebnis</h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Maximale Zuladung:</span>
              <span className="font-medium">{basisZuladung} kg</span>
            </div>
            {wasserGewicht > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">
                  − Wasser ({wasserProzent} %):
                </span>
                <span className="font-medium">
                  {Math.round(wasserGewicht)} kg
                </span>
              </div>
            )}
            {gas1Gewicht > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">
                  − Gas 1 ({flasche1.typ} {flasche1.groesse} kg):
                </span>
                <span className="font-medium">
                  {Math.round(gas1Gewicht)} kg
                </span>
              </div>
            )}
            {gas2Gewicht > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">
                  − Gas 2 ({flasche2.typ} {flasche2.groesse} kg):
                </span>
                <span className="font-medium">
                  {Math.round(gas2Gewicht)} kg
                </span>
              </div>
            )}
            {gepaeckGewicht > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">
                  − Gepäck ({erwachsene} Erw. + {kinder} Kind.):
                </span>
                <span className="font-medium">{gepaeckGewicht} kg</span>
              </div>
            )}
            <hr className="my-2 border-gray-300" />
            <div className="flex justify-between text-base">
              <span className="font-semibold text-gray-900">
                Verbleibend für Ausrüstung:
              </span>
              <span
                className={`text-xl font-bold ${
                  statusColor === "red"
                    ? "text-red-700"
                    : statusColor === "yellow"
                      ? "text-yellow-700"
                      : "text-green-700"
                }`}
              >
                {Math.round(verbleibend)} kg
              </span>
            </div>
          </div>

          {statusColor === "red" && (
            <div className="mt-4 flex items-start gap-2 rounded-md bg-red-100 p-3">
              <span className="text-lg">⚠</span>
              <p className="text-sm font-medium text-red-800">
                Achtung: Dein Wohnwagen ist überladen! Reduziere das Gewicht um
                mindestens {Math.abs(Math.round(verbleibend))} kg. Überladung
                ist nicht nur gefährlich, sondern auch bußgeldpflichtig.
              </p>
            </div>
          )}
          {statusColor === "yellow" && (
            <div className="mt-4 flex items-start gap-2 rounded-md bg-yellow-100 p-3">
              <span className="text-lg">⚠</span>
              <p className="text-sm font-medium text-yellow-800">
                Knapp! Du hast nur noch {Math.round(verbleibend)} kg für
                Ausrüstung zur Verfügung. Packe sparsam und wiege im Zweifel
                nach.
              </p>
            </div>
          )}
          {statusColor === "green" && (
            <div className="mt-4 flex items-start gap-2 rounded-md bg-green-100 p-3">
              <span className="text-lg">✓</span>
              <p className="text-sm font-medium text-green-800">
                Alles im grünen Bereich! Du hast ausreichend Reserve für deine
                Ausrüstung.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// MARK: - Gas Bottle Editor Component

function GasBottleEditor({
  label,
  bottle,
  onChange,
  selectClass,
}: {
  label: string;
  bottle: GasBottle;
  onChange: (update: Partial<GasBottle>) => void;
  selectClass: string;
}) {
  const sizes = gasBottleSizes(bottle.typ);
  const weight = gasBottleWeight(bottle);

  return (
    <div className="space-y-2">
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            {label}
          </label>
          <select
            value={bottle.typ}
            onChange={(e) =>
              onChange({ typ: e.target.value as GasBottle["typ"] })
            }
            className={selectClass}
          >
            <option value="Keine">Keine Gasflasche</option>
            <option value="Stahl">Stahl</option>
            <option value="Alugas">Alugas</option>
          </select>
        </div>
        {bottle.typ !== "Keine" && (
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Größe
            </label>
            <div className="flex gap-1">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onChange({ groesse: size })}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    bottle.groesse === size
                      ? "border-primary-600 bg-primary-50 text-primary-700"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {size} kg
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {bottle.typ !== "Keine" && (
        <div className="flex justify-between text-xs text-gray-500">
          <span>
            {bottle.typ} {bottle.groesse} kg
          </span>
          <span>{Math.round(weight)} kg gesamt (inkl. Flasche)</span>
        </div>
      )}
    </div>
  );
}
