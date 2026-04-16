"use client";

import { useState } from "react";

export function ModernisierungsUmlageRechner() {
  const [modernisierungskosten, setModernisierungskosten] = useState<number>(80000);
  const [instandhaltungsanteil, setInstandhaltungsanteil] = useState<number>(30);
  const [foerderung, setFoerderung] = useState<number>(10000);
  const [anzahlWohnungen, setAnzahlWohnungen] = useState<number>(6);
  const [kaltmiete, setKaltmiete] = useState<number>(7.5);
  const [wohnflaeche, setWohnflaeche] = useState<number>(65);

  const formatEur = (val: number) =>
    val.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const formatEurShort = (val: number) =>
    val.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  // Berechnung
  const instandhaltungAbzug = modernisierungskosten * (instandhaltungsanteil / 100);
  const umlagefaehigeKosten = Math.max(
    0,
    modernisierungskosten - instandhaltungAbzug - foerderung
  );

  // § 559 BGB: 8% der umlagefähigen Kosten jährlich
  const jaehrlicheUmlage = umlagefaehigeKosten * 0.08;
  const umlageProWohnung = anzahlWohnungen > 0 ? jaehrlicheUmlage / anzahlWohnungen : 0;
  const monatlicheErhoehung = umlageProWohnung / 12;
  const erhoehungProQm = wohnflaeche > 0 ? monatlicheErhoehung / wohnflaeche : 0;

  // Aktuelle Miete
  const aktuelleMieteGesamt = kaltmiete * wohnflaeche;
  const neueMieteProQm = kaltmiete + erhoehungProQm;
  const neueMieteGesamt = neueMieteProQm * wohnflaeche;

  // Kappungsgrenze § 559 Abs. 3a BGB
  // Max 3 €/m² in 6 Jahren, bei Miete unter 7 €/m² max 2 €/m²
  const kappungsgrenze = kaltmiete < 7 ? 2 : 3;
  const kappungsgrenzeErreicht = erhoehungProQm > kappungsgrenze;
  const effektiveErhoehungProQm = Math.min(erhoehungProQm, kappungsgrenze);
  const effektiveMonatlicheErhoehung = effektiveErhoehungProQm * wohnflaeche;
  const effektiveNeueMiete = kaltmiete + effektiveErhoehungProQm;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Modernisierungskosten gesamt (€)
          </label>
          <input
            type="number"
            min={0}
            step={1000}
            value={modernisierungskosten}
            onChange={(e) => setModernisierungskosten(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Davon Instandhaltungsanteil (%)
          </label>
          <input
            type="number"
            min={0}
            max={100}
            step={5}
            value={instandhaltungsanteil}
            onChange={(e) =>
              setInstandhaltungsanteil(Math.max(0, Math.min(100, Number(e.target.value))))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
          <p className="mt-1 text-xs text-gray-500">
            Instandhaltung = {formatEurShort(Math.round(instandhaltungAbzug))} € (nicht umlagefähig)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Erhaltene Förderung (€)
          </label>
          <input
            type="number"
            min={0}
            step={1000}
            value={foerderung}
            onChange={(e) => setFoerderung(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Anzahl Wohnungen im Haus
          </label>
          <input
            type="number"
            min={1}
            value={anzahlWohnungen}
            onChange={(e) => setAnzahlWohnungen(Math.max(1, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bisherige Kaltmiete (€/m²)
          </label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={kaltmiete}
            onChange={(e) => setKaltmiete(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Wohnfläche der Wohnung (m²)
          </label>
          <input
            type="number"
            min={1}
            value={wohnflaeche}
            onChange={(e) => setWohnflaeche(Math.max(1, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>
      </div>

      {/* Berechnung Übersicht */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-800">Berechnungsweg</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between border-b border-gray-100 py-1.5">
            <span className="text-gray-600">Modernisierungskosten gesamt</span>
            <span className="font-medium text-gray-900">
              {formatEurShort(modernisierungskosten)} €
            </span>
          </div>
          <div className="flex justify-between border-b border-gray-100 py-1.5">
            <span className="text-gray-600">
              ./. Instandhaltungsanteil ({instandhaltungsanteil}%)
            </span>
            <span className="font-medium text-red-600">
              -{formatEurShort(Math.round(instandhaltungAbzug))} €
            </span>
          </div>
          <div className="flex justify-between border-b border-gray-100 py-1.5">
            <span className="text-gray-600">./. Erhaltene Förderung</span>
            <span className="font-medium text-red-600">
              -{formatEurShort(foerderung)} €
            </span>
          </div>
          <div className="flex justify-between border-b border-gray-300 py-2 font-bold">
            <span className="text-gray-900">= Umlagefähige Kosten</span>
            <span className="text-primary-700">{formatEurShort(Math.round(umlagefaehigeKosten))} €</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 py-1.5">
            <span className="text-gray-600">× 8% (§ 559 BGB)</span>
            <span className="font-medium text-gray-900">
              {formatEur(jaehrlicheUmlage)} € / Jahr
            </span>
          </div>
          <div className="flex justify-between border-b border-gray-100 py-1.5">
            <span className="text-gray-600">÷ {anzahlWohnungen} Wohnungen ÷ 12 Monate</span>
            <span className="font-medium text-gray-900">
              {formatEur(monatlicheErhoehung)} € / Monat
            </span>
          </div>
          <div className="flex justify-between py-2 font-bold">
            <span className="text-gray-900">= Mieterhöhung pro m²</span>
            <span className="text-primary-700">{formatEur(erhoehungProQm)} €/m²</span>
          </div>
        </div>
      </div>

      {/* Ergebnis */}
      <div className="rounded-lg border-2 border-primary-600 bg-primary-50 p-6">
        <h3 className="mb-4 text-lg font-bold text-gray-900">Ergebnis</h3>

        <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Umlagefähige Kosten
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {formatEurShort(Math.round(umlagefaehigeKosten))} €
            </p>
            <p className="text-xs text-gray-500">nach Abzügen</p>
          </div>

          <div className="rounded-lg bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Mieterhöhung / Monat
            </p>
            <p className={`mt-1 text-2xl font-bold ${kappungsgrenzeErreicht ? "text-red-700" : "text-primary-700"}`}>
              {kappungsgrenzeErreicht
                ? formatEur(effektiveMonatlicheErhoehung)
                : formatEur(monatlicheErhoehung)}{" "}
              €
            </p>
            <p className="text-xs text-gray-500">
              pro Wohnung ({wohnflaeche} m²)
            </p>
          </div>

          <div className="rounded-lg bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Bisherige Kaltmiete
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {formatEur(aktuelleMieteGesamt)} €
            </p>
            <p className="text-xs text-gray-500">{formatEur(kaltmiete)} €/m²</p>
          </div>

          <div className="rounded-lg bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Neue Kaltmiete
            </p>
            <p className="mt-1 text-2xl font-bold text-primary-700">
              {formatEur(
                kappungsgrenzeErreicht
                  ? effektiveNeueMiete * wohnflaeche
                  : neueMieteGesamt
              )}{" "}
              €
            </p>
            <p className="text-xs text-gray-500">
              {formatEur(kappungsgrenzeErreicht ? effektiveNeueMiete : neueMieteProQm)} €/m²
            </p>
          </div>
        </div>

        {/* Kappungsgrenze */}
        <div
          className={`rounded-lg p-4 shadow-sm ${
            kappungsgrenzeErreicht
              ? "bg-red-50 border border-red-200"
              : "bg-green-50 border border-green-200"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                kappungsgrenzeErreicht ? "bg-red-500" : "bg-green-500"
              }`}
            >
              {kappungsgrenzeErreicht ? "!" : "\u2713"}
            </div>
            <div>
              <h4
                className={`text-sm font-semibold ${
                  kappungsgrenzeErreicht ? "text-red-800" : "text-green-800"
                }`}
              >
                Kappungsgrenze (§ 559 Abs. 3a BGB):{" "}
                {kappungsgrenzeErreicht ? "Greift!" : "Nicht erreicht"}
              </h4>
              <div
                className={`mt-1 text-sm ${
                  kappungsgrenzeErreicht ? "text-red-700" : "text-green-700"
                }`}
              >
                {kaltmiete < 7 ? (
                  <p>
                    Bei einer Kaltmiete unter 7,00 €/m² gilt eine Kappungsgrenze von{" "}
                    <strong>2,00 €/m²</strong> innerhalb von 6 Jahren.
                  </p>
                ) : (
                  <p>
                    Die Kappungsgrenze beträgt <strong>3,00 €/m²</strong> innerhalb von 6 Jahren.
                  </p>
                )}
                {kappungsgrenzeErreicht && (
                  <p className="mt-1">
                    Die berechnete Erhöhung von {formatEur(erhoehungProQm)} €/m² wird auf{" "}
                    <strong>{formatEur(kappungsgrenze)} €/m²</strong> gekappt. Differenz:{" "}
                    {formatEur(erhoehungProQm - kappungsgrenze)} €/m² weniger.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Vermieter-Perspektive */}
        <div className="mt-4 rounded-lg bg-white p-4 shadow-sm">
          <h4 className="mb-2 text-sm font-semibold text-gray-800">
            Amortisation für Vermieter
          </h4>
          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <p className="text-gray-500">Jährl. Mehrmieteinnahmen (alle Wohnungen)</p>
              <p className="font-semibold text-gray-900">
                {formatEur(
                  (kappungsgrenzeErreicht ? effektiveMonatlicheErhoehung : monatlicheErhoehung) *
                    12 *
                    anzahlWohnungen
                )}{" "}
                €
              </p>
            </div>
            <div>
              <p className="text-gray-500">Amortisation der umlagefähigen Kosten</p>
              <p className="font-semibold text-gray-900">
                {(() => {
                  const jaehrlicheMehreinnahmen =
                    (kappungsgrenzeErreicht
                      ? effektiveMonatlicheErhoehung
                      : monatlicheErhoehung) *
                    12 *
                    anzahlWohnungen;
                  if (jaehrlicheMehreinnahmen > 0) {
                    const jahre = umlagefaehigeKosten / jaehrlicheMehreinnahmen;
                    return `ca. ${Math.ceil(jahre * 10) / 10} Jahre`.replace(".", ",");
                  }
                  return "—";
                })()}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Nicht umlagefähiger Anteil (Vermieter trägt)</p>
              <p className="font-semibold text-gray-900">
                {formatEurShort(Math.round(instandhaltungAbzug + foerderung))} €
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
        <strong>Rechtliche Hinweise:</strong> Die Berechnung basiert auf § 559 BGB
        (Mieterhöhung nach Modernisierungsmaßnahmen). Der Vermieter darf 8% der
        aufgewendeten Kosten jährlich auf die Mieter umlegen. Instandhaltungskosten und
        erhaltene Förderungen müssen abgezogen werden. Die Kappungsgrenze (§ 559 Abs. 3a BGB)
        begrenzt die Erhöhung auf 3 €/m² (bzw. 2 €/m² bei Mieten unter 7 €/m²) innerhalb von
        6 Jahren. Diese Berechnung ersetzt keine Rechtsberatung. Härtefalregelungen (§ 559
        Abs. 4 BGB) sind hier nicht berücksichtigt.
      </div>
    </div>
  );
}
