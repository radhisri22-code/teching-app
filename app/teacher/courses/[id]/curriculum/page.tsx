"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp,
  Video, Youtube, Link as LinkIcon, Upload,
  Eye, EyeOff, GripVertical, Check, X, Loader2,
  BookOpen, AlertCircle, Globe
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────

interface Lesson {
  id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  videoType: string;
  duration?: string;
  isFree: boolean;
  order: number;
}

interface Section {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  published: boolean;
  sections: Section[];
}

// ─── Video Preview Helper ───────────────────────────────────────────────────

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match?.[1] ?? null;
}

function VideoPreview({ url, type }: { url: string; type: string }) {
  if (!url) return null;

  if (type === "YOUTUBE") {
    const id = getYouTubeId(url);
    if (!id) return <p className="text-xs text-red-500">Invalid YouTube URL</p>;
    return (
      <div className="rounded-xl overflow-hidden aspect-video bg-black mt-2">
        <iframe
          src={`https://www.youtube.com/embed/${id}`}
          className="w-full h-full"
          allowFullScreen
          title="YouTube preview"
        />
      </div>
    );
  }

  if (type === "UPLOAD" || type === "URL") {
    return (
      <div className="rounded-xl overflow-hidden aspect-video bg-black mt-2">
        <video src={url} controls className="w-full h-full" />
      </div>
    );
  }
  return null;
}

// ─── Add Lesson Modal ───────────────────────────────────────────────────────

function AddLessonModal({
  courseId,
  sectionId,
  onClose,
  onAdded,
}: {
  courseId: string;
  sectionId: string;
  onClose: () => void;
  onAdded: (lesson: Lesson) => void;
}) {
  const [tab, setTab] = useState<"youtube" | "url" | "upload">("youtube");
  const [form, setForm] = useState({
    title: "",
    description: "",
    videoUrl: "",
    duration: "",
    isFree: false,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const videoType = tab === "youtube" ? "YOUTUBE" : tab === "upload" ? "UPLOAD" : "URL";

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
      };

      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            setForm((f) => ({ ...f, videoUrl: data.url }));
            resolve();
          } else reject(new Error("Upload failed"));
        };
        xhr.onerror = () => reject(new Error("Upload error"));
        xhr.open("POST", "/api/upload/video");
        xhr.send(fd);
      });
    } catch (err) {
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) return alert("Lesson title is required.");
    setSaving(true);
    try {
      const res = await fetch(
        `/api/teacher/courses/${courseId}/sections/${sectionId}/lessons`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, videoType }),
        }
      );
      if (res.ok) {
        const lesson = await res.json();
        onAdded(lesson);
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  const tabCls = (t: string) =>
    `flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
    }`;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Add New Lesson</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Lesson Title *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Introduction to Variables"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (optional)</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What will students learn in this lesson?"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Video Source Tabs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Video Source</label>
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
              <button type="button" onClick={() => setTab("youtube")} className={tabCls("youtube")}>
                <Youtube className="w-4 h-4 text-red-500" /> YouTube
              </button>
              <button type="button" onClick={() => setTab("url")} className={tabCls("url")}>
                <Globe className="w-4 h-4 text-blue-500" /> Video URL
              </button>
              <button type="button" onClick={() => setTab("upload")} className={tabCls("upload")}>
                <Upload className="w-4 h-4 text-emerald-500" /> Upload File
              </button>
            </div>

            {/* YouTube Tab */}
            {tab === "youtube" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-xs text-red-700">
                  <Youtube className="w-4 h-4 flex-shrink-0" />
                  Paste a YouTube video URL — students will watch it embedded in the course.
                </div>
                <input
                  value={form.videoUrl}
                  onChange={(e) => { setForm({ ...form, videoUrl: e.target.value }); setPreview(false); }}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {form.videoUrl && (
                  <button
                    type="button"
                    onClick={() => setPreview(!preview)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                  >
                    {preview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {preview ? "Hide preview" : "Show preview"}
                  </button>
                )}
                {preview && <VideoPreview url={form.videoUrl} type="YOUTUBE" />}
              </div>
            )}

            {/* URL Tab */}
            {tab === "url" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl text-xs text-blue-700">
                  <Globe className="w-4 h-4 flex-shrink-0" />
                  Paste a direct video URL (mp4, webm, etc.) — e.g. from Cloudflare R2 or AWS S3.
                </div>
                <input
                  value={form.videoUrl}
                  onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  placeholder="https://your-cdn.com/video.mp4"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {form.videoUrl && <VideoPreview url={form.videoUrl} type="URL" />}
              </div>
            )}

            {/* Upload Tab */}
            {tab === "upload" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl text-xs text-emerald-700">
                  <Upload className="w-4 h-4 flex-shrink-0" />
                  Upload a video file directly (mp4, webm, mov). Max 500 MB.
                </div>

                {!form.videoUrl ? (
                  <div
                    className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors"
                    onClick={() => fileRef.current?.click()}
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFileUpload(f);
                      }}
                    />
                    {uploading ? (
                      <div className="space-y-3">
                        <Loader2 className="w-10 h-10 text-emerald-500 mx-auto animate-spin" />
                        <div className="text-sm font-medium text-gray-700">Uploading... {uploadProgress}%</div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden max-w-xs mx-auto">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <div className="text-sm font-medium text-gray-700">Click to select video</div>
                        <div className="text-xs text-gray-400 mt-1">MP4, WebM, MOV, AVI — max 500 MB</div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
                      <Check className="w-4 h-4" /> Video uploaded successfully!
                    </div>
                    <VideoPreview url={form.videoUrl} type="UPLOAD" />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, videoUrl: "" })}
                      className="text-xs text-red-500 hover:text-red-600"
                    >
                      Remove and upload different video
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Duration & Free */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration</label>
              <input
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="e.g. 8:45"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex items-end pb-0.5">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={form.isFree}
                    onChange={(e) => setForm({ ...form, isFree: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Free Preview</div>
                  <div className="text-xs text-gray-400">Visible without enrolling</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || uploading}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {saving ? "Adding..." : "Add Lesson"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Curriculum Page ───────────────────────────────────────────────────

export default function CurriculumPage() {
  const params = useParams();
  const courseId = params.id as string;
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingSection, setAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [savingSection, setSavingSection] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [addLessonTo, setAddLessonTo] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  const fetchCourse = async () => {
    setLoading(true);
    const res = await fetch(`/api/teacher/courses/${courseId}`);
    if (res.ok) {
      const data = await res.json();
      setCourse(data);
      setExpandedSections(new Set(data.sections.map((s: Section) => s.id)));
    }
    setLoading(false);
  };

  useEffect(() => { fetchCourse(); }, [courseId]);

  const addSection = async () => {
    if (!newSectionTitle.trim()) return;
    setSavingSection(true);
    const res = await fetch(`/api/teacher/courses/${courseId}/sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newSectionTitle }),
    });
    if (res.ok) {
      const section = await res.json();
      setCourse((c) => c ? { ...c, sections: [...c.sections, { ...section, lessons: [] }] } : c);
      setExpandedSections((s) => new Set(Array.from(s).concat(section.id)));
      setNewSectionTitle("");
      setAddingSection(false);
    }
    setSavingSection(false);
  };

  const deleteSection = async (sectionId: string) => {
    if (!confirm("Delete this section and all its lessons?")) return;
    await fetch(`/api/teacher/courses/${courseId}/sections/${sectionId}`, { method: "DELETE" });
    setCourse((c) => c ? { ...c, sections: c.sections.filter((s) => s.id !== sectionId) } : c);
  };

  const deleteLesson = async (sectionId: string, lessonId: string) => {
    if (!confirm("Delete this lesson?")) return;
    await fetch(`/api/teacher/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`, {
      method: "DELETE",
    });
    setCourse((c) =>
      c
        ? {
            ...c,
            sections: c.sections.map((s) =>
              s.id === sectionId ? { ...s, lessons: s.lessons.filter((l) => l.id !== lessonId) } : s
            ),
          }
        : c
    );
  };

  const toggleSection = (id: string) => {
    setExpandedSections((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const togglePublish = async () => {
    if (!course) return;
    setPublishing(true);
    const res = await fetch(`/api/teacher/courses/${courseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !course.published }),
    });
    if (res.ok) {
      setCourse((c) => c ? { ...c, published: !c.published } : c);
    }
    setPublishing(false);
  };

  const totalLessons = course?.sections.reduce((sum, s) => sum + s.lessons.length, 0) ?? 0;

  const videoIcon = (type: string) => {
    if (type === "YOUTUBE") return <Youtube className="w-3.5 h-3.5 text-red-500" />;
    if (type === "UPLOAD") return <Upload className="w-3.5 h-3.5 text-emerald-500" />;
    return <Globe className="w-3.5 h-3.5 text-blue-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-32">
        <p className="text-gray-500">Course not found.</p>
        <Link href="/teacher/courses" className="text-emerald-600 hover:underline mt-2 inline-block">Back to courses</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/teacher/courses" className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 line-clamp-1">{course.title}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {course.sections.length} sections · {totalLessons} lessons
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/teacher/courses/${courseId}`}
            className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Course Settings
          </Link>
          <button
            onClick={togglePublish}
            disabled={publishing}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
              course.published
                ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                : "bg-emerald-500 text-white hover:bg-emerald-600"
            }`}
          >
            {publishing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : course.published ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            {course.published ? "Unpublish" : "Publish Course"}
          </button>
        </div>
      </div>

      {/* Publish Warning */}
      {!course.published && totalLessons === 0 && (
        <div className="flex items-center gap-2 p-4 mb-6 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          Add at least one lesson before publishing your course.
        </div>
      )}

      {/* Sections */}
      <div className="space-y-4 mb-6">
        {course.sections.length === 0 && (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-600 mb-1">No sections yet</h3>
            <p className="text-sm text-gray-400">Create your first section to start adding lessons.</p>
          </div>
        )}

        {course.sections.map((section, si) => (
          <div key={section.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Section Header */}
            <div className="flex items-center gap-3 px-5 py-4 bg-gray-50 border-b border-gray-100">
              <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-xs font-bold text-gray-400 w-6">S{si + 1}</span>
                <span className="font-semibold text-gray-800 truncate">{section.title}</span>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  ({section.lessons.length} lesson{section.lessons.length !== 1 ? "s" : ""})
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setAddLessonTo(section.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Lesson
                </button>
                <button
                  onClick={() => deleteSection(section.id)}
                  className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleSection(section.id)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {expandedSections.has(section.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Lessons */}
            {expandedSections.has(section.id) && (
              <div>
                {section.lessons.length === 0 ? (
                  <div className="px-5 py-6 text-center">
                    <Video className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No lessons yet.</p>
                    <button
                      onClick={() => setAddLessonTo(section.id)}
                      className="mt-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      + Add first lesson
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {section.lessons.map((lesson, li) => (
                      <div key={lesson.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition-colors group">
                        <GripVertical className="w-4 h-4 text-gray-200 flex-shrink-0" />
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-bold text-gray-400">{li + 1}</span>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {videoIcon(lesson.videoType)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-gray-800 truncate block">{lesson.title}</span>
                          {lesson.duration && (
                            <span className="text-xs text-gray-400">{lesson.duration}</span>
                          )}
                        </div>

                        {lesson.isFree && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full flex-shrink-0">
                            Free
                          </span>
                        )}

                        {lesson.videoUrl ? (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full flex-shrink-0">
                            Video ✓
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full flex-shrink-0">
                            No video
                          </span>
                        )}

                        <button
                          onClick={() => deleteLesson(section.id, lesson.id)}
                          className="p-1.5 text-gray-200 hover:text-red-500 opacity-0 group-hover:opacity-100 rounded-lg hover:bg-red-50 transition-all flex-shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Section */}
      {addingSection ? (
        <div className="bg-white rounded-2xl border-2 border-emerald-200 shadow-sm p-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">New Section Title</label>
          <div className="flex gap-3">
            <input
              autoFocus
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addSection(); if (e.key === "Escape") setAddingSection(false); }}
              placeholder="e.g. Getting Started, Core Concepts..."
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <button
              onClick={addSection}
              disabled={savingSection || !newSectionTitle.trim()}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white text-sm font-semibold rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-60"
            >
              {savingSection ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Add
            </button>
            <button
              onClick={() => { setAddingSection(false); setNewSectionTitle(""); }}
              className="px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAddingSection(true)}
          className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-200 text-gray-500 rounded-2xl hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all font-medium text-sm"
        >
          <Plus className="w-5 h-5" /> Add New Section
        </button>
      )}

      {/* Add Lesson Modal */}
      {addLessonTo && (
        <AddLessonModal
          courseId={courseId}
          sectionId={addLessonTo}
          onClose={() => setAddLessonTo(null)}
          onAdded={(lesson) => {
            setCourse((c) =>
              c
                ? {
                    ...c,
                    sections: c.sections.map((s) =>
                      s.id === addLessonTo ? { ...s, lessons: [...s.lessons, lesson] } : s
                    ),
                  }
                : c
            );
          }}
        />
      )}
    </div>
  );
}
