"use client";

import { useState } from "react";

export function MieterhoehungsRechner() {
  const [aktuelleKaltmiete, setAktuelleKaltmiete] = useState<number>(8.5);
  const [wohnflaeche, setWohnflaeche] = useState<number>(65);
  const [neueMiete, setNeueMiete] = useState<number>(10.0);
  const [vergleichsmiete, setVergleichsmiete] = useState<number>(11.0);
  const [letztErhoehungMonate, setLetztErhoehungMonate] = useState<number>(18);
  const [mietpreisbremse, setMietpreisbremse] = useState(false);
  const [mietdauer, setMietdauer] = useState<number>(4);
  const [berechnet, setBerechnet] = useState(false);

  const formatEur = (val: number) =>
    val.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Berechnungen
  const aktuelleGesamtmiete = aktuelleKaltmiete * wohnflaeche;
  const neueGesamtmiete = neueMiete * wohnflaeche;
  const erhoehungAbsolut = neueMiete - aktuelleKaltmiete;
  const erhoehungProzent = aktuelleKaltmiete > 0 ? (erhoehungAbsolut / aktuelleKaltmiete) * 100 : 0;

  // Kappungsgrenze: 20% in 3 Jahren (15% in angespannten Märkten / Mietpreisbremse-Gebiet)
  const kappungsgrenze = mietpreisbremse ? 15 : 20;
  const maxKappungsErhoehung = aktuelleKaltmiete * (kappungsgrenze / 100);
  const maxKappungsMiete = aktuelleKaltmiete + maxKappungsErhoehung;

  // Vergleichsmiete als Obergrenze
  const maxNachVergleichsmiete = vergleichsmiete;

  // Maximal zulässige Miete = Minimum aus Kappungsgrenze und Vergleichsmiete
  const maxZulaessigeMiete = Math.min(maxKappungsMiete, maxNachVergleichsmiete);

  // Mietpreisbremse: Neuvermietung max 10% über Vergleichsmiete
  const maxMietpreisbremse = vergleichsmiete * 1.1;

  // Prüfung Mindestfrist (15 Monate)
  const fristEingehalten = letztErhoehungMonate >= 15;

  // Prüfung Kappungsgrenze
  const kappungsgrenzeEingehalten = neueMiete <= maxKappungsMiete;

  // Prüfung Vergleichsmiete
  const vergleichsmieteEingehalten = neueMiete <= vergleichsmiete;

  // Prüfung Mietpreisbremse (nur relevant bei Neuvermietung)
  const mietpreisbremseEingehalten = !mietpreisbremse || neueMiete <= maxMietpreisbremse;

  // Gesamtergebnis
  const zulaessig = fristEingehalten && kappungsgrenzeEingehalten && vergleichsmieteEingehalten;

  const gruende: string[] = [];
  if (!fristEingehalten) {
    gruende.push(
      `Die letzte Mieterhöhung liegt erst ${letztErhoehungMonate} Monate zurück. Gemäß § 558 Abs. 1 BGB müssen mindestens 15 Monate seit der letzten Mieterhöhung vergangen sein.`
    );
  }
  if (!kappungsgrenzeEingehalten) {
    gruende.push(
      `Die geforderte Erhöhung von ${formatEur(erhoehungProzent)}% überschreitet die Kappungsgrenze von ${kappungsgrenze}% in 3 Jahren (§ 558 Abs. 3 BGB). Maximal zulässig wäre ${formatEur(maxKappungsMiete)} €/m².`
    );
  }
  if (!vergleichsmieteEingehalten) {
    gruende.push(
      `Die geforderte Miete von ${formatEur(neueMiete)} €/m² übersteigt die ortsübliche Vergleichsmiete von ${formatEur(vergleichsmiete)} €/m² (§ 558 Abs. 1 BGB).`
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Aktuelle Kaltmiete (€/m²)
          </label>
          <input
            type="number"
            min={0}
            step={0.1}
            value={aktuelleKaltmiete}
            onChange={(e) => {
              setAktuelleKaltmiete(Math.max(0, Number(e.target.value)));
              setBerechnet(false);
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Wohnfläche (m²)
          </label>
          <input
            type="number"
            min={1}
            step={1}
            value={wohnflaeche}
            onChange={(e) => {
              setWohnflaeche(Math.max(1, Number(e.target.value)));
              setBerechnet(false);
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Geforderte neue Kaltmiete (€/m²)
          </label>
          <input
            type="number"
            min={0}
            step={0.1}
            value={neueMiete}
            onChange={(e) => {
              setNeueMiete(Math.max(0, Number(e.target.value)));
              setBerechnet(false);
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ortsübliche Vergleichsmiete (€/m²)
          </label>
          <input
            type="number"
            min={0}
            step={0.1}
            value={vergleichsmiete}
            onChange={(e) => {
              setVergleichsmiete(Math.max(0, Number(e.target.value)));
              setBerechnet(false);
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Letzte Mieterhöhung vor (Monaten)
          </label>
          <input
            type="number"
            min={0}
            step={1}
            value={letztErhoehungMonate}
            onChange={(e) => {
              setLetztErhoehungMonate(Math.max(0, Number(e.target.value)));
              setBerechnet(false);
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mietdauer (Jahre)
          </label>
          <input
            type="number"
            min={0}
            step={1}
            value={mietdauer}
            onChange={(e) => {
              setMietdauer(Math.max(0, Number(e.target.value)));
              setBerechnet(false);
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={mietpreisbremse}
              onChange={(e) => {
                setMietpreisbremse(e.target.checked);
                setBerechnet(false);
              }}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
            />
            <span className="text-sm font-medium text-gray-700">
              Mietpreisbremse-Gebiet (angespannter Wohnungsmarkt)
            </span>
          </label>
        </div>
      </div>

      <button
        onClick={() => setBerechnet(true)}
        className="w-full rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 transition-colors sm:w-auto"
      >
        Mieterhöhung prüfen
      </button>

      {berechnet && (
        <div className="rounded-lg border-2 border-primary-600 bg-primary-50 p-6">
          <h3 className="mb-4 text-lg font-bold text-gray-900">Ergebnis der Prüfung</h3>

          <div className="mb-4">
            <div
              className={`rounded-lg p-4 text-center text-lg font-bold ${
                zulaessig
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {zulaessig
                ? "Die Mieterhöhung ist voraussichtlich zulässig"
                : "Die Mieterhöhung ist voraussichtlich unzulässig"}
            </div>
          </div>

          <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Aktuelle Miete gesamt
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {formatEur(aktuelleGesamtmiete)} €
              </p>
              <p className="text-xs text-gray-500">{formatEur(aktuelleKaltmiete)} €/m²</p>
            </div>

            <div className="rounded-lg bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Geforderte neue Miete
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {formatEur(neueGesamtmiete)} €
              </p>
              <p className="text-xs text-gray-500">
                +{formatEur(erhoehungProzent)}% ({formatEur(erhoehungAbsolut)} €/m²)
              </p>
            </div>

            <div className="rounded-lg bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Maximal zulässige Miete
              </p>
              <p className="mt-1 text-2xl font-bold text-primary-700">
                {formatEur(maxZulaessigeMiete)} €/m²
              </p>
              <p className="text-xs text-gray-500">
                = {formatEur(maxZulaessigeMiete * wohnflaeche)} € gesamt
              </p>
            </div>
          </div>

          {/* Detailprüfung */}
          <div className="space-y-3 mb-4">
            <h4 className="text-sm font-semibold text-gray-800">Detailprüfung</h4>

            <div className="flex items-start gap-3 rounded-lg bg-white p-3 shadow-sm">
              <span className={`mt-0.5 text-lg ${fristEingehalten ? "text-green-600" : "text-red-600"}`}>
                {fristEingehalten ? "\u2713" : "\u2717"}
              </span>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Mindestfrist 15 Monate ($ 558 Abs. 1 BGB)
                </p>
                <p className="text-xs text-gray-500">
                  Letzte Erhöhung vor {letztErhoehungMonate} Monaten
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-white p-3 shadow-sm">
              <span className={`mt-0.5 text-lg ${kappungsgrenzeEingehalten ? "text-green-600" : "text-red-600"}`}>
                {kappungsgrenzeEingehalten ? "\u2713" : "\u2717"}
              </span>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Kappungsgrenze {kappungsgrenze}% in 3 Jahren ($ 558 Abs. 3 BGB)
                </p>
                <p className="text-xs text-gray-500">
                  Erhöhung: {formatEur(erhoehungProzent)}% | Max. erlaubt: {formatEur(maxKappungsMiete)} €/m²
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-white p-3 shadow-sm">
              <span className={`mt-0.5 text-lg ${vergleichsmieteEingehalten ? "text-green-600" : "text-red-600"}`}>
                {vergleichsmieteEingehalten ? "\u2713" : "\u2717"}
              </span>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Ortsübliche Vergleichsmiete ($ 558 Abs. 1 BGB)
                </p>
                <p className="text-xs text-gray-500">
                  Gefordert: {formatEur(neueMiete)} €/m² | Vergleichsmiete: {formatEur(vergleichsmiete)} €/m²
                </p>
              </div>
            </div>

            {mietpreisbremse && (
              <div className="flex items-start gap-3 rounded-lg bg-white p-3 shadow-sm">
                <span className={`mt-0.5 text-lg ${mietpreisbremseEingehalten ? "text-green-600" : "text-red-600"}`}>
                  {mietpreisbremseEingehalten ? "\u2713" : "\u2717"}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Mietpreisbremse ($ 556d BGB)
                  </p>
                  <p className="text-xs text-gray-500">
                    Bei Neuvermietung max. 10% über Vergleichsmiete: {formatEur(maxMietpreisbremse)} €/m²
                  </p>
                </div>
              </div>
            )}
          </div>

          {!zulaessig && gruende.length > 0 && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800 mb-4">
              <strong>Begründung:</strong>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                {gruende.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
            <strong>Hinweis:</strong> Diese Berechnung dient der Orientierung und ersetzt keine
            Rechtsberatung. Die ortsübliche Vergleichsmiete entnimmst du dem Mietspiegel deiner
            Gemeinde. Bei Unsicherheiten wende dich an einen Mieterverein oder Fachanwalt für
            Mietrecht.
          </div>
        </div>
      )}
    </div>
  );
}
