import type { GlobalConfig } from 'payload'

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Einstellungen',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'defaultSite',
      type: 'relationship',
      relationTo: 'sites',
      required: true,
      admin: {
        description: 'Standard-Site (wird verwendet wenn keine Site angegeben ist)',
      },
    },
  ],
}
