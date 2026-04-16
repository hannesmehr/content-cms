import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: 'Kategorie',
    plural: 'Kategorien',
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
      index: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'site',
      type: 'relationship',
      relationTo: 'sites',
      required: true,
      index: true,
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
            { label: 'Oben', value: 'top' },
            { label: 'Unten', value: 'bottom' },
            { label: 'Sidebar', value: 'sidebar' },
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
  ],
}
