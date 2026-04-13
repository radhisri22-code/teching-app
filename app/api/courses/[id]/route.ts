import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  return NextResponse.json(course);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const course = await prisma.course.update({
    where: { id: params.id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.longDesc !== undefined && { longDesc: body.longDesc }),
      ...(body.price !== undefined && { price: parseFloat(body.price) }),
      ...(body.thumbnail !== undefined && { thumbnail: body.thumbnail }),
      ...(body.category !== undefined && { category: body.category }),
      ...(body.level !== undefined && { level: body.level }),
      ...(body.duration !== undefined && { duration: body.duration }),
      ...(body.instructor !== undefined && { instructor: body.instructor }),
      ...(body.published !== undefined && { published: body.published }),
    },
  });

  return NextResponse.json(course);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.course.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
