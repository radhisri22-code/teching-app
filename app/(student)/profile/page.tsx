import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { User, Mail, BookOpen, CreditCard, LogOut, Trophy, Calendar } from "lucide-react";
import { SignOutButton } from "@/components/student/sign-out-button";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const [enrollments, payments] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId: session.user.id },
      include: { course: { select: { title: true, category: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.findMany({
      where: { userId: session.user.id, status: "COMPLETED" },
      include: { course: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalSpent = payments.reduce((sum, p) => sum + p.amount, 0);
  const completed = enrollments.filter((e) => e.progress === 100).length;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Profile</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gray-100">
          {session.user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt={session.user.name ?? ""}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-primary-100"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-900">{session.user.name}</h2>
            <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-0.5">
              <Mail className="w-4 h-4" />
              {session.user.email}
            </div>
            <div className="mt-1">
              <span className="px-2.5 py-0.5 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full">
                Student
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: <BookOpen className="w-5 h-5 text-primary-600" />, value: enrollments.length, label: "Enrolled" },
            { icon: <Trophy className="w-5 h-5 text-yellow-500" />, value: completed, label: "Completed" },
            { icon: <CreditCard className="w-5 h-5 text-green-600" />, value: `₹${totalSpent.toLocaleString()}`, label: "Spent" },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="flex justify-center mb-2">{stat.icon}</div>
              <div className="font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment History */}
      {payments.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
          <div className="space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <div className="text-sm font-medium text-gray-800">{payment.course.title}</div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    {new Date(payment.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">₹{payment.amount.toLocaleString()}</div>
                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                    Paid
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sign Out */}
      <SignOutButton />
    </div>
  );
}
