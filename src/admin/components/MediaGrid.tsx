"use client";

import { useState, useEffect, useCallback } from "react";
import type { ImageMetadata } from "@/lib/image-gen";

type SiteOption = { slug: string; domain: string };

type MediaGridProps = {
  images: ImageMetadata[];
  sites: SiteOption[];
  initialFilter?: string;
};

export default function MediaGrid({ images: initialImages, sites, initialFilter }: MediaGridProps) {
  const [images, setImages] = useState(initialImages);
  const [siteFilter, setSiteFilter] = useState(initialFilter || "all");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Update images when props change
  useEffect(() => { setImages(initialImages); }, [initialImages]);

  const filtered =
    siteFilter === "all"
      ? images
      : images.filter((img) => img.siteSlug === siteFilter);

  // Detect duplicates (multiple images for same articleSlug)
  const articleCounts = new Map<string, number>();
  for (const img of filtered) {
    const key = `${img.siteSlug}:${img.articleSlug}`;
    articleCounts.set(key, (articleCounts.get(key) || 0) + 1);
  }
  const duplicateArticles = new Set(
    Array.from(articleCounts.entries()).filter(([, c]) => c > 1).map(([k]) => k)
  );

  const handleDelete = (imageId: string) => {
    setImages((prev) => prev.filter((img) => img.id !== imageId));
    // Close lightbox if showing deleted image
    if (selectedIndex !== null && filtered[selectedIndex]?.id === imageId) {
      setSelectedIndex(null);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (selectedIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => (i !== null && i < filtered.length - 1 ? i + 1 : i));
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => (i !== null && i > 0 ? i - 1 : i));
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedIndex, filtered.length]);

  return (
    <div>
      {/* Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((img, i) => (
          <ImageCard
            key={img.id}
            image={img}
            isDuplicate={duplicateArticles.has(`${img.siteSlug}:${img.articleSlug}`)}
            onClick={() => setSelectedIndex(i)}
          />
        ))}
      </div>

      {/* Detail Modal */}
      {selectedIndex !== null && filtered[selectedIndex] && (
        <ImageDetail
          image={filtered[selectedIndex]}
          index={selectedIndex}
          total={filtered.length}
          onClose={() => setSelectedIndex(null)}
          onPrev={() => setSelectedIndex((i) => (i !== null && i > 0 ? i - 1 : i))}
          onNext={() => setSelectedIndex((i) => (i !== null && i < filtered.length - 1 ? i + 1 : i))}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

// --- Image Card (Grid Thumbnail) ---

function ImageCard({ image, isDuplicate, onClick }: { image: ImageMetadata; isDuplicate: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`bg-white rounded-xl border overflow-hidden text-left hover:shadow-lg transition-all duration-200 group cursor-pointer ${
        isDuplicate ? "border-amber-300 ring-1 ring-amber-200" : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="aspect-[3/2] relative bg-gray-100 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.blobUrl}
          alt={image.altText}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {isDuplicate && (
          <span className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            DUPLIKAT
          </span>
        )}
      </div>
      <div className="p-3 space-y-1">
        <p className="text-sm font-medium text-gray-900 truncate">
          {image.articleSlug || "Kein Artikel"}
        </p>
        <p className="text-xs text-gray-500 truncate">{image.altText}</p>
      </div>
    </button>
  );
}

// --- Detail Modal (Lightbox) ---

type RegenStatus = "idle" | "generating" | "success" | "error";

function ImageDetail({
  image: initialImage,
  index,
  total,
  onClose,
  onPrev,
  onNext,
  onDelete,
}: {
  image: ImageMetadata;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onDelete: (imageId: string) => void;
}) {
  const [currentImage, setCurrentImage] = useState(initialImage);
  const [status, setStatus] = useState<RegenStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Reset when navigating to different image
  useEffect(() => {
    setCurrentImage(initialImage);
    setStatus("idle");
    setStatusMessage("");
  }, [initialImage]);

  const image = currentImage;

  async function handleRegenerate() {
    setStatus("generating");
    setStatusMessage("Prompt wird erstellt...");

    try {
      // Step 1: Generate new image
      setStatusMessage("Bild wird generiert (fal.ai)...");
      const res = await fetch("/api/admin/images/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteSlug: image.siteSlug,
          articleSlug: image.articleSlug,
          force: true,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const result = await res.json();

      // API returns { ok, image: { blobUrl, prompt, altText } } or { blobUrl } directly
      const img = result.image || result;
      if (img.blobUrl) {
        // Update displayed image with new data
        setCurrentImage((prev) => ({
          ...prev,
          blobUrl: img.blobUrl + "?t=" + Date.now(), // cache bust
          prompt: img.prompt || prev.prompt,
          altText: img.altText || prev.altText,
          createdAt: new Date().toISOString(),
        }));
        setStatus("success");
        setStatusMessage("Neues Bild generiert und Artikel aktualisiert");
      } else if (result.warning) {
        setStatus("success");
        setStatusMessage(result.warning);
      } else {
        throw new Error("Unerwartete API-Antwort");
      }
    } catch (err) {
      setStatus("error");
      setStatusMessage(err instanceof Error ? err.message : "Fehler bei der Generierung");
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-4 max-h-[90vh] flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-white/60 tabular-nums">
            {index + 1} / {total}
          </span>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main area */}
        <div className="flex gap-4 flex-1 min-h-0">
          {/* Nav prev */}
          <button
            onClick={onPrev}
            disabled={index === 0}
            className="shrink-0 w-10 flex items-center justify-center text-white/50 hover:text-white disabled:opacity-20 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          {/* Image */}
          <div className="flex-1 flex items-center justify-center min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.blobUrl}
              alt={image.altText}
              className="max-w-full max-h-[55vh] rounded-xl object-contain shadow-2xl"
            />
          </div>

          {/* Nav next */}
          <button
            onClick={onNext}
            disabled={index === total - 1}
            className="shrink-0 w-10 flex items-center justify-center text-white/50 hover:text-white disabled:opacity-20 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        {/* Meta panel */}
        <div className="mt-4 bg-white/10 backdrop-blur-md rounded-2xl p-5 text-white overflow-y-auto max-h-[30vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Key info */}
            <div className="space-y-3">
              <MetaRow label="Artikel" value={image.articleSlug || "–"} />
              <MetaRow label="Site" value={image.siteSlug || "–"} />
              <MetaRow label="Alt-Text" value={image.altText} />
              <MetaRow label="Erstellt" value={new Date(image.createdAt).toLocaleString("de-DE")} />
              {image.width && image.height && (
                <MetaRow label="Auflösung" value={`${image.width} × ${image.height} px`} />
              )}
              {image.model && <MetaRow label="Modell" value={image.model} />}
            </div>

            {/* Right: Prompt + Actions */}
            <div className="space-y-3">
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Prompt</p>
                <p className="text-sm text-white/80 leading-relaxed">
                  {image.prompt}
                </p>
              </div>

              {image.tags && image.tags.length > 0 && (
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {image.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-white/10 rounded-full px-2.5 py-0.5 text-white/70">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Banner */}
              {status !== "idle" && (
                <div className={`rounded-lg px-3 py-2 flex items-center gap-2 ${
                  status === "generating" ? "bg-blue-500/20 text-blue-300" :
                  status === "success" ? "bg-emerald-500/20 text-emerald-300" :
                  "bg-red-500/20 text-red-300"
                }`}>
                  {status === "generating" && (
                    <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {status === "success" && (
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {status === "error" && (
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                  )}
                  <span className="text-xs">{statusMessage}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                <a
                  href={image.blobUrl}
                  target="_blank"
                  rel="noopener"
                  className="text-xs font-medium rounded-lg bg-white/10 hover:bg-white/20 px-3 py-2 text-white/80 transition-colors"
                >
                  Original öffnen ↗
                </a>
                <button
                  onClick={handleRegenerate}
                  disabled={status === "generating" || deleting}
                  className="text-xs font-medium rounded-lg bg-blue-500/80 hover:bg-blue-500 px-3 py-2 text-white transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {status === "generating" ? (
                    <>
                      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Generiert...
                    </>
                  ) : status === "success" ? "Nochmal generieren" : "Neu generieren"}
                </button>
                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    disabled={status === "generating" || deleting}
                    className="text-xs font-medium rounded-lg bg-red-500/20 hover:bg-red-500/40 px-3 py-2 text-red-300 transition-colors disabled:opacity-50"
                  >
                    Löschen
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-red-500/10 rounded-lg px-3 py-1.5 border border-red-500/30">
                    <span className="text-xs text-red-300">Wirklich löschen?</span>
                    <button
                      onClick={async () => {
                        setDeleting(true);
                        setConfirmDelete(false);
                        try {
                          const res = await fetch("/api/admin/images/delete", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              imageId: image.id,
                              siteSlug: image.siteSlug,
                              articleSlug: image.articleSlug,
                            }),
                          });
                          const result = await res.json();
                          if (res.ok) {
                            onDelete(image.id);
                          } else {
                            setStatus("error");
                            setStatusMessage(result.error || "Löschen fehlgeschlagen");
                            setDeleting(false);
                          }
                        } catch {
                          setStatus("error");
                          setStatusMessage("Netzwerkfehler beim Löschen");
                          setDeleting(false);
                        }
                      }}
                      disabled={deleting}
                      className="text-xs font-bold rounded-md bg-red-500 hover:bg-red-600 px-2.5 py-1 text-white transition-colors disabled:opacity-50"
                    >
                      {deleting ? "..." : "Ja"}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="text-xs font-medium rounded-md bg-white/10 hover:bg-white/20 px-2.5 py-1 text-white/60 transition-colors"
                    >
                      Nein
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-white/40 uppercase tracking-wider">{label}</p>
      <p className="text-sm text-white/90 break-words">{value}</p>
    </div>
  );
}
