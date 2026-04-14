import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import {
  Plus, BookOpen, Video, Users, Eye, EyeOff, ChevronRight
} from "lucide-react";
import { TeacherCourseActions } from "@/components/teacher/teacher-course-actions";

export default async function TeacherCoursesPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const courses = await prisma.course.findMany({
    where: { teacherId: session.user.id },
    include: {
      _count: { select: { enrollments: true } },
      payments: { where: { status: "COMPLETED" }, select: { amount: true } },
      sections: { include: { _count: { select: { lessons: true } } } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const levelLabel = (l: string) =>
    ({ BEGINNER: "Beginner", INTERMEDIATE: "Intermediate", ADVANCED: "Advanced" }[l] ?? l);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">My Courses</h1>
          <p className="text-gray-500">{courses.length} course{courses.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/teacher/courses/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No courses yet</h3>
          <p className="text-gray-400 mb-6 text-sm">Create your first course and start teaching.</p>
          <Link
            href="/teacher/courses/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors"
          >
            <Plus className="w-4 h-4" /> Create Course
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {courses.map((course) => {
            const revenue = course.payments.reduce((s, p) => s + p.amount, 0);
            const lessonCount = course.sections.reduce((s, sec) => s + sec._count.lessons, 0);

            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-5 p-5">
                  {/* Thumbnail */}
                  <div className="w-24 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0">
                    {course.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-6 h-6 text-white/60" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="font-semibold text-gray-900 truncate">{course.title}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${
                        course.published
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {course.published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {course.sections.length} sections · {lessonCount} lessons
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {course._count.enrollments} students
                      </span>
                      <span>{levelLabel(course.level)}</span>
                      <span className="font-medium text-gray-500">
                        {course.price === 0 ? "Free" : `₹${course.price.toLocaleString()}`}
                      </span>
                    </div>
                  </div>

                  {/* Revenue */}
                  <div className="text-right flex-shrink-0 hidden sm:block">
                    <div className="text-lg font-bold text-gray-900">₹{revenue.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">earned</div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/teacher/courses/${course.id}/curriculum`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" /> Curriculum
                    </Link>
                    <Link
                      href={`/teacher/courses/${course.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Settings
                    </Link>
                    <TeacherCourseActions courseId={course.id} published={course.published} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
