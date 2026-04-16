import type { CollectionConfig } from 'payload'

export const AffiliateLinks: CollectionConfig = {
  slug: 'affiliate-links',
  labels: {
    singular: 'Affiliate-Link',
    plural: 'Affiliate-Links',
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
      name: 'targetUrl',
      type: 'text',
      required: true,
      admin: {
        description: 'Affiliate-Ziel-URL',
      },
    },
    {
      name: 'description',
      type: 'text',
    },
  ],
}
