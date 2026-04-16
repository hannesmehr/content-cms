"use client";

import { useState } from "react";

interface Massnahme {
  label: string;
  maxFoerderQuote: number;
  maxFoerderBetrag: number;
}

const massnahmen: Massnahme[] = [
  { label: "Heizungstausch (z.B. Wärmepumpe)", maxFoerderQuote: 30, maxFoerderBetrag: 30000 },
  { label: "Gebäudehülle / Dämmung", maxFoerderQuote: 20, maxFoerderBetrag: 60000 },
  { label: "Fenster austauschen", maxFoerderQuote: 20, maxFoerderBetrag: 60000 },
  { label: "Komplettsanierung zum Effizienzhaus", maxFoerderQuote: 45, maxFoerderBetrag: 150000 },
];

export function KfwFoerderrechner() {
  const [massnahmeIdx, setMassnahmeIdx] = useState<number>(0);
  const [investition, setInvestition] = useState<number>(50000);
  const [einkommensbonus, setEinkommensbonus] = useState(false);
  const [klimabonus, setKlimabonus] = useState(false);
  const [effizienzbonus, setEffizienzbonus] = useState(false);
  const [berechnet, setBerechnet] = useState(false);

  const m = massnahmen[massnahmeIdx];

  const formatEur = (val: number) =>
    val.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const formatEurShort = (val: number) =>
    val.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  // Basisförderquote
  let basisQuote = m.maxFoerderQuote;

  // Bonusse nur bei Heizungstausch addierbar (vereinfachte Darstellung)
  let bonusQuote = 0;
  if (massnahmeIdx === 0) {
    if (klimabonus) bonusQuote += 20;
    if (einkommensbonus) bonusQuote += 30;
    if (effizienzbonus) bonusQuote += 5;
  }

  // Gesamtquote gedeckelt auf max 70%
  const gesamtQuote = Math.min(basisQuote + bonusQuote, 70);

  // Förderfähige Kosten gedeckelt
  const foerderfaehigeKosten = Math.min(investition, m.maxFoerderBetrag);

  // Max Zuschuss
  const maxZuschuss = Math.round(foerderfaehigeKosten * (gesamtQuote / 100));

  // Eigenanteil
  const eigenanteil = investition - maxZuschuss;

  // Kredit-Vergleich: KfW-Kredit bei 1,5% effektiv über 10 Jahre
  const kreditSumme = eigenanteil;
  const kreditZins = 0.015;
  const kreditLaufzeit = 10;
  const monatsZins = kreditZins / 12;
  const anzahlRaten = kreditLaufzeit * 12;
  const monatsRate =
    kreditSumme > 0
      ? (kreditSumme * monatsZins * Math.pow(1 + monatsZins, anzahlRaten)) /
        (Math.pow(1 + monatsZins, anzahlRaten) - 1)
      : 0;
  const gesamtKreditKosten = monatsRate * anzahlRaten;
  const zinsKosten = gesamtKreditKosten - kreditSumme;

  const handleBerechnen = () => {
    setBerechnet(true);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sanierungsmaßnahme
          </label>
          <select
            value={massnahmeIdx}
            onChange={(e) => {
              setMassnahmeIdx(Number(e.target.value));
              setBerechnet(false);
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          >
            {massnahmen.map((m, i) => (
              <option key={i} value={i}>
                {m.label} (max {m.maxFoerderQuote}% bis {formatEurShort(m.maxFoerderBetrag)} €)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Investitionssumme (€)
          </label>
          <input
            type="number"
            min={0}
            step={1000}
            value={investition}
            onChange={(e) => {
              setInvestition(Math.max(0, Number(e.target.value)));
              setBerechnet(false);
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max. förderfähige Kosten
          </label>
          <div className="flex h-[42px] items-center rounded-lg border border-gray-200 bg-gray-100 px-3 text-sm text-gray-700">
            {formatEurShort(m.maxFoerderBetrag)} €
          </div>
        </div>
      </div>

      {massnahmeIdx === 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-800">
            Zusätzliche Bonusse (nur Heizungstausch)
          </h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={klimabonus}
                onChange={(e) => {
                  setKlimabonus(e.target.checked);
                  setBerechnet(false);
                }}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
              />
              <span className="text-sm text-gray-700">
                Klimageschwindigkeitsbonus (+20%) — Austausch funktionierender fossiler Heizung
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={einkommensbonus}
                onChange={(e) => {
                  setEinkommensbonus(e.target.checked);
                  setBerechnet(false);
                }}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
              />
              <span className="text-sm text-gray-700">
                Einkommensbonus (+30%) — Haushaltseinkommen unter 40.000 €/Jahr
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={effizienzbonus}
                onChange={(e) => {
                  setEffizienzbonus(e.target.checked);
                  setBerechnet(false);
                }}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
              />
              <span className="text-sm text-gray-700">
                Effizienzbonus (+5%) — Natürliches Kältemittel oder Erdwärmepumpe
              </span>
            </label>
          </div>
        </div>
      )}

      <button
        onClick={handleBerechnen}
        className="w-full rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 transition-colors sm:w-auto"
      >
        Förderung berechnen
      </button>

      {berechnet && (
        <div className="rounded-lg border-2 border-primary-600 bg-primary-50 p-6">
          <h3 className="mb-4 text-lg font-bold text-gray-900">Förderergebnis</h3>

          <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Förderquote
              </p>
              <p className="mt-1 text-2xl font-bold text-primary-700">{gesamtQuote}%</p>
              <p className="text-xs text-gray-500">
                {massnahmeIdx === 0 && bonusQuote > 0
                  ? `Basis ${basisQuote}% + Bonus ${bonusQuote}%`
                  : `Basis ${basisQuote}%`}
              </p>
            </div>

            <div className="rounded-lg bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Max. Zuschuss
              </p>
              <p className="mt-1 text-2xl font-bold text-green-700">{formatEur(maxZuschuss)} €</p>
              <p className="text-xs text-gray-500">
                von {formatEurShort(foerderfaehigeKosten)} € förderfähig
              </p>
            </div>

            <div className="rounded-lg bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Eigenanteil
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{formatEur(eigenanteil)} €</p>
              <p className="text-xs text-gray-500">nach Abzug Förderung</p>
            </div>

            <div className="rounded-lg bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Investitionssumme
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {formatEur(investition)} €
              </p>
              <p className="text-xs text-gray-500">Gesamtkosten</p>
            </div>
          </div>

          {/* Visueller Balken */}
          <div className="mb-6">
            <div className="mb-1 flex justify-between text-xs text-gray-600">
              <span>Förderung: {formatEur(maxZuschuss)} €</span>
              <span>Eigenanteil: {formatEur(eigenanteil)} €</span>
            </div>
            <div className="flex h-8 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="flex items-center justify-center bg-green-500 text-xs font-bold text-white transition-all duration-500"
                style={{
                  width: `${investition > 0 ? (maxZuschuss / investition) * 100 : 0}%`,
                }}
              >
                {investition > 0 ? Math.round((maxZuschuss / investition) * 100) : 0}%
              </div>
              <div
                className="flex items-center justify-center bg-gray-400 text-xs font-bold text-white transition-all duration-500"
                style={{
                  width: `${investition > 0 ? (eigenanteil / investition) * 100 : 0}%`,
                }}
              >
                {investition > 0 ? Math.round((eigenanteil / investition) * 100) : 0}%
              </div>
            </div>
          </div>

          {/* Kredit-Vergleich */}
          {eigenanteil > 0 && (
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <h4 className="mb-3 text-sm font-semibold text-gray-800">
                KfW-Kredit für den Eigenanteil (Beispielrechnung)
              </h4>
              <div className="grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-gray-500">Kreditsumme</p>
                  <p className="font-semibold text-gray-900">{formatEur(kreditSumme)} €</p>
                </div>
                <div>
                  <p className="text-gray-500">Monatliche Rate (10 J., 1,5%)</p>
                  <p className="font-semibold text-gray-900">{formatEur(monatsRate)} €</p>
                </div>
                <div>
                  <p className="text-gray-500">Zinskosten gesamt</p>
                  <p className="font-semibold text-gray-900">{formatEur(zinsKosten)} €</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 rounded-lg bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800">
            <strong>Hinweis:</strong> Die angezeigten Werte basieren auf der BEG-Förderung
            (Stand 2026). Die Grundförderung für Heizungstausch beträgt 30%, mit
            Klimageschwindigkeitsbonus (+20%), Einkommensbonus (+30%) und Effizienzbonus (+5%)
            sind bis zu 70% möglich. Die tatsächliche Förderhöhe richtet sich nach den aktuellen
            BEG-Richtlinien. Lass dich von einem Energieberater individuell beraten und prüfe
            die Konditionen auf der{" "}
            <span className="font-medium">KfW-Website</span>.
          </div>
        </div>
      )}
    </div>
  );
}
