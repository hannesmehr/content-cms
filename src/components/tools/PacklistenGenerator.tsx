"use client";

import { useState, useMemo } from "react";

type Reisedauer = "wochenende" | "kurzurlaub" | "langzeit";
type Jahreszeit = "fruehling" | "sommer" | "herbst" | "winter";

interface PackItem {
  name: string;
  packed: boolean;
}

interface PackCategory {
  title: string;
  items: PackItem[];
}

function generatePackliste(
  dauer: Reisedauer,
  jahreszeit: Jahreszeit,
  erwachsene: number,
  kinder: number,
  mitHund: boolean,
  extras: { fahrraeder: boolean; grillen: boolean; wandern: boolean; strand: boolean }
): PackCategory[] {
  const categories: PackCategory[] = [];

  // Dokumente & Finanzen
  categories.push({
    title: "Dokumente & Finanzen",
    items: [
      "Personalausweis / Reisepass",
      "Fahrzeugschein Wohnwagen + Zugfahrzeug",
      "Versicherungskarte (grüne Karte)",
      "ADAC-/Pannenhilfe-Karte",
      "Campingplatz-Reservierung",
      "Bargeld & EC-/Kreditkarte",
      "Krankenversicherungskarte",
      ...(dauer === "langzeit" ? ["Camping Key Europe / ACSI-Karte"] : []),
    ].map((name) => ({ name, packed: false })),
  });

  // Küche & Kochen
  categories.push({
    title: "Küche & Kochen",
    items: [
      `Geschirr-Set (${erwachsene + kinder} Personen)`,
      `Besteck-Set (${erwachsene + kinder} Personen)`,
      "Kochtöpfe & Pfanne",
      "Schneidebrett & Messer",
      "Dosenöffner / Flaschenöffner",
      "Spülmittel & Schwamm",
      "Geschirrtücher",
      "Müllbeutel",
      "Kaffeemaschine / Mokka-Kanne",
      "Gewürze (Salz, Pfeffer, Öl)",
    ].map((name) => ({ name, packed: false })),
  });

  // Kleidung
  const kleidungItems: string[] = [];
  const tage = dauer === "wochenende" ? 3 : dauer === "kurzurlaub" ? 7 : 14;
  const wechsel = Math.min(tage, 7);

  kleidungItems.push(
    `Unterwäsche (${wechsel}× pro Person)`,
    `Socken (${wechsel} Paar pro Person)`,
    `T-Shirts / Oberteile (${Math.ceil(wechsel * 0.7)}× pro Person)`,
    `Hosen / Shorts (${Math.ceil(wechsel * 0.4)}× pro Person)`,
    "Schlafanzug",
    "Bequeme Schuhe / Sandalen"
  );

  if (jahreszeit === "sommer") {
    kleidungItems.push("Sonnenhut / Kappe", "Badebekleidung", "Leichte Jacke für Abende");
  } else if (jahreszeit === "winter") {
    kleidungItems.push(
      "Winterjacke",
      "Mütze & Handschuhe",
      "Thermounterwäsche",
      "Warme Schuhe / Stiefel"
    );
  } else {
    kleidungItems.push("Regenjacke", "Leichter Pullover", "Feste Schuhe");
  }

  if (jahreszeit === "herbst") {
    kleidungItems.push("Fleecejacke", "Gummistiefel");
  }

  categories.push({
    title: "Kleidung",
    items: kleidungItems.map((name) => ({ name, packed: false })),
  });

  // Hygiene & Medizin
  categories.push({
    title: "Hygiene & Medizin",
    items: [
      "Zahnbürste & Zahnpasta",
      "Duschgel & Shampoo",
      "Handtücher",
      "Sonnencreme",
      "Insektenschutz",
      "Erste-Hilfe-Set",
      "Persönliche Medikamente",
      "Toilettenpapier (Reserve)",
      ...(kinder > 0 ? ["Kinder-Sonnencreme (hoher LSF)"] : []),
    ].map((name) => ({ name, packed: false })),
  });

  // Technik & Strom
  categories.push({
    title: "Technik & Strom",
    items: [
      "CEE-Adapterkabel (Camping-Stromkabel)",
      "Kabeltrommel / Verlängerungskabel",
      "Mehrfachsteckdose",
      "Taschenlampe / Stirnlampe",
      "Handy-Ladegeräte",
      "Powerbank",
      ...(dauer === "langzeit" ? ["Laptop / Tablet + Ladegerät"] : []),
    ].map((name) => ({ name, packed: false })),
  });

  // Wohnwagen-Zubehör
  categories.push({
    title: "Wohnwagen-Zubehör",
    items: [
      "Auffahrkeile / Ausgleichskeile",
      "Stützrad-Kurbel",
      "Vorzelt / Sonnensegel",
      "Campingmöbel (Tisch + Stühle)",
      "Gasflasche (voll)",
      "Wasserkanister / Frischwasserschlauch",
      "Chemie-Toiletten-Flüssigkeit",
      "Sicherungskeile / Radkralle",
      "Werkzeugkasten (Basis)",
      "Pannenset (Ersatzrad, Wagenheber)",
    ].map((name) => ({ name, packed: false })),
  });

  // Unterhaltung
  categories.push({
    title: "Unterhaltung",
    items: [
      "Bücher / E-Reader",
      "Kartenspiele / Brettspiele",
      "Bluetooth-Lautsprecher",
      ...(kinder > 0
        ? ["Malbücher & Stifte", "Ball / Frisbee"]
        : ["Reiseführer / Wanderkarte"]),
    ].map((name) => ({ name, packed: false })),
  });

  // Kinder
  if (kinder > 0) {
    categories.push({
      title: `Kinder (${kinder})`,
      items: [
        "Kinderreisepass",
        "Lieblingskuscheltier",
        "Kinderstühle / Sitzerhöhung",
        "Nachtlicht",
        "Kinderbesteck & -geschirr",
        "Sandspielzeug",
        "Kinderbücher",
        ...(kinder > 0 && erwachsene > 0 ? ["Babyphone (bei Kleinkindern)"] : []),
      ].map((name) => ({ name, packed: false })),
    });
  }

  // Hund
  if (mitHund) {
    categories.push({
      title: "Hund",
      items: [
        "EU-Heimtierausweis",
        "Hundefutter (ausreichend Vorrat)",
        "Fress- & Wassernapf",
        "Leine & Halsband / Geschirr",
        "Hundebett / Decke",
        "Kotbeutel",
        "Zeckenzange",
        "Lieblingsspielzeug",
      ].map((name) => ({ name, packed: false })),
    });
  }

  // Sport & Outdoor (Extras)
  const sportItems: string[] = [];
  if (extras.fahrraeder) {
    sportItems.push(
      "Fahrräder + Fahrradträger",
      "Fahrradschlösser",
      "Fahrradhelme",
      "Flickzeug / Luftpumpe"
    );
  }
  if (extras.grillen) {
    sportItems.push("Campinggrill", "Grillkohle / Gas", "Grillzange & Grillbesteck", "Anzünder");
  }
  if (extras.wandern) {
    sportItems.push("Wanderschuhe", "Wanderrucksack", "Trinkflasche", "Wanderkarte / GPS");
  }
  if (extras.strand) {
    sportItems.push(
      "Strandmuschel / Sonnenschirm",
      "Strandtücher",
      "Schwimmhilfen (für Kinder)",
      "Schnorchelset",
      "Wasserschuhe"
    );
  }

  if (sportItems.length > 0) {
    categories.push({
      title: "Sport & Outdoor",
      items: sportItems.map((name) => ({ name, packed: false })),
    });
  }

  return categories;
}

export function PacklistenGenerator() {
  const [dauer, setDauer] = useState<Reisedauer>("kurzurlaub");
  const [jahreszeit, setJahreszeit] = useState<Jahreszeit>("sommer");
  const [erwachsene, setErwachsene] = useState<number>(2);
  const [kinder, setKinder] = useState<number>(0);
  const [mitHund, setMitHund] = useState<boolean>(false);
  const [extras, setExtras] = useState({
    fahrraeder: false,
    grillen: true,
    wandern: false,
    strand: false,
  });
  const [generated, setGenerated] = useState<boolean>(false);
  const [packliste, setPackliste] = useState<PackCategory[]>([]);

  const handleGenerate = () => {
    const liste = generatePackliste(dauer, jahreszeit, erwachsene, kinder, mitHund, extras);
    setPackliste(liste);
    setGenerated(true);
  };

  const toggleItem = (catIndex: number, itemIndex: number) => {
    setPackliste((prev) => {
      const next = prev.map((cat, ci) => ({
        ...cat,
        items: cat.items.map((item, ii) =>
          ci === catIndex && ii === itemIndex ? { ...item, packed: !item.packed } : item
        ),
      }));
      return next;
    });
  };

  const alleAbhaken = () => {
    setPackliste((prev) =>
      prev.map((cat) => ({
        ...cat,
        items: cat.items.map((item) => ({ ...item, packed: true })),
      }))
    );
  };

  const zuruecksetzen = () => {
    setPackliste((prev) =>
      prev.map((cat) => ({
        ...cat,
        items: cat.items.map((item) => ({ ...item, packed: false })),
      }))
    );
  };

  const totalItems = useMemo(
    () => packliste.reduce((sum, cat) => sum + cat.items.length, 0),
    [packliste]
  );
  const packedItems = useMemo(
    () => packliste.reduce((sum, cat) => sum + cat.items.filter((i) => i.packed).length, 0),
    [packliste]
  );

  const toggleExtra = (key: keyof typeof extras) => {
    setExtras((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reisedauer</label>
          <select
            value={dauer}
            onChange={(e) => setDauer(e.target.value as Reisedauer)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          >
            <option value="wochenende">Wochenende (2–3 Tage)</option>
            <option value="kurzurlaub">Kurzurlaub (4–7 Tage)</option>
            <option value="langzeit">Langzeiturlaub (2+ Wochen)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jahreszeit</label>
          <select
            value={jahreszeit}
            onChange={(e) => setJahreszeit(e.target.value as Jahreszeit)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          >
            <option value="fruehling">Frühling</option>
            <option value="sommer">Sommer</option>
            <option value="herbst">Herbst</option>
            <option value="winter">Winter</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Anzahl Erwachsene</label>
          <select
            value={erwachsene}
            onChange={(e) => setErwachsene(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Anzahl Kinder</label>
          <select
            value={kinder}
            onChange={(e) => setKinder(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          >
            {[0, 1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Optionen</label>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setMitHund(!mitHund)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              mitHund
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Mit Hund
          </button>
          {(
            [
              ["fahrraeder", "Fahrräder"],
              ["grillen", "Grillen"],
              ["wandern", "Wandern"],
              ["strand", "Schwimmen / Strand"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleExtra(key)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                extras[key]
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        className="w-full rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
      >
        {generated ? "Packliste neu generieren" : "Packliste generieren"}
      </button>

      {generated && packliste.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 text-sm text-gray-600">
              <strong>
                {packedItems} / {totalItems}
              </strong>{" "}
              eingepackt
            </div>
            <div className="h-2 flex-1 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary-600 transition-all"
                style={{ width: `${totalItems > 0 ? (packedItems / totalItems) * 100 : 0}%` }}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={alleAbhaken}
                className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition"
              >
                Alles abhaken
              </button>
              <button
                type="button"
                onClick={zuruecksetzen}
                className="rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-300 transition"
              >
                Zurücksetzen
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700 transition"
              >
                Liste drucken
              </button>
            </div>
          </div>

          <div className="space-y-4 print:space-y-2" id="packliste-print">
            {packliste.map((cat, catIndex) => (
              <div
                key={cat.title}
                className="rounded-lg border border-gray-200 bg-white overflow-hidden"
              >
                <h4 className="bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 border-b border-primary-100">
                  {cat.title} ({cat.items.filter((i) => i.packed).length}/{cat.items.length})
                </h4>
                <ul className="divide-y divide-gray-100 px-4">
                  {cat.items.map((item, itemIndex) => (
                    <li key={item.name} className="py-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.packed}
                          onChange={() => toggleItem(catIndex, itemIndex)}
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                        />
                        <span
                          className={`text-sm ${
                            item.packed ? "text-gray-400 line-through" : "text-gray-700"
                          }`}
                        >
                          {item.name}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
