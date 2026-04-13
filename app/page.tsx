import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  BookOpen, Users, Award, Star, ChevronRight,
  Play, TrendingUp, Shield, Clock, Globe
} from "lucide-react";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  const [courseCount, studentCount, courses] = await Promise.all([
    prisma.course.count({ where: { published: true } }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.course.findMany({
      where: { published: true },
      take: 6,
      orderBy: { totalRatings: "desc" },
    }),
  ]);

  const categories = [
    { name: "Web Development", icon: "💻", count: 142 },
    { name: "Data Science", icon: "📊", count: 89 },
    { name: "Design", icon: "🎨", count: 67 },
    { name: "Cloud & DevOps", icon: "☁️", count: 54 },
    { name: "Programming", icon: "⌨️", count: 98 },
    { name: "Marketing", icon: "📱", count: 43 },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Teching</span>
            </Link>

            <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
              <Link href="/courses" className="hover:text-primary-600 transition-colors">Courses</Link>
              <Link href="#categories" className="hover:text-primary-600 transition-colors">Categories</Link>
              <Link href="#about" className="hover:text-primary-600 transition-colors">About</Link>
            </div>

            <div className="flex items-center gap-3">
              {session ? (
                <>
                  <Link
                    href={session.user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"}
                    className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    {session.user.role === "ADMIN" ? "Admin Panel" : "My Dashboard"}
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm text-gray-700 hover:text-primary-600 transition-colors font-medium">
                    Log in
                  </Link>
                  <Link
                    href="/login"
                    className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-24 pb-20 bg-gradient-to-br from-primary-950 via-primary-800 to-purple-900 text-white relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm mb-6">
              <TrendingUp className="w-4 h-4 text-yellow-400" />
              <span>India&apos;s #1 Learning Platform</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
              Learn Skills That
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                Shape Your Future
              </span>
            </h1>

            <p className="text-xl text-primary-100 mb-8 max-w-2xl">
              Access 500+ expert-led courses in technology, design, and business.
              Learn at your own pace, earn certificates, and advance your career.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-700 font-bold rounded-xl hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl text-lg"
              >
                Start Learning Free
                <ChevronRight className="w-5 h-5" />
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all text-lg"
              >
                <Play className="w-5 h-5" />
                Browse Courses
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/20">
              <div>
                <div className="text-3xl font-bold">{courseCount}+</div>
                <div className="text-primary-300 text-sm mt-1">Expert Courses</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{studentCount.toLocaleString()}+</div>
                <div className="text-primary-300 text-sm mt-1">Active Learners</div>
              </div>
              <div>
                <div className="text-3xl font-bold">4.8★</div>
                <div className="text-primary-300 text-sm mt-1">Avg. Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Globe className="w-6 h-6 text-primary-600" />,
                title: "Learn Anywhere",
                desc: "Access courses on any device, anytime. Download for offline learning.",
              },
              {
                icon: <Award className="w-6 h-6 text-primary-600" />,
                title: "Earn Certificates",
                desc: "Get industry-recognized certificates to boost your resume.",
              },
              {
                icon: <Shield className="w-6 h-6 text-primary-600" />,
                title: "Lifetime Access",
                desc: "Pay once, access forever. All future updates included.",
              },
            ].map((f) => (
              <div key={f.title} className="flex gap-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-gray-500 text-sm">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section id="categories" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore Top Categories</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              From programming to design — find the perfect course for your goals
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/courses?category=${encodeURIComponent(cat.name)}`}
                className="group p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-200 transition-all text-center"
              >
                <div className="text-3xl mb-3">{cat.icon}</div>
                <div className="text-sm font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
                  {cat.name}
                </div>
                <div className="text-xs text-gray-400 mt-1">{cat.count} courses</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Courses ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Courses</h2>
              <p className="text-gray-500">Hand-picked by our experts</p>
            </div>
            <Link
              href="/courses"
              className="flex items-center gap-1 text-primary-600 font-medium hover:text-primary-700 transition-colors"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="relative h-44 bg-gradient-to-br from-primary-600 to-purple-600 overflow-hidden">
                  {course.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-white/50" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-white/90 text-xs font-semibold text-gray-700 rounded-full">
                      {course.category}
                    </span>
                  </div>
                  {course.price === 0 && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 bg-green-500 text-xs font-bold text-white rounded-full">
                        FREE
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{course.description}</p>

                  <div className="flex items-center gap-1 mb-3">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-semibold text-gray-800">{course.rating}</span>
                    <span className="text-sm text-gray-400">({course.totalRatings.toLocaleString()})</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="w-3.5 h-3.5" />
                      {course.duration}
                    </div>
                    <div className="font-bold text-gray-900">
                      {course.price === 0
                        ? <span className="text-green-600">Free</span>
                        : <span>₹{course.price.toLocaleString()}</span>
                      }
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-primary-100 text-lg mb-8">
            Join thousands of learners and unlock your potential today.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-10 py-4 bg-white text-primary-700 font-bold rounded-xl hover:bg-primary-50 transition-all shadow-xl text-lg"
          >
            Join For Free
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold text-lg">Teching</span>
              </div>
              <p className="text-sm">Empowering learners worldwide with quality education.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/courses" className="hover:text-white transition-colors">Browse Courses</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">© 2024 Teching. All rights reserved.</p>
            <div className="flex items-center gap-4 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
