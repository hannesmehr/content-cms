"use client";

import { Analytics } from "@vercel/analytics/next";

export function AnalyticsWrapper() {
  return (
    <Analytics
      beforeSend={(event) => {
        if (event.url.includes("/keystatic")) return null;
        return event;
      }}
    />
  );
}
