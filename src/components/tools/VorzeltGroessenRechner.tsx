"use client";

import { useState } from "react";

// DIN-Vorzeltgrößen: Größe → Umlaufmaß-Bereich in cm
const vorzeltGroessen = [
  { groesse: 1, von: 651, bis: 700 },
  { groesse: 2, von: 701, bis: 750 },
  { groesse: 3, von: 751, bis: 800 },
  { groesse: 4, von: 801, bis: 850 },
  { groesse: 5, von: 851, bis: 900 },
  { groesse: 6, von: 901, bis: 950 },
  { groesse: 7, von: 951, bis: 1000 },
  { groesse: 8, von: 1001, bis: 1050 },
  { groesse: 9, von: 1051, bis: 1100 },
  { groesse: 10, von: 1101, bis: 1150 },
  { groesse: 11, von: 1151, bis: 1200 },
  { groesse: 12, von: 1201, bis: 1250 },
  { groesse: 13, von: 1251, bis: 1300 },
  { groesse: 14, von: 1301, bis: 1350 },
  { groesse: 15, von: 1351, bis: 1400 },
  { groesse: 16, von: 1401, bis: 1450 },
  { groesse: 17, von: 1451, bis: 1500 },
  { groesse: 18, von: 1501, bis: 1550 },
  { groesse: 19, von: 1551, bis: 1600 },
];

const tiefeOptionen = [
  { label: "200 cm (Teilzelt/Sonnendach)", value: 200 },
  { label: "240 cm (Standard)", value: 240 },
  { label: "280 cm (Komfort)", value: 280 },
  { label: "340 cm (Großraum)", value: 340 },
  { label: "Eigene Eingabe", value: 0 },
];

// Affiliate-Platzhalter – Links später ergänzen
const affiliateShops: { name: string; url: string; info: string }[] = [
  // { name: "Fritz Berger", url: "https://...", info: "Große Auswahl an Vorzelten" },
  // { name: "Obelink", url: "https://...", info: "Günstige Preise, NL-Versand" },
  // { name: "Camping Wagner", url: "https://...", info: "Fachberatung, DE-Versand" },
];

export function VorzeltGroessenRechner() {
  const [eingabeArt, setEingabeArt] = useState<"umlaufmass" | "einzeln">("umlaufmass");
  const [umlaufmass, setUmlaufmass] = useState<string>("");
  const [breite, setBreite] = useState<string>("");
  const [hoeheLinks, setHoeheLinks] = useState<string>("");
  const [hoeheRechts, setHoeheRechts] = useState<string>("");
  const [tiefe, setTiefe] = useState<number>(240);
  const [eigeneTiefe, setEigeneTiefe] = useState<string>("");
  const [vorzeltTyp, setVorzeltTyp] = useState<string>("vollvorzelt");

  // Umlaufmaß berechnen
  const berechnetesUmlaufmass =
    eingabeArt === "umlaufmass"
      ? parseInt(umlaufmass) || 0
      : (parseInt(breite) || 0) + (parseInt(hoeheLinks) || 0) + (parseInt(hoeheRechts) || 0);

  const effektiveTiefe = tiefe === 0 ? parseInt(eigeneTiefe) || 0 : tiefe;

  // Passende Größe finden
  const passendeGroesse = vorzeltGroessen.find(
    (g) => berechnetesUmlaufmass >= g.von && berechnetesUmlaufmass <= g.bis
  );

  const zuKlein = berechnetesUmlaufmass > 0 && berechnetesUmlaufmass < 651;
  const zuGross = berechnetesUmlaufmass > 1600;
  const hatErgebnis = berechnetesUmlaufmass > 0;

  // Grundfläche in m²
  const grundflaeche =
    berechnetesUmlaufmass > 0 && effektiveTiefe > 0
      ? ((berechnetesUmlaufmass / 100) * (effektiveTiefe / 100)).toFixed(1)
      : null;

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600";

  return (
    <div className="space-y-6">
      {/* Eingabeart wählen */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Wie möchtest du das Umlaufmaß angeben?
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEingabeArt("umlaufmass")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              eingabeArt === "umlaufmass"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Umlaufmaß direkt eingeben
          </button>
          <button
            type="button"
            onClick={() => setEingabeArt("einzeln")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              eingabeArt === "einzeln"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Einzelmaße eingeben
          </button>
        </div>
      </div>

      {eingabeArt === "umlaufmass" ? (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Umlaufmaß (cm)
          </label>
          <input
            type="number"
            value={umlaufmass}
            onChange={(e) => setUmlaufmass(e.target.value)}
            placeholder="z.B. 1050"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-gray-500">
            Das Umlaufmaß findest du in den technischen Daten deines Wohnwagens oder misst es selbst: Kederleiste von links unten über das Dach nach rechts unten.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Höhe links (cm)
            </label>
            <input
              type="number"
              value={hoeheLinks}
              onChange={(e) => setHoeheLinks(e.target.value)}
              placeholder="z.B. 235"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Breite oben (cm)
            </label>
            <input
              type="number"
              value={breite}
              onChange={(e) => setBreite(e.target.value)}
              placeholder="z.B. 580"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Höhe rechts (cm)
            </label>
            <input
              type="number"
              value={hoeheRechts}
              onChange={(e) => setHoeheRechts(e.target.value)}
              placeholder="z.B. 235"
              className={inputClass}
            />
          </div>
          {berechnetesUmlaufmass > 0 && (
            <div className="sm:col-span-3">
              <p className="text-sm text-gray-600">
                Berechnetes Umlaufmaß:{" "}
                <strong className="text-gray-900">{berechnetesUmlaufmass} cm</strong>
              </p>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Vorzelt-Typ
          </label>
          <select
            value={vorzeltTyp}
            onChange={(e) => setVorzeltTyp(e.target.value)}
            className={inputClass}
          >
            <option value="vollvorzelt">Vollvorzelt</option>
            <option value="teilzelt">Teilzelt</option>
            <option value="sonnendach">Sonnendach / Sonnenvorzelt</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Gewünschte Tiefe
          </label>
          <select
            value={tiefe}
            onChange={(e) => setTiefe(parseInt(e.target.value))}
            className={inputClass}
          >
            {tiefeOptionen.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {tiefe === 0 && (
            <input
              type="number"
              value={eigeneTiefe}
              onChange={(e) => setEigeneTiefe(e.target.value)}
              placeholder="Tiefe in cm"
              className={`mt-2 ${inputClass}`}
            />
          )}
        </div>
      </div>

      {/* Ergebnis */}
      {hatErgebnis && (
        <div className="rounded-lg border-2 border-primary-600 bg-primary-50 p-6">
          <h3 className="mb-4 text-lg font-bold text-gray-900">Ergebnis</h3>

          {passendeGroesse && (
            <div className="mb-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-white p-4 text-center shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Umlaufmaß
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {berechnetesUmlaufmass} cm
                </p>
              </div>
              <div className="rounded-lg bg-white p-4 text-center shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Vorzeltgröße
                </p>
                <p className="mt-1 text-2xl font-bold text-primary-700">
                  Größe {passendeGroesse.groesse}
                </p>
                <p className="text-xs text-gray-500">
                  ({passendeGroesse.von}–{passendeGroesse.bis} cm)
                </p>
              </div>
              {grundflaeche && (
                <div className="rounded-lg bg-white p-4 text-center shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Grundfläche ca.
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {grundflaeche} m²
                  </p>
                  <p className="text-xs text-gray-500">bei {effektiveTiefe} cm Tiefe</p>
                </div>
              )}
            </div>
          )}

          {zuKlein && (
            <p className="text-sm font-medium text-red-700">
              Das Umlaufmaß liegt unter 651 cm – das ist ungewöhnlich klein. Bitte prüfe deine Eingabe.
            </p>
          )}

          {zuGross && (
            <p className="text-sm font-medium text-red-700">
              Das Umlaufmaß liegt über 1.600 cm – das überschreitet die üblichen DIN-Größen. Kontaktiere den Vorzelthersteller für eine Sonderanfertigung.
            </p>
          )}

          {passendeGroesse && (
            <div className="mt-4 space-y-3">
              {vorzeltTyp === "vollvorzelt" && (
                <div className="rounded-md bg-white/60 p-3">
                  <p className="text-sm text-gray-700">
                    <strong>Vollvorzelt:</strong> Bietet maximalen Wohnraum. Ideal für
                    Dauerstandplätze oder längere Aufenthalte. Achte auf stabiles Gestänge
                    (Stahl oder Alu) und ausreichende Belüftung.
                  </p>
                </div>
              )}
              {vorzeltTyp === "teilzelt" && (
                <div className="rounded-md bg-white/60 p-3">
                  <p className="text-sm text-gray-700">
                    <strong>Teilzelt:</strong> Wird nur über einen Teil der Kederleiste
                    gespannt. Schneller Auf- und Abbau, weniger Gewicht. Gut für kürzere
                    Aufenthalte und Touring.
                  </p>
                </div>
              )}
              {vorzeltTyp === "sonnendach" && (
                <div className="rounded-md bg-white/60 p-3">
                  <p className="text-sm text-gray-700">
                    <strong>Sonnendach:</strong> Leicht, schnell aufgebaut, bietet Schatten
                    ohne geschlossene Wände. Perfekt für den Sommerurlaub.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* DIN-Größentabelle */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-800">
          Vorzeltgrößen nach DIN (Übersicht)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-2 pr-4 text-left font-medium text-gray-500">Größe</th>
                <th className="pb-2 pr-4 text-left font-medium text-gray-500">Umlaufmaß</th>
                <th className="pb-2 text-left font-medium text-gray-500" />
              </tr>
            </thead>
            <tbody>
              {vorzeltGroessen.map((g) => (
                <tr
                  key={g.groesse}
                  className={`border-b border-gray-100 ${
                    passendeGroesse?.groesse === g.groesse
                      ? "bg-primary-50 font-semibold text-primary-700"
                      : "text-gray-700"
                  }`}
                >
                  <td className="py-1.5 pr-4">Größe {g.groesse}</td>
                  <td className="py-1.5 pr-4">
                    {g.von}–{g.bis} cm
                  </td>
                  <td className="py-1.5">
                    {passendeGroesse?.groesse === g.groesse && "← Deine Größe"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Affiliate-Bereich (nur wenn Links vorhanden) */}
      {affiliateShops.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
            Anzeige
          </p>
          <h3 className="mb-3 text-sm font-semibold text-gray-800">
            Vorzelte online kaufen
          </h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {affiliateShops.map((shop) => (
              <a
                key={shop.name}
                href={shop.url}
                target="_blank"
                rel="nofollow sponsored noopener"
                className="rounded-lg border border-gray-200 p-3 text-center transition hover:border-primary-600 hover:shadow-sm"
              >
                <p className="font-medium text-gray-900">{shop.name}</p>
                <p className="mt-1 text-xs text-gray-500">{shop.info}</p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
