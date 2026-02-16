import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toBase } from "@/lib/fx";
import Link from "next/link";
import { Wallet, Target, TrendingUp, ArrowRight } from "lucide-react";
import { SnapshotButton } from "@/components/SnapshotButton";
import { NetWorthChart } from "@/components/NetWorthChart";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const userId = session.user.id;
  const [user, assets, goals, snapshots] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { baseCurrency: true } }),
    prisma.asset.findMany({ where: { userId }, include: { goal: true } }),
    prisma.goal.findMany({ where: { userId } }),
    prisma.netWorthSnapshot.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      take: 30,
    }),
  ]);

  const baseCurrency = user?.baseCurrency ?? "USD";
  const totalAssets = assets.reduce(
    (sum, a) => sum + toBase(a.amount, a.currency, baseCurrency),
    0
  );
  const byGoal = goals.map((g) => {
    const goalAssets = assets.filter((a) => a.goalId === g.id);
    const value = goalAssets.reduce(
      (s, a) => s + toBase(a.amount, a.currency, baseCurrency),
      0
    );
    return { name: g.name, value, target: g.targetAmount, color: g.color };
  });
  const chartData = snapshots.map((s) => ({
    date: new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: s.totalValue,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-slate-400">Your net worth at a glance</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6">
        <div>
          <p className="text-sm font-medium text-slate-400">Total assets</p>
          <p className="mt-1 text-3xl font-bold text-white">
            {baseCurrency} {totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <SnapshotButton />
      </div>

      {chartData.length > 0 && (
        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6">
          <h2 className="text-lg font-semibold text-white">Net worth over time</h2>
          <NetWorthChart data={chartData} />
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Assets by goal</h2>
            <Link
              href="/dashboard/goals"
              className="text-sm font-medium text-sky-400 hover:text-sky-300"
            >
              View all
            </Link>
          </div>
          {byGoal.length === 0 ? (
            <p className="mt-4 text-slate-500">No goals yet. Tag assets to goals.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {byGoal.map((g) => (
                <li key={g.name} className="flex items-center justify-between">
                  <span className="text-slate-300">{g.name}</span>
                  <span className="font-medium text-white">
                    {baseCurrency} {g.value.toLocaleString(undefined, { maximumFractionDigits: 0 })} / {g.target.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Quick actions</h2>
          </div>
          <div className="mt-4 grid gap-3">
            <Link
              href="/dashboard/assets"
              className="flex items-center gap-3 rounded-xl border border-slate-600 bg-slate-800/50 p-4 transition hover:bg-slate-700/50"
            >
              <Wallet className="h-5 w-5 text-sky-400" />
              <span className="text-white">Add asset</span>
              <ArrowRight className="ml-auto h-4 w-4 text-slate-500" />
            </Link>
            <Link
              href="/dashboard/goals"
              className="flex items-center gap-3 rounded-xl border border-slate-600 bg-slate-800/50 p-4 transition hover:bg-slate-700/50"
            >
              <Target className="h-5 w-5 text-sky-400" />
              <span className="text-white">Create goal</span>
              <ArrowRight className="ml-auto h-4 w-4 text-slate-500" />
            </Link>
            <Link
              href="/dashboard/expenses"
              className="flex items-center gap-3 rounded-xl border border-slate-600 bg-slate-800/50 p-4 transition hover:bg-slate-700/50"
            >
              <TrendingUp className="h-5 w-5 text-sky-400" />
              <span className="text-white">Log expense</span>
              <ArrowRight className="ml-auto h-4 w-4 text-slate-500" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
