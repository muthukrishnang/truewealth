"use client";

import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import type { Expense } from "@prisma/client";

export function ExpensesList({
  expenses,
  categories,
}: {
  expenses: Expense[];
  categories: string[];
}) {
  async function remove(id: string) {
    if (!confirm("Delete this expense?")) return;
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    window.location.reload();
  }

  const byCategory = categories.map((cat) => ({
    name: cat,
    total: expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0),
  })).filter((c) => c.total > 0);

  if (expenses.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-8 text-center text-slate-500">
        No expenses yet. Log one to track spending.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {byCategory.length > 0 && (
        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6">
          <h2 className="text-lg font-semibold text-white">By category</h2>
          <ul className="mt-4 space-y-2">
            {byCategory.map((c) => (
              <li key={c.name} className="flex justify-between text-slate-300">
                <span className="capitalize">{c.name}</span>
                <span>{c.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 overflow-hidden">
        <h2 className="px-6 py-4 text-lg font-semibold text-white">Recent</h2>
        <ul className="divide-y divide-slate-700/50">
          {expenses.map((e) => (
            <li key={e.id} className="flex items-center justify-between px-6 py-3">
              <div>
                <p className="font-medium text-white">{e.description}</p>
                <p className="text-sm text-slate-400">
                  {format(new Date(e.date), "MMM d, yyyy")} · {e.category}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white">
                  {e.currency} {e.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
                <button
                  type="button"
                  onClick={() => remove(e.id)}
                  className="rounded-lg p-1 text-slate-400 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
