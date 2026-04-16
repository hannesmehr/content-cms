"use client";

import { useState } from "react";

type RaumTyp =
  | "normal"
  | "dachschraege"
  | "balkon"
  | "loggia"
  | "wintergarten_beheizt"
  | "wintergarten_unbeheizt"
  | "keller";

interface Raum {
  id: number;
  name: string;
  laenge: number;
  breite: number;
  typ: RaumTyp;
  kniestock: number;
  raumhoehe: number;
  balkonHochwertig: boolean;
}

const raumTypLabels: Record<RaumTyp, string> = {
  normal: "Normal",
  dachschraege: "Dachschräge",
  balkon: "Balkon / Terrasse",
  loggia: "Loggia",
  wintergarten_beheizt: "Wintergarten (beheizt)",
  wintergarten_unbeheizt: "Wintergarten (unbeheizt)",
  keller: "Keller",
};

let nextId = 1;

function createDefaultRaum(name: string): Raum {
  return {
    id: nextId++,
    name,
    laenge: 4,
    breite: 3.5,
    typ: "normal",
    kniestock: 1.2,
    raumhoehe: 2.5,
    balkonHochwertig: false,
  };
}

function berechneAnrechnungsfaktor(raum: Raum): { faktor: number; beschreibung: string } {
  switch (raum.typ) {
    case "normal":
      return { faktor: 1.0, beschreibung: "100% — Volle Anrechnung" };
    case "dachschraege": {
      // Vereinfachte Berechnung: Anteil der Fläche nach Höhenbereichen
      // unter 1m: 0%, 1-2m: 50%, über 2m: 100%
      if (raum.kniestock >= 2) {
        return { faktor: 1.0, beschreibung: "100% — Kniestockhöhe über 2m" };
      } else if (raum.kniestock >= 1) {
        // Bereich zwischen 1m und 2m: 50%
        // Bereich über 2m: 100%
        const steigung = raum.raumhoehe > raum.kniestock
          ? (raum.raumhoehe - raum.kniestock) / (raum.breite / 2)
          : 0;
        if (steigung === 0) return { faktor: 0.5, beschreibung: "50% — Dachschräge 1-2m" };
        // Vereinfachte Mischberechnung
        const anteil2m = raum.raumhoehe > 2 ? Math.min(1, (raum.raumhoehe - 2) / raum.raumhoehe) : 0;
        const anteil1bis2 = 1 - anteil2m;
        const mischFaktor = anteil2m * 1.0 + anteil1bis2 * 0.5;
        return {
          faktor: Math.round(mischFaktor * 100) / 100,
          beschreibung: `${Math.round(mischFaktor * 100)}% — Mischberechnung Dachschräge`,
        };
      } else {
        return { faktor: 0.0, beschreibung: "0% — Kniestockhöhe unter 1m" };
      }
    }
    case "balkon":
      return raum.balkonHochwertig
        ? { faktor: 0.5, beschreibung: "50% — Hochwertiger Balkon/Terrasse" }
        : { faktor: 0.25, beschreibung: "25% — Balkon/Terrasse" };
    case "loggia":
      return { faktor: 0.5, beschreibung: "50% — Loggia" };
    case "wintergarten_beheizt":
      return { faktor: 1.0, beschreibung: "100% — Beheizter Wintergarten" };
    case "wintergarten_unbeheizt":
      return { faktor: 0.5, beschreibung: "50% — Unbeheizter Wintergarten" };
    case "keller":
      return { faktor: 0.0, beschreibung: "0% — Keller (keine Wohnfläche)" };
  }
}

export function WohnflaecheRechner() {
  const [raeume, setRaeume] = useState<Raum[]>([
    { ...createDefaultRaum("Wohnzimmer"), laenge: 5, breite: 4 },
    { ...createDefaultRaum("Schlafzimmer"), laenge: 4, breite: 3.5 },
    { ...createDefaultRaum("Küche"), laenge: 3.5, breite: 2.8 },
    { ...createDefaultRaum("Bad"), laenge: 2.5, breite: 2 },
    { ...createDefaultRaum("Flur"), laenge: 4, breite: 1.5 },
  ]);
  const [mietvertragFlaeche, setMietvertragFlaeche] = useState<string>("");
  const [berechnet, setBerechnet] = useState(false);

  const formatNum = (val: number) =>
    val.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function addRaum() {
    setRaeume((prev) => [...prev, createDefaultRaum(`Raum ${prev.length + 1}`)]);
    setBerechnet(false);
  }

  function removeRaum(id: number) {
    setRaeume((prev) => prev.filter((r) => r.id !== id));
    setBerechnet(false);
  }

  function updateRaum(id: number, update: Partial<Raum>) {
    setRaeume((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...update } : r))
    );
    setBerechnet(false);
  }

  // Berechnungen
  const raumDetails = raeume.map((r) => {
    const bruttoFlaeche = r.laenge * r.breite;
    const { faktor, beschreibung } = berechneAnrechnungsfaktor(r);
    const angerechneteFlaeche = bruttoFlaeche * faktor;
    return { ...r, bruttoFlaeche, faktor, beschreibung, angerechneteFlaeche };
  });

  const gesamtBrutto = raumDetails.reduce((s, r) => s + r.bruttoFlaeche, 0);
  const gesamtAngerechnet = raumDetails.reduce((s, r) => s + r.angerechneteFlaeche, 0);

  const mietvertragWert = mietvertragFlaeche ? parseFloat(mietvertragFlaeche.replace(",", ".")) : null;
  const abweichung = mietvertragWert ? ((mietvertragWert - gesamtAngerechnet) / mietvertragWert) * 100 : null;

  return (
    <div className="space-y-6">
      {/* Räume */}
      <div className="space-y-4">
        {raeume.map((raum, idx) => (
          <div
            key={raum.id}
            className="rounded-lg border border-gray-200 bg-white p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-800">
                Raum {idx + 1}
              </span>
              {raeume.length > 1 && (
                <button
                  onClick={() => removeRaum(raum.id)}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Entfernen
                </button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bezeichnung
                </label>
                <input
                  type="text"
                  value={raum.name}
                  onChange={(e) => updateRaum(raum.id, { name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Länge (m)
                </label>
                <input
                  type="number"
                  min={0.1}
                  step={0.1}
                  value={raum.laenge}
                  onChange={(e) =>
                    updateRaum(raum.id, { laenge: Math.max(0.1, Number(e.target.value)) })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Breite (m)
                </label>
                <input
                  type="number"
                  min={0.1}
                  step={0.1}
                  value={raum.breite}
                  onChange={(e) =>
                    updateRaum(raum.id, { breite: Math.max(0.1, Number(e.target.value)) })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
                <select
                  value={raum.typ}
                  onChange={(e) =>
                    updateRaum(raum.id, { typ: e.target.value as RaumTyp })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                >
                  {Object.entries(raumTypLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {raum.typ === "dachschraege" && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kniestockhöhe (m)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={raum.kniestock}
                    onChange={(e) =>
                      updateRaum(raum.id, { kniestock: Math.max(0, Number(e.target.value)) })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Raumhöhe (m)
                  </label>
                  <input
                    type="number"
                    min={0.5}
                    step={0.1}
                    value={raum.raumhoehe}
                    onChange={(e) =>
                      updateRaum(raum.id, { raumhoehe: Math.max(0.5, Number(e.target.value)) })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                  />
                </div>
              </div>
            )}

            {raum.typ === "balkon" && (
              <div className="mt-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={raum.balkonHochwertig}
                    onChange={(e) =>
                      updateRaum(raum.id, { balkonHochwertig: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                  />
                  <span className="text-sm text-gray-700">
                    Hochwertiger Balkon/Terrasse (50% statt 25%)
                  </span>
                </label>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={addRaum}
          className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 transition"
        >
          + Raum hinzufügen
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Wohnfläche laut Mietvertrag (m², optional)
        </label>
        <input
          type="text"
          value={mietvertragFlaeche}
          onChange={(e) => {
            setMietvertragFlaeche(e.target.value);
            setBerechnet(false);
          }}
          placeholder="z.B. 72,5"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600 sm:max-w-xs"
        />
      </div>

      <button
        onClick={() => setBerechnet(true)}
        className="w-full rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 transition-colors sm:w-auto"
      >
        Wohnfläche berechnen
      </button>

      {berechnet && (
        <div className="rounded-lg border-2 border-primary-600 bg-primary-50 p-6">
          <h3 className="mb-4 text-lg font-bold text-gray-900">
            Wohnflächenberechnung nach WoFlV
          </h3>

          <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Grundfläche (brutto)
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {formatNum(gesamtBrutto)} m²
              </p>
            </div>
            <div className="rounded-lg bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Angerechnete Wohnfläche
              </p>
              <p className="mt-1 text-2xl font-bold text-primary-700">
                {formatNum(gesamtAngerechnet)} m²
              </p>
            </div>
            {mietvertragWert !== null && (
              <div className="rounded-lg bg-white p-4 text-center shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Laut Mietvertrag
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {formatNum(mietvertragWert)} m²
                </p>
              </div>
            )}
          </div>

          {/* Abweichungshinweis */}
          {abweichung !== null && Math.abs(abweichung) > 10 && (
            <div className="mb-4 rounded-lg bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800">
              <strong>Achtung:</strong> Die Abweichung zwischen Mietvertrag und berechneter
              Wohnfläche beträgt{" "}
              <strong>
                {formatNum(Math.abs(abweichung))}%
                ({formatNum(Math.abs(mietvertragWert! - gesamtAngerechnet))} m²)
              </strong>.
              {abweichung > 10 && (
                <> Bei einer Abweichung von mehr als 10% hast du unter Umständen
                Anspruch auf eine Mietminderung (BGH, Az. VIII ZR 133/03). Lass die
                Wohnfläche professionell vermessen.</>
              )}
            </div>
          )}

          {/* Aufschlüsselung */}
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h4 className="mb-3 text-sm font-semibold text-gray-800">
              Aufschlüsselung nach Räumen
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    <th className="pb-2 pr-4">Raum</th>
                    <th className="pb-2 pr-4 text-right">Grundfläche</th>
                    <th className="pb-2 pr-4 text-right">Faktor</th>
                    <th className="pb-2 text-right">Wohnfläche</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {raumDetails.map((r) => (
                    <tr key={r.id}>
                      <td className="py-2 pr-4">
                        <span className="text-gray-700">{r.name}</span>
                        <br />
                        <span className="text-xs text-gray-400">{r.beschreibung}</span>
                      </td>
                      <td className="py-2 pr-4 text-right text-gray-900">
                        {formatNum(r.bruttoFlaeche)} m²
                      </td>
                      <td className="py-2 pr-4 text-right text-gray-600">
                        {Math.round(r.faktor * 100)}%
                      </td>
                      <td className="py-2 text-right font-medium text-gray-900">
                        {formatNum(r.angerechneteFlaeche)} m²
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-gray-300 font-bold">
                    <td className="py-2 pr-4 text-gray-900">Gesamt</td>
                    <td className="py-2 pr-4 text-right text-gray-900">
                      {formatNum(gesamtBrutto)} m²
                    </td>
                    <td className="py-2 pr-4 text-right"></td>
                    <td className="py-2 text-right text-primary-700">
                      {formatNum(gesamtAngerechnet)} m²
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
            <strong>Anrechnungsregeln nach Wohnflächenverordnung (WoFlV):</strong>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Dachschrägen: unter 1m = 0%, 1-2m = 50%, über 2m = 100%</li>
              <li>Balkon/Terrasse: 25% (hochwertig: 50%)</li>
              <li>Loggia: 50%</li>
              <li>Wintergarten beheizt: 100%, unbeheizt: 50%</li>
              <li>Keller, Waschküche, Heizungsraum: 0% (keine Wohnfläche)</li>
              <li>Bei Abweichung über 10% vom Mietvertrag: Recht auf Mietminderung möglich</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
