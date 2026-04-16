"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

type SiteInfo = {
  slug: string;
  domain: string;
  name: string;
  themePreset: string;
};

type UserInfo = {
  name: string;
  email: string;
  image: string;
} | null;

type AdminShellProps = {
  sites: SiteInfo[];
  children: React.ReactNode;
  user?: UserInfo;
};

const STORAGE_KEY = "admin-sidebar-collapsed";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: "chart-bar" },
  { href: "/admin/media", label: "Medien", icon: "photo" },
  { href: "/admin/stats", label: "Klick-Stats", icon: "trending-up" },
  { href: "/admin/actions", label: "Aktionen", icon: "bolt" },
  { href: "https://www.wochenendbeziehungen.de/keystatic", label: "Keystatic", icon: "pencil", external: true },
  { href: "https://analytics.infected.de", label: "Umami", icon: "external", external: true },
];

const SITE_COLORS: Record<string, string> = {
  blue: "bg-blue-500",
  rose: "bg-rose-500",
  teal: "bg-teal-500",
  coral: "bg-orange-500",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
};

function getSiteColor(themePreset: string): string {
  return SITE_COLORS[themePreset] || "bg-slate-500";
}

function NavIcon({ icon, className }: { icon: string; className?: string }) {
  const cls = className || "w-5 h-5";
  switch (icon) {
    case "chart-bar":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      );
    case "photo":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
        </svg>
      );
    case "trending-up":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
        </svg>
      );
    case "bolt":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      );
    case "pencil":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zM16.862 4.487L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
      );
    case "external":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
      );
    case "globe":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      );
    default:
      return null;
  }
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-5 h-5"} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-5 h-5"} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-5 h-5"} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function AdminShell({ sites, children, user }: AdminShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "true") setCollapsed(true);
    } catch {}
  }, []);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {}
  }

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-50 h-screen
          bg-slate-900 text-slate-200 flex flex-col
          transition-all duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
        style={{
          width: mounted ? (collapsed ? 68 : 260) : 260,
        }}
      >
        {/* Gradient accent line */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shrink-0" />

        {/* Logo / Title + Toggle */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700/50">
          <Link
            href="/admin"
            className={`
              text-lg font-bold text-white whitespace-nowrap overflow-hidden
              transition-all duration-300
              ${collapsed ? "md:w-0 md:opacity-0" : "w-auto opacity-100"}
            `}
          >
            Content Dashboard
          </Link>
          {/* Desktop toggle */}
          <button
            onClick={toggleCollapsed}
            className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white shrink-0"
            title={collapsed ? "Sidebar ausklappen" : "Sidebar einklappen"}
          >
            <div className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}>
              <ChevronLeftIcon className="w-4 h-4" />
            </div>
          </button>
          {/* Mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-800 transition-colors text-slate-400"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1">
          {/* Main nav items */}
          <div className="px-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = !("external" in item) && isActive(item.href);
              const isExternal = "external" in item && item.external;
              const Tag = isExternal ? "a" : Link;
              const extraProps = isExternal ? { target: "_blank", rel: "noopener" } : {};
              return (
                <Tag
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
                    transition-all duration-200 group relative
                    ${active
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                    }
                  `}
                  title={collapsed ? item.label : undefined}
                  {...extraProps}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-500 rounded-r-full" />
                  )}
                  <NavIcon icon={item.icon} className="w-5 h-5 shrink-0" />
                  <span
                    className={`
                      whitespace-nowrap overflow-hidden
                      transition-all duration-300
                      ${collapsed ? "md:w-0 md:opacity-0" : "w-auto opacity-100"}
                    `}
                  >
                    {item.label}
                  </span>
                </Tag>
              );
            })}
          </div>

          {/* Sites section */}
          <div className="pt-4 px-3">
            <div
              className={`
                px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500
                transition-all duration-300
                ${collapsed ? "md:text-center md:px-0" : ""}
              `}
            >
              <span className={`transition-all duration-300 ${collapsed ? "md:hidden" : ""}`}>
                Sites
              </span>
              <NavIcon
                icon="globe"
                className={`w-4 h-4 mx-auto transition-all duration-300 ${collapsed ? "md:block hidden" : "hidden"}`}
              />
            </div>
            <div className="space-y-1">
              {sites.map((site) => {
                const active = pathname === `/admin/site/${site.slug}`;
                const colorDot = getSiteColor(site.themePreset);
                const firstLetter = site.name.charAt(0).toUpperCase();

                return (
                  <Link
                    key={site.slug}
                    href={`/admin/site/${site.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className={`
                      flex items-center gap-3 rounded-lg px-3 py-2 text-sm
                      transition-all duration-200 relative
                      ${active
                        ? "bg-slate-800 text-white font-medium"
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                      }
                    `}
                    title={collapsed ? site.domain : undefined}
                  >
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-500 rounded-r-full" />
                    )}
                    {/* Avatar circle */}
                    <div
                      className={`
                        w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0
                        ${colorDot}
                      `}
                    >
                      {firstLetter}
                    </div>
                    <span
                      className={`
                        whitespace-nowrap overflow-hidden truncate
                        transition-all duration-300
                        ${collapsed ? "md:w-0 md:opacity-0" : "w-auto opacity-100"}
                      `}
                    >
                      {site.domain}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* User + Footer */}
        <div className="px-4 py-3 border-t border-slate-700/50">
          {user && (
            <div className={`mb-2 transition-all duration-300 overflow-hidden ${collapsed ? "md:opacity-0 md:h-0" : "opacity-100"}`}>
              <div className="flex items-center gap-2.5">
                {user.image ? (
                  <img src={user.image} alt="" className="w-7 h-7 rounded-full" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                    {user.name?.charAt(0) || "?"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-300 truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
              <a
                href="/api/auth/signout"
                className="mt-2 block text-center text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                Abmelden
              </a>
            </div>
          )}
          <div className={`transition-all duration-300 overflow-hidden ${collapsed ? "md:opacity-0 md:h-0" : "opacity-100"}`}>
            <p className="text-xs text-slate-500">Content Template</p>
          </div>
          {collapsed && (
            <div className="hidden md:flex justify-center">
              {user?.image ? (
                <img src={user.image} alt="" className="w-7 h-7 rounded-full" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center">
                  <span className="text-xs text-slate-400 font-bold">{user?.name?.charAt(0) || "CT"}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {/* Mobile header */}
        <div className="md:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <MenuIcon className="w-5 h-5 text-slate-700" />
          </button>
          <span className="text-sm font-semibold text-slate-800">Content Dashboard</span>
        </div>

        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
