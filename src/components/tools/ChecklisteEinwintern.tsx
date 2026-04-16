"use client";
import { useState, useMemo } from "react";

type CheckItem = { name: string; checked: boolean };
type CheckCategory = { title: string; items: CheckItem[]; collapsed: boolean };

const initialData: CheckCategory[] = [
  {
    title: "Außenbereich",
    collapsed: false,
    items: [
      { name: "Wohnwagen gründlich waschen (auch Dach und Unterboden)", checked: false },
      { name: "Dichtungen prüfen und mit Gummipflege behandeln", checked: false },
      { name: "Regenrinnen und Abläufe reinigen", checked: false },
      { name: "Fenster und Dachhauben auf Risse prüfen", checked: false },
      { name: "Alle Schlösser ölen und mit Frostschutz behandeln", checked: false },
      { name: "Markise trocknen, reinigen und einfahren", checked: false },
      { name: "Deichsel und Kupplungskopf fetten", checked: false },
      { name: "Reifendruck auf Maximum erhöhen (ca. 0,5 bar über Normaldruck)", checked: false },
      { name: "Wohnwagen auf Auffahrkeile oder Stützen stellen (Reifen entlasten)", checked: false },
      { name: "Schutzhülle oder Abdeckplane aufziehen (optional)", checked: false },
    ],
  },
  {
    title: "Wassersystem",
    collapsed: false,
    items: [
      { name: "Frischwassertank vollständig entleeren", checked: false },
      { name: "Warmwasserboiler entleeren (Ablassventil öffnen)", checked: false },
      { name: "Alle Wasserhähne öffnen und offen lassen", checked: false },
      { name: "Wasserpumpe ausschalten", checked: false },
      { name: "Abwassertank entleeren und reinigen", checked: false },
      { name: "Duschschlauch entleeren", checked: false },
      { name: "Toilettenkassette entleeren, reinigen und offen lagern", checked: false },
      { name: "Frostschutz in Siphons und Abläufe geben (optional)", checked: false },
    ],
  },
  {
    title: "Gasanlage",
    collapsed: false,
    items: [
      { name: "Gasflaschen zudrehen", checked: false },
      { name: "Gasflaschen bei Bedarf ausbauen und frostfrei lagern", checked: false },
      { name: "Gasschläuche auf Risse prüfen", checked: false },
      { name: "Kühlschrank auf Gasbetrieb ausschalten", checked: false },
    ],
  },
  {
    title: "Innenraum",
    collapsed: false,
    items: [
      { name: "Alle Lebensmittel entfernen", checked: false },
      { name: "Kühlschrank ausschalten, reinigen und Tür offen lassen", checked: false },
      { name: "Polster aufstellen oder hochklappen (Luftzirkulation)", checked: false },
      { name: "Schränke und Klappen einen Spalt offen lassen", checked: false },
      { name: "Textilien, Bettwäsche und Gardinen mitnehmen oder waschen", checked: false },
      { name: "Feuchtigkeitsabsorber aufstellen (Granulat / Luftentfeuchter)", checked: false },
      { name: "Mülleimer leeren und reinigen", checked: false },
    ],
  },
  {
    title: "Elektrik & Batterie",
    collapsed: false,
    items: [
      { name: "Alle 12V-Verbraucher ausschalten", checked: false },
      { name: "Bordbatterie abklemmen oder ausbauen", checked: false },
      { name: "Batterie vollständig laden und frostfrei lagern", checked: false },
      { name: "Alle Sicherungen prüfen und dokumentieren", checked: false },
    ],
  },
  {
    title: "Dokumente & Versicherung",
    collapsed: false,
    items: [
      { name: "Saisonkennzeichen-Zeitraum prüfen", checked: false },
      { name: "Versicherung informieren (bei Stilllegung)", checked: false },
      { name: "TÜV- und Gasprüfungstermine notieren", checked: false },
      { name: "Fahrzeugschein sicher aufbewahren", checked: false },
    ],
  },
];

export function ChecklisteEinwintern() {
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
          Alle Punkte erledigt — dein Wohnwagen ist winterfest!
        </div>
      )}
    </div>
  );
}
