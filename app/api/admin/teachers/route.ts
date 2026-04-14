import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teachers = await prisma.user.findMany({
    where: { role: "TEACHER" },
    include: {
      teacherCourses: {
        include: {
          _count: { select: { enrollments: true } },
          payments: { where: { status: "COMPLETED" }, select: { amount: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    teachers.map((t) => ({
      ...t,
      totalCourses: t.teacherCourses.length,
      totalStudents: t.teacherCourses.reduce((s, c) => s + c._count.enrollments, 0),
      totalRevenue: t.teacherCourses.reduce(
        (s, c) => s + c.payments.reduce((ps, p) => ps + p.amount, 0),
        0
      ),
    }))
  );
}

// PATCH — change a user's role (promote/demote)
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId, role } = await req.json();
  const validRoles = ["STUDENT", "TEACHER", "ADMIN"];
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json(updated);
}
