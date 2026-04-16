"use client";

import { useState, useEffect } from "react";
import MediaGrid from "./MediaGrid";

type SiteOption = { slug: string; domain: string };

type Props = {
  sites: SiteOption[];
  initialFilter?: string;
};

export default function MediaBrowser({ sites, initialFilter }: Props) {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [siteFilter, setSiteFilter] = useState(initialFilter || "all");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (siteFilter !== "all") params.set("siteSlug", siteFilter);
    fetch(`/api/admin/media?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setImages(data.images || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [siteFilter]);

  if (loading) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <svg className="w-5 h-5 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-gray-500">Bilder werden geladen...</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-xl h-48 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-6 flex items-center gap-3">
        <select
          value={siteFilter}
          onChange={(e) => setSiteFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
        >
          <option value="all">Alle Sites</option>
          {sites.map((s) => (
            <option key={s.slug} value={s.slug}>{s.domain}</option>
          ))}
        </select>
        <span className="text-sm text-gray-500">{images.length} Bilder</span>
      </div>

      {images.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">Keine Bilder gefunden.</p>
        </div>
      ) : (
        <MediaGrid images={images} sites={sites} initialFilter={siteFilter !== "all" ? siteFilter : undefined} />
      )}
    </div>
  );
}
