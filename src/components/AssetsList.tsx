"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { Asset, Goal } from "@prisma/client";

type AssetWithGoal = Asset & { goal: Goal | null };

export function AssetsList({
  assets,
  goals,
  baseCurrency,
  assetTypes,
}: {
  assets: AssetWithGoal[];
  goals: Goal[];
  baseCurrency: string;
  assetTypes: string[];
}) {
  const [editing, setEditing] = useState<string | null>(null);

  async function remove(id: string) {
    if (!confirm("Delete this asset?")) return;
    await fetch(`/api/assets/${id}`, { method: "DELETE" });
    window.location.reload();
  }

  if (assets.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-8 text-center text-slate-500">
        No assets yet. Add one to get started.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 overflow-hidden">
      <ul className="divide-y divide-slate-700/50">
        {assets.map((a) => (
          <li key={a.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
            <div>
              <p className="font-medium text-white">{a.name}</p>
              <p className="text-sm text-slate-400">
                {a.type.replace(/_/g, " ")} · {a.currency} {a.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                {a.goal && (
                  <span
                    className="ml-2 rounded-full bg-slate-700 px-2 py-0.5 text-xs"
                    style={{ borderLeftColor: a.goal.color, borderLeftWidth: 3, borderLeftStyle: "solid" }}
                  >
                    {a.goal.name}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditing(editing === a.id ? null : a.id)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white"
                aria-label="Edit asset"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => remove(a.id)}
                className="rounded-lg p-2 text-slate-400 hover:bg-red-900/50 hover:text-red-400"
                aria-label="Delete asset"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            {editing === a.id && (
              <AssetEditRow
                asset={a}
                goals={goals}
                assetTypes={assetTypes}
                onClose={() => setEditing(null)}
                onSaved={() => {
                  setEditing(null);
                  window.location.reload();
                }}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function AssetEditRow({
  asset,
  goals,
  assetTypes,
  onClose,
  onSaved,
}: {
  asset: AssetWithGoal;
  goals: Goal[];
  assetTypes: string[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(asset.name);
  const [type, setType] = useState(asset.type);
  const [amount, setAmount] = useState(String(asset.amount));
  const [currency, setCurrency] = useState(asset.currency);
  const [goalId, setGoalId] = useState(asset.goalId ?? "");
  const [notes, setNotes] = useState(asset.notes ?? "");
  const [loading, setLoading] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!name.trim() || isNaN(num) || num <= 0) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/assets/${asset.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          type,
          amount: num,
          currency,
          goalId: goalId || null,
          notes: notes.trim() || null,
        }),
      });
      if (res.ok) onSaved();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full border-t border-slate-700/50 pt-4 mt-2">
      <form onSubmit={save} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <label className="sr-only">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white"
          placeholder="Name"
          aria-label="Asset name"
        />
        <label className="sr-only">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white"
          aria-label="Asset type"
        >
          {assetTypes.map((t) => (
            <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
          ))}
        </select>
        <label className="sr-only">Amount</label>
        <input
          type="number"
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white"
          aria-label="Amount"
        />
        <label className="sr-only">Goal</label>
        <select
          value={goalId}
          onChange={(e) => setGoalId(e.target.value)}
          className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white"
          aria-label="Tag to goal"
        >
          <option value="">No goal</option>
          {goals.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="rounded-lg bg-sky-500 px-3 py-2 text-sm text-white hover:bg-sky-600 disabled:opacity-50">
            Save
          </button>
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-400">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
