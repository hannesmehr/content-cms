"use client";

import { useState, useMemo } from "react";

type Zustand = {
  label: string;
  faktor: number;
};

const zustandOptionen: Record<string, Zustand> = {
  sehrGut: { label: "Sehr gut (wie neu, gepflegt)", faktor: 1.1 },
  gut: { label: "Gut (normale Gebrauchsspuren)", faktor: 1.0 },
  befriedigend: {
    label: "Befriedigend (deutliche Spuren, kleine Mängel)",
    faktor: 0.85,
  },
  mangelhaft: {
    label: "Mangelhaft (größere Schäden, Reparaturbedarf)",
    faktor: 0.7,
  },
};

function formatEuro(n: number): string {
  return n.toLocaleString("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatNumber(n: number, decimals = 0): string {
  return n.toLocaleString("de-DE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// Quelle: bewerta.de – Wohnwagen-Wertverlust Richtwerte
function berechneWertverlust(kaufpreis: number, jahre: number): number {
  let wert = kaufpreis;

  for (let j = 1; j <= jahre; j++) {
    let rate: number;
    if (j === 1) rate = 0.13;
    else if (j === 2) rate = 0.08;
    else if (j === 3) rate = 0.06;
    else if (j === 4) rate = 0.05;
    else if (j <= 10) rate = 0.03;
    else rate = 0.02;

    wert = wert * (1 - rate);
  }

  return wert;
}

export function WertverlustRechner() {
  const [kaufpreis, setKaufpreis] = useState<string>("25000");
  const [eingabeModus, setEingabeModus] = useState<"alter" | "baujahr">("alter");
  const [alter, setAlter] = useState<number>(5);
  const [baujahr, setBaujahr] = useState<string>("2021");
  const [zustand, setZustand] = useState<string>("gut");

  const currentYear = new Date().getFullYear();
  const effektivesAlter =
    eingabeModus === "alter"
      ? alter
      : Math.max(0, currentYear - (parseInt(baujahr) || currentYear));

  const kaufpreisNum = parseFloat(kaufpreis) || 0;
  const zustandFaktor = zustandOptionen[zustand]?.faktor || 1.0;

  const result = useMemo(() => {
    if (kaufpreisNum <= 0) return null;

    const basisWert = berechneWertverlust(kaufpreisNum, effektivesAlter);
    const angepassterWert = Math.round(basisWert * zustandFaktor);
    const gesamtVerlust = kaufpreisNum - angepassterWert;
    const verlustProzent =
      kaufpreisNum > 0 ? (gesamtVerlust / kaufpreisNum) * 100 : 0;

    // Wertentwicklung für Balkendiagramm (bis max 30 Jahre)
    const maxJahre = Math.min(Math.max(effektivesAlter + 5, 10), 30);
    const verlauf: { jahr: number; wert: number }[] = [];
    for (let j = 0; j <= maxJahre; j++) {
      verlauf.push({
        jahr: j,
        wert: Math.round(berechneWertverlust(kaufpreisNum, j) * zustandFaktor),
      });
    }

    return {
      angepassterWert,
      gesamtVerlust,
      verlustProzent,
      verlauf,
      maxJahre,
    };
  }, [kaufpreisNum, effektivesAlter, zustandFaktor]);

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="space-y-6">
      {/* Kaufpreis */}
      <div>
        <label className={labelClass}>Neupreis / Kaufpreis (€)</label>
        <input
          type="number"
          value={kaufpreis}
          onChange={(e) => setKaufpreis(e.target.value)}
          placeholder="z.B. 25000"
          min={0}
          className={inputClass}
        />
      </div>

      {/* Alter */}
      <div>
        <div className="mb-2 flex gap-2">
          <button
            type="button"
            onClick={() => setEingabeModus("alter")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              eingabeModus === "alter"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Alter eingeben
          </button>
          <button
            type="button"
            onClick={() => setEingabeModus("baujahr")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              eingabeModus === "baujahr"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Baujahr eingeben
          </button>
        </div>

        {eingabeModus === "alter" ? (
          <div>
            <label className={labelClass}>Alter des Wohnwagens (Jahre)</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={30}
                value={alter}
                onChange={(e) => setAlter(parseInt(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-300 accent-primary-600"
              />
              <span className="w-16 text-right text-sm font-medium text-gray-700">
                {alter} {alter === 1 ? "Jahr" : "Jahre"}
              </span>
            </div>
          </div>
        ) : (
          <div>
            <label className={labelClass}>Baujahr</label>
            <input
              type="number"
              value={baujahr}
              onChange={(e) => setBaujahr(e.target.value)}
              placeholder="z.B. 2020"
              min={1980}
              max={currentYear}
              className={inputClass}
            />
            {parseInt(baujahr) > 0 && (
              <p className="mt-1 text-xs text-gray-500">
                = ca. {effektivesAlter} Jahre alt
              </p>
            )}
          </div>
        )}
      </div>

      {/* Zustand */}
      <div>
        <label className={labelClass}>Zustand</label>
        <select
          value={zustand}
          onChange={(e) => setZustand(e.target.value)}
          className={inputClass}
        >
          {Object.entries(zustandOptionen).map(([key, z]) => (
            <option key={key} value={key}>
              {z.label}
            </option>
          ))}
        </select>
      </div>

      {/* Ergebnis */}
      {result && kaufpreisNum > 0 && (
        <div className="rounded-lg border-2 border-primary-600 bg-primary-50 p-6">
          <h3 className="mb-4 text-lg font-bold text-gray-900">
            Geschätzter Wert
          </h3>

          <div className="mb-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Neupreis
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {formatEuro(kaufpreisNum)} €
              </p>
            </div>

            <div className="rounded-lg bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Aktueller Wert (ca.)
              </p>
              <p className="mt-1 text-2xl font-bold text-primary-700">
                {formatEuro(result.angepassterWert)} €
              </p>
              <p className="text-xs text-gray-500">
                nach {effektivesAlter} Jahren
              </p>
            </div>

            <div className="rounded-lg bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Wertverlust
              </p>
              <p className="mt-1 text-2xl font-bold text-red-600">
                -{formatEuro(result.gesamtVerlust)} €
              </p>
              <p className="text-xs text-gray-500">
                ({formatNumber(result.verlustProzent, 1)}% vom Neupreis)
              </p>
            </div>
          </div>

          {/* Balkendiagramm */}
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h4 className="mb-3 text-sm font-semibold text-gray-800">
              Wertentwicklung über die Jahre
            </h4>
            <div className="space-y-1">
              {result.verlauf.map((v) => {
                const percent =
                  kaufpreisNum > 0 ? (v.wert / kaufpreisNum) * 100 : 0;
                const isAktuell = v.jahr === effektivesAlter;
                return (
                  <div key={v.jahr} className="flex items-center gap-2">
                    <span
                      className={`w-10 text-right text-xs ${
                        isAktuell
                          ? "font-bold text-primary-700"
                          : "text-gray-500"
                      }`}
                    >
                      {v.jahr}J
                    </span>
                    <div className="flex-1 h-4 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isAktuell ? "bg-primary-600" : "bg-gray-300"
                        }`}
                        style={{ width: `${Math.max(percent, 1)}%` }}
                      />
                    </div>
                    <span
                      className={`w-20 text-right text-xs ${
                        isAktuell
                          ? "font-bold text-primary-700"
                          : "text-gray-500"
                      }`}
                    >
                      {formatEuro(v.wert)} €
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Zusatzinfo */}
          <div className="mt-4 rounded-md bg-white/60 p-3">
            <p className="text-xs text-gray-600">
              <strong>Zustandsanpassung:</strong> Der Zustand &ldquo;
              {zustandOptionen[zustand]?.label}&rdquo; wirkt sich mit Faktor{" "}
              {formatNumber(zustandFaktor, 2)} auf den Basiswert aus.
              {zustandFaktor > 1
                ? " Ein sehr gut gepflegter Wohnwagen erzielt höhere Preise."
                : zustandFaktor < 1
                  ? " Mängel und Schäden senken den erzielbaren Preis deutlich."
                  : ""}
            </p>
          </div>
        </div>
      )}

      {(!result || kaufpreisNum <= 0) && (
        <div className="rounded-lg border-2 border-primary-600 bg-primary-50 p-6">
          <p className="text-sm text-gray-500">
            Gib einen Kaufpreis ein, um den geschätzten Wertverlust zu
            berechnen.
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
        <p className="font-semibold text-gray-700">
          Hinweis: Nur Richtwerte!
        </p>
        <p className="mt-1">
          Der tatsächliche Marktwert hängt von vielen Faktoren ab: Marke,
          Modell, Ausstattung, Zustand, regionale Nachfrage und Marktlage. Die
          Berechnung verwendet eine typische Abschreibungskurve (Jahr 1: −20%,
          Jahr 2: −15%, Jahr 3–5: −10%/Jahr, Jahr 6–10: −7%/Jahr, ab Jahr 11:
          −4%/Jahr). Premium-Marken wie Hobby, Fendt oder Tabbert können einen
          geringeren Wertverlust haben, während weniger bekannte Marken stärker
          abwerten.
        </p>
      </div>
    </div>
  );
}
