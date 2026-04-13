import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: {
      _count: { select: { enrollments: true, payments: true } },
      payments: {
        where: { status: "COMPLETED" },
        select: { amount: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    students.map((s) => ({
      ...s,
      totalSpent: s.payments.reduce((sum, p) => sum + p.amount, 0),
    }))
  );
}
