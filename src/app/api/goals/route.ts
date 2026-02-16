import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  targetAmount: z.number().positive(),
  currency: z.string().default("USD"),
  targetDate: z.string().datetime().optional(),
  color: z.string().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const goals = await prisma.goal.findMany({
    where: { userId: session.user.id },
    include: { assets: true },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(goals);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(parsed.error.flatten(), { status: 400 });
  const goal = await prisma.goal.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      targetAmount: parsed.data.targetAmount,
      currency: parsed.data.currency,
      targetDate: parsed.data.targetDate ? new Date(parsed.data.targetDate) : undefined,
      color: parsed.data.color,
    },
  });
  return NextResponse.json(goal);
}
