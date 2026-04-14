import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  IndianRupee, TrendingUp, BookOpen, Users, Calendar,
  CheckCircle, Clock, XCircle
} from "lucide-react";

export default async function TeacherEarningsPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const payments = await prisma.payment.findMany({
    where: { course: { teacherId: session.user.id } },
    include: {
      user: { select: { name: true, email: true, image: true } },
      course: { select: { title: true, category: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const completed = payments.filter((p) => p.status === "COMPLETED");
  const pending   = payments.filter((p) => p.status === "PENDING");
  const failed    = payments.filter((p) => p.status === "FAILED");

  const totalRevenue   = completed.reduce((s, p) => s + p.amount, 0);
  const pendingRevenue = pending.reduce((s, p) => s + p.amount, 0);

  // Revenue by course
  const byCourse = new Map<string, { title: string; count: number; revenue: number }>();
  for (const p of completed) {
    const key = p.courseId;
    const existing = byCourse.get(key) ?? { title: p.course.title, count: 0, revenue: 0 };
    byCourse.set(key, { ...existing, count: existing.count + 1, revenue: existing.revenue + p.amount });
  }
  const courseRevenue = Array.from(byCourse.values()).sort((a, b) => b.revenue - a.revenue);
  const maxRevenue = courseRevenue[0]?.revenue ?? 1;

  const statusCfg: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    COMPLETED: { label: "Paid",    color: "bg-green-100 text-green-700",  icon: <CheckCircle className="w-3.5 h-3.5" /> },
    PENDING:   { label: "Pending", color: "bg-yellow-100 text-yellow-700",icon: <Clock className="w-3.5 h-3.5" /> },
    FAILED:    { label: "Failed",  color: "bg-red-100 text-red-700",      icon: <XCircle className="w-3.5 h-3.5" /> },
    REFUNDED:  { label: "Refunded",color: "bg-gray-100 text-gray-600",    icon: <XCircle className="w-3.5 h-3.5" /> },
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Earnings</h1>
        <p className="text-gray-500">Your revenue from course sales</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Earned",   value: `₹${totalRevenue.toLocaleString()}`,   icon: <IndianRupee className="w-5 h-5 text-emerald-600" />, bg: "bg-emerald-50" },
          { label: "Pending",        value: `₹${pendingRevenue.toLocaleString()}`,  icon: <Clock className="w-5 h-5 text-yellow-600" />,       bg: "bg-yellow-50" },
          { label: "Transactions",   value: completed.length,                        icon: <TrendingUp className="w-5 h-5 text-blue-600" />,     bg: "bg-blue-50" },
          { label: "Courses Sold",   value: byCourse.size,                           icon: <BookOpen className="w-5 h-5 text-purple-600" />,     bg: "bg-purple-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>{s.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
          </div>
          {payments.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <IndianRupee className="w-10 h-10 mx-auto mb-3 text-gray-200" />
              <p>No transactions yet.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">Student</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Course</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Amount</th>
                  <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  const st = statusCfg[p.status] ?? statusCfg.PENDING;
                  return (
                    <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center flex-shrink-0">
                            {p.user.image
                              ? <img src={p.user.image} alt="" className="w-full h-full object-cover" /> // eslint-disable-line
                              : <span className="text-primary-700 text-xs font-semibold">{p.user.name?.[0] ?? "U"}</span>}
                          </div>
                          <span className="text-sm font-medium text-gray-800 truncate max-w-[100px]">{p.user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700 truncate max-w-[160px] block">{p.course.title}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-sm text-gray-900">
                        ₹{p.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${st.color}`}>
                          {st.icon}{st.label}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {new Date(p.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Revenue by Course */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">Revenue by Course</h2>
          {courseRevenue.length === 0 ? (
            <p className="text-gray-400 text-sm">No data yet.</p>
          ) : (
            <div className="space-y-4">
              {courseRevenue.map((c) => (
                <div key={c.title}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-gray-700 truncate max-w-[160px]">{c.title}</span>
                    <span className="text-sm font-bold text-gray-900 flex-shrink-0 ml-2">
                      ₹{c.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.round((c.revenue / maxRevenue) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{c.count} sales</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
