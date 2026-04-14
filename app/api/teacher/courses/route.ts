import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET — teacher's own courses
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const courses = await prisma.course.findMany({
    where: { teacherId: session.user.id },
    include: {
      _count: { select: { enrollments: true, sections: true } },
      sections: { include: { _count: { select: { lessons: true } } } },
      payments: { where: { status: "COMPLETED" }, select: { amount: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(courses);
}

// POST — create a new course
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const course = await prisma.course.create({
    data: {
      title: body.title,
      description: body.description,
      longDesc: body.longDesc ?? "",
      price: parseFloat(body.price) || 0,
      thumbnail: body.thumbnail ?? "",
      category: body.category,
      level: body.level ?? "BEGINNER",
      duration: body.duration ?? "",
      instructor: session.user.name ?? "Instructor",
      teacherId: session.user.id,
      published: false, // Drafts by default
    },
  });

  return NextResponse.json(course, { status: 201 });
}
