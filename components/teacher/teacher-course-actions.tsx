"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2, Eye, EyeOff } from "lucide-react";

export function TeacherCourseActions({
  courseId,
  published,
}: {
  courseId: string;
  published: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  const togglePublish = async () => {
    setBusy("publish");
    await fetch(`/api/teacher/courses/${courseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    router.refresh();
    setBusy(null);
  };

  const deleteCourse = async () => {
    if (!confirm("Delete this course? This cannot be undone.")) return;
    setBusy("delete");
    await fetch(`/api/teacher/courses/${courseId}`, { method: "DELETE" });
    router.refresh();
    setBusy(null);
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={togglePublish}
        disabled={busy !== null}
        title={published ? "Unpublish" : "Publish"}
        className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-40"
      >
        {busy === "publish" ? (
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        ) : published ? (
          <EyeOff className="w-4 h-4" />
        ) : (
          <Eye className="w-4 h-4" />
        )}
      </button>
      <button
        onClick={deleteCourse}
        disabled={busy !== null}
        title="Delete"
        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
      >
        {busy === "delete" ? (
          <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
