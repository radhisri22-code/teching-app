import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const courses = await prisma.course.findMany({
    where: { teacherId: session.user.id },
    include: {
      _count: { select: { enrollments: true } },
      payments: { where: { status: "COMPLETED" }, select: { amount: true } },
      sections: { include: { _count: { select: { lessons: true } } } },
    },
  });

  const totalCourses = courses.length;
  const publishedCourses = courses.filter((c) => c.published).length;
  const totalStudents = courses.reduce((sum, c) => sum + c._count.enrollments, 0);
  const totalRevenue = courses.reduce(
    (sum, c) => sum + c.payments.reduce((ps, p) => ps + p.amount, 0),
    0
  );
  const totalLessons = courses.reduce(
    (sum, c) => sum + c.sections.reduce((ss, s) => ss + s._count.lessons, 0),
    0
  );

  return NextResponse.json({
    totalCourses,
    publishedCourses,
    totalStudents,
    totalRevenue,
    totalLessons,
    courses,
  });
}
