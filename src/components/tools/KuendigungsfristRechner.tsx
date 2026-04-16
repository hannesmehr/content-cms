"use client";

import { useState } from "react";

export function KuendigungsfristRechner() {
  const [rolle, setRolle] = useState<string>("mieter");
  const [mietbeginnStr, setMietbeginnStr] = useState<string>("2020-01-01");
  const [kuendigungsdatumStr, setKuendigungsdatumStr] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [sonderkuendigung, setSonderkuendigung] = useState<string>("nein");
  const [berechnet, setBerechnet] = useState(false);

  const formatDatum = (d: Date) =>
    d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });

  const mietbeginn = new Date(mietbeginnStr);
  const kuendigungsdatum = new Date(kuendigungsdatumStr);

  // Mietdauer in Jahren berechnen
  const mietdauerMs = kuendigungsdatum.getTime() - mietbeginn.getTime();
  const mietdauerJahre = mietdauerMs / (1000 * 60 * 60 * 24 * 365.25);

  // Kündigungsfrist bestimmen
  let fristMonate = 3;
  let fristBeschreibung = "";

  if (sonderkuendigung === "mieterhoehung") {
    fristMonate = 2;
    fristBeschreibung = "Sonderkündigungsrecht bei Mieterhöhung: 2 Monate zum Monatsende (§ 561 BGB)";
  } else if (sonderkuendigung === "modernisierung") {
    fristMonate = 2;
    fristBeschreibung = "Sonderkündigungsrecht bei Modernisierung: 2 Monate zum Monatsende (§ 555e BGB)";
  } else if (rolle === "mieter") {
    fristMonate = 3;
    fristBeschreibung = "Mieter: 3 Monate zum Monatsende (§ 573c Abs. 1 BGB)";
  } else {
    // Vermieter: gestaffelte Fristen
    if (mietdauerJahre < 5) {
      fristMonate = 3;
      fristBeschreibung = "Vermieter (bis 5 Jahre): 3 Monate zum Monatsende (§ 573c Abs. 1 BGB)";
    } else if (mietdauerJahre < 8) {
      fristMonate = 6;
      fristBeschreibung = "Vermieter (5-8 Jahre): 6 Monate zum Monatsende (§ 573c Abs. 1 BGB)";
    } else {
      fristMonate = 9;
      fristBeschreibung = "Vermieter (über 8 Jahre): 9 Monate zum Monatsende (§ 573c Abs. 1 BGB)";
    }

    if (sonderkuendigung === "eigenbedarf") {
      fristBeschreibung += " — Eigenbedarf muss im Kündigungsschreiben begründet werden (§ 573 Abs. 2 Nr. 2 BGB)";
    } else if (sonderkuendigung === "haertefall") {
      fristBeschreibung += " — Mieter kann Widerspruch wegen Härtefall einlegen (§ 574 BGB)";
    }
  }

  // Kündigung muss bis zum 3. Werktag des Monats eingehen
  // Fristberechnung: Kündigung zum Monatsende + Fristmonate
  const kuendigungsMonat = kuendigungsdatum.getMonth();
  const kuendigungsJahr = kuendigungsdatum.getFullYear();

  // Spätester Zugang der Kündigung: 3. Werktag des Monats, in dem die Frist beginnt
  // Kündigung muss bis zum 3. Werktag zugehen, damit der Monat zählt
  const dritterWerktag = berechneDrittenWerktag(kuendigungsJahr, kuendigungsMonat);

  // Prüfen ob Kündigung rechtzeitig zum aktuellen Monat zählt
  const zaehltAbAktuellerMonat = kuendigungsdatum.getDate() <= dritterWerktag;

  // Startmonat für Fristberechnung
  let startMonat: number;
  let startJahr: number;
  if (zaehltAbAktuellerMonat) {
    startMonat = kuendigungsMonat;
    startJahr = kuendigungsJahr;
  } else {
    startMonat = kuendigungsMonat + 1;
    startJahr = kuendigungsJahr;
    if (startMonat > 11) {
      startMonat = 0;
      startJahr++;
    }
  }

  // Auszugstermin: Ende des Monats nach Ablauf der Frist
  let auszugsMonat = startMonat + fristMonate;
  let auszugsJahr = startJahr;
  while (auszugsMonat > 11) {
    auszugsMonat -= 12;
    auszugsJahr++;
  }

  // Letzter Tag des Auszugsmonats
  const auszugsDatum = new Date(auszugsJahr, auszugsMonat + 1, 0);

  // Deadline: Kündigung muss spätestens zum 3. Werktag des Startmonats beim Empfänger sein
  let deadlineMonat = auszugsMonat - fristMonate;
  let deadlineJahr = auszugsJahr;
  while (deadlineMonat < 0) {
    deadlineMonat += 12;
    deadlineJahr--;
  }
  const deadlineTag = berechneDrittenWerktag(deadlineJahr, deadlineMonat);
  const deadlineDatum = new Date(deadlineJahr, deadlineMonat, deadlineTag);

  // Monate zwischen heute und Auszug
  const monateVerbleibend = (auszugsJahr - kuendigungsJahr) * 12 + (auszugsMonat - kuendigungsMonat);

  // Zeitstrahl-Monate generieren
  const zeitstrahlMonate: { label: string; monat: number; jahr: number; typ: string }[] = [];
  let zMonat = kuendigungsMonat;
  let zJahr = kuendigungsJahr;
  const monatsnamen = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
  for (let i = 0; i <= Math.min(monateVerbleibend + 1, 14); i++) {
    let typ = "frist";
    if (zMonat === kuendigungsMonat && zJahr === kuendigungsJahr) typ = "kuendigung";
    if (zMonat === auszugsMonat && zJahr === auszugsJahr) typ = "auszug";

    zeitstrahlMonate.push({
      label: `${monatsnamen[zMonat]} ${zJahr}`,
      monat: zMonat,
      jahr: zJahr,
      typ,
    });

    zMonat++;
    if (zMonat > 11) {
      zMonat = 0;
      zJahr++;
    }
  }

  function berechneDrittenWerktag(jahr: number, monat: number): number {
    let werktage = 0;
    for (let tag = 1; tag <= 31; tag++) {
      const d = new Date(jahr, monat, tag);
      if (d.getMonth() !== monat) break;
      const wochentag = d.getDay();
      if (wochentag !== 0 && wochentag !== 6) {
        werktage++;
        if (werktage === 3) return tag;
      }
    }
    return 3;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rolle</label>
          <select
            value={rolle}
            onChange={(e) => {
              setRolle(e.target.value);
              setBerechnet(false);
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          >
            <option value="mieter">Mieter</option>
            <option value="vermieter">Vermieter</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sonderkündigungsrecht
          </label>
          <select
            value={sonderkuendigung}
            onChange={(e) => {
              setSonderkuendigung(e.target.value);
              setBerechnet(false);
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          >
            <option value="nein">Nein</option>
            <option value="mieterhoehung">Mieterhöhung</option>
            <option value="modernisierung">Modernisierung</option>
            {rolle === "vermieter" && <option value="eigenbedarf">Eigenbedarf</option>}
            {rolle === "vermieter" && <option value="haertefall">Härtefall</option>}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mietbeginn
          </label>
          <input
            type="date"
            value={mietbeginnStr}
            onChange={(e) => {
              setMietbeginnStr(e.target.value);
              setBerechnet(false);
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gewünschtes Kündigungsdatum
          </label>
          <input
            type="date"
            value={kuendigungsdatumStr}
            onChange={(e) => {
              setKuendigungsdatumStr(e.target.value);
              setBerechnet(false);
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>
      </div>

      <button
        onClick={() => setBerechnet(true)}
        className="w-full rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 transition-colors sm:w-auto"
      >
        Kündigungsfrist berechnen
      </button>

      {berechnet && (
        <div className="rounded-lg border-2 border-primary-600 bg-primary-50 p-6">
          <h3 className="mb-4 text-lg font-bold text-gray-900">Kündigungsfrist</h3>

          <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Mietdauer
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {Math.floor(mietdauerJahre).toLocaleString("de-DE")} Jahre
              </p>
              <p className="text-xs text-gray-500">seit {formatDatum(mietbeginn)}</p>
            </div>

            <div className="rounded-lg bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Kündigungsfrist
              </p>
              <p className="mt-1 text-2xl font-bold text-primary-700">
                {fristMonate} Monate
              </p>
              <p className="text-xs text-gray-500">zum Monatsende</p>
            </div>

            <div className="rounded-lg bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Frühester Auszugstermin
              </p>
              <p className="mt-1 text-2xl font-bold text-green-700">
                {formatDatum(auszugsDatum)}
              </p>
            </div>

            <div className="rounded-lg bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Kündigung muss ankommen bis
              </p>
              <p className="mt-1 text-2xl font-bold text-red-700">
                {formatDatum(deadlineDatum)}
              </p>
              <p className="text-xs text-gray-500">3. Werktag des Monats</p>
            </div>
          </div>

          {/* Rechtsgrundlage */}
          <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
            <h4 className="mb-2 text-sm font-semibold text-gray-800">Rechtsgrundlage</h4>
            <p className="text-sm text-gray-700">{fristBeschreibung}</p>
          </div>

          {/* Zeitstrahl-Visualisierung */}
          <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
            <h4 className="mb-3 text-sm font-semibold text-gray-800">Zeitliche Übersicht</h4>
            <div className="flex gap-1 overflow-x-auto pb-2">
              {zeitstrahlMonate.map((m, i) => (
                <div
                  key={i}
                  className={`flex min-w-[70px] flex-col items-center rounded-lg px-2 py-3 text-center ${
                    m.typ === "kuendigung"
                      ? "bg-red-100 border-2 border-red-400"
                      : m.typ === "auszug"
                        ? "bg-green-100 border-2 border-green-400"
                        : "bg-gray-100 border border-gray-200"
                  }`}
                >
                  <span className="text-xs font-medium text-gray-700">{m.label}</span>
                  {m.typ === "kuendigung" && (
                    <span className="mt-1 text-[10px] font-bold text-red-700">Kündigung</span>
                  )}
                  {m.typ === "auszug" && (
                    <span className="mt-1 text-[10px] font-bold text-green-700">Auszug</span>
                  )}
                  {m.typ === "frist" && (
                    <span className="mt-1 text-[10px] text-gray-400">Frist</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
            <strong>Wichtige Hinweise:</strong>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Die Kündigung muss schriftlich erfolgen (§ 568 BGB) — per Brief, nicht per E-Mail.</li>
              <li>Maßgeblich ist der Zugang beim Empfänger, nicht das Absendedatum.</li>
              <li>Die Kündigung muss bis zum 3. Werktag des Monats zugehen, damit der Monat für die Frist zählt.</li>
              <li>Bei Vermieterkündigung: Ein berechtigtes Interesse muss vorliegen (§ 573 BGB).</li>
              <li>Empfehlung: Kündigung per Einschreiben mit Rückschein versenden.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
