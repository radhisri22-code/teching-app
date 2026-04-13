import { prisma } from "@/lib/db";
import {
  Users, BookOpen, TrendingUp, IndianRupee,
  Award, Clock, Star
} from "lucide-react";

export default async function AdminDashboard() {
  const [
    totalStudents,
    totalCourses,
    totalEnrollments,
    payments,
    recentStudents,
    recentPayments,
    topCourses,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.course.count({ where: { published: true } }),
    prisma.enrollment.count(),
    prisma.payment.findMany({ where: { status: "COMPLETED" } }),
    prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, image: true, createdAt: true },
    }),
    prisma.payment.findMany({
      where: { status: "COMPLETED" },
      include: {
        user: { select: { name: true, email: true, image: true } },
        course: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.course.findMany({
      where: { published: true },
      include: { _count: { select: { enrollments: true } } },
      orderBy: { enrollments: { _count: "desc" } },
      take: 5,
    }),
  ]);

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

  const stats = [
    {
      label: "Total Students",
      value: totalStudents.toLocaleString(),
      icon: <Users className="w-6 h-6 text-blue-600" />,
      bg: "bg-blue-50",
      change: "+12%",
      positive: true,
    },
    {
      label: "Total Courses",
      value: totalCourses.toLocaleString(),
      icon: <BookOpen className="w-6 h-6 text-purple-600" />,
      bg: "bg-purple-50",
      change: "+3",
      positive: true,
    },
    {
      label: "Total Enrollments",
      value: totalEnrollments.toLocaleString(),
      icon: <TrendingUp className="w-6 h-6 text-green-600" />,
      bg: "bg-green-50",
      change: "+24%",
      positive: true,
    },
    {
      label: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: <IndianRupee className="w-6 h-6 text-yellow-600" />,
      bg: "bg-yellow-50",
      change: "+18%",
      positive: true,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
        <p className="text-gray-500">Overview of your platform performance</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                {stat.icon}
              </div>
              <span className={`text-sm font-semibold ${stat.positive ? "text-green-600" : "text-red-500"}`}>
                {stat.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-0.5">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Payments */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">Recent Transactions</h2>
          {recentPayments.length === 0 ? (
            <p className="text-gray-400 text-sm">No transactions yet.</p>
          ) : (
            <div className="space-y-3">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center flex-shrink-0">
                    {payment.user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={payment.user.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-primary-700 text-sm font-semibold">
                        {payment.user.name?.[0] ?? "U"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{payment.user.name}</div>
                    <div className="text-xs text-gray-400 truncate">{payment.course.title}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-gray-900">₹{payment.amount.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(payment.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short",
                      })}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full flex-shrink-0">
                    Paid
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Top Courses */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Courses</h2>
            <div className="space-y-3">
              {topCourses.map((course, i) => (
                <div key={course.id} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-400 w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{course.title}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden flex-1">
                        <div
                          className="h-full bg-primary-600 rounded-full"
                          style={{
                            width: `${Math.round((course._count.enrollments / (topCourses[0]._count.enrollments || 1)) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {course._count.enrollments} enrolled
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Students */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">New Students</h2>
            <div className="space-y-3">
              {recentStudents.map((student) => (
                <div key={student.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center flex-shrink-0">
                    {student.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={student.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-primary-700 text-xs font-semibold">
                        {student.name?.[0] ?? "U"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{student.name}</div>
                    <div className="text-xs text-gray-400 truncate">{student.email}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
