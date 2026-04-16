"use client";

import { useState } from "react";

type Kategorie = "zuhause" | "draussen" | "fernbeziehung" | "abenteuer" | "zufall";

interface DateIdee {
  titel: string;
  beschreibung: string;
  kategorie: Kategorie;
}

const ideen: DateIdee[] = [
  // Zuhause (20+)
  { kategorie: "zuhause", titel: "Filmabend mit Popcorn", beschreibung: "Wählt abwechselnd eure Lieblingsfilme aus, macht frisches Popcorn und kuschelt euch aufs Sofa. Bonus: Baut euch eine Kissenburg!" },
  { kategorie: "zuhause", titel: "Zusammen kochen", beschreibung: "Sucht euch ein Rezept aus, das ihr noch nie probiert habt, und kocht es gemeinsam. Vielleicht ein Thai-Curry oder selbstgemachte Pasta?" },
  { kategorie: "zuhause", titel: "Brettspielabend", beschreibung: "Holt die Brettspiele raus! Von Klassikern wie Monopoly bis zu modernen Spielen wie Codenames — der Verlierer macht den Abwasch." },
  { kategorie: "zuhause", titel: "Wellness-Abend", beschreibung: "Gesichtsmasken, Badebomben, Kerzen an — macht euch einen Spa-Abend zu Hause. Verwöhnt euch gegenseitig mit einer Massage." },
  { kategorie: "zuhause", titel: "Fotobuch erstellen", beschreibung: "Geht gemeinsam eure Fotos durch und erstellt ein Fotobuch eurer schönsten Erinnerungen. Eine wunderbare Reise durch eure Geschichte." },
  { kategorie: "zuhause", titel: "Cocktails mixen", beschreibung: "Werdet zu Hobby-Barkeepern! Probiert verschiedene Cocktail-Rezepte aus und kürt euren Favoriten. Auch alkoholfrei machbar." },
  { kategorie: "zuhause", titel: "Quiz-Abend", beschreibung: "Erstellt gegenseitig Quizfragen übereinander oder spielt ein Online-Trivia-Spiel. Wer kennt den anderen besser?" },
  { kategorie: "zuhause", titel: "Balkon- oder Wohnzimmer-Picknick", beschreibung: "Breitet eine Decke aus, packt Leckereien ein und genießt ein Picknick in den eigenen vier Wänden — mit Kerzen und Musik." },
  { kategorie: "zuhause", titel: "Gemeinsam backen", beschreibung: "Backt zusammen einen Kuchen, Brownies oder Plätzchen. Beim Teig naschen ist ausdrücklich erlaubt!" },
  { kategorie: "zuhause", titel: "Karaoke-Abend", beschreibung: "YouTube-Karaoke an und los geht's! Singt eure Lieblingssongs — es geht nicht um Perfektion, sondern um Spaß." },
  { kategorie: "zuhause", titel: "Puzzle-Abend", beschreibung: "Legt zusammen ein großes Puzzle. Entspannend und ihr könnt dabei quatschen oder Musik hören." },
  { kategorie: "zuhause", titel: "Traumreise planen", beschreibung: "Plant gemeinsam euren Traumurlaub — auch wenn er erst in der Zukunft liegt. Recherchiert Ziele, Hotels und Aktivitäten." },
  { kategorie: "zuhause", titel: "Selbstgemachte Pizza", beschreibung: "Macht euren eigenen Pizzateig und belegt jeder seine Pizza nach Wunsch. Mini-Pizzen sind auch eine tolle Idee!" },
  { kategorie: "zuhause", titel: "Serien-Marathon", beschreibung: "Startet eine neue Serie zusammen und schaut mehrere Folgen am Stück. Snacks nicht vergessen!" },
  { kategorie: "zuhause", titel: "Briefe schreiben", beschreibung: "Schreibt euch gegenseitig einen Liebesbrief oder eine Liste mit Dingen, die ihr am anderen liebt. Öffnet sie gleichzeitig." },
  { kategorie: "zuhause", titel: "Malen oder Zeichnen", beschreibung: "Malt euch gegenseitig oder ein gemeinsames Bild. Kein Talent nötig — es zählt der Spaß!" },
  { kategorie: "zuhause", titel: "Yoga oder Workout", beschreibung: "Macht zusammen eine Yoga-Session oder ein Home-Workout. Motiviert euch gegenseitig!" },
  { kategorie: "zuhause", titel: "Fondue oder Raclette", beschreibung: "Gemütliches Käsefondue oder Raclette — ideal für lange Abende mit viel Reden und Genießen." },
  { kategorie: "zuhause", titel: "Gemeinsames Hörbuch", beschreibung: "Hört zusammen ein Hörbuch oder einen Podcast und diskutiert danach darüber." },
  { kategorie: "zuhause", titel: "DIY-Projekt", beschreibung: "Bastelt etwas zusammen: Ein Regal bauen, Kerzen gießen, T-Shirts bedrucken — werdet kreativ!" },
  { kategorie: "zuhause", titel: "Frühstück im Bett", beschreibung: "Überrascht euch gegenseitig mit einem liebevoll zubereiteten Frühstück im Bett. Am besten am Sonntagmorgen." },

  // Draußen (20+)
  { kategorie: "draussen", titel: "Picknick im Park", beschreibung: "Packt einen Korb mit Leckereien und sucht euch ein schönes Plätzchen im Park. Decke, Snacks und gute Laune — mehr braucht ihr nicht." },
  { kategorie: "draussen", titel: "Fahrradtour", beschreibung: "Erkundet gemeinsam die Umgebung mit dem Fahrrad. Plant eine Route mit einem netten Café als Zwischenstopp." },
  { kategorie: "draussen", titel: "Sterne gucken", beschreibung: "Fahrt raus aus der Stadt, nehmt eine Decke mit und beobachtet den Sternenhimmel. Eine Sternenkarten-App hilft beim Identifizieren." },
  { kategorie: "draussen", titel: "Geocaching", beschreibung: "Werdet zu Schatzsuchern! Mit der Geocaching-App findet ihr versteckte Caches in eurer Umgebung. Ein Abenteuer an der frischen Luft." },
  { kategorie: "draussen", titel: "Bootsfahrt", beschreibung: "Mietet ein Tretboot, Ruderboot oder Kanu und genießt eine entspannte Zeit auf dem Wasser." },
  { kategorie: "draussen", titel: "Flohmarkt besuchen", beschreibung: "Stöbert gemeinsam auf einem Flohmarkt nach Schätzen. Setzt euch ein Budget und kauft dem anderen eine Überraschung." },
  { kategorie: "draussen", titel: "Stadtführung", beschreibung: "Entdeckt eure eigene Stadt neu! Bucht eine Führung oder nutzt eine Audio-Guide-App für einen anderen Blickwinkel." },
  { kategorie: "draussen", titel: "Sonnenaufgang anschauen", beschreibung: "Steht früh auf und beobachtet gemeinsam den Sonnenaufgang — an einem besonderen Ort. Thermobecher mit Kaffee nicht vergessen!" },
  { kategorie: "draussen", titel: "Minigolf spielen", beschreibung: "Klassiker-Date! Minigolf ist lustig, unkompliziert und der perfekte Rahmen zum Quatschen und Lachen." },
  { kategorie: "draussen", titel: "Wanderung", beschreibung: "Sucht euch eine schöne Wanderroute aus und genießt die Natur gemeinsam. Packt ein Picknick für unterwegs ein." },
  { kategorie: "draussen", titel: "Open-Air-Kino", beschreibung: "Besucht ein Freiluft-Kino in eurer Nähe — Filmgenuss unter dem Sternenhimmel." },
  { kategorie: "draussen", titel: "Strandtag", beschreibung: "Ob Meer, See oder Flussstrand — packt Handtücher, Sonnencreme und ein gutes Buch ein und genießt den Tag am Wasser." },
  { kategorie: "draussen", titel: "Botanischer Garten", beschreibung: "Spaziert durch einen Botanischen Garten und entdeckt exotische Pflanzen. Wunderschön und entspannend." },
  { kategorie: "draussen", titel: "Wochenmarkt besuchen", beschreibung: "Schlendert über den Wochenmarkt, probiert verschiedene Leckereien und kauft frische Zutaten zum gemeinsamen Kochen." },
  { kategorie: "draussen", titel: "Fotospaziergang", beschreibung: "Macht einen Spaziergang und fotografiert alles, was euch auffällt. Am Ende vergleicht ihr eure besten Bilder." },
  { kategorie: "draussen", titel: "Outdoor-Sport", beschreibung: "Spielt Frisbee, Badminton oder Tischtennis im Park. Bewegung und Spaß an der frischen Luft." },
  { kategorie: "draussen", titel: "Zoo oder Tierpark", beschreibung: "Besucht den Zoo und entdeckt gemeinsam die Tierwelt. Welches Tier ist euer gemeinsamer Favorit?" },
  { kategorie: "draussen", titel: "Straßenfest besuchen", beschreibung: "Erkundigt euch nach Straßenfesten, Stadtteilfesten oder Märkten in eurer Umgebung und lasst euch treiben." },
  { kategorie: "draussen", titel: "Museum besuchen", beschreibung: "Wählt ein Museum, das euch beide interessiert — Kunst, Technik, Geschichte oder Natur. Viele haben auch Abendveranstaltungen." },
  { kategorie: "draussen", titel: "Eislaufen oder Rollschuhfahren", beschreibung: "Je nach Jahreszeit: Ab aufs Eis oder auf Rollschuhe! Auch für Anfänger lustig — gerade wenn man sich gegenseitig festhalten muss." },

  // Fernbeziehung (15+)
  { kategorie: "fernbeziehung", titel: "Online-Filmabend", beschreibung: "Nutzt Teleparty oder schaut gleichzeitig denselben Film — mit Videocall nebenbei für die gemeinsamen Reaktionen." },
  { kategorie: "fernbeziehung", titel: "Virtuelles Dinner", beschreibung: "Kocht das gleiche Rezept in euren jeweiligen Küchen und esst dann zusammen per Videocall. Romantik trotz Distanz!" },
  { kategorie: "fernbeziehung", titel: "Brief schreiben", beschreibung: "Schreibt euch einen echten, handgeschriebenen Brief und schickt ihn per Post. Die Vorfreude beim Warten ist unbezahlbar." },
  { kategorie: "fernbeziehung", titel: "Online-Spieleabend", beschreibung: "Spielt zusammen Online-Spiele: Skribbl.io, Among Us, oder kooperative Spiele auf Steam. Spaß ist garantiert!" },
  { kategorie: "fernbeziehung", titel: "Countdown-Kalender basteln", beschreibung: "Bastelt einen Countdown-Kalender bis zum nächsten Treffen. Jeden Tag eine kleine Notiz, ein Foto oder eine Aufgabe." },
  { kategorie: "fernbeziehung", titel: "Gemeinsam Podcast hören", beschreibung: "Wählt einen Podcast aus und hört die gleiche Folge. Anschließend diskutiert ihr per Telefon darüber." },
  { kategorie: "fernbeziehung", titel: "Buchclub zu zweit", beschreibung: "Lest das gleiche Buch und besprecht regelmäßig, wo ihr gerade seid. Wie ein privater Buchclub!" },
  { kategorie: "fernbeziehung", titel: "Virtuelle Museumsführung", beschreibung: "Viele Museen bieten Online-Rundgänge an. Erkundet gemeinsam virtuell das Louvre, die NASA oder das British Museum." },
  { kategorie: "fernbeziehung", titel: "Care-Paket verschicken", beschreibung: "Überrascht euren Partner mit einem liebevoll gepackten Paket: Fotos, Snacks, ein getragenes T-Shirt, Liebesbriefe." },
  { kategorie: "fernbeziehung", titel: "Playlist erstellen", beschreibung: "Erstellt euch gegenseitig Spotify-Playlists mit Songs, die euch aneinander erinnern oder die ihr beide liebt." },
  { kategorie: "fernbeziehung", titel: "Online-Kochduell", beschreibung: "Bekommt die gleichen Zutaten und kocht gleichzeitig — aber jeder ein anderes Gericht. Am Ende zeigt ihr euer Ergebnis." },
  { kategorie: "fernbeziehung", titel: "21 Fragen", beschreibung: "Stellt euch abwechselnd tiefgründige oder lustige Fragen. Ihr werdet überrascht sein, was ihr noch nicht voneinander wisst!" },
  { kategorie: "fernbeziehung", titel: "Zusammen einschlafen", beschreibung: "Lasst den Videocall beim Einschlafen laufen. Das Gefühl, nicht allein zu sein, kann den Abstand kleiner machen." },
  { kategorie: "fernbeziehung", titel: "Fotochallenge", beschreibung: "Gebt euch täglich ein Fotothema (z. B. 'etwas Rotes', 'mein Mittagessen') und teilt die Bilder miteinander." },
  { kategorie: "fernbeziehung", titel: "Zukunft planen", beschreibung: "Plant gemeinsam eure nächsten Schritte: Den nächsten Besuch, den Urlaub oder den Zusammenzug. Gibt Hoffnung und Vorfreude!" },
  { kategorie: "fernbeziehung", titel: "Überraschungs-Lieferung", beschreibung: "Bestellt dem Partner Essen, Blumen oder ein kleines Geschenk überraschend nach Hause. Lieferdienste machen es einfach!" },

  // Abenteuer (15+)
  { kategorie: "abenteuer", titel: "Escape Room", beschreibung: "Löst gemeinsam Rätsel und entkommt aus dem Escape Room. Testet eure Teamfähigkeit und habt dabei jede Menge Spaß!" },
  { kategorie: "abenteuer", titel: "Kletterhalle", beschreibung: "Probiert Bouldern oder Klettern aus. Ihr sichert euch gegenseitig und überwindet gemeinsam Höhen — im wörtlichen Sinne." },
  { kategorie: "abenteuer", titel: "Kochkurs", beschreibung: "Lernt gemeinsam in einem Kochkurs neue Rezepte und Techniken. Von Sushi bis Thai — es gibt für jeden Geschmack etwas." },
  { kategorie: "abenteuer", titel: "Weinprobe", beschreibung: "Besucht ein Weingut oder eine Weinbar und probiert verschiedene Weine. Entdeckt gemeinsam eure Favoriten." },
  { kategorie: "abenteuer", titel: "Nachtwanderung", beschreibung: "Erkundet die Natur bei Nacht! Mit Taschenlampen und warmer Kleidung wird eine Nachtwanderung zum besonderen Erlebnis." },
  { kategorie: "abenteuer", titel: "Fallschirmspringen", beschreibung: "Der ultimative Adrenalinkick! Ein Tandemsprung ist auch ohne Erfahrung möglich und ein unvergessliches Erlebnis zu zweit." },
  { kategorie: "abenteuer", titel: "Heißluftballonfahrt", beschreibung: "Schwebt zusammen über die Landschaft — romantisch und atemberaubend. Am besten zum Sonnenaufgang!" },
  { kategorie: "abenteuer", titel: "Kanu- oder Kajakfahrt", beschreibung: "Paddelt zusammen über einen See oder Fluss. Teamwork ist gefragt und die Natur vom Wasser aus zu sehen ist wunderschön." },
  { kategorie: "abenteuer", titel: "Tanz-Workshop", beschreibung: "Lernt gemeinsam einen neuen Tanzstil: Salsa, Tango oder Swing. Tanzen verbindet und macht gute Laune!" },
  { kategorie: "abenteuer", titel: "Freizeitpark", beschreibung: "Achterbahnen, Zuckerwatte und gemeinsame Adrenalin-Momente. Im Freizeitpark werdet ihr wieder zum Kind." },
  { kategorie: "abenteuer", titel: "Spontaner Roadtrip", beschreibung: "Steigt ins Auto und fahrt einfach los — ohne festes Ziel. Haltet an, wo es euch gefällt. Das Abenteuer ist der Weg." },
  { kategorie: "abenteuer", titel: "Camping-Nacht", beschreibung: "Übernachtet in der Natur — im Zelt oder unter freiem Himmel. Lagerfeuer, Sterne und Zweisamkeit." },
  { kategorie: "abenteuer", titel: "Töpferkurs", beschreibung: "Werdet kreativ an der Töpferscheibe. Jeder gestaltet etwas für den anderen — die Ergebnisse sind oft überraschend!" },
  { kategorie: "abenteuer", titel: "Stand-Up-Paddling", beschreibung: "Probiert SUP auf einem See oder Fluss aus. Gute Balance, Spaß auf dem Wasser und garantiert ein paar Lacher." },
  { kategorie: "abenteuer", titel: "Hochseilgarten", beschreibung: "Überwindet gemeinsam Hindernisse in luftiger Höhe. Perfekt, um euch gegenseitig zu ermutigen und anzufeuern." },
  { kategorie: "abenteuer", titel: "Trampolin-Halle", beschreibung: "Springt euch aus und probiert Tricks aus. Trampolinparks bieten auch Dodgeball und Ninja-Parcours." },
];

const kategorieLabels: Record<Kategorie, { label: string; farbe: string }> = {
  zuhause: { label: "Zuhause", farbe: "bg-blue-100 text-blue-800" },
  draussen: { label: "Draußen", farbe: "bg-green-100 text-green-800" },
  fernbeziehung: { label: "Fernbeziehung", farbe: "bg-purple-100 text-purple-800" },
  abenteuer: { label: "Abenteuer", farbe: "bg-orange-100 text-orange-800" },
  zufall: { label: "Überraschung", farbe: "bg-pink-100 text-pink-800" },
};

function zufallsIdee(kategorie: Kategorie, vorherige?: DateIdee): DateIdee {
  let pool: DateIdee[];
  if (kategorie === "zufall") {
    pool = ideen;
  } else {
    pool = ideen.filter((i) => i.kategorie === kategorie);
  }

  // Avoid repeating the same idea
  if (vorherige && pool.length > 1) {
    pool = pool.filter((i) => i.titel !== vorherige.titel);
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

export function DateIdeenGenerator() {
  const [kategorie, setKategorie] = useState<Kategorie>("zufall");
  const [aktuelleIdee, setAktuelleIdee] = useState<DateIdee | null>(null);

  function neueIdee() {
    setAktuelleIdee(zufallsIdee(kategorie, aktuelleIdee ?? undefined));
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kategorie wählen
          </label>
          <select
            value={kategorie}
            onChange={(e) => {
              setKategorie(e.target.value as Kategorie);
              setAktuelleIdee(null);
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          >
            <option value="zufall">Überrasch mich! (alle Kategorien)</option>
            <option value="zuhause">Zuhause</option>
            <option value="draussen">Draußen</option>
            <option value="fernbeziehung">Fernbeziehung</option>
            <option value="abenteuer">Abenteuer</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={neueIdee}
            className="w-full rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700 transition"
          >
            {aktuelleIdee ? "Nächste Idee" : "Date-Idee generieren"}
          </button>
        </div>
      </div>

      {aktuelleIdee && (
        <div className="rounded-lg border-2 border-primary-600 bg-primary-50 p-6">
          <div className="mb-3">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              kategorieLabels[aktuelleIdee.kategorie].farbe
            }`}>
              {kategorieLabels[aktuelleIdee.kategorie].label}
            </span>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {aktuelleIdee.titel}
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {aktuelleIdee.beschreibung}
            </p>
          </div>

          <div className="mt-4 flex justify-center">
            <button
              onClick={neueIdee}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2 text-sm font-medium text-primary-700 border border-primary-300 hover:bg-primary-100 transition"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Andere Idee
            </button>
          </div>
        </div>
      )}

      {!aktuelleIdee && (
        <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
          <p className="font-medium text-gray-700 mb-2">Über {ideen.length} Date-Ideen in 4 Kategorien:</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(["zuhause", "draussen", "fernbeziehung", "abenteuer"] as const).map((k) => (
              <div key={k} className="text-center">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${kategorieLabels[k].farbe}`}>
                  {kategorieLabels[k].label}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  {ideen.filter((i) => i.kategorie === k).length} Ideen
                </p>
              </div>
            ))}
          </div>
          <p className="mt-3">
            Wähle eine Kategorie oder lass dich überraschen und klicke auf den Button!
          </p>
        </div>
      )}
    </div>
  );
}
