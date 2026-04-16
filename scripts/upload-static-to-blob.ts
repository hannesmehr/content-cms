/**
 * Upload static images (heroes, logos) to Vercel Blob storage.
 * Then they can be served via /media/ rewrite instead of from public/.
 *
 * Usage: npx tsx scripts/upload-static-to-blob.ts
 * Requires: BLOB_READ_WRITE_TOKEN in .env
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { put } from "@vercel/blob";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.resolve(__dirname, "../public/images");

async function uploadFile(filePath: string, blobPath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".webp": "image/webp",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".svg": "image/svg+xml",
  };

  const blob = await put(blobPath, buffer, {
    access: "public",
    contentType: mimeTypes[ext] || "application/octet-stream",
    addRandomSuffix: false,
  });

  return blob.url;
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("BLOB_READ_WRITE_TOKEN not set");
    process.exit(1);
  }

  const files: { localPath: string; blobPath: string }[] = [];

  // Walk public/images recursively
  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else {
        const relativePath = path.relative(PUBLIC_DIR, fullPath);
        files.push({
          localPath: fullPath,
          blobPath: `images/${relativePath}`,
        });
      }
    }
  }

  walk(PUBLIC_DIR);
  console.log(`Found ${files.length} files to upload\n`);

  let uploaded = 0;
  for (const file of files) {
    try {
      const url = await uploadFile(file.localPath, file.blobPath);
      console.log(`✓ ${file.blobPath} → ${url}`);
      uploaded++;
    } catch (err) {
      console.log(`✗ ${file.blobPath}: ${(err as Error).message}`);
    }
  }

  console.log(`\n${uploaded}/${files.length} uploaded`);
  if (uploaded === files.length) {
    console.log("\nAll images on Blob. You can now delete public/images/ and use /media/ paths.");
  }
}

main().catch(console.error);
