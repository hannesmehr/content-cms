// Payload-based site retrieval (replaces Keystatic reader)
// TODO: Replace with actual Payload Local API calls once DB is connected.
// For now, provides stub functions that match the old API signatures.

import { getPayload } from "payload";
import config from "@payload-config";

/* eslint-disable @typescript-eslint/no-explicit-any */

export type ThemeColors = {
  primary: { 50: string; 100: string; 600: string; 700: string };
  accent: { 50: string; 100: string; 600: string; 700: string };
};

const themes: Record<string, ThemeColors> = {
  blue: {
    primary: { 50: "#eff6ff", 100: "#dbeafe", 600: "#2563eb", 700: "#1d4ed8" },
    accent: { 50: "#f5f3ff", 100: "#ede9fe", 600: "#7c3aed", 700: "#6d28d9" },
  },
  rose: {
    primary: { 50: "#fdf2f8", 100: "#fce7f3", 600: "#db2777", 700: "#be185d" },
    accent: { 50: "#f5f3ff", 100: "#ede9fe", 600: "#7c3aed", 700: "#6d28d9" },
  },
  teal: {
    primary: { 50: "#f0fdfa", 100: "#ccfbf1", 600: "#0d9488", 700: "#0f766e" },
    accent: { 50: "#fffbeb", 100: "#fef3c7", 600: "#d97706", 700: "#b45309" },
  },
  coral: {
    primary: { 50: "#fff7ed", 100: "#ffedd5", 600: "#ea580c", 700: "#c2410c" },
    accent: { 50: "#fff1f2", 100: "#ffe4e6", 600: "#e11d48", 700: "#be123c" },
  },
  amber: {
    primary: { 50: "#fffbeb", 100: "#fef3c7", 600: "#d97706", 700: "#b45309" },
    accent: { 50: "#f0fdfa", 100: "#ccfbf1", 600: "#0d9488", 700: "#0f766e" },
  },
  emerald: {
    primary: { 50: "#ecfdf5", 100: "#d1fae5", 600: "#059669", 700: "#047857" },
    accent: { 50: "#eff6ff", 100: "#dbeafe", 600: "#2563eb", 700: "#1d4ed8" },
  },
};

export function getThemeColors(preset: string): ThemeColors {
  return themes[preset] || themes.blue;
}

export type NavItem = {
  type?: string;
  label?: string;
  href?: string;
  category?: string;
  tag?: string;
  labelOverride?: string;
  children?: NavItem[];
  [key: string]: unknown;
};

export type HomepageWidget = {
  type: string;
  count?: number;
  title?: string;
  showDescription?: boolean;
  descriptionLines?: number;
  heroStyle?: string;
  heroSubline?: string;
  heroImage?: any;
  heroImageAlt?: string;
  heroCtaText?: string;
  heroCtaLink?: string;
  adConfig?: any;
};

export type AdSlotAssignment = {
  slot: string;
  adConfig: string;
};

export type SiteConfig = {
  slug: string;
  name: string;
  domain: string;
  description: string;
  themePreset: string;
  enableAds: boolean;
  enableAffiliates: boolean;
  umamiWebsiteId: string;
  adsenseClientId: string;
  comingSoon: boolean;
  showSidebar: boolean;
  logo?: any;
  logoAlt?: string;
  navItems?: any[];
  widgets?: any[];
  adSlots?: any[];
};

export async function getAllSiteSlugs(): Promise<string[]> {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "sites",
      limit: 100,
      select: { slug: true },
    });
    return result.docs.map((doc) => doc.slug as string).filter(Boolean);
  } catch {
    // Fallback for build-time when DB isn't available
    return [];
  }
}

export async function getSiteBySlug(
  siteSlug: string
): Promise<SiteConfig | null> {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "sites",
      where: { slug: { equals: siteSlug } },
      limit: 1,
    });
    const doc = result.docs[0];
    if (!doc) return null;
    return {
      slug: doc.slug as string,
      name: doc.name as string,
      domain: doc.domain as string,
      description: (doc.description as string) || "",
      themePreset: (doc.themePreset as string) || "blue",
      enableAds: (doc.enableAds as boolean) ?? false,
      enableAffiliates: (doc.enableAffiliates as boolean) ?? false,
      umamiWebsiteId: (doc.umamiWebsiteId as string) || "",
      adsenseClientId: (doc.adsenseClientId as string) || "",
      comingSoon: (doc.comingSoon as boolean) ?? false,
      showSidebar: (doc.showSidebar as boolean) ?? true,
      logo: doc.logo,
      logoAlt: (doc.logoAlt as string) || undefined,
      navItems: (doc.navItems as any[]) || [],
      widgets: (doc.widgets as any[]) || [],
      adSlots: (doc.adSlots as any[]) || [],
    };
  } catch {
    return null;
  }
}

export async function getAllSites(): Promise<SiteConfig[]> {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "sites",
      limit: 100,
    });
    return result.docs.map((doc) => ({
      slug: doc.slug as string,
      name: doc.name as string,
      domain: doc.domain as string,
      description: (doc.description as string) || "",
      themePreset: (doc.themePreset as string) || "blue",
      enableAds: (doc.enableAds as boolean) ?? false,
      enableAffiliates: (doc.enableAffiliates as boolean) ?? false,
      umamiWebsiteId: (doc.umamiWebsiteId as string) || "",
      adsenseClientId: (doc.adsenseClientId as string) || "",
      comingSoon: (doc.comingSoon as boolean) ?? false,
      showSidebar: (doc.showSidebar as boolean) ?? true,
      logo: doc.logo,
      logoAlt: (doc.logoAlt as string) || undefined,
      navItems: (doc.navItems as any[]) || [],
      widgets: (doc.widgets as any[]) || [],
      adSlots: (doc.adSlots as any[]) || [],
    }));
  } catch {
    return [];
  }
}
