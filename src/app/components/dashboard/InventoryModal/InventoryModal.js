"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { INVENTORY_CATEGORIES, INVENTORY_TAGS, INVENTORY_SUPPLIERS } from "@/lib/inventoryData";
import { B } from "@/lib/brand";

const EMPTY_FORM = {
  name        : "",
  sku         : "",
  category    : "Bouquets",
  prices      : [""],   // one entry per size — parallel to sizes[]
  costPrices  : [""],   // one entry per size — parallel to sizes[]
  tag         : "None",
  description : "",
  sizes       : ["Standard"],
  supplier    : "Piedmont Valley Growers",
  stockCount  : "",
  lowStockThreshold: "2",
  inStock          : true,
  isFeatured        : false,
  featuredAccent    : "#D4511A",
  location          : "piedmont",
};

export default function InventoryModal({ mode, item, onSave, onClose }) {
  const [form,      setForm     ] = useState(EMPTY_FORM);
  const [errors,    setErrors   ] = useState({});
  const [sizeInput, setSizeInput] = useState("");

  // ── Image manager state ──────────────────────────────────────────────
  const [images,     setImages    ] = useState([]);  // { id, path, display_order }
  const [uploading,  setUploading ] = useState(false);
  const [imgError,   setImgError  ] = useState(null);
  const [dragOver,   setDragOver  ] = useState(false);
  const fileInputRef = useRef(null);

  // Pre-fill form in edit mode
  useEffect(() => {
    if (mode === "edit" && item) {
      setForm({
        name             : item.name              || "",
        sku              : item.sku               || "",
        category         : item.category          || "Bouquets",
        prices           : (item.prices     ?? [0]).map(String),
        costPrices       : (item.costPrices ?? [0]).map(String),
        tag              : item.tag               || "None",
        description      : item.description       || "",
        sizes            : item.sizes             || ["Standard"],
        supplier         : item.supplier          || "Piedmont Valley Growers",
        stockCount       : String(item.stockCount) || "0",
        lowStockThreshold: String(item.lowStockThreshold) || "2",
        inStock          : item.inStock           ?? true,
        isFeatured        : item.isFeatured        ?? false,
        featuredAccent    : item.featuredAccent    ?? "#D4511A",
        location          : item.location          ?? "piedmont",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});

    // Load existing images when editing
    if (mode === "edit" && item?.id) {
      fetch(`/api/inventory/${item.id}/images`)
        .then((r) => r.json())
        .then((d) => setImages(d.data ?? []))
        .catch(() => {});
    } else {
      setImages([]);
    }
    setImgError(null);
  }, [mode, item]);

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: null }));
  };

  // Upload a single image file to the server
  const handleUpload = useCallback(async (file) => {
    if (uploading || images.length >= 5) return;
    setUploading(true);
    setImgError(null);
    try {
      // For new items (no id yet) we store the file locally as a preview
      // and upload for real after the item is saved. For existing items,
      // upload immediately so images are persisted right away.
      if (!item?.id) {
        // Preview only — create a local object URL
        const url = URL.createObjectURL(file);
        setImages((prev) => [...prev, { id: `local-${Date.now()}`, path: url, file, display_order: prev.length }]);
      } else {
        const fd = new FormData();
        fd.append("file", file);
        const res  = await fetch(`/api/inventory/${item.id}/images`, { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) { setImgError(data.error || "Upload failed."); return; }
        setImages((prev) => [...prev, data.data]);
      }
    } catch {
      setImgError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }, [item, images, uploading]);

  // Add a custom size name — appends aligned empty price entries
  const addSize = () => {
    const name = sizeInput.trim();
    if (!name) return;
    if (form.sizes.includes(name)) {
      setSizeInput("");
      return; // silently skip duplicates
    }
    setForm((f) => ({
      ...f,
      sizes      : [...f.sizes, name],
      prices     : [...f.prices, ""],
      costPrices : [...f.costPrices, ""],
    }));
    setSizeInput("");
  };

  // Remove a size at index idx — also removes corresponding price entries
  const removeSize = (idx) => {
    setForm((f) => ({
      ...f,
      sizes      : f.sizes.filter((_, i) => i !== idx),
      prices     : f.prices.filter((_, i) => i !== idx),
      costPrices : f.costPrices.filter((_, i) => i !== idx),
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())         e.name      = "Name is required";
    if (!form.sku.trim())          e.sku       = "SKU is required";
    // Every size must have a valid sale price
    const badPrices = form.prices.some((p) => !p || isNaN(p) || Number(p) <= 0);
    if (badPrices) e.prices = "All sizes need a valid sale price (> 0)";
    const badCosts  = form.costPrices.some((p) => isNaN(p) || Number(p) < 0);
    if (badCosts)  e.costPrices = "All sizes need a valid cost price (≥ 0)";
    if (form.sizes.length === 0)   e.sizes     = "Select at least one size";
    if (!form.description.trim())  e.description = "Description is required";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onSave({
      ...form,
      prices           : form.prices.map((p) => Math.round(Number(p))),
      costPrices       : form.costPrices.map((p) => Math.round(Number(p))),
      stockCount       : Number(form.stockCount),
      lowStockThreshold: Number(form.lowStockThreshold),
      tag              : form.tag === "None" ? null : form.tag,
      isFeatured       : form.isFeatured,
      featuredAccent   : form.featuredAccent,
      images           : images,
    });
  };

  // Field helpers
  const Field = ({ label, error, children }) => (
    <div>
      <label className="block font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="font-sans text-[11px] text-red-500 mt-1">{error}</p>}
    </div>
  );

  const inputCls = (err) =>
    `w-full bg-white border-2 ${err ? "border-red-400" : "border-gray-200"} px-3 py-2.5 font-sans text-[13px] text-brand-black focus:outline-none focus:border-brand-orange transition-colors`;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(17,17,17,0.6)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal panel */}
      <div className="bg-white w-full max-w-[640px] max-h-[90vh] flex flex-col border-[3px] border-brand-black shadow-retro-lg overflow-hidden">

        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between border-b-[3px] border-brand-black flex-shrink-0"
          style={{ background: B.orange }}
        >
          <div>
            <div className="font-sans text-[10px] font-extrabold tracking-[3px] uppercase text-brand-cream/70 mb-0.5">
              Inventory
            </div>
            <h2 className="font-serif font-black text-brand-cream text-[20px] tracking-[-0.5px] leading-none">
              {mode === "add" ? "Add New Item" : `Edit — ${item?.name}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-brand-cream/20 border-2 border-brand-cream/40 text-brand-cream cursor-pointer hover:bg-brand-cream/30 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <Field label="Item Name *" error={errors.name}>
              <input className={inputCls(errors.name)} value={form.name}
                onChange={(e) => set("name", e.target.value)} placeholder="e.g. Classic Red Roses" />
            </Field>

            <Field label="SKU *" error={errors.sku}>
              <input className={inputCls(errors.sku)} value={form.sku}
                onChange={(e) => set("sku", e.target.value.toUpperCase())} placeholder="e.g. BQ-001" />
            </Field>

            {/* Per-size price editor — shown after sizes are chosen */}
            <div className="sm:col-span-2">
              {errors.prices && (
                <p className="font-sans text-[11px] text-red-500 mb-2">{errors.prices}</p>
              )}
              <div className="flex flex-col gap-2">
                {form.sizes.map((size, i) => (
                  <div key={size} className="flex items-center gap-3">
                    <span className="font-sans font-extrabold text-[11px] tracking-[1px] uppercase text-brand-smoke w-[80px] flex-shrink-0">
                      {size}
                    </span>
                    <div className="flex-1">
                      <label className="block font-sans font-extrabold text-[9px] tracking-[1.5px] uppercase text-brand-smoke/60 mb-1">Sale $</label>
                      <input
                        type="number" min="0" step="1"
                        placeholder="e.g. 52"
                        className={inputCls(errors.prices)}
                        value={form.prices[i] ?? ""}
                        onChange={(e) => {
                          const next = [...form.prices];
                          next[i] = e.target.value;
                          set("prices", next);
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block font-sans font-extrabold text-[9px] tracking-[1.5px] uppercase text-brand-smoke/60 mb-1">Cost $</label>
                      <input
                        type="number" min="0" step="1"
                        placeholder="e.g. 18"
                        className={inputCls(errors.costPrices)}
                        value={form.costPrices[i] ?? ""}
                        onChange={(e) => {
                          const next = [...form.costPrices];
                          next[i] = e.target.value;
                          set("costPrices", next);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="font-sans text-[10px] text-brand-smoke/50 mt-2">
                Sale and cost price for each size — whole dollar amounts.
              </p>
            </div>

            <Field label="Category">
              <select className={inputCls()} value={form.category}
                onChange={(e) => set("category", e.target.value)}>
                {INVENTORY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>

            <Field label="Tag">
              <select className={inputCls()} value={form.tag}
                onChange={(e) => set("tag", e.target.value)}>
                {INVENTORY_TAGS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>

            <Field label="Store Location">
              <select className={inputCls()} value={form.location}
                onChange={(e) => set("location", e.target.value)}>
                <option value="piedmont">Piedmont</option>
                <option value="centre">Centre</option>
              </select>
            </Field>

            {/* ── Photos — full width ──────────────────────────────── */}
            <div className="sm:col-span-2">
              <label className="block font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-1.5">
                Product Photos
              </label>
              <p className="font-sans text-[10px] text-brand-smoke/60 mb-3">
                Up to 5 photos. First photo is shown on the shop. Drag to reorder.
              </p>

              {/* Photo slots */}
              <div className="flex flex-wrap gap-3 mb-3">

                {/* Existing image thumbnails */}
                {images.map((img, idx) => (
                  <div key={img.id} className="relative group">
                    <div
                      className={`w-[88px] h-[88px] border-[3px] overflow-hidden relative ${
                        idx === 0 ? "border-brand-orange" : "border-brand-black/30"
                      }`}
                    >
                      <img
                        src={img.path}
                        alt={`Photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {idx === 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-brand-orange text-brand-cream font-sans font-extrabold text-[8px] tracking-[1px] uppercase text-center py-0.5">
                          Main
                        </div>
                      )}
                    </div>

                    {/* Reorder arrows */}
                    <div className="flex justify-between mt-1 gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={async () => {
                          const next = [...images];
                          [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                          setImages(next);
                          if (item?.id) {
                            await fetch(`/api/inventory/${item.id}/images`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ order: next.map((i) => i.id) }),
                            });
                          }
                        }}
                        className="flex-1 py-1 font-sans font-black text-[10px] border border-brand-black/20 bg-white text-brand-smoke hover:bg-brand-black hover:text-brand-cream disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      >←</button>
                      <button
                        type="button"
                        disabled={idx === images.length - 1}
                        onClick={async () => {
                          const next = [...images];
                          [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
                          setImages(next);
                          if (item?.id) {
                            await fetch(`/api/inventory/${item.id}/images`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ order: next.map((i) => i.id) }),
                            });
                          }
                        }}
                        className="flex-1 py-1 font-sans font-black text-[10px] border border-brand-black/20 bg-white text-brand-smoke hover:bg-brand-black hover:text-brand-cream disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      >→</button>
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={async () => {
                        if (!item?.id) { setImages((p) => p.filter((_, i) => i !== idx)); return; }
                        await fetch(`/api/inventory/${item.id}/images`, {
                          method: "DELETE",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ imageId: img.id }),
                        });
                        setImages((p) => p.filter((_, i) => i !== idx));
                      }}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white font-black text-[12px] leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none"
                    >
                      ×
                    </button>
                  </div>
                ))}

                {/* Add photo slot — shown when under 5 images */}
                {images.length < 5 && (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={async (e) => {
                      e.preventDefault();
                      setDragOver(false);
                      const file = e.dataTransfer.files[0];
                      if (file) handleUpload(file);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-[88px] h-[88px] border-[3px] border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
                      dragOver
                        ? "border-brand-orange bg-brand-orange/5"
                        : "border-brand-black/25 bg-gray-50 hover:border-brand-orange hover:bg-brand-orange/5"
                    } ${
                      uploading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {uploading ? (
                      <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24"
                        fill="none" stroke={B.orange} strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                        <path d="M12 2a10 10 0 0 1 10 10" />
                      </svg>
                    ) : (
                      <>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                          stroke={B.smoke} strokeWidth="2" strokeLinecap="round">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <span className="font-sans font-extrabold text-[8px] tracking-[1px] uppercase text-brand-smoke/60 text-center leading-tight">
                          Add{images.length === 0 ? "\nPhoto" : ""}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file);
                  e.target.value = "";
                }}
              />

              {imgError && (
                <p className="font-sans text-[11px] text-red-500 mt-1">{imgError}</p>
              )}
            </div>

            <Field label="Supplier">
              <select className={inputCls()} value={form.supplier}
                onChange={(e) => set("supplier", e.target.value)}>
                {INVENTORY_SUPPLIERS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>

            <Field label="Stock Count">
              <input type="number" min="0" className={inputCls()}
                value={form.stockCount} onChange={(e) => set("stockCount", e.target.value)} placeholder="0" />
            </Field>

            <Field label="Low Stock Alert Threshold">
              <input type="number" min="0" className={inputCls()}
                value={form.lowStockThreshold} onChange={(e) => set("lowStockThreshold", e.target.value)} placeholder="2" />
            </Field>

            {/* Sizes — custom tag input, full width */}
            <div className="sm:col-span-2">
              <label className="block font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-1.5">
                Sizes *
              </label>
              <p className="font-sans text-[10px] text-brand-smoke/60 mb-2 leading-relaxed">
                Type a size name and press Enter or Add. Each size gets its own price below.
              </p>

              {/* Existing size chips */}
              {form.sizes.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {form.sizes.map((size, idx) => (
                    <div
                      key={`${size}-${idx}`}
                      className="flex items-center gap-1.5 bg-brand-orange text-brand-cream border-2 border-brand-orange px-3 py-1.5"
                    >
                      <span className="font-sans font-extrabold text-[11px] tracking-[1px] uppercase">
                        {size}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSize(idx)}
                        className="flex items-center justify-center w-4 h-4 rounded-full bg-brand-cream/30 hover:bg-brand-cream/60 transition-colors cursor-pointer border-none leading-none text-brand-cream font-black text-[11px]"
                        title={`Remove ${size}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new size input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSize(); } }}
                  placeholder='e.g. Small, Standard, "With Vase", Jumbo…'
                  className={`${inputCls(errors.sizes)} flex-1`}
                />
                <button
                  type="button"
                  onClick={addSize}
                  disabled={!sizeInput.trim()}
                  className="font-sans font-extrabold text-[11px] tracking-[1px] uppercase px-5 py-2.5 border-2 border-brand-black bg-brand-black text-brand-cream cursor-pointer hover:bg-brand-orange hover:border-brand-orange transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                >
                  Add
                </button>
              </div>
              {errors.sizes && (
                <p className="font-sans text-[11px] text-red-500 mt-1">{errors.sizes}</p>
              )}
            </div>

            {/* Description — full width */}
            <div className="sm:col-span-2">
              <Field label="Description *" error={errors.description}>
                <textarea
                  className={`${inputCls(errors.description)} resize-none`}
                  rows={3}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Short product description shown on the storefront..."
                />
              </Field>
            </div>

            {/* In-stock toggle — full width */}
            <div className="sm:col-span-2">
              <label className="block font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-2">
                Availability
              </label>
              <button
                type="button"
                onClick={() => set("inStock", !form.inStock)}
                className={`flex items-center gap-3 px-4 py-3 border-2 cursor-pointer transition-colors w-full sm:w-auto ${
                  form.inStock
                    ? "border-green-400 bg-green-50 text-green-700"
                    : "border-red-300 bg-red-50 text-red-500"
                }`}
              >
                <span className={`w-3 h-3 rounded-full flex-shrink-0 ${form.inStock ? "bg-green-500" : "bg-red-400"}`} />
                <span className="font-sans font-extrabold text-[12px] tracking-[1px] uppercase">
                  {form.inStock ? "In Stock — Visible on storefront" : "Out of Stock — Hidden from add-to-bag"}
                </span>
              </button>
            </div>

            {/* ── Featured toggle + accent picker — full width ── */}
            <div className="sm:col-span-2 border-t-2 border-dashed border-brand-black/10 pt-5">
              <label className="block font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-2">
                Homepage Featured
              </label>
              <p className="font-sans text-[11px] text-brand-smoke/70 mb-3 leading-relaxed">
                Featured items appear in the &ldquo;This Week&apos;s Picks&rdquo; section on the homepage.
                Keep to 3 items max for the best layout.
              </p>

              {/* Featured on/off toggle */}
              <button
                type="button"
                onClick={() => set("isFeatured", !form.isFeatured)}
                className={`flex items-center gap-3 px-4 py-3 border-2 cursor-pointer transition-colors mb-4 ${
                  form.isFeatured
                    ? "border-brand-orange bg-brand-orange/5 text-brand-orange"
                    : "border-gray-200 bg-white text-brand-smoke hover:border-brand-orange"
                }`}
              >
                <span className="text-[16px]">{form.isFeatured ? "⭐" : "☆"}</span>
                <span className="font-sans font-extrabold text-[12px] tracking-[1px] uppercase">
                  {form.isFeatured ? "Featured on Homepage" : "Not Featured"}
                </span>
              </button>

              {/* Accent colour swatches — only shown when featured */}
              {form.isFeatured && (
                <div>
                  <label className="block font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-2">
                    Card Background Colour
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { hex: "#D4511A", label: "Orange"  },
                      { hex: "#3D2B1A", label: "Bark"    },
                      { hex: "#C9A84C", label: "Gold"    },
                      { hex: "#111111", label: "Black"   },
                      { hex: "#5C7A4E", label: "Sage"    },
                      { hex: "#8B1A2A", label: "Crimson" },
                      { hex: "#1A3A2A", label: "Forest"  },
                      { hex: "#4A3728", label: "Mocha"   },
                    ].map(({ hex, label }) => (
                      <button
                        key={hex}
                        type="button"
                        title={label}
                        onClick={() => set("featuredAccent", hex)}
                        className={`w-9 h-9 border-[3px] cursor-pointer transition-transform hover:scale-110 ${
                          form.featuredAccent === hex
                            ? "border-brand-black scale-110 shadow-retro-sm"
                            : "border-transparent"
                        }`}
                        style={{ background: hex }}
                      />
                    ))}
                  </div>
                  {/* Live preview swatch */}
                  <div className="mt-3 flex items-center gap-3">
                    <div
                      className="w-full h-10 border-2 border-brand-black/20 flex items-center justify-center gap-2"
                      style={{ background: form.featuredAccent }}
                    >
                      <span className="text-[20px]">🌸</span>
                      <span className="font-sans font-extrabold text-[10px] tracking-[1px] uppercase text-white/80">
                        Card preview
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between gap-3 flex-shrink-0 bg-gray-50">
          <button
            onClick={onClose}
            className="font-sans font-extrabold text-[12px] tracking-[1px] uppercase px-6 py-3 border-2 border-gray-300 text-brand-smoke bg-white cursor-pointer hover:border-brand-black hover:text-brand-black transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="font-sans font-extrabold text-[12px] tracking-[1px] uppercase px-8 py-3 bg-brand-orange text-brand-cream border-2 border-brand-black cursor-pointer shadow-retro-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
          >
            {mode === "add" ? "Add Item" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}