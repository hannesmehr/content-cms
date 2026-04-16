"use client";

import { useState } from "react";

interface Kostenposten {
  label: string;
  key: string;
  min: number;
  max: number;
  default: number;
  optional?: boolean;
  enabled?: boolean;
}

const kostenpostenDef: Kostenposten[] = [
  { label: "Heizung / Warmwasser", key: "heizung", min: 1.2, max: 2.4, default: 1.7 },
  { label: "Kaltwasser / Abwasser", key: "wasser", min: 0.35, max: 0.7, default: 0.5 },
  { label: "Müllabfuhr", key: "muell", min: 0.18, max: 0.4, default: 0.28 },
  { label: "Grundsteuer", key: "grundsteuer", min: 0.15, max: 0.35, default: 0.22 },
  { label: "Gebäudeversicherung", key: "versicherung", min: 0.12, max: 0.3, default: 0.2 },
  { label: "Hausmeister", key: "hausmeister", min: 0.12, max: 0.35, default: 0.2 },
  { label: "Treppenhausreinigung", key: "reinigung", min: 0.06, max: 0.25, default: 0.12 },
  { label: "Aufzug", key: "aufzug", min: 0, max: 0.2, default: 0.12, optional: true, enabled: false },
  { label: "Gartenpflege", key: "garten", min: 0, max: 0.12, default: 0.06, optional: true, enabled: false },
  { label: "Straßenreinigung", key: "strasse", min: 0.04, max: 0.12, default: 0.07 },
];

// Bundesdurchschnitt ca. 3,15 €/m²/Monat (Stand 2026, inkl. Energiepreisanstieg)
const BUNDESDURCHSCHNITT_PRO_QM_MONAT = 3.15;

export function NebenkostenRechner() {
  const [wohnflaeche, setWohnflaeche] = useState<number>(65);
  const [personen, setPersonen] = useState<number>(2);
  const [bautyp, setBautyp] = useState<string>("altbau");
  const [region, setRegion] = useState<string>("grossstadt");
  const [berechnet, setBerechnet] = useState(false);

  const [werte, setWerte] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const k of kostenpostenDef) {
      init[k.key] = k.default;
    }
    return init;
  });

  const [aktiviert, setAktiviert] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const k of kostenpostenDef) {
      init[k.key] = k.optional ? (k.enabled ?? false) : true;
    }
    return init;
  });

  const formatEur = (val: number) =>
    val.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Regionsfaktor
  const regionsFaktor = region === "grossstadt" ? 1.15 : region === "mittelstadt" ? 1.0 : 0.85;
  // Bautypfaktor
  const bautypFaktor = bautyp === "altbau" ? 1.1 : 1.0;
  // Personenfaktor (Wasserverbrauch etc.)
  const personenFaktor = personen <= 1 ? 0.85 : personen === 2 ? 1.0 : personen === 3 ? 1.1 : 1.2;

  // Berechne Kosten pro Posten
  const kostenDetails = kostenpostenDef.map((k) => {
    const aktiv = aktiviert[k.key];
    const basisWert = werte[k.key];
    let faktor = regionsFaktor * bautypFaktor;
    if (k.key === "wasser" || k.key === "heizung") {
      faktor *= personenFaktor;
    }
    const proQmMonat = aktiv ? basisWert * faktor / 12 : 0;
    const proQmJahr = aktiv ? basisWert * faktor : 0;
    const jahreskosten = proQmJahr * wohnflaeche;
    const monatskosten = jahreskosten / 12;
    return {
      ...k,
      aktiv,
      proQmMonat,
      proQmJahr,
      monatskosten,
      jahreskosten,
    };
  });

  const gesamtJahr = kostenDetails.reduce((s, k) => s + k.jahreskosten, 0);
  const gesamtMonat = gesamtJahr / 12;
  const proQmMonatGesamt = wohnflaeche > 0 ? gesamtMonat / wohnflaeche : 0;
  const bundesdurchschnittMonat = BUNDESDURCHSCHNITT_PRO_QM_MONAT * wohnflaeche;
  const differenz = gesamtMonat - bundesdurchschnittMonat;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Wohnfläche (m²)
          </label>
          <input
            type="number"
            min={10}
            step={1}
            value={wohnflaeche}
            onChange={(e) => {
              setWohnflaeche(Math.max(10, Number(e.target.value)));
              setBerechnet(false);
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Personen im Haushalt
          </label>
          <select
            value={personen}
            onChange={(e) => {
              setPersonen(Number(e.target.value));
              setBerechnet(false);
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          >
            <option value={1}>1 Person</option>
            <option value={2}>2 Personen</option>
            <option value={3}>3 Personen</option>
            <option value={4}>4 Personen</option>
            <option value={5}>5+ Personen</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gebäudetyp</label>
          <select
            value={bautyp}
            onChange={(e) => {
              setBautyp(e.target.value);
              setBerechnet(false);
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          >
            <option value="altbau">Altbau</option>
            <option value="neubau">Neubau</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stadt / Region</label>
          <select
            value={region}
            onChange={(e) => {
              setRegion(e.target.value);
              setBerechnet(false);
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          >
            <option value="grossstadt">Großstadt</option>
            <option value="mittelstadt">Mittelstadt</option>
            <option value="kleinstadt">Kleinstadt / ländlich</option>
          </select>
        </div>
      </div>

      {/* Kostenposten mit Slidern */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-4 text-sm font-semibold text-gray-800">
          Kostenposten anpassen (€/m²/Jahr, Basiswert)
        </h3>
        <div className="space-y-4">
          {kostenpostenDef.map((k) => (
            <div key={k.key} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {k.optional && (
                    <input
                      type="checkbox"
                      checked={aktiviert[k.key]}
                      onChange={(e) => {
                        setAktiviert((prev) => ({ ...prev, [k.key]: e.target.checked }));
                        setBerechnet(false);
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                    />
                  )}
                  <span className="text-sm text-gray-700">{k.label}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formatEur(werte[k.key])} €/m²
                </span>
              </div>
              <input
                type="range"
                min={k.min}
                max={k.max}
                step={0.01}
                value={werte[k.key]}
                disabled={k.optional && !aktiviert[k.key]}
                onChange={(e) => {
                  setWerte((prev) => ({ ...prev, [k.key]: Number(e.target.value) }));
                  setBerechnet(false);
                }}
                className="w-full accent-primary-600"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>{formatEur(k.min)} €</span>
                <span>{formatEur(k.max)} €</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => setBerechnet(true)}
        className="w-full rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 transition-colors sm:w-auto"
      >
        Nebenkosten berechnen
      </button>

      {berechnet && (
        <div className="rounded-lg border-2 border-primary-600 bg-primary-50 p-6">
          <h3 className="mb-4 text-lg font-bold text-gray-900">Nebenkostenübersicht</h3>

          <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Monatlich gesamt
              </p>
              <p className="mt-1 text-2xl font-bold text-primary-700">
                {formatEur(gesamtMonat)} €
              </p>
            </div>
            <div className="rounded-lg bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Jährlich gesamt
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {formatEur(gesamtJahr)} €
              </p>
            </div>
            <div className="rounded-lg bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Pro m²/Monat
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {formatEur(proQmMonatGesamt)} €
              </p>
            </div>
            <div className="rounded-lg bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Bundesdurchschnitt
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-500">
                {formatEur(BUNDESDURCHSCHNITT_PRO_QM_MONAT)} €/m²
              </p>
            </div>
          </div>

          {/* Vergleich Bundesdurchschnitt */}
          <div className={`mb-4 rounded-lg p-3 text-sm font-medium ${
            differenz > 0
              ? "bg-yellow-50 text-yellow-800 border border-yellow-200"
              : "bg-green-50 text-green-800 border border-green-200"
          }`}>
            {differenz > 0
              ? `Deine Nebenkosten liegen ${formatEur(Math.abs(differenz))} € / Monat über dem Bundesdurchschnitt.`
              : `Deine Nebenkosten liegen ${formatEur(Math.abs(differenz))} € / Monat unter dem Bundesdurchschnitt.`}
          </div>

          {/* Aufschlüsselung */}
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h4 className="mb-3 text-sm font-semibold text-gray-800">
              Aufschlüsselung nach Kostenposten
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    <th className="pb-2 pr-4">Kostenart</th>
                    <th className="pb-2 pr-4 text-right">Monatlich</th>
                    <th className="pb-2 text-right">Jährlich</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {kostenDetails
                    .filter((k) => k.aktiv)
                    .map((k) => (
                      <tr key={k.key}>
                        <td className="py-2 pr-4 text-gray-700">{k.label}</td>
                        <td className="py-2 pr-4 text-right font-medium text-gray-900">
                          {formatEur(k.monatskosten)} €
                        </td>
                        <td className="py-2 text-right font-medium text-gray-900">
                          {formatEur(k.jahreskosten)} €
                        </td>
                      </tr>
                    ))}
                  <tr className="border-t-2 border-gray-300 font-bold">
                    <td className="py-2 pr-4 text-gray-900">Gesamt</td>
                    <td className="py-2 pr-4 text-right text-primary-700">
                      {formatEur(gesamtMonat)} €
                    </td>
                    <td className="py-2 text-right text-primary-700">
                      {formatEur(gesamtJahr)} €
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
            <strong>Hinweis:</strong> Die Werte basieren auf dem Betriebskostenspiegel des Deutschen
            Mieterbundes und Durchschnittswerten. Die tatsächlichen Nebenkosten können je nach
            Verbrauchsverhalten, Gebäudezustand und Region abweichen. Prüfe deine
            Nebenkostenabrechnung gemäß § 556 BGB sorgfältig auf Umlagefähigkeit.
          </div>
        </div>
      )}
    </div>
  );
}
