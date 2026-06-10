"use client";

import { useState, useEffect, useCallback } from "react";
import { useDashboardSession }  from "@/app/dashboard/SessionContext";
import { canDo }                from "@/lib/permissions";
import {
  fetchNotes, createNote, updateNote, deleteNote,
} from "@/lib/dashboardApi";
import { C } from "@/lib/brand";

function slugify(title) {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

const BLANK = { title: "", body: "", excerpt: "", status: "draft" };

function Label({ children }) {
  return (
    <label className="block font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-1.5">
      {children}
    </label>
  );
}

export default function DashboardNotesPage() {
  const { user } = useDashboardSession();

  const [notes,    setNotes   ] = useState([]);
  const [loading,  setLoading ] = useState(true);
  const [saving,   setSaving  ] = useState(false);
  const [error,    setError   ] = useState(null);
  const [editing,  setEditing ] = useState(null); // null | 'new' | note object
  const [form,     setForm    ] = useState(BLANK);
  const [confirm,  setConfirm ] = useState(null); // id to confirm delete

  const canWrite  = canDo(user?.role, "notes", "update");
  const canCreate = canDo(user?.role, "notes", "create");
  const canDelete = canDo(user?.role, "notes", "delete");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchNotes();
      setNotes(res.data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openNew() {
    setForm(BLANK);
    setEditing("new");
  }

  function openEdit(note) {
    setForm({
      title  : note.title,
      body   : note.body,
      excerpt: note.excerpt ?? "",
      status : note.status,
    });
    setEditing(note);
  }

  function closeEditor() {
    setEditing(null);
    setForm(BLANK);
    setError(null);
  }

  async function handleSave() {
    if (!form.title.trim()) { setError("Title is required."); return; }
    if (!form.body.trim())  { setError("Body is required.");  return; }
    setSaving(true);
    setError(null);
    try {
      if (editing === "new") {
        await createNote(form);
      } else {
        await updateNote(editing.id, form);
      }
      await load();
      closeEditor();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(note) {
    try {
      await updateNote(note.id, {
        status: note.status === "published" ? "draft" : "published",
      });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteNote(id);
      setConfirm(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  const inputCls = "w-full border-[2px] border-gray-200 px-4 py-3 font-sans text-[13px] text-brand-black placeholder:text-brand-smoke/40 focus:outline-none focus:border-brand-orange transition-colors";

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24"
        fill="none" stroke={C.blush} strokeWidth="2.5">
        <path d="M21 12a9 9 0 11-6.219-8.56" />
      </svg>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif font-black text-brand-black text-[26px] tracking-[-1px] leading-none mb-1">
            Notes
          </h1>
          <p className="font-sans text-brand-smoke text-[13px]">
            {notes.length} {notes.length === 1 ? "note" : "notes"} · published on{" "}
            <a href="/notes" target="_blank" rel="noopener"
              className="text-brand-orange font-extrabold no-underline hover:underline">
              /notes
            </a>
          </p>
        </div>
        {canCreate && editing === null && (
          <button
            onClick={openNew}
            className="font-sans font-extrabold text-[11px] tracking-[1.5px] uppercase px-5 py-2.5 bg-brand-orange text-brand-cream border-[3px] border-brand-black cursor-pointer shadow-retro-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-2"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Note
          </button>
        )}
      </div>

      {/* Global error */}
      {error && editing === null && (
        <div className="bg-red-50 border-2 border-red-300 px-4 py-3 font-sans text-[13px] text-red-600">
          {error}
        </div>
      )}

      {/* Editor panel */}
      {editing !== null && (
        <div className="bg-white border-[3px] border-brand-black shadow-retro-md overflow-hidden">
          <div
            className="h-[5px] w-full"
            style={{
              background: `repeating-linear-gradient(90deg,
                ${C.blush} 0, ${C.blush} 32px,
                ${C.gold}   32px, ${C.gold}   40px,
                ${C.black}  40px, ${C.black}  44px)`,
            }}
          />
          <div className="px-6 sm:px-8 py-6">
            <div className="font-sans font-extrabold text-[10px] tracking-[3px] uppercase text-brand-orange mb-5">
              {editing === "new" ? "✦ New Note" : "✦ Edit Note"}
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-300 px-4 py-3 font-sans text-[13px] text-red-600 mb-5">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              <div className="sm:col-span-2">
                <Label>Title</Label>
                <input
                  className={inputCls}
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Note title…"
                />
                {form.title && (
                  <div className="font-sans text-[10px] text-brand-smoke/50 mt-1">
                    Slug: /notes/{slugify(form.title)}
                  </div>
                )}
              </div>

              <div className="sm:col-span-2">
                <Label>Body</Label>
                <textarea
                  className={`${inputCls} resize-y min-h-[260px]`}
                  value={form.body}
                  onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                  placeholder="Write your note here. Each blank line becomes a paragraph."
                />
              </div>

              <div className="sm:col-span-2">
                <Label>Excerpt <span className="font-normal normal-case tracking-normal text-brand-smoke/50">(optional — auto-generated if left blank)</span></Label>
                <input
                  className={inputCls}
                  value={form.excerpt}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  placeholder="Short preview shown on the /notes listing…"
                />
              </div>

              <div>
                <Label>Status</Label>
                <div className="flex gap-3">
                  {["draft", "published"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setForm((f) => ({ ...f, status: s }))}
                      className={`flex-1 py-2.5 font-sans font-extrabold text-[10px] tracking-[2px] uppercase border-[2px] cursor-pointer transition-all ${
                        form.status === s
                          ? "bg-brand-orange text-brand-cream border-brand-orange"
                          : "bg-white text-brand-smoke border-gray-200 hover:border-brand-orange"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={handleSave}
                disabled={saving}
                className="font-sans font-extrabold text-[11px] tracking-[1.5px] uppercase px-6 py-2.5 bg-brand-orange text-brand-cream border-[3px] border-brand-black cursor-pointer shadow-retro-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {saving ? "Saving…" : (editing === "new" ? "Create Note" : "Save Changes")}
              </button>
              <button
                onClick={closeEditor}
                className="font-sans font-extrabold text-[11px] tracking-[1.5px] uppercase px-4 py-2.5 text-brand-smoke hover:text-brand-black transition-colors cursor-pointer bg-transparent border-none"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes list */}
      {notes.length === 0 && editing === null ? (
        <div className="bg-white border-[3px] border-dashed border-gray-200 px-8 py-16 text-center">
          <div className="text-[48px] mb-4">✍️</div>
          <h2 className="font-serif font-black text-brand-black text-[20px] mb-2">No notes yet</h2>
          <p className="font-sans text-brand-smoke text-[13px] mb-6 max-w-[300px] mx-auto leading-relaxed">
            Write your first note and publish it to make it visible on /notes.
          </p>
          {canCreate && (
            <button onClick={openNew}
              className="font-sans font-extrabold text-[11px] tracking-[1.5px] uppercase px-6 py-3 bg-brand-orange text-brand-cream border-[3px] border-brand-black cursor-pointer shadow-retro-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
              Write Your First Note
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-white border-[2px] border-brand-black/10 hover:border-brand-black transition-colors"
            >
              {/* Delete confirm overlay */}
              {confirm === note.id ? (
                <div className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap bg-red-50">
                  <p className="font-sans text-[13px] text-red-700">
                    Delete <strong>{note.title}</strong>? This cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <button onClick={() => handleDelete(note.id)}
                      className="font-sans font-extrabold text-[10px] tracking-[1px] uppercase px-4 py-2 bg-red-600 text-white border-[2px] border-red-700 cursor-pointer hover:bg-red-700 transition-colors">
                      Yes, Delete
                    </button>
                    <button onClick={() => setConfirm(null)}
                      className="font-sans font-extrabold text-[10px] tracking-[1px] uppercase px-4 py-2 bg-transparent text-brand-smoke border-[2px] border-gray-200 cursor-pointer hover:border-brand-black transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Status dot */}
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: note.status === "published" ? "#22C55E" : "#9CA3AF" }}
                    />
                    <div className="min-w-0">
                      <div className="font-serif font-black text-brand-black text-[15px] truncate">
                        {note.title}
                      </div>
                      <div className="font-sans text-[11px] text-brand-smoke/60 mt-0.5">
                        {note.status === "published"
                          ? `Published ${formatDate(note.published_at)}`
                          : `Draft · Created ${formatDate(note.created_at)}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Publish/unpublish toggle */}
                    {canWrite && (
                      <button
                        onClick={() => handleToggleStatus(note)}
                        className="font-sans font-extrabold text-[9px] tracking-[1.5px] uppercase px-3 py-1.5 border-[2px] cursor-pointer transition-all"
                        style={{
                          borderColor: note.status === "published" ? "#8C8288" : C.blush,
                          color       : note.status === "published" ? "#8C8288" : C.blush,
                        }}
                      >
                        {note.status === "published" ? "Unpublish" : "Publish"}
                      </button>
                    )}
                    {/* Edit */}
                    {canWrite && (
                      <button onClick={() => openEdit(note)}
                        className="font-sans font-extrabold text-[9px] tracking-[1.5px] uppercase px-3 py-1.5 border-[2px] border-brand-black text-brand-black cursor-pointer hover:bg-brand-black hover:text-brand-cream transition-all">
                        Edit
                      </button>
                    )}
                    {/* Delete */}
                    {canDelete && (
                      <button onClick={() => setConfirm(note.id)}
                        className="font-sans font-extrabold text-[9px] tracking-[1.5px] uppercase px-3 py-1.5 border-[2px] border-red-300 text-red-500 cursor-pointer hover:bg-red-50 transition-all">
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
