import { prisma } from "@/lib/db";
import { IndianRupee, TrendingUp, CheckCircle, XCircle, Clock, Calendar } from "lucide-react";

export default async function AdminPaymentsPage() {
  const payments = await prisma.payment.findMany({
    include: {
      user: { select: { name: true, email: true, image: true } },
      course: { select: { title: true, category: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const completed = payments.filter((p) => p.status === "COMPLETED");
  const pending = payments.filter((p) => p.status === "PENDING");
  const failed = payments.filter((p) => p.status === "FAILED");
  const totalRevenue = completed.reduce((sum, p) => sum + p.amount, 0);

  const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    COMPLETED: {
      label: "Paid",
      color: "bg-green-100 text-green-700",
      icon: <CheckCircle className="w-3.5 h-3.5" />,
    },
    PENDING: {
      label: "Pending",
      color: "bg-yellow-100 text-yellow-700",
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    FAILED: {
      label: "Failed",
      color: "bg-red-100 text-red-700",
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
    REFUNDED: {
      label: "Refunded",
      color: "bg-gray-100 text-gray-600",
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Payments</h1>
        <p className="text-gray-500">{payments.length} total transactions</p>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total Revenue",
            value: `₹${totalRevenue.toLocaleString()}`,
            icon: <IndianRupee className="w-5 h-5 text-green-600" />,
            bg: "bg-green-50",
          },
          {
            label: "Completed",
            value: completed.length,
            icon: <CheckCircle className="w-5 h-5 text-blue-600" />,
            bg: "bg-blue-50",
          },
          {
            label: "Pending",
            value: pending.length,
            icon: <Clock className="w-5 h-5 text-yellow-600" />,
            bg: "bg-yellow-50",
          },
          {
            label: "Failed",
            value: failed.length,
            icon: <XCircle className="w-5 h-5 text-red-500" />,
            bg: "bg-red-50",
          },
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

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">Student</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-4">Course</th>
              <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-4">Amount</th>
              <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-4">Status</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-gray-400">
                  No payments yet.
                </td>
              </tr>
            ) : (
              payments.map((payment) => {
                const status = statusConfig[payment.status] ?? statusConfig.PENDING;
                return (
                  <tr key={payment.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center flex-shrink-0">
                          {payment.user.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={payment.user.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-primary-700 text-xs font-semibold">
                              {payment.user.name?.[0] ?? "U"}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{payment.user.name}</div>
                          <div className="text-xs text-gray-400 truncate">{payment.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-800 max-w-xs truncate">{payment.course.title}</div>
                      <div className="text-xs text-gray-400">{payment.course.category}</div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm font-bold text-gray-900">
                        ₹{payment.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${status.color}`}>
                        {status.icon}
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(payment.createdAt).toLocaleDateString("en-IN", {
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
