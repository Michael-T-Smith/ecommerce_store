// src/app/dashboard/(shell)/zones/page.js
//
// Delivery zones management — admin only.
// Cecelia can add, rename, reprice, reorder, and toggle zones.
// Changes are live immediately — checkout fetches zones from the API.

"use client";

import { useState, useEffect } from "react";
import { useDashboardSession }  from "@/app/dashboard/SessionContext";
import { PageSpinner, PageError } from "@/app/components/dashboard/PageStates/PageStates";
import { B } from "@/lib/brand";

const EMPTY_FORM = { label: "", value: "", fee: "", sortOrder: "" };

function slugify(str) {
  return str.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

export default function ZonesPage() {
  const { user } = useDashboardSession();

  const [zones,      setZones     ] = useState([]);
  const [loading,    setLoading   ] = useState(true);
  const [apiError,   setApiError  ] = useState(null);

  // Modal state
  const [modalMode,  setModalMode ] = useState(null); // "add" | "edit"
  const [editZone,   setEditZone  ] = useState(null);
  const [form,       setForm      ] = useState(EMPTY_FORM);
  const [saving,     setSaving    ] = useState(false);
  const [formError,  setFormError ] = useState(null);

  const isAdmin = user?.role === "admin";

  const loadZones = async () => {
    setLoading(true);
    setApiError(null);
    try {
      // Fetch all zones including inactive — use the admin endpoint
      const res  = await fetch("/api/delivery-zones?all=true");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setZones(data.data ?? []);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadZones(); }, []);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setFormError(null);
    setEditZone(null);
    setModalMode("add");
  };

  const openEdit = (zone) => {
    setForm({
      label    : zone.label,
      value    : zone.value,
      fee      : String(zone.fee),
      sortOrder: String(zone.sort_order),
    });
    setFormError(null);
    setEditZone(zone);
    setModalMode("edit");
  };

  const handleSave = async () => {
    if (!form.label.trim()) { setFormError("Zone name is required."); return; }
    if (!form.fee || isNaN(form.fee) || Number(form.fee) < 0) {
      setFormError("Delivery fee must be 0 or more."); return;
    }

    setSaving(true);
    setFormError(null);

    try {
      const isEdit = modalMode === "edit";
      const url    = isEdit ? `/api/delivery-zones/${editZone.id}` : "/api/delivery-zones";
      const body   = isEdit
        ? { label: form.label.trim(), fee: Math.round(Number(form.fee)), sortOrder: Number(form.sortOrder || 99) }
        : { label: form.label.trim(), value: slugify(form.value || form.label), fee: Math.round(Number(form.fee)), sortOrder: Number(form.sortOrder || 99) };

      const res  = await fetch(url, {
        method : isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) { setFormError(data.error || "Save failed."); setSaving(false); return; }

      setModalMode(null);
      await loadZones();
    } catch {
      setFormError("Could not reach the server.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (zone) => {
    try {
      await fetch(`/api/delivery-zones/${zone.id}`, {
        method : "PATCH",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({ active: !zone.active }),
      });
      await loadZones();
    } catch { /* non-fatal */ }
  };

  const handleDelete = async (zone) => {
    if (!confirm(`Delete "${zone.label}"? Orders using this zone will keep their zone value as text.`)) return;
    try {
      await fetch(`/api/delivery-zones/${zone.id}`, { method: "DELETE" });
      await loadZones();
    } catch { /* non-fatal */ }
  };

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center px-5">
        <div className="text-[56px] mb-4">🔒</div>
        <h2 className="font-serif font-black text-brand-black text-[24px] tracking-[-0.5px] mb-2">Admin Only</h2>
        <p className="font-sans text-brand-smoke text-[13px]">Only admins can manage delivery zones.</p>
      </div>
    );
  }

  if (loading) return <PageSpinner label="Loading zones" />;
  if (apiError) return <PageError message={apiError} onRetry={loadZones} />;

  const inputCls = "w-full bg-white border-2 border-gray-200 px-3 py-2.5 font-sans text-[13px] text-brand-black focus:outline-none focus:border-brand-orange transition-colors";
  const labelCls = "block font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-1.5";

  return (
    <div className="max-w-[720px] mx-auto flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-black text-brand-black text-[28px] tracking-[-1px] mb-1">
            Delivery Zones
          </h1>
          <p className="font-sans text-brand-smoke text-[13px]">
            Manage zones and fees. Changes apply immediately to checkout.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="font-sans font-extrabold text-[11px] tracking-[1.5px] uppercase px-5 py-3 bg-brand-orange text-brand-cream border-[3px] border-brand-black cursor-pointer shadow-retro-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex-shrink-0 flex items-center gap-2"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Zone
        </button>
      </div>

      {/* Zones table */}
      <div className="bg-white border-[3px] border-brand-black overflow-hidden shadow-retro-sm">
        <div
          className="h-[4px]"
          style={{
            background: `repeating-linear-gradient(90deg,
              ${B.orange} 0, ${B.orange} 32px,
              ${B.gold}   32px, ${B.gold}   40px,
              ${B.black}  40px, ${B.black}  44px)`,
          }}
        />

        {zones.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-[48px] mb-3">🚐</div>
            <p className="font-sans text-brand-smoke text-[13px]">No zones yet. Add your first zone above.</p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {["Zone Name", "Value (slug)", "Fee", "Order", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-sans font-extrabold text-[10px] tracking-[1.5px] uppercase text-brand-smoke">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {zones.map((zone, i) => (
                <tr key={zone.id} className={`border-b border-gray-100 last:border-0 ${!zone.active ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3">
                    <span className="font-sans font-extrabold text-[13px] text-brand-black">{zone.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <code className="font-mono text-[11px] text-brand-smoke bg-gray-100 px-2 py-0.5">{zone.value}</code>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-sans font-black text-[14px] text-brand-orange">${zone.fee}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-sans text-[13px] text-brand-smoke">{zone.sort_order}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggle(zone)}
                      className={`font-sans font-extrabold text-[10px] tracking-[1px] uppercase px-3 py-1.5 border-2 cursor-pointer transition-colors ${
                        zone.active
                          ? "border-green-400 text-green-700 bg-green-50 hover:bg-green-100"
                          : "border-gray-300 text-brand-smoke bg-gray-50 hover:border-brand-orange hover:text-brand-orange"
                      }`}
                    >
                      {zone.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(zone)}
                        className="font-sans font-extrabold text-[10px] tracking-[1px] uppercase px-3 py-1.5 border-2 border-brand-black text-brand-black bg-white cursor-pointer hover:bg-brand-black hover:text-brand-cream transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(zone)}
                        className="font-sans font-extrabold text-[10px] tracking-[1px] uppercase px-3 py-1.5 border-2 border-red-300 text-red-500 bg-white cursor-pointer hover:bg-red-500 hover:text-white transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit modal */}
      {modalMode && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: "rgba(17,17,17,0.6)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setModalMode(null); }}
        >
          <div className="bg-white w-full max-w-[440px] border-[3px] border-brand-black shadow-retro-lg overflow-hidden">
            <div className="px-6 py-4 border-b-[3px] border-brand-black flex items-center justify-between" style={{ background: B.orange }}>
              <h2 className="font-serif font-black text-brand-cream text-[18px] tracking-[-0.5px]">
                {modalMode === "add" ? "Add Zone" : `Edit — ${editZone?.label}`}
              </h2>
              <button onClick={() => setModalMode(null)}
                className="w-8 h-8 flex items-center justify-center bg-brand-cream/20 border-2 border-brand-cream/40 text-brand-cream cursor-pointer hover:bg-brand-cream/30 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className={labelCls}>Zone Name *</label>
                <input type="text" value={form.label} className={inputCls}
                  placeholder='e.g. "Gadsden", "Rainbow City"'
                  onChange={(e) => {
                    setField("label", e.target.value);
                    if (modalMode === "add") setField("value", slugify(e.target.value));
                  }} />
              </div>

              {modalMode === "add" && (
                <div>
                  <label className={labelCls}>Slug (auto-generated)</label>
                  <input type="text" value={form.value} className={`${inputCls} font-mono`}
                    placeholder="gadsden"
                    onChange={(e) => setField("value", slugify(e.target.value))} />
                  <p className="font-sans text-[10px] text-brand-smoke/60 mt-1">
                    Used internally in orders. Lowercase letters, numbers, underscores only.
                  </p>
                </div>
              )}

              <div>
                <label className={labelCls}>Delivery Fee ($) *</label>
                <input type="number" min="0" step="1" value={form.fee} className={inputCls}
                  placeholder="e.g. 15"
                  onChange={(e) => setField("fee", e.target.value)} />
              </div>

              <div>
                <label className={labelCls}>Sort Order</label>
                <input type="number" min="0" step="1" value={form.sortOrder} className={inputCls}
                  placeholder="0 = first in dropdown"
                  onChange={(e) => setField("sortOrder", e.target.value)} />
                <p className="font-sans text-[10px] text-brand-smoke/60 mt-1">
                  Lower numbers appear higher in the checkout dropdown.
                </p>
              </div>

              {formError && (
                <div className="bg-red-50 border-2 border-red-300 px-4 py-3 font-sans text-[12px] text-red-600">
                  {formError}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-between gap-3 bg-gray-50">
              <button onClick={() => setModalMode(null)}
                className="font-sans font-extrabold text-[11px] tracking-[1px] uppercase px-5 py-3 border-2 border-gray-300 text-brand-smoke bg-white cursor-pointer hover:border-brand-black hover:text-brand-black transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="font-sans font-extrabold text-[11px] tracking-[1px] uppercase px-7 py-3 bg-brand-orange text-brand-cream border-2 border-brand-black cursor-pointer shadow-retro-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                {saving ? "Saving…" : modalMode === "add" ? "Add Zone" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}