"use client";

import { useState } from "react";
import { createOrder } from "@/lib/dashboardApi";
import { B }           from "@/lib/brand";

// Accepts virtually any time string and returns "H:MM AM/PM".
// Handles: 13:00  13  1pm  1:00pm  1am  1:00am  0100  1300  9:30
function normalizeTime(raw) {
  if (!raw?.trim()) return raw;
  const s = raw.trim().toLowerCase().replace(/\s+/g, "");

  const ampmMatch = s.match(/(am|pm)$/);
  const ampm      = ampmMatch ? ampmMatch[1] : null;
  const timeStr   = ampm ? s.slice(0, -ampm.length) : s;

  let hour, minute;

  if (/^\d{3,4}$/.test(timeStr)) {
    // Military / compact: 0100, 1300, 930
    const padded = timeStr.padStart(4, "0");
    hour   = parseInt(padded.slice(0, 2), 10);
    minute = parseInt(padded.slice(2),    10);
  } else if (timeStr.includes(":")) {
    const [h, m] = timeStr.split(":");
    hour   = parseInt(h, 10);
    minute = parseInt(m, 10) || 0;
  } else {
    hour   = parseInt(timeStr, 10);
    minute = 0;
  }

  if (isNaN(hour) || isNaN(minute) || hour > 23 || minute > 59) return raw;

  if (ampm === "pm" && hour < 12)  hour += 12;
  if (ampm === "am" && hour === 12) hour  = 0;

  const period = hour >= 12 ? "PM" : "AM";
  const h12    = hour % 12 || 12;
  return `${h12}:${String(minute).padStart(2, "0")} ${period}`;
}

const EMPTY_FORM = {
  customerName    : "",
  customerEmail   : "",
  customerPhone   : "",
  fulfillmentType : "delivery",
  deliveryAddress : "",
  deliveryZone    : "",
  deliveryDate    : "",
  deliveryWindow  : "afternoon",
  deliveryFee     : "0",
  pickupLocation  : "piedmont",
  pickupDate      : "",
  pickupTime      : "",
  noteMessage     : "",
  staffNotes      : "",
};

const EMPTY_ITEM = { name: "", size: "Standard", qty: "1", price: "" };

function Field({ label, required, children }) {
  return (
    <div>
      <label className="font-sans font-extrabold text-[10px] tracking-[1px] uppercase text-brand-smoke block mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full border border-gray-300 px-3 py-2 font-sans text-[12px] text-brand-black focus:outline-none focus:border-brand-orange transition-colors bg-white";
const selectCls = `${inputCls} cursor-pointer`;

export default function CreateOrderModal({ onCreated, onClose }) {
  const [form,   setForm  ] = useState(EMPTY_FORM);
  const [items,  setItems ] = useState([{ ...EMPTY_ITEM }]);
  const [saving, setSaving] = useState(false);
  const [error,  setError ] = useState(null);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const setItem = (idx, field) => (e) => {
    const val = e.target.value;
    setItems((prev) => prev.map((it, i) => i === idx ? { ...it, [field]: val } : it));
  };

  const addItem    = () => setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const subtotal = items.reduce((s, it) => s + Number(it.price || 0) * Number(it.qty || 0), 0);
  const total    = subtotal + Number(form.deliveryFee || 0);

  const validate = () => {
    if (!form.customerName.trim())  return "Customer name is required.";
    if (!form.customerEmail.trim()) return "Customer email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)) return "Invalid email address.";
    if (!items.some((it) => it.name.trim())) return "At least one item with a name is required.";
    for (const it of items) {
      if (!it.name.trim()) continue;
      if (Number(it.qty) < 1)   return `Item "${it.name}": qty must be at least 1.`;
      if (Number(it.price) < 0) return `Item "${it.name}": price cannot be negative.`;
    }
    if (form.fulfillmentType === "delivery") {
      if (!form.deliveryAddress.trim()) return "Delivery address is required.";
      if (!form.deliveryDate)           return "Delivery date is required.";
    }
    if (form.fulfillmentType === "pickup" && !form.pickupDate) return "Pickup date is required.";
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setSaving(true);
    setError(null);
    try {
      const namedItems = items.filter((it) => it.name.trim());
      const payload = {
        customerName  : form.customerName.trim(),
        customerEmail : form.customerEmail.trim().toLowerCase(),
        customerPhone : form.customerPhone.trim() || undefined,
        fulfillmentType: form.fulfillmentType,
        items         : namedItems.map((it) => ({
          name : it.name.trim(),
          size : it.size.trim() || "Standard",
          qty  : Number(it.qty),
          price: Number(it.price),
        })),
        subtotal,
        deliveryFee  : Number(form.deliveryFee || 0),
        processingFee: 0,
        total,
        noteMessage  : form.noteMessage.trim() || undefined,
        staffNotes   : form.staffNotes.trim()  || undefined,
      };

      if (form.fulfillmentType === "delivery") {
        payload.deliveryAddress = form.deliveryAddress.trim();
        payload.deliveryZone    = form.deliveryZone.trim()  || undefined;
        payload.deliveryDate    = form.deliveryDate;
        payload.deliveryWindow  = form.deliveryWindow;
      } else {
        payload.pickupLocation  = form.pickupLocation;
        payload.pickupDate      = form.pickupDate;
        payload.pickupTime      = form.pickupTime.trim() || undefined;
      }

      const res = await createOrder(payload);
      onCreated(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(17,17,17,0.65)" }}
      onClick={(e) => { if (e.target === e.currentTarget && !saving) onClose(); }}
    >
      <div className="bg-white w-full max-w-[720px] max-h-[90vh] flex flex-col border-[3px] border-brand-black shadow-retro-lg overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between gap-4 border-b-[3px] border-brand-black flex-shrink-0"
          style={{ background: B.bark }}>
          <div>
            <div className="font-sans font-extrabold text-[9px] tracking-[3px] uppercase text-brand-cream/50 mb-1">Dashboard</div>
            <div className="font-serif font-black text-brand-cream text-[22px] tracking-[-0.5px] leading-none">New Order</div>
          </div>
          <button onClick={onClose} disabled={saving}
            className="w-8 h-8 flex items-center justify-center bg-brand-cream/10 border border-brand-cream/20 text-brand-cream cursor-pointer hover:bg-brand-cream/20 flex-shrink-0 disabled:opacity-50">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">

          {/* Customer */}
          <section>
            <div className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-3">Customer</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Name" required>
                <input type="text" value={form.customerName} onChange={set("customerName")}
                  placeholder="Full name" className={inputCls} />
              </Field>
              <Field label="Email" required>
                <input type="email" value={form.customerEmail} onChange={set("customerEmail")}
                  placeholder="email@example.com" className={inputCls} />
              </Field>
              <Field label="Phone">
                <input type="tel" value={form.customerPhone} onChange={set("customerPhone")}
                  placeholder="(555) 000-0000" className={inputCls} />
              </Field>
            </div>
          </section>

          {/* Fulfillment type toggle */}
          <section>
            <div className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-3">Fulfillment</div>
            <div className="flex gap-1 mb-4">
              {["delivery", "pickup"].map((t) => (
                <button key={t} onClick={() => setForm((f) => ({ ...f, fulfillmentType: t }))}
                  className={`font-sans font-extrabold text-[10px] tracking-[1px] uppercase px-4 py-2 border-2 cursor-pointer transition-colors ${
                    form.fulfillmentType === t
                      ? "border-brand-black bg-brand-black text-brand-cream"
                      : "border-gray-200 text-brand-smoke hover:border-gray-400"
                  }`}>
                  {t === "delivery" ? "Delivery" : "Pickup"}
                </button>
              ))}
            </div>

            {form.fulfillmentType === "delivery" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Address" required>
                  <textarea value={form.deliveryAddress} onChange={set("deliveryAddress")}
                    rows={2} placeholder="Street address, city, state, zip"
                    className={`${inputCls} resize-none`} />
                </Field>
                <div className="flex flex-col gap-3">
                  <Field label="Zone">
                    <input type="text" value={form.deliveryZone} onChange={set("deliveryZone")}
                      placeholder="e.g. Zone 1" className={inputCls} />
                  </Field>
                  <Field label="Delivery Fee ($)">
                    <input type="number" min="0" step="0.01" value={form.deliveryFee} onChange={set("deliveryFee")}
                      className={inputCls} />
                  </Field>
                </div>
                <Field label="Delivery Date" required>
                  <input type="date" value={form.deliveryDate} onChange={set("deliveryDate")}
                    className={inputCls} />
                </Field>
                <Field label="Window">
                  <select value={form.deliveryWindow} onChange={set("deliveryWindow")} className={selectCls}>
                    <option value="morning">Morning (9AM–12PM)</option>
                    <option value="afternoon">Afternoon (12PM–5PM)</option>
                  </select>
                </Field>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="Location">
                  <select value={form.pickupLocation} onChange={set("pickupLocation")} className={selectCls}>
                    <option value="piedmont">Piedmont</option>
                    <option value="centre">Centre</option>
                  </select>
                </Field>
                <Field label="Pickup Date" required>
                  <input type="date" value={form.pickupDate} onChange={set("pickupDate")} className={inputCls} />
                </Field>
                <Field label="Pickup Time">
                  <input type="text" value={form.pickupTime} onChange={set("pickupTime")}
                    onBlur={() => setForm((f) => ({ ...f, pickupTime: normalizeTime(f.pickupTime) }))}
                    placeholder="e.g. 1pm, 13:00, 0100" className={inputCls} />
                </Field>
              </div>
            )}
          </section>

          {/* Items */}
          <section>
            <div className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-3">Items</div>
            <div className="flex flex-col gap-2">
              {/* Header row */}
              <div className="hidden sm:grid grid-cols-[1fr_120px_64px_88px_32px] gap-2">
                {["Item Name *", "Size", "Qty", "Price ($)", ""].map((h) => (
                  <div key={h} className="font-sans font-extrabold text-[9px] tracking-[1px] uppercase text-brand-smoke/60">{h}</div>
                ))}
              </div>
              {items.map((it, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_120px_64px_88px_32px] gap-2 items-center">
                  <input type="text" value={it.name} onChange={setItem(idx, "name")}
                    placeholder="Item name" className={inputCls} />
                  <input type="text" value={it.size} onChange={setItem(idx, "size")}
                    placeholder="Size" className={inputCls} />
                  <input type="number" min="1" value={it.qty} onChange={setItem(idx, "qty")}
                    className={inputCls} />
                  <input type="number" min="0" step="0.01" value={it.price} onChange={setItem(idx, "price")}
                    placeholder="0.00" className={inputCls} />
                  <button onClick={() => removeItem(idx)} disabled={items.length === 1}
                    className="w-8 h-8 flex items-center justify-center border border-gray-200 text-brand-smoke cursor-pointer hover:border-red-300 hover:text-red-400 transition-colors disabled:opacity-20 disabled:cursor-default">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-3">
              <button onClick={addItem}
                className="font-sans font-extrabold text-[10px] tracking-[1px] uppercase px-3 py-2 border-2 border-gray-200 text-brand-smoke cursor-pointer hover:border-brand-black hover:text-brand-black transition-colors flex items-center gap-1.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Item
              </button>
              <div className="text-right">
                <div className="font-sans text-[12px] text-brand-smoke">Subtotal: ${subtotal.toFixed(2)}</div>
                {Number(form.deliveryFee) > 0 && (
                  <div className="font-sans text-[12px] text-brand-smoke">Delivery: ${Number(form.deliveryFee).toFixed(2)}</div>
                )}
                <div className="font-serif font-black text-[18px] text-brand-black">Total: ${total.toFixed(2)}</div>
              </div>
            </div>
          </section>

          {/* Notes */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Handwritten Note (optional)">
              <textarea value={form.noteMessage} onChange={set("noteMessage")}
                rows={3} placeholder="Message for the card…"
                className={`${inputCls} resize-none`} />
            </Field>
            <Field label="Staff Notes (optional)">
              <textarea value={form.staffNotes} onChange={set("staffNotes")}
                rows={3} placeholder="Internal notes…"
                className={`${inputCls} resize-none`} />
            </Field>
          </section>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 px-4 py-3 font-sans text-[12px] text-red-600">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-3 flex-shrink-0">
          <button onClick={onClose} disabled={saving}
            className="font-sans font-extrabold text-[11px] tracking-[1px] uppercase px-5 py-2.5 border-2 border-gray-300 text-brand-smoke bg-white cursor-pointer hover:border-brand-black hover:text-brand-black transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="font-sans font-extrabold text-[12px] tracking-[1px] uppercase px-6 py-2.5 border-2 border-brand-black text-brand-cream cursor-pointer shadow-retro-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 flex items-center gap-2"
            style={{ background: B.bark }}>
            {saving ? "Creating…" : "Create Order →"}
          </button>
        </div>
      </div>
    </div>
  );
}
