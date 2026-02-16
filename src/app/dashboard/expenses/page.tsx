import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ExpensesList } from "@/components/ExpensesList";
import { ExpenseForm } from "@/components/ExpenseForm";

const CATEGORIES = ["housing", "food", "transport", "health", "entertainment", "other"];

export default async function ExpensesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const expenses = await prisma.expense.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Expenses</h1>
          <p className="mt-1 text-slate-400">Track spending by category</p>
        </div>
        <ExpenseForm categories={CATEGORIES} />
      </div>
      <ExpensesList expenses={expenses} categories={CATEGORIES} />
    </div>
  );
}
