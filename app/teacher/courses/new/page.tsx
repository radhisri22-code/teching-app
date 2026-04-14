"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Upload, X, Image as ImageIcon } from "lucide-react";

const categories = [
  "Web Development", "Data Science", "Design", "Cloud",
  "Programming", "DevOps", "Marketing", "Business", "Finance",
  "Photography", "Music", "Health & Fitness", "Language",
];

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    longDesc: "",
    price: "",
    thumbnail: "",
    category: "Web Development",
    level: "BEGINNER",
    duration: "",
  });

  const inputClass =
    "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  const handleThumbnailUpload = async (file: File) => {
    setThumbnailUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/thumbnail", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setForm((f) => ({ ...f, thumbnail: data.url }));
    } finally {
      setThumbnailUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/teacher/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const course = await res.json();
        router.push(`/teacher/courses/${course.id}/curriculum`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/teacher/courses" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
          <p className="text-gray-500 text-sm mt-0.5">Fill in the basics — you can add videos next</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Section 1 — Course Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-5 pb-3 border-b border-gray-100">
            📝 Course Information
          </h2>

          <div className="space-y-5">
            <div>
              <label className={labelClass}>Course Title *</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Complete Python Bootcamp: From Zero to Hero"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Short Description *</label>
              <input
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="One-line description shown on course cards (max 150 chars)"
                maxLength={150}
                className={inputClass}
              />
              <p className="text-xs text-gray-400 mt-1">{form.description.length}/150</p>
            </div>

            <div>
              <label className={labelClass}>Full Description</label>
              <textarea
                rows={6}
                value={form.longDesc}
                onChange={(e) => setForm({ ...form, longDesc: e.target.value })}
                placeholder={`What will students learn?\nWhat are the requirements?\nWho is this course for?`}
                className={inputClass + " resize-none"}
              />
            </div>
          </div>
        </div>

        {/* Section 2 — Thumbnail */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-2 flex items-center gap-2">
            🖼️ Course Thumbnail
          </h2>
          <p className="text-sm text-gray-500 mb-5">Upload an image or paste a URL. Recommended: 1280×720 px.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Upload Box */}
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                thumbnailUploading ? "border-emerald-300 bg-emerald-50" : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50"
              }`}
              onClick={() => fileRef.current?.click()}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleThumbnailUpload(f);
                }}
              />
              {thumbnailUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-emerald-600 font-medium">Uploading...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Click to upload image</span>
                  <span className="text-xs text-gray-400">JPG, PNG, WebP — max 5 MB</span>
                </div>
              )}
            </div>

            {/* URL Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Or paste image URL</label>
              <input
                value={form.thumbnail}
                onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className={inputClass}
              />
              {form.thumbnail && (
                <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, thumbnail: "" })}
                    className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              )}
              {!form.thumbnail && (
                <div className="rounded-xl bg-gray-100 aspect-video flex items-center justify-center">
                  <ImageIcon className="w-10 h-10 text-gray-300" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 3 — Details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-5 pb-3 border-b border-gray-100">
            ⚙️ Course Details
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>Price (₹) *</label>
              <input
                type="number"
                min="0"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0 = Free"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Category *</label>
              <select
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={inputClass}
              >
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Level</label>
              <select
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
                className={inputClass}
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Total Duration</label>
              <input
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="e.g. 24 hours"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Link
            href="/teacher/courses"
            className="px-5 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 shadow-sm"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {loading ? "Creating..." : "Create & Add Videos →"}
          </button>
        </div>
      </form>
    </div>
  );
}
