"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Star, Clock, Users, Award, BookOpen, Play, CheckCircle,
  ArrowLeft, ShoppingCart, Zap
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  longDesc?: string;
  price: number;
  thumbnail?: string;
  category: string;
  level: string;
  duration?: string;
  instructor: string;
  rating: number;
  totalRatings: number;
  _count: { enrollments: number };
}

interface Enrollment {
  courseId: string;
  progress: number;
}

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setPaymentStatus(urlParams.get("payment"));
  }, []);

  useEffect(() => {
    fetch(`/api/courses/${params.id}`)
      .then((r) => r.json())
      .then(setCourse)
      .finally(() => setLoading(false));

    if (session) {
      fetch("/api/enrollments")
        .then((r) => r.json())
        .then((enrollments: Enrollment[]) => {
          const e = enrollments.find((en) => en.courseId === params.id);
          setEnrollment(e ?? null);
        });
    }
  }, [params.id, session]);

  const handleEnroll = async () => {
    if (!session) { router.push("/login"); return; }
    setActionLoading(true);
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: params.id }),
      });
      if (res.ok) {
        setEnrollment({ courseId: params.id, progress: 0 });
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleBuy = async () => {
    if (!session) { router.push("/login"); return; }
    setActionLoading(true);
    try {
      const res = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: params.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setActionLoading(false);
    }
  };

  const levelLabel = (l: string) => {
    const map: Record<string, string> = {
      BEGINNER: "Beginner", INTERMEDIATE: "Intermediate", ADVANCED: "Advanced",
    };
    return map[l] ?? l;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-32">
        <p className="text-gray-500">Course not found.</p>
        <Link href="/courses" className="text-primary-600 hover:underline mt-2 inline-block">
          Browse courses
        </Link>
      </div>
    );
  }

  const curricula = [
    "Introduction & Course Overview",
    "Setting Up Your Environment",
    "Core Fundamentals — Part 1",
    "Core Fundamentals — Part 2",
    "Intermediate Concepts",
    "Building Real-World Projects",
    "Advanced Topics",
    "Performance & Best Practices",
    "Testing & Debugging",
    "Deployment & Next Steps",
  ];

  return (
    <div>
      <Link href="/courses" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to courses
      </Link>

      {paymentStatus === "success" && (
        <div className="flex items-center gap-2 p-4 mb-6 bg-green-50 border border-green-200 rounded-xl text-green-700">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          Payment successful! You are now enrolled in this course.
        </div>
      )}
      {paymentStatus === "cancelled" && (
        <div className="p-4 mb-6 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
          Payment was cancelled. You can try again anytime.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Course Hero */}
          <div className="relative rounded-2xl overflow-hidden mb-6 aspect-video bg-gradient-to-br from-primary-700 to-purple-700">
            {course.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-24 h-24 text-white/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all">
                <Play className="w-8 h-8 text-white fill-white" />
              </div>
            </div>
          </div>

          {/* Course Info */}
          <div className="mb-4">
            <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full">
              {course.category}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{course.title}</h1>
          <p className="text-gray-600 mb-4">{course.description}</p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="font-semibold text-gray-800">{course.rating}</span>
              <span>({course.totalRatings.toLocaleString()} ratings)</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {course._count.enrollments.toLocaleString()} students
            </div>
            {course.duration && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {course.duration}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Award className="w-4 h-4" />
              {levelLabel(course.level)}
            </div>
          </div>

          <div className="mb-2 text-sm text-gray-600">
            <span className="font-medium text-gray-900">Instructor:</span> {course.instructor}
          </div>

          {/* About */}
          {course.longDesc && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">About This Course</h2>
              <p className="text-gray-600 leading-relaxed">{course.longDesc}</p>
            </div>
          )}

          {/* Curriculum */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Curriculum</h2>
            <div className="space-y-2">
              {curricula.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border ${
                    enrollment && enrollment.progress >= (i + 1) * 10
                      ? "bg-primary-50 border-primary-100"
                      : "bg-gray-50 border-gray-100"
                  }`}
                >
                  {enrollment && enrollment.progress >= (i + 1) * 10 ? (
                    <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                  )}
                  <span className="text-sm text-gray-700">
                    <span className="text-gray-400 mr-2">{String(i + 1).padStart(2, "0")}.</span>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar — Enroll Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {course.price === 0 ? (
                  <span className="text-green-600">Free</span>
                ) : (
                  <>₹{course.price.toLocaleString()}</>
                )}
              </div>
              {course.price > 0 && (
                <div className="text-sm text-gray-400 mb-4">One-time payment · Lifetime access</div>
              )}

              {enrollment ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-3 rounded-xl text-sm font-medium">
                    <CheckCircle className="w-5 h-5" />
                    You&apos;re enrolled!
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold">{enrollment.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-600 rounded-full"
                        style={{ width: `${enrollment.progress}%` }}
                      />
                    </div>
                  </div>
                  <button className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors">
                    <Play className="w-5 h-5" /> Continue Learning
                  </button>
                </div>
              ) : course.price === 0 ? (
                <button
                  onClick={handleEnroll}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60"
                >
                  {actionLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Zap className="w-5 h-5" /> Enroll for Free
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleBuy}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60"
                >
                  {actionLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" /> Buy Now
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="px-6 pb-6 space-y-2.5">
              {[
                { icon: <Award className="w-4 h-4" />, text: "Certificate of completion" },
                { icon: <Clock className="w-4 h-4" />, text: `${course.duration} of content` },
                { icon: <Zap className="w-4 h-4" />, text: "Lifetime access" },
                { icon: <BookOpen className="w-4 h-4" />, text: "Downloadable resources" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2.5 text-sm text-gray-600">
                  <div className="text-primary-600">{item.icon}</div>
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
