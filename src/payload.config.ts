import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import {
  lexicalEditor,
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
} from "@payloadcms/richtext-lexical";
import { AffiliateBoxBlock, FigureBlock, InlineAdBlock } from "./lexical/blocks";
import { AffiliateLinkInlineBlock, ObfuscatedEmailInlineBlock } from "./lexical/inlineBlocks";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import sharp from "sharp";

import { Sites } from "./collections/Sites";
import { Posts } from "./collections/Posts";
import { Categories } from "./collections/Categories";
import { Pages } from "./collections/Pages";
import { Tools } from "./collections/Tools";
import { AdConfigs } from "./collections/AdConfigs";
import { AffiliateLinks } from "./collections/AffiliateLinks";
import { Media } from "./collections/Media";
import { Users } from "./collections/Users";
import { Settings } from "./globals/Settings";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: " — Content CMS",
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },

  collections: [
    Users,
    Sites,
    Posts,
    Categories,
    Pages,
    Tools,
    AdConfigs,
    AffiliateLinks,
    Media,
  ],

  globals: [Settings],

  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      FixedToolbarFeature(),
      InlineToolbarFeature(),
      HeadingFeature({ enabledHeadingSizes: ["h2", "h3", "h4"] }),
      BlocksFeature({
        blocks: [AffiliateBoxBlock, FigureBlock, InlineAdBlock],
        inlineBlocks: [AffiliateLinkInlineBlock, ObfuscatedEmailInlineBlock],
      }),
    ],
  }),

  secret: process.env.PAYLOAD_SECRET || "CHANGE-ME-IN-PRODUCTION",

  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || "",
    },
  }),

  sharp,

  plugins: [
    vercelBlobStorage({
      enabled: !!process.env.BLOB_READ_WRITE_TOKEN,
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || "",
    }),
  ],
});
