"use client";

import { useState, useEffect } from "react";

interface Zeitdifferenz {
  tage: number;
  stunden: number;
  minuten: number;
  sekunden: number;
  vergangen: boolean;
}

function berechneZeitdifferenz(zielDatum: Date): Zeitdifferenz {
  const jetzt = new Date();
  const diff = zielDatum.getTime() - jetzt.getTime();

  if (diff <= 0) {
    return { tage: 0, stunden: 0, minuten: 0, sekunden: 0, vergangen: true };
  }

  const sekunden = Math.floor((diff / 1000) % 60);
  const minuten = Math.floor((diff / 1000 / 60) % 60);
  const stunden = Math.floor((diff / 1000 / 60 / 60) % 24);
  const tage = Math.floor(diff / 1000 / 60 / 60 / 24);

  return { tage, stunden, minuten, sekunden, vergangen: false };
}

export function BesuchsCountdown() {
  const [datum, setDatum] = useState("");
  const [uhrzeit, setUhrzeit] = useState("18:00");
  const [partnerName, setPartnerName] = useState("");
  const [countdown, setCountdown] = useState<Zeitdifferenz | null>(null);
  const [kopiert, setKopiert] = useState(false);

  const zielDatum = datum ? new Date(`${datum}T${uhrzeit}:00`) : null;

  useEffect(() => {
    if (!zielDatum || isNaN(zielDatum.getTime())) {
      setCountdown(null);
      return;
    }

    const update = () => setCountdown(berechneZeitdifferenz(zielDatum));
    update();

    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [datum, uhrzeit]);

  function teilen() {
    if (!countdown || !zielDatum) return;

    const name = partnerName ? partnerName : "mein/e Partner/in";
    const datumStr = zielDatum.toLocaleDateString("de-DE", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    let text: string;
    if (countdown.vergangen) {
      text = `Ich bin gerade bei ${name}! \u2764\uFE0F`;
    } else {
      text = `Noch ${countdown.tage} Tage, ${countdown.stunden} Stunden bis ich ${name} wiedersehe! (${datumStr}) \u2764\uFE0F`;
    }

    navigator.clipboard.writeText(text).then(() => {
      setKopiert(true);
      setTimeout(() => setKopiert(false), 2000);
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Datum des nächsten Treffens
          </label>
          <input
            type="date"
            value={datum}
            onChange={(e) => setDatum(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Uhrzeit
          </label>
          <input
            type="time"
            value={uhrzeit}
            onChange={(e) => setUhrzeit(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name des Partners (optional)
          </label>
          <input
            type="text"
            value={partnerName}
            onChange={(e) => setPartnerName(e.target.value)}
            placeholder="z. B. Lisa"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
        </div>
      </div>

      {countdown && (
        <>
          {countdown.vergangen ? (
            <div className="rounded-lg border-2 border-green-500 bg-green-50 p-8 text-center">
              <div className="text-5xl mb-4">{"\uD83C\uDF89"}</div>
              <h3 className="text-2xl font-bold text-green-800 mb-2">
                {partnerName
                  ? `Du bist bei ${partnerName}!`
                  : "Ihr seid zusammen!"}
              </h3>
              <p className="text-green-700">
                Genießt die gemeinsame Zeit!
              </p>
            </div>
          ) : (
            <div className="rounded-lg border-2 border-primary-600 bg-primary-50 p-6">
              <h3 className="text-center text-sm font-medium text-gray-600 mb-4">
                {partnerName
                  ? `Countdown bis zum Treffen mit ${partnerName}`
                  : "Countdown bis zum nächsten Treffen"}
              </h3>

              <div className="grid grid-cols-4 gap-3 sm:gap-6">
                {[
                  { label: "Tage", wert: countdown.tage },
                  { label: "Stunden", wert: countdown.stunden },
                  { label: "Minuten", wert: countdown.minuten },
                  { label: "Sekunden", wert: countdown.sekunden },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg bg-white p-3 sm:p-5 shadow-sm text-center">
                    <p className="text-3xl sm:text-5xl font-bold text-primary-700 tabular-nums">
                      {String(item.wert).padStart(2, "0")}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">{item.label}</p>
                  </div>
                ))}
              </div>

              {zielDatum && (
                <p className="mt-4 text-center text-sm text-gray-600">
                  {zielDatum.toLocaleDateString("de-DE", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  {" um "}
                  {zielDatum.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                  {" Uhr"}
                </p>
              )}
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={teilen}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {kopiert ? "Kopiert!" : "Teilen"}
            </button>
          </div>
        </>
      )}

      {!datum && (
        <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
          <p>
            Gib das Datum eures nächsten Treffens ein und sieh live, wie die Zeit bis dahin vergeht.
            Du kannst den Countdown auch mit deinem Partner teilen!
          </p>
        </div>
      )}
    </div>
  );
}
