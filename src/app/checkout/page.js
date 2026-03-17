"use client";

import { useState, useEffect, useMemo } from "react";
import Link                             from "next/link";
import { useRouter }                    from "next/navigation";
import AnnouncementBar  from "@/app/components/AnnouncementBar/AnnouncementBar";
import Navbar           from "@/app/components/Navbar/Navbar";
import Footer           from "@/app/components/Footer/Footer";
import { useCart }      from "@/app/CartContext";
import { B }            from "@/lib/brand";
import { DELIVERY_ZONES, getDeliveryFee } from "@/lib/deliveryZones";

// ── Shared input + label style ────────────────────────────────────────────────
const inputCls =
  "w-full border-[2px] border-brand-black/30 px-4 py-3 font-sans text-[14px] text-brand-black placeholder:text-brand-smoke/40 focus:outline-none focus:border-brand-orange transition-colors bg-white";

function Label({ children, required }) {
  return (
    <label className="block font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-1.5">
      {children}
      {required && <span className="text-brand-orange ml-0.5">*</span>}
    </label>
  );
}

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="font-sans text-[11px] text-red-500 mt-1">{msg}</p>
  );
}

// ── Delivery date helpers ─────────────────────────────────────────────────────
function getTomorrowDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const router              = useRouter();
  const { items, subtotal, clearCart } = useCart();

  // ── Pre-fill from session if logged in ──────────────────────────────────────
  const [sessionChecked, setSessionChecked] = useState(false);

  // ── Form state ───────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    customerName   : "",
    customerEmail  : "",
    customerPhone  : "",
    addressLine    : "",
    city           : "",
    state          : "AL",
    zip            : "",
    deliveryZone   : "",
    deliveryDate   : getTomorrowDate(),
    deliveryWindow : "afternoon",
    noteMessage    : "",
  });

  const [errors,    setErrors    ] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError,   setApiError  ] = useState(null);

  // Redirect to /bag if empty (after hydration)
  useEffect(() => {
    if (items.length === 0) {
      router.replace("/bag");
    }
  }, [items, router]);

  // Pre-fill from session (non-blocking)
  useEffect(() => {
    fetch("/api/customers/session")
      .then((r) => r.json())
      .then((data) => {
        if (data.customer) {
          // Fetch full profile for phone
          fetch("/api/customers/me")
            .then((r) => r.json())
            .then((p) => {
              if (p.data) {
                setForm((f) => ({
                  ...f,
                  customerName : p.data.name  || f.customerName,
                  customerEmail: p.data.email || f.customerEmail,
                  customerPhone: p.data.phone || f.customerPhone,
                }));
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setSessionChecked(true));
  }, []);

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => { const n = {...e}; delete n[key]; return n; });
  };

  // Derived: delivery fee + total
  const deliveryFee = useMemo(() => getDeliveryFee(form.deliveryZone), [form.deliveryZone]);
  const orderTotal  = useMemo(() => subtotal + deliveryFee, [subtotal, deliveryFee]);

  // ── Validation ────────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.customerName.trim())   e.customerName   = "Name is required.";
    if (!form.customerEmail.trim())  e.customerEmail  = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)) {
      e.customerEmail = "Enter a valid email address.";
    }
    if (!form.addressLine.trim())    e.addressLine    = "Street address is required.";
    if (!form.city.trim())           e.city           = "City is required.";
    if (!form.zip.trim())            e.zip            = "ZIP code is required.";
    if (!form.deliveryZone)          e.deliveryZone   = "Please select a delivery zone.";
    if (!form.deliveryDate)          e.deliveryDate   = "Please select a delivery date.";
    else {
      const day = new Date(form.deliveryDate + "T12:00:00").getDay(); // 0=Sun
      if (day === 0) e.deliveryDate = "We don't deliver on Sundays. Please choose another day.";
    }
    return e;
  };

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setSubmitting(true);
    setApiError(null);

    const deliveryAddress = [
      form.addressLine,
      form.city,
      form.state,
      form.zip,
    ].filter(Boolean).join(", ");

    const body = {
      customerName  : form.customerName.trim(),
      customerEmail : form.customerEmail.trim().toLowerCase(),
      customerPhone : form.customerPhone.trim() || null,
      items         : items.map((i) => ({
        id   : i.id,
        name : i.name,
        size : i.size,
        qty  : i.qty,
        price: i.price,
      })),
      subtotal      : subtotal,
      deliveryFee   : deliveryFee,
      total         : orderTotal,
      deliveryAddress,
      deliveryZone  : form.deliveryZone,
      deliveryDate  : form.deliveryDate,
      deliveryWindow: form.deliveryWindow,
      noteMessage   : form.noteMessage.trim() || null,
    };

    try {
      const res  = await fetch("/api/orders", {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setApiError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      // Save order to sessionStorage for the confirmation page
      try {
        sessionStorage.setItem("lambs_pending_order", JSON.stringify(data));
      } catch { /* non-fatal */ }

      clearCart();
      router.push(`/order/${data.order_number}`);

    } catch {
      setApiError("Unable to reach the server. Please check your connection and try again.");
      setSubmitting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="font-serif bg-brand-cream min-h-screen overflow-x-hidden">
      <AnnouncementBar />
      <Navbar />

      {/* Page header */}
      <div
        className="border-b-[3px] border-brand-black px-5 sm:px-10 lg:px-16 py-8 sm:py-10"
        style={{
          background: `repeating-linear-gradient(-55deg,
            transparent 0px, transparent 60px,
            rgba(212,81,26,0.04) 60px, rgba(212,81,26,0.04) 66px)`,
        }}
      >
        <div className="max-w-[1200px] mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 font-sans text-[11px] font-extrabold tracking-[1.5px] uppercase text-brand-smoke mb-4">
            <Link href="/bag" className="hover:text-brand-orange transition-colors no-underline">
              Bag
            </Link>
            <span>›</span>
            <span className="text-brand-orange">Checkout</span>
          </div>
          <h1 className="font-serif font-black text-brand-black text-[32px] sm:text-[42px] tracking-[-2px]">
            Checkout
          </h1>
          <div
            className="mt-4 h-[4px] w-24"
            style={{
              background: `repeating-linear-gradient(90deg,
                ${B.gold} 0, ${B.gold} 16px,
                ${B.black} 16px, ${B.black} 20px)`,
            }}
          />
        </div>
      </div>

      <main className="px-5 sm:px-10 lg:px-16 py-10 sm:py-14 max-w-[1200px] mx-auto">

        {/* Global API error */}
        {apiError && (
          <div className="bg-red-50 border-[2px] border-red-300 px-5 py-4 mb-8 flex items-start gap-3">
            <svg className="flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="font-sans text-[13px] text-red-600">{apiError}</span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-start">

          {/* ── Delivery form ─────────────────────────────────────────────── */}
          <div className="flex-1 w-full flex flex-col gap-10">

            {/* ── Section 1: Contact ──────────────────────────────────────── */}
            <section>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-8 h-8 bg-brand-orange border-[2px] border-brand-black flex items-center justify-center flex-shrink-0">
                  <span className="font-sans font-black text-brand-cream text-[13px]">1</span>
                </div>
                <h2 className="font-serif font-black text-brand-black text-[22px] tracking-[-0.5px]">
                  Contact Information
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <Label required>Full Name</Label>
                  <input
                    type="text" value={form.customerName}
                    placeholder="Recipient or your name"
                    autoComplete="name" disabled={submitting}
                    className={`${inputCls} ${errors.customerName ? "border-red-400" : ""}`}
                    onChange={(e) => setField("customerName", e.target.value)}
                  />
                  <FieldError msg={errors.customerName} />
                </div>
                <div>
                  <Label required>Email Address</Label>
                  <input
                    type="email" value={form.customerEmail}
                    placeholder="you@example.com"
                    autoComplete="email" disabled={submitting}
                    className={`${inputCls} ${errors.customerEmail ? "border-red-400" : ""}`}
                    onChange={(e) => setField("customerEmail", e.target.value)}
                  />
                  <FieldError msg={errors.customerEmail} />
                </div>
                <div>
                  <Label>Phone <span className="font-normal normal-case tracking-normal">(optional)</span></Label>
                  <input
                    type="tel" value={form.customerPhone}
                    placeholder="(256) 555-0100"
                    autoComplete="tel" disabled={submitting}
                    className={inputCls}
                    onChange={(e) => setField("customerPhone", e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* ── Section 2: Delivery details ─────────────────────────────── */}
            <section>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-8 h-8 bg-brand-orange border-[2px] border-brand-black flex items-center justify-center flex-shrink-0">
                  <span className="font-sans font-black text-brand-cream text-[13px]">2</span>
                </div>
                <h2 className="font-serif font-black text-brand-black text-[22px] tracking-[-0.5px]">
                  Delivery Details
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                {/* Street address */}
                <div className="sm:col-span-2">
                  <Label required>Street Address</Label>
                  <input
                    type="text" value={form.addressLine}
                    placeholder="123 Oak Street"
                    autoComplete="address-line1" disabled={submitting}
                    className={`${inputCls} ${errors.addressLine ? "border-red-400" : ""}`}
                    onChange={(e) => setField("addressLine", e.target.value)}
                  />
                  <FieldError msg={errors.addressLine} />
                </div>

                {/* City */}
                <div>
                  <Label required>City</Label>
                  <input
                    type="text" value={form.city}
                    placeholder="Piedmont"
                    autoComplete="address-level2" disabled={submitting}
                    className={`${inputCls} ${errors.city ? "border-red-400" : ""}`}
                    onChange={(e) => setField("city", e.target.value)}
                  />
                  <FieldError msg={errors.city} />
                </div>

                {/* State + ZIP */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>State</Label>
                    <select
                      value={form.state} disabled={submitting}
                      className={`${inputCls} cursor-pointer`}
                      onChange={(e) => setField("state", e.target.value)}
                    >
                      <option value="AL">AL</option>
                      <option value="GA">GA</option>
                    </select>
                  </div>
                  <div>
                    <Label required>ZIP Code</Label>
                    <input
                      type="text" value={form.zip}
                      placeholder="36272"
                      autoComplete="postal-code" disabled={submitting}
                      maxLength={5}
                      className={`${inputCls} ${errors.zip ? "border-red-400" : ""}`}
                      onChange={(e) => setField("zip", e.target.value.replace(/\D/g, ""))}
                    />
                    <FieldError msg={errors.zip} />
                  </div>
                </div>

                {/* Delivery zone */}
                <div className="sm:col-span-2">
                  <Label required>Delivery Zone</Label>
                  <select
                    value={form.deliveryZone} disabled={submitting}
                    className={`${inputCls} cursor-pointer ${errors.deliveryZone ? "border-red-400" : ""}`}
                    onChange={(e) => setField("deliveryZone", e.target.value)}
                  >
                    <option value="">Select your area…</option>
                    {DELIVERY_ZONES.map((z) => (
                      <option key={z.value} value={z.value}>
                        {z.label} — ${z.fee.toFixed(2)} delivery fee
                      </option>
                    ))}
                  </select>
                  <FieldError msg={errors.deliveryZone} />
                </div>

                {/* Date */}
                <div>
                  <Label required>Delivery Date</Label>
                  <input
                    type="date" value={form.deliveryDate}
                    min={getTomorrowDate()} disabled={submitting}
                    className={`${inputCls} cursor-pointer ${errors.deliveryDate ? "border-red-400" : ""}`}
                    onChange={(e) => setField("deliveryDate", e.target.value)}
                  />
                  <FieldError msg={errors.deliveryDate} />
                  <p className="font-sans text-[10px] text-brand-smoke/60 mt-1">
                    Mon–Sat only. We don&apos;t deliver on Sundays.
                  </p>
                </div>

                {/* Window */}
                <div>
                  <Label required>Delivery Window</Label>
                  <div className="flex gap-3">
                    {[
                      { value: "morning",   label: "Morning",   sub: "9am–12pm" },
                      { value: "afternoon", label: "Afternoon", sub: "12pm–5pm" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={submitting}
                        onClick={() => setField("deliveryWindow", opt.value)}
                        className={`flex-1 py-3 border-[2px] text-left px-3 cursor-pointer transition-colors ${
                          form.deliveryWindow === opt.value
                            ? "bg-brand-black border-brand-black text-brand-cream"
                            : "bg-white border-brand-black/30 text-brand-black hover:border-brand-orange"
                        }`}
                      >
                        <div className="font-sans font-extrabold text-[11px] tracking-[1px] uppercase">
                          {opt.label}
                        </div>
                        <div className={`font-sans text-[10px] mt-0.5 ${
                          form.deliveryWindow === opt.value ? "text-brand-cream/70" : "text-brand-smoke"
                        }`}>
                          {opt.sub}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card note */}
                <div className="sm:col-span-2">
                  <Label>Card / Gift Message <span className="font-normal normal-case tracking-normal">(optional)</span></Label>
                  <textarea
                    value={form.noteMessage} disabled={submitting}
                    placeholder="e.g. Happy Birthday! With love from the family…"
                    rows={3}
                    className={`${inputCls} resize-none`}
                    onChange={(e) => setField("noteMessage", e.target.value)}
                  />
                  <p className="font-sans text-[10px] text-brand-smoke/60 mt-1">
                    We&apos;ll handwrite this on a card included with your arrangement.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* ── Order summary sidebar ──────────────────────────────────────── */}
          <div className="w-full lg:w-[360px] flex-shrink-0">
            <div className="bg-white border-[3px] border-brand-black shadow-retro-lg overflow-hidden sticky top-24">

              {/* Header stripe */}
              <div
                className="h-[5px]"
                style={{
                  background: `repeating-linear-gradient(90deg,
                    ${B.orange} 0, ${B.orange} 40px,
                    ${B.gold}   40px, ${B.gold}   50px,
                    ${B.black}  50px, ${B.black}  54px)`,
                }}
              />

              <div className="px-6 py-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-serif font-black text-brand-black text-[20px] tracking-[-0.5px]">
                    Your Order
                  </h2>
                  <Link href="/bag" className="font-sans text-[10px] font-extrabold tracking-[1.5px] uppercase text-brand-smoke hover:text-brand-orange transition-colors no-underline">
                    Edit Bag
                  </Link>
                </div>

                {/* Items */}
                <div className="flex flex-col gap-3 pb-5 mb-5 border-b border-brand-black/10">
                  {items.map((item) => (
                    <div key={`${item.id}__${item.size}`} className="flex items-start gap-3">
                      <span className="text-[24px] leading-none flex-shrink-0">{item.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-sans font-extrabold text-[12px] text-brand-black leading-tight truncate">
                          {item.name}
                        </div>
                        {item.size && (
                          <div className="font-sans text-[10px] text-brand-smoke">{item.size}</div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-sans font-extrabold text-[12px] text-brand-black">
                          ${(item.price * item.qty).toFixed(2)}
                        </div>
                        <div className="font-sans text-[10px] text-brand-smoke">
                          × {item.qty}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="flex flex-col gap-2 pb-5 mb-5 border-b border-brand-black/10">
                  <div className="flex justify-between items-center">
                    <span className="font-sans text-[12px] text-brand-smoke">Subtotal</span>
                    <span className="font-sans font-extrabold text-[13px] text-brand-black">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-sans text-[12px] text-brand-smoke">Delivery fee</span>
                    <span className={`font-sans font-extrabold text-[13px] ${form.deliveryZone ? "text-brand-black" : "text-brand-smoke/40"}`}>
                      {form.deliveryZone ? `$${deliveryFee.toFixed(2)}` : "—"}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="font-sans font-extrabold text-[13px] tracking-[1px] uppercase text-brand-black">
                    Total
                  </span>
                  <span className="font-sans font-black text-[22px] text-brand-orange">
                    ${orderTotal.toFixed(2)}
                  </span>
                </div>

                {/* Place order button */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-brand-orange text-brand-cream border-[3px] border-brand-black py-4 font-sans font-black text-[13px] tracking-[2px] uppercase cursor-pointer shadow-retro-md hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-retro-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none transition-all flex items-center justify-center gap-3"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 12a9 9 0 11-6.219-8.56" />
                      </svg>
                      Placing Order…
                    </>
                  ) : (
                    <>
                      Place Order
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                      </svg>
                    </>
                  )}
                </button>

                {/* Trust / info */}
                <div className="mt-5 flex flex-col gap-2">
                  {[
                    "Payment collected on delivery or by invoice",
                    "Mon–Sat delivery, Piedmont to Centre",
                    "Handcrafted same or next day",
                  ].map((text) => (
                    <div key={text} className="flex items-start gap-2">
                      <svg className="flex-shrink-0 mt-0.5" width="12" height="12" viewBox="0 0 24 24"
                        fill="none" stroke={B.orange} strokeWidth="3" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span className="font-sans text-[10px] text-brand-smoke leading-relaxed">
                        {text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}