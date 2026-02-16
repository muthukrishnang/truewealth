import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toBase } from "@/lib/fx";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { baseCurrency: true },
  });
  const baseCurrency = user?.baseCurrency ?? "USD";
  const assets = await prisma.asset.findMany({
    where: { userId: session.user.id },
  });
  const totalValue = assets.reduce(
    (sum, a) => sum + toBase(a.amount, a.currency, baseCurrency),
    0
  );
  const assetBreakdown: Record<string, number> = {};
  for (const a of assets) {
    assetBreakdown[a.id] = toBase(a.amount, a.currency, baseCurrency);
  }
  const snapshot = await prisma.netWorthSnapshot.create({
    data: {
      userId: session.user.id,
      totalValue,
      currency: baseCurrency,
      assetBreakdown: JSON.stringify(assetBreakdown),
    },
  });
  return NextResponse.json(snapshot);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const snapshots = await prisma.netWorthSnapshot.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(snapshots);
}
