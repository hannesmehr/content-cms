import type { CollectionConfig } from 'payload'

export const AdConfigs: CollectionConfig = {
  slug: 'ad-configs',
  labels: {
    singular: 'Ad-Konfiguration',
    plural: 'Ad-Konfigurationen',
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
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Platzhalter', value: 'placeholder' },
        { label: 'AdSense', value: 'adsense' },
        { label: 'Banner', value: 'banner' },
        { label: 'Custom HTML', value: 'custom' },
      ],
    },
    // AdSense fields
    {
      name: 'adsenseSlotId',
      type: 'text',
      admin: {
        description: 'AdSense Slot-ID',
        condition: (data) => data?.type === 'adsense',
      },
    },
    {
      name: 'adsenseFormat',
      type: 'select',
      options: [
        { label: 'Auto', value: 'auto' },
        { label: 'Horizontal', value: 'horizontal' },
        { label: 'Rectangle', value: 'rectangle' },
        { label: 'Vertical', value: 'vertical' },
      ],
      admin: {
        condition: (data) => data?.type === 'adsense',
      },
    },
    // Banner fields
    {
      name: 'bannerImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: (data) => data?.type === 'banner',
      },
    },
    {
      name: 'bannerImageAlt',
      type: 'text',
      admin: {
        condition: (data) => data?.type === 'banner',
      },
    },
    {
      name: 'bannerUrl',
      type: 'text',
      admin: {
        description: 'Ziel-URL des Banners',
        condition: (data) => data?.type === 'banner',
      },
    },
    {
      name: 'bannerAffiliate',
      type: 'relationship',
      relationTo: 'affiliate-links',
      admin: {
        description: 'Optionaler Affiliate-Link (ersetzt Banner-URL)',
        condition: (data) => data?.type === 'banner',
      },
    },
    // Custom HTML fields
    {
      name: 'customHtml',
      type: 'textarea',
      admin: {
        description: 'Eigener HTML-Code',
        condition: (data) => data?.type === 'custom',
      },
    },
  ],
}
