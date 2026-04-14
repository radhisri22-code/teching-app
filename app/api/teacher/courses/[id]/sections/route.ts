import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST — add a section to the course
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify ownership
  const course = await prisma.course.findFirst({
    where: { id: params.id, teacherId: session.user.id },
  });
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();

  // Get max order
  const last = await prisma.courseSection.findFirst({
    where: { courseId: params.id },
    orderBy: { order: "desc" },
  });

  const section = await prisma.courseSection.create({
    data: {
      courseId: params.id,
      title: body.title,
      order: (last?.order ?? -1) + 1,
    },
    include: { lessons: true },
  });

  return NextResponse.json(section, { status: 201 });
}

// PATCH — reorder sections
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const course = await prisma.course.findFirst({
    where: { id: params.id, teacherId: session.user.id },
  });
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { orders } = await req.json(); // [{ id, order }]
  await Promise.all(
    orders.map(({ id, order }: { id: string; order: number }) =>
      prisma.courseSection.update({ where: { id }, data: { order } })
    )
  );

  return NextResponse.json({ success: true });
}
