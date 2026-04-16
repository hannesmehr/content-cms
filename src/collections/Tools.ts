import type { CollectionConfig } from 'payload'

export const Tools: CollectionConfig = {
  slug: 'tools',
  labels: {
    singular: 'Tool',
    plural: 'Tools',
  },
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Anzeigename des Tools',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'seoTitle',
      type: 'text',
      admin: {
        description: 'Überschreibt den Standard-Title aus der Tool-Registry',
      },
    },
    {
      name: 'seoDescription',
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
      name: 'faqItems',
      type: 'array',
      labels: {
        singular: 'FAQ',
        plural: 'FAQs',
      },
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
        },
        {
          name: 'answer',
          type: 'textarea',
          required: true,
        },
      ],
    },
    {
      name: 'contentAbove',
      type: 'richText',
      admin: {
        description: 'Content oberhalb des Tools',
      },
    },
    {
      name: 'contentBelow',
      type: 'richText',
      admin: {
        description: 'Content unterhalb des Tools',
      },
    },
  ],
}
