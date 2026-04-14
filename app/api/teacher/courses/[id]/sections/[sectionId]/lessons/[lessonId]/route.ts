import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function verifyLesson(lessonId: string, sectionId: string, courseId: string, userId: string) {
  return prisma.lesson.findFirst({
    where: {
      id: lessonId,
      sectionId,
      section: { courseId, course: { teacherId: userId } },
    },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; sectionId: string; lessonId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lesson = await verifyLesson(params.lessonId, params.sectionId, params.id, session.user.id);
  if (!lesson) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const updated = await prisma.lesson.update({
    where: { id: params.lessonId },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.videoUrl !== undefined && { videoUrl: body.videoUrl }),
      ...(body.videoType !== undefined && { videoType: body.videoType }),
      ...(body.duration !== undefined && { duration: body.duration }),
      ...(body.isFree !== undefined && { isFree: body.isFree }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; sectionId: string; lessonId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lesson = await verifyLesson(params.lessonId, params.sectionId, params.id, session.user.id);
  if (!lesson) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.lesson.delete({ where: { id: params.lessonId } });
  return NextResponse.json({ success: true });
}
