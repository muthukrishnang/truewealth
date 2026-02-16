import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toBase } from "@/lib/fx";
import { GoalsList } from "@/components/GoalsList";
import { GoalForm } from "@/components/GoalForm";

export default async function GoalsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { baseCurrency: true },
  });
  const goals = await prisma.goal.findMany({
    where: { userId: session.user.id },
    include: { assets: true },
    orderBy: { name: "asc" },
  });
  const baseCurrency = user?.baseCurrency ?? "USD";
  const goalsWithProgress = goals.map((g) => {
    const current = g.assets.reduce(
      (s, a) => s + toBase(a.amount, a.currency, baseCurrency),
      0
    );
    return {
      ...g,
      currentValue: current,
      progress: g.targetAmount > 0 ? Math.min(100, (current / g.targetAmount) * 100) : 0,
    };
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Goals</h1>
          <p className="mt-1 text-slate-400">Tag assets to goals and track progress</p>
        </div>
        <GoalForm />
      </div>
      <GoalsList goals={goalsWithProgress} baseCurrency={baseCurrency} />
    </div>
  );
}
