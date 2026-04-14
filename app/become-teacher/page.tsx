"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  Video, IndianRupee, Users, Award, ChevronRight,
  BookOpen, Check, Loader2
} from "lucide-react";

export default function BecomeTeacherPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBecome = async () => {
    if (!session) { router.push("/login"); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/become-teacher", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        // Refresh session so role updates
        await update();
        router.push("/teacher/dashboard");
      } else {
        if (data.error === "Already a teacher or admin") {
          router.push("/teacher/dashboard");
        } else {
          setError(data.error ?? "Something went wrong.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const perks = [
    {
      icon: <IndianRupee className="w-6 h-6 text-emerald-600" />,
      title: "Earn Money",
      desc: "Set your own price. Earn revenue every time a student enrols.",
    },
    {
      icon: <Users className="w-6 h-6 text-blue-600" />,
      title: "Reach Thousands",
      desc: "Publish to the Teching marketplace and get discovered by learners.",
    },
    {
      icon: <Video className="w-6 h-6 text-purple-600" />,
      title: "Easy Course Builder",
      desc: "Upload videos, link YouTube, organise sections — all in minutes.",
    },
    {
      icon: <Award className="w-6 h-6 text-yellow-600" />,
      title: "Build Your Brand",
      desc: "Your name, your style. Students rate and review your work.",
    },
  ];

  const steps = [
    "Create your teacher account (instant — no approval needed)",
    "Set up a course: title, description, pricing",
    "Build your curriculum: add sections and upload lecture videos",
    "Publish and start earning",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-lg">Teching</span>
        </Link>
        {session && (
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            ← Back to dashboard
          </Link>
        )}
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-4 py-1.5 text-emerald-300 text-sm mb-6">
            <Video className="w-4 h-4" /> Teach on Teching
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-5 leading-tight">
            Share your knowledge.<br />
            <span className="text-emerald-400">Earn real money.</span>
          </h1>
          <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of instructors teaching on Teching. Create your course today — it&apos;s free to start.
          </p>
          <button
            onClick={handleBecome}
            disabled={loading}
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl text-lg disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
            {loading ? "Setting up…" : "Become a Teacher — It's Free"}
          </button>
          {error && (
            <p className="mt-4 text-red-400 text-sm">{error}</p>
          )}
          {!session && (
            <p className="mt-4 text-slate-400 text-sm">
              You&apos;ll be asked to sign in first.
            </p>
          )}
        </div>
      </section>

      {/* Perks */}
      <section className="py-16 max-w-5xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Why teach on Teching?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {perks.map((p) => (
            <div key={p.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                {p.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{p.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">How it works</h2>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100">
                <div className="w-8 h-8 bg-emerald-500 text-white text-sm font-bold rounded-full flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </div>
                <p className="text-gray-700 pt-1">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA bottom */}
      <section className="py-16 bg-emerald-50 border-t border-emerald-100">
        <div className="max-w-xl mx-auto text-center px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to start?</h2>
          <p className="text-gray-500 mb-6">It takes less than 2 minutes to set up your teacher account.</p>
          <button
            onClick={handleBecome}
            disabled={loading}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors shadow-sm disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
            {loading ? "Setting up…" : "Get Started Now"}
          </button>
        </div>
      </section>
    </div>
  );
}
