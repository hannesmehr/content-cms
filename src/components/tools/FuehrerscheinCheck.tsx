"use client";

import { useState } from "react";

type Klasse = "B" | "B96" | "BE" | "alt-vor-1980" | "alt-nach-1980";

interface CheckResult {
  erlaubt: boolean;
  grund: string;
  maxKombination?: number;
  details: string;
}

function pruefeFuehrerschein(
  klasse: Klasse,
  zugfahrzeug: number,
  wohnwagen: number
): CheckResult {
  const kombination = zugfahrzeug + wohnwagen;

  switch (klasse) {
    case "B":
      if (kombination <= 3500) {
        return {
          erlaubt: true,
          grund: `Die Kombination wiegt ${kombination} kg und liegt damit unter dem Limit von 3.500 kg.`,
          maxKombination: 3500,
          details:
            "Mit dem Führerschein Klasse B darf das zulässige Gesamtgewicht der Kombination aus Zugfahrzeug und Anhänger maximal 3.500 kg betragen.",
        };
      }
      return {
        erlaubt: false,
        grund: `Die Kombination wiegt ${kombination} kg und überschreitet das Limit von 3.500 kg um ${kombination - 3500} kg.`,
        maxKombination: 3500,
        details:
          "Mit dem Führerschein Klasse B darf das zulässige Gesamtgewicht der Kombination aus Zugfahrzeug und Anhänger maximal 3.500 kg betragen. Du benötigst mindestens B96 oder BE.",
      };

    case "B96":
      if (kombination <= 4250) {
        return {
          erlaubt: true,
          grund: `Die Kombination wiegt ${kombination} kg und liegt damit unter dem Limit von 4.250 kg.`,
          maxKombination: 4250,
          details:
            "Mit der Schlüsselzahl B96 darf das zulässige Gesamtgewicht der Kombination maximal 4.250 kg betragen. Der Anhänger darf dabei über 750 kg wiegen.",
        };
      }
      return {
        erlaubt: false,
        grund: `Die Kombination wiegt ${kombination} kg und überschreitet das Limit von 4.250 kg um ${kombination - 4250} kg.`,
        maxKombination: 4250,
        details:
          "Mit B96 ist bei 4.250 kg Kombinationsgewicht Schluss. Du benötigst den Führerschein Klasse BE.",
      };

    case "BE":
      if (zugfahrzeug <= 3500 && wohnwagen <= 3500) {
        return {
          erlaubt: true,
          grund: `Zugfahrzeug (${zugfahrzeug} kg) und Wohnwagen (${wohnwagen} kg) liegen jeweils unter 3.500 kg.`,
          details:
            "Mit dem Führerschein Klasse BE dürfen sowohl das Zugfahrzeug als auch der Anhänger jeweils maximal 3.500 kg zulässiges Gesamtgewicht haben.",
        };
      }
      if (zugfahrzeug > 3500) {
        return {
          erlaubt: false,
          grund: `Das Zugfahrzeug wiegt ${zugfahrzeug} kg und überschreitet das Limit von 3.500 kg.`,
          details:
            "Auch mit Klasse BE darf das Zugfahrzeug maximal 3.500 kg wiegen. Für schwerere Zugfahrzeuge benötigst du mindestens die Klasse C1E.",
        };
      }
      return {
        erlaubt: false,
        grund: `Der Wohnwagen wiegt ${wohnwagen} kg und überschreitet das Limit von 3.500 kg.`,
        details:
          "Mit Klasse BE darf der Anhänger maximal 3.500 kg wiegen. Für schwerere Anhänger benötigst du mindestens die Klasse C1E.",
      };

    case "alt-vor-1980":
      if (kombination <= 18500) {
        return {
          erlaubt: true,
          grund: `Die Kombination wiegt ${kombination} kg und liegt weit unter dem Limit von 18.500 kg. Praktisch jede Wohnwagen-Kombination ist erlaubt.`,
          maxKombination: 18500,
          details:
            "Die alte Klasse 3 (erteilt vor dem 01.04.1980) berechtigt zum Führen von Zügen bis 18.500 kg Gesamtgewicht. Das deckt praktisch jeden Wohnwagen ab.",
        };
      }
      return {
        erlaubt: false,
        grund: `Die Kombination wiegt ${kombination} kg und überschreitet das Limit von 18.500 kg.`,
        maxKombination: 18500,
        details:
          "Auch die großzügige alte Klasse 3 hat bei 18.500 kg ihre Grenze. Eine solche Kombination ist mit Wohnwagen allerdings extrem unwahrscheinlich.",
      };

    case "alt-nach-1980":
      if (kombination <= 12000) {
        return {
          erlaubt: true,
          grund: `Die Kombination wiegt ${kombination} kg und liegt unter dem Limit von 12.000 kg.`,
          maxKombination: 12000,
          details:
            "Die alte Klasse 3 (erteilt ab 01.04.1980) berechtigt zum Führen von Zügen bis 12.000 kg, wobei der Anhänger maximal 3 Achsen haben darf. Das reicht für nahezu alle Wohnwagen.",
        };
      }
      return {
        erlaubt: false,
        grund: `Die Kombination wiegt ${kombination} kg und überschreitet das Limit von 12.000 kg.`,
        maxKombination: 12000,
        details:
          "Die alte Klasse 3 (ab 01.04.1980) erlaubt Züge bis 12.000 kg mit maximal 3-achsigem Anhänger. Deine Kombination ist zu schwer.",
      };
  }
}

export function FuehrerscheinCheck() {
  const [klasse, setKlasse] = useState<Klasse>("B");
  const [zugfahrzeug, setZugfahrzeug] = useState<string>("");
  const [wohnwagen, setWohnwagen] = useState<string>("");

  const zugNum = parseFloat(zugfahrzeug) || 0;
  const wwNum = parseFloat(wohnwagen) || 0;
  const hasInput = zugfahrzeug !== "" && wohnwagen !== "";

  const result = hasInput ? pruefeFuehrerschein(klasse, zugNum, wwNum) : null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-3">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Führerscheinklasse
          </label>
          <select
            value={klasse}
            onChange={(e) => setKlasse(e.target.value as Klasse)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          >
            <option value="B">Klasse B</option>
            <option value="B96">Klasse B mit Schlüsselzahl 96 (B96)</option>
            <option value="BE">Klasse BE</option>
            <option value="alt-vor-1980">
              Alte Klasse 3 (erteilt vor 01.04.1980)
            </option>
            <option value="alt-nach-1980">
              Alte Klasse 3 (erteilt ab 01.04.1980)
            </option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Zul. Gesamtgewicht Zugfahrzeug (kg)
          </label>
          <input
            type="number"
            value={zugfahrzeug}
            onChange={(e) => setZugfahrzeug(e.target.value)}
            placeholder="z.B. 2100"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Zul. Gesamtgewicht Wohnwagen (kg)
          </label>
          <input
            type="number"
            value={wohnwagen}
            onChange={(e) => setWohnwagen(e.target.value)}
            placeholder="z.B. 1300"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>

        {hasInput && (
          <div className="flex items-end">
            <div className="w-full rounded-lg bg-gray-100 px-3 py-2 text-center text-sm text-gray-600">
              Kombination: <span className="font-bold">{zugNum + wwNum} kg</span>
            </div>
          </div>
        )}
      </div>

      {result && (
        <div
          className={`rounded-lg border-2 p-6 ${
            result.erlaubt
              ? "border-green-500 bg-green-50"
              : "border-red-500 bg-red-50"
          }`}
        >
          <div className="mb-4 flex items-center gap-3">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-white ${
                result.erlaubt ? "bg-green-600" : "bg-red-600"
              }`}
            >
              {result.erlaubt ? "\u2713" : "\u2717"}
            </span>
            <h3
              className={`text-xl font-bold ${
                result.erlaubt ? "text-green-800" : "text-red-800"
              }`}
            >
              {result.erlaubt
                ? "Ja, diese Kombination ist erlaubt!"
                : "Nein, diese Kombination ist nicht erlaubt!"}
            </h3>
          </div>

          <p
            className={`mb-3 text-sm ${
              result.erlaubt ? "text-green-700" : "text-red-700"
            }`}
          >
            {result.grund}
          </p>

          <div className="rounded-md bg-white/60 p-3">
            <p className="text-sm text-gray-700">{result.details}</p>
          </div>

          <div className="mt-4 border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600">
              Mehr Informationen findest du in unserem ausführlichen Ratgeber:{" "}
              <a
                href="/wohnwagen-fuehrerschein-welche-klasse"
                className="font-medium text-primary-700 underline hover:text-primary-600"
              >
                Wohnwagen-Führerschein: Welche Klasse brauche ich?
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
