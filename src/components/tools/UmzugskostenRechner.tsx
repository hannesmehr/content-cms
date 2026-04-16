"use client";

import { useState } from "react";

interface WohnungsGroesse {
  label: string;
  qm: number;
  volumen: number; // m³ geschätzt
  helferStunden: number;
}

const groessen: WohnungsGroesse[] = [
  { label: "1 Zimmer (~25 m²)", qm: 25, volumen: 10, helferStunden: 4 },
  { label: "2 Zimmer (~50 m²)", qm: 50, volumen: 20, helferStunden: 6 },
  { label: "3 Zimmer (~75 m²)", qm: 75, volumen: 35, helferStunden: 8 },
  { label: "4 Zimmer (~100 m²)", qm: 100, volumen: 50, helferStunden: 10 },
  { label: "5+ Zimmer (~130 m²)", qm: 130, volumen: 65, helferStunden: 14 },
];

export function UmzugskostenRechner() {
  const [groesseIdx, setGroesseIdx] = useState<number>(2);
  const [entfernung, setEntfernung] = useState<number>(50);
  const [stockwerkAlt, setStockwerkAlt] = useState<number>(2);
  const [aufzugAlt, setAufzugAlt] = useState(false);
  const [stockwerkNeu, setStockwerkNeu] = useState<number>(3);
  const [aufzugNeu, setAufzugNeu] = useState(false);
  const [kueche, setKueche] = useState(false);
  const [klavier, setKlavier] = useState(false);
  const [halteverbot, setHalteverbot] = useState(false);
  const [endreinigung, setEndreinigung] = useState(false);
  const [berechnet, setBerechnet] = useState(false);

  const formatEur = (val: number) =>
    val.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const g = groessen[groesseIdx];

  // === Umzugsunternehmen Berechnung ===
  // Grundpreis basierend auf Volumen
  const grundpreisUnternehmen = g.volumen * 25; // ca. 25€ pro m³

  // Entfernungszuschlag
  const entfernungsZuschlag =
    entfernung <= 50
      ? entfernung * 1.5
      : entfernung <= 150
        ? 50 * 1.5 + (entfernung - 50) * 1.2
        : 50 * 1.5 + 100 * 1.2 + (entfernung - 150) * 1.0;

  // Stockwerkzuschlag (nur ohne Aufzug)
  const stockZuschlagAlt = aufzugAlt ? 0 : Math.max(0, stockwerkAlt - 0) * 50;
  const stockZuschlagNeu = aufzugNeu ? 0 : Math.max(0, stockwerkNeu - 0) * 50;
  const stockwerkZuschlag = stockZuschlagAlt + stockZuschlagNeu;

  // Extras
  const extraKueche = kueche ? 250 : 0;
  const extraKlavier = klavier ? 300 : 0;
  const extraHalteverbot = halteverbot ? 150 : 0;
  const extraEndreinigung = endreinigung ? g.qm * 3 : 0;
  const extrasGesamt = extraKueche + extraKlavier + extraHalteverbot + extraEndreinigung;

  const gesamtUnternehmen =
    grundpreisUnternehmen + entfernungsZuschlag + stockwerkZuschlag + extrasGesamt;

  // === Selbstumzug Berechnung ===
  // Transporter-Miete
  const transporterTag = g.volumen <= 20 ? 80 : g.volumen <= 40 ? 110 : 150;
  // Anzahl Tage (bei großer Entfernung ggf. 2 Tage)
  const transporterTage = entfernung > 200 ? 2 : 1;
  const transporterKosten = transporterTag * transporterTage;

  // Spritkosten (ca. 15L/100km für Transporter, 1.80€/L)
  const spritKosten = Math.round((entfernung * 2 * 15 * 1.8) / 100);

  // Umzugshelfer
  const helferAnzahl = g.volumen <= 20 ? 2 : g.volumen <= 40 ? 3 : 4;
  const helferStundenGesamt = g.helferStunden;
  const helferStundenlohn = 15;
  const helferKosten = helferAnzahl * helferStundenGesamt * helferStundenlohn;

  // Verpackungsmaterial
  const verpackungKosten = Math.round(g.volumen * 3);

  // Extras beim Selbstumzug
  const selfExtras = extraHalteverbot + extraEndreinigung;

  const gesamtSelbst =
    transporterKosten + spritKosten + helferKosten + verpackungKosten + selfExtras;

  const ersparnis = gesamtUnternehmen - gesamtSelbst;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Wohnungsgröße
          </label>
          <select
            value={groesseIdx}
            onChange={(e) => {
              setGroesseIdx(Number(e.target.value));
              setBerechnet(false);
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          >
            {groessen.map((g, i) => (
              <option key={i} value={i}>
                {g.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Entfernung (km)
          </label>
          <input
            type="number"
            min={1}
            step={10}
            value={entfernung}
            onChange={(e) => {
              setEntfernung(Math.max(1, Number(e.target.value)));
              setBerechnet(false);
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stockwerk alt
            </label>
            <select
              value={stockwerkAlt}
              onChange={(e) => {
                setStockwerkAlt(Number(e.target.value));
                setBerechnet(false);
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
            >
              <option value={0}>EG</option>
              <option value={1}>1. OG</option>
              <option value={2}>2. OG</option>
              <option value={3}>3. OG</option>
              <option value={4}>4. OG</option>
              <option value={5}>5+ OG</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer pb-2">
              <input
                type="checkbox"
                checked={aufzugAlt}
                onChange={(e) => {
                  setAufzugAlt(e.target.checked);
                  setBerechnet(false);
                }}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
              />
              <span className="text-sm text-gray-700">Aufzug</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stockwerk neu
            </label>
            <select
              value={stockwerkNeu}
              onChange={(e) => {
                setStockwerkNeu(Number(e.target.value));
                setBerechnet(false);
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
            >
              <option value={0}>EG</option>
              <option value={1}>1. OG</option>
              <option value={2}>2. OG</option>
              <option value={3}>3. OG</option>
              <option value={4}>4. OG</option>
              <option value={5}>5+ OG</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer pb-2">
              <input
                type="checkbox"
                checked={aufzugNeu}
                onChange={(e) => {
                  setAufzugNeu(e.target.checked);
                  setBerechnet(false);
                }}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
              />
              <span className="text-sm text-gray-700">Aufzug</span>
            </label>
          </div>
        </div>
      </div>

      {/* Extras */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-800">Zusatzleistungen</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={kueche}
              onChange={(e) => {
                setKueche(e.target.checked);
                setBerechnet(false);
              }}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
            />
            <span className="text-sm text-gray-700">Küche ab-/aufbauen (~250 €)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={klavier}
              onChange={(e) => {
                setKlavier(e.target.checked);
                setBerechnet(false);
              }}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
            />
            <span className="text-sm text-gray-700">Klavier / Schwertransport (~300 €)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={halteverbot}
              onChange={(e) => {
                setHalteverbot(e.target.checked);
                setBerechnet(false);
              }}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
            />
            <span className="text-sm text-gray-700">Halteverbot beantragen (~150 €)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={endreinigung}
              onChange={(e) => {
                setEndreinigung(e.target.checked);
                setBerechnet(false);
              }}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
            />
            <span className="text-sm text-gray-700">
              Endreinigung (~{formatEur(g.qm * 3)} €)
            </span>
          </label>
        </div>
      </div>

      <button
        onClick={() => setBerechnet(true)}
        className="w-full rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 transition-colors sm:w-auto"
      >
        Umzugskosten berechnen
      </button>

      {berechnet && (
        <div className="rounded-lg border-2 border-primary-600 bg-primary-50 p-6">
          <h3 className="mb-4 text-lg font-bold text-gray-900">Kostenvergleich</h3>

          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Umzugsunternehmen
              </p>
              <p className="mt-1 text-2xl font-bold text-primary-700">
                {formatEur(gesamtUnternehmen)} €
              </p>
            </div>
            <div className="rounded-lg bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Selbst umziehen
              </p>
              <p className="mt-1 text-2xl font-bold text-green-700">
                {formatEur(gesamtSelbst)} €
              </p>
            </div>
          </div>

          {ersparnis > 0 && (
            <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-3 text-center text-sm font-medium text-green-800">
              Ersparnis beim Selbstumzug: ca. {formatEur(ersparnis)} €
            </div>
          )}

          {/* Detailaufschlüsselung */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Umzugsunternehmen Details */}
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <h4 className="mb-3 text-sm font-semibold text-gray-800">
                Umzugsunternehmen (Detail)
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Grundpreis ({g.volumen} m³)</span>
                  <span className="font-medium text-gray-900">{formatEur(grundpreisUnternehmen)} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Entfernung ({entfernung} km)</span>
                  <span className="font-medium text-gray-900">{formatEur(entfernungsZuschlag)} €</span>
                </div>
                {stockwerkZuschlag > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stockwerkzuschlag</span>
                    <span className="font-medium text-gray-900">{formatEur(stockwerkZuschlag)} €</span>
                  </div>
                )}
                {extraKueche > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Küche ab-/aufbauen</span>
                    <span className="font-medium text-gray-900">{formatEur(extraKueche)} €</span>
                  </div>
                )}
                {extraKlavier > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Schwertransport</span>
                    <span className="font-medium text-gray-900">{formatEur(extraKlavier)} €</span>
                  </div>
                )}
                {extraHalteverbot > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Halteverbot</span>
                    <span className="font-medium text-gray-900">{formatEur(extraHalteverbot)} €</span>
                  </div>
                )}
                {extraEndreinigung > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Endreinigung</span>
                    <span className="font-medium text-gray-900">{formatEur(extraEndreinigung)} €</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-200 pt-2 font-bold">
                  <span className="text-gray-900">Gesamt</span>
                  <span className="text-primary-700">{formatEur(gesamtUnternehmen)} €</span>
                </div>
              </div>
            </div>

            {/* Selbstumzug Details */}
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <h4 className="mb-3 text-sm font-semibold text-gray-800">
                Selbstumzug (Detail)
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Transporter ({transporterTage} {transporterTage === 1 ? "Tag" : "Tage"})
                  </span>
                  <span className="font-medium text-gray-900">{formatEur(transporterKosten)} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sprit ({entfernung * 2} km)</span>
                  <span className="font-medium text-gray-900">{formatEur(spritKosten)} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {helferAnzahl} Helfer x {helferStundenGesamt} Std.
                  </span>
                  <span className="font-medium text-gray-900">{formatEur(helferKosten)} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Verpackungsmaterial</span>
                  <span className="font-medium text-gray-900">{formatEur(verpackungKosten)} €</span>
                </div>
                {extraHalteverbot > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Halteverbot</span>
                    <span className="font-medium text-gray-900">{formatEur(extraHalteverbot)} €</span>
                  </div>
                )}
                {extraEndreinigung > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Endreinigung</span>
                    <span className="font-medium text-gray-900">{formatEur(extraEndreinigung)} €</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-200 pt-2 font-bold">
                  <span className="text-gray-900">Gesamt</span>
                  <span className="text-green-700">{formatEur(gesamtSelbst)} €</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
            <strong>Hinweis:</strong> Die Kosten sind Richtwerte und können je nach Region,
            Saison und Anbieter variieren. Hole bei einem Umzugsunternehmen mindestens 3
            Angebote ein. Umzugskosten können bei berufsbedingtem Umzug steuerlich absetzbar
            sein (Werbungskosten). Achte bei Umzugshelfern auf eine Unfallversicherung.
          </div>
        </div>
      )}
    </div>
  );
}
