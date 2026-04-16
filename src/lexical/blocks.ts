import type { Block } from "payload";

/**
 * AffiliateBox — Full-width block for affiliate product cards.
 * Renders as a styled box with title, description, and CTA button.
 */
export const AffiliateBoxBlock: Block = {
  slug: "affiliateBox",
  labels: {
    singular: "Affiliate-Box",
    plural: "Affiliate-Boxen",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      label: "Titel",
    },
    {
      name: "description",
      type: "text",
      label: "Beschreibung",
    },
    {
      name: "slug",
      type: "text",
      label: "Affiliate-Slug (optional)",
      admin: {
        description: "Slug aus der Affiliate-Links Sammlung",
      },
    },
    {
      name: "linkUrl",
      type: "text",
      label: "Link-URL",
    },
    {
      name: "linkText",
      type: "text",
      label: "Link-Text",
    },
  ],
};

/**
 * Figure — Full-width image block with alt text and optional caption.
 */
export const FigureBlock: Block = {
  slug: "figure",
  labels: {
    singular: "Abbildung",
    plural: "Abbildungen",
  },
  fields: [
    {
      name: "src",
      type: "text",
      required: true,
      label: "Bild-URL",
      admin: {
        description: "Pfad zum Bild (z.B. /images/posts/...)",
      },
    },
    {
      name: "alt",
      type: "text",
      label: "Alt-Text",
    },
    {
      name: "caption",
      type: "text",
      label: "Bildunterschrift",
    },
  ],
};

/**
 * InlineAd — Full-width ad placement block.
 * References an AdConfig for rendering.
 */
export const InlineAdBlock: Block = {
  slug: "inlineAd",
  labels: {
    singular: "Werbefläche",
    plural: "Werbeflächen",
  },
  fields: [
    {
      name: "adConfig",
      type: "text",
      label: "Ad-Konfiguration Slug",
      defaultValue: "global",
      admin: {
        description: 'Slug der Werbe-Konfiguration (z.B. "global")',
      },
    },
  ],
};
