"use client";

import { useState } from "react";

export function KfzSteuerRechner() {
  const [gewicht, setGewicht] = useState<number>(1200);

  const steuerGanzjahr = Math.min(Math.ceil(gewicht / 200) * 7.46, 373.24);
  const steuerMonatlich = steuerGanzjahr / 12;

  const formatEur = (val: number) =>
    val.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Zulässiges Gesamtgewicht (kg)
          </label>
          <input
            type="number"
            min={1}
            max={20000}
            value={gewicht}
            onChange={(e) => setGewicht(Math.max(1, Number(e.target.value)))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
          <p className="mt-1 text-xs text-gray-500">
            Angabe aus der Zulassungsbescheinigung Teil I (Feld F.1/F.2)
          </p>
        </div>
      </div>

      <div className="rounded-lg border-2 border-primary-600 bg-primary-50 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ergebnis</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Jährliche Kfz-Steuer</p>
            <p className="text-2xl font-bold text-primary-700">{formatEur(steuerGanzjahr)} €</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Monatliche Kosten</p>
            <p className="text-2xl font-bold text-primary-700">{formatEur(steuerMonatlich)} €</p>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-sm text-gray-700">
          <p>
            <strong>Berechnungsgrundlage:</strong> {Math.ceil(gewicht / 200)} angefangene 200-kg-Stufen
            × 7,46 € = {formatEur(Math.ceil(gewicht / 200) * 7.46)} €
            {Math.ceil(gewicht / 200) * 7.46 > 373.24 && (
              <span className="text-primary-700 font-medium"> (gedeckelt auf 373,24 €)</span>
            )}
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
        <p className="font-medium text-gray-700 mb-1">Hinweis zum Saisonkennzeichen</p>
        <p>
          Bei einem Saisonkennzeichen wird die Kfz-Steuer anteilig für die zugelassenen Monate
          berechnet. Bei einer Saison von z.&nbsp;B. April bis Oktober (7 Monate) zahlst du nur{" "}
          <strong>{formatEur(steuerGanzjahr * (7 / 12))} €</strong> statt {formatEur(steuerGanzjahr)} €
          im Jahr.
        </p>
      </div>
    </div>
  );
}
