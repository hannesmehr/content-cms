import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const BLOB_BASE_URL = process.env.BLOB_BASE_URL || "";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  async rewrites() {
    const rules: { source: string; destination: string }[] = [];

    // /media/* → Vercel Blob Storage
    if (BLOB_BASE_URL) {
      rules.push({
        source: "/media/:path*",
        destination: `${BLOB_BASE_URL}/:path*`,
      });
      // /og/* → Blob (OG images)
      rules.push({
        source: "/og/:path*",
        destination: `${BLOB_BASE_URL}/og/:path*`,
      });
    }

    return { beforeFiles: rules, afterFiles: [], fallback: [] };
  },
};

export default withPayload(nextConfig);
