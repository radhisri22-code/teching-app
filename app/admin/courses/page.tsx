import { prisma } from "@/lib/db";
import Link from "next/link";
import { Plus, BookOpen, Users, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { AdminCourseActions } from "@/components/admin/admin-course-actions";

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    include: { _count: { select: { enrollments: true, payments: true } } },
    orderBy: { createdAt: "desc" },
  });

  const levelLabel = (l: string) => {
    const map: Record<string, string> = {
      BEGINNER: "Beginner", INTERMEDIATE: "Intermediate", ADVANCED: "Advanced",
    };
    return map[l] ?? l;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Courses</h1>
          <p className="text-gray-500">{courses.length} courses total</p>
        </div>
        <Link
          href="/admin/courses/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No courses yet</h3>
          <p className="text-gray-400 mb-6">Create your first course to get started.</p>
          <Link
            href="/admin/courses/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Create Course
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">Course</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-4">Category</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-4">Level</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-4">Price</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-4">Students</th>
                <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-4">Status</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-primary-600 to-purple-600 flex-shrink-0">
                        {course.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-white/70" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate max-w-xs">{course.title}</div>
                        <div className="text-xs text-gray-400">by {course.instructor}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-600">{course.category}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      course.level === "BEGINNER"
                        ? "bg-green-100 text-green-700"
                        : course.level === "INTERMEDIATE"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}>
                      {levelLabel(course.level)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-sm font-semibold text-gray-900">
                      {course.price === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `₹${course.price.toLocaleString()}`
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 text-sm text-gray-700">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      {course._count.enrollments}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      course.published
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {course.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <AdminCourseActions courseId={course.id} published={course.published} />
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
