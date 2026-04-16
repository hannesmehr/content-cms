"use client";

import { useState } from "react";

type VerstossKategorie =
  | "geschwindigkeit-innerorts"
  | "geschwindigkeit-ausserorts"
  | "rotlicht"
  | "abstand"
  | "handy"
  | "parkverstoesse"
  | "alkohol";

interface BussgeldErgebnis {
  bussgeld: number;
  punkte: number;
  fahrverbot: number; // Monate, 0 = kein Fahrverbot
  beschreibung: string;
}

function berechneGeschwindigkeit(kmhUeber: number, innerorts: boolean): BussgeldErgebnis {
  if (innerorts) {
    if (kmhUeber <= 10) return { bussgeld: 30, punkte: 0, fahrverbot: 0, beschreibung: `${kmhUeber} km/h zu schnell innerorts` };
    if (kmhUeber <= 15) return { bussgeld: 50, punkte: 0, fahrverbot: 0, beschreibung: `${kmhUeber} km/h zu schnell innerorts` };
    if (kmhUeber <= 20) return { bussgeld: 70, punkte: 0, fahrverbot: 0, beschreibung: `${kmhUeber} km/h zu schnell innerorts` };
    if (kmhUeber <= 25) return { bussgeld: 115, punkte: 1, fahrverbot: 0, beschreibung: `${kmhUeber} km/h zu schnell innerorts` };
    if (kmhUeber <= 30) return { bussgeld: 180, punkte: 1, fahrverbot: 1, beschreibung: `${kmhUeber} km/h zu schnell innerorts` };
    if (kmhUeber <= 40) return { bussgeld: 260, punkte: 2, fahrverbot: 1, beschreibung: `${kmhUeber} km/h zu schnell innerorts` };
    if (kmhUeber <= 50) return { bussgeld: 400, punkte: 2, fahrverbot: 1, beschreibung: `${kmhUeber} km/h zu schnell innerorts` };
    if (kmhUeber <= 60) return { bussgeld: 560, punkte: 2, fahrverbot: 2, beschreibung: `${kmhUeber} km/h zu schnell innerorts` };
    if (kmhUeber <= 70) return { bussgeld: 700, punkte: 2, fahrverbot: 3, beschreibung: `${kmhUeber} km/h zu schnell innerorts` };
    return { bussgeld: 800, punkte: 2, fahrverbot: 3, beschreibung: `Über 70 km/h zu schnell innerorts` };
  } else {
    if (kmhUeber <= 10) return { bussgeld: 20, punkte: 0, fahrverbot: 0, beschreibung: `${kmhUeber} km/h zu schnell außerorts` };
    if (kmhUeber <= 15) return { bussgeld: 40, punkte: 0, fahrverbot: 0, beschreibung: `${kmhUeber} km/h zu schnell außerorts` };
    if (kmhUeber <= 20) return { bussgeld: 60, punkte: 0, fahrverbot: 0, beschreibung: `${kmhUeber} km/h zu schnell außerorts` };
    if (kmhUeber <= 25) return { bussgeld: 100, punkte: 1, fahrverbot: 0, beschreibung: `${kmhUeber} km/h zu schnell außerorts` };
    if (kmhUeber <= 30) return { bussgeld: 150, punkte: 1, fahrverbot: 0, beschreibung: `${kmhUeber} km/h zu schnell außerorts` };
    if (kmhUeber <= 40) return { bussgeld: 200, punkte: 1, fahrverbot: 1, beschreibung: `${kmhUeber} km/h zu schnell außerorts` };
    if (kmhUeber <= 50) return { bussgeld: 320, punkte: 2, fahrverbot: 1, beschreibung: `${kmhUeber} km/h zu schnell außerorts` };
    if (kmhUeber <= 60) return { bussgeld: 480, punkte: 2, fahrverbot: 1, beschreibung: `${kmhUeber} km/h zu schnell außerorts` };
    if (kmhUeber <= 70) return { bussgeld: 600, punkte: 2, fahrverbot: 2, beschreibung: `${kmhUeber} km/h zu schnell außerorts` };
    return { bussgeld: 700, punkte: 2, fahrverbot: 3, beschreibung: `Über 70 km/h zu schnell außerorts` };
  }
}

function berechneRotlicht(ueberEineSekunde: boolean): BussgeldErgebnis {
  if (ueberEineSekunde) {
    return { bussgeld: 200, punkte: 2, fahrverbot: 1, beschreibung: "Rotlichtverstoß (Ampel über 1 Sekunde rot)" };
  }
  return { bussgeld: 90, punkte: 1, fahrverbot: 0, beschreibung: "Rotlichtverstoß (Ampel unter 1 Sekunde rot)" };
}

function berechneAbstand(geschwindigkeit: number, abstandMeter: number): BussgeldErgebnis {
  if (geschwindigkeit <= 80) {
    return { bussgeld: 25, punkte: 0, fahrverbot: 0, beschreibung: `Abstandsverstoß bei ${geschwindigkeit} km/h` };
  }
  const halberTacho = geschwindigkeit / 2;
  const verhaeltnis = abstandMeter / (geschwindigkeit * 0.3); // Abstand in Zehntelsekunden

  if (geschwindigkeit > 130) {
    if (verhaeltnis < 0.1) return { bussgeld: 400, punkte: 2, fahrverbot: 3, beschreibung: `Extrem geringer Abstand bei ${geschwindigkeit} km/h` };
    if (verhaeltnis < 0.2) return { bussgeld: 320, punkte: 2, fahrverbot: 3, beschreibung: `Sehr geringer Abstand bei ${geschwindigkeit} km/h` };
    if (verhaeltnis < 0.3) return { bussgeld: 240, punkte: 2, fahrverbot: 2, beschreibung: `Geringer Abstand bei ${geschwindigkeit} km/h` };
    if (verhaeltnis < 0.4) return { bussgeld: 160, punkte: 2, fahrverbot: 1, beschreibung: `Zu geringer Abstand bei ${geschwindigkeit} km/h` };
    if (verhaeltnis < 0.5) return { bussgeld: 100, punkte: 1, fahrverbot: 0, beschreibung: `Abstand unterschritten bei ${geschwindigkeit} km/h` };
  }

  if (abstandMeter < halberTacho * 0.3) return { bussgeld: 240, punkte: 2, fahrverbot: 2, beschreibung: `Geringer Abstand bei ${geschwindigkeit} km/h` };
  if (abstandMeter < halberTacho * 0.5) return { bussgeld: 160, punkte: 2, fahrverbot: 1, beschreibung: `Zu geringer Abstand bei ${geschwindigkeit} km/h` };
  if (abstandMeter < halberTacho * 0.7) return { bussgeld: 100, punkte: 1, fahrverbot: 0, beschreibung: `Abstand unterschritten bei ${geschwindigkeit} km/h` };
  return { bussgeld: 75, punkte: 1, fahrverbot: 0, beschreibung: `Abstandsverstoß bei ${geschwindigkeit} km/h` };
}

function berechneHandy(): BussgeldErgebnis {
  return { bussgeld: 100, punkte: 1, fahrverbot: 0, beschreibung: "Handy am Steuer (als Fahrzeugführer)" };
}

function berechneParkverstoesse(): BussgeldErgebnis {
  return { bussgeld: 55, punkte: 0, fahrverbot: 0, beschreibung: "Parken im Halteverbot / unerlaubtes Parken" };
}

function berechneAlkohol(promille: number): BussgeldErgebnis {
  if (promille >= 1.1) {
    return { bussgeld: 0, punkte: 3, fahrverbot: 6, beschreibung: `Alkohol am Steuer (${promille.toFixed(2)} ‰) — Straftat! Geld- oder Freiheitsstrafe wird vom Gericht festgelegt.` };
  }
  if (promille >= 0.5) {
    return { bussgeld: 500, punkte: 2, fahrverbot: 1, beschreibung: `Alkohol am Steuer (${promille.toFixed(2)} ‰) — Erstverstoß` };
  }
  if (promille >= 0.3) {
    return { bussgeld: 0, punkte: 2, fahrverbot: 0, beschreibung: `Alkohol am Steuer (${promille.toFixed(2)} ‰) — Bei Auffälligkeiten im Straßenverkehr bereits ab 0,3 ‰ strafbar` };
  }
  return { bussgeld: 0, punkte: 0, fahrverbot: 0, beschreibung: `${promille.toFixed(2)} ‰ — Unter der Grenze, kein Bußgeld (Ausnahme: Fahranfänger in der Probezeit)` };
}

export function BussgeldRechner() {
  const [kategorie, setKategorie] = useState<VerstossKategorie>("geschwindigkeit-innerorts");
  const [kmhUeber, setKmhUeber] = useState(15);
  const [rotlichtUeber1s, setRotlichtUeber1s] = useState(false);
  const [abstandGeschwindigkeit, setAbstandGeschwindigkeit] = useState(100);
  const [abstandMeter, setAbstandMeter] = useState(15);
  const [promille, setPromille] = useState(0.5);
  const [probezeit, setProbezeit] = useState(false);

  let ergebnis: BussgeldErgebnis;

  switch (kategorie) {
    case "geschwindigkeit-innerorts":
      ergebnis = berechneGeschwindigkeit(kmhUeber, true);
      break;
    case "geschwindigkeit-ausserorts":
      ergebnis = berechneGeschwindigkeit(kmhUeber, false);
      break;
    case "rotlicht":
      ergebnis = berechneRotlicht(rotlichtUeber1s);
      break;
    case "abstand":
      ergebnis = berechneAbstand(abstandGeschwindigkeit, abstandMeter);
      break;
    case "handy":
      ergebnis = berechneHandy();
      break;
    case "parkverstoesse":
      ergebnis = berechneParkverstoesse();
      break;
    case "alkohol":
      ergebnis = berechneAlkohol(promille);
      break;
  }

  const schwere =
    ergebnis.fahrverbot > 0 || ergebnis.punkte >= 2
      ? "schwer"
      : ergebnis.punkte >= 1
        ? "mittel"
        : "leicht";

  const schwereColors = {
    leicht: { bg: "bg-yellow-50", border: "border-yellow-400", text: "text-yellow-800", badge: "bg-yellow-100 text-yellow-800" },
    mittel: { bg: "bg-orange-50", border: "border-orange-400", text: "text-orange-800", badge: "bg-orange-100 text-orange-800" },
    schwer: { bg: "bg-red-50", border: "border-red-500", text: "text-red-800", badge: "bg-red-100 text-red-800" },
  };

  const colors = schwereColors[schwere];

  const istAVerstoss = ergebnis.punkte >= 1 || ergebnis.fahrverbot > 0;

  const formatEur = (val: number) =>
    val.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Art des Verstoßes
          </label>
          <select
            value={kategorie}
            onChange={(e) => setKategorie(e.target.value as VerstossKategorie)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          >
            <option value="geschwindigkeit-innerorts">Geschwindigkeitsverstoß innerorts</option>
            <option value="geschwindigkeit-ausserorts">Geschwindigkeitsverstoß außerorts</option>
            <option value="rotlicht">Rotlichtverstoß</option>
            <option value="abstand">Abstandsverstoß</option>
            <option value="handy">Handy am Steuer</option>
            <option value="parkverstoesse">Parkverstoß</option>
            <option value="alkohol">Alkohol am Steuer</option>
          </select>
        </div>

        {(kategorie === "geschwindigkeit-innerorts" || kategorie === "geschwindigkeit-ausserorts") && (
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Geschwindigkeitsüberschreitung: {kmhUeber} km/h
            </label>
            <input
              type="range"
              min={1}
              max={70}
              value={kmhUeber}
              onChange={(e) => setKmhUeber(Number(e.target.value))}
              className="w-full accent-primary-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1 km/h</span>
              <span>70+ km/h</span>
            </div>
          </div>
        )}

        {kategorie === "rotlicht" && (
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dauer der Rotphase
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="rotlicht"
                  checked={!rotlichtUeber1s}
                  onChange={() => setRotlichtUeber1s(false)}
                  className="text-primary-600 focus:ring-primary-600"
                />
                <span className="text-sm text-gray-700">Unter 1 Sekunde</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="rotlicht"
                  checked={rotlichtUeber1s}
                  onChange={() => setRotlichtUeber1s(true)}
                  className="text-primary-600 focus:ring-primary-600"
                />
                <span className="text-sm text-gray-700">Über 1 Sekunde (qualifizierter Rotlichtverstoß)</span>
              </label>
            </div>
          </div>
        )}

        {kategorie === "abstand" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gefahrene Geschwindigkeit (km/h)
              </label>
              <input
                type="number"
                min={30}
                max={250}
                value={abstandGeschwindigkeit}
                onChange={(e) => setAbstandGeschwindigkeit(Math.max(30, Number(e.target.value)))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Eingehaltener Abstand (Meter)
              </label>
              <input
                type="number"
                min={1}
                max={200}
                value={abstandMeter}
                onChange={(e) => setAbstandMeter(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
              />
              <p className="mt-1 text-xs text-gray-500">
                Empfohlener Mindestabstand: {Math.round(abstandGeschwindigkeit / 2)} m (halber Tacho)
              </p>
            </div>
          </>
        )}

        {kategorie === "alkohol" && (
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Blutalkoholwert: {promille.toFixed(2)} ‰
            </label>
            <input
              type="range"
              min={0}
              max={2.5}
              step={0.01}
              value={promille}
              onChange={(e) => setPromille(Number(e.target.value))}
              className="w-full accent-primary-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0,00 ‰</span>
              <span>0,50 ‰</span>
              <span>1,10 ‰</span>
              <span>2,50 ‰</span>
            </div>
          </div>
        )}

        <div className="sm:col-span-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={probezeit}
              onChange={(e) => setProbezeit(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
            />
            <span className="text-sm font-medium text-gray-700">In der Probezeit?</span>
          </label>
        </div>
      </div>

      {/* Ergebnis */}
      <div className={`rounded-lg border-2 ${colors.border} ${colors.bg} p-6`}>
        <div className="flex items-center gap-3 mb-4">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${colors.badge}`}>
            {schwere === "leicht" ? "Geringfügig" : schwere === "mittel" ? "Mittelschwer" : "Schwerer Verstoß"}
          </span>
        </div>

        <p className={`text-sm ${colors.text} mb-4`}>{ergebnis.beschreibung}</p>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-4 shadow-sm text-center">
            <p className="text-sm text-gray-500">Bußgeld</p>
            <p className="text-2xl font-bold text-primary-700">
              {ergebnis.bussgeld > 0 ? `${formatEur(ergebnis.bussgeld)} €` : "—"}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm text-center">
            <p className="text-sm text-gray-500">Punkte in Flensburg</p>
            <p className="text-2xl font-bold text-primary-700">{ergebnis.punkte}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm text-center">
            <p className="text-sm text-gray-500">Fahrverbot</p>
            <p className="text-2xl font-bold text-primary-700">
              {ergebnis.fahrverbot > 0 ? `${ergebnis.fahrverbot} Monat${ergebnis.fahrverbot > 1 ? "e" : ""}` : "Keins"}
            </p>
          </div>
        </div>

        {probezeit && (
          <div className="mt-4 rounded-lg bg-white p-4 shadow-sm border-l-4 border-orange-500">
            <h4 className="font-semibold text-gray-900 mb-2">Konsequenzen in der Probezeit</h4>
            {istAVerstoss ? (
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• <strong>A-Verstoß</strong> — schwerwiegender Verstoß</li>
                <li>• Verpflichtendes <strong>Aufbauseminar</strong> (ca. 250–400 €)</li>
                <li>• <strong>Probezeitverlängerung</strong> von 2 auf 4 Jahre</li>
                <li>• Bei weiterem A-Verstoß: Verwarnung + Empfehlung verkehrspsychologische Beratung</li>
                <li>• Bei drittem A-Verstoß: <strong>Führerscheinentzug</strong></li>
              </ul>
            ) : (
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• <strong>B-Verstoß</strong> — weniger schwerwiegend</li>
                <li>• Erst ab dem <strong>zweiten B-Verstoß</strong> drohen Aufbauseminar und Verlängerung</li>
                <li>• Einzelner B-Verstoß hat keine zusätzlichen Probezeit-Konsequenzen</li>
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
        <p className="font-medium text-gray-700 mb-1">Hinweis</p>
        <p>
          Die Angaben basieren auf dem aktuellen Bußgeldkatalog (Stand 2026) und dienen
          der Orientierung. Im Einzelfall können die tatsächlichen Sanktionen abweichen,
          insbesondere bei Voreintragungen oder besonderen Umständen. Bei Straftaten (z.{"\u00A0"}B.
          ab 1,1 ‰ Alkohol) entscheidet das Gericht über die Strafe.
        </p>
      </div>
    </div>
  );
}
