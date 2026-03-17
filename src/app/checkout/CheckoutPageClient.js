"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter }                    from "next/navigation";
import AnnouncementBar   from "@/app/components/AnnouncementBar/AnnouncementBar";
import Navbar            from "@/app/components/Navbar/Navbar";
import Footer            from "@/app/components/Footer/Footer";
import { useCart }       from "@/app/CartContext";
import { getDeliveryFee } from "@/lib/deliveryZones";
import { B }             from "@/lib/brand";

// ── Delivery time windows ──────────────────────────────────────────────────
// 2-hour slots from 9am to 6pm; customer picks a preferred window.
// Driver route is then sorted by the dashboard based on these requests.
const TIME_WINDOWS = [
  { value: "09:00-11:00", label: "9:00am – 11:00am" },
  { value: "10:00-12:00", label: "10:00am – 12:00pm" },
  { value: "11:00-13:00", label: "11:00am – 1:00pm"  },
  { value: "12:00-14:00", label: "12:00pm – 2:00pm"  },
  { value: "13:00-15:00", label: "1:00pm – 3:00pm"   },
  { value: "14:00-16:00", label: "2:00pm – 4:00pm"   },
  { value: "15:00-17:00", label: "3:00pm – 5:00pm"   },
  { value: "16:00-18:00", label: "4:00pm – 6:00pm"   },
];

const DELIVERY_ZONES = [
  { value: "piedmont", label: "Piedmont" },
  { value: "anniston", label: "Anniston / Oxford" },
  { value: "centre",   label: "Centre" },
];

function getTomorrowDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

const FieldError = ({ msg }) =>
  msg ? <p className="font-sans text-[11px] text-red-500 mt-1">{msg}</p> : null;

export default function CheckoutPageClient() {
  const router               = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const [sessionChecked, setSessionChecked] = useState(false);
  const [customerId,     setCustomerId    ] = useState(null);

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
    deliveryWindow : "10:00-12:00",
    noteMessage    : "",
  });

  const [errors,     setErrors    ] = useState({});
  const [submitting, setSubmitting ] = useState(false);
  const [apiError,   setApiError  ] = useState(null);

  // Redirect to /bag if cart is empty after hydration
  useEffect(() => {
    if (items.length === 0 && sessionChecked) {
      router.replace("/bag");
    }
  }, [items, sessionChecked, router]);

  // Pre-fill from session + most-recently-used address
  useEffect(() => {
    (async () => {
      try {
        const sessRes  = await fetch("/api/customers/session");
        const sessData = await sessRes.json();

        if (sessData.customer) {
          setCustomerId(sessData.customer.id);

          // Fetch full profile
          const meRes  = await fetch("/api/customers/me");
          const meData = await meRes.json();

          if (meData.data) {
            const p = meData.data;
            setForm((f) => ({
              ...f,
              customerName : p.name  || f.customerName,
              customerEmail: p.email || f.customerEmail,
              customerPhone: p.phone || f.customerPhone,
            }));

            // Use most-recently-updated address as default
            const addrs = p.addresses ?? [];
            if (addrs.length > 0) {
              const addr = addrs.find((a) => a.is_default) ?? addrs[0];
              setForm((f) => ({
                ...f,
                addressLine : addr.address_line || f.addressLine,
                city        : addr.city          || f.city,
                state       : addr.state         || f.state,
                zip         : addr.zip           || f.zip,
                deliveryZone: addr.zone          || f.deliveryZone,
              }));
            }
          }
        }
      } catch {
        // Session fetch failed — guest checkout, continue
      } finally {
        setSessionChecked(true);
      }
    })();
  }, []);

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => { const n = {...e}; delete n[key]; return n; });
  };

  const deliveryFee = useMemo(() => getDeliveryFee(form.deliveryZone), [form.deliveryZone]);
  const orderTotal  = useMemo(() => subtotal + deliveryFee, [subtotal, deliveryFee]);

  const validate = () => {
    const e = {};
    if (!form.customerName.trim())  e.customerName  = "Name is required.";
    if (!form.customerEmail.trim()) e.customerEmail = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)) {
      e.customerEmail = "Enter a valid email address.";
    }
    if (!form.addressLine.trim())   e.addressLine   = "Street address is required.";
    if (!form.city.trim())          e.city          = "City is required.";
    if (!form.zip.trim())           e.zip           = "ZIP code is required.";
    if (!form.deliveryZone)         e.deliveryZone  = "Please select a delivery zone.";
    if (!form.deliveryDate)         e.deliveryDate  = "Please select a delivery date.";
    else {
      const day = new Date(form.deliveryDate + "T12:00:00").getDay();
      if (day === 0) e.deliveryDate = "We don't deliver on Sundays. Please choose another day.";
    }
    if (!form.deliveryWindow)       e.deliveryWindow = "Please select a preferred delivery window.";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setSubmitting(true);
    setApiError(null);

    const deliveryAddress = [form.addressLine, form.city, form.state, form.zip]
      .filter(Boolean).join(", ");

    const body = {
      customerName   : form.customerName.trim(),
      customerEmail  : form.customerEmail.trim().toLowerCase(),
      customerPhone  : form.customerPhone.trim() || null,
      items          : items.map((i) => ({
        id: i.id, name: i.name, size: i.size, qty: i.qty, price: i.price,
      })),
      subtotal,
      deliveryFee,
      total          : orderTotal,
      deliveryAddress,
      deliveryZone   : form.deliveryZone,
      deliveryDate   : form.deliveryDate,
      deliveryWindow : form.deliveryWindow,
      noteMessage    : form.noteMessage.trim() || null,
      customerId     : customerId || null,
    };

    try {
      const res  = await fetch("/api/orders", {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setApiError(data.error || "Unable to place order. Please try again.");
        setSubmitting(false);
        return;
      }

      clearCart();
      sessionStorage.setItem("lambs_pending_order", JSON.stringify(data.data));
      router.push(`/order/${data.data.order_number}`);
    } catch {
      setApiError("Unable to reach the server. Please check your connection and try again.");
      setSubmitting(false);
    }
  };

  const inputCls = "w-full border-2 border-brand-black/20 px-4 py-3 font-sans text-[13px] text-brand-black focus:outline-none focus:border-brand-orange transition-colors bg-white";
  const labelCls = "block font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-1.5";

  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="font-sans text-brand-smoke text-[13px]">Loading…</div>
      </div>
    );
  }

  return (
    <div className="font-serif bg-brand-cream min-h-screen overflow-x-hidden">
      <AnnouncementBar />
      <Navbar />

      <main className="max-w-[1100px] mx-auto px-5 sm:px-10 py-10 sm:py-14">

        {/* Heading */}
        <div className="mb-10">
          <h1 className="font-serif font-black text-brand-black text-[32px] sm:text-[42px] tracking-[-2px] leading-[1.05] mb-2">
            Checkout
          </h1>
          <div
            className="h-[4px] w-24"
            style={{
              background: `repeating-linear-gradient(90deg,
                ${B.orange} 0, ${B.orange} 16px,
                ${B.gold}   16px, ${B.gold}   20px)`,
            }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">

          {/* ── Left: Delivery Details ────────────────────────────────── */}
          <div className="flex flex-col gap-8">

            {/* Contact */}
            <section>
              <h2 className="font-serif font-black text-brand-black text-[20px] tracking-[-0.5px] mb-5 pb-3 border-b-2 border-brand-black/10">
                Contact Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Full Name *</label>
                  <input type="text" value={form.customerName} autoComplete="name"
                    disabled={submitting} className={`${inputCls} ${errors.customerName ? "border-red-400" : ""}`}
                    onChange={(e) => setField("customerName", e.target.value)} />
                  <FieldError msg={errors.customerName} />
                </div>
                <div>
                  <label className={labelCls}>Email Address *</label>
                  <input type="email" value={form.customerEmail} autoComplete="email"
                    disabled={submitting} className={`${inputCls} ${errors.customerEmail ? "border-red-400" : ""}`}
                    onChange={(e) => setField("customerEmail", e.target.value)} />
                  <FieldError msg={errors.customerEmail} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Phone Number</label>
                  <input type="tel" value={form.customerPhone} autoComplete="tel"
                    disabled={submitting} className={inputCls}
                    onChange={(e) => setField("customerPhone", e.target.value)} />
                </div>
              </div>
            </section>

            {/* Delivery address */}
            <section>
              <h2 className="font-serif font-black text-brand-black text-[20px] tracking-[-0.5px] mb-5 pb-3 border-b-2 border-brand-black/10">
                Delivery Address
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Street Address *</label>
                  <input type="text" value={form.addressLine} autoComplete="address-line1"
                    disabled={submitting} className={`${inputCls} ${errors.addressLine ? "border-red-400" : ""}`}
                    onChange={(e) => setField("addressLine", e.target.value)} />
                  <FieldError msg={errors.addressLine} />
                </div>
                <div>
                  <label className={labelCls}>City *</label>
                  <input type="text" value={form.city} autoComplete="address-level2"
                    disabled={submitting} className={`${inputCls} ${errors.city ? "border-red-400" : ""}`}
                    onChange={(e) => setField("city", e.target.value)} />
                  <FieldError msg={errors.city} />
                </div>
                <div>
                  <label className={labelCls}>ZIP Code *</label>
                  <input type="text" value={form.zip} autoComplete="postal-code"
                    disabled={submitting} className={`${inputCls} ${errors.zip ? "border-red-400" : ""}`}
                    onChange={(e) => setField("zip", e.target.value)} />
                  <FieldError msg={errors.zip} />
                </div>
                <div>
                  <label className={labelCls}>State</label>
                  <select value={form.state} disabled={submitting}
                    className={inputCls} onChange={(e) => setField("state", e.target.value)}>
                    <option value="AL">Alabama</option>
                    <option value="GA">Georgia</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Delivery Zone *</label>
                  <select value={form.deliveryZone} disabled={submitting}
                    className={`${inputCls} ${errors.deliveryZone ? "border-red-400" : ""}`}
                    onChange={(e) => setField("deliveryZone", e.target.value)}>
                    <option value="">Select zone…</option>
                    {DELIVERY_ZONES.map((z) => (
                      <option key={z.value} value={z.value}>
                        {z.label} (+${getDeliveryFee(z.value)})
                      </option>
                    ))}
                  </select>
                  <FieldError msg={errors.deliveryZone} />
                </div>
              </div>
            </section>

            {/* Delivery scheduling */}
            <section>
              <h2 className="font-serif font-black text-brand-black text-[20px] tracking-[-0.5px] mb-2 pb-3 border-b-2 border-brand-black/10">
                Delivery Schedule
              </h2>
              <p className="font-sans text-[12px] text-brand-smoke mb-5 leading-relaxed">
                Select your preferred delivery date and a 2-hour arrival window.
                We&apos;ll do our best to arrive during your requested time — our driver
                route is optimised around customer requests.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Delivery Date *</label>
                  <input type="date" value={form.deliveryDate} disabled={submitting}
                    min={getTomorrowDate()}
                    className={`${inputCls} ${errors.deliveryDate ? "border-red-400" : ""}`}
                    onChange={(e) => setField("deliveryDate", e.target.value)} />
                  <FieldError msg={errors.deliveryDate} />
                  <p className="font-sans text-[11px] text-brand-smoke/60 mt-1">No Sunday deliveries.</p>
                </div>

                <div>
                  <label className={labelCls}>Preferred Arrival Window *</label>
                  <select value={form.deliveryWindow} disabled={submitting}
                    className={`${inputCls} ${errors.deliveryWindow ? "border-red-400" : ""}`}
                    onChange={(e) => setField("deliveryWindow", e.target.value)}>
                    {TIME_WINDOWS.map((w) => (
                      <option key={w.value} value={w.value}>{w.label}</option>
                    ))}
                  </select>
                  <FieldError msg={errors.deliveryWindow} />
                </div>
              </div>
            </section>

            {/* Special instructions */}
            <section>
              <h2 className="font-serif font-black text-brand-black text-[20px] tracking-[-0.5px] mb-5 pb-3 border-b-2 border-brand-black/10">
                Special Instructions
                <span className="font-sans font-normal text-brand-smoke text-[13px] tracking-normal ml-2">(optional)</span>
              </h2>
              <textarea value={form.noteMessage} disabled={submitting}
                rows={3} placeholder="Card message, gate code, delivery notes…"
                className={`${inputCls} resize-none`}
                onChange={(e) => setField("noteMessage", e.target.value)} />
            </section>
          </div>

          {/* ── Right: Order Summary ──────────────────────────────────── */}
          <div>
            <div className="bg-white border-[3px] border-brand-black p-6 sticky top-6 shadow-retro-md">
              <h2 className="font-serif font-black text-brand-black text-[20px] tracking-[-0.5px] mb-5 pb-3 border-b-2 border-brand-black/10">
                Order Summary
              </h2>

              <div className="flex flex-col gap-3 mb-5">
                {items.map((item) => (
                  <div key={`${item.id}__${item.size}`} className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-sans font-extrabold text-[12px] text-brand-black truncate">
                        {item.name}
                      </div>
                      {item.size && (
                        <div className="font-sans text-[10px] text-brand-smoke uppercase tracking-[1px]">
                          {item.size} × {item.qty}
                        </div>
                      )}
                    </div>
                    <span className="font-sans font-black text-[13px] text-brand-black flex-shrink-0">
                      ${(item.price * item.qty).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-brand-black/10 pt-4 flex flex-col gap-2 mb-6">
                <div className="flex justify-between font-sans text-[13px] text-brand-smoke">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-sans text-[13px] text-brand-smoke">
                  <span>Delivery</span>
                  <span>
                    {form.deliveryZone
                      ? `$${deliveryFee.toFixed(2)}`
                      : <span className="text-brand-smoke/50">Select zone</span>}
                  </span>
                </div>
                <div className="flex justify-between font-sans font-black text-[18px] text-brand-black border-t border-brand-black/10 pt-3 mt-1">
                  <span>Total</span>
                  <span className="text-brand-orange">${orderTotal.toFixed(2)}</span>
                </div>
              </div>

              {apiError && (
                <div className="mb-4 bg-red-50 border border-red-200 px-4 py-3 font-sans text-[12px] text-red-600">
                  {apiError}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting || items.length === 0}
                className={`w-full py-4 font-sans font-black text-[13px] tracking-[2px] uppercase border-[3px] transition-all flex items-center justify-center gap-3 ${
                  submitting || items.length === 0
                    ? "bg-brand-smoke/20 text-brand-smoke/50 border-brand-smoke/30 cursor-not-allowed"
                    : "bg-brand-orange text-brand-cream border-brand-black cursor-pointer shadow-retro-md hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-retro-sm"
                }`}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" />
                    </svg>
                    Placing Order…
                  </>
                ) : (
                  "Place Order"
                )}
              </button>

              <p className="font-sans text-[10px] text-brand-smoke/60 text-center mt-3 leading-relaxed">
                Payment is collected on delivery or by invoice.
                No card details required at this step.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}