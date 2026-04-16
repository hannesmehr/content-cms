"use client";

import { useState, useMemo } from "react";

type CheckItem = { name: string; checked: boolean };
type CheckCategory = { title: string; items: CheckItem[]; collapsed: boolean };

const initialData: CheckCategory[] = [
  {
    title: "Vor der Besichtigung",
    collapsed: false,
    items: [
      { name: "Schufa-Auskunft aktuell und ausgedruckt", checked: false },
      { name: "Einkommensnachweise bereithalten (letzte 3 Gehaltsabrechnungen)", checked: false },
      { name: "Kopie des Personalausweises vorbereitet", checked: false },
      { name: "Mieterselbstauskunft ausgefüllt", checked: false },
      { name: "Fragen an den Vermieter notiert", checked: false },
      { name: "Zollstock / Maßband eingepackt", checked: false },
      { name: "Kamera / Handy für Fotos geladen", checked: false },
    ],
  },
  {
    title: "Gebäude & Umgebung",
    collapsed: false,
    items: [
      { name: "Zustand des Treppenhauses (sauber, gepflegt?)", checked: false },
      { name: "Briefkästen beschriftet und funktionsfähig", checked: false },
      { name: "Fahrradkeller vorhanden und zugänglich", checked: false },
      { name: "Kellerfläche dem Mieter zugeordnet", checked: false },
      { name: "Parkplatz / Stellplatz vorhanden", checked: false },
      { name: "ÖPNV-Anbindung geprüft (Bus, Bahn, U-Bahn)", checked: false },
      { name: "Einkaufsmöglichkeiten in der Nähe", checked: false },
      { name: "Lärmpegel der Umgebung beurteilt (Straße, Gewerbe)", checked: false },
    ],
  },
  {
    title: "Wohnung allgemein",
    collapsed: false,
    items: [
      { name: "Grundriss entspricht den Vorstellungen", checked: false },
      { name: "Zimmergrößen stimmen mit Anzeige überein (nachmessen!)", checked: false },
      { name: "Lichteinfall und Himmelsrichtung geprüft", checked: false },
      { name: "Deckenhöhe ausreichend", checked: false },
      { name: "Handyempfang in allen Räumen getestet", checked: false },
      { name: "Internetverfügbarkeit geprüft (Glasfaser, DSL?)", checked: false },
    ],
  },
  {
    title: "Zustand & Mängel",
    collapsed: false,
    items: [
      { name: "Wände auf Risse und Feuchtigkeit prüfen", checked: false },
      { name: "Fenster auf Dichtigkeit testen (Zugluft?)", checked: false },
      { name: "Heizung und Heizkörper funktionsfähig", checked: false },
      { name: "Wasserdruck in Küche und Bad testen", checked: false },
      { name: "Ausreichend Steckdosen in jedem Raum", checked: false },
      { name: "Bodenzustand prüfen (Kratzer, Dellen, Flecken)", checked: false },
      { name: "Türen schließen und öffnen richtig", checked: false },
      { name: "Rollläden / Jalousien funktionieren", checked: false },
    ],
  },
  {
    title: "Badezimmer",
    collapsed: false,
    items: [
      { name: "Fliesen ohne Risse und Schimmel", checked: false },
      { name: "Abfluss in Dusche/Wanne funktioniert", checked: false },
      { name: "Lüftung vorhanden (Fenster oder mechanisch)", checked: false },
      { name: "Warmwasser testen (Temperatur und Druck)", checked: false },
      { name: "Silikon an Fugen und Rändern intakt", checked: false },
      { name: "Toilettenspülung funktioniert einwandfrei", checked: false },
    ],
  },
  {
    title: "Küche",
    collapsed: false,
    items: [
      { name: "Wasseranschluss vorhanden und dicht", checked: false },
      { name: "Stromanschlüsse ausreichend (Herd, Backofen)", checked: false },
      { name: "Gasanschluss vorhanden (falls benötigt)", checked: false },
      { name: "Einbauküche inklusive? Zustand prüfen", checked: false },
      { name: "Abzugshaube / Dunstabzug vorhanden und funktionsfähig", checked: false },
      { name: "Platz für Kühlschrank und Geschirrspüler", checked: false },
    ],
  },
  {
    title: "Vertragliches klären",
    collapsed: false,
    items: [
      { name: "Mietpreis kalt und warm erfragen", checked: false },
      { name: "Nebenkosten-Details klären (Aufschlüsselung)", checked: false },
      { name: "Kautionshöhe und Zahlungsmodalitäten", checked: false },
      { name: "Kündigungsfrist im Mietvertrag", checked: false },
      { name: "Renovierungspflicht bei Ein-/Auszug klären", checked: false },
      { name: "Haustiere erlaubt?", checked: false },
      { name: "Untervermietung möglich?", checked: false },
      { name: "Einzugstermin und Übergabetermin besprechen", checked: false },
    ],
  },
];

export function ChecklisteWohnungsbesichtigung() {
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
          Alle Punkte abgehakt — Du bist bestens vorbereitet für die Wohnungsbesichtigung!
        </div>
      )}
    </div>
  );
}
