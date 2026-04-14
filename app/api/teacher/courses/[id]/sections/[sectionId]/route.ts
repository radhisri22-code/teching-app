import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function verifyAccess(courseId: string, sectionId: string, userId: string) {
  const section = await prisma.courseSection.findFirst({
    where: { id: sectionId, courseId, course: { teacherId: userId } },
  });
  return section;
}

// PATCH — rename section
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; sectionId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const section = await verifyAccess(params.id, params.sectionId, session.user.id);
  if (!section) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { title } = await req.json();
  const updated = await prisma.courseSection.update({
    where: { id: params.sectionId },
    data: { title },
  });

  return NextResponse.json(updated);
}

// DELETE — remove section + all its lessons
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; sectionId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const section = await verifyAccess(params.id, params.sectionId, session.user.id);
  if (!section) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.courseSection.delete({ where: { id: params.sectionId } });
  return NextResponse.json({ success: true });
}
