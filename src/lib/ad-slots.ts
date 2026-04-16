export const AD_SLOTS = {
  "article-before-content": "Artikel: Vor dem Inhalt",
  "article-after-content": "Artikel: Nach dem Inhalt",
  "category-top": "Kategorieseite: Oben",
  "category-bottom": "Kategorieseite: Unten",
  "tag-top": "Tag-Seite: Oben",
} as const;

export type AdSlotName = keyof typeof AD_SLOTS;

export const AD_SLOT_OPTIONS = Object.entries(AD_SLOTS).map(
  ([value, label]) => ({ value, label })
);
