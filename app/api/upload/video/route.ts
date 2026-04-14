import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate file type
  const allowedTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/avi"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type. Allowed: mp4, webm, ogg, mov, avi" }, { status: 400 });
  }

  // Max 500 MB
  const maxSize = 500 * 1024 * 1024;
  if (file.size > maxSize) {
    return NextResponse.json({ error: "File too large. Max 500 MB." }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create uploads dir
  const uploadDir = join(process.cwd(), "public", "uploads", "videos");
  await mkdir(uploadDir, { recursive: true });

  const ext = file.name.split(".").pop() ?? "mp4";
  const filename = `${session.user.id}_${Date.now()}.${ext}`;
  const filePath = join(uploadDir, filename);

  await writeFile(filePath, buffer);

  const url = `/uploads/videos/${filename}`;
  return NextResponse.json({ url, filename, size: file.size });
}
