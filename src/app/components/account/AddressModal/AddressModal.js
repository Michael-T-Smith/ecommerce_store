"use client";

import { useState, useEffect } from "react";
import { C }                   from "@/lib/brand";

function Label({ children }) {
  return (
    <label className="block font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-1.5">
      {children}
    </label>
  );
}

export default function AddressModal({ mode, address, onSave, onClose }) {
  const [form, setForm] = useState({
    label      : "Home",
    addressLine: "",
    city       : "",
    state      : "AL",
    zip        : "",
    isDefault  : false,
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError ] = useState(null);

  // Pre-fill when editing
  useEffect(() => {
    if (mode === "edit" && address) {
      setForm({
        label      : address.label       ?? "Home",
        addressLine: address.addressLine ?? "",
        city       : address.city        ?? "",
        state      : address.state       ?? "AL",
        zip        : address.zip         ?? "",
        isDefault  : address.isDefault   ?? false,
      });
    }
  }, [mode, address]);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const handleSave = async () => {
    if (!form.addressLine.trim() || !form.city.trim() || !form.zip.trim()) {
      setError("Address, city, and zip code are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  const inputCls = "w-full border-2 border-gray-200 px-3 py-2.5 font-sans text-[13px] text-brand-black focus:outline-none focus:border-brand-orange transition-colors";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(17,17,17,0.65)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white border-[3px] border-brand-black w-full max-w-[480px] shadow-retro-lg overflow-hidden">

        {/* Header stripe */}
        <div className="h-[5px]" style={{
          background: `repeating-linear-gradient(90deg,
            ${C.blush} 0, ${C.blush} 30px,
            ${C.gold}   30px, ${C.gold}   38px,
            ${C.blush} 38px, ${C.blush} 68px,
            ${C.black}  68px, ${C.black}  72px)`,
        }} />

        {/* Title */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="font-serif font-black text-brand-black text-[20px] tracking-[-0.5px]">
            {mode === "add" ? "Add Address" : "Edit Address"}
          </h2>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center border border-gray-200 text-brand-smoke cursor-pointer hover:border-brand-black hover:text-brand-black transition-colors bg-white">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-6 flex flex-col gap-4">

          {error && (
            <div className="bg-red-50 border-2 border-red-300 px-4 py-3">
              <span className="font-sans text-[12px] text-red-600">{error}</span>
            </div>
          )}

          {/* Label */}
          <div>
            <Label>Label</Label>
            <div className="flex gap-2 mb-2">
              {["Home", "Work", "Other"].map((preset) => (
                <button key={preset}
                  onClick={() => setForm((p) => ({ ...p, label: preset }))}
                  className="font-sans font-extrabold text-[10px] tracking-[1px] uppercase px-3 py-1.5 border-2 cursor-pointer transition-colors"
                  style={{
                    borderColor: form.label === preset ? C.blush : "#E5E7EB",
                    color      : form.label === preset ? C.blush : "#8C8288",
                    background : form.label === preset ? `${C.blush}10` : "white",
                  }}>
                  {preset}
                </button>
              ))}
            </div>
            <input value={form.label} onChange={set("label")} className={inputCls}
              placeholder="e.g. Mom's house" />
          </div>

          {/* Street address */}
          <div>
            <Label>Street Address *</Label>
            <input value={form.addressLine} onChange={set("addressLine")}
              className={inputCls} placeholder="123 Main St" />
          </div>

          {/* City / State / Zip */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <Label>City *</Label>
              <input value={form.city} onChange={set("city")} className={inputCls} placeholder="Piedmont" />
            </div>
            <div className="grid grid-cols-2 gap-2 col-span-2 sm:col-span-1">
              <div>
                <Label>State</Label>
                <input value={form.state} onChange={set("state")} className={inputCls} placeholder="AL" maxLength={2} />
              </div>
              <div>
                <Label>Zip *</Label>
                <input value={form.zip} onChange={set("zip")} className={inputCls} placeholder="36272" maxLength={10} />
              </div>
            </div>
          </div>

          {/* Default toggle */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <div
              className="w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 transition-colors"
              style={{
                borderColor: form.isDefault ? C.blush : "#D1D5DB",
                background : form.isDefault ? C.blush : "white",
              }}
              onClick={() => setForm((p) => ({ ...p, isDefault: !p.isDefault }))}>
              {form.isDefault && (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                  stroke="white" strokeWidth="3" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <input type="checkbox" className="sr-only" checked={form.isDefault}
              onChange={() => setForm((p) => ({ ...p, isDefault: !p.isDefault }))} />
            <span className="font-sans font-extrabold text-[12px] text-brand-black">
              Set as default delivery address
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 py-5 border-t border-gray-200 bg-gray-50">
          <button onClick={onClose} disabled={saving}
            className="flex-1 font-sans font-extrabold text-[11px] tracking-[1px] uppercase py-3 border-2 border-gray-300 text-brand-smoke bg-white cursor-pointer hover:border-brand-black hover:text-brand-black transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 font-sans font-extrabold text-[11px] tracking-[1.5px] uppercase py-3 bg-brand-orange text-brand-cream border-2 border-brand-black cursor-pointer shadow-retro-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none transition-all">
            {saving ? "Saving…" : mode === "add" ? "Add Address" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}