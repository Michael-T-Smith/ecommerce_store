"use client";

import { useState, useEffect }  from "react";
import { INVENTORY_CATEGORIES, INVENTORY_TAGS, INVENTORY_SUPPLIERS } from "@/lib/inventoryData";
import { B } from "@/lib/brand";

const SIZES_OPTIONS = ["Small", "Standard", "Large", "XL"];

const EMPTY_FORM = {
  name        : "",
  sku         : "",
  category    : "Bouquets",
  price       : "",
  costPrice   : "",
  tag         : "None",
  emoji       : "💐",
  description : "",
  sizes       : ["Standard"],
  supplier    : "Piedmont Valley Growers",
  stockCount  : "",
  lowStockThreshold: "2",
  inStock          : true,
  isFeatured        : false,
  featuredAccent    : "#D4511A",
};

export default function InventoryModal({ mode, item, onSave, onClose }) {
  const [form,   setForm  ] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  // Pre-fill form in edit mode
  useEffect(() => {
    if (mode === "edit" && item) {
      setForm({
        name             : item.name              || "",
        sku              : item.sku               || "",
        category         : item.category          || "Bouquets",
        price            : String(item.price)     || "",
        costPrice        : String(item.costPrice) || "",
        tag              : item.tag               || "None",
        emoji            : item.emoji             || "💐",
        description      : item.description       || "",
        sizes            : item.sizes             || ["Standard"],
        sizes_multiplier : item.sizes_multiplier  || [1],
        image_path       : item.image_path        || "",
        supplier         : item.supplier          || "Piedmont Valley Growers",
        stockCount       : String(item.stockCount) || "0",
        lowStockThreshold: String(item.lowStockThreshold) || "2",
        inStock          : item.inStock           ?? true,
        isFeatured        : item.isFeatured        ?? false,
        featuredAccent    : item.featuredAccent    ?? "#D4511A",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [mode, item]);

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: null }));
  };

  const toggleSize = (size) => {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(size)
        ? f.sizes.filter((s) => s !== size)
        : [...f.sizes, size],
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())         e.name      = "Name is required";
    if (!form.sku.trim())          e.sku       = "SKU is required";
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0)
                                    e.price     = "Valid price required";
    if (!form.costPrice || isNaN(form.costPrice) || Number(form.costPrice) < 0)
                                    e.costPrice = "Valid cost required";
    if (form.sizes.length === 0)   e.sizes     = "Select at least one size";
    if (!form.description.trim())  e.description = "Description is required";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onSave({
      ...form,
      price            : Number(form.price),
      costPrice        : Number(form.costPrice),
      stockCount       : Number(form.stockCount),
      lowStockThreshold: Number(form.lowStockThreshold),
      tag              : form.tag === "None" ? null : form.tag,
      isFeatured       : form.isFeatured,
      image_path       : `${form.category/form.name}.png`,
      featuredAccent   : form.featuredAccent,
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

            <Field label="Sale Price ($) *" error={errors.price}>
              <input type="number" min="0" step="0.01" className={inputCls(errors.price)}
                value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="52" />
            </Field>

            <Field label="Cost Price ($) *" error={errors.costPrice}>
              <input type="number" min="0" step="0.01" className={inputCls(errors.costPrice)}
                value={form.costPrice} onChange={(e) => set("costPrice", e.target.value)} placeholder="18" />
            </Field>

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

            <Field label="Emoji">
              <input className={inputCls()} value={form.emoji}
                onChange={(e) => set("emoji", e.target.value)} placeholder="💐" maxLength={4} />
            </Field>

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

            {/* Sizes — full width */}
            <div className="sm:col-span-2">
              <Field label="Available Sizes *" error={errors.sizes}>
                <div className="flex gap-2 flex-wrap mt-1">
                  {SIZES_OPTIONS.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`font-sans font-extrabold text-[11px] tracking-[1px] uppercase px-4 py-2 border-2 cursor-pointer transition-colors ${
                        form.sizes.includes(size)
                          ? "bg-brand-orange text-brand-cream border-brand-orange"
                          : "bg-white text-brand-smoke border-gray-200 hover:border-brand-orange hover:text-brand-orange"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </Field>
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
                      <span className="text-[20px]">{form.emoji}</span>
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