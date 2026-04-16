"use client";

import React from "react";
import { useConfig } from "@payloadcms/ui";

const navItems = [
  { label: "Media Browser", href: "/admin/media-browser", icon: "🖼️" },
  { label: "Awin Affiliate", href: "/admin/awin", icon: "💰" },
  { label: "Aktionen", href: "/admin/actions", icon: "⚡" },
];

const AdminNavLinks: React.FC = () => {
  return (
    <div style={{ borderTop: "1px solid var(--theme-elevation-150)", paddingTop: "12px", marginTop: "4px" }}>
      <div style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", color: "var(--theme-elevation-500)", padding: "4px 16px", letterSpacing: "0.05em" }}>
        Dashboard
      </div>
      {navItems.map((item) => (
        <a
          key={item.href}
          href={item.href}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            fontSize: "13px",
            color: "var(--theme-elevation-800)",
            textDecoration: "none",
            borderRadius: "4px",
          }}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </a>
      ))}
    </div>
  );
};

export default AdminNavLinks;
