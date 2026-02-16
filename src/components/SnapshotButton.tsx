"use client";

import { useState } from "react";
import { Camera } from "lucide-react";

export function SnapshotButton() {
  const [loading, setLoading] = useState(false);

  async function takeSnapshot() {
    setLoading(true);
    try {
      const res = await fetch("/api/snapshots", { method: "POST" });
      if (res.ok) window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={takeSnapshot}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-50"
    >
      <Camera className="h-4 w-4" />
      {loading ? "Saving…" : "Take snapshot"}
    </button>
  );
}
