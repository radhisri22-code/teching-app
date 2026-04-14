import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TeacherSidebar } from "@/components/teacher/teacher-sidebar";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "TEACHER") redirect("/become-teacher");

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <TeacherSidebar user={session.user} />
      <main className="flex-1 p-8 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
