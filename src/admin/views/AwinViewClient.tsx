"use client";

import React from "react";
import AwinWidget from "../components/AwinWidget";
import AwinLinkBuilder from "../components/AwinLinkBuilder";

const AwinViewClient: React.FC = () => {
  return (
    <div style={{ display: "grid", gap: "20px", gridTemplateColumns: "1fr 1fr" }}>
      <AwinWidget />
      <AwinLinkBuilder />
    </div>
  );
};

export default AwinViewClient;
