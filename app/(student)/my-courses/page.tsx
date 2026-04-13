import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { BookOpen, Trophy, Clock, Play, ChevronRight } from "lucide-react";

export default async function MyCoursesPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.user.id },
    include: { course: true },
    orderBy: { updatedAt: "desc" },
  });

  const inProgress = enrollments.filter((e) => e.progress > 0 && e.progress < 100);
  const completed = enrollments.filter((e) => e.progress === 100);
  const notStarted = enrollments.filter((e) => e.progress === 0);

  const levelLabel = (l: string) => {
    const map: Record<string, string> = {
      BEGINNER: "Beginner", INTERMEDIATE: "Intermediate", ADVANCED: "Advanced",
    };
    return map[l] ?? l;
  };

  const CourseCard = ({ enrollment }: { enrollment: (typeof enrollments)[0] }) => (
    <Link
      href={`/courses/${enrollment.courseId}`}
      className="group flex gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-primary-200 hover:shadow-md transition-all"
    >
      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-primary-600 to-purple-600 flex-shrink-0">
        {enrollment.course.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={enrollment.course.thumbnail}
            alt={enrollment.course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="w-8 h-8 text-white" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
            {enrollment.course.title}
          </h3>
          {enrollment.progress === 100 && (
            <Trophy className="w-5 h-5 text-yellow-500 flex-shrink-0" />
          )}
        </div>
        <p className="text-sm text-gray-500 mb-1">by {enrollment.course.instructor}</p>
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
          <span className="px-2 py-0.5 bg-gray-100 rounded-full">
            {levelLabel(enrollment.course.level)}
          </span>
          <span>{enrollment.course.category}</span>
          {enrollment.course.duration && (
            <span className="flex items-center gap-0.5">
              <Clock className="w-3 h-3" /> {enrollment.course.duration}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                enrollment.progress === 100 ? "bg-green-500" : "bg-primary-600"
              }`}
              style={{ width: `${enrollment.progress}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">
            {enrollment.progress}% complete
          </span>
        </div>
      </div>

      <div className="flex items-center self-center">
        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-600 transition-colors" />
      </div>
    </Link>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">My Courses</h1>
          <p className="text-gray-500">{enrollments.length} course{enrollments.length !== 1 ? "s" : ""} enrolled</p>
        </div>
        <Link
          href="/courses"
          className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors"
        >
          + Browse More
        </Link>
      </div>

      {enrollments.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No courses yet</h3>
          <p className="text-gray-400 mb-6">Start learning by enrolling in your first course.</p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
          >
            Browse Courses <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {inProgress.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-primary-600 rounded-full" />
                In Progress ({inProgress.length})
              </h2>
              <div className="space-y-3">
                {inProgress.map((e) => <CourseCard key={e.id} enrollment={e} />)}
              </div>
            </section>
          )}

          {notStarted.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full" />
                Not Started ({notStarted.length})
              </h2>
              <div className="space-y-3">
                {notStarted.map((e) => <CourseCard key={e.id} enrollment={e} />)}
              </div>
            </section>
          )}

          {completed.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Completed ({completed.length})
              </h2>
              <div className="space-y-3">
                {completed.map((e) => <CourseCard key={e.id} enrollment={e} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
