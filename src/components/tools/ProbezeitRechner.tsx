"use client";

import { useState } from "react";

type VerstossTyp = "A" | "B";

interface Verstoss {
  typ: VerstossTyp;
  datum: string;
  beschreibung: string;
}

const aVerstoesse = [
  "Geschwindigkeit > 20 km/h überschritten",
  "Rotlichtverstoß",
  "Alkohol am Steuer (0,0 ‰ Grenze in Probezeit)",
  "Drogenfahrt",
  "Handy am Steuer",
  "Nötigung / Gefährdung im Straßenverkehr",
  "Überholen im Überholverbot",
  "Unerlaubtes Entfernen vom Unfallort",
  "Vorfahrt missachtet mit Gefährdung",
];

const bVerstoesse = [
  "Abgelaufene HU/TÜV (> 8 Monate)",
  "Defekte Beleuchtung",
  "Parken auf der Autobahn",
  "Reifen unter Mindestprofiltiefe",
  "Mitführen von Kindern ohne Kindersitz (unter 12 J.)",
  "Unzureichende Ladungssicherung",
  "Kennzeichen verdeckt / unleserlich",
];

interface ProbezeitStatus {
  regulaeresEnde: Date;
  verlaengertesEnde: Date | null;
  aufbauseminar: boolean;
  verwarnung: boolean;
  beratung: boolean;
  entzug: boolean;
  stufe: number; // 0 = keine Maßnahme, 1 = Aufbauseminar, 2 = Verwarnung, 3 = Entzug
  aCount: number;
  bCount: number;
}

function berechneProbezeitStatus(fuehrerscheinDatum: Date, verstoesse: Verstoss[]): ProbezeitStatus {
  const regulaeresEnde = new Date(fuehrerscheinDatum);
  regulaeresEnde.setFullYear(regulaeresEnde.getFullYear() + 2);

  let aCount = 0;
  let bCount = 0;

  // Sort by date
  const sorted = [...verstoesse].sort((a, b) => new Date(a.datum).getTime() - new Date(b.datum).getTime());

  let stufe = 0; // Track escalation level

  for (const v of sorted) {
    if (v.typ === "A") {
      aCount++;
    } else {
      bCount++;
    }

    // Check for trigger: 1 A-Verstoß or 2 B-Verstöße since last escalation
    // Simplified: count cumulative triggers
    const triggers = aCount + Math.floor(bCount / 2);

    if (triggers >= 3 && stufe < 3) {
      stufe = 3;
    } else if (triggers >= 2 && stufe < 2) {
      stufe = 2;
    } else if (triggers >= 1 && stufe < 1) {
      stufe = 1;
    }
  }

  const verlaengertesEnde = stufe >= 1 ? new Date(fuehrerscheinDatum) : null;
  if (verlaengertesEnde) {
    verlaengertesEnde.setFullYear(verlaengertesEnde.getFullYear() + 4);
  }

  return {
    regulaeresEnde,
    verlaengertesEnde,
    aufbauseminar: stufe >= 1,
    verwarnung: stufe >= 2,
    beratung: stufe >= 2,
    entzug: stufe >= 3,
    stufe,
    aCount,
    bCount,
  };
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function ProbezeitRechner() {
  const [fuehrerscheinDatum, setFuehrerscheinDatum] = useState("");
  const [verstoesse, setVerstoesse] = useState<Verstoss[]>([]);
  const [neuerTyp, setNeuerTyp] = useState<VerstossTyp>("A");
  const [neuesDatum, setNeuesDatum] = useState("");
  const [neueBeschreibung, setNeueBeschreibung] = useState(aVerstoesse[0]);

  function addVerstoss() {
    if (!neuesDatum) return;
    setVerstoesse((prev) => [
      ...prev,
      { typ: neuerTyp, datum: neuesDatum, beschreibung: neueBeschreibung },
    ]);
    setNeuesDatum("");
  }

  function removeVerstoss(idx: number) {
    setVerstoesse((prev) => prev.filter((_, i) => i !== idx));
  }

  const hasFsDatum = fuehrerscheinDatum !== "";
  const fsDatum = hasFsDatum ? new Date(fuehrerscheinDatum) : null;
  const status = fsDatum ? berechneProbezeitStatus(fsDatum, verstoesse) : null;

  const heute = new Date();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Datum Führerscheinerhalt
          </label>
          <input
            type="date"
            value={fuehrerscheinDatum}
            onChange={(e) => setFuehrerscheinDatum(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>
      </div>

      {/* Verstöße hinzufügen */}
      <div className="rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Verstoß hinzufügen</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
            <select
              value={neuerTyp}
              onChange={(e) => {
                const typ = e.target.value as VerstossTyp;
                setNeuerTyp(typ);
                setNeueBeschreibung(typ === "A" ? aVerstoesse[0] : bVerstoesse[0]);
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
            >
              <option value="A">A-Verstoß (schwerwiegend)</option>
              <option value="B">B-Verstoß (weniger schwer)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Verstoß</label>
            <select
              value={neueBeschreibung}
              onChange={(e) => setNeueBeschreibung(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
            >
              {(neuerTyp === "A" ? aVerstoesse : bVerstoesse).map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
            <input
              type="date"
              value={neuesDatum}
              onChange={(e) => setNeuesDatum(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={addVerstoss}
              disabled={!neuesDatum}
              className="w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hinzufügen
            </button>
          </div>
        </div>
      </div>

      {/* Verstöße-Liste */}
      {verstoesse.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">Erfasste Verstöße ({verstoesse.length})</h3>
          {verstoesse.map((v, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between rounded-lg px-4 py-2 text-sm ${
                v.typ === "A" ? "bg-red-50 border border-red-200" : "bg-yellow-50 border border-yellow-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                  v.typ === "A" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                }`}>
                  {v.typ}
                </span>
                <span className="text-gray-700">{v.beschreibung}</span>
                <span className="text-gray-400">
                  {new Date(v.datum).toLocaleDateString("de-DE")}
                </span>
              </div>
              <button
                onClick={() => removeVerstoss(idx)}
                className="text-gray-400 hover:text-red-600 transition"
                title="Entfernen"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Ergebnis */}
      {status && hasFsDatum && (
        <div className="rounded-lg border-2 border-primary-600 bg-primary-50 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Probezeit-Status</h3>

          {/* Timeline */}
          <div className="mb-6">
            <div className="relative">
              <div className="h-2 w-full rounded-full bg-gray-200">
                {(() => {
                  const start = fsDatum!.getTime();
                  const ende = (status.verlaengertesEnde || status.regulaeresEnde).getTime();
                  const now = heute.getTime();
                  const pct = Math.min(100, Math.max(0, ((now - start) / (ende - start)) * 100));
                  return (
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        status.entzug ? "bg-red-500" : status.stufe >= 1 ? "bg-orange-500" : "bg-primary-600"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  );
                })()}
              </div>
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>Erhalt: {formatDate(fsDatum!)}</span>
                {status.verlaengertesEnde ? (
                  <>
                    <span className="text-gray-400 line-through">
                      Regulär: {formatDate(status.regulaeresEnde)}
                    </span>
                    <span className="font-semibold text-orange-600">
                      Verlängert: {formatDate(status.verlaengertesEnde)}
                    </span>
                  </>
                ) : (
                  <span className="font-semibold text-primary-700">
                    Ende: {formatDate(status.regulaeresEnde)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-white p-4 shadow-sm text-center">
              <p className="text-sm text-gray-500">A-Verstöße</p>
              <p className="text-2xl font-bold text-red-600">{status.aCount}</p>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm text-center">
              <p className="text-sm text-gray-500">B-Verstöße</p>
              <p className="text-2xl font-bold text-yellow-600">{status.bCount}</p>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm text-center">
              <p className="text-sm text-gray-500">Probezeit-Ende</p>
              <p className="text-lg font-bold text-primary-700">
                {formatDate(status.verlaengertesEnde || status.regulaeresEnde)}
              </p>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm text-center">
              <p className="text-sm text-gray-500">Maßnahmenstufe</p>
              <p className="text-2xl font-bold text-primary-700">{status.stufe} / 3</p>
            </div>
          </div>

          {/* Maßnahmen-Übersicht */}
          <div className="mt-4 space-y-2">
            <div className={`flex items-center gap-3 rounded-lg p-3 ${
              status.stufe >= 1 ? "bg-orange-100 border border-orange-300" : "bg-white border border-gray-200"
            }`}>
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${
                status.stufe >= 1 ? "bg-orange-500" : "bg-gray-300"
              }`}>1</span>
              <div>
                <p className={`text-sm font-medium ${status.stufe >= 1 ? "text-orange-800" : "text-gray-500"}`}>
                  Aufbauseminar + Verlängerung auf 4 Jahre
                </p>
                <p className="text-xs text-gray-500">Bei 1 A-Verstoß oder 2 B-Verstößen</p>
              </div>
            </div>

            <div className={`flex items-center gap-3 rounded-lg p-3 ${
              status.stufe >= 2 ? "bg-orange-100 border border-orange-300" : "bg-white border border-gray-200"
            }`}>
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${
                status.stufe >= 2 ? "bg-orange-500" : "bg-gray-300"
              }`}>2</span>
              <div>
                <p className={`text-sm font-medium ${status.stufe >= 2 ? "text-orange-800" : "text-gray-500"}`}>
                  Verwarnung + verkehrspsychologische Beratung empfohlen
                </p>
                <p className="text-xs text-gray-500">Bei weiterem A-Verstoß / 2 weiteren B-Verstößen</p>
              </div>
            </div>

            <div className={`flex items-center gap-3 rounded-lg p-3 ${
              status.stufe >= 3 ? "bg-red-100 border border-red-300" : "bg-white border border-gray-200"
            }`}>
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${
                status.stufe >= 3 ? "bg-red-600" : "bg-gray-300"
              }`}>3</span>
              <div>
                <p className={`text-sm font-medium ${status.stufe >= 3 ? "text-red-800" : "text-gray-500"}`}>
                  Entziehung der Fahrerlaubnis
                </p>
                <p className="text-xs text-gray-500">Bei erneutem Verstoß nach Stufe 2</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!hasFsDatum && (
        <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
          <p>Bitte gib das Datum deines Führerscheinerhalts ein, um die Probezeit-Berechnung zu starten.</p>
        </div>
      )}

      <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
        <p className="font-medium text-gray-700 mb-1">Hinweis zu A- und B-Verstößen</p>
        <p>
          <strong>A-Verstöße</strong> sind schwerwiegende Vergehen wie Alkohol, Drogen, erhebliche
          Geschwindigkeitsüberschreitungen oder Rotlichtverstöße. <strong>B-Verstöße</strong> sind
          weniger schwerwiegende Verstöße. Zwei B-Verstöße werden wie ein A-Verstoß gewertet.
          Die Probezeit beträgt regulär 2 Jahre und kann auf maximal 4 Jahre verlängert werden.
        </p>
      </div>
    </div>
  );
}
