"use client";

import { useState, useEffect, useCallback } from "react";
import { useDashboardSession }  from "@/app/dashboard/SessionContext";
import { canDo }                from "@/lib/permissions";
import {
  fetchGivingBack, createGivingBackItem,
  updateGivingBackItem, deleteGivingBackItem,
} from "@/lib/dashboardApi";
import { C } from "@/lib/brand";

const BLANK = {
  title           : "",
  description     : "",
  impact_statement: "",
  emoji           : "🌱",
  active          : true,
  sort_order      : 0,
};

function Label({ children }) {
  return (
    <label className="block font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-1.5">
      {children}
    </label>
  );
}

export default function DashboardGivingBackPage() {
  const { user } = useDashboardSession();

  const [items,    setItems  ] = useState([]);
  const [loading,  setLoading] = useState(true);
  const [saving,   setSaving ] = useState(false);
  const [error,    setError  ] = useState(null);
  const [editing,  setEditing] = useState(null); // null | 'new' | item object
  const [form,     setForm   ] = useState(BLANK);
  const [confirm,  setConfirm] = useState(null);

  const canWrite  = canDo(user?.role, "givingback", "update");
  const canCreate = canDo(user?.role, "givingback", "create");
  const canDelete = canDo(user?.role, "givingback", "delete");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchGivingBack();
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
    setForm({ ...BLANK, sort_order: nextOrder });
    setEditing("new");
  }

  function openEdit(item) {
    setForm({
      title           : item.title,
      description     : item.description,
      impact_statement: item.impact_statement ?? "",
      emoji           : item.emoji,
      active          : item.active,
      sort_order      : item.sort_order,
    });
    setEditing(item);
  }

  function closeEditor() {
    setEditing(null);
    setForm(BLANK);
    setError(null);
  }

  async function handleSave() {
    if (!form.title.trim())       { setError("Title is required.");       return; }
    if (!form.description.trim()) { setError("Description is required."); return; }
    setSaving(true);
    setError(null);
    try {
      if (editing === "new") {
        await createGivingBackItem(form);
      } else {
        await updateGivingBackItem(editing.id, form);
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
      await updateGivingBackItem(item.id, { active: !item.active });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteGivingBackItem(id);
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
            Giving Back
          </h1>
          <p className="font-sans text-brand-smoke text-[13px]">
            {items.filter((i) => i.active).length} active initiative{items.filter((i) => i.active).length !== 1 ? "s" : ""} on{" "}
            <a href="/givingback" target="_blank" rel="noopener"
              className="text-brand-orange font-extrabold no-underline hover:underline">
              /givingback
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
            Add Initiative
          </button>
        )}
      </div>

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
              {editing === "new" ? "✦ New Initiative" : "✦ Edit Initiative"}
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-300 px-4 py-3 font-sans text-[13px] text-red-600 mb-5">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">

              <div className="sm:col-span-2">
                <Label>Title</Label>
                <input className={inputCls} value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Initiative name…" />
              </div>

              <div className="sm:col-span-2">
                <Label>Description</Label>
                <textarea className={`${inputCls} resize-y min-h-[120px]`} value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Describe what this initiative is and how it works…" />
              </div>

              <div className="sm:col-span-2">
                <Label>Impact Statement <span className="font-normal normal-case tracking-normal text-brand-smoke/50">(optional — shown as a highlighted quote)</span></Label>
                <input className={inputCls} value={form.impact_statement}
                  onChange={(e) => setForm((f) => ({ ...f, impact_statement: e.target.value }))}
                  placeholder="e.g. Supporting 200+ families in Calhoun County." />
              </div>

              <div>
                <Label>Emoji</Label>
                <input className={inputCls} value={form.emoji} maxLength={4}
                  onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
                  placeholder="🌱" />
              </div>

              <div>
                <Label>Sort Order</Label>
                <input className={inputCls} type="number" min="0" value={form.sort_order}
                  onChange={(e) => setForm((f) => ({ ...f, sort_order: parseInt(e.target.value, 10) || 0 }))} />
              </div>

              <div>
                <Label>Visibility</Label>
                <div className="flex gap-3">
                  {[{ label: "Active", val: true }, { label: "Hidden", val: false }].map(({ label, val }) => (
                    <button key={label} onClick={() => setForm((f) => ({ ...f, active: val }))}
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
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <button onClick={handleSave} disabled={saving}
                className="font-sans font-extrabold text-[11px] tracking-[1.5px] uppercase px-6 py-2.5 bg-brand-orange text-brand-cream border-[3px] border-brand-black cursor-pointer shadow-retro-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                {saving ? "Saving…" : (editing === "new" ? "Add Initiative" : "Save Changes")}
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
          <div className="text-[48px] mb-4">🌱</div>
          <h2 className="font-serif font-black text-brand-black text-[20px] mb-2">No initiatives yet</h2>
          <p className="font-sans text-brand-smoke text-[13px] mb-6 max-w-[300px] mx-auto leading-relaxed">
            Add your first community initiative to display it on /givingback.
          </p>
          {canCreate && (
            <button onClick={openNew}
              className="font-sans font-extrabold text-[11px] tracking-[1.5px] uppercase px-6 py-3 bg-brand-orange text-brand-cream border-[3px] border-brand-black cursor-pointer shadow-retro-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
              Add First Initiative
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id}
              className="bg-white border-[2px] border-brand-black/10 hover:border-brand-black transition-colors">
              {confirm === item.id ? (
                <div className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap bg-red-50">
                  <p className="font-sans text-[13px] text-red-700">
                    Delete <strong>{item.title}</strong>? This cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <button onClick={() => handleDelete(item.id)}
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
                    <div className="text-[28px] leading-none flex-shrink-0">{item.emoji}</div>
                    <div className="min-w-0">
                      <div className="font-serif font-black text-brand-black text-[15px] truncate flex items-center gap-2">
                        {item.title}
                        {!item.active && (
                          <span className="font-sans font-extrabold text-[9px] tracking-[1.5px] uppercase px-2 py-0.5 bg-gray-100 text-brand-smoke border border-gray-200">
                            Hidden
                          </span>
                        )}
                      </div>
                      <div className="font-sans text-[11px] text-brand-smoke/60 mt-0.5 truncate max-w-[380px]">
                        {item.description}
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
                      <button onClick={() => setConfirm(item.id)}
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
