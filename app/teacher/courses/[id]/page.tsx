"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Save, Upload, X, Image as ImageIcon,
  Loader2, Video, Eye
} from "lucide-react";

const categories = [
  "Web Development", "Data Science", "Design", "Cloud",
  "Programming", "DevOps", "Marketing", "Business", "Finance",
  "Photography", "Music", "Health & Fitness", "Language",
];

interface CourseForm {
  title: string;
  description: string;
  longDesc: string;
  price: string;
  thumbnail: string;
  category: string;
  level: string;
  duration: string;
  published: boolean;
}

export default function CourseSettingsPage() {
  const params = useParams();
  const courseId = params.id as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [thumbUploading, setThumbUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<CourseForm>({
    title: "",
    description: "",
    longDesc: "",
    price: "",
    thumbnail: "",
    category: "Web Development",
    level: "BEGINNER",
    duration: "",
    published: false,
  });

  useEffect(() => {
    fetch(`/api/teacher/courses/${courseId}`)
      .then((r) => r.json())
      .then((data) => {
        setForm({
          title: data.title ?? "",
          description: data.description ?? "",
          longDesc: data.longDesc ?? "",
          price: String(data.price ?? "0"),
          thumbnail: data.thumbnail ?? "",
          category: data.category ?? "Web Development",
          level: data.level ?? "BEGINNER",
          duration: data.duration ?? "",
          published: data.published ?? false,
        });
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleThumbUpload = async (file: File) => {
    setThumbUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/thumbnail", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setForm((f) => ({ ...f, thumbnail: data.url }));
    } finally {
      setThumbUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: parseFloat(form.price) || 0 }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } finally {
      setSaving(false);
    }
  };

  const inp = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white";
  const lbl = "block text-sm font-medium text-gray-700 mb-1.5";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/teacher/courses" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Course Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5 truncate">{form.title}</p>
        </div>
        <Link
          href={`/teacher/courses/${courseId}/curriculum`}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-xl hover:bg-emerald-100 transition-colors"
        >
          <Video className="w-4 h-4" /> Edit Curriculum
        </Link>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-5 pb-3 border-b border-gray-100">📝 Basic Info</h2>
          <div className="space-y-4">
            <div>
              <label className={lbl}>Course Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inp} />
            </div>
            <div>
              <label className={lbl}>Short Description</label>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                maxLength={150}
                className={inp}
              />
              <p className="text-xs text-gray-400 mt-1">{form.description.length}/150</p>
            </div>
            <div>
              <label className={lbl}>Full Description</label>
              <textarea
                rows={6}
                value={form.longDesc}
                onChange={(e) => setForm({ ...form, longDesc: e.target.value })}
                className={inp + " resize-none"}
              />
            </div>
          </div>
        </div>

        {/* Thumbnail */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-5 pb-3 border-b border-gray-100">🖼️ Thumbnail</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleThumbUpload(f); }}
              />
              {thumbUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                  <span className="text-sm text-emerald-600 font-medium">Uploading…</span>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-600">Upload new image</div>
                  <div className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — max 5 MB</div>
                </>
              )}
            </div>
            <div className="space-y-2">
              <label className={lbl}>Or paste URL</label>
              <input
                value={form.thumbnail}
                onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                placeholder="https://..."
                className={inp}
              />
              <div className="rounded-xl overflow-hidden bg-gray-100 aspect-video flex items-center justify-center">
                {form.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-300" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-5 pb-3 border-b border-gray-100">⚙️ Details & Pricing</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            <div>
              <label className={lbl}>Price (₹)</label>
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className={inp}
              />
            </div>
            <div>
              <label className={lbl}>Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inp}>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Level</label>
              <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className={inp}>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
            <div>
              <label className={lbl}>Duration</label>
              <input
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="e.g. 24 hours"
                className={inp}
              />
            </div>
          </div>

          {/* Publish toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <div className="text-sm font-medium text-gray-800">
                {form.published ? "Course is Published" : "Course is a Draft"}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {form.published
                  ? "Visible to all students on the marketplace."
                  : "Only you can see this course. Publish when ready."}
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
            </label>
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/teacher/courses"
            className="px-5 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-6 py-2.5 font-semibold rounded-xl transition-colors shadow-sm ${
              saved
                ? "bg-green-500 text-white"
                : "bg-emerald-500 hover:bg-emerald-600 text-white"
            } disabled:opacity-60`}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
