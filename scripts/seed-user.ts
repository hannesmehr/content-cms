// Seed the first admin user via Payload Local API
// Usage: npx tsx scripts/seed-user.ts

import { getPayload } from "payload";
import config from "../src/payload.config";

async function seed() {
  const payload = await getPayload({ config });

  // Check if any users exist
  const existing = await payload.find({ collection: "users", limit: 1 });
  if (existing.totalDocs > 0) {
    console.log("User already exists, skipping.");
    process.exit(0);
  }

  const user = await payload.create({
    collection: "users",
    data: {
      email: "hannes@infected.de",
      password: "admin2026!",
    },
  });

  console.log(`Created admin user: ${user.email} (ID: ${user.id})`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
