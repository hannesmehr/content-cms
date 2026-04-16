"use client";

import { useState } from "react";

type ObfuscatedEmailProps = {
  user: string;
  domain: string;
};

export function ObfuscatedEmail({ user, domain }: ObfuscatedEmailProps) {
  const [revealed, setRevealed] = useState(false);
  const email = `${user}@${domain}`;

  if (revealed) {
    return (
      <a
        href={`mailto:${email}`}
        className="text-primary-600 underline underline-offset-2 hover:text-primary-700"
      >
        {email}
      </a>
    );
  }

  return (
    <button
      onClick={() => setRevealed(true)}
      className="text-primary-600 underline underline-offset-2 hover:text-primary-700 cursor-pointer"
      title="Klicken um E-Mail-Adresse anzuzeigen"
    >
      {user}&#8203;(at)&#8203;{domain}
    </button>
  );
}
