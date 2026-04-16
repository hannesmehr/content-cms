"use client";

import { useState } from "react";

// Prioritäten-Optionen
const PRIORITAETEN = [
  { id: "leichtgewicht", label: "Leichtgewicht", icon: "🪶" },
  { id: "winterfest", label: "Winterfest", icon: "❄️" },
  { id: "sitzgruppe", label: "Große Sitzgruppe", icon: "🛋️" },
  { id: "stockbetten", label: "Stockbetten", icon: "🛏️" },
  { id: "einzelbetten", label: "Einzelbetten", icon: "🛌" },
  { id: "bad", label: "Großes Bad", icon: "🚿" },
  { id: "autark", label: "Autark (Solar/Gas)", icon: "☀️" },
  { id: "garagenmass", label: "Garagenmaß (<2,60m)", icon: "🏠" },
];

// Marken nach Budget
const MARKEN: Record<string, string[]> = {
  "bis-15k": ["Hobby", "Knaus", "Bürstner", "Dethleffs"],
  "15k-30k": ["Fendt", "Hobby", "Knaus", "Bürstner"],
  "30k-50k": ["Fendt", "Tabbert", "LMC", "Dethleffs"],
  "ueber-50k": ["Tabbert", "Knaus Eurostar", "Fendt Tendenza"],
};

// Affiliate-Platzhalter
const affiliateLinks: { name: string; url: string; info: string }[] = [
  // { name: "mobile.de Wohnwagen", url: "https://...", info: "Neue & gebrauchte Wohnwagen" },
  // { name: "Caraworld", url: "https://...", info: "Wohnwagen-Marktplatz" },
  // { name: "TruckScout24", url: "https://...", info: "Gebrauchte Wohnwagen" },
];

function berechneGewichtsklasse(bekannt: boolean, anhaengelast: number) {
  if (!bekannt) {
    return { label: "Leicht bis Mittel", maxGewicht: 1200, status: "warning" as const };
  }
  const maxGewicht = anhaengelast - 100;
  if (maxGewicht <= 1000) return { label: "Leicht", maxGewicht, status: "good" as const };
  if (maxGewicht <= 1500) return { label: "Mittel", maxGewicht, status: "good" as const };
  if (maxGewicht <= 2000) return { label: "Schwer", maxGewicht, status: "good" as const };
  return { label: "Sehr schwer", maxGewicht, status: "good" as const };
}

function berechneEmpfohleneLaenge(reisende: string) {
  if (reisende === "1-2") return "4,0 – 5,5 m";
  if (reisende === "3-4") return "5,5 – 7,0 m";
  return "7,0 – 8,0 m";
}

function berechneGrundriss(reisende: string, prios: string[]) {
  if (reisende === "5+") {
    return { typ: "Etagenbett + klappbare Dinette", beschreibung: "Maximale Schlafplätze für die ganze Familie", beispiel: "Dethleffs Camper" };
  }
  if (reisende === "3-4") {
    if (prios.includes("stockbetten")) {
      return { typ: "Stockbett-Grundriss", beschreibung: "Stockbetten für Kinder, separates Elternbett", beispiel: "Hobby De Luxe" };
    }
    return { typ: "Etagenbett / L-Sitzgruppe", beschreibung: "Flexible Schlafplätze, großzügiger Wohnbereich", beispiel: "Bürstner Premio" };
  }
  // 1-2
  if (prios.includes("einzelbetten")) {
    return { typ: "Einzelbetten hinten", beschreibung: "Zwei getrennte Betten im Heck, bequemer Ein-/Ausstieg", beispiel: "Fendt Bianco" };
  }
  return { typ: "Queensbett + Sitzgruppe", beschreibung: "Bequemes Doppelbett, große Sitzgruppe vorn", beispiel: "Knaus Sport" };
}

function berechneZusatztipps(prios: string[], nutzung: string) {
  const tipps: { icon: string; text: string }[] = [];
  if (nutzung === "ganzjaehrig" || prios.includes("winterfest")) {
    tipps.push({ icon: "❄️", text: "Achte auf ein Winterpaket: isolierte Wasserleitungen, Fußbodenheizung, doppelverglaste Fenster." });
  }
  if (prios.includes("autark")) {
    tipps.push({ icon: "☀️", text: "Für autarkes Stehen: Solaranlage 200W+, 100Ah Lithium-Batterie, 2×11kg Gasflaschen." });
  }
  if (prios.includes("garagenmass")) {
    tipps.push({ icon: "🏠", text: "Modelle unter 2,60m Außenhöhe passen in Standard-Garagen. Achte auf die Aufbau-Höhe im Datenblatt." });
  }
  if (prios.includes("leichtgewicht")) {
    tipps.push({ icon: "🪶", text: "Alugas statt Stahl-Gasflaschen spart ca. 8 kg pro Flasche. Auch Alu-Felgen und Leichtbau-Möbel helfen." });
  }
  return tipps;
}

export function WohnwagenFinder() {
  const [reisende, setReisende] = useState("1-2");
  const [nutzung, setNutzung] = useState("urlaub");
  const [zugfahrzeugBekannt, setZugfahrzeugBekannt] = useState(true);
  const [anhaengelast, setAnhaengelast] = useState(1500);
  const [budget, setBudget] = useState("15k-30k");
  const [gebraucht, setGebraucht] = useState(false);
  const [prioritaeten, setPrioritaeten] = useState<string[]>([]);

  const togglePrioritaet = (id: string) => {
    setPrioritaeten((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  // Berechnungen
  const gewichtsklasse = berechneGewichtsklasse(zugfahrzeugBekannt, anhaengelast);
  const empfohleneLaenge = berechneEmpfohleneLaenge(reisende);
  const grundriss = berechneGrundriss(reisende, prioritaeten);
  const marken = MARKEN[budget] || MARKEN["15k-30k"];
  const zusatztipps = berechneZusatztipps(prioritaeten, nutzung);

  const preisklasseLabel: Record<string, string> = {
    "bis-15k": "Bis 15.000 € (gebraucht)",
    "15k-30k": "15.000 – 30.000 €",
    "30k-50k": "30.000 – 50.000 €",
    "ueber-50k": "Über 50.000 €",
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600";

  return (
    <div className="space-y-6">
      {/* Reisende */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-800">
          Wie viele Personen reisen mit?
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: "1-2", label: "1–2 Personen" },
            { value: "3-4", label: "3–4 (Familie)" },
            { value: "5+", label: "5+ (Großfamilie)" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setReisende(opt.value)}
              className={`rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition ${
                reisende === opt.value
                  ? "border-primary-600 bg-primary-50 text-primary-700"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Nutzung */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Wie nutzt du den Wohnwagen?
        </label>
        <select
          value={nutzung}
          onChange={(e) => setNutzung(e.target.value)}
          className={inputClass}
        >
          <option value="wochenende">Wochenendtrips</option>
          <option value="urlaub">2–3 Wochen Urlaub</option>
          <option value="dauercamping">Dauercamping</option>
          <option value="ganzjaehrig">Ganzjährig / Wintercamping</option>
        </select>
      </div>

      {/* Zugfahrzeug */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-800">Zugfahrzeug</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setZugfahrzeugBekannt(!zugfahrzeugBekannt)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                zugfahrzeugBekannt ? "bg-primary-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                  zugfahrzeugBekannt ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <label className="text-sm font-medium text-gray-700">
              Anhängelast bekannt
            </label>
          </div>

          {zugfahrzeugBekannt ? (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Max. Anhängelast (kg)
              </label>
              <input
                type="number"
                value={anhaengelast}
                onChange={(e) => setAnhaengelast(parseInt(e.target.value) || 0)}
                className={inputClass}
                min={500}
                max={3500}
                step={100}
              />
              <p className="mt-1 text-xs text-gray-500">
                Findest du im Fahrzeugschein (Feld O.1) oder in der Bedienungsanleitung.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
              <p className="text-sm text-yellow-800">
                <strong>Tipp:</strong> Ohne Anhängelast empfehlen wir leichtere Modelle bis
                ca. 1.200 kg. Die Anhängelast findest du im Fahrzeugschein unter Feld O.1.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Budget */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-800">Budget</h3>
        <div className="space-y-3">
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className={inputClass}
          >
            <option value="bis-15k">Bis 15.000 €</option>
            <option value="15k-30k">15.000 – 30.000 €</option>
            <option value="30k-50k">30.000 – 50.000 €</option>
            <option value="ueber-50k">Über 50.000 €</option>
          </select>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setGebraucht(!gebraucht)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                gebraucht ? "bg-primary-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                  gebraucht ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <label className="text-sm font-medium text-gray-700">
              Gebraucht in Betracht
            </label>
          </div>
          {gebraucht && (
            <p className="text-xs text-gray-500">
              Gebrauchte Wohnwagen bieten oft ein besseres Preis-Leistungs-Verhältnis.
              Achte auf eine aktuelle Dichtheitsprüfung!
            </p>
          )}
        </div>
      </div>

      {/* Prioritäten */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-800">
          Was ist dir besonders wichtig? (max. 3)
        </label>
        <div className="flex flex-wrap gap-2">
          {PRIORITAETEN.map((prio) => {
            const selected = prioritaeten.includes(prio.id);
            const disabled = !selected && prioritaeten.length >= 3;
            return (
              <button
                key={prio.id}
                type="button"
                onClick={() => togglePrioritaet(prio.id)}
                disabled={disabled}
                className={`rounded-full border-2 px-3 py-1.5 text-sm font-medium transition ${
                  selected
                    ? "border-primary-600 bg-primary-50 text-primary-700"
                    : disabled
                      ? "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                {prio.icon} {prio.label}
              </button>
            );
          })}
        </div>
        {prioritaeten.length === 0 && (
          <p className="mt-1 text-xs text-gray-400">Optional — verfeinert die Empfehlung</p>
        )}
      </div>

      {/* Ergebnis */}
      <div className="rounded-lg border-2 border-primary-600 bg-primary-50 p-6">
        <h3 className="mb-4 text-lg font-bold text-gray-900">Dein Wohnwagen-Profil</h3>

        <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Gewichtsklasse */}
          <div className="rounded-lg bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Gewichtsklasse
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{gewichtsklasse.label}</p>
            <p className="text-xs text-gray-500">
              max. {gewichtsklasse.maxGewicht.toLocaleString("de-DE")} kg
            </p>
            {!zugfahrzeugBekannt && (
              <span className="mt-1 inline-block rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                geschätzt
              </span>
            )}
          </div>

          {/* Länge */}
          <div className="rounded-lg bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Empfohlene Länge
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{empfohleneLaenge}</p>
            <p className="text-xs text-gray-500">
              für {reisende === "1-2" ? "1–2" : reisende === "3-4" ? "3–4" : "5+"} Personen
            </p>
          </div>

          {/* Grundriss */}
          <div className="rounded-lg bg-white p-4 text-center shadow-sm sm:col-span-2 lg:col-span-1">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Grundrisstyp
            </p>
            <p className="mt-1 text-lg font-bold text-primary-700">{grundriss.typ}</p>
            <p className="text-xs text-gray-500">{grundriss.beschreibung}</p>
            <p className="mt-1 text-xs text-gray-400">z.B. {grundriss.beispiel}</p>
          </div>
        </div>

        {/* Marken */}
        <div className="mb-4">
          <p className="mb-2 text-sm font-medium text-gray-700">Passende Marken:</p>
          <div className="flex flex-wrap gap-2">
            {marken.map((m) => (
              <span
                key={m}
                className="rounded-full bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm"
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Preisklasse */}
        <div className="rounded-md bg-white/60 p-3">
          <p className="text-sm text-gray-700">
            <strong>Preisklasse:</strong> {preisklasseLabel[budget]}
            {gebraucht && " (auch gebraucht)"}
          </p>
        </div>
      </div>

      {/* Kauftipps */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-800">Kauftipps</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex gap-2">
            <span className="shrink-0">📅</span>
            <span>
              <strong>Beste Kaufzeit:</strong> Herbstmessen (September/Oktober) oder
              Saisonende — hier gibt es die besten Angebote.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="shrink-0">🛏️</span>
            <span>
              <strong>Probeliegen!</strong> Den Grundriss vor Ort testen. Maße auf dem
              Papier fühlen sich anders an als in der Realität.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="shrink-0">💧</span>
            <span>
              <strong>Gebraucht:</strong> Immer eine aktuelle Dichtheitsprüfung
              verlangen. Feuchtigkeit ist der größte Feind des Wohnwagens.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="shrink-0">🧰</span>
            <span>
              <strong>Zubehör einplanen:</strong> Vorzelt, Stützen, Geschirr, Chemie-WC
              — rechne mit 10–15% des Kaufpreises zusätzlich.
            </span>
          </li>
        </ul>
      </div>

      {/* Bedingte Zusatztipps */}
      {zusatztipps.length > 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-800">
            Basierend auf deinen Prioritäten
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            {zusatztipps.map((tipp, i) => (
              <li key={i} className="flex gap-2">
                <span className="shrink-0">{tipp.icon}</span>
                <span>{tipp.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Nutzungs-Hinweis */}
      {nutzung === "dauercamping" && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
          <p className="text-sm text-green-800">
            <strong>Dauercamping-Tipp:</strong> Achte auf einen stabilen Unterboden,
            gute Isolierung und ein großes Vorzelt für zusätzlichen Wohnraum. Viele
            Dauercamper investieren in ein Vollvorzelt (Größe passend zum Umlaufmaß).
          </p>
        </div>
      )}

      {nutzung === "ganzjaehrig" && !prioritaeten.includes("winterfest") && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p className="text-sm text-blue-800">
            <strong>Wintercamping:</strong> Bei ganzjähriger Nutzung ist ein Winterpaket
            Pflicht: isolierte Wasserleitungen, Fußbodenheizung, doppelverglaste Fenster
            und eine leistungsstarke Heizung (z.B. Truma Combi 6).
          </p>
        </div>
      )}

      {/* Hinweis */}
      <p className="text-xs text-gray-400">
        Die Empfehlungen basieren auf typischen Erfahrungswerten und ersetzen keine
        individuelle Beratung beim Händler. Preise und Verfügbarkeit können abweichen.
      </p>

      {/* Affiliate-Bereich */}
      {affiliateLinks.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
            Anzeige
          </p>
          <h3 className="mb-3 text-sm font-semibold text-gray-800">
            Wohnwagen suchen & vergleichen
          </h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {affiliateLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="nofollow sponsored noopener"
                className="rounded-lg border border-gray-200 p-3 text-center transition hover:border-primary-600 hover:shadow-sm"
              >
                <p className="font-medium text-gray-900">{link.name}</p>
                <p className="mt-1 text-xs text-gray-500">{link.info}</p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
