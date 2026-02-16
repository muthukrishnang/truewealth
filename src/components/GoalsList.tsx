"use client";

import { Trash2 } from "lucide-react";
import { format } from "date-fns";

type GoalWithProgress = {
  id: string;
  name: string;
  targetAmount: number;
  currency: string;
  targetDate: Date | null;
  color: string;
  currentValue: number;
  progress: number;
};

export function GoalsList({
  goals,
  baseCurrency,
}: {
  goals: GoalWithProgress[];
  baseCurrency: string;
}) {
  async function remove(id: string) {
    if (!confirm("Delete this goal? Assets will be untagged.")) return;
    await fetch(`/api/goals/${id}`, { method: "DELETE" });
    window.location.reload();
  }

  if (goals.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-8 text-center text-slate-500">
        No goals yet. Create one and tag assets to it.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {goals.map((g) => (
        <div
          key={g.id}
          className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: g.color }}
              />
              <h3 className="font-semibold text-white">{g.name}</h3>
            </div>
            <button
              type="button"
              onClick={() => remove(g.id)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-700 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-slate-400">
            {baseCurrency} {g.currentValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} / {g.targetAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${g.progress}%`, backgroundColor: g.color }}
            />
          </div>
          {g.targetDate && (
            <p className="mt-2 text-sm text-slate-500">
              Target: {format(new Date(g.targetDate), "MMM d, yyyy")}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
