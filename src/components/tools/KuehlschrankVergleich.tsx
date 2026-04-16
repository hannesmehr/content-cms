"use client";

import { useState } from "react";

// Affiliate-Platzhalter
const affiliateLinks: { name: string; url: string; info: string }[] = [
  // { name: "12V-Lüfter bei Amazon", url: "https://...", info: "Beliebter Nachrüst-Lüfter" },
];

export function KuehlschrankVergleich() {
  const [temperatur, setTemperatur] = useState<number>(28);
  const [stromquelle, setStromquelle] = useState<string>("landstrom");
  const [nutzungsTage, setNutzungsTage] = useState<number>(14);
  const [zusatzLuefter, setZusatzLuefter] = useState(false);
  const [stromPreisInput, setStromPreisInput] = useState<string>("0.50");
  const [gasPreisInput, setGasPreisInput] = useState<string>("2.50");

  // Preise aus Eingabefeldern
  const stromPreisProKwh = parseFloat(stromPreisInput.replace(",", ".")) || 0;
  const gasPreisProKg = parseFloat(gasPreisInput.replace(",", ".")) || 0;

  // --- Absorber-Kühlschrank ---
  // Stromverbrauch: ~100–120W auf Strom, steigt bei Hitze
  // Gasverbrauch: ~200–300g/Tag, steigt stark bei Hitze
  // Kühlleistung sinkt ab ~32°C deutlich
  const absorberGrenzTemp = zusatzLuefter ? 36 : 32;
  const absorberEffizienzFaktor = zusatzLuefter ? 0.75 : 1.0; // 25% besser mit Lüfter
  const absorberLuefterStrom = zusatzLuefter ? 2 : 0; // Watt

  let absorberGasProTag: number; // Gramm
  if (temperatur <= 25) {
    absorberGasProTag = 200 * absorberEffizienzFaktor;
  } else if (temperatur <= 30) {
    absorberGasProTag = (200 + (temperatur - 25) * 20) * absorberEffizienzFaktor;
  } else if (temperatur <= absorberGrenzTemp) {
    absorberGasProTag = (300 + (temperatur - 30) * 40) * absorberEffizienzFaktor;
  } else {
    // Über Grenztemperatur: stark erhöht, aber kühlt kaum noch
    absorberGasProTag = (500 + (temperatur - absorberGrenzTemp) * 60) * absorberEffizienzFaktor;
  }
  absorberGasProTag = Math.round(absorberGasProTag);

  const absorberStromProTag = 2.4; // kWh/Tag auf 230V (ca. 100W)
  const absorberLuefterKwhProTag = (absorberLuefterStrom * 24) / 1000;

  // Kühlleistung-Rating (1–5)
  let absorberRating: number;
  if (temperatur <= 25) absorberRating = 5;
  else if (temperatur <= 28) absorberRating = 4;
  else if (temperatur <= 30) absorberRating = 3;
  else if (temperatur <= absorberGrenzTemp) absorberRating = 2;
  else absorberRating = 1;

  // --- Kompressor-Kühlschrank ---
  // Konstanter Stromverbrauch, ~45–65W, kaum temperaturabhängig
  const kompressorWatt = temperatur <= 30 ? 50 : 50 + (temperatur - 30) * 2;
  const kompressorKwhProTag = (kompressorWatt * 24) / 1000;

  // Kühlleistung-Rating
  let kompressorRating: number;
  if (temperatur <= 35) kompressorRating = 5;
  else if (temperatur <= 38) kompressorRating = 4;
  else kompressorRating = 3;

  // Kosten berechnen
  const effektiverStromPreis = stromquelle === "landstrom" ? stromPreisProKwh : 0;
  const absorberKostenStrom = absorberStromProTag * effektiverStromPreis;
  const absorberKostenLuefter = absorberLuefterKwhProTag * effektiverStromPreis;
  const absorberKostenGas = (absorberGasProTag / 1000) * gasPreisProKg;

  let absorberKostenProTag: number;
  if (stromquelle === "landstrom") {
    absorberKostenProTag = absorberKostenStrom + absorberKostenLuefter;
  } else {
    absorberKostenProTag = absorberKostenGas + absorberKostenLuefter;
  }

  const kompressorKostenProTag = kompressorKwhProTag * effektiverStromPreis;

  const absorberKostenGesamt = absorberKostenProTag * nutzungsTage;
  const kompressorKostenGesamt = kompressorKostenProTag * nutzungsTage;

  // Kompressor auf 12V: Ah-Verbrauch für Batterie-Relevanz
  const kompressorAhProTag = (kompressorKwhProTag * 1000) / 12;

  const getRatingStars = (rating: number) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600";
    if (rating >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  // Empfehlung
  let empfehlung: string;
  if (temperatur >= absorberGrenzTemp) {
    empfehlung = zusatzLuefter
      ? "Bei dieser Hitze stößt auch ein Absorber mit Lüfter an seine Grenzen. Ein Kompressor-Kühlschrank wäre die bessere Wahl."
      : "Bei dieser Temperatur kühlt ein Absorber kaum noch. Ein Zusatzlüfter könnte helfen – oder ein Kompressor-Kühlschrank.";
  } else if (temperatur >= 30) {
    empfehlung = zusatzLuefter
      ? "Der Zusatzlüfter hilft deinem Absorber deutlich. Für Dauernutzung in heißen Regionen lohnt sich trotzdem ein Kompressor."
      : "Ab 30°C wird es eng für den Absorber. Ein einfacher 12V-Lüfter hinter dem Kühlschrank kann die Leistung um 20–30% verbessern.";
  } else if (stromquelle === "12v") {
    empfehlung = "Ohne Landstrom ist der Absorber auf Gas ideal – kein Batterieverbrauch. Der Kompressor braucht ca. " +
      Math.round(kompressorAhProTag) + " Ah/Tag aus der Batterie.";
  } else {
    empfehlung = "Bei moderaten Temperaturen funktionieren beide Typen gut. Der Kompressor ist leiser und effizienter, der Absorber flexibler (Gas/12V/230V).";
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Stromquelle am Stellplatz
          </label>
          <select
            value={stromquelle}
            onChange={(e) => setStromquelle(e.target.value)}
            className={inputClass}
          >
            <option value="landstrom">Landstrom (230V)</option>
            <option value="12v">Nur 12V / Solar (kein Landstrom)</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Nutzungsdauer
          </label>
          <select
            value={nutzungsTage}
            onChange={(e) => setNutzungsTage(parseInt(e.target.value))}
            className={inputClass}
          >
            <option value={3}>3 Tage (Wochenende)</option>
            <option value={7}>7 Tage</option>
            <option value={14}>14 Tage</option>
            <option value={21}>21 Tage</option>
            <option value={30}>30 Tage</option>
          </select>
        </div>

        {stromquelle === "landstrom" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Strompreis (€/kWh)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={stromPreisInput}
              onChange={(e) => setStromPreisInput(e.target.value)}
              placeholder="0,50"
              className={inputClass}
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Gaspreis (€/kg)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={gasPreisInput}
            onChange={(e) => setGasPreisInput(e.target.value)}
            placeholder="2,50"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Außentemperatur: <strong>{temperatur}°C</strong>
        </label>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">15°C</span>
          <input
            type="range"
            min={15}
            max={40}
            value={temperatur}
            onChange={(e) => setTemperatur(parseInt(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-300 accent-primary-600"
          />
          <span className="text-xs text-gray-500">40°C</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setZusatzLuefter(!zusatzLuefter)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
            zusatzLuefter ? "bg-primary-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
              zusatzLuefter ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        <label className="text-sm font-medium text-gray-700">
          Zusatzlüfter am Absorber verbaut (~2W, verbessert Leistung bei Hitze)
        </label>
      </div>

      {/* Vergleichstabelle */}
      <div className="rounded-lg border-2 border-primary-600 bg-primary-50 p-6">
        <h3 className="mb-4 text-lg font-bold text-gray-900">
          Vergleich: Absorber vs. Kompressor
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Absorber */}
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h4 className="mb-3 text-center text-sm font-bold uppercase tracking-wide text-gray-600">
              Absorber (3-Wege)
            </h4>
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-xs text-gray-500">Kühlleistung bei {temperatur}°C</p>
                <p className={`text-lg font-bold ${getRatingColor(absorberRating)}`}>
                  {getRatingStars(absorberRating)}
                </p>
              </div>
              <div className="rounded-md bg-gray-50 p-2 text-center">
                <p className="text-xs text-gray-500">
                  {stromquelle === "landstrom" ? "Stromverbrauch" : "Gasverbrauch"}
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {stromquelle === "landstrom"
                    ? `${absorberStromProTag.toFixed(1)} kWh/Tag`
                    : `${absorberGasProTag} g/Tag`}
                </p>
                {zusatzLuefter && stromquelle === "landstrom" && (
                  <p className="text-xs text-gray-500">
                    + Lüfter: {absorberLuefterKwhProTag.toFixed(2)} kWh/Tag
                  </p>
                )}
              </div>
              <div className="rounded-md bg-gray-50 p-2 text-center">
                <p className="text-xs text-gray-500">
                  Kosten ({nutzungsTage} Tage)
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {absorberKostenGesamt.toFixed(2)} €
                </p>
                <p className="text-xs text-gray-500">
                  ({absorberKostenProTag.toFixed(2)} €/Tag)
                </p>
              </div>
              <div className="text-xs text-gray-500">
                <p>✓ Läuft auf Gas, 12V und 230V</p>
                <p>✓ Geräuschlos</p>
                <p>✗ Leistung sinkt ab {absorberGrenzTemp}°C</p>
                <p>✗ Muss waagerecht stehen</p>
              </div>
            </div>
          </div>

          {/* Kompressor */}
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h4 className="mb-3 text-center text-sm font-bold uppercase tracking-wide text-gray-600">
              Kompressor
            </h4>
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-xs text-gray-500">Kühlleistung bei {temperatur}°C</p>
                <p className={`text-lg font-bold ${getRatingColor(kompressorRating)}`}>
                  {getRatingStars(kompressorRating)}
                </p>
              </div>
              <div className="rounded-md bg-gray-50 p-2 text-center">
                <p className="text-xs text-gray-500">Stromverbrauch</p>
                <p className="text-lg font-bold text-gray-900">
                  {kompressorKwhProTag.toFixed(1)} kWh/Tag
                </p>
                {stromquelle === "12v" && (
                  <p className="text-xs text-gray-500">
                    ≈ {Math.round(kompressorAhProTag)} Ah/Tag aus Batterie
                  </p>
                )}
              </div>
              <div className="rounded-md bg-gray-50 p-2 text-center">
                <p className="text-xs text-gray-500">
                  Kosten ({nutzungsTage} Tage)
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {stromquelle === "12v"
                    ? "–"
                    : `${kompressorKostenGesamt.toFixed(2)} €`}
                </p>
                <p className="text-xs text-gray-500">
                  {stromquelle === "12v"
                    ? "Batterie/Solar – kein direkter Strompreis"
                    : `(${kompressorKostenProTag.toFixed(2)} €/Tag)`}
                </p>
              </div>
              <div className="text-xs text-gray-500">
                <p>✓ Konstante Kühlleistung</p>
                <p>✓ Auch bei großer Hitze effektiv</p>
                <p>✓ Funktioniert schräg/bergig</p>
                <p>✗ Braucht Strom (230V oder 12V)</p>
                <p>✗ Leise Kompressor-Geräusche</p>
              </div>
            </div>
          </div>
        </div>

        {/* Empfehlung */}
        <div className="mt-4 rounded-md bg-white/60 p-3">
          <p className="text-sm text-gray-700">
            <strong>Empfehlung:</strong> {empfehlung}
          </p>
        </div>
      </div>

      {/* Lüfter-Tipp */}
      {!zusatzLuefter && temperatur >= 28 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p className="text-sm text-blue-800">
            <strong>Tipp:</strong> Ein kleiner 12V-Lüfter (ab ~15 €) hinter dem
            Absorber-Kühlschrank verbessert die Luftzirkulation und kann die Kühlleistung
            um 20–30% steigern. Besonders bei Hitze ein einfaches und effektives Upgrade!
            Aktiviere den Schalter oben, um den Effekt zu sehen.
          </p>
        </div>
      )}

      {/* Affiliate */}
      {affiliateLinks.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
            Anzeige
          </p>
          <h3 className="mb-3 text-sm font-semibold text-gray-800">
            Kühlschrank-Lüfter kaufen
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
