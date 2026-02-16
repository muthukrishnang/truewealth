import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().default("USD"),
  goalId: z.string().optional().nullable(),
  notes: z.string().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const assets = await prisma.asset.findMany({
    where: { userId: session.user.id },
    include: { goal: true },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(assets);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(parsed.error.flatten(), { status: 400 });
  const asset = await prisma.asset.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      type: parsed.data.type,
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      goalId: parsed.data.goalId ?? undefined,
      notes: parsed.data.notes,
    },
    include: { goal: true },
  });
  return NextResponse.json(asset);
}
