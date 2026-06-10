"use client";

import { useState, useEffect, useCallback } from "react";
import Link                                  from "next/link";
import { useDashboardSession }               from "@/app/dashboard/SessionContext";
import { canDo }                             from "@/lib/permissions";
import {
  fetchCollections, createCollection,
  updateCollection, deleteCollection,
} from "@/lib/dashboardApi";
import { C } from "@/lib/brand";

const ACCENT_SWATCHES = [
  { hex: "#C08FA3", label: "Blush"    },
  { hex: "#1D1B1C", label: "Charcoal" },
  { hex: "#BFA05C", label: "Gold"     },
  { hex: "#0E0E0E", label: "Black"    },
  { hex: "#5C7A4E", label: "Sage"     },
  { hex: "#8B1A2A", label: "Crimson"  },
  { hex: "#1A3A2A", label: "Forest"   },
  { hex: "#4A3728", label: "Mocha"    },
  { hex: "#D4511A", label: "Orange"   },
  { hex: "#3D2B1A", label: "Bark"     },
  { hex: "#c5b9a9", label: "Sand"     },
  { hex: "#3B5A8A", label: "Slate"    },
];

const BLANK = {
  label      : "",
  emoji      : "🧤",
  accentColor: "#C08FA3",
  lightText  : false,
  headline   : "",
  subheadline: "",
  bodyCopy   : "",
  tags       : "",
  active     : true,
  sortOrder  : 0,
};

const inputCls = "w-full border-[2px] border-gray-200 px-4 py-3 font-sans text-[13px] text-brand-black placeholder:text-brand-smoke/40 focus:outline-none focus:border-brand-orange transition-colors";

function Label({ children }) {
  return (
    <label className="block font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-1.5">
      {children}
    </label>
  );
}

export default function CollectionsDashboardPage() {
  const { user } = useDashboardSession();

  const [items,   setItems  ] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving ] = useState(false);
  const [error,   setError  ] = useState(null);
  const [editing, setEditing] = useState(null); // null | "new" | item object
  const [form,    setForm   ] = useState(BLANK);
  const [confirm, setConfirm] = useState(null);

  const canWrite  = canDo(user?.role, "collections", "update");
  const canCreate = canDo(user?.role, "collections", "create");
  const canDelete = canDo(user?.role, "collections", "delete");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchCollections();
      setItems(res.data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openNew() {
    const nextOrder = items.length > 0 ? Math.max(...items.map((i) => i.sort_order)) + 1 : 0;
    setForm({ ...BLANK, sortOrder: nextOrder });
    setEditing("new");
  }

  function openEdit(item) {
    setForm({
      label      : item.label,
      emoji      : item.emoji,
      accentColor: item.accent_color,
      lightText  : item.light_text,
      headline   : item.headline,
      subheadline: item.subheadline,
      bodyCopy   : item.body_copy,
      tags       : (item.tags ?? []).join(", "),
      active     : item.active,
      sortOrder  : item.sort_order,
    });
    setEditing(item);
  }

  function closeEditor() {
    setEditing(null);
    setForm(BLANK);
    setError(null);
  }

  function setF(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave() {
    if (!form.label.trim()) { setError("Label is required."); return; }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        label      : form.label.trim(),
        emoji      : form.emoji,
        accentColor: form.accentColor,
        lightText  : form.lightText,
        headline   : form.headline.trim(),
        subheadline: form.subheadline.trim(),
        bodyCopy   : form.bodyCopy.trim(),
        tags       : form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        active     : form.active,
        sortOrder  : Number(form.sortOrder) || 0,
      };
      if (editing === "new") {
        await createCollection(payload);
      } else {
        await updateCollection(editing.id, payload);
      }
      await load();
      closeEditor();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(item) {
    try {
      await updateCollection(item.id, { active: !item.active });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteCollection(id);
      setConfirm(null);
      await load();
    } catch (err) {
      setError(err.message);
      setConfirm(null);
    }
  }

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
            Collections
          </h1>
          <p className="font-sans text-brand-smoke text-[13px]">
            {items.filter((i) => i.active).length} active collection{items.filter((i) => i.active).length !== 1 ? "s" : ""} on{" "}
            <Link href="/collections" target="_blank" rel="noopener"
              className="text-brand-orange font-extrabold no-underline hover:underline">
              /collections
            </Link>
            {items.length >= 12 && (
              <span className="ml-3 font-sans font-extrabold text-[10px] tracking-[1.5px] uppercase px-2 py-0.5 bg-amber-50 border border-amber-300 text-amber-700">
                Cap reached (12/12)
              </span>
            )}
          </p>
        </div>
        {canCreate && editing === null && items.length < 12 && (
          <button
            onClick={openNew}
            className="font-sans font-extrabold text-[11px] tracking-[1.5px] uppercase px-5 py-2.5 bg-brand-orange text-brand-cream border-[3px] border-brand-black cursor-pointer shadow-retro-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-2"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Collection
          </button>
        )}
      </div>

      {error && editing === null && (
        <div className="bg-red-50 border-2 border-red-300 px-4 py-3 font-sans text-[13px] text-red-600">
          {error}
        </div>
      )}

      {/* Inline editor */}
      {editing !== null && (
        <div className="bg-white border-[3px] border-brand-black shadow-retro-md overflow-hidden">
          <div
            className="h-[5px] w-full"
            style={{
              background: `repeating-linear-gradient(90deg,
                ${C.blush} 0, ${C.blush} 32px,
                ${C.gold}  32px, ${C.gold}  40px,
                ${C.black} 40px, ${C.black} 44px)`,
            }}
          />
          <div className="px-6 sm:px-8 py-6">
            <div className="font-sans font-extrabold text-[10px] tracking-[3px] uppercase text-brand-orange mb-5">
              {editing === "new" ? "âœ¦ New Collection" : `âœ¦ Edit — ${editing.label}`}
            </div>

            {editing !== "new" && (
              <div className="mb-5 flex items-center gap-2">
                <span className="font-sans font-extrabold text-[9px] tracking-[1.5px] uppercase text-brand-smoke/60">Slug (permanent):</span>
                <span className="font-mono text-[12px] bg-gray-100 px-2 py-0.5 border border-gray-200 text-brand-black">
                  {editing.slug}
                </span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-2 border-red-300 px-4 py-3 font-sans text-[13px] text-red-600 mb-5">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">

              <div>
                <Label>Label *</Label>
                <input className={inputCls} value={form.label}
                  onChange={(e) => setF("label", e.target.value)}
                  placeholder="e.g. Found & Given" />
              </div>

              <div>
                <Label>Emoji</Label>
                <input className={inputCls} value={form.emoji} maxLength={4}
                  onChange={(e) => setF("emoji", e.target.value)}
                  placeholder="🧤" />
              </div>

              <div>
                <Label>Headline</Label>
                <input className={inputCls} value={form.headline}
                  onChange={(e) => setF("headline", e.target.value)}
                  placeholder="e.g. Because You Thought of Them" />
              </div>

              <div>
                <Label>Subheadline</Label>
                <input className={inputCls} value={form.subheadline}
                  onChange={(e) => setF("subheadline", e.target.value)}
                  placeholder="One-liner shown under the headline" />
              </div>

              <div className="sm:col-span-2">
                <Label>Body Copy</Label>
                <textarea className={`${inputCls} resize-y min-h-[80px]`} value={form.bodyCopy}
                  onChange={(e) => setF("bodyCopy", e.target.value)}
                  placeholder="Short description shown when the collection is expandedâ€¦" />
              </div>

              <div className="sm:col-span-2">
                <Label>Tags <span className="font-normal normal-case tracking-normal text-brand-smoke/50">(comma-separated)</span></Label>
                <input className={inputCls} value={form.tags}
                  onChange={(e) => setF("tags", e.target.value)}
                  placeholder="e.g. Same-Day Available, Handwritten Note, All Ages" />
              </div>

              {/* Accent colour */}
              <div className="sm:col-span-2">
                <Label>Card Background Colour</Label>
                <div className="flex gap-2 flex-wrap mb-3">
                  {ACCENT_SWATCHES.map(({ hex, label }) => (
                    <button
                      key={hex}
                      type="button"
                      title={label}
                      onClick={() => setF("accentColor", hex)}
                      className={`w-9 h-9 border-[3px] cursor-pointer transition-transform hover:scale-110 ${
                        form.accentColor === hex
                          ? "border-brand-black scale-110 shadow-retro-sm"
                          : "border-transparent"
                      }`}
                      style={{ background: hex }}
                    />
                  ))}
                </div>
                <div
                  className="w-full h-10 border-2 border-brand-black/20 flex items-center justify-center gap-2"
                  style={{ background: form.accentColor }}
                >
                  <span className="text-[18px]">{form.emoji || "🧤"}</span>
                  <span
                    className="font-sans font-extrabold text-[10px] tracking-[1px] uppercase"
                    style={{ color: form.lightText ? "rgba(250,248,244,0.8)" : "rgba(14,14,14,0.8)" }}
                  >
                    {form.label || "Preview"}
                  </span>
                </div>
              </div>

              {/* Light text toggle */}
              <div>
                <Label>Text Colour on Card</Label>
                <div className="flex gap-3">
                  {[{ label: "Dark", val: false }, { label: "Light", val: true }].map(({ label, val }) => (
                    <button key={label} onClick={() => setF("lightText", val)}
                      className={`flex-1 py-2.5 font-sans font-extrabold text-[10px] tracking-[2px] uppercase border-[2px] cursor-pointer transition-all ${
                        form.lightText === val
                          ? "bg-brand-orange text-brand-cream border-brand-orange"
                          : "bg-white text-brand-smoke border-gray-200 hover:border-brand-orange"
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visibility */}
              <div>
                <Label>Visibility</Label>
                <div className="flex gap-3">
                  {[{ label: "Active", val: true }, { label: "Hidden", val: false }].map(({ label, val }) => (
                    <button key={label} onClick={() => setF("active", val)}
                      className={`flex-1 py-2.5 font-sans font-extrabold text-[10px] tracking-[2px] uppercase border-[2px] cursor-pointer transition-all ${
                        form.active === val
                          ? "bg-brand-orange text-brand-cream border-brand-orange"
                          : "bg-white text-brand-smoke border-gray-200 hover:border-brand-orange"
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Sort Order</Label>
                <input className={inputCls} type="number" min="0" value={form.sortOrder}
                  onChange={(e) => setF("sortOrder", e.target.value)} />
              </div>

            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <button onClick={handleSave} disabled={saving}
                className="font-sans font-extrabold text-[11px] tracking-[1.5px] uppercase px-6 py-2.5 bg-brand-orange text-brand-cream border-[3px] border-brand-black cursor-pointer shadow-retro-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                {saving ? "Savingâ€¦" : (editing === "new" ? "Create Collection" : "Save Changes")}
              </button>
              <button onClick={closeEditor}
                className="font-sans font-extrabold text-[11px] tracking-[1.5px] uppercase px-4 py-2.5 text-brand-smoke hover:text-brand-black transition-colors cursor-pointer bg-transparent border-none">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {items.length === 0 && editing === null ? (
        <div className="bg-white border-[3px] border-dashed border-gray-200 px-8 py-16 text-center">
          <div className="text-[48px] mb-4">ðŸ“¦</div>
          <h2 className="font-serif font-black text-brand-black text-[20px] mb-2">No collections yet</h2>
          <p className="font-sans text-brand-smoke text-[13px] mb-6 max-w-[300px] mx-auto leading-relaxed">
            Run the DB migration, then create your first collection here.
          </p>
          {canCreate && (
            <button onClick={openNew}
              className="font-sans font-extrabold text-[11px] tracking-[1.5px] uppercase px-6 py-3 bg-brand-orange text-brand-cream border-[3px] border-brand-black cursor-pointer shadow-retro-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
              Create First Collection
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id}
              className="bg-white border-[2px] border-brand-black/10 hover:border-brand-black transition-colors overflow-hidden">

              {/* Colour strip */}
              <div className="h-1.5 w-full" style={{ background: item.accent_color }} />

              {confirm === item.id ? (
                <div className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap bg-red-50">
                  <p className="font-sans text-[13px] text-red-700">
                    Delete <strong>{item.label}</strong>? This cannot be undone.
                    {item.assigned_count > 0 && (
                      <span className="block mt-1 text-red-500">
                        âš  {item.assigned_count} inventory item{item.assigned_count !== 1 ? "s are" : " is"} still assigned — you must remove them first.
                      </span>
                    )}
                  </p>
                  <div className="flex gap-3">
                    {item.assigned_count === 0 && (
                      <button onClick={() => handleDelete(item.id)}
                        className="font-sans font-extrabold text-[10px] tracking-[1px] uppercase px-4 py-2 bg-red-600 text-white border-[2px] border-red-700 cursor-pointer hover:bg-red-700 transition-colors">
                        Yes, Delete
                      </button>
                    )}
                    <button onClick={() => setConfirm(null)}
                      className="font-sans font-extrabold text-[10px] tracking-[1px] uppercase px-4 py-2 bg-transparent text-brand-smoke border-[2px] border-gray-200 cursor-pointer hover:border-brand-black transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="text-[28px] leading-none flex-shrink-0">{item.emoji}</div>
                    <div className="min-w-0">
                      <div className="font-serif font-black text-brand-black text-[15px] flex items-center gap-2 flex-wrap">
                        {item.label}
                        <span className="font-mono font-normal text-[10px] text-brand-smoke/50 bg-gray-100 px-1.5 py-0.5">
                          {item.slug}
                        </span>
                        {!item.active && (
                          <span className="font-sans font-extrabold text-[9px] tracking-[1.5px] uppercase px-2 py-0.5 bg-gray-100 text-brand-smoke border border-gray-200">
                            Hidden
                          </span>
                        )}
                      </div>
                      <div className="font-sans text-[11px] text-brand-smoke/60 mt-0.5 flex items-center gap-3">
                        <span className="truncate max-w-[300px]">{item.headline || "—"}</span>
                        <span className="flex-shrink-0 font-extrabold text-brand-smoke/40">
                          {item.assigned_count} item{item.assigned_count !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {canWrite && (
                      <button onClick={() => handleToggleActive(item)}
                        className="font-sans font-extrabold text-[9px] tracking-[1.5px] uppercase px-3 py-1.5 border-[2px] cursor-pointer transition-all"
                        style={{
                          borderColor: item.active ? "#8C8288" : C.blush,
                          color       : item.active ? "#8C8288" : C.blush,
                        }}>
                        {item.active ? "Hide" : "Show"}
                      </button>
                    )}
                    {canWrite && (
                      <button onClick={() => openEdit(item)}
                        className="font-sans font-extrabold text-[9px] tracking-[1.5px] uppercase px-3 py-1.5 border-[2px] border-brand-black text-brand-black cursor-pointer hover:bg-brand-black hover:text-brand-cream transition-all">
                        Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => setConfirm(item.id)}
                        title={item.assigned_count > 0 ? `${item.assigned_count} items assigned — remove them first` : "Delete collection"}
                        className={`font-sans font-extrabold text-[9px] tracking-[1.5px] uppercase px-3 py-1.5 border-[2px] transition-all ${
                          item.assigned_count > 0
                            ? "border-gray-200 text-gray-300 cursor-not-allowed"
                            : "border-red-300 text-red-500 cursor-pointer hover:bg-red-50"
                        }`}
                        disabled={item.assigned_count > 0}
                      >
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

