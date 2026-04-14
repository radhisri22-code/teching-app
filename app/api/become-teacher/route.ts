import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Already a teacher or admin" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { role: "TEACHER" },
  });

  return NextResponse.json({ success: true, role: "TEACHER" });
}
