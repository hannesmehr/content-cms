"use client";

import { useState } from "react";

// Quelle: Matador Reifendrucktabelle für Caravans und Anhänger (ETRTO 2002)
// PKW-Reifen: EHK 30, LI +10%, typisch 3,0 bar (Reinf. 3,4 bar)
// C-Reifen: EHK 54, LI +5%, typisch 3,75–4,75 bar

type CaravanTire = {
  id: string;
  label: string;
  loadIndex: number;
  maxKgAnhaenger: number;
  druckBar: number;
  istCReifen: boolean;
};

const caravanTires: CaravanTire[] = [
  // PKW-Reifen für Anhänger (EHK 30, LI +10%)
  { id: "175/70R14", label: "175/70 R14", loadIndex: 84, maxKgAnhaenger: 550, druckBar: 3.0, istCReifen: false },
  { id: "185/65R14", label: "185/65 R14", loadIndex: 86, maxKgAnhaenger: 585, druckBar: 3.0, istCReifen: false },
  { id: "185/65R14Reinf", label: "185/65 R14 Reinf.", loadIndex: 90, maxKgAnhaenger: 660, druckBar: 3.4, istCReifen: false },
  { id: "185R14", label: "185 R14", loadIndex: 90, maxKgAnhaenger: 660, druckBar: 3.0, istCReifen: false },
  { id: "195/70R14", label: "195/70 R14", loadIndex: 91, maxKgAnhaenger: 675, druckBar: 3.0, istCReifen: false },
  // C-Reifen für Anhänger (EHK 54, LI +5%)
  { id: "175/65R14C", label: "175/65 R14C", loadIndex: 90, maxKgAnhaenger: 630, druckBar: 3.75, istCReifen: true },
  { id: "185R14C", label: "185 R14C", loadIndex: 102, maxKgAnhaenger: 890, druckBar: 4.5, istCReifen: true },
  { id: "195/70R15C", label: "195/70 R15C", loadIndex: 104, maxKgAnhaenger: 945, druckBar: 4.5, istCReifen: true },
  { id: "215/70R15C", label: "215/70 R15C", loadIndex: 109, maxKgAnhaenger: 1080, druckBar: 4.5, istCReifen: true },
  { id: "195/75R16C", label: "195/75 R16C", loadIndex: 107, maxKgAnhaenger: 1020, druckBar: 4.75, istCReifen: true },
];

type Beladung = "leicht" | "normal" | "voll";

const beladungOptionen: Record<Beladung, { label: string; faktor: number }> = {
  leicht: { label: "Leicht beladen", faktor: 0.95 },
  normal: { label: "Normal (empfohlen)", faktor: 1.0 },
  voll: { label: "Voll beladen", faktor: 1.0 },
};

function formatNumber(n: number, decimals = 1): string {
  return n.toLocaleString("de-DE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function ReifendruckTabelle() {
  const [selectedTireId, setSelectedTireId] = useState<string>("185/65R14");
  const [beladung, setBeladung] = useState<Beladung>("normal");

  const selectedTire = caravanTires.find((t) => t.id === selectedTireId);
  const beladungFaktor = beladungOptionen[beladung]?.faktor || 1.0;
  const empfohlenerDruck = (selectedTire?.druckBar || 3.0) * beladungFaktor;

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="space-y-6">
      {/* Eingaben */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Reifengröße</label>
          <select
            value={selectedTireId}
            onChange={(e) => setSelectedTireId(e.target.value)}
            className={inputClass}
          >
            <optgroup label="PKW-Reifen">
              {caravanTires
                .filter((t) => !t.istCReifen)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label} (LI {t.loadIndex})
                  </option>
                ))}
            </optgroup>
            <optgroup label="C-Reifen (verstärkt)">
              {caravanTires
                .filter((t) => t.istCReifen)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label} (LI {t.loadIndex})
                  </option>
                ))}
            </optgroup>
          </select>
        </div>

        <div>
          <label className={labelClass}>Beladung</label>
          <select
            value={beladung}
            onChange={(e) => setBeladung(e.target.value as Beladung)}
            className={inputClass}
          >
            {Object.entries(beladungOptionen).map(([key, opt]) => (
              <option key={key} value={key}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ergebnis */}
      {selectedTire && (
        <div className="rounded-lg border-2 border-primary-600 bg-primary-50 p-6">
          <h3 className="mb-4 text-lg font-bold text-gray-900">
            Empfohlener Reifendruck
          </h3>

          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Empfohlener Druck (kalt)
              </p>
              <p className="mt-1 text-3xl font-bold text-primary-700">
                {formatNumber(empfohlenerDruck)} bar
              </p>
              <p className="text-xs text-gray-500">
                {selectedTire.label} · {beladungOptionen[beladung].label}
              </p>
            </div>

            <div className="rounded-lg bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Max. Tragfähigkeit pro Reifen
              </p>
              <p className="mt-1 text-3xl font-bold text-gray-900">
                {selectedTire.maxKgAnhaenger} kg
              </p>
              <p className="text-xs text-gray-500">
                LI {selectedTire.loadIndex} · {selectedTire.istCReifen ? "C-Reifen (verstärkt)" : "PKW-Reifen"} · Anhänger-Norm
              </p>
            </div>
          </div>

          {beladung === "leicht" && (
            <div className="rounded-md bg-yellow-50 p-3">
              <p className="text-xs text-yellow-800">
                <strong>Hinweis:</strong> Bei leichter Beladung kann der Druck leicht
                reduziert werden. Im Zweifelsfall den Wert für normale Beladung verwenden.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Übersichtstabelle */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <h4 className="text-sm font-semibold text-gray-800">
            Übersicht Caravan-Reifen
          </h4>
          <p className="text-xs text-gray-500">
            Werte basierend auf ETRTO-Norm für Anhänger (erhöhte Tragfähigkeit)
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Größe
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                  LI
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                  Typ
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                  Max. kg
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                  Druck (bar)
                </th>
              </tr>
            </thead>
            <tbody>
              {caravanTires.map((tire) => {
                const isSelected = tire.id === selectedTireId;
                return (
                  <tr
                    key={tire.id}
                    className={`border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                      isSelected ? "bg-primary-50 font-semibold" : ""
                    }`}
                    onClick={() => setSelectedTireId(tire.id)}
                  >
                    <td
                      className={`px-4 py-2 ${
                        isSelected ? "text-primary-700" : "text-gray-900"
                      }`}
                    >
                      {tire.label}
                    </td>
                    <td className="px-4 py-2 text-center text-gray-600">
                      {tire.loadIndex}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          tire.istCReifen
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {tire.istCReifen ? "C" : "PKW"}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-2 text-right ${
                        isSelected ? "text-primary-700" : "text-gray-600"
                      }`}
                    >
                      {tire.maxKgAnhaenger} kg
                    </td>
                    <td
                      className={`px-4 py-2 text-right ${
                        isSelected
                          ? "text-primary-700 font-bold"
                          : "text-gray-900"
                      }`}
                    >
                      {formatNumber(tire.druckBar)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Allgemeine Hinweise */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h4 className="mb-3 text-sm font-semibold text-gray-800">
          Wichtige Hinweise zum Reifendruck
        </h4>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md bg-white p-3">
            <p className="text-xs font-semibold text-gray-700">
              Immer kalt messen
            </p>
            <p className="text-xs text-gray-600">
              Reifendruck immer am kalten Reifen messen (vor Fahrtantritt).
              Warme Reifen zeigen einen höheren Druck an – dann nicht ablassen!
            </p>
          </div>

          <div className="rounded-md bg-white p-3">
            <p className="text-xs font-semibold text-gray-700">
              DOT-Alter prüfen
            </p>
            <p className="text-xs text-gray-600">
              Reifen sollten nicht älter als 6 Jahre sein, unabhängig vom
              Profil. Die DOT-Nummer zeigt die Produktionswoche und das Jahr
              (z.B. DOT 2420 = Woche 24, Jahr 2020).
            </p>
          </div>

          <div className="rounded-md bg-white p-3">
            <p className="text-xs font-semibold text-gray-700">
              C-Reifen: Ventile beachten
            </p>
            <p className="text-xs text-gray-600">
              Ab 4,5 bar sind Metallventile vorgeschrieben. Normale
              Gummiventile (snap-in) sind nur bis 4,5 bar zugelassen.
            </p>
          </div>

          <div className="rounded-md bg-white p-3">
            <p className="text-xs font-semibold text-gray-700">
              Regelmäßig kontrollieren
            </p>
            <p className="text-xs text-gray-600">
              Reifendruck alle 4 Wochen und vor jeder Fahrt kontrollieren.
              Auch bei längerem Stehen verlieren Reifen Luft. Mindestprofiltiefe:
              1,6 mm (empfohlen: 3 mm).
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
        <p>
          Werte basieren auf der ETRTO-Norm für Anhänger (erhöhte Tragfähigkeit).
          Der verbindliche Reifendruck steht in den Fahrzeugpapieren bzw. auf dem
          Typenschild deines Wohnwagens. Im Zweifel gilt immer die Herstellerangabe.
        </p>
      </div>
    </div>
  );
}
