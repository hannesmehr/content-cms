"use client";

import { useState } from "react";

interface Effizienzklasse {
  klasse: string;
  maxKwh: number;
  farbe: string;
  label: string;
}

const klassen: Effizienzklasse[] = [
  { klasse: "A+", maxKwh: 30, farbe: "#15803d", label: "Passivhaus / KfW 40+" },
  { klasse: "A", maxKwh: 50, farbe: "#22c55e", label: "KfW-Effizienzhaus 40/55" },
  { klasse: "B", maxKwh: 75, farbe: "#84cc16", label: "Neubau-Standard / KfW 70" },
  { klasse: "C", maxKwh: 100, farbe: "#eab308", label: "Gut sanierter Altbau" },
  { klasse: "D", maxKwh: 130, farbe: "#f59e0b", label: "Teilsanierter Altbau" },
  { klasse: "E", maxKwh: 160, farbe: "#f97316", label: "Altbau, leicht saniert" },
  { klasse: "F", maxKwh: 200, farbe: "#ef4444", label: "Unsanierter Altbau" },
  { klasse: "G", maxKwh: 250, farbe: "#dc2626", label: "Schlecht gedämmter Altbau" },
  { klasse: "H", maxKwh: Infinity, farbe: "#991b1b", label: "Energetisch sehr schlecht" },
];

type Eingabe = "verbrauch" | "kosten";

const energietraeger: Record<string, { label: string; defaultPreis: number }> = {
  gas: { label: "Erdgas", defaultPreis: 0.12 },
  oel: { label: "Heizöl", defaultPreis: 0.10 },
  strom: { label: "Strom (Wärmepumpe)", defaultPreis: 0.35 },
  fernwaerme: { label: "Fernwärme", defaultPreis: 0.10 },
  pellets: { label: "Pellets", defaultPreis: 0.06 },
};

export function EnergieeffizienzCheck() {
  const [gebaeudetyp, setGebaeudetyp] = useState<string>("efh");
  const [wohnflaeche, setWohnflaeche] = useState<number>(140);
  const [eingabe, setEingabe] = useState<Eingabe>("verbrauch");
  const [verbrauch, setVerbrauch] = useState<number>(20000);
  const [heizkosten, setHeizkosten] = useState<number>(2400);
  const [traeger, setTraeger] = useState<string>("gas");
  const [energiepreis, setEnergiepreis] = useState<number>(0.12);

  const formatNum = (val: number, digits: number = 0) =>
    val.toLocaleString("de-DE", { minimumFractionDigits: digits, maximumFractionDigits: digits });

  const handleTraeger = (val: string) => {
    setTraeger(val);
    setEnergiepreis(energietraeger[val]?.defaultPreis || 0.12);
  };

  // Berechnung
  const kwhGesamt =
    eingabe === "verbrauch" ? verbrauch : energiepreis > 0 ? heizkosten / energiepreis : 0;
  const kwhProQm = wohnflaeche > 0 ? kwhGesamt / wohnflaeche : 0;

  // Klasse bestimmen
  const aktuelleKlasse = klassen.find((k) => kwhProQm <= k.maxKwh) || klassen[klassen.length - 1];
  const aktuellerIndex = klassen.indexOf(aktuelleKlasse);

  // Nächstbessere Klasse
  const naechsteKlasse = aktuellerIndex > 0 ? klassen[aktuellerIndex - 1] : null;
  const einsparungFuerNaechste = naechsteKlasse
    ? Math.round((kwhProQm - naechsteKlasse.maxKwh) * wohnflaeche)
    : 0;
  const kostenEinsparung = einsparungFuerNaechste * energiepreis;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gebäudetyp</label>
          <select
            value={gebaeudetyp}
            onChange={(e) => setGebaeudetyp(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          >
            <option value="efh">Einfamilienhaus</option>
            <option value="mfh">Mehrfamilienhaus</option>
            <option value="rh">Reihenhaus</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Wohnfläche (m²)</label>
          <input
            type="number"
            min={1}
            value={wohnflaeche}
            onChange={(e) => setWohnflaeche(Math.max(1, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Energieträger</label>
          <select
            value={traeger}
            onChange={(e) => handleTraeger(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          >
            {Object.entries(energietraeger).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-800">Verbrauchseingabe</h3>
        <div className="mb-3 flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={eingabe === "verbrauch"}
              onChange={() => setEingabe("verbrauch")}
              className="h-4 w-4 text-primary-600 focus:ring-primary-600"
            />
            <span className="text-sm text-gray-700">kWh-Verbrauch eingeben</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={eingabe === "kosten"}
              onChange={() => setEingabe("kosten")}
              className="h-4 w-4 text-primary-600 focus:ring-primary-600"
            />
            <span className="text-sm text-gray-700">Heizkosten eingeben</span>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {eingabe === "verbrauch" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jährlicher Energieverbrauch (kWh)
              </label>
              <input
                type="number"
                min={0}
                step={500}
                value={verbrauch}
                onChange={(e) => setVerbrauch(Math.max(0, Number(e.target.value)))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jährliche Heizkosten (€)
                </label>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={heizkosten}
                  onChange={(e) => setHeizkosten(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Energiepreis (€/kWh)
                </label>
                <input
                  type="number"
                  min={0.01}
                  step={0.01}
                  value={energiepreis}
                  onChange={(e) => setEnergiepreis(Math.max(0.01, Number(e.target.value)))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Ergebnis */}
      <div className="rounded-lg border-2 border-primary-600 bg-primary-50 p-6">
        <h3 className="mb-4 text-lg font-bold text-gray-900">Deine Energieeffizienzklasse</h3>

        <div className="mb-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Kennwert
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {formatNum(Math.round(kwhProQm))} kWh/m²a
            </p>
            <p className="text-xs text-gray-500">
              ({formatNum(Math.round(kwhGesamt))} kWh gesamt)
            </p>
          </div>

          <div className="rounded-lg bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Effizienzklasse
            </p>
            <p
              className="mt-1 text-4xl font-black"
              style={{ color: aktuelleKlasse.farbe }}
            >
              {aktuelleKlasse.klasse}
            </p>
            <p className="text-xs text-gray-500">{aktuelleKlasse.label}</p>
          </div>

          {naechsteKlasse && (
            <div className="rounded-lg bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Für Klasse {naechsteKlasse.klasse} einsparen
              </p>
              <p className="mt-1 text-2xl font-bold text-primary-700">
                {formatNum(einsparungFuerNaechste)} kWh
              </p>
              <p className="text-xs text-gray-500">
                = ca. {formatNum(Math.round(kostenEinsparung))} €/Jahr
              </p>
            </div>
          )}
        </div>

        {/* Skala */}
        <div className="mb-4">
          <h4 className="mb-2 text-sm font-semibold text-gray-800">
            Energieeffizienzskala
          </h4>
          <div className="space-y-1">
            {klassen.map((k, idx) => {
              const isAktuell = k === aktuelleKlasse;
              const maxBreite =
                k.klasse === "H" ? 100 : Math.min((k.maxKwh / 300) * 100, 100);
              return (
                <div key={k.klasse} className="flex items-center gap-2">
                  <span
                    className={`w-8 text-center text-sm font-bold ${
                      isAktuell ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {k.klasse}
                  </span>
                  <div className="flex-1 relative">
                    <div
                      className={`h-7 rounded transition-all duration-300 ${
                        isAktuell ? "ring-2 ring-gray-800 ring-offset-1" : ""
                      }`}
                      style={{
                        width: `${maxBreite}%`,
                        backgroundColor: k.farbe,
                        opacity: isAktuell ? 1 : 0.5,
                      }}
                    />
                    {isAktuell && (
                      <div className="absolute inset-y-0 left-2 flex items-center">
                        <span className="text-xs font-bold text-white drop-shadow">
                          {formatNum(Math.round(kwhProQm))} kWh/m²a — Ihr Wert
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="w-20 text-right text-xs text-gray-500">
                    {k.klasse === "H"
                      ? "> 250"
                      : idx === 0
                      ? `< ${k.maxKwh}`
                      : `< ${k.maxKwh}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Verbesserungshinweis */}
        {naechsteKlasse && aktuellerIndex > 1 && (
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h4 className="mb-2 text-sm font-semibold text-gray-800">
              Verbesserungspotenzial
            </h4>
            <div className="text-sm text-gray-700 space-y-2">
              <p>
                Um von Klasse{" "}
                <span className="font-bold" style={{ color: aktuelleKlasse.farbe }}>
                  {aktuelleKlasse.klasse}
                </span>{" "}
                auf Klasse{" "}
                <span className="font-bold" style={{ color: naechsteKlasse.farbe }}>
                  {naechsteKlasse.klasse}
                </span>{" "}
                zu kommen, musst du deinen Energieverbrauch um ca.{" "}
                <strong>{formatNum(einsparungFuerNaechste)} kWh/Jahr</strong> senken.
              </p>
              <p>
                Das entspricht einer jährlichen Heizkosteneinsparung von ca.{" "}
                <strong>{formatNum(Math.round(kostenEinsparung))} €</strong>.
              </p>
              {aktuellerIndex >= 4 && (
                <p className="text-primary-700 font-medium">
                  Typische Maßnahmen: Dämmung der Gebäudehülle, Fenstertausch, Heizungsmodernisierung.
                  Ein Energieberater kann ein individuelles Sanierungskonzept erstellen.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
        <strong>Hinweis:</strong> Die Einstufung basiert auf dem Endenergiebedarf gemäß
        Energieausweis-Systematik. Der tatsächliche Energieausweis berücksichtigt weitere Faktoren
        wie Warmwasserbereitung, Hilfsenergie und Klimafaktoren. Diese Berechnung dient als
        Orientierung.
      </div>
    </div>
  );
}
