"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Site error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
        <svg
          className="w-10 h-10 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-900">
        Etwas ist schiefgelaufen
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        Beim Laden dieser Seite ist ein Fehler aufgetreten. Bitte versuche es
        nochmal oder gehe zur Startseite zurück.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-gray-400">
          Fehler-ID: {error.digest}
        </p>
      )}
      <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
        <button
          onClick={reset}
          className="px-6 py-3 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
        >
          Erneut versuchen
        </button>
        <Link
          href="/"
          className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}
