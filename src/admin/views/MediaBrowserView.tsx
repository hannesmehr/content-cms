"use client";

import React, { useEffect, useState } from "react";
import MediaBrowser from "../components/MediaBrowser";

type SiteOption = { slug: string; domain: string };

const MediaBrowserView: React.FC = () => {
  const [sites, setSites] = useState<SiteOption[]>([]);

  useEffect(() => {
    fetch("/api/sites?limit=100&depth=0")
      .then((r) => r.json())
      .then((d) => {
        const docs = d.docs || [];
        setSites(docs.map((s: { slug: string; domain: string }) => ({
          slug: s.slug,
          domain: s.domain,
        })));
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <MediaBrowser sites={sites} />
    </div>
  );
};

export default MediaBrowserView;
