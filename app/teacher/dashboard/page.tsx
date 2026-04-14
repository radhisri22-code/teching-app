import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import {
  BookOpen, Users, IndianRupee, Video,
  TrendingUp, PlusCircle, ChevronRight, Eye, EyeOff
} from "lucide-react";

export default async function TeacherDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const courses = await prisma.course.findMany({
    where: { teacherId: session.user.id },
    include: {
      _count: { select: { enrollments: true } },
      payments: { where: { status: "COMPLETED" }, select: { amount: true } },
      sections: {
        include: { _count: { select: { lessons: true } } },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const totalStudents = courses.reduce((sum, c) => sum + c._count.enrollments, 0);
  const totalRevenue = courses.reduce(
    (sum, c) => sum + c.payments.reduce((ps, p) => ps + p.amount, 0),
    0
  );
  const totalLessons = courses.reduce(
    (sum, c) => sum + c.sections.reduce((ss, s) => ss + s._count.lessons, 0),
    0
  );
  const publishedCount = courses.filter((c) => c.published).length;

  const levelLabel = (l: string) => ({ BEGINNER: "Beginner", INTERMEDIATE: "Intermediate", ADVANCED: "Advanced" }[l] ?? l);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Welcome, {session.user.name?.split(" ")[0]}! 👨‍🏫
          </h1>
          <p className="text-gray-500">Your teaching overview</p>
        </div>
        <Link
          href="/teacher/courses/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" /> Create Course
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Courses", value: courses.length, icon: <BookOpen className="w-5 h-5 text-primary-600" />, bg: "bg-primary-50" },
          { label: "Total Students", value: totalStudents, icon: <Users className="w-5 h-5 text-blue-600" />, bg: "bg-blue-50" },
          { label: "Total Lessons", value: totalLessons, icon: <Video className="w-5 h-5 text-purple-600" />, bg: "bg-purple-50" },
          {
            label: "Total Earnings",
            value: `₹${totalRevenue.toLocaleString()}`,
            icon: <IndianRupee className="w-5 h-5 text-emerald-600" />,
            bg: "bg-emerald-50",
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

      {/* Course List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Your Courses</h2>
          <Link href="/teacher/courses" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            Manage all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="p-16 text-center">
            <BookOpen className="w-14 h-14 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No courses yet</h3>
            <p className="text-gray-400 mb-6 text-sm">Create your first course and start teaching.</p>
            <Link
              href="/teacher/courses/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors"
            >
              <PlusCircle className="w-4 h-4" /> Create Your First Course
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {courses.map((course) => {
              const revenue = course.payments.reduce((sum, p) => sum + p.amount, 0);
              const lessonCount = course.sections.reduce((sum, s) => sum + s._count.lessons, 0);
              const sectionCount = course.sections.length;

              return (
                <div key={course.id} className="flex items-center gap-4 p-5 hover:bg-gray-50/50 transition-colors">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0">
                    {course.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-7 h-7 text-white/60" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{course.title}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${
                        course.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {course.published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" /> {sectionCount} sections
                      </span>
                      <span className="flex items-center gap-1">
                        <Video className="w-3 h-3" /> {lessonCount} lessons
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> {course._count.enrollments} students
                      </span>
                      <span>{levelLabel(course.level)}</span>
                      <span className="text-gray-500">
                        {course.price === 0 ? "Free" : `₹${course.price.toLocaleString()}`}
                      </span>
                    </div>
                  </div>

                  {/* Revenue */}
                  <div className="text-right flex-shrink-0 mr-2">
                    <div className="text-sm font-bold text-gray-900">₹{revenue.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">earned</div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/teacher/courses/${course.id}/curriculum`}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      Edit Curriculum
                    </Link>
                    <Link
                      href={`/teacher/courses/${course.id}`}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Settings
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Tips */}
      <div className="mt-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-6">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          Quick Tips for Better Courses
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {[
            { tip: "Keep videos under 10 minutes", desc: "Shorter videos have better completion rates." },
            { tip: "Mark first lesson as Free Preview", desc: "Let students preview before buying." },
            { tip: "Add a course thumbnail", desc: "Courses with thumbnails get 3x more clicks." },
          ].map((t) => (
            <div key={t.tip} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-800">{t.tip}</div>
                <div className="text-gray-500 text-xs mt-0.5">{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
