import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toBase } from "@/lib/fx";
import { InflationCalculator } from "@/components/InflationCalculator";

export default async function InflationPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { baseCurrency: true },
  });
  const assets = await prisma.asset.findMany({
    where: { userId: session.user.id },
  });
  const baseCurrency = user?.baseCurrency ?? "USD";
  const totalAssets = assets.reduce(
    (s, a) => s + toBase(a.amount, a.currency, baseCurrency),
    0
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Inflation & projections</h1>
        <p className="mt-1 text-slate-400">
          See how your current wealth ({baseCurrency} {totalAssets.toLocaleString(undefined, { maximumFractionDigits: 0 })}) may grow in real terms.
        </p>
      </div>
      <InflationCalculator defaultPresentValue={totalAssets} baseCurrency={baseCurrency} />
    </div>
  );
}
