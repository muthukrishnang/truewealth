import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  currency: z.string().optional(),
  goalId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
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
  const asset = await prisma.asset.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const updated = await prisma.asset.update({
    where: { id },
    data: {
      ...(parsed.data.name != null && { name: parsed.data.name }),
      ...(parsed.data.type != null && { type: parsed.data.type }),
      ...(parsed.data.amount != null && { amount: parsed.data.amount }),
      ...(parsed.data.currency != null && { currency: parsed.data.currency }),
      ...(parsed.data.goalId !== undefined && { goalId: parsed.data.goalId }),
      ...(parsed.data.notes !== undefined && { notes: parsed.data.notes }),
    },
    include: { goal: true },
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
  const asset = await prisma.asset.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.asset.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
