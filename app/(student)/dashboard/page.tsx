import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import {
  BookOpen, Trophy, Clock, TrendingUp, ChevronRight, Play
} from "lucide-react";

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const [enrollments, recentCourses] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId: session.user.id },
      include: { course: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.course.findMany({
      where: { published: true },
      take: 4,
      orderBy: { totalRatings: "desc" },
    }),
  ]);

  const completed = enrollments.filter((e) => e.progress === 100).length;
  const inProgress = enrollments.filter((e) => e.progress > 0 && e.progress < 100).length;
  const avgProgress =
    enrollments.length > 0
      ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
      : 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session.user.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-gray-500 mt-1">Track your learning progress and continue where you left off.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Enrolled Courses",
            value: enrollments.length,
            icon: <BookOpen className="w-5 h-5 text-primary-600" />,
            bg: "bg-primary-50",
          },
          {
            label: "Completed",
            value: completed,
            icon: <Trophy className="w-5 h-5 text-yellow-600" />,
            bg: "bg-yellow-50",
          },
          {
            label: "In Progress",
            value: inProgress,
            icon: <Clock className="w-5 h-5 text-blue-600" />,
            bg: "bg-blue-50",
          },
          {
            label: "Avg. Progress",
            value: `${avgProgress}%`,
            icon: <TrendingUp className="w-5 h-5 text-green-600" />,
            bg: "bg-green-50",
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* My Courses */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Continue Learning</h2>
            <Link href="/my-courses" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {enrollments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">You haven&apos;t enrolled in any courses yet.</p>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {enrollments.slice(0, 4).map((enrollment) => (
                <Link
                  key={enrollment.id}
                  href={`/courses/${enrollment.courseId}`}
                  className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:border-primary-200 hover:shadow-md transition-all group"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-primary-600 to-purple-600 flex-shrink-0">
                    {enrollment.course.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={enrollment.course.thumbnail}
                        alt={enrollment.course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                      {enrollment.course.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">{enrollment.course.instructor}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-600 rounded-full transition-all"
                          style={{ width: `${enrollment.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                        {enrollment.progress}%
                      </span>
                    </div>
                  </div>
                  {enrollment.progress === 100 && (
                    <Trophy className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recommended */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recommended</h2>
          </div>
          <div className="space-y-3">
            {recentCourses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 shadow-sm p-3 hover:border-primary-200 hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-primary-600 to-purple-600 flex-shrink-0">
                  {course.thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                    {course.title}
                  </h3>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs text-gray-400">{course.category}</span>
                    <span className="text-xs font-semibold text-gray-700">
                      {course.price === 0 ? "Free" : `₹${course.price.toLocaleString()}`}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Link
            href="/courses"
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 border border-primary-200 text-primary-600 rounded-xl text-sm font-medium hover:bg-primary-50 transition-colors"
          >
            Browse All Courses <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
