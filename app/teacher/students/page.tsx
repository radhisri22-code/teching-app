import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Users, BookOpen, Mail, Calendar, TrendingUp } from "lucide-react";

export default async function TeacherStudentsPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  // Get all enrollments in this teacher's courses
  const enrollments = await prisma.enrollment.findMany({
    where: { course: { teacherId: session.user.id } },
    include: {
      user: { select: { id: true, name: true, email: true, image: true, createdAt: true } },
      course: { select: { id: true, title: true, price: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Aggregate per student
  const studentMap = new Map<
    string,
    {
      user: (typeof enrollments)[0]["user"];
      courses: { title: string; progress: number; enrolledAt: Date }[];
    }
  >();

  for (const e of enrollments) {
    const existing = studentMap.get(e.userId);
    const entry = { title: e.course.title, progress: e.progress, enrolledAt: e.createdAt };
    if (existing) {
      existing.courses.push(entry);
    } else {
      studentMap.set(e.userId, { user: e.user, courses: [entry] });
    }
  }

  const students = Array.from(studentMap.values());
  const totalEnrollments = enrollments.length;
  const avgProgress =
    enrollments.length > 0
      ? Math.round(enrollments.reduce((s, e) => s + e.progress, 0) / enrollments.length)
      : 0;
  const completions = enrollments.filter((e) => e.progress === 100).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">My Students</h1>
        <p className="text-gray-500">{students.length} unique students across all your courses</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Students", value: students.length, icon: <Users className="w-5 h-5 text-blue-600" />, bg: "bg-blue-50" },
          { label: "Total Enrollments", value: totalEnrollments, icon: <BookOpen className="w-5 h-5 text-purple-600" />, bg: "bg-purple-50" },
          { label: "Avg. Progress", value: `${avgProgress}%`, icon: <TrendingUp className="w-5 h-5 text-emerald-600" />, bg: "bg-emerald-50" },
          { label: "Completions", value: completions, icon: <TrendingUp className="w-5 h-5 text-yellow-600" />, bg: "bg-yellow-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>{s.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {students.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Users className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No students yet</h3>
          <p className="text-gray-400 text-sm">Publish a course to start attracting students.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">Student</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-4">Courses Enrolled</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-4">Latest Course</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-4">Joined</th>
              </tr>
            </thead>
            <tbody>
              {students.map(({ user, courses }) => (
                <tr key={user.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center flex-shrink-0">
                        {user.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={user.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-primary-700 text-xs font-semibold">{user.name?.[0] ?? "U"}</span>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name ?? "—"}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Mail className="w-3 h-3" />{user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="flex items-center gap-1.5 text-sm text-gray-700">
                      <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                      {courses.length}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-800 max-w-xs truncate">{courses[0]?.title}</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${courses[0]?.progress ?? 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">{courses[0]?.progress ?? 0}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {new Date(user.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
