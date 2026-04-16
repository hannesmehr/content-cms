"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Image } from "@/components/Image";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import type { Article } from "@/lib/get-articles";

type ArticleSliderProps = {
  articles: Article[];
  categoryMap: Record<string, string>;
};

export function ArticleSlider({ articles, categoryMap }: ArticleSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (articles.length === 0) return null;

  return (
    <div className="relative group/slider">
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 border border-gray-200 rounded-full p-2 shadow-md opacity-0 group-hover/slider:opacity-100 transition-opacity hidden sm:block"
          aria-label="Zurück scrollen"
        >
          <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-proximity scrollbar-hide pb-2 touch-pan-x"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {articles.map((article) => (
          <article key={article.slug} className="snap-start shrink-0 w-[70vw] sm:w-[280px] group">
            <Link href={`/${article.slug}`} className="block">
              <div className="relative aspect-[16/9] mb-2 overflow-hidden rounded-lg bg-gray-100">
                {article.image ? (
                  <Image
                    src={article.image}
                    alt={article.imageAlt || article.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="280px"
                  />
                ) : (
                  <ImagePlaceholder />
                )}
              </div>
              {article.category && categoryMap[article.category] && (
                <span className="inline-block text-[11px] font-medium text-primary-700 bg-primary-50 px-1.5 py-0.5 rounded">
                  {categoryMap[article.category]}
                </span>
              )}
              <h3 className="mt-1 text-sm font-semibold text-gray-900 group-hover:text-gray-600 line-clamp-2">
                {article.title}
              </h3>
            </Link>
          </article>
        ))}
      </div>

      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 border border-gray-200 rounded-full p-2 shadow-md opacity-0 group-hover/slider:opacity-100 transition-opacity hidden sm:block"
          aria-label="Weiter scrollen"
        >
          <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      )}
    </div>
  );
}
