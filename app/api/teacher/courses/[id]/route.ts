import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function verifyOwner(courseId: string, userId: string) {
  const course = await prisma.course.findFirst({
    where: { id: courseId, teacherId: userId },
  });
  return course;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const course = await prisma.course.findFirst({
    where: { id: params.id, teacherId: session.user.id },
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: {
          lessons: { orderBy: { order: "asc" } },
        },
      },
      _count: { select: { enrollments: true } },
      payments: { where: { status: "COMPLETED" }, select: { amount: true } },
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
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const course = await verifyOwner(params.id, session.user.id);
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();

  const updated = await prisma.course.update({
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
      ...(body.published !== undefined && { published: body.published }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const course = await verifyOwner(params.id, session.user.id);
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.course.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
