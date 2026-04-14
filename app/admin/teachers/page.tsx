import { prisma } from "@/lib/db";
import { Video, Users, IndianRupee, BookOpen, Mail, Calendar } from "lucide-react";
import { AdminRoleChanger } from "@/components/admin/admin-role-changer";

export default async function AdminTeachersPage() {
  const teachers = await prisma.user.findMany({
    where: { role: "TEACHER" },
    include: {
      teacherCourses: {
        select: {
          id: true, title: true, published: true,
          _count: { select: { enrollments: true } },
          payments: { where: { status: "COMPLETED" }, select: { amount: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Also show students who could be promoted
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: { id: true, name: true, email: true, image: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Teachers</h1>
        <p className="text-gray-500">{teachers.length} registered instructors</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Teachers", value: teachers.length, icon: <Video className="w-5 h-5 text-emerald-600" />, bg: "bg-emerald-50" },
          {
            label: "Total Courses",
            value: teachers.reduce((s, t) => s + t.teacherCourses.length, 0),
            icon: <BookOpen className="w-5 h-5 text-purple-600" />, bg: "bg-purple-50",
          },
          {
            label: "Total Students",
            value: teachers.reduce((s, t) => s + t.teacherCourses.reduce((cs, c) => cs + c._count.enrollments, 0), 0),
            icon: <Users className="w-5 h-5 text-blue-600" />, bg: "bg-blue-50",
          },
          {
            label: "Total Revenue",
            value: `₹${teachers
              .reduce(
                (s, t) =>
                  s +
                  t.teacherCourses.reduce(
                    (cs, c) => cs + c.payments.reduce((ps, p) => ps + p.amount, 0),
                    0
                  ),
                0
              )
              .toLocaleString()}`,
            icon: <IndianRupee className="w-5 h-5 text-yellow-600" />, bg: "bg-yellow-50",
          },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>{s.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Instructors</h2>
        </div>
        {teachers.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Video className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p>No teachers yet. Promote a student below.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">Teacher</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Courses</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Students</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Revenue</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Joined</th>
                <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => {
                const revenue = t.teacherCourses.reduce(
                  (s, c) => s + c.payments.reduce((ps, p) => ps + p.amount, 0),
                  0
                );
                const students = t.teacherCourses.reduce((s, c) => s + c._count.enrollments, 0);
                return (
                  <tr key={t.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          {t.image
                            ? <img src={t.image} alt="" className="w-full h-full object-cover" /> // eslint-disable-line
                            : <span className="text-emerald-700 text-xs font-semibold">{t.name?.[0] ?? "T"}</span>}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{t.name ?? "—"}</div>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Mail className="w-3 h-3" />{t.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm font-medium text-gray-700">{t.teacherCourses.length}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm font-medium text-gray-700">{students}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm font-bold text-gray-900">₹{revenue.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(t.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <AdminRoleChanger userId={t.id} currentRole="TEACHER" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Promote Students */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Promote Student to Teacher</h2>
            <p className="text-sm text-gray-400 mt-0.5">Recently joined students</p>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">Student</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Joined</th>
              <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-gray-400">No students found.</td>
              </tr>
            ) : (
              students.map((s) => (
                <tr key={s.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center flex-shrink-0">
                        {s.image
                          ? <img src={s.image} alt="" className="w-full h-full object-cover" /> // eslint-disable-line
                          : <span className="text-primary-700 text-xs font-semibold">{s.name?.[0] ?? "U"}</span>}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{s.name ?? "—"}</div>
                        <div className="text-xs text-gray-400">{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-500">
                      {new Date(s.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <AdminRoleChanger userId={s.id} currentRole="STUDENT" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
