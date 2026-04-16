"use client";
import { useState, useMemo } from "react";

type CheckItem = { name: string; checked: boolean };
type CheckCategory = { title: string; items: CheckItem[]; collapsed: boolean };

const initialData: CheckCategory[] = [
  {
    title: "Stellplatz einrichten",
    collapsed: false,
    items: [
      { name: "An der Rezeption anmelden und Stellplatz zuweisen lassen", checked: false },
      { name: "Wohnwagen auf dem Stellplatz positionieren", checked: false },
      { name: "Mit Wasserwaage ausrichten (Auffahrkeile nutzen)", checked: false },
      { name: "Stützrad herunterdrehen und sichern", checked: false },
      { name: "Kurbelstützen ausfahren (alle vier)", checked: false },
      { name: "Wohnwagen abkuppeln (optional)", checked: false },
      { name: "Aufsteckspiegel abnehmen", checked: false },
    ],
  },
  {
    title: "Strom anschließen",
    collapsed: false,
    items: [
      { name: "CEE-Kabel ausrollen (nicht aufgerollt lassen!)", checked: false },
      { name: "Strom an der Stromsäule anschließen", checked: false },
      { name: "FI-Schutzschalter testen", checked: false },
      { name: "230V-Steckdosen im Wohnwagen prüfen", checked: false },
      { name: "Kühlschrank auf 230V umschalten", checked: false },
    ],
  },
  {
    title: "Wasser anschließen",
    collapsed: false,
    items: [
      { name: "Frischwasseranschluss herstellen oder Tank füllen", checked: false },
      { name: "Wasserpumpe einschalten", checked: false },
      { name: "Warmwasserboiler einschalten (nur wenn befüllt!)", checked: false },
      { name: "Abwasserbehälter unter Ablauf positionieren", checked: false },
    ],
  },
  {
    title: "Gas aktivieren",
    collapsed: false,
    items: [
      { name: "Gasflaschen öffnen", checked: false },
      { name: "Druckregler auf Funktion prüfen", checked: false },
      { name: "Heizung testen (falls nötig)", checked: false },
      { name: "Herd und Kühlschrank (Gas) testen", checked: false },
    ],
  },
  {
    title: "Wohnwagen einrichten",
    collapsed: false,
    items: [
      { name: "Fenster und Dachluken öffnen (Lüften)", checked: false },
      { name: "Markise ausfahren / Vorzelt aufbauen", checked: false },
      { name: "Campingmöbel aufstellen", checked: false },
      { name: "Eingangsstufe / Trittstufe platzieren", checked: false },
      { name: "Fußmatte auslegen", checked: false },
      { name: "Fahrräder abladen und anschließen", checked: false },
    ],
  },
  {
    title: "Orientierung",
    collapsed: false,
    items: [
      { name: "Sanitäranlagen finden", checked: false },
      { name: "Entsorgungsstation für Chemie-Toilette finden", checked: false },
      { name: "Frischwasser-Zapfstelle finden", checked: false },
      { name: "Müllcontainer finden", checked: false },
      { name: "WLAN-Zugangsdaten besorgen (falls vorhanden)", checked: false },
      { name: "Platzregeln lesen (Ruhezeiten, Grillregeln)", checked: false },
    ],
  },
];

export function ChecklisteAnkunft() {
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
          Alle Punkte erledigt — viel Spaß beim Camping!
        </div>
      )}
    </div>
  );
}
