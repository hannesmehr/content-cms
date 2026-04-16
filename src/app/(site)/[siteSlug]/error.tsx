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
    <div className="mx-auto max-w-4xl px-4 py-24 text-center">
      <h1 className="text-6xl font-bold text-gray-900">Fehler</h1>
      <p className="mt-4 text-lg text-gray-600">
        Beim Laden der Seite ist ein Fehler aufgetreten.
      </p>
      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          onClick={reset}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
        >
          Erneut versuchen
        </button>
        <Link
          href="/"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}
