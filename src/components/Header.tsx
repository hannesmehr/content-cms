"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Image } from "@/components/Image";

export type NavItem = {
  type?: string;
  label?: string;
  href?: string;
  category?: string;
  tag?: string;
  children?: NavItem[];
  [key: string]: unknown;
};

type HeaderProps = {
  siteName: string;
  logo?: string | null;
  logoAlt?: string;
  navItems: NavItem[];
  articleImages?: Record<string, { src: string; alt: string }>;
};

function slugFromHref(href: string): string {
  return href.replace(/^\//, "");
}

export function Header({
  siteName,
  logo,
  logoAlt,
  navItems,
  articleImages = {},
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  const openMenu = useCallback((label: string) => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setActiveMenu(label);
  }, []);

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => {
      setActiveMenu(null);
    }, 150);
  }, []);

  // Close mega menu on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveMenu(null);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Close mobile on resize to desktop
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 1280) setMobileOpen(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return (
    <>
      <header ref={headerRef} className="relative bg-white border-b-2 border-primary-600 z-50">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            {logo ? (
              <Image
                src={logo}
                alt={logoAlt || siteName}
                width={180}
                height={48}
                className="h-9 w-auto"
                priority
              />
            ) : (
              <span className="text-xl font-bold text-gray-900 hover:text-primary-700 transition-colors">
                {siteName}
              </span>
            )}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden xl:flex items-center gap-0.5">
            {navItems.map((item) => {
              const hasChildren = item.children.length > 0;
              const isActive = activeMenu === item.label;

              return (
                <div
                  key={item.label}
                  onMouseEnter={() => hasChildren && openMenu(item.label)}
                  onMouseLeave={scheduleClose}
                >
                  <Link
                    href={item.href}
                    className={`
                      px-1.5 py-2 text-[13px] font-medium rounded-md transition-colors whitespace-nowrap
                      ${isActive
                        ? "text-primary-700 bg-primary-50"
                        : "text-gray-700 hover:text-primary-700 hover:bg-gray-50"
                      }
                    `}
                    onClick={() => setActiveMenu(null)}
                  >
                    {item.label}
                    {hasChildren && (
                      <svg
                        className={`inline-block ml-1 w-3.5 h-3.5 transition-transform ${isActive ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* Mobile burger */}
          <button
            type="button"
            onClick={() => {
              setMobileOpen(!mobileOpen);
              setMobileAccordion(null);
            }}
            className="xl:hidden ml-auto p-2 -mr-2 text-gray-600 hover:text-primary-700 transition-colors"
            aria-expanded={mobileOpen}
            aria-label="Menü"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </div>

        {/* Desktop Mega Menu Panels */}
        {navItems.map((item) => {
          if (item.children.length === 0 || activeMenu !== item.label) return null;

          // Tools-Menü: kompaktes Layout ohne Bilder
          const isToolsMenu = item.href === "/tools";

          if (isToolsMenu) {
            const cols = item.children.length <= 12 ? "grid-cols-3" : "grid-cols-4";
            return (
              <div
                key={item.label}
                className="absolute left-0 right-0 top-full z-50"
                onMouseEnter={() => openMenu(item.label)}
                onMouseLeave={scheduleClose}
              >
                <div className="bg-white border-t border-gray-100 shadow-xl">
                  <div className="mx-auto max-w-7xl px-4 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-primary-700">{item.label}</span>
                      <Link
                        href={item.href}
                        className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                        onClick={() => setActiveMenu(null)}
                      >
                        Alle Tools →
                      </Link>
                    </div>
                    <div className={`grid ${cols} gap-1`}>
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="group flex items-center gap-2 rounded-md px-2.5 py-2 hover:bg-primary-50 transition-colors"
                          onClick={() => setActiveMenu(null)}
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary-100 text-primary-600 text-xs">
                            ⚙
                          </span>
                          <span className="text-xs font-medium text-gray-700 group-hover:text-primary-700 transition-colors">
                            {child.label}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // Standard-Mega-Menü mit Bildern (Kategorien)
          const visibleChildren = item.children.slice(0, 10);
          const cols =
            visibleChildren.length <= 2
              ? "grid-cols-2"
              : visibleChildren.length <= 4
                ? "grid-cols-4"
                : "grid-cols-5";

          return (
            <div
              key={item.label}
              className="absolute left-0 right-0 top-full z-50"
              onMouseEnter={() => openMenu(item.label)}
              onMouseLeave={scheduleClose}
            >
              <div className="bg-white border-t border-gray-100 shadow-xl">
                <div className="mx-auto max-w-7xl px-4 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-primary-700">{item.label}</span>
                    <Link
                      href={item.href}
                      className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                      onClick={() => setActiveMenu(null)}
                    >
                      Alle Artikel →
                    </Link>
                  </div>
                  <div className={`grid ${cols} gap-3`}>
                    {visibleChildren.map((child) => {
                      const slug = slugFromHref(child.href);
                      const img = articleImages[slug];

                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="group rounded-lg overflow-hidden hover:bg-primary-50 transition-colors p-1.5"
                          onClick={() => setActiveMenu(null)}
                        >
                          <div className="aspect-[16/10] relative bg-primary-100 rounded-md overflow-hidden">
                            {img ? (
                              <Image
                                src={img.src}
                                alt={img.alt}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                sizes="200px"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <svg className="w-6 h-6 text-primary-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <p className="mt-1.5 text-xs font-medium text-gray-800 group-hover:text-primary-700 leading-snug line-clamp-2 transition-colors">
                            {child.label}
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </header>

      {/* Backdrop for mega menu */}
      {activeMenu && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setActiveMenu(null)}
        />
      )}

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div className="xl:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />

          {/* Slide-in panel */}
          <div className="absolute top-0 right-0 w-full max-w-sm h-full bg-white shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
              <span className="text-lg font-semibold text-gray-900">Menü</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-2 -mr-2 text-gray-500 hover:text-gray-700"
                aria-label="Menü schließen"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="px-4 py-3">
              {navItems.map((item) => {
                const hasChildren = item.children.length > 0;
                const isOpen = mobileAccordion === item.label;

                return (
                  <div key={item.label} className="border-b border-gray-50 last:border-0">
                    {hasChildren ? (
                      <button
                        type="button"
                        onClick={() => setMobileAccordion(isOpen ? null : item.label)}
                        className="w-full flex items-center justify-between py-3 text-left"
                      >
                        <span className={`font-medium ${isOpen ? "text-primary-700" : "text-gray-800"}`}>
                          {item.label}
                        </span>
                        <svg
                          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="block py-3 font-medium text-gray-800 hover:text-primary-700"
                      >
                        {item.label}
                      </Link>
                    )}

                    {hasChildren && isOpen && (
                      <div className="pb-3 space-y-1">
                        {item.children.map((child) => {
                          const slug = slugFromHref(child.href);
                          const img = articleImages[slug];

                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setMobileOpen(false)}
                              className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-primary-50 transition-colors"
                            >
                              <div className="w-12 h-12 shrink-0 rounded-md overflow-hidden bg-primary-100">
                                {img ? (
                                  <Image
                                    src={img.src}
                                    alt={img.alt}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-primary-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <span className="text-sm text-gray-700 leading-snug line-clamp-2">
                                {child.label}
                              </span>
                            </Link>
                          );
                        })}

                        <Link
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className="block py-2 px-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                        >
                          Alle Artikel →
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
