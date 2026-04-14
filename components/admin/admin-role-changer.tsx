"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function AdminRoleChanger({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const promote = async (newRole: string) => {
    if (!confirm(`Change this user's role to ${newRole}?`)) return;
    setBusy(true);
    await fetch("/api/admin/teachers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: newRole }),
    });
    router.refresh();
    setBusy(false);
  };

  if (busy) {
    return <Loader2 className="w-4 h-4 animate-spin text-gray-400 mx-auto" />;
  }

  if (currentRole === "STUDENT") {
    return (
      <button
        onClick={() => promote("TEACHER")}
        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg hover:bg-emerald-100 transition-colors"
      >
        Make Teacher
      </button>
    );
  }

  if (currentRole === "TEACHER") {
    return (
      <div className="flex items-center justify-center gap-2">
        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
          Teacher
        </span>
        <button
          onClick={() => promote("STUDENT")}
          className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
        >
          Demote
        </button>
      </div>
    );
  }

  return (
    <span className="px-2.5 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full">
      {currentRole}
    </span>
  );
}
