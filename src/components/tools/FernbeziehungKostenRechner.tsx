"use client";

import { useState } from "react";

type Transportmittel = "auto" | "bahn" | "fernbus" | "flug";
type BahnCard = "keine" | "25" | "50";

export function FernbeziehungKostenRechner() {
  const [entfernung, setEntfernung] = useState(300);
  const [besucheProMonat, setBesucheProMonat] = useState(2);

  // Transport
  const [transportmittel, setTransportmittel] = useState<Transportmittel>("auto");
  // Auto
  const [verbrauch, setVerbrauch] = useState(7);
  const [spritpreis, setSpritpreis] = useState(1.75);
  const [maut, setMaut] = useState(0);
  // Bahn
  const [bahnPreis, setBahnPreis] = useState(45);
  const [bahnCard, setBahnCard] = useState<BahnCard>("keine");
  // Fernbus
  const [fernbusPreis, setFernbusPreis] = useState(25);
  // Flug
  const [flugPreis, setFlugPreis] = useState(80);

  // Übernachtung
  const [uebernachtungTyp, setUebernachtungTyp] = useState<"partner" | "hotel">("partner");
  const [hotelPreis, setHotelPreis] = useState(60);
  const [naechte, setNaechte] = useState(2);

  // Extras
  const [extras, setExtras] = useState(100);

  const formatEur = (val: number) =>
    val.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Berechnung Transport pro Fahrt (hin + zurück)
  function transportKostenProFahrt(mittel: Transportmittel): number {
    const streckeHinRueck = entfernung * 2;
    switch (mittel) {
      case "auto":
        return (streckeHinRueck / 100) * verbrauch * spritpreis + maut * 2;
      case "bahn": {
        let preis = bahnPreis * 2;
        if (bahnCard === "25") preis *= 0.75;
        if (bahnCard === "50") preis *= 0.5;
        return preis;
      }
      case "fernbus":
        return fernbusPreis * 2;
      case "flug":
        return flugPreis * 2;
    }
  }

  const transportProFahrt = transportKostenProFahrt(transportmittel);
  const uebernachtungProBesuch = uebernachtungTyp === "hotel" ? hotelPreis * naechte : 0;
  const kostenProBesuch = transportProFahrt + uebernachtungProBesuch;
  const monatlich = kostenProBesuch * besucheProMonat + extras;
  const jaehrlich = monatlich * 12;

  // Vergleich Transportmittel
  const vergleich: { label: string; mittel: Transportmittel; kosten: number }[] = [
    { label: "Auto", mittel: "auto", kosten: transportKostenProFahrt("auto") },
    { label: "Bahn", mittel: "bahn", kosten: transportKostenProFahrt("bahn") },
    { label: "Fernbus", mittel: "fernbus", kosten: transportKostenProFahrt("fernbus") },
    { label: "Flug", mittel: "flug", kosten: transportKostenProFahrt("flug") },
  ];
  const guenstigster = vergleich.reduce((a, b) => (a.kosten < b.kosten ? a : b));
  const maxKosten = Math.max(...vergleich.map((v) => v.kosten));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Entfernung (km, einfach)
          </label>
          <input
            type="number"
            min={1}
            value={entfernung}
            onChange={(e) => setEntfernung(Math.max(1, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Besuche pro Monat
          </label>
          <input
            type="number"
            min={1}
            max={8}
            value={besucheProMonat}
            onChange={(e) => setBesucheProMonat(Math.max(1, Math.min(8, Number(e.target.value))))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transportmittel
          </label>
          <select
            value={transportmittel}
            onChange={(e) => setTransportmittel(e.target.value as Transportmittel)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          >
            <option value="auto">Auto</option>
            <option value="bahn">Bahn</option>
            <option value="fernbus">Fernbus</option>
            <option value="flug">Flug</option>
          </select>
        </div>
      </div>

      {/* Transport-Details */}
      {transportmittel === "auto" && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verbrauch (L/100 km)
            </label>
            <input
              type="number"
              min={1}
              max={30}
              step={0.1}
              value={verbrauch}
              onChange={(e) => setVerbrauch(Math.max(1, Number(e.target.value)))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Spritpreis (€/Liter)
            </label>
            <input
              type="number"
              min={0.5}
              max={5}
              step={0.01}
              value={spritpreis}
              onChange={(e) => setSpritpreis(Math.max(0.5, Number(e.target.value)))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mautkosten pro Fahrt (€)
            </label>
            <input
              type="number"
              min={0}
              step={1}
              value={maut}
              onChange={(e) => setMaut(Math.max(0, Number(e.target.value)))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
            />
          </div>
        </div>
      )}

      {transportmittel === "bahn" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preis pro Fahrt, einfach (€)
            </label>
            <input
              type="number"
              min={1}
              step={1}
              value={bahnPreis}
              onChange={(e) => setBahnPreis(Math.max(1, Number(e.target.value)))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              BahnCard
            </label>
            <select
              value={bahnCard}
              onChange={(e) => setBahnCard(e.target.value as BahnCard)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
            >
              <option value="keine">Keine BahnCard</option>
              <option value="25">BahnCard 25 (25% Rabatt)</option>
              <option value="50">BahnCard 50 (50% Rabatt)</option>
            </select>
          </div>
        </div>
      )}

      {transportmittel === "fernbus" && (
        <div className="max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preis pro Fahrt, einfach (€)
          </label>
          <input
            type="number"
            min={1}
            step={1}
            value={fernbusPreis}
            onChange={(e) => setFernbusPreis(Math.max(1, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>
      )}

      {transportmittel === "flug" && (
        <div className="max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preis pro Flug, einfach (€)
          </label>
          <input
            type="number"
            min={1}
            step={1}
            value={flugPreis}
            onChange={(e) => setFlugPreis(Math.max(1, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>
      )}

      {/* Übernachtung */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Übernachtung
          </label>
          <select
            value={uebernachtungTyp}
            onChange={(e) => setUebernachtungTyp(e.target.value as "partner" | "hotel")}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          >
            <option value="partner">Beim Partner (kostenlos)</option>
            <option value="hotel">Hotel / Airbnb</option>
          </select>
        </div>
        {uebernachtungTyp === "hotel" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preis pro Nacht (€)
              </label>
              <input
                type="number"
                min={1}
                step={5}
                value={hotelPreis}
                onChange={(e) => setHotelPreis(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nächte pro Besuch
              </label>
              <input
                type="number"
                min={1}
                max={14}
                value={naechte}
                onChange={(e) => setNaechte(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
              />
            </div>
          </>
        )}
      </div>

      {/* Extras */}
      <div className="max-w-xs">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Extras pro Monat (Essen, Geschenke, Aktivitäten) (€)
        </label>
        <input
          type="number"
          min={0}
          step={10}
          value={extras}
          onChange={(e) => setExtras(Math.max(0, Number(e.target.value)))}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
        />
      </div>

      {/* Ergebnis */}
      <div className="rounded-lg border-2 border-primary-600 bg-primary-50 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Kostenübersicht</h3>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-4 shadow-sm text-center">
            <p className="text-sm text-gray-500">Pro Besuch</p>
            <p className="text-2xl font-bold text-primary-700">{formatEur(kostenProBesuch)} €</p>
            <p className="text-xs text-gray-400 mt-1">Transport + Übernachtung</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm text-center">
            <p className="text-sm text-gray-500">Pro Monat</p>
            <p className="text-2xl font-bold text-primary-700">{formatEur(monatlich)} €</p>
            <p className="text-xs text-gray-400 mt-1">{besucheProMonat} Besuche + Extras</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm text-center">
            <p className="text-sm text-gray-500">Pro Jahr</p>
            <p className="text-2xl font-bold text-primary-700">{formatEur(jaehrlich)} €</p>
            <p className="text-xs text-gray-400 mt-1">{besucheProMonat * 12} Besuche gesamt</p>
          </div>
        </div>

        {/* Detailaufstellung */}
        <div className="mt-4">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-gray-700">Transport (Hin + Zurück) × {besucheProMonat}</td>
                <td className="py-2 text-right font-medium text-gray-900">{formatEur(transportProFahrt * besucheProMonat)} €/Monat</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-gray-700">Übernachtung × {besucheProMonat}</td>
                <td className="py-2 text-right font-medium text-gray-900">{formatEur(uebernachtungProBesuch * besucheProMonat)} €/Monat</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-gray-700">Extras (Essen, Geschenke, Aktivitäten)</td>
                <td className="py-2 text-right font-medium text-gray-900">{formatEur(extras)} €/Monat</td>
              </tr>
              <tr className="font-bold text-primary-700">
                <td className="py-3 text-base">Gesamtkosten monatlich</td>
                <td className="py-3 text-right text-base">{formatEur(monatlich)} €</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Transportvergleich */}
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Transportmittel-Vergleich (Hin + Zurück)</h4>
          <div className="space-y-2">
            {vergleich.map((v) => (
              <div key={v.mittel} className="flex items-center gap-3">
                <span className="w-16 text-sm text-gray-700">{v.label}</span>
                <div className="flex-1 h-6 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      v.mittel === guenstigster.mittel ? "bg-green-500" : "bg-primary-400"
                    }`}
                    style={{ width: maxKosten > 0 ? `${(v.kosten / maxKosten) * 100}%` : "0%" }}
                  />
                </div>
                <span className={`w-24 text-right text-sm font-medium ${
                  v.mittel === guenstigster.mittel ? "text-green-700" : "text-gray-700"
                }`}>
                  {formatEur(v.kosten)} €
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Am günstigsten: <strong>{guenstigster.label}</strong> mit {formatEur(guenstigster.kosten)} € pro Besuch (Hin + Zurück)
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
        <p className="font-medium text-gray-700 mb-1">Spartipps für Fernbeziehungen</p>
        <p>
          Frühzeitig buchen spart bei Bahn und Flug oft 30–50%. Eine BahnCard lohnt sich
          schnell bei regelmäßigen Fahrten. Fernbusse sind oft die günstigste Option, brauchen
          aber am längsten. Bei Autofahrten lohnt sich eine Fahrgemeinschaft oder Mitfahrgelegenheit.
        </p>
      </div>
    </div>
  );
}
