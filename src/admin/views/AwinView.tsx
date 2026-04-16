"use client";

import React from "react";
import AwinWidget from "../components/AwinWidget";
import AwinLinkBuilder from "../components/AwinLinkBuilder";

const AwinView: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "grid", gap: "20px", gridTemplateColumns: "1fr 1fr" }}>
        <AwinWidget />
        <AwinLinkBuilder />
      </div>
    </div>
  );
};

export default AwinView;
