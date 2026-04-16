"use client";

import { useState } from "react";

type ActionButtonProps = {
  label: string;
  endpoint: string;
  method?: "GET" | "POST";
  cronSecret?: string;
};

export default function ActionButton({
  label,
  endpoint,
  method = "GET",
  cronSecret,
}: ActionButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  async function handleClick() {
    setState("loading");
    setMessage("");
    try {
      const headers: Record<string, string> = {};
      if (cronSecret) {
        headers["Authorization"] = `Bearer ${cronSecret}`;
      }
      const res = await fetch(endpoint, { method, headers });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        setState("success");
        setMessage(
          data?.ok
            ? `Erfolgreich (${Object.keys(data.sites || {}).length} Sites)`
            : "Erfolgreich"
        );
      } else {
        setState("error");
        setMessage(data?.error || `Fehler ${res.status}`);
      }
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Netzwerkfehler");
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleClick}
        disabled={state === "loading"}
        className={`
          inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium
          transition-colors disabled:opacity-60 disabled:cursor-not-allowed
          ${
            state === "loading"
              ? "bg-gray-200 text-gray-500"
              : "bg-slate-800 text-white hover:bg-slate-700"
          }
        `}
      >
        {state === "loading" && (
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {label}
      </button>
      {state === "success" && (
        <span className="text-sm text-green-600 font-medium">{message}</span>
      )}
      {state === "error" && (
        <span className="text-sm text-red-600 font-medium">{message}</span>
      )}
    </div>
  );
}
