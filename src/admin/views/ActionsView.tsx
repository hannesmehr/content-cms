"use client";

import React from "react";
import ActionButton from "../components/ActionButton";
import TrackingExclude from "../components/TrackingExclude";

const ActionsView: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>Aktionen</h2>

      <div style={{ display: "grid", gap: "16px", maxWidth: "600px" }}>
        {/* Tracking Exclusion */}
        <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "20px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>Umami Tracking-Ausschluss</h3>
          <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>
            Eigene Besuche vom Analytics-Tracking ausschließen.
          </p>
          <TrackingExclude />
        </div>

        {/* Score Update */}
        <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "20px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>Score Update + IndexNow</h3>
          <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>
            Berechnet Scores für alle Artikel und pingt IndexNow.
          </p>
          <ActionButton
            label="Score Update starten"
            endpoint="/api/cron/update-scores"
            method="GET"
            cronSecret=""
          />
        </div>
      </div>
    </div>
  );
};

export default ActionsView;
