import { prisma } from "@/lib/db";
import { Users, Mail, BookOpen, CreditCard, Calendar } from "lucide-react";

export default async function AdminStudentsPage() {
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: {
      _count: { select: { enrollments: true } },
      payments: { where: { status: "COMPLETED" }, select: { amount: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s._count.enrollments > 0).length;
  const payingStudents = students.filter((s) => s.payments.length > 0).length;
  const totalRevenue = students.reduce(
    (sum, s) => sum + s.payments.reduce((ps, p) => ps + p.amount, 0),
    0
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Students</h1>
        <p className="text-gray-500">{totalStudents} registered students</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Students", value: totalStudents, icon: <Users className="w-5 h-5 text-blue-600" />, bg: "bg-blue-50" },
          { label: "Active Learners", value: activeStudents, icon: <BookOpen className="w-5 h-5 text-purple-600" />, bg: "bg-purple-50" },
          { label: "Paying Students", value: payingStudents, icon: <CreditCard className="w-5 h-5 text-green-600" />, bg: "bg-green-50" },
          { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: <CreditCard className="w-5 h-5 text-yellow-600" />, bg: "bg-yellow-50" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">Student</th>
              <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-4">Courses</th>
              <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-4">Total Spent</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-4">Joined</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center text-gray-400">
                  No students yet.
                </td>
              </tr>
            ) : (
              students.map((student) => {
                const spent = student.payments.reduce((sum, p) => sum + p.amount, 0);
                return (
                  <tr key={student.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center flex-shrink-0">
                          {student.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={student.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-primary-700 text-sm font-semibold">
                              {student.name?.[0] ?? "U"}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{student.name ?? "—"}</div>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Mail className="w-3 h-3" />
                            {student.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 text-sm text-gray-700">
                        <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                        {student._count.enrollments}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {spent === 0 ? (
                          <span className="text-gray-400">₹0</span>
                        ) : (
                          `₹${spent.toLocaleString()}`
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(student.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
