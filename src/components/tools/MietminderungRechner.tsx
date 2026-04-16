"use client";

import { useState } from "react";

interface Mangel {
  label: string;
  minProzent: number;
  maxProzent: number;
  beschreibung: string;
}

const maengel: Mangel[] = [
  {
    label: "Heizungsausfall im Winter",
    minProzent: 20,
    maxProzent: 100,
    beschreibung: "AG Berlin, LG Berlin — je nach Dauer und Außentemperatur",
  },
  {
    label: "Schimmelbefall",
    minProzent: 10,
    maxProzent: 100,
    beschreibung: "LG Berlin, AG Hamburg — je nach Ausmaß und betroffenen Räumen",
  },
  {
    label: "Warmwasserausfall",
    minProzent: 10,
    maxProzent: 30,
    beschreibung: "AG Köln, LG Berlin — je nach Dauer des Ausfalls",
  },
  {
    label: "Lärm durch Baustelle",
    minProzent: 10,
    maxProzent: 25,
    beschreibung: "LG München, AG Hamburg — je nach Intensität und Tageszeit",
  },
  {
    label: "Lärm durch Nachbarn (extremer Lärm)",
    minProzent: 10,
    maxProzent: 20,
    beschreibung: "AG Braunschweig — dauerhafter, unzumutbarer Lärm",
  },
  {
    label: "Aufzug defekt",
    minProzent: 5,
    maxProzent: 15,
    beschreibung: "AG Berlin-Mitte — je nach Stockwerk und Dauer",
  },
  {
    label: "Fenster undicht",
    minProzent: 5,
    maxProzent: 20,
    beschreibung: "AG Hannover — je nach Ausmaß und Jahreszeit",
  },
  {
    label: "Wasserschaden",
    minProzent: 20,
    maxProzent: 80,
    beschreibung: "LG Berlin, AG Hamburg — je nach betroffener Fläche",
  },
  {
    label: "Ungeziefer (Kakerlaken, Mäuse etc.)",
    minProzent: 10,
    maxProzent: 100,
    beschreibung: "AG Köln, LG Hamburg — je nach Art und Befall",
  },
  {
    label: "Feuchter Keller",
    minProzent: 5,
    maxProzent: 10,
    beschreibung: "AG Münster — wenn Keller zur Nutzung gehört",
  },
  {
    label: "Klingel / Gegensprechanlage defekt",
    minProzent: 2,
    maxProzent: 5,
    beschreibung: "AG Berlin-Schöneberg — funktionsrelevantes Bauteil",
  },
  {
    label: "Treppenhaus unsauber / ungepflegt",
    minProzent: 3,
    maxProzent: 5,
    beschreibung: "AG Düsseldorf — Vermieter verletzt Instandhaltungspflicht",
  },
];

export function MietminderungRechner() {
  const [kaltmiete, setKaltmiete] = useState<number>(750);
  const [ausgewaehlt, setAusgewaehlt] = useState<Record<number, boolean>>({});
  const [berechnet, setBerechnet] = useState(false);

  const formatEur = (val: number) =>
    val.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function toggleMangel(idx: number) {
    setAusgewaehlt((prev) => ({ ...prev, [idx]: !prev[idx] }));
    setBerechnet(false);
  }

  const ausgewaehlteManegel = maengel
    .map((m, i) => ({ ...m, idx: i }))
    .filter((_, i) => ausgewaehlt[i]);

  // Minderungsquoten addieren sich grundsätzlich, sind aber auf 100% gedeckelt
  const gesamtMin = Math.min(
    100,
    ausgewaehlteManegel.reduce((s, m) => s + m.minProzent, 0)
  );
  const gesamtMax = Math.min(
    100,
    ausgewaehlteManegel.reduce((s, m) => s + m.maxProzent, 0)
  );
  const empfohlen = Math.min(100, Math.round((gesamtMin + gesamtMax) / 2));

  const minderungMin = (kaltmiete * gesamtMin) / 100;
  const minderungMax = (kaltmiete * gesamtMax) / 100;
  const minderungEmpfohlen = (kaltmiete * empfohlen) / 100;

  return (
    <div className="space-y-6">
      <div className="sm:max-w-xs">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Kaltmiete (€/Monat)
        </label>
        <input
          type="number"
          min={0}
          step={10}
          value={kaltmiete}
          onChange={(e) => {
            setKaltmiete(Math.max(0, Number(e.target.value)));
            setBerechnet(false);
          }}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
        />
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-800">
          Vorliegende Mängel auswählen
        </h3>
        <div className="space-y-3">
          {maengel.map((m, i) => (
            <label
              key={i}
              className="flex items-start gap-3 cursor-pointer rounded-lg border border-gray-200 bg-white p-3 hover:border-primary-300 transition"
            >
              <input
                type="checkbox"
                checked={!!ausgewaehlt[i]}
                onChange={() => toggleMangel(i)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
              />
              <div>
                <span className="text-sm font-medium text-gray-800">{m.label}</span>
                <span className="ml-2 text-xs text-primary-600">
                  ({m.minProzent}–{m.maxProzent}%)
                </span>
                <p className="text-xs text-gray-500">{m.beschreibung}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={() => setBerechnet(true)}
        disabled={ausgewaehlteManegel.length === 0}
        className="w-full rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed sm:w-auto"
      >
        Mietminderung berechnen
      </button>

      {berechnet && ausgewaehlteManegel.length > 0 && (
        <div className="rounded-lg border-2 border-primary-600 bg-primary-50 p-6">
          <h3 className="mb-4 text-lg font-bold text-gray-900">Mietminderung</h3>

          <div className="mb-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Minderungsquote (Spanne)
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {gesamtMin}–{gesamtMax}%
              </p>
            </div>
            <div className="rounded-lg bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Empfohlene Minderung
              </p>
              <p className="mt-1 text-2xl font-bold text-primary-700">{empfohlen}%</p>
              <p className="text-xs text-gray-500">Mittelwert der Spanne</p>
            </div>
            <div className="rounded-lg bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Monatliche Ersparnis
              </p>
              <p className="mt-1 text-2xl font-bold text-green-700">
                {formatEur(minderungEmpfohlen)} €
              </p>
              <p className="text-xs text-gray-500">
                ({formatEur(minderungMin)} – {formatEur(minderungMax)} €)
              </p>
            </div>
          </div>

          {/* Aufschlüsselung */}
          <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
            <h4 className="mb-3 text-sm font-semibold text-gray-800">
              Ausgewählte Mängel
            </h4>
            <div className="space-y-2">
              {ausgewaehlteManegel.map((m) => (
                <div
                  key={m.idx}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{m.label}</p>
                    <p className="text-xs text-gray-500">{m.beschreibung}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary-700">
                      {m.minProzent}–{m.maxProzent}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatEur((kaltmiete * m.minProzent) / 100)} –{" "}
                      {formatEur((kaltmiete * m.maxProzent) / 100)} €
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visueller Balken */}
          <div className="mb-4">
            <div className="mb-1 flex justify-between text-xs text-gray-600">
              <span>Geminderte Miete: {formatEur(kaltmiete - minderungEmpfohlen)} €</span>
              <span>Minderung: {formatEur(minderungEmpfohlen)} €</span>
            </div>
            <div className="flex h-8 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="flex items-center justify-center bg-primary-500 text-xs font-bold text-white transition-all duration-500"
                style={{ width: `${100 - empfohlen}%` }}
              >
                {100 - empfohlen}%
              </div>
              <div
                className="flex items-center justify-center bg-green-500 text-xs font-bold text-white transition-all duration-500"
                style={{ width: `${empfohlen}%` }}
              >
                -{empfohlen}%
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800 mb-4">
            <strong>Wichtig — So gehst du vor:</strong>
            <ol className="mt-2 list-decimal pl-5 space-y-1">
              <li>Mangel dokumentieren (Fotos, Protokoll mit Datum)</li>
              <li>Vermieter schriftlich informieren und Frist zur Beseitigung setzen (in der Regel 14 Tage)</li>
              <li>Erst nach erfolglosem Fristablauf die Miete mindern</li>
              <li>Geminderten Betrag schriftlich ankündigen</li>
              <li>Miete unter Vorbehalt der Minderung zahlen</li>
            </ol>
          </div>

          <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
            <strong>Hinweis:</strong> Die angegebenen Minderungsquoten basieren auf
            veröffentlichten Gerichtsurteilen und dienen der Orientierung. Die tatsächlich
            zulässige Minderung hängt vom Einzelfall ab (§ 536 BGB). Eine zu hohe Minderung
            kann zur fristlosen Kündigung führen. Lass dich im Zweifel vom Mieterverein
            oder einem Fachanwalt für Mietrecht beraten.
          </div>
        </div>
      )}
    </div>
  );
}
