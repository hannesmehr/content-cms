"use client";

import { useState } from "react";

// Affiliate-Platzhalter – Links und Daten später ergänzen
const versicherungsAnbieter: {
  name: string;
  url: string;
  preisklasse: string;
  besonderheiten: string;
}[] = [
  // {
  //   name: "CampingAssec",
  //   url: "https://...",
  //   preisklasse: "€€",
  //   besonderheiten: "Spezialist für Caravaning, schnelle Schadenabwicklung",
  // },
  // {
  //   name: "HUK-COBURG",
  //   url: "https://...",
  //   preisklasse: "€",
  //   besonderheiten: "Günstige Tarife, großes Filialnetz",
  // },
  // {
  //   name: "Allianz",
  //   url: "https://...",
  //   preisklasse: "€€€",
  //   besonderheiten: "Premium-Schutz, europaweite Pannenhilfe",
  // },
  // {
  //   name: "ADAC",
  //   url: "https://...",
  //   preisklasse: "€€",
  //   besonderheiten: "Inkl. Schutzbriefleistungen, Mitglieder-Rabatt",
  // },
];

export function VersicherungsRechner() {
  const [neuwert, setNeuwert] = useState<string>("25000");
  const [alter, setAlter] = useState<number>(3);
  const [typ, setTyp] = useState<string>("wohnwagen");
  const [nutzung, setNutzung] = useState<string>("saisonal");
  const [selbstbeteiligung, setSelbstbeteiligung] = useState<number>(300);
  const [inventar, setInventar] = useState(false);
  const [schutzbrief, setSchutzbrief] = useState(false);

  const neuwertZahl = parseInt(neuwert) || 0;

  // Zeitwert berechnen (linearer Wertverlust, ~5-7% pro Jahr)
  const wertverlustProJahr = 0.06;
  const zeitwert = Math.round(
    neuwertZahl * Math.pow(1 - wertverlustProJahr, alter)
  );

  // Basisprämien (Richtwerte, stark vereinfacht)
  const typFaktor = typ === "wohnmobil" ? 1.6 : 1.0;
  const nutzungsFaktor = nutzung === "ganzjaehrig" ? 1.25 : 1.0;
  const sbFaktor =
    selbstbeteiligung === 150 ? 1.15 : selbstbeteiligung === 500 ? 0.85 : 1.0;

  // Haftpflicht: relativ konstant, abhängig von Typ
  const haftpflicht = Math.round(65 * typFaktor * nutzungsFaktor);

  // Teilkasko: abhängig von Zeitwert
  const teilkaskoBasis = zeitwert * 0.007 * typFaktor * nutzungsFaktor * sbFaktor;
  const teilkasko = Math.max(Math.round(teilkaskoBasis), 90);

  // Vollkasko: abhängig von Zeitwert, deutlich teurer
  const vollkaskoBasis = zeitwert * 0.016 * typFaktor * nutzungsFaktor * sbFaktor;
  const vollkasko = Math.max(Math.round(vollkaskoBasis), 180);

  // Zusatzoptionen
  const inventarKosten = inventar ? Math.round(neuwertZahl * 0.002 + 25) : 0;
  const schutzbriefKosten = schutzbrief ? 55 : 0;

  // Empfehlung
  let empfehlung: string;
  let empfohleneVariante: string;
  if (alter <= 5 && zeitwert > 10000) {
    empfehlung =
      "Bei einem relativ neuen Fahrzeug mit hohem Zeitwert lohnt sich die Vollkasko. Diese deckt auch Eigenverschulden ab.";
    empfohleneVariante = "vollkasko";
  } else if (alter <= 10 && zeitwert > 5000) {
    empfehlung =
      "Teilkasko ist ein guter Kompromiss: Schutz gegen Diebstahl, Sturm, Hagel und Brand – ohne den hohen Vollkasko-Beitrag.";
    empfohleneVariante = "teilkasko";
  } else {
    empfehlung =
      "Bei einem älteren Fahrzeug reicht oft die Haftpflicht. Eine Teilkasko kann sinnvoll sein, wenn du an diebstahlgefährdeten Orten stehst.";
    empfohleneVariante = "haftpflicht";
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Neupreis (€)
          </label>
          <input
            type="number"
            value={neuwert}
            onChange={(e) => setNeuwert(e.target.value)}
            placeholder="z.B. 25000"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Alter (Jahre)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={25}
              value={alter}
              onChange={(e) => setAlter(parseInt(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-300 accent-primary-600"
            />
            <span className="w-16 text-right text-sm font-medium text-gray-700">
              {alter} {alter === 1 ? "Jahr" : "Jahre"}
            </span>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Fahrzeugtyp
          </label>
          <select
            value={typ}
            onChange={(e) => setTyp(e.target.value)}
            className={inputClass}
          >
            <option value="wohnwagen">Wohnwagen / Caravan</option>
            <option value="wohnmobil">Wohnmobil / Campervan</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Nutzung
          </label>
          <select
            value={nutzung}
            onChange={(e) => setNutzung(e.target.value)}
            className={inputClass}
          >
            <option value="saisonal">Saisonal (Frühling–Herbst)</option>
            <option value="ganzjaehrig">Ganzjährig</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Selbstbeteiligung
          </label>
          <select
            value={selbstbeteiligung}
            onChange={(e) => setSelbstbeteiligung(parseInt(e.target.value))}
            className={inputClass}
          >
            <option value={150}>150 € (höhere Prämie)</option>
            <option value={300}>300 € (Standard)</option>
            <option value={500}>500 € (niedrigere Prämie)</option>
          </select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setInventar(!inventar)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                inventar ? "bg-primary-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                  inventar ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <label className="text-sm font-medium text-gray-700">
              Inventarversicherung
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSchutzbrief(!schutzbrief)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                schutzbrief ? "bg-primary-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                  schutzbrief ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <label className="text-sm font-medium text-gray-700">
              Schutzbrief (Pannenhilfe)
            </label>
          </div>
        </div>
      </div>

      {/* Ergebnis */}
      {neuwertZahl > 0 && (
        <div className="rounded-lg border-2 border-primary-600 bg-primary-50 p-6">
          <h3 className="mb-2 text-lg font-bold text-gray-900">
            Geschätzte Jahresbeiträge
          </h3>
          <p className="mb-4 text-xs text-gray-500">
            Zeitwert: ~{zeitwert.toLocaleString("de-DE")} € | Richtwerte – tatsächliche Beiträge können abweichen
          </p>

          <div className="mb-4 grid gap-4 sm:grid-cols-3">
            {/* Haftpflicht */}
            <div
              className={`rounded-lg bg-white p-4 text-center shadow-sm ${
                empfohleneVariante === "haftpflicht"
                  ? "ring-2 ring-primary-600"
                  : ""
              }`}
            >
              {empfohleneVariante === "haftpflicht" && (
                <span className="mb-1 inline-block rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                  Empfohlen
                </span>
              )}
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Haftpflicht
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                ~{haftpflicht} €
              </p>
              <p className="text-xs text-gray-500">pro Jahr</p>
              <p className="mt-2 text-xs text-gray-400">Pflicht, deckt Fremdschäden</p>
            </div>

            {/* Teilkasko */}
            <div
              className={`rounded-lg bg-white p-4 text-center shadow-sm ${
                empfohleneVariante === "teilkasko"
                  ? "ring-2 ring-primary-600"
                  : ""
              }`}
            >
              {empfohleneVariante === "teilkasko" && (
                <span className="mb-1 inline-block rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                  Empfohlen
                </span>
              )}
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Teilkasko
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                ~{(haftpflicht + teilkasko).toLocaleString("de-DE")} €
              </p>
              <p className="text-xs text-gray-500">pro Jahr (inkl. Haftpflicht)</p>
              <p className="mt-2 text-xs text-gray-400">
                + Diebstahl, Sturm, Hagel, Brand
              </p>
            </div>

            {/* Vollkasko */}
            <div
              className={`rounded-lg bg-white p-4 text-center shadow-sm ${
                empfohleneVariante === "vollkasko"
                  ? "ring-2 ring-primary-600"
                  : ""
              }`}
            >
              {empfohleneVariante === "vollkasko" && (
                <span className="mb-1 inline-block rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                  Empfohlen
                </span>
              )}
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Vollkasko
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                ~{(haftpflicht + vollkasko).toLocaleString("de-DE")} €
              </p>
              <p className="text-xs text-gray-500">pro Jahr (inkl. Haftpflicht)</p>
              <p className="mt-2 text-xs text-gray-400">
                + Eigenverschulden, Vandalismus
              </p>
            </div>
          </div>

          {/* Zusatzoptionen */}
          {(inventar || schutzbrief) && (
            <div className="mb-4 rounded-md bg-white/60 p-3">
              <p className="text-sm text-gray-700">
                <strong>Zusatzoptionen:</strong>{" "}
                {inventar && `Inventarversicherung ~${inventarKosten} €/Jahr`}
                {inventar && schutzbrief && " + "}
                {schutzbrief && `Schutzbrief ~${schutzbriefKosten} €/Jahr`}
              </p>
            </div>
          )}

          {/* Empfehlung */}
          <div className="rounded-md bg-white/60 p-3">
            <p className="text-sm text-gray-700">
              <strong>Empfehlung:</strong> {empfehlung}
            </p>
          </div>
        </div>
      )}

      {/* Was deckt was? */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-800">
          Was deckt welche Versicherung ab?
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-2 pr-4 text-left font-medium text-gray-500">Leistung</th>
                <th className="pb-2 pr-4 text-center font-medium text-gray-500">Haftpflicht</th>
                <th className="pb-2 pr-4 text-center font-medium text-gray-500">Teilkasko</th>
                <th className="pb-2 text-center font-medium text-gray-500">Vollkasko</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {[
                { leistung: "Schäden an Dritten", hp: true, tk: true, vk: true },
                { leistung: "Diebstahl", hp: false, tk: true, vk: true },
                { leistung: "Sturm / Hagel / Blitz", hp: false, tk: true, vk: true },
                { leistung: "Brand / Explosion", hp: false, tk: true, vk: true },
                { leistung: "Wildschaden", hp: false, tk: true, vk: true },
                { leistung: "Glasbruch", hp: false, tk: true, vk: true },
                { leistung: "Eigenverschulden", hp: false, tk: false, vk: true },
                { leistung: "Vandalismus", hp: false, tk: false, vk: true },
                { leistung: "Fahrerflucht (Dritter)", hp: false, tk: false, vk: true },
              ].map((row) => (
                <tr key={row.leistung} className="border-b border-gray-100">
                  <td className="py-1.5 pr-4">{row.leistung}</td>
                  <td className="py-1.5 pr-4 text-center">
                    {row.hp ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-gray-300">✗</span>
                    )}
                  </td>
                  <td className="py-1.5 pr-4 text-center">
                    {row.tk ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-gray-300">✗</span>
                    )}
                  </td>
                  <td className="py-1.5 text-center">
                    {row.vk ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-gray-300">✗</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Affiliate-Tabelle (nur wenn Daten vorhanden) */}
      {versicherungsAnbieter.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
            Anzeige
          </p>
          <h3 className="mb-3 text-sm font-semibold text-gray-800">
            Wohnwagen-Versicherungen im Vergleich
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-2 pr-4 text-left font-medium text-gray-500">Anbieter</th>
                  <th className="pb-2 pr-4 text-left font-medium text-gray-500">Preisklasse</th>
                  <th className="pb-2 pr-4 text-left font-medium text-gray-500">Besonderheiten</th>
                  <th className="pb-2 text-left font-medium text-gray-500" />
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {versicherungsAnbieter.map((anbieter) => (
                  <tr key={anbieter.name} className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-medium">{anbieter.name}</td>
                    <td className="py-2 pr-4">{anbieter.preisklasse}</td>
                    <td className="py-2 pr-4 text-xs text-gray-500">
                      {anbieter.besonderheiten}
                    </td>
                    <td className="py-2">
                      <a
                        href={anbieter.url}
                        target="_blank"
                        rel="nofollow sponsored noopener"
                        className="inline-block rounded-md bg-primary-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-primary-700"
                      >
                        Zum Anbieter
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="rounded-md bg-gray-50 p-3">
        <p className="text-xs text-gray-500">
          <strong>Hinweis:</strong> Die genannten Beiträge sind grobe Richtwerte und dienen
          zur Orientierung. Die tatsächlichen Prämien hängen von vielen Faktoren ab
          (Schadensfreiheitsklasse, Region, Fahrzeugmodell, Stellplatz u.v.m.). Hole dir
          immer mehrere Angebote ein.
        </p>
      </div>
    </div>
  );
}
