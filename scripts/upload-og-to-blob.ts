/**
 * Upload OG images to Vercel Blob.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { put } from "@vercel/blob";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OG_DIR = path.resolve(__dirname, "../public/og");

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("BLOB_READ_WRITE_TOKEN not set");
    process.exit(1);
  }

  const files = fs.readdirSync(OG_DIR).filter((f) => f.endsWith(".jpg"));
  for (const f of files) {
    const buffer = fs.readFileSync(path.join(OG_DIR, f));
    const blob = await put(`og/${f}`, buffer, {
      access: "public",
      contentType: "image/jpeg",
      addRandomSuffix: false,
    });
    console.log(`✓ og/${f} → ${blob.url}`);
  }

  console.log(`\n${files.length} OG images uploaded`);
}

main().catch(console.error);
