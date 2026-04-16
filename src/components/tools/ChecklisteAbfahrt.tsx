"use client";
import { useState, useMemo } from "react";

type CheckItem = { name: string; checked: boolean };
type CheckCategory = { title: string; items: CheckItem[]; collapsed: boolean };

const initialData: CheckCategory[] = [
  {
    title: "Beladung & Gewicht",
    collapsed: false,
    items: [
      { name: "Zuladung prüfen (nicht über zulässiges Gesamtgewicht)", checked: false },
      { name: "Schwere Gegenstände tief und mittig verstauen", checked: false },
      { name: "Ladung sichern (nichts lose im Wohnwagen)", checked: false },
      { name: "Kühlschrank-Inhalt sichern (Verriegelung prüfen)", checked: false },
    ],
  },
  {
    title: "Außen am Wohnwagen",
    collapsed: false,
    items: [
      { name: "Ankuppeln: Kupplung eingerastet und gesichert", checked: false },
      { name: "Abreißseil am Zugfahrzeug befestigt", checked: false },
      { name: "Stützrad vollständig hochgekurbelt und gesichert", checked: false },
      { name: "Elektrik-Stecker eingesteckt (13-polig)", checked: false },
      { name: "Beleuchtung testen (Blinker, Bremslicht, Rücklicht, Nebelschluss)", checked: false },
      { name: "Reifendruck kontrolliert (Wohnwagen + Zugfahrzeug)", checked: false },
      { name: "Spiegel korrekt eingestellt (Aufsteckspiegel)", checked: false },
      { name: "Markise eingefahren und verriegelt", checked: false },
      { name: "Fenster und Dachhauben geschlossen und verriegelt", checked: false },
      { name: "Alle Außenklappen geschlossen (Gas, Strom, Wasser)", checked: false },
      { name: "Auffahrkeile und Stützen verstaut", checked: false },
      { name: "Eingangstür verriegelt", checked: false },
    ],
  },
  {
    title: "Innen im Wohnwagen",
    collapsed: false,
    items: [
      { name: "Alle Schranktüren und Klappen verriegelt", checked: false },
      { name: "Herd gesichert und Gasventil geschlossen", checked: false },
      { name: "Toilettenkassette eingesetzt und verschlossen", checked: false },
      { name: "Fenster und Dachluken geschlossen", checked: false },
      { name: "Heizung ausgeschaltet", checked: false },
      { name: "Fernseher / lose Gegenstände gesichert", checked: false },
      { name: "Tisch abgesenkt oder gesichert", checked: false },
    ],
  },
  {
    title: "Gasanlage",
    collapsed: false,
    items: [
      { name: "Gasflaschen zugedreht (Fahrt nur ohne Gas!)", checked: false },
      { name: "Alternativ: Crashsensor / Sicherheitsventil aktiv", checked: false },
      { name: "Gaskasten verschlossen", checked: false },
    ],
  },
  {
    title: "Dokumente",
    collapsed: false,
    items: [
      { name: "Fahrzeugschein Zugfahrzeug dabei", checked: false },
      { name: "Fahrzeugschein Wohnwagen dabei", checked: false },
      { name: "Versicherungskarte (grüne Karte)", checked: false },
      { name: "Personalausweis / Reisepass", checked: false },
      { name: "Campingplatz-Reservierung / Buchungsbestätigung", checked: false },
      { name: "Vignetten / Mautbox (bei Bedarf)", checked: false },
    ],
  },
  {
    title: "Zugfahrzeug",
    collapsed: false,
    items: [
      { name: "Motoröl und Kühlwasser geprüft", checked: false },
      { name: "Tankfüllung ausreichend", checked: false },
      { name: "Warndreieck, Warnweste, Verbandskasten vorhanden", checked: false },
      { name: "Navi programmiert / Route geplant", checked: false },
    ],
  },
];

export function ChecklisteAbfahrt() {
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
          Alle Punkte erledigt — gute Fahrt!
        </div>
      )}
    </div>
  );
}
