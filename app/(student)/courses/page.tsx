import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Star, Clock, BookOpen, Filter } from "lucide-react";

interface SearchParams {
  category?: string;
  level?: string;
  search?: string;
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getServerSession(authOptions);

  const [courses, enrollmentIds] = await Promise.all([
    prisma.course.findMany({
      where: {
        published: true,
        ...(searchParams.category ? { category: searchParams.category } : {}),
        ...(searchParams.level ? { level: searchParams.level as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" } : {}),
        ...(searchParams.search
          ? {
              OR: [
                { title: { contains: searchParams.search } },
                { description: { contains: searchParams.search } },
                { instructor: { contains: searchParams.search } },
              ],
            }
          : {}),
      },
      include: { _count: { select: { enrollments: true } } },
      orderBy: { totalRatings: "desc" },
    }),
    session
      ? prisma.enrollment.findMany({
          where: { userId: session.user.id },
          select: { courseId: true },
        })
      : Promise.resolve([]),
  ]);

  const enrolledIds = new Set(enrollmentIds.map((e) => e.courseId));

  const categories = [
    "All", "Web Development", "Data Science", "Design",
    "Cloud", "Programming", "DevOps", "Marketing",
  ];
  const levels = ["All", "BEGINNER", "INTERMEDIATE", "ADVANCED"];

  const levelLabel = (l: string) => {
    if (l === "BEGINNER") return "Beginner";
    if (l === "INTERMEDIATE") return "Intermediate";
    if (l === "ADVANCED") return "Advanced";
    return l;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">All Courses</h1>
        <p className="text-gray-500">Discover your next skill from our library of expert-led courses</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-gray-700">
          <Filter className="w-4 h-4" /> Filters
        </div>

        {/* Search */}
        <form className="mb-4">
          <input
            name="search"
            defaultValue={searchParams.search}
            placeholder="Search courses, instructors..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <input type="hidden" name="category" value={searchParams.category ?? ""} />
          <input type="hidden" name="level" value={searchParams.level ?? ""} />
        </form>

        {/* Categories */}
        <div className="mb-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category</div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const active = cat === "All" ? !searchParams.category : searchParams.category === cat;
              const href =
                cat === "All"
                  ? `/courses${searchParams.search ? `?search=${searchParams.search}` : ""}`
                  : `/courses?category=${encodeURIComponent(cat)}${searchParams.search ? `&search=${searchParams.search}` : ""}`;
              return (
                <Link
                  key={cat}
                  href={href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Levels */}
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Level</div>
          <div className="flex flex-wrap gap-2">
            {levels.map((lvl) => {
              const active = lvl === "All" ? !searchParams.level : searchParams.level === lvl;
              const href =
                lvl === "All"
                  ? `/courses${searchParams.category ? `?category=${searchParams.category}` : ""}`
                  : `/courses?level=${lvl}${searchParams.category ? `&category=${searchParams.category}` : ""}`;
              return (
                <Link
                  key={lvl}
                  href={href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {levelLabel(lvl)}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4">{courses.length} courses found</p>

      {/* Course Grid */}
      {courses.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No courses found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all"
            >
              <div className="relative h-40 bg-gradient-to-br from-primary-600 to-purple-600 overflow-hidden">
                {course.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-white/50" />
                  </div>
                )}
                <div className="absolute top-2 left-2 flex gap-1.5">
                  <span className="px-2 py-0.5 bg-white/90 text-xs font-semibold text-gray-700 rounded-full">
                    {levelLabel(course.level)}
                  </span>
                  {course.price === 0 && (
                    <span className="px-2 py-0.5 bg-green-500 text-xs font-bold text-white rounded-full">
                      FREE
                    </span>
                  )}
                </div>
                {enrolledIds.has(course.id) && (
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-0.5 bg-primary-600 text-xs font-bold text-white rounded-full">
                      Enrolled
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <span className="text-xs text-primary-600 font-semibold">{course.category}</span>
                <h3 className="font-semibold text-gray-900 mt-1 mb-1 line-clamp-2 text-sm group-hover:text-primary-600 transition-colors">
                  {course.title}
                </h3>
                <p className="text-xs text-gray-500 mb-2">by {course.instructor}</p>

                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-semibold text-gray-700">{course.rating}</span>
                  <span className="text-xs text-gray-400">({course.totalRatings.toLocaleString()})</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" /> {course.duration}
                  </div>
                  <div className="font-bold text-sm text-gray-900">
                    {course.price === 0
                      ? <span className="text-green-600">Free</span>
                      : <span>₹{course.price.toLocaleString()}</span>
                    }
                  </div>
                </div>

                <div className="mt-1.5 text-xs text-gray-400">
                  {course._count.enrollments.toLocaleString()} students
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
