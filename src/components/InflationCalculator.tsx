"use client";

import { useState } from "react";
import {
  futureValueWithInflation,
  inflationAdjustedFuture,
} from "@/lib/inflation";

export function InflationCalculator({
  defaultPresentValue,
  baseCurrency,
}: {
  defaultPresentValue: number;
  baseCurrency: string;
}) {
  const [presentValue, setPresentValue] = useState(String(defaultPresentValue));
  const [years, setYears] = useState(10);
  const [nominalRate, setNominalRate] = useState(7);
  const [inflationRate, setInflationRate] = useState(3);

  const pv = parseFloat(presentValue) || 0;
  const nominal = nominalRate / 100;
  const inflation = inflationRate / 100;

  const realFuture = futureValueWithInflation(pv, years, nominal, inflation);
  const samePurchasingPower = inflationAdjustedFuture(pv, years, inflation);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6">
        <h2 className="text-lg font-semibold text-white">Inputs</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-slate-400">Present value ({baseCurrency})</label>
            <input
              type="number"
              value={presentValue}
              onChange={(e) => setPresentValue(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400">Years</label>
            <input
              type="number"
              min={1}
              max={50}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400">Expected nominal return %</label>
            <input
              type="number"
              step="0.5"
              value={nominalRate}
              onChange={(e) => setNominalRate(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400">Inflation %</label>
            <input
              type="number"
              step="0.5"
              value={inflationRate}
              onChange={(e) => setInflationRate(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6">
          <h3 className="text-sm font-medium text-slate-400">Real (inflation-adjusted) value in {years} years</h3>
          <p className="mt-2 text-2xl font-bold text-emerald-400">
            {baseCurrency} {realFuture.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Assumes {nominalRate}% growth and {inflationRate}% inflation.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6">
          <h3 className="text-sm font-medium text-slate-400">Same purchasing power in {years} years</h3>
          <p className="mt-2 text-2xl font-bold text-sky-400">
            {baseCurrency} {samePurchasingPower.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Amount you’d need to have the same buying power as today.
          </p>
        </div>
      </div>
    </div>
  );
}
