"use client";

import { useState, useMemo } from "react";

interface Frage {
  kategorie: string;
  frage: string;
  optionen: [string, string, string];
  richtig: number; // 0, 1 or 2
  erklaerung: string;
}

const fragenPool: Frage[] = [
  // Vorfahrt
  {
    kategorie: "Vorfahrt",
    frage: "Sie kommen an eine Kreuzung ohne Verkehrszeichen. Wer hat Vorfahrt?",
    optionen: ["Der von links kommende", "Der von rechts kommende", "Der schnellere Fahrer"],
    richtig: 1,
    erklaerung: "An Kreuzungen ohne Verkehrszeichen gilt die Regel 'rechts vor links'. Der von rechts kommende Verkehrsteilnehmer hat Vorfahrt.",
  },
  {
    kategorie: "Vorfahrt",
    frage: "Was bedeutet ein abgesenkter Bordstein?",
    optionen: ["Sie haben Vorfahrt", "Sie müssen Vorfahrt gewähren", "Es gilt rechts vor links"],
    richtig: 1,
    erklaerung: "Wer über einen abgesenkten Bordstein in eine Straße einfährt, muss allen anderen Verkehrsteilnehmern Vorfahrt gewähren.",
  },
  {
    kategorie: "Vorfahrt",
    frage: "Welches Verkehrszeichen ordnet an: 'Vorfahrt gewähren'?",
    optionen: ["Dreieck auf der Spitze (weiß, rot umrandet)", "Achteckiges rotes Schild", "Runder blauer Pfeil"],
    richtig: 0,
    erklaerung: "Das auf der Spitze stehende Dreieck mit rotem Rand bedeutet 'Vorfahrt gewähren'. Das achteckige rote Schild ist das Stoppschild.",
  },
  {
    kategorie: "Vorfahrt",
    frage: "Du fährst auf einer Vorfahrtstraße. Musst du trotzdem auf Querverkehr achten?",
    optionen: ["Nein, Vorfahrt ist Vorfahrt", "Ja, immer", "Nur bei schlechter Sicht"],
    richtig: 1,
    erklaerung: "Auch auf einer Vorfahrtstraße musst du stets auf den Querverkehr achten. Andere Verkehrsteilnehmer könnten deine Vorfahrt missachten.",
  },
  {
    kategorie: "Vorfahrt",
    frage: "An einem Kreisverkehr mit dem Zeichen 'Vorfahrt gewähren' — wer hat Vorfahrt?",
    optionen: ["Wer im Kreisverkehr fährt", "Wer in den Kreisverkehr einfährt", "Wer von rechts kommt"],
    richtig: 0,
    erklaerung: "Ist am Kreisverkehr das Zeichen 'Vorfahrt gewähren' angebracht, hat der Verkehr im Kreisverkehr Vorfahrt vor dem einfahrenden Verkehr.",
  },
  {
    kategorie: "Vorfahrt",
    frage: "Du biegst von einer Vorfahrtstraße nach links ab. Worauf musst du achten?",
    optionen: ["Nur auf den Gegenverkehr", "Auf Gegenverkehr und nachfolgenden Verkehr", "Du hast immer Vorrang"],
    richtig: 1,
    erklaerung: "Beim Linksabbiegen musst du den Gegenverkehr durchlassen und auf den nachfolgenden Verkehr achten, auch wenn du auf der Vorfahrtstraße sind.",
  },

  // Verkehrszeichen
  {
    kategorie: "Verkehrszeichen",
    frage: "Was bedeutet ein rundes Schild mit rotem Rand und der Zahl '30'?",
    optionen: ["Mindestgeschwindigkeit 30 km/h", "Höchstgeschwindigkeit 30 km/h", "Empfohlene Geschwindigkeit 30 km/h"],
    richtig: 1,
    erklaerung: "Ein rundes Schild mit rotem Rand zeigt ein Verbot an. Die Zahl 30 bedeutet, dass maximal 30 km/h gefahren werden darf.",
  },
  {
    kategorie: "Verkehrszeichen",
    frage: "Was bedeutet ein blaues rundes Schild mit der Zahl '60'?",
    optionen: ["Höchstgeschwindigkeit 60 km/h", "Mindestgeschwindigkeit 60 km/h", "Empfohlene Geschwindigkeit 60 km/h"],
    richtig: 1,
    erklaerung: "Ein blaues rundes Schild zeigt ein Gebot an. Die Zahl 60 bedeutet eine Mindestgeschwindigkeit von 60 km/h.",
  },
  {
    kategorie: "Verkehrszeichen",
    frage: "Was zeigt ein dreieckiges Warnschild mit einem Ausrufezeichen an?",
    optionen: ["Allgemeine Gefahrstelle", "Baustelle voraus", "Vorfahrt gewähren"],
    richtig: 0,
    erklaerung: "Das dreieckige Warnschild mit Ausrufezeichen warnt vor einer allgemeinen Gefahrstelle. Zusatzzeichen können die Art der Gefahr präzisieren.",
  },
  {
    kategorie: "Verkehrszeichen",
    frage: "Was bedeutet ein rundes Schild mit rotem Rand und zwei Autos (eins rot)?",
    optionen: ["Überholverbot für alle", "Überholverbot für LKW", "Einbahnstraße"],
    richtig: 0,
    erklaerung: "Dieses Zeichen bedeutet: Überholen von mehrspurigen Kraftfahrzeugen und Krafträdern mit Beiwagen ist verboten.",
  },
  {
    kategorie: "Verkehrszeichen",
    frage: "Was bedeutet ein weißes Schild mit schwarzem Ortsnamen?",
    optionen: ["Innerhalb geschlossener Ortschaft — 50 km/h", "Hinweis auf ein Naturschutzgebiet", "Nur für Anlieger frei"],
    richtig: 0,
    erklaerung: "Das Ortsschild markiert den Beginn einer geschlossenen Ortschaft. Die zulässige Höchstgeschwindigkeit beträgt 50 km/h, sofern nicht anders ausgeschildert.",
  },
  {
    kategorie: "Verkehrszeichen",
    frage: "Was bedeutet ein blaues quadratisches Schild mit weißem 'P'?",
    optionen: ["Polizei", "Parkplatz", "Pannenhilfe"],
    richtig: 1,
    erklaerung: "Das blaue quadratische Schild mit weißem P zeigt einen Parkplatz an.",
  },

  // Abstand & Geschwindigkeit
  {
    kategorie: "Abstand & Geschwindigkeit",
    frage: "Wie groß muss der Sicherheitsabstand außerorts mindestens sein?",
    optionen: ["1 Sekunde Abstand", "2 Sekunden Abstand (halber Tacho in Metern)", "3 Wagenlängen"],
    richtig: 1,
    erklaerung: "Außerorts gilt als Faustregel: Der Abstand in Metern sollte mindestens dem halben Tachowert entsprechen (z. B. 50 m bei 100 km/h). Das entspricht ca. 2 Sekunden.",
  },
  {
    kategorie: "Abstand & Geschwindigkeit",
    frage: "Wie lang ist der Bremsweg bei 50 km/h (Normalbremsung)?",
    optionen: ["15 Meter", "25 Meter", "50 Meter"],
    richtig: 1,
    erklaerung: "Bremsweg = (Geschwindigkeit ÷ 10)² = (50 ÷ 10)² = 25 Meter. Bei einer Gefahrenbremsung halbiert sich der Bremsweg auf ca. 12,5 m.",
  },
  {
    kategorie: "Abstand & Geschwindigkeit",
    frage: "Wie lang ist der Reaktionsweg bei 50 km/h (1 Sekunde Reaktionszeit)?",
    optionen: ["5 Meter", "10 Meter", "15 Meter"],
    richtig: 2,
    erklaerung: "Reaktionsweg = (Geschwindigkeit ÷ 10) × 3 = (50 ÷ 10) × 3 = 15 Meter. Während dieser Strecke fährt das Fahrzeug ungebremst weiter.",
  },
  {
    kategorie: "Abstand & Geschwindigkeit",
    frage: "Wie hoch ist die zulässige Höchstgeschwindigkeit auf Autobahnen für PKW?",
    optionen: ["120 km/h", "130 km/h (Richtgeschwindigkeit)", "Keine generelle Begrenzung, 130 km/h Richtgeschwindigkeit"],
    richtig: 2,
    erklaerung: "Auf deutschen Autobahnen gibt es keine generelle Geschwindigkeitsbegrenzung für PKW. Die Richtgeschwindigkeit beträgt 130 km/h.",
  },
  {
    kategorie: "Abstand & Geschwindigkeit",
    frage: "Wie verändert sich der Bremsweg bei doppelter Geschwindigkeit?",
    optionen: ["Er verdoppelt sich", "Er verdreifacht sich", "Er vervierfacht sich"],
    richtig: 2,
    erklaerung: "Der Bremsweg steigt mit dem Quadrat der Geschwindigkeit. Doppelte Geschwindigkeit = vierfacher Bremsweg. Bei 100 km/h ist er also 4× so lang wie bei 50 km/h.",
  },
  {
    kategorie: "Abstand & Geschwindigkeit",
    frage: "Wie schnell darfst du innerorts fahren, wenn nichts anderes ausgeschildert ist?",
    optionen: ["30 km/h", "50 km/h", "60 km/h"],
    richtig: 1,
    erklaerung: "Innerorts gilt eine zulässige Höchstgeschwindigkeit von 50 km/h, sofern keine andere Beschilderung vorhanden ist.",
  },

  // Verhalten im Straßenverkehr
  {
    kategorie: "Verhalten im Straßenverkehr",
    frage: "Du näherst dich einem Schulbus mit eingeschalteter Warnblinkanlage. Was musst du tun?",
    optionen: ["Normal weiterfahren", "Nur mit Schrittgeschwindigkeit vorbeifahren", "Mit Schrittgeschwindigkeit vorbeifahren, wenn nötig anhalten"],
    richtig: 2,
    erklaerung: "An einem haltenden Schulbus mit Warnblinkanlage darf man nur mit Schrittgeschwindigkeit (4-7 km/h) vorbeifahren — in beide Richtungen. Wenn nötig, muss man anhalten.",
  },
  {
    kategorie: "Verhalten im Straßenverkehr",
    frage: "Wann musst du das Abblendlicht einschalten?",
    optionen: ["Nur bei Dunkelheit", "Bei Dunkelheit, Dämmerung und schlechter Sicht", "Immer beim Fahren"],
    richtig: 1,
    erklaerung: "Abblendlicht muss bei Dunkelheit, Dämmerung und wenn die Sichtverhältnisse es erfordern (Regen, Nebel, Schnee) eingeschaltet werden.",
  },
  {
    kategorie: "Verhalten im Straßenverkehr",
    frage: "Du kommst als Erster an eine Unfallstelle. Was tust du zuerst?",
    optionen: ["Polizei rufen", "Unfallstelle absichern (Warnblinker, Warndreieck)", "Erste Hilfe leisten"],
    richtig: 1,
    erklaerung: "Zuerst sichere die Unfallstelle ab: Warnblinker an, Warnweste anziehen, Warndreieck aufstellen. Dann Notruf (112) absetzen und Erste Hilfe leisten.",
  },
  {
    kategorie: "Verhalten im Straßenverkehr",
    frage: "Darfst du auf dem Seitenstreifen der Autobahn halten?",
    optionen: ["Ja, jederzeit", "Nein, nur bei Pannen oder Notfällen", "Ja, für kurze Pausen"],
    richtig: 1,
    erklaerung: "Der Seitenstreifen darf nur bei Pannen oder in Notfällen benutzt werden. Halten und Parken auf der Autobahn ist verboten.",
  },
  {
    kategorie: "Verhalten im Straßenverkehr",
    frage: "Du willst auf der Autobahn die Spur wechseln. In welcher Reihenfolge gehst du vor?",
    optionen: [
      "Blinken, Spiegel, Schulterblick, wechseln",
      "Spiegel, Blinken, Schulterblick, wechseln",
      "Schulterblick, Spiegel, Blinken, wechseln",
    ],
    richtig: 1,
    erklaerung: "Die richtige Reihenfolge: 1. Spiegel (Innenspiegel + Außenspiegel), 2. Blinken, 3. Schulterblick (toter Winkel), 4. Spurwechsel durchführen.",
  },
  {
    kategorie: "Verhalten im Straßenverkehr",
    frage: "Was ist der 'tote Winkel'?",
    optionen: [
      "Der Bereich, den man im Rückspiegel nicht sehen kann",
      "Der Bereich hinter dem Fahrzeug",
      "Der Bereich vor der Motorhaube",
    ],
    richtig: 0,
    erklaerung: "Der tote Winkel ist der Bereich neben und schräg hinter dem Fahrzeug, der weder im Innen- noch im Außenspiegel sichtbar ist. Deshalb ist der Schulterblick wichtig.",
  },

  // Technik
  {
    kategorie: "Technik",
    frage: "Was muss regelmäßig am Fahrzeug überprüft werden?",
    optionen: ["Nur der Ölstand", "Reifendruck, Ölstand, Kühlwasser, Beleuchtung", "Nur die Beleuchtung"],
    richtig: 1,
    erklaerung: "Regelmäßig müssen Reifendruck, Ölstand, Kühlwasser, Scheibenwaschanlage und die gesamte Beleuchtung überprüft werden.",
  },
  {
    kategorie: "Technik",
    frage: "Was passiert bei zu geringem Reifendruck?",
    optionen: ["Kürzerer Bremsweg", "Höherer Kraftstoffverbrauch und schlechteres Fahrverhalten", "Besserer Grip"],
    richtig: 1,
    erklaerung: "Zu geringer Reifendruck erhöht den Kraftstoffverbrauch, verschlechtert das Fahrverhalten, verlängert den Bremsweg und führt zu erhöhtem Reifenverschleiß.",
  },
  {
    kategorie: "Technik",
    frage: "Was ist die Mindestprofiltiefe für PKW-Reifen?",
    optionen: ["1,0 mm", "1,6 mm", "2,5 mm"],
    richtig: 1,
    erklaerung: "Die gesetzliche Mindestprofiltiefe für PKW-Reifen beträgt 1,6 mm. Experten empfehlen jedoch mindestens 3 mm bei Sommerreifen und 4 mm bei Winterreifen.",
  },
  {
    kategorie: "Technik",
    frage: "Welche Kontrollleuchte zeigt einen Defekt der Bremsanlage an?",
    optionen: ["Gelbes Dreieck mit Ausrufezeichen", "Roter Kreis mit Ausrufezeichen", "Blaue Lampe"],
    richtig: 1,
    erklaerung: "Die rote Bremsenwarnleuchte (roter Kreis mit Ausrufezeichen) weist auf einen Defekt der Bremsanlage hin. Bei Aufleuchten sofort anhalten und prüfen!",
  },
  {
    kategorie: "Technik",
    frage: "Was bedeutet ABS?",
    optionen: ["Automatisches Brems-System", "Antiblockiersystem", "Allrad-Brems-Steuerung"],
    richtig: 1,
    erklaerung: "ABS steht für Antiblockiersystem. Es verhindert das Blockieren der Räder beim Bremsen und sorgt dafür, dass das Fahrzeug lenkbar bleibt.",
  },
  {
    kategorie: "Technik",
    frage: "Was bewirkt ESP im Fahrzeug?",
    optionen: ["Spart Kraftstoff", "Verhindert das Ausbrechen des Fahrzeugs", "Verbessert die Beschleunigung"],
    richtig: 1,
    erklaerung: "ESP (Elektronisches Stabilitätsprogramm) erkennt instabile Fahrzustände und bremst gezielt einzelne Räder, um ein Ausbrechen oder Schleudern zu verhindern.",
  },
];

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function TheoriepruefungQuiz() {
  const [fragen, setFragen] = useState<Frage[]>(() => shuffleArray(fragenPool).slice(0, 20));
  const [aktuelleFrageIdx, setAktuelleFrageIdx] = useState(0);
  const [antworten, setAntworten] = useState<(number | null)[]>(() => new Array(20).fill(null));
  const [gewaehlt, setGewaehlt] = useState<number | null>(null);
  const [bestaetigt, setBestaetigt] = useState(false);
  const [abgeschlossen, setAbgeschlossen] = useState(false);

  const aktuelleFrage = fragen[aktuelleFrageIdx];
  const richtigeAntworten = antworten.filter((a, i) => a === fragen[i]?.richtig).length;
  const falscheAntworten = antworten.filter((a, i) => a !== null && a !== fragen[i]?.richtig).length;
  const bestanden = falscheAntworten <= 2;

  function antwortBestaetigen() {
    if (gewaehlt === null) return;
    const neueAntworten = [...antworten];
    neueAntworten[aktuelleFrageIdx] = gewaehlt;
    setAntworten(neueAntworten);
    setBestaetigt(true);
  }

  function naechsteFrage() {
    if (aktuelleFrageIdx < 19) {
      setAktuelleFrageIdx(aktuelleFrageIdx + 1);
      setGewaehlt(null);
      setBestaetigt(false);
    } else {
      setAbgeschlossen(true);
    }
  }

  function neustart() {
    setFragen(shuffleArray(fragenPool).slice(0, 20));
    setAktuelleFrageIdx(0);
    setAntworten(new Array(20).fill(null));
    setGewaehlt(null);
    setBestaetigt(false);
    setAbgeschlossen(false);
  }

  if (abgeschlossen) {
    const prozent = Math.round((richtigeAntworten / 20) * 100);
    return (
      <div className="space-y-6">
        <div className={`rounded-lg border-2 p-6 ${
          bestanden ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
        }`}>
          <div className="text-center mb-6">
            <div className={`inline-flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold text-white ${
              bestanden ? "bg-green-600" : "bg-red-600"
            }`}>
              {prozent}%
            </div>
            <h3 className={`mt-4 text-2xl font-bold ${bestanden ? "text-green-800" : "text-red-800"}`}>
              {bestanden ? "Bestanden!" : "Leider nicht bestanden"}
            </h3>
            <p className={`mt-2 text-sm ${bestanden ? "text-green-700" : "text-red-700"}`}>
              {richtigeAntworten} von 20 Fragen richtig — {falscheAntworten} Fehler
              {bestanden
                ? " (maximal 2 Fehler erlaubt)"
                : ` (maximal 2 Fehler erlaubt, du hattest ${falscheAntworten})`}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-white p-4 shadow-sm text-center">
              <p className="text-sm text-gray-500">Richtig</p>
              <p className="text-2xl font-bold text-green-600">{richtigeAntworten}</p>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm text-center">
              <p className="text-sm text-gray-500">Falsch</p>
              <p className="text-2xl font-bold text-red-600">{falscheAntworten}</p>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm text-center">
              <p className="text-sm text-gray-500">Ergebnis</p>
              <p className="text-2xl font-bold text-primary-700">{prozent}%</p>
            </div>
          </div>

          {/* Übersicht der Fragen */}
          <div className="mt-6 space-y-2">
            <h4 className="font-semibold text-gray-900">Fragenübersicht</h4>
            {fragen.map((f, idx) => {
              const userAntwort = antworten[idx];
              const korrekt = userAntwort === f.richtig;
              return (
                <div key={idx} className={`rounded-lg p-3 text-sm ${korrekt ? "bg-green-50" : "bg-red-50"}`}>
                  <div className="flex items-start gap-2">
                    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                      korrekt ? "bg-green-600" : "bg-red-600"
                    }`}>
                      {korrekt ? "\u2713" : "\u2717"}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{f.frage}</p>
                      {!korrekt && (
                        <p className="mt-1 text-gray-600">
                          Richtige Antwort: {f.optionen[f.richtig]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={neustart}
            className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition"
          >
            Neuer Versuch
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Fortschritt */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">
          Frage {aktuelleFrageIdx + 1} von 20
        </span>
        <span className="text-xs text-gray-500">
          Kategorie: {aktuelleFrage.kategorie}
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-primary-600 transition-all duration-300"
          style={{ width: `${((aktuelleFrageIdx + 1) / 20) * 100}%` }}
        />
      </div>

      {/* Frage */}
      <div className="rounded-lg border-2 border-primary-600 bg-primary-50 p-6">
        <span className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700 mb-3">
          {aktuelleFrage.kategorie}
        </span>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {aktuelleFrage.frage}
        </h3>

        <div className="space-y-2">
          {aktuelleFrage.optionen.map((option, idx) => {
            let className = "w-full rounded-lg border-2 px-4 py-3 text-left text-sm transition cursor-pointer ";

            if (bestaetigt) {
              if (idx === aktuelleFrage.richtig) {
                className += "border-green-500 bg-green-50 text-green-800 font-medium";
              } else if (idx === gewaehlt && idx !== aktuelleFrage.richtig) {
                className += "border-red-500 bg-red-50 text-red-800";
              } else {
                className += "border-gray-200 bg-white text-gray-500";
              }
            } else {
              if (idx === gewaehlt) {
                className += "border-primary-600 bg-primary-100 text-primary-800 font-medium";
              } else {
                className += "border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => !bestaetigt && setGewaehlt(idx)}
                disabled={bestaetigt}
                className={className}
              >
                <span className="mr-2 font-bold">{String.fromCharCode(65 + idx)}.</span>
                {option}
              </button>
            );
          })}
        </div>

        {bestaetigt && (
          <div className={`mt-4 rounded-lg p-3 text-sm ${
            gewaehlt === aktuelleFrage.richtig ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            <p className="font-medium mb-1">
              {gewaehlt === aktuelleFrage.richtig ? "Richtig!" : "Leider falsch!"}
            </p>
            <p>{aktuelleFrage.erklaerung}</p>
          </div>
        )}

        <div className="mt-4 flex justify-end gap-3">
          {!bestaetigt ? (
            <button
              onClick={antwortBestaetigen}
              disabled={gewaehlt === null}
              className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Antwort bestätigen
            </button>
          ) : (
            <button
              onClick={naechsteFrage}
              className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700 transition"
            >
              {aktuelleFrageIdx < 19 ? "Nächste Frage" : "Ergebnis anzeigen"}
            </button>
          )}
        </div>
      </div>

      {/* Zwischenstand */}
      <div className="flex gap-4 text-sm">
        <span className="text-green-600 font-medium">
          Richtig: {antworten.filter((a, i) => a === fragen[i]?.richtig).length}
        </span>
        <span className="text-red-600 font-medium">
          Falsch: {antworten.filter((a, i) => a !== null && a !== fragen[i]?.richtig).length}
        </span>
        <span className="text-gray-400">
          Offen: {antworten.filter((a) => a === null).length}
        </span>
      </div>

      <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
        <p className="font-medium text-gray-700 mb-1">Hinweis</p>
        <p>
          Diese Übungsfragen dienen zur Vorbereitung auf die Theorieprüfung. In der echten Prüfung
          werden 30 Fragen gestellt, von denen du maximal 10 Fehlerpunkte haben dürfen. Hier
          simulieren wir 20 Fragen mit maximal 2 Fehlern zum Bestehen.
        </p>
      </div>
    </div>
  );
}
