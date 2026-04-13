import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [
    totalStudents,
    totalCourses,
    totalEnrollments,
    payments,
    recentStudents,
    recentPayments,
    courseStats,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.course.count({ where: { published: true } }),
    prisma.enrollment.count(),
    prisma.payment.findMany({ where: { status: "COMPLETED" } }),
    prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, image: true, createdAt: true },
    }),
    prisma.payment.findMany({
      where: { status: "COMPLETED" },
      include: { user: { select: { name: true, email: true } }, course: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.course.findMany({
      where: { published: true },
      include: { _count: { select: { enrollments: true } } },
      orderBy: { enrollments: { _count: "desc" } },
      take: 5,
    }),
  ]);

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

  return NextResponse.json({
    totalStudents,
    totalCourses,
    totalEnrollments,
    totalRevenue,
    recentStudents,
    recentPayments,
    courseStats,
  });
}
