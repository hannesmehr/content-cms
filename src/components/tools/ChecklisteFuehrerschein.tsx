"use client";

import { useState, useMemo } from "react";

type CheckItem = { name: string; checked: boolean };
type CheckCategory = { title: string; items: CheckItem[]; collapsed: boolean };

const initialData: CheckCategory[] = [
  {
    title: "Vor der Anmeldung",
    collapsed: false,
    items: [
      { name: "Mindestalter prüfen (Klasse B: 17 mit BF17, sonst 18)", checked: false },
      { name: "Fahrschulen in der Nähe vergleichen (Preise, Bewertungen, Erfolgsquote)", checked: false },
      { name: "Kosten kalkulieren und Finanzierung klären", checked: false },
      { name: "Eventuell Intensivkurs oder regulären Kurs wählen", checked: false },
    ],
  },
  {
    title: "Dokumente besorgen",
    collapsed: false,
    items: [
      { name: "Biometrisches Passfoto anfertigen lassen", checked: false },
      { name: "Sehtest durchführen lassen (max. 2 Jahre alt, beim Optiker oder Augenarzt)", checked: false },
      { name: "Erste-Hilfe-Kurs absolvieren (9 Unterrichtseinheiten à 45 min)", checked: false },
      { name: "Personalausweis oder Reisepass bereithalten (gültig!)", checked: false },
    ],
  },
  {
    title: "Anmeldung",
    collapsed: false,
    items: [
      { name: "Bei der gewählten Fahrschule anmelden", checked: false },
      { name: "Antrag auf Erteilung der Fahrerlaubnis bei der Führerscheinstelle stellen", checked: false },
      { name: "Verwaltungsgebühr bezahlen (ca. 40–70 €)", checked: false },
      { name: "Bearbeitungszeit abwarten (ca. 2–6 Wochen)", checked: false },
    ],
  },
  {
    title: "Theorieausbildung",
    collapsed: false,
    items: [
      { name: "Theorie-Pflichtstunden besuchen (14 × 90 min Grundstoff für Klasse B)", checked: false },
      { name: "Zusatzstoff-Stunden besuchen (2 × 90 min für Klasse B)", checked: false },
      { name: "Lernmaterial / Lern-App besorgen (z. B. Fahren Lernen)", checked: false },
      { name: "Alle Übungsfragen mindestens 1× durcharbeiten", checked: false },
      { name: "Prüfungssimulationen bestehen (mehrfach unter 10 Fehlerpunkte)", checked: false },
    ],
  },
  {
    title: "Praktische Ausbildung",
    collapsed: false,
    items: [
      { name: "Grundfahraufgaben üben (Einparken, Wenden, Notbremsung)", checked: false },
      { name: "Übungsfahrstunden absolvieren (ca. 20–30 Stunden üblich)", checked: false },
      { name: "Sonderfahrt: 5 Überlandfahrten (à 45 min) absolviert", checked: false },
      { name: "Sonderfahrt: 4 Autobahnfahrten (à 45 min) absolviert", checked: false },
      { name: "Sonderfahrt: 3 Nachtfahrten (à 45 min) absolviert", checked: false },
      { name: "Prüfungsreife vom Fahrlehrer bestätigt", checked: false },
    ],
  },
  {
    title: "Prüfungen",
    collapsed: false,
    items: [
      { name: "Theorieprüfung beim TÜV/DEKRA anmelden", checked: false },
      { name: "Theorieprüfung bestanden (max. 10 Fehlerpunkte)", checked: false },
      { name: "Praktische Prüfung beim TÜV/DEKRA anmelden", checked: false },
      { name: "Praktische Prüfung bestanden", checked: false },
    ],
  },
  {
    title: "Nach bestandener Prüfung",
    collapsed: false,
    items: [
      { name: "Führerschein bei der Führerscheinstelle abholen", checked: false },
      { name: "Probezeit beachten: 2 Jahre (0,0 ‰ Alkoholgrenze!)", checked: false },
      { name: "Bei BF17: Begleitpersonen eintragen lassen", checked: false },
    ],
  },
];

export function ChecklisteFuehrerschein() {
  const [categories, setCategories] = useState<CheckCategory[]>(
    () => initialData.map((c) => ({ ...c, items: c.items.map((i) => ({ ...i })) }))
  );

  const { checked, total } = useMemo(() => {
    let checked = 0;
    let total = 0;
    for (const cat of categories) {
      for (const item of cat.items) {
        total++;
        if (item.checked) checked++;
      }
    }
    return { checked, total };
  }, [categories]);

  const percent = total > 0 ? Math.round((checked / total) * 100) : 0;

  function toggleItem(catIdx: number, itemIdx: number) {
    setCategories((prev) =>
      prev.map((cat, ci) =>
        ci === catIdx
          ? {
              ...cat,
              items: cat.items.map((item, ii) =>
                ii === itemIdx ? { ...item, checked: !item.checked } : item
              ),
            }
          : cat
      )
    );
  }

  function toggleCollapse(catIdx: number) {
    setCategories((prev) =>
      prev.map((cat, ci) =>
        ci === catIdx ? { ...cat, collapsed: !cat.collapsed } : cat
      )
    );
  }

  function checkAll() {
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        items: cat.items.map((item) => ({ ...item, checked: true })),
      }))
    );
  }

  function reset() {
    setCategories(
      initialData.map((c) => ({ ...c, collapsed: false, items: c.items.map((i) => ({ ...i, checked: false })) }))
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={checkAll} className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700 transition">
          Alles abhaken
        </button>
        <button onClick={reset} className="rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-300 transition">
          Zurücksetzen
        </button>
        <button onClick={() => window.print()} className="rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-300 transition">
          Liste drucken
        </button>
        <span className="ml-auto text-sm font-medium text-gray-600">
          {checked} / {total} erledigt
        </span>
      </div>

      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-primary-600 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200">
        {categories.map((cat, catIdx) => {
          const catChecked = cat.items.filter((i) => i.checked).length;
          return (
            <div key={cat.title}>
              <button
                type="button"
                onClick={() => toggleCollapse(catIdx)}
                className="flex w-full items-center justify-between bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 border-b border-primary-100"
              >
                <span>{cat.title}</span>
                <span className="flex items-center gap-2 text-xs font-normal text-primary-600">
                  ({catChecked}/{cat.items.length})
                  <svg
                    className={`h-4 w-4 transition-transform ${cat.collapsed ? "" : "rotate-180"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              {!cat.collapsed && (
                <ul className="divide-y divide-gray-100">
                  {cat.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start gap-3 px-4 py-2">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleItem(catIdx, itemIdx)}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                      />
                      <span className={`text-sm ${item.checked ? "text-gray-400 line-through" : "text-gray-700"}`}>
                        {item.name}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {percent === 100 && (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          Alle Schritte erledigt — herzlichen Glückwunsch zum Führerschein!
        </div>
      )}
    </div>
  );
}
