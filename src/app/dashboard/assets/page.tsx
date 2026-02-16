import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toBase } from "@/lib/fx";
import { AssetsList } from "@/components/AssetsList";
import { AssetForm } from "@/components/AssetForm";

const ASSET_TYPES = [
  "stocks",
  "mutual_funds",
  "real_estate",
  "gold",
  "crypto",
  "epf",
  "bonds",
  "cash",
  "other",
];

export default async function AssetsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { baseCurrency: true },
  });
  const [assets, goals] = await Promise.all([
    prisma.asset.findMany({
      where: { userId: session.user.id },
      include: { goal: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.goal.findMany({ where: { userId: session.user.id }, orderBy: { name: "asc" } }),
  ]);
  const baseCurrency = user?.baseCurrency ?? "USD";
  const total = assets.reduce((s, a) => s + toBase(a.amount, a.currency, baseCurrency), 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Assets</h1>
          <p className="mt-1 text-slate-400">
            Total: {baseCurrency} {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <AssetForm goals={goals} assetTypes={ASSET_TYPES} />
      </div>
      <AssetsList assets={assets} goals={goals} baseCurrency={baseCurrency} assetTypes={ASSET_TYPES} />
    </div>
  );
}
