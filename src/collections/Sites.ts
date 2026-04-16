import type { CollectionConfig } from 'payload'

export const Sites: CollectionConfig = {
  slug: 'sites',
  labels: {
    singular: 'Site',
    plural: 'Sites',
  },
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
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
      name: 'domain',
      type: 'text',
      required: true,
      admin: {
        description: 'z.B. "wohnwagenratgeber.de"',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'themePreset',
      type: 'select',
      options: [
        { label: 'Blue', value: 'blue' },
        { label: 'Rose', value: 'rose' },
        { label: 'Teal', value: 'teal' },
        { label: 'Coral', value: 'coral' },
        { label: 'Amber', value: 'amber' },
        { label: 'Emerald', value: 'emerald' },
      ],
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'logoAlt',
      type: 'text',
    },
    {
      name: 'navItems',
      type: 'array',
      labels: {
        singular: 'Navigation',
        plural: 'Navigationen',
      },
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Startseite', value: 'startseite' },
            { label: 'Kategorie', value: 'kategorie' },
            { label: 'Tag', value: 'tag' },
            { label: 'Link', value: 'link' },
          ],
        },
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'href',
          type: 'text',
          required: true,
        },
        {
          name: 'category',
          type: 'text',
          admin: {
            description: 'Kategorie-Slug (nur bei Typ "kategorie")',
            condition: (data, siblingData) => siblingData?.type === 'kategorie',
          },
        },
        {
          name: 'tag',
          type: 'text',
          admin: {
            description: 'Tag-Slug (nur bei Typ "tag")',
            condition: (data, siblingData) => siblingData?.type === 'tag',
          },
        },
      ],
    },
    {
      name: 'widgets',
      type: 'array',
      labels: {
        singular: 'Widget',
        plural: 'Widgets',
      },
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Hero', value: 'hero' },
            { label: 'Featured', value: 'featured' },
            { label: 'Slider', value: 'slider' },
            { label: 'Liste', value: 'list' },
            { label: 'Kategorien', value: 'categories' },
            { label: 'Tags', value: 'tags' },
            { label: 'Tools', value: 'tools' },
            { label: 'Werbung', value: 'ad' },
          ],
        },
        {
          name: 'count',
          type: 'number',
          defaultValue: 6,
        },
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'showDescription',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'descriptionLines',
          type: 'number',
        },
        {
          name: 'heroStyle',
          type: 'select',
          options: [
            { label: 'Minimal', value: 'minimal' },
            { label: 'Bild', value: 'image' },
            { label: 'Gradient', value: 'gradient' },
          ],
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'hero',
          },
        },
        {
          name: 'heroSubline',
          type: 'text',
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'hero',
          },
        },
        {
          name: 'heroImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'hero',
          },
        },
        {
          name: 'heroImageAlt',
          type: 'text',
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'hero',
          },
        },
        {
          name: 'heroCtaText',
          type: 'text',
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'hero',
          },
        },
        {
          name: 'heroCtaLink',
          type: 'text',
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'hero',
          },
        },
        {
          name: 'adConfig',
          type: 'relationship',
          relationTo: 'ad-configs',
          admin: {
            condition: (data, siblingData) => siblingData?.type === 'ad',
          },
        },
      ],
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
            { label: 'Artikel: Vor Content', value: 'article-before-content' },
            { label: 'Artikel: Nach Content', value: 'article-after-content' },
            { label: 'Kategorie: Oben', value: 'category-top' },
            { label: 'Kategorie: Unten', value: 'category-bottom' },
            { label: 'Tag: Oben', value: 'tag-top' },
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
      name: 'showSidebar',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'enableAds',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'enableAffiliates',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'umamiWebsiteId',
      type: 'text',
      admin: {
        description: 'Umami Analytics Website-ID',
      },
    },
    {
      name: 'adsenseClientId',
      type: 'text',
      admin: {
        description: 'Google AdSense Client-ID (z.B. ca-pub-...)',
      },
    },
    {
      name: 'comingSoon',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Site im Coming-Soon-Modus anzeigen',
      },
    },
  ],
}
