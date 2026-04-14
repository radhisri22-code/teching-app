import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST — create a lesson inside a section
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; sectionId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify ownership
  const section = await prisma.courseSection.findFirst({
    where: { id: params.sectionId, courseId: params.id, course: { teacherId: session.user.id } },
  });
  if (!section) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();

  const last = await prisma.lesson.findFirst({
    where: { sectionId: params.sectionId },
    orderBy: { order: "desc" },
  });

  const lesson = await prisma.lesson.create({
    data: {
      sectionId: params.sectionId,
      title: body.title,
      description: body.description ?? "",
      videoUrl: body.videoUrl ?? "",
      videoType: body.videoType ?? "URL",
      duration: body.duration ?? "",
      isFree: body.isFree ?? false,
      order: (last?.order ?? -1) + 1,
    },
  });

  return NextResponse.json(lesson, { status: 201 });
}
