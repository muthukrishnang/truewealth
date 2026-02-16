import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  targetAmount: z.number().positive().optional(),
  currency: z.string().optional(),
  targetDate: z.string().datetime().optional().nullable(),
  color: z.string().optional(),
});

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await _req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(parsed.error.flatten(), { status: 400 });
  const goal = await prisma.goal.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!goal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const updated = await prisma.goal.update({
    where: { id },
    data: {
      ...(parsed.data.name != null && { name: parsed.data.name }),
      ...(parsed.data.targetAmount != null && { targetAmount: parsed.data.targetAmount }),
      ...(parsed.data.currency != null && { currency: parsed.data.currency }),
      ...(parsed.data.targetDate !== undefined && {
        targetDate: parsed.data.targetDate ? new Date(parsed.data.targetDate) : null,
      }),
      ...(parsed.data.color != null && { color: parsed.data.color }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const goal = await prisma.goal.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!goal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.asset.updateMany({ where: { goalId: id }, data: { goalId: null } });
  await prisma.goal.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
