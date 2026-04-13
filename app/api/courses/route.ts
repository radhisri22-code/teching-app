import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const level = searchParams.get("level");

  const courses = await prisma.course.findMany({
    where: {
      published: true,
      ...(category ? { category } : {}),
      ...(level ? { level: level as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { description: { contains: search } },
              { instructor: { contains: search } },
            ],
          }
        : {}),
    },
    include: {
      _count: { select: { enrollments: true } },
    },
    orderBy: { totalRatings: "desc" },
  });

  return NextResponse.json(courses);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const course = await prisma.course.create({
    data: {
      title: body.title,
      description: body.description,
      longDesc: body.longDesc,
      price: parseFloat(body.price) || 0,
      thumbnail: body.thumbnail,
      category: body.category,
      level: body.level ?? "BEGINNER",
      duration: body.duration,
      instructor: body.instructor,
      published: body.published ?? true,
    },
  });

  return NextResponse.json(course, { status: 201 });
}
