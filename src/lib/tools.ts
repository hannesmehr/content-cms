export type ToolDefinition = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
  keywords: string[];
  sites: string[];
  group?: string; // Optional thematic group for sites with many tools
};

// ─── Site-specific metadata for the tools overview page ───
export const toolsPageMeta: Record<string, { title: string; heading: string; description: string }> = {
  "wohnwagenratgeber-de": {
    title: "Kostenlose Wohnwagen-Tools & Rechner",
    heading: "Wohnwagen-Tools & Rechner",
    description: "Praktische Online-Rechner und Tools rund um deinen Wohnwagen — kostenlos und ohne Anmeldung.",
  },
  "immobiliensanierung-com": {
    title: "Kostenlose Sanierungs-Tools & Rechner",
    heading: "Sanierungs-Tools & Rechner",
    description: "Praktische Online-Rechner rund um Sanierung, Förderung und Energieeffizienz — kostenlos und ohne Anmeldung.",
  },
  "fahrschulbewertung-de": {
    title: "Kostenlose Führerschein-Tools & Rechner",
    heading: "Führerschein-Tools & Rechner",
    description: "Praktische Online-Rechner rund um Führerschein, Bußgeld und Fahranfänger — kostenlos und ohne Anmeldung.",
  },
  "wohnunggesucht-com": {
    title: "Kostenlose Miet-Tools & Rechner",
    heading: "Miet-Tools & Rechner",
    description: "Praktische Online-Rechner rund um Miete, Nebenkosten und Wohnungssuche — kostenlos und ohne Anmeldung.",
  },
  "wochenendbeziehungen-de": {
    title: "Kostenlose Beziehungs-Tools",
    heading: "Beziehungs-Tools",
    description: "Praktische Online-Tools für Fernbeziehungen und Paare — kostenlos und ohne Anmeldung.",
  },
};

export const tools: ToolDefinition[] = [
  // ─── wohnwagenratgeber-de ───────────────────────────────
  {
    slug: "zuladungsrechner",
    title: "Zuladungsrechner für Wohnwagen",
    shortTitle: "Zuladungsrechner",
    description:
      "Berechne die verbleibende Zuladung deines Wohnwagens. Mit Berücksichtigung von Wasser, Gas, Personen und Gepäck.",
    icon: "scale",
    keywords: ["zuladung", "gewicht", "beladung", "gesamtgewicht"],
    sites: ["wohnwagenratgeber-de"],
    group: "Gewicht & Gespann",
  },
  {
    slug: "fuehrerschein-check",
    title: "Führerschein-Check: Welchen Wohnwagen darf ich ziehen?",
    shortTitle: "Führerschein-Check",
    description:
      "Prüfe, ob du deinen Wohnwagen mit deinem Führerschein ziehen darfst. Für Klasse B, B96, BE und alte Klasse 3.",
    icon: "id-card",
    keywords: ["führerschein", "fahrerlaubnis", "klasse b", "anhänger"],
    sites: ["wohnwagenratgeber-de"],
    group: "Gewicht & Gespann",
  },
  {
    slug: "gasverbrauch-rechner",
    title: "Gasverbrauch-Rechner für Wohnwagen",
    shortTitle: "Gasverbrauch-Rechner",
    description:
      "Wie lange reicht deine Gasflasche? Berechne den Verbrauch für Heizung, Kochen, Kühlschrank und Warmwasser.",
    icon: "flame",
    keywords: ["gas", "propan", "verbrauch", "gasflasche", "heizung"],
    sites: ["wohnwagenratgeber-de"],
    group: "Gas, Strom & Wasser",
  },
  {
    slug: "gespann-rechner",
    title: "Gespannlänge & Tempolimit-Rechner",
    shortTitle: "Gespann & Tempolimit",
    description:
      "Berechne die Gesamtlänge deines Gespanns und sieh die Tempolimits für ganz Europa auf einen Blick.",
    icon: "truck",
    keywords: ["gespann", "länge", "tempolimit", "geschwindigkeit", "europa"],
    sites: ["wohnwagenratgeber-de"],
    group: "Gewicht & Gespann",
  },
  {
    slug: "stuetzlast-rechner",
    title: "Stützlast-Rechner für Wohnwagen",
    shortTitle: "Stützlast-Rechner",
    description:
      "Prüfe, ob die Stützlast deines Wohnwagens zu Zugfahrzeug und Anhängerkupplung passt.",
    icon: "arrow-down",
    keywords: ["stützlast", "anhängerkupplung", "kupplungslast"],
    sites: ["wohnwagenratgeber-de"],
    group: "Gewicht & Gespann",
  },
  {
    slug: "kfz-steuer-rechner",
    title: "Kfz-Steuer-Rechner für Wohnwagen",
    shortTitle: "Kfz-Steuer-Rechner",
    description:
      "Berechne die jährliche Kfz-Steuer für deinen Wohnwagen anhand des zulässigen Gesamtgewichts.",
    icon: "banknotes",
    keywords: ["steuer", "kfz-steuer", "kosten", "finanzamt"],
    sites: ["wohnwagenratgeber-de"],
    group: "Kosten & Versicherung",
  },
  {
    slug: "saisonkennzeichen-rechner",
    title: "Saisonkennzeichen-Rechner: Lohnt es sich?",
    shortTitle: "Saisonkennzeichen",
    description:
      "Vergleiche Kosten von Ganzjahreszulassung und Saisonkennzeichen. Finde heraus, ob sich ein Saisonkennzeichen lohnt.",
    icon: "calendar",
    keywords: ["saisonkennzeichen", "zulassung", "versicherung", "kosten"],
    sites: ["wohnwagenratgeber-de"],
    group: "Kosten & Versicherung",
  },
  {
    slug: "packlisten-generator",
    title: "Packlisten-Generator für den Wohnwagen-Urlaub",
    shortTitle: "Packlisten-Generator",
    description:
      "Erstelle eine individuelle Packliste für deinen Wohnwagen-Urlaub. Angepasst an Reisedauer, Jahreszeit und Mitreisende.",
    icon: "clipboard",
    keywords: ["packliste", "checkliste", "urlaub", "packen"],
    sites: ["wohnwagenratgeber-de"],
    group: "Reise & Unterwegs",
  },
  {
    slug: "jahreskosten-rechner",
    title: "Wohnwagen-Kosten-Rechner: Jährliche Gesamtkosten",
    shortTitle: "Jahreskosten-Rechner",
    description:
      "Was kostet ein Wohnwagen pro Jahr? Berechne alle laufenden Kosten: Steuer, Versicherung, Stellplatz, Wartung und mehr.",
    icon: "calculator",
    keywords: ["kosten", "jahreskosten", "unterhalt", "budget"],
    sites: ["wohnwagenratgeber-de"],
    group: "Kosten & Versicherung",
  },
  {
    slug: "campingplatz-budget-rechner",
    title: "Campingplatz-Budget-Rechner",
    shortTitle: "Campingplatz-Budget",
    description:
      "Berechne die Gesamtkosten für deinen Campingplatz-Aufenthalt. Stellplatz, Strom, Kurtaxe und mehr auf einen Blick.",
    icon: "tent",
    keywords: ["campingplatz", "kosten", "stellplatz", "budget", "urlaub"],
    sites: ["wohnwagenratgeber-de"],
    group: "Kosten & Versicherung",
  },
  {
    slug: "checkliste-einwintern",
    title: "Checkliste: Wohnwagen winterfest machen (Einwintern)",
    shortTitle: "Checkliste Einwintern",
    description:
      "Schritt für Schritt den Wohnwagen winterfest machen. Interaktive Checkliste für Wassersystem, Gas, Elektrik und mehr.",
    icon: "snowflake",
    keywords: ["einwintern", "winterfest", "checkliste", "winter", "saison"],
    sites: ["wohnwagenratgeber-de"],
    group: "Checklisten",
  },
  {
    slug: "checkliste-auswintern",
    title: "Checkliste: Wohnwagen fit für die Saison (Auswintern)",
    shortTitle: "Checkliste Auswintern",
    description:
      "Wohnwagen nach dem Winter startklar machen. Interaktive Checkliste für alle Checks vor der ersten Fahrt.",
    icon: "sun",
    keywords: ["auswintern", "saisonstart", "checkliste", "frühling"],
    sites: ["wohnwagenratgeber-de"],
    group: "Checklisten",
  },
  {
    slug: "checkliste-abfahrt",
    title: "Checkliste vor der Abfahrt mit dem Wohnwagen",
    shortTitle: "Checkliste Abfahrt",
    description:
      "Nichts vergessen vor der Abfahrt: Ankuppeln, Beleuchtung, Ladung, Dokumente. Interaktive Checkliste zum Abhaken.",
    icon: "arrow-right-start",
    keywords: ["abfahrt", "ankuppeln", "checkliste", "losfahren"],
    sites: ["wohnwagenratgeber-de"],
    group: "Checklisten",
  },
  {
    slug: "checkliste-ankunft",
    title: "Checkliste nach Ankunft auf dem Campingplatz",
    shortTitle: "Checkliste Ankunft",
    description:
      "Stellplatz einrichten, Strom und Wasser anschließen, Gas aktivieren. Interaktive Checkliste für die Ankunft.",
    icon: "map-pin",
    keywords: ["ankunft", "campingplatz", "einrichten", "stellplatz"],
    sites: ["wohnwagenratgeber-de"],
    group: "Checklisten",
  },
  {
    slug: "e-auto-reichweiten-rechner",
    title: "Reichweitenrechner: E-Auto mit Wohnwagen",
    shortTitle: "E-Auto Reichweite",
    description:
      "Wie weit kommst du mit dem E-Auto und Wohnwagen? Reichweite, Verbrauch und Ladestopps berechnen — mit über 30 Fahrzeugen.",
    icon: "bolt",
    keywords: ["elektroauto", "reichweite", "e-auto", "gespann", "laden", "akku"],
    sites: ["wohnwagenratgeber-de"],
    group: "Reise & Unterwegs",
  },
  {
    slug: "maut-rechner-europa",
    title: "Maut-Rechner für Wohnwagen-Gespanne in Europa",
    shortTitle: "Maut-Rechner Europa",
    description:
      "Berechne die Mautkosten für dein Wohnwagen-Gespann in Europa. Vignetten, Streckenmaut und Tunnel — alle Länder im Überblick.",
    icon: "globe",
    keywords: ["maut", "vignette", "autobahngebühr", "europa", "tunnel"],
    sites: ["wohnwagenratgeber-de"],
    group: "Reise & Unterwegs",
  },
  {
    slug: "solaranlage-rechner",
    title: "Solar-Rechner für Wohnwagen",
    shortTitle: "Solar-Rechner",
    description:
      "Wie viel Watt Solarleistung brauchst du? Berechne den Energiebedarf und die passende Panelgröße für deinen Wohnwagen.",
    icon: "light-bulb",
    keywords: ["solar", "photovoltaik", "autark", "strom", "panel"],
    sites: ["wohnwagenratgeber-de"],
    group: "Gas, Strom & Wasser",
  },
  {
    slug: "stromverbrauch-rechner",
    title: "Stromverbrauch-Rechner: 12V & 230V im Wohnwagen",
    shortTitle: "Stromverbrauch-Rechner",
    description:
      "Berechne deinen Stromverbrauch im Wohnwagen. Wie lange reicht die Batterie? Welche Geräte kannst du betreiben?",
    icon: "battery",
    keywords: ["strom", "batterie", "12v", "230v", "verbrauch", "autark"],
    sites: ["wohnwagenratgeber-de"],
    group: "Gas, Strom & Wasser",
  },
  {
    slug: "frischwasser-rechner",
    title: "Frischwasser-Rechner: Wie lange reicht der Tank?",
    shortTitle: "Frischwasser-Rechner",
    description:
      "Berechne, wie lange dein Frischwassertank reicht. Pro Person, Dusche, Abwasch und mehr.",
    icon: "droplet",
    keywords: ["frischwasser", "tank", "wasser", "verbrauch", "autark"],
    sites: ["wohnwagenratgeber-de"],
    group: "Gas, Strom & Wasser",
  },
  {
    slug: "wertverlust-rechner",
    title: "Wohnwagen-Wertverlust-Rechner",
    shortTitle: "Wertverlust-Rechner",
    description:
      "Wie viel ist dein Wohnwagen noch wert? Geschätzter Wertverlust nach Alter, Marke und Zustand.",
    icon: "arrow-trending-down",
    keywords: ["wertverlust", "restwert", "wertminderung", "verkauf"],
    sites: ["wohnwagenratgeber-de"],
    group: "Kosten & Versicherung",
  },
  {
    slug: "reifendruck-tabelle",
    title: "Reifendruck-Tabelle für Wohnwagen",
    shortTitle: "Reifendruck-Tabelle",
    description:
      "Finde den richtigen Reifendruck für deinen Wohnwagen. Interaktive Tabelle nach Reifengröße, Tragfähigkeit und Beladung.",
    icon: "gauge",
    keywords: ["reifendruck", "reifen", "bar", "tragfähigkeit", "beladung"],
    sites: ["wohnwagenratgeber-de"],
    group: "Gewicht & Gespann",
  },
  {
    slug: "vorzelt-groessen-rechner",
    title: "Vorzelt-Größenrechner: Die richtige Größe finden",
    shortTitle: "Vorzelt-Größenrechner",
    description:
      "Finde die passende Vorzeltgröße anhand deines Umlaufmaßes. Mit DIN-Größentabelle und Tipps zu Voll-, Teilzelten und Sonnendächern.",
    icon: "tent",
    keywords: ["vorzelt", "umlaufmaß", "größe", "zelt", "camping"],
    sites: ["wohnwagenratgeber-de"],
    group: "Kaufberatung & Ausstattung",
  },
  {
    slug: "gasflaschen-winter-rechner",
    title: "Gasflaschen-Reichweite im Winter berechnen",
    shortTitle: "Gas im Winter",
    description:
      "Wie lange reicht dein Gas im Winter? Berechne den Verbrauch bei Kälte — mit Alugas-Vergleich und Temperaturabhängigkeit.",
    icon: "snowflake",
    keywords: ["gas", "winter", "heizung", "kälte", "alugas", "propan"],
    sites: ["wohnwagenratgeber-de"],
    group: "Gas, Strom & Wasser",
  },
  {
    slug: "kuehlschrank-vergleich",
    title: "Kühlschrank-Vergleich: Absorber vs. Kompressor",
    shortTitle: "Kühlschrank-Vergleich",
    description:
      "Absorber oder Kompressor — welcher Kühlschrank passt besser? Vergleiche Verbrauch, Kosten und Kühlleistung bei verschiedenen Temperaturen.",
    icon: "thermometer",
    keywords: ["kühlschrank", "absorber", "kompressor", "kühlung", "vergleich"],
    sites: ["wohnwagenratgeber-de"],
    group: "Kaufberatung & Ausstattung",
  },
  {
    slug: "versicherungs-rechner",
    title: "Wohnwagen-Versicherung: Kosten berechnen",
    shortTitle: "Versicherungs-Rechner",
    description:
      "Schätze die Kosten für Haftpflicht, Teilkasko und Vollkasko deines Wohnwagens. Mit Empfehlung und Leistungsvergleich.",
    icon: "shield-check",
    keywords: ["versicherung", "haftpflicht", "kasko", "kosten", "schutzbrief"],
    sites: ["wohnwagenratgeber-de"],
    group: "Kosten & Versicherung",
  },
  {
    slug: "wohnwagen-finder",
    title: "Wohnwagen-Finder: Welcher Wohnwagen passt zu mir?",
    shortTitle: "Wohnwagen-Finder",
    description:
      "Finde den passenden Wohnwagen-Typ anhand deiner Bedürfnisse. Personen, Budget, Zugfahrzeug und Prioritäten eingeben — sofort eine Empfehlung erhalten.",
    icon: "magnifying-glass",
    keywords: ["finder", "beratung", "kaufberatung", "welcher wohnwagen", "empfehlung", "typ"],
    sites: ["wohnwagenratgeber-de"],
    group: "Kaufberatung & Ausstattung",
  },

  // ─── immobiliensanierung-com ────────────────────────────
  {
    slug: "kfw-foerderrechner",
    title: "KfW-Förderrechner: Zuschüsse und Kredite für Sanierung",
    shortTitle: "KfW-Förderrechner",
    description:
      "Welche KfW-Förderung bekommst du? Berechne Zuschüsse und zinsgünstige Kredite für energetische Sanierung, Heizungstausch und mehr.",
    icon: "gift",
    keywords: ["kfw", "förderung", "zuschuss", "kredit", "beg", "bafa"],
    sites: ["immobiliensanierung-com"],
  },
  {
    slug: "sanierungskosten-rechner",
    title: "Sanierungskosten-Rechner: Kosten pro m²",
    shortTitle: "Sanierungskosten",
    description:
      "Was kostet die Sanierung? Berechne Kosten pro m² für Dach, Fassade, Fenster, Heizung, Bad und mehr.",
    icon: "home",
    keywords: ["sanierung", "kosten", "renovierung", "modernisierung"],
    sites: ["immobiliensanierung-com"],
  },
  {
    slug: "u-wert-rechner",
    title: "U-Wert-Rechner: Dämmung berechnen",
    shortTitle: "U-Wert-Rechner",
    description:
      "Berechne den U-Wert deiner Wand, Decke oder deines Dachs. Finde die richtige Dämmstärke für die Anforderungen des GEG.",
    icon: "layers",
    keywords: ["u-wert", "dämmung", "wärmedurchgang", "geg", "enev"],
    sites: ["immobiliensanierung-com"],
  },
  {
    slug: "amortisationsrechner",
    title: "Amortisationsrechner: Wann lohnt sich die Sanierung?",
    shortTitle: "Amortisationsrechner",
    description:
      "Berechne, nach wie vielen Jahren sich eine energetische Sanierung durch Energieeinsparung refinanziert.",
    icon: "chart-bar",
    keywords: ["amortisation", "rendite", "energieeinsparung", "wirtschaftlichkeit"],
    sites: ["immobiliensanierung-com"],
  },
  {
    slug: "energieeffizienz-check",
    title: "Energieeffizienzklasse-Check: Wie gut ist dein Haus?",
    shortTitle: "Energieeffizienz-Check",
    description:
      "Gib deinen Energieverbrauch ein und erfahre die Effizienzklasse deines Hauses — von A+ bis H. Mit Verbesserungsvorschlägen.",
    icon: "chart-pie",
    keywords: ["energieeffizienz", "energieausweis", "effizienzklasse", "verbrauch"],
    sites: ["immobiliensanierung-com"],
  },
  {
    slug: "heizlast-rechner",
    title: "Heizlast-Rechner: Welche Heizung brauche ich?",
    shortTitle: "Heizlast-Rechner",
    description:
      "Berechne die Heizlast deines Hauses in kW. Finde die richtige Heizungsleistung für Wärmepumpe, Gas oder Pellets.",
    icon: "thermometer",
    keywords: ["heizlast", "heizung", "wärmepumpe", "kw", "leistung"],
    sites: ["immobiliensanierung-com"],
  },
  {
    slug: "handwerkerkosten-rechner",
    title: "Handwerkerkosten-Rechner: Stundensätze nach Gewerk",
    shortTitle: "Handwerkerkosten",
    description:
      "Was kostet ein Handwerker pro Stunde? Typische Stundensätze für Elektriker, Klempner, Maler, Fliesenleger und mehr.",
    icon: "wrench",
    keywords: ["handwerker", "stundensatz", "kosten", "gewerk", "arbeitskosten"],
    sites: ["immobiliensanierung-com"],
  },
  {
    slug: "modernisierungsumlage-rechner",
    title: "Modernisierungsumlage-Rechner für Vermieter",
    shortTitle: "Modernisierungsumlage",
    description:
      "Berechne, wie viel der Sanierungskosten du als Vermieter auf die Miete umlegen darfst. Mit Kappungsgrenze und Härtefallprüfung.",
    icon: "document-text",
    keywords: ["modernisierungsumlage", "mieterhöhung", "vermieter", "umlage"],
    sites: ["immobiliensanierung-com"],
  },

  // ─── fahrschulbewertung-de ──────────────────────────────
  {
    slug: "fuehrerscheinkosten-rechner",
    title: "Führerschein-Kosten-Rechner: Was kostet der Führerschein?",
    shortTitle: "Führerscheinkosten",
    description:
      "Berechne die Gesamtkosten für deinen Führerschein. Fahrstunden, Prüfungsgebühren, Sehtest und mehr — nach Bundesland und Klasse.",
    icon: "currency-euro",
    keywords: ["führerschein", "kosten", "fahrstunden", "prüfung", "fahrschule"],
    sites: ["fahrschulbewertung-de"],
  },
  {
    slug: "bussgeld-rechner",
    title: "Bußgeld-Rechner: Strafen im Straßenverkehr",
    shortTitle: "Bußgeld-Rechner",
    description:
      "Geschwindigkeit, Rotlicht, Abstand — berechne Bußgeld, Punkte und Fahrverbot nach aktuellem Bußgeldkatalog 2025.",
    icon: "shield-exclamation",
    keywords: ["bußgeld", "blitzer", "punkte", "fahrverbot", "geschwindigkeit"],
    sites: ["fahrschulbewertung-de"],
  },
  {
    slug: "probezeit-rechner",
    title: "Probezeit-Rechner: Führerschein auf Probe",
    shortTitle: "Probezeit-Rechner",
    description:
      "Wann endet deine Probezeit? Was passiert bei einem Verstoß? Berechne Verlängerung und Konsequenzen.",
    icon: "clock",
    keywords: ["probezeit", "fahranfänger", "aufbauseminar", "verlängerung"],
    sites: ["fahrschulbewertung-de"],
  },
  {
    slug: "theoriepruefung-quiz",
    title: "Theorieprüfung-Quiz: Teste dein Wissen",
    shortTitle: "Theorie-Quiz",
    description:
      "Bist du fit für die Theorieprüfung? 20 zufällige Fragen aus allen Themenbereichen — mit Erklärungen.",
    icon: "academic-cap",
    keywords: ["theorie", "prüfung", "quiz", "fragen", "lernen"],
    sites: ["fahrschulbewertung-de"],
  },
  {
    slug: "checkliste-fuehrerschein",
    title: "Checkliste: Alles für den Führerscheinantrag",
    shortTitle: "Checkliste Führerschein",
    description:
      "Sehtest, Erste-Hilfe-Kurs, Passbilder, Anmeldeformular — interaktive Checkliste für deinen Führerscheinantrag.",
    icon: "clipboard-check",
    keywords: ["führerschein", "antrag", "checkliste", "sehtest", "erste-hilfe"],
    sites: ["fahrschulbewertung-de"],
  },

  // ─── wohnunggesucht-com ─────────────────────────────────
  {
    slug: "mieterhoehungs-rechner",
    title: "Mieterhöhungs-Rechner: Ist die Erhöhung rechtmäßig?",
    shortTitle: "Mieterhöhungs-Rechner",
    description:
      "Prüfe, ob eine Mieterhöhung zulässig ist. Mit Kappungsgrenze, Vergleichsmiete und Mietpreisbremse.",
    icon: "arrow-trending-up",
    keywords: ["mieterhöhung", "kappungsgrenze", "mietpreisbremse", "vergleichsmiete"],
    sites: ["wohnunggesucht-com"],
  },
  {
    slug: "nebenkosten-rechner",
    title: "Nebenkosten-Rechner: Was ist normal pro m²?",
    shortTitle: "Nebenkosten-Rechner",
    description:
      "Berechne typische Nebenkosten pro m² und prüfe deine Nebenkostenabrechnung auf Plausibilität.",
    icon: "receipt",
    keywords: ["nebenkosten", "betriebskosten", "abrechnung", "nachzahlung"],
    sites: ["wohnunggesucht-com"],
  },
  {
    slug: "kautions-rechner",
    title: "Kautions-Rechner: Höhe, Zinsen und Rückzahlung",
    shortTitle: "Kautions-Rechner",
    description:
      "Berechne die maximale Kautionshöhe, angesparte Zinsen und deinen Rückzahlungsanspruch nach Auszug.",
    icon: "lock-closed",
    keywords: ["kaution", "mietkaution", "zinsen", "rückzahlung", "sicherheit"],
    sites: ["wohnunggesucht-com"],
  },
  {
    slug: "kuendigungsfrist-rechner",
    title: "Kündigungsfrist-Rechner für Mietverträge",
    shortTitle: "Kündigungsfrist-Rechner",
    description:
      "Berechne die gesetzliche Kündigungsfrist für deinen Mietvertrag — als Mieter und Vermieter. Mit Sonderkündigungsrecht.",
    icon: "calendar-days",
    keywords: ["kündigung", "kündigungsfrist", "mietvertrag", "frist"],
    sites: ["wohnunggesucht-com"],
  },
  {
    slug: "umzugskosten-rechner",
    title: "Umzugskosten-Rechner: Was kostet mein Umzug?",
    shortTitle: "Umzugskosten-Rechner",
    description:
      "Berechne die geschätzten Kosten für deinen Umzug. Wohnungsgröße, Entfernung, Umzugsunternehmen oder Eigenregie.",
    icon: "archive-box",
    keywords: ["umzug", "kosten", "umzugsunternehmen", "transport"],
    sites: ["wohnunggesucht-com"],
  },
  {
    slug: "wohnflaeche-rechner",
    title: "Wohnfläche-Rechner nach Wohnflächenverordnung",
    shortTitle: "Wohnfläche-Rechner",
    description:
      "Berechne die korrekte Wohnfläche nach WoFlV. Mit Dachschrägen, Balkonen und Terrassen — so prüfst du die Angaben im Mietvertrag.",
    icon: "squares",
    keywords: ["wohnfläche", "dachschräge", "balkon", "wohnflächenverordnung"],
    sites: ["wohnunggesucht-com"],
  },
  {
    slug: "mietminderung-rechner",
    title: "Mietminderungs-Rechner: Wie viel darfst du mindern?",
    shortTitle: "Mietminderungs-Rechner",
    description:
      "Wähle den Mangel in deiner Wohnung und erfahre die typische Mietminderungsquote — mit Urteilen und Hinweisen.",
    icon: "minus-circle",
    keywords: ["mietminderung", "mangel", "schimmel", "lärm", "heizung"],
    sites: ["wohnunggesucht-com"],
  },
  {
    slug: "checkliste-wohnungsbesichtigung",
    title: "Checkliste für die Wohnungsbesichtigung",
    shortTitle: "Checkliste Besichtigung",
    description:
      "Nichts übersehen bei der Besichtigung: Zustand, Mängel, Fragen an den Vermieter. Interaktive Checkliste zum Abhaken.",
    icon: "eye",
    keywords: ["besichtigung", "wohnungssuche", "checkliste", "mängel"],
    sites: ["wohnunggesucht-com"],
  },

  // ─── wochenendbeziehungen-de ────────────────────────────
  {
    slug: "fernbeziehung-kosten-rechner",
    title: "Fernbeziehungs-Kosten-Rechner: Was kostet die Liebe?",
    shortTitle: "Fernbeziehungs-Kosten",
    description:
      "Berechne die jährlichen Kosten deiner Fernbeziehung: Fahrten, Bahntickets, Flüge, Sprit und mehr.",
    icon: "paper-airplane",
    keywords: ["fernbeziehung", "kosten", "reisekosten", "bahn", "flug"],
    sites: ["wochenendbeziehungen-de"],
  },
  {
    slug: "besuchs-countdown",
    title: "Besuchs-Countdown: Tage bis zum nächsten Treffen",
    shortTitle: "Besuchs-Countdown",
    description:
      "Wie viele Tage noch bis zum nächsten Besuch? Countdown eingeben, teilen und gemeinsam die Tage zählen.",
    icon: "heart",
    keywords: ["countdown", "besuch", "treffen", "fernbeziehung", "wiedersehen"],
    sites: ["wochenendbeziehungen-de"],
  },
  {
    slug: "date-ideen-generator",
    title: "Date-Ideen-Generator: Inspiration für Paare",
    shortTitle: "Date-Ideen-Generator",
    description:
      "Keine Idee fürs nächste Date? Zufällige Vorschläge für Zuhause, Draußen, Fernbeziehung und mehr.",
    icon: "sparkles",
    keywords: ["date", "ideen", "paar", "aktivitäten", "romantik"],
    sites: ["wochenendbeziehungen-de"],
  },
];

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getToolsForSite(siteSlug: string): ToolDefinition[] {
  return tools.filter((t) => t.sites.includes(siteSlug));
}

export function getAllToolSlugs(): string[] {
  return tools.map((t) => t.slug);
}

export function getSiteToolSlugs(siteSlug: string): string[] {
  return getToolsForSite(siteSlug).map((t) => t.slug);
}

/** Group order for sites with many tools. Groups not listed here appear at the end. */
const groupOrder: Record<string, string[]> = {
  "wohnwagenratgeber-de": [
    "Kaufberatung & Ausstattung",
    "Gewicht & Gespann",
    "Kosten & Versicherung",
    "Gas, Strom & Wasser",
    "Reise & Unterwegs",
    "Checklisten",
  ],
};

export type ToolGroup = { name: string; tools: ToolDefinition[] };

/** Returns tools grouped by `group` field. If no tools have groups, returns a single group with all tools. */
export function getGroupedToolsForSite(siteSlug: string): ToolGroup[] {
  const siteTools = getToolsForSite(siteSlug);
  const hasGroups = siteTools.some((t) => t.group);
  if (!hasGroups) return [{ name: "", tools: siteTools }];

  const order = groupOrder[siteSlug] || [];
  const grouped = new Map<string, ToolDefinition[]>();

  for (const tool of siteTools) {
    const g = tool.group || "Sonstige";
    if (!grouped.has(g)) grouped.set(g, []);
    grouped.get(g)!.push(tool);
  }

  const result: ToolGroup[] = [];
  for (const name of order) {
    if (grouped.has(name)) {
      result.push({ name, tools: grouped.get(name)! });
      grouped.delete(name);
    }
  }
  // Append remaining groups not in order
  for (const [name, tools] of grouped) {
    result.push({ name, tools });
  }
  return result;
}
