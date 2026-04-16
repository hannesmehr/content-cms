"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "umami.disabled";

const ALL_DOMAINS = [
  "www.wohnwagenratgeber.de",
  "www.immobiliensanierung.com",
  "fahrschulbewertung.de",
  "www.wohnunggesucht.com",
  "www.wochenendbeziehungen.de",
  "www.skincaretipps.de",
];

export default function TrackingExclude() {
  const [excluded, setExcluded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentDomain, setCurrentDomain] = useState("");

  useEffect(() => {
    setMounted(true);
    setCurrentDomain(window.location.hostname);
    setExcluded(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  const toggle = () => {
    if (excluded) {
      localStorage.removeItem(STORAGE_KEY);
      setExcluded(false);
    } else {
      localStorage.setItem(STORAGE_KEY, "1");
      setExcluded(true);
    }
  };

  if (!mounted) return null;

  const otherDomains = ALL_DOMAINS.filter((d) => d !== currentDomain);

  return (
    <div>
      {/* Status + Toggle */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={toggle}
          className={`
            relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent
            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
            ${excluded ? "bg-emerald-500 focus:ring-emerald-500" : "bg-gray-300 focus:ring-gray-400"}
          `}
        >
          <span
            className={`
              pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow ring-0
              transition duration-200 ease-in-out
              ${excluded ? "translate-x-5" : "translate-x-0"}
            `}
          />
        </button>
        <div>
          <p className="text-sm font-medium text-gray-900">
            {excluded ? "Tracking deaktiviert" : "Tracking aktiv"}
          </p>
          <p className="text-xs text-gray-500">
            auf {currentDomain}
          </p>
        </div>
        <span
          className={`
            ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium
            ${excluded ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}
          `}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${excluded ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
          {excluded ? "Excluded" : "Wird getrackt"}
        </span>
      </div>

      {/* Other domains hint */}
      <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
        <p className="font-medium text-gray-600 mb-1.5">
          Tracking-Ausschluss gilt nur für die aktuelle Domain.
        </p>
        <p className="mb-2">
          Um dich auf allen Sites auszuschließen, öffne jede Site und setze den Exclude dort:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {otherDomains.map((domain) => (
            <a
              key={domain}
              href={`https://${domain}/admin/actions`}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1 rounded-md bg-white border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              {domain}
              <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
