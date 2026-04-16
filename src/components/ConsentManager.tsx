"use client";

import { useEffect } from "react";

type ConsentManagerProps = {
  siteName: string;
  adsenseClientId?: string;
};

/**
 * Loads the AdSense script if a client ID is configured.
 * Consent is handled by Google's own CMP (Privacy & Messaging),
 * which is configured in the AdSense dashboard and delivered
 * automatically via the AdSense script tag.
 */
export function ConsentManager({ adsenseClientId }: ConsentManagerProps) {
  useEffect(() => {
    if (!adsenseClientId) return;
    loadAdSenseScript(adsenseClientId);
  }, [adsenseClientId]);

  return null;
}

function loadAdSenseScript(clientId: string) {
  if (document.getElementById("adsense-script")) return;

  const script = document.createElement("script");
  script.id = "adsense-script";
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
  script.async = true;
  script.crossOrigin = "anonymous";
  document.head.appendChild(script);
}
