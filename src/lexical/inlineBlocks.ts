import type { Block } from "payload";

/**
 * AffiliateLink — Inline block for affiliate links within paragraph text.
 * Renders as a styled link with asterisk indicator and click tracking.
 */
export const AffiliateLinkInlineBlock: Block = {
  slug: "affiliateLink",
  labels: {
    singular: "Affiliate-Link",
    plural: "Affiliate-Links",
  },
  fields: [
    {
      name: "text",
      type: "text",
      required: true,
      label: "Linktext",
    },
    {
      name: "linkUrl",
      type: "text",
      label: "Link-URL",
    },
    {
      name: "slug",
      type: "text",
      label: "Affiliate-Slug (optional)",
    },
  ],
};

/**
 * ObfuscatedEmail — Inline block for spam-protected email addresses.
 * Renders as click-to-reveal mailto link.
 */
export const ObfuscatedEmailInlineBlock: Block = {
  slug: "obfuscatedEmail",
  labels: {
    singular: "E-Mail (verschleiert)",
    plural: "E-Mails (verschleiert)",
  },
  fields: [
    {
      name: "user",
      type: "text",
      required: true,
      label: "Benutzername",
      admin: {
        description: "Teil vor dem @",
      },
    },
    {
      name: "domain",
      type: "text",
      required: true,
      label: "Domain",
      admin: {
        description: "Teil nach dem @ (z.B. gmail.com)",
      },
    },
  ],
};
