"use client";

import { useState, useEffect } from "react";

type Programme = { id: number; name: string };

export default function AwinLinkBuilder() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [advertiserId, setAdvertiserId] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [clickref, setClickref] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [method, setMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/admin/awin/linkbuilder")
      .then((r) => r.json())
      .then((d) => setProgrammes(d.programmes || []))
      .catch(() => {});
  }, []);

  async function handleGenerate() {
    if (!advertiserId || !destinationUrl) return;
    setLoading(true);
    setGeneratedUrl("");
    setCopied(false);

    try {
      const res = await fetch("/api/admin/awin/linkbuilder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          advertiserId: parseInt(advertiserId),
          destinationUrl,
          clickref: clickref || undefined,
        }),
      });
      const data = await res.json();
      setGeneratedUrl(data.url || "");
      setMethod(data.method || "");
    } catch {
      setGeneratedUrl("Fehler bei der Link-Generierung");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.686-5.781a4.5 4.5 0 00-6.364-6.364L4.5 8.25" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Awin Link Builder</h3>
          <p className="text-xs text-gray-400">Deeplinks für Awin-Advertiser generieren</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Advertiser */}
        <div>
          <label className="text-xs font-medium text-gray-600">Advertiser</label>
          <select
            value={advertiserId}
            onChange={(e) => setAdvertiserId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Advertiser wählen...</option>
            {programmes.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
            ))}
          </select>
        </div>

        {/* Destination URL */}
        <div>
          <label className="text-xs font-medium text-gray-600">Ziel-URL</label>
          <input
            type="url"
            value={destinationUrl}
            onChange={(e) => setDestinationUrl(e.target.value)}
            placeholder="https://www.fritzberger.de/produkt/..."
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* ClickRef */}
        <div>
          <label className="text-xs font-medium text-gray-600">ClickRef (optional)</label>
          <input
            type="text"
            value={clickref}
            onChange={(e) => setClickref(e.target.value)}
            placeholder="artikel-slug oder kampagne"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading || !advertiserId || !destinationUrl}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generiere...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.686-5.781a4.5 4.5 0 00-6.364-6.364L4.5 8.25" />
              </svg>
              Deep Link generieren
            </>
          )}
        </button>

        {/* Result */}
        {generatedUrl && (
          <div className="mt-3 rounded-lg bg-gray-50 border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">
                {method === "api" ? "Via Awin API" : "Manuell generiert"}
              </span>
              <button
                onClick={handleCopy}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Kopiert!
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                    </svg>
                    Kopieren
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-700 break-all font-mono bg-white rounded p-2 border border-gray-100">
              {generatedUrl}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
