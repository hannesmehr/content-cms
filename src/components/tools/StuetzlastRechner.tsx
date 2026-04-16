"use client";

import { useState } from "react";

export function StuetzlastRechner() {
  const [maxStuetzlastZfz, setMaxStuetzlastZfz] = useState<string>("");
  const [maxStuetzlastAhk, setMaxStuetzlastAhk] = useState<string>("");
  const [tatsaechlicheStuetzlast, setTatsaechlicheStuetzlast] =
    useState<string>("");
  const [gesamtgewichtWw, setGesamtgewichtWw] = useState<string>("");

  const zfzNum = parseFloat(maxStuetzlastZfz) || 0;
  const ahkNum = parseFloat(maxStuetzlastAhk) || 0;
  const tatsNum = parseFloat(tatsaechlicheStuetzlast) || 0;
  const wwNum = parseFloat(gesamtgewichtWw) || 0;

  const hasMainInput =
    maxStuetzlastZfz !== "" &&
    maxStuetzlastAhk !== "" &&
    tatsaechlicheStuetzlast !== "";

  const erlaubteStuetzlast = Math.min(zfzNum, ahkNum);
  const differenz = tatsNum - erlaubteStuetzlast;

  const minStuetzlast4Prozent = wwNum > 0 ? Math.round(wwNum * 0.04) : 0;
  const stuetzlastAnteil =
    wwNum > 0 ? ((tatsNum / wwNum) * 100).toFixed(1) : "0";

  type Status = "ok" | "zu-hoch" | "zu-niedrig" | "neutral";

  const getStatus = (): Status => {
    if (!hasMainInput) return "neutral";
    if (tatsNum > erlaubteStuetzlast) return "zu-hoch";
    if (wwNum > 0 && tatsNum < minStuetzlast4Prozent) return "zu-niedrig";
    return "ok";
  };

  const status = getStatus();

  const statusConfig = {
    ok: {
      border: "border-green-500",
      bg: "bg-green-50",
      text: "text-green-800",
      label: "Alles in Ordnung",
      icon: "\u2713",
      iconBg: "bg-green-600",
    },
    "zu-hoch": {
      border: "border-red-500",
      bg: "bg-red-50",
      text: "text-red-800",
      label: "Stützlast zu hoch!",
      icon: "\u2717",
      iconBg: "bg-red-600",
    },
    "zu-niedrig": {
      border: "border-yellow-500",
      bg: "bg-yellow-50",
      text: "text-yellow-800",
      label: "Stützlast zu niedrig!",
      icon: "!",
      iconBg: "bg-yellow-600",
    },
    neutral: {
      border: "border-primary-600",
      bg: "bg-primary-50",
      text: "text-gray-800",
      label: "",
      icon: "",
      iconBg: "",
    },
  };

  const cfg = statusConfig[status];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Max. Stützlast Zugfahrzeug (kg)
          </label>
          <input
            type="number"
            value={maxStuetzlastZfz}
            onChange={(e) => setMaxStuetzlastZfz(e.target.value)}
            placeholder="z.B. 80"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
          <p className="mt-1 text-xs text-gray-500">
            Steht in der Zulassungsbescheinigung Teil I (Feld 13)
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Max. Stützlast Anhängerkupplung (kg)
          </label>
          <input
            type="number"
            value={maxStuetzlastAhk}
            onChange={(e) => setMaxStuetzlastAhk(e.target.value)}
            placeholder="z.B. 75"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
          <p className="mt-1 text-xs text-gray-500">
            Steht auf dem Typschild der AHK oder in deren Dokumentation
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Tatsächliche Stützlast Wohnwagen (kg)
          </label>
          <input
            type="number"
            value={tatsaechlicheStuetzlast}
            onChange={(e) => setTatsaechlicheStuetzlast(e.target.value)}
            placeholder="z.B. 65"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
          <p className="mt-1 text-xs text-gray-500">
            Gemessen am Kupplungskopf (z.B. mit Stützlastwaage)
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Zul. Gesamtgewicht Wohnwagen (kg){" "}
            <span className="font-normal text-gray-400">optional</span>
          </label>
          <input
            type="number"
            value={gesamtgewichtWw}
            onChange={(e) => setGesamtgewichtWw(e.target.value)}
            placeholder="z.B. 1300"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          />
          <p className="mt-1 text-xs text-gray-500">
            Zur Prüfung der 4%-Empfehlung (Stützlast mind. 4% des
            Gesamtgewichts)
          </p>
        </div>
      </div>

      {hasMainInput && (
        <div className={`rounded-lg border-2 ${cfg.border} ${cfg.bg} p-6`}>
          <div className="mb-4 flex items-center gap-3">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-white ${cfg.iconBg}`}
            >
              {cfg.icon}
            </span>
            <h3 className={`text-xl font-bold ${cfg.text}`}>{cfg.label}</h3>
          </div>

          <div className="space-y-3">
            <div className="rounded-md bg-white/60 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Max. Stützlast Zugfahrzeug
                  </p>
                  <p className="text-lg font-bold text-gray-900">{zfzNum} kg</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Max. Stützlast AHK
                  </p>
                  <p className="text-lg font-bold text-gray-900">{ahkNum} kg</p>
                </div>
              </div>
              <hr className="my-3 border-gray-200" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Erlaubte Stützlast (Minimum beider Werte)
                </p>
                <p className="text-2xl font-bold text-primary-700">
                  {erlaubteStuetzlast} kg
                </p>
              </div>
            </div>

            <div className="rounded-md bg-white/60 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Tatsächliche Stützlast
                  </p>
                  <p className="text-lg font-bold text-gray-900">{tatsNum} kg</p>
                </div>
                <div className="text-right">
                  {status === "ok" && (
                    <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                      Im Rahmen ({erlaubteStuetzlast - tatsNum} kg Reserve)
                    </span>
                  )}
                  {status === "zu-hoch" && (
                    <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
                      {differenz} kg über dem Limit!
                    </span>
                  )}
                  {status === "zu-niedrig" && (
                    <span className="inline-block rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                      Unter 4%-Empfehlung
                    </span>
                  )}
                </div>
              </div>

              {wwNum > 0 && (
                <div className="mt-3 border-t border-gray-200 pt-3">
                  <p className="text-sm text-gray-600">
                    Stützlast-Anteil am Gesamtgewicht ({wwNum} kg):{" "}
                    <span className="font-bold">{stuetzlastAnteil}%</span>
                    {parseFloat(stuetzlastAnteil) < 4 && (
                      <span className="ml-2 text-yellow-700">
                        (Empfohlen: mindestens 4% = {minStuetzlast4Prozent} kg)
                      </span>
                    )}
                    {parseFloat(stuetzlastAnteil) >= 4 && (
                      <span className="ml-2 text-green-700">
                        (Empfehlung von mind. 4% = {minStuetzlast4Prozent} kg
                        erfüllt)
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {status === "zu-hoch" && (
              <div className="flex items-start gap-2 rounded-md bg-red-100 p-3">
                <span className="text-lg">&#9888;</span>
                <p className="text-sm text-red-800">
                  Die tatsächliche Stützlast überschreitet den erlaubten Wert um{" "}
                  {differenz} kg. Verlagere Gewicht im Wohnwagen nach hinten,
                  um die Stützlast zu reduzieren. Überhöhte Stützlast
                  beeinträchtigt die Lenkfähigkeit des Zugfahrzeugs.
                </p>
              </div>
            )}

            {status === "zu-niedrig" && (
              <div className="flex items-start gap-2 rounded-md bg-yellow-100 p-3">
                <span className="text-lg">&#9888;</span>
                <p className="text-sm text-yellow-800">
                  Die Stützlast liegt unter der empfohlenen Mindestgrenze von 4%
                  des Gesamtgewichts ({minStuetzlast4Prozent} kg). Verlagern Sie
                  Gewicht im Wohnwagen nach vorne. Eine zu niedrige Stützlast
                  kann zum gefährlichen Schlingern des Gespanns führen.
                </p>
              </div>
            )}

            {status === "ok" && (
              <div className="flex items-start gap-2 rounded-md bg-green-100 p-3">
                <span className="text-lg">&#9733;</span>
                <p className="text-sm text-green-800">
                  <strong>Tipp:</strong> Für optimale Fahrstabilität sollten Sie
                  die erlaubte Stützlast möglichst voll ausnutzen. Die ideale
                  Stützlast liegt so nah wie möglich am erlaubten Maximum von{" "}
                  {erlaubteStuetzlast} kg.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
