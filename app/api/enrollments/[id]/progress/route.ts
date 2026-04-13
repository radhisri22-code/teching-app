import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { progress } = await req.json();
  const clamped = Math.max(0, Math.min(100, Math.round(progress)));

  const enrollment = await prisma.enrollment.updateMany({
    where: { id: params.id, userId: session.user.id },
    data: {
      progress: clamped,
      ...(clamped === 100 ? { completedAt: new Date() } : {}),
    },
  });

  return NextResponse.json({ updated: enrollment.count });
}
