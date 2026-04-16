import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: {
    singular: 'Artikel',
    plural: 'Artikel',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'site', 'category', 'date', 'draft'],
    listSearchableFields: ['title', 'slug'],
  },
  defaultSort: '-date',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'dd.MM.yyyy',
        },
      },
    },
    {
      name: 'lastFactCheck',
      type: 'date',
      admin: {
        description: 'Datum des letzten Faktenchecks',
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'dd.MM.yyyy',
        },
      },
    },
    {
      name: 'draft',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'sponsored',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'hideAds',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'score',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Automatisch berechneter Commercial Score 0-100',
      },
    },
    {
      name: 'reviewStatus',
      type: 'select',
      defaultValue: 'open',
      options: [
        { label: 'Offen', value: 'open' },
        { label: 'Überarbeitet', value: 'revised' },
        { label: 'Geprüft', value: 'reviewed' },
      ],
    },
    {
      name: 'redirectFrom',
      type: 'array',
      labels: {
        singular: 'Redirect',
        plural: 'Redirects',
      },
      admin: {
        description: 'Alte Slugs für 301-Redirects',
      },
      fields: [
        {
          name: 'slug',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'site',
      type: 'relationship',
      relationTo: 'sites',
      required: true,
      index: true,
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Bild aus Media Manager. Alternativ: imageUrl für externe URLs.',
      },
    },
    {
      name: 'imageUrl',
      type: 'text',
      admin: {
        description: 'Externer Bildpfad (z.B. /media/images/posts/...webp). Fallback wenn kein Upload.',
      },
    },
    {
      name: 'imageAlt',
      type: 'text',
    },
    {
      name: 'adSlots',
      type: 'array',
      labels: {
        singular: 'Ad Slot',
        plural: 'Ad Slots',
      },
      fields: [
        {
          name: 'slot',
          type: 'select',
          required: true,
          options: [
            { label: 'Artikel: Vor dem Inhalt', value: 'article-before-content' },
            { label: 'Artikel: Nach dem Inhalt', value: 'article-after-content' },
            { label: 'Kategorieseite: Oben', value: 'category-top' },
            { label: 'Kategorieseite: Unten', value: 'category-bottom' },
            { label: 'Tag-Seite: Oben', value: 'tag-top' },
          ],
        },
        {
          name: 'adConfig',
          type: 'relationship',
          relationTo: 'ad-configs',
          required: true,
        },
      ],
    },
    {
      name: 'content',
      type: 'richText',
    },
  ],
}
