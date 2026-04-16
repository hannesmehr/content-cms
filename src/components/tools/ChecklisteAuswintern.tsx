"use client";
import { useState, useMemo } from "react";

type CheckItem = { name: string; checked: boolean };
type CheckCategory = { title: string; items: CheckItem[]; collapsed: boolean };

const initialData: CheckCategory[] = [
  {
    title: "Außenbereich",
    collapsed: false,
    items: [
      { name: "Abdeckplane/Schutzhülle entfernen und trocknen", checked: false },
      { name: "Außenhaut auf Schäden prüfen (Risse, Dellen, Grünbelag)", checked: false },
      { name: "Dichtungen an Fenstern, Türen und Dach prüfen", checked: false },
      { name: "Reifendruck kontrollieren und korrigieren", checked: false },
      { name: "Reifenprofil und Alter prüfen (max. 6 Jahre)", checked: false },
      { name: "Stützen einfahren und Auffahrkeile entfernen", checked: false },
      { name: "Bremsanlage prüfen (Handbremse, Auflaufbremse)", checked: false },
      { name: "Beleuchtung komplett testen (Blinker, Bremslicht, Rücklicht)", checked: false },
      { name: "Markise ausfahren und auf Schäden prüfen", checked: false },
      { name: "Alle Schlösser auf Funktion prüfen", checked: false },
    ],
  },
  {
    title: "Wassersystem",
    collapsed: false,
    items: [
      { name: "Frischwassertank mit Reiniger spülen und desinfizieren", checked: false },
      { name: "Tank mit frischem Wasser füllen", checked: false },
      { name: "Alle Wasserhähne schließen und Durchlauf testen", checked: false },
      { name: "Wasserpumpe einschalten und Druck prüfen", checked: false },
      { name: "Warmwasserboiler befüllen (erst danach einschalten!)", checked: false },
      { name: "Abwassertank auf Dichtheit prüfen", checked: false },
      { name: "Toilettenkassette einsetzen und Sanitärflüssigkeit einfüllen", checked: false },
      { name: "Alle Leitungen auf Lecks prüfen", checked: false },
    ],
  },
  {
    title: "Gasanlage",
    collapsed: false,
    items: [
      { name: "Gasflaschen einsetzen und anschließen", checked: false },
      { name: "Druckregler und Schläuche prüfen", checked: false },
      { name: "Gasprüfung (G607) noch gültig? Termin prüfen", checked: false },
      { name: "Alle Gasgeräte einzeln testen (Herd, Heizung, Boiler)", checked: false },
      { name: "Kühlschrank auf Gasbetrieb testen", checked: false },
    ],
  },
  {
    title: "Innenraum",
    collapsed: false,
    items: [
      { name: "Gründlich lüften (mindestens 1 Stunde)", checked: false },
      { name: "Auf Feuchtigkeit und Schimmel prüfen", checked: false },
      { name: "Polster zurücklegen und absaugen", checked: false },
      { name: "Alle Oberflächen reinigen", checked: false },
      { name: "Gardinen aufhängen / Textilien einräumen", checked: false },
      { name: "Kühlschrank reinigen und einschalten", checked: false },
      { name: "Rauchmelder und CO-Melder prüfen (Batterien tauschen)", checked: false },
      { name: "Feuchtigkeitsabsorber entfernen", checked: false },
    ],
  },
  {
    title: "Elektrik & Batterie",
    collapsed: false,
    items: [
      { name: "Bordbatterie einbauen / anklemmen", checked: false },
      { name: "Batterieladung prüfen (ggf. nachladen)", checked: false },
      { name: "Alle 12V-Geräte testen (Licht, Pumpe, Lüfter)", checked: false },
      { name: "230V-Anschluss testen (CEE-Kabel prüfen)", checked: false },
      { name: "Sicherungen kontrollieren", checked: false },
    ],
  },
  {
    title: "Dokumente & Zulassung",
    collapsed: false,
    items: [
      { name: "Saisonkennzeichen: Beginn der Zulassung prüfen", checked: false },
      { name: "Versicherungsschutz aktiv?", checked: false },
      { name: "TÜV/HU noch gültig?", checked: false },
      { name: "Gasprüfung (G607) noch gültig?", checked: false },
      { name: "ADAC / Pannenhilfe-Mitgliedschaft aktiv?", checked: false },
    ],
  },
];

export function ChecklisteAuswintern() {
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
          Alle Punkte erledigt — dein Wohnwagen ist startklar für die Saison!
        </div>
      )}
    </div>
  );
}
