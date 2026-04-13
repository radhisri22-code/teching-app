"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Trash2, Eye, EyeOff, Edit } from "lucide-react";

interface Props {
  courseId: string;
  published: boolean;
}

export function AdminCourseActions({ courseId, published }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const togglePublish = async () => {
    setLoading("publish");
    try {
      await fetch(`/api/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !published }),
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  };

  const deleteCourse = async () => {
    if (!confirm("Are you sure you want to delete this course? This cannot be undone.")) return;
    setLoading("delete");
    try {
      await fetch(`/api/courses/${courseId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={togglePublish}
        disabled={loading !== null}
        title={published ? "Unpublish" : "Publish"}
        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-40"
      >
        {loading === "publish" ? (
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        ) : published ? (
          <EyeOff className="w-4 h-4" />
        ) : (
          <Eye className="w-4 h-4" />
        )}
      </button>
      <button
        onClick={deleteCourse}
        disabled={loading !== null}
        title="Delete course"
        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
      >
        {loading === "delete" ? (
          <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
