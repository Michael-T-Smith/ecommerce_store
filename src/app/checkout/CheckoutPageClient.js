"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter }    from "next/navigation";
import { loadStripe }   from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import AnnouncementBar  from "@/app/components/AnnouncementBar/AnnouncementBar";
import Navbar           from "@/app/components/Navbar/Navbar";
import Footer           from "@/app/components/Footer/Footer";
import { useCart }      from "@/app/CartContext";
import { DELIVERY_ZONES, getDeliveryFee } from "@/lib/deliveryZones";
import { B }            from "@/lib/brand";

// ── Stripe singleton — created outside component to avoid re-instantiation ──
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// ── Constants ────────────────────────────────────────────────────────────────
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

const PICKUP_TIMES = [
  { value: "09:00-10:00", label: "9:00am – 10:00am" },
  { value: "10:00-11:00", label: "10:00am – 11:00am" },
  { value: "11:00-12:00", label: "11:00am – 12:00pm" },
  { value: "12:00-13:00", label: "12:00pm – 1:00pm"  },
  { value: "13:00-14:00", label: "1:00pm – 2:00pm"   },
  { value: "14:00-15:00", label: "2:00pm – 3:00pm"   },
  { value: "15:00-16:00", label: "3:00pm – 4:00pm"   },
  { value: "16:00-17:00", label: "4:00pm – 5:00pm"   },
];

const STORE = {
  name   : "Lamb's Florist",
  address: "204 Main St",
  city   : "Piedmont, AL 36272",
  phone  : "(256) 447-4800",
  hours  : "Mon–Fri 8am–6pm · Sat 8am–5pm · Closed Sunday",
};

function getTomorrowDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

// ── Small shared components ──────────────────────────────────────────────────
const FieldError = ({ msg }) =>
  msg ? <p className="font-sans text-[11px] text-red-500 mt-1.5">{msg}</p> : null;

function SectionHeading({ children }) {
  return (
    <h2 className="font-serif font-black text-brand-black text-[18px] tracking-[-0.5px] mb-5 pb-3 border-b-2 border-brand-black/10 flex items-center gap-2">
      {children}
    </h2>
  );
}

// ── Stripe PaymentForm (inner — must live inside <Elements>) ─────────────────
function StripePaymentForm({ orderTotal, onSuccess, onBack, orderData, disabled }) {
  const stripe      = useStripe();
  const elements    = useElements();
  const [error,     setError    ] = useState(null);
  const [paying,    setPaying   ] = useState(false);
  const [cardReady, setCardReady] = useState(false);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setError(null);
    setPaying(true);

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message ?? "Payment failed. Please try again.");
      setPaying(false);
      return;
    }

    if (paymentIntent?.status === "succeeded" || paymentIntent?.status === "processing") {
      try {
        const res  = await fetch("/api/orders", {
          method : "POST",
          headers: { "Content-Type": "application/json" },
          body   : JSON.stringify({
            ...orderData,
            stripePaymentId: paymentIntent.id,
          }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Payment succeeded but order creation failed. Please call us.");
          setPaying(false);
          return;
        }

        onSuccess(data.data);
      } catch {
        setError("Payment succeeded but we couldn't reach our server. Please call (256) 447-4800.");
        setPaying(false);
      }
    } else {
      setError("Payment was not completed. Please try again.");
      setPaying(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="border-2 border-brand-black/15 p-4 bg-white">
        <PaymentElement
          onReady={() => setCardReady(true)}
          options={{
            layout: "tabs",
            fields: { billingDetails: { name: "auto", email: "never" } },
          }}
        />
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-300 px-4 py-3 font-sans text-[12px] text-red-600 leading-relaxed">
          {error}
        </div>
      )}

      <button
        onClick={handlePay}
        disabled={!stripe || !elements || !cardReady || paying || disabled}
        className={`w-full py-4 font-sans font-black text-[14px] tracking-[2px] uppercase border-[3px] flex items-center justify-center gap-3 transition-all ${
          !stripe || !cardReady || paying || disabled
            ? "bg-brand-smoke/20 text-brand-smoke/50 border-brand-smoke/20 cursor-not-allowed"
            : "bg-brand-orange text-brand-cream border-brand-black cursor-pointer shadow-retro-md hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-retro-sm"
        }`}
      >
        {paying ? (
          <>
            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
            Processing…
          </>
        ) : (
          `Pay $${orderTotal.toFixed(2)}`
        )}
      </button>

      <button
        onClick={onBack}
        disabled={paying}
        className="font-sans font-extrabold text-[11px] tracking-[1.5px] uppercase text-brand-smoke hover:text-brand-orange transition-colors text-center disabled:opacity-40"
      >
        ← Edit Order Details
      </button>

      <p className="font-sans text-[10px] text-brand-smoke/60 text-center leading-relaxed">
        Payments processed securely by Stripe. Your card details never touch our servers.
      </p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CheckoutPageClient() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  // ── Session / prefill ───────────────────────────────────────────────────
  const [sessionChecked, setSessionChecked] = useState(false);
  const [customerId,     setCustomerId    ] = useState(null);

  // ── Step: "details" → "payment" ─────────────────────────────────────────
  const [step,         setStep        ] = useState("details"); // "details" | "payment"
  const [clientSecret, setClientSecret] = useState(null);
  const [intentError,  setIntentError ] = useState(null);
  const [creatingIntent, setCreatingIntent] = useState(false);

  // ── Fulfillment type ─────────────────────────────────────────────────────
  const [fulfillment, setFulfillment] = useState("delivery"); // "delivery" | "pickup"

  // ── Form state ───────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    // Contact
    customerName : "",
    customerEmail: "",
    customerPhone: "",
    // Delivery
    addressLine  : "",
    city         : "",
    state        : "AL",
    zip          : "",
    deliveryZone : "",
    deliveryDate : getTomorrowDate(),
    deliveryWindow: "10:00-12:00",
    // Pickup
    pickupDate   : getTomorrowDate(),
    pickupTime   : "10:00-11:00",
    // Shared
    noteMessage  : "",
  });

  const [errors,   setErrors  ] = useState({});

  // ── Redirect if cart empty ───────────────────────────────────────────────
  useEffect(() => {
    if (sessionChecked && items.length === 0) router.replace("/bag");
  }, [items, sessionChecked, router]);

  // ── Pre-fill from saved session ──────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const sr = await fetch("/api/customers/session");
        const sd = await sr.json();
        if (sd.customer) {
          setCustomerId(sd.customer.id);
          const mr = await fetch("/api/customers/me");
          const md = await mr.json();
          if (md.data) {
            const p = md.data;
            setForm((f) => ({ ...f,
              customerName : p.name  || f.customerName,
              customerEmail: p.email || f.customerEmail,
              customerPhone: p.phone || f.customerPhone,
            }));
            const addr = (p.addresses ?? []).find((a) => a.is_default) ?? p.addresses?.[0];
            if (addr) {
              setForm((f) => ({ ...f,
                addressLine  : addr.address_line || f.addressLine,
                city         : addr.city         || f.city,
                state        : addr.state        || f.state,
                zip          : addr.zip          || f.zip,
                deliveryZone : addr.zone         || f.deliveryZone,
              }));
            }
          }
        }
      } catch { /* guest */ }
      finally { setSessionChecked(true); }
    })();
  }, []);

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  };

  // ── Derived totals ───────────────────────────────────────────────────────
  const deliveryFee  = useMemo(() =>
    fulfillment === "delivery" ? getDeliveryFee(form.deliveryZone) : 0,
    [fulfillment, form.deliveryZone]
  );
  const orderTotal   = useMemo(() => subtotal + deliveryFee, [subtotal, deliveryFee]);

  // ── Validate ─────────────────────────────────────────────────────────────
  const validate = useCallback(() => {
    const e = {};
    if (!form.customerName.trim())  e.customerName  = "Full name is required.";
    if (!form.customerEmail.trim()) e.customerEmail = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail))
      e.customerEmail = "Enter a valid email address.";

    if (fulfillment === "delivery") {
      if (!form.addressLine.trim()) e.addressLine  = "Street address is required.";
      if (!form.city.trim())        e.city         = "City is required.";
      if (!form.zip.trim())         e.zip          = "ZIP code is required.";
      if (!form.deliveryZone)       e.deliveryZone = "Please select a delivery zone.";
      if (!form.deliveryDate) {
        e.deliveryDate = "Please select a delivery date.";
      } else {
        const day = new Date(form.deliveryDate + "T12:00:00").getDay();
        if (day === 0) e.deliveryDate = "We don't deliver on Sundays.";
      }
    }

    if (fulfillment === "pickup") {
      if (!form.pickupDate) {
        e.pickupDate = "Please select a pickup date.";
      } else {
        const day = new Date(form.pickupDate + "T12:00:00").getDay();
        if (day === 0) e.pickupDate = "We're closed on Sundays.";
      }
    }

    return e;
  }, [form, fulfillment]);

  // ── Step 1 → 2: create PaymentIntent ────────────────────────────────────
  const handleContinueToPayment = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setCreatingIntent(true);
    setIntentError(null);

    try {
      const res  = await fetch("/api/payments/intent", {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({
          amount         : orderTotal,
          customerEmail  : form.customerEmail.trim().toLowerCase(),
          description    : `Lamb's Florist — ${fulfillment === "pickup" ? "Pickup" : "Delivery"} order`,
          fulfillmentType: fulfillment,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.clientSecret) {
        setIntentError(data.error || "Could not initialize payment. Please try again.");
        return;
      }

      setClientSecret(data.clientSecret);
      setStep("payment");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setIntentError("Unable to reach the server. Please check your connection.");
    } finally {
      setCreatingIntent(false);
    }
  };

  // ── Step 2: payment success ──────────────────────────────────────────────
  const handlePaymentSuccess = (order) => {
    clearCart();
    sessionStorage.setItem("lambs_pending_order", JSON.stringify(order));
    router.push(`/order/${order.order_number}`);
  };

  // ── Order data for POST /api/orders after payment ────────────────────────
  const orderData = useMemo(() => {
    const deliveryAddress =
      fulfillment === "delivery"
        ? [form.addressLine, form.city, form.state, form.zip].filter(Boolean).join(", ")
        : null;

    return {
      customerName  : form.customerName.trim(),
      customerEmail : form.customerEmail.trim().toLowerCase(),
      customerPhone : form.customerPhone.trim() || null,
      items         : items.map((i) => ({ id: i.id, name: i.name, size: i.size, qty: i.qty, price: i.price })),
      subtotal,
      deliveryFee,
      total         : orderTotal,
      fulfillmentType: fulfillment,
      // delivery
      deliveryAddress,
      deliveryZone  : fulfillment === "delivery" ? form.deliveryZone   : null,
      deliveryDate  : fulfillment === "delivery" ? form.deliveryDate   : null,
      deliveryWindow: fulfillment === "delivery" ? form.deliveryWindow : null,
      // pickup
      pickupDate    : fulfillment === "pickup"   ? form.pickupDate     : null,
      pickupTime    : fulfillment === "pickup"   ? form.pickupTime     : null,
      noteMessage   : form.noteMessage.trim() || null,
      customerId    : customerId || null,
    };
  }, [form, fulfillment, items, subtotal, deliveryFee, orderTotal, customerId]);

  // ── Styles ───────────────────────────────────────────────────────────────
  const inputCls = "w-full border-2 border-brand-black/20 px-4 py-3 font-sans text-[13px] text-brand-black focus:outline-none focus:border-brand-orange transition-colors bg-white";
  const labelCls = "block font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-1.5";

  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="font-sans text-brand-smoke text-[13px] animate-pulse">Loading…</div>
      </div>
    );
  }

  return (
    <div className="font-serif bg-brand-cream min-h-screen overflow-x-hidden">
      <AnnouncementBar />
      <Navbar />

      <main className="max-w-[1140px] mx-auto px-5 sm:px-10 py-10 sm:py-14">

        {/* ── Page title + step indicator ─────────────────────────── */}
        <div className="mb-10">
          <h1 className="font-serif font-black text-brand-black text-[32px] sm:text-[42px] tracking-[-2px] leading-[1.05] mb-3">
            {step === "details" ? "Checkout" : "Payment"}
          </h1>
          <div className="flex items-center gap-3">
            {/* Step dots */}
            {["details", "payment"].map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                {i > 0 && <div className="w-12 h-[2px] bg-brand-black/15" />}
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full border-2 flex items-center justify-center font-sans font-extrabold text-[11px] transition-colors"
                    style={{
                      borderColor: step === s || (s === "details") ? B.orange : "#ccc",
                      background : step === s ? B.orange : s === "details" && step === "payment" ? B.orange : "transparent",
                      color      : step === s || (s === "details" && step === "payment") ? B.cream : "#999",
                    }}
                  >
                    {s === "details" && step === "payment" ? "✓" : i + 1}
                  </div>
                  <span className={`font-sans font-extrabold text-[11px] tracking-[1px] uppercase ${step === s ? "text-brand-black" : "text-brand-smoke/60"}`}>
                    {s === "details" ? "Your Details" : "Payment"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div
            className="h-[4px] w-24 mt-4"
            style={{
              background: `repeating-linear-gradient(90deg,
                ${B.orange} 0, ${B.orange} 16px,
                ${B.gold}   16px, ${B.gold}   20px)`,
            }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-start">

          {/* ══════════════════════════════════════════════════════════
              LEFT COLUMN
          ═══════════════════════════════════════════════════════════ */}
          <div className="flex flex-col gap-8">

            {/* ── STEP 1: Details ──────────────────────────────────── */}
            {step === "details" && (
              <>
                {/* Fulfillment toggle */}
                <div>
                  <p className={labelCls}>How would you like to receive your order?</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "delivery", icon: "🚐", label: "Delivery",    sub: "We bring it to you" },
                      { value: "pickup",   icon: "🌸", label: "In-Store Pickup", sub: "204 Main St, Piedmont" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setFulfillment(opt.value)}
                        className={`flex flex-col items-center gap-2 py-5 px-4 border-[3px] transition-all cursor-pointer ${
                          fulfillment === opt.value
                            ? "border-brand-orange bg-brand-orange/5 shadow-retro-sm"
                            : "border-brand-black/20 bg-white hover:border-brand-orange/50"
                        }`}
                      >
                        <span className="text-[28px]">{opt.icon}</span>
                        <div>
                          <div className={`font-sans font-extrabold text-[13px] tracking-[0.5px] ${fulfillment === opt.value ? "text-brand-orange" : "text-brand-black"}`}>
                            {opt.label}
                          </div>
                          <div className="font-sans text-[11px] text-brand-smoke mt-0.5">
                            {opt.sub}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contact */}
                <section>
                  <SectionHeading>Contact Details</SectionHeading>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Full Name *</label>
                      <input type="text" value={form.customerName} autoComplete="name"
                        className={`${inputCls} ${errors.customerName ? "border-red-400" : ""}`}
                        onChange={(e) => setField("customerName", e.target.value)} />
                      <FieldError msg={errors.customerName} />
                    </div>
                    <div>
                      <label className={labelCls}>Email Address *</label>
                      <input type="email" value={form.customerEmail} autoComplete="email"
                        className={`${inputCls} ${errors.customerEmail ? "border-red-400" : ""}`}
                        onChange={(e) => setField("customerEmail", e.target.value)} />
                      <FieldError msg={errors.customerEmail} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Phone <span className="text-brand-smoke/50 normal-case tracking-normal font-normal">(optional)</span></label>
                      <input type="tel" value={form.customerPhone} autoComplete="tel"
                        className={inputCls}
                        onChange={(e) => setField("customerPhone", e.target.value)} />
                    </div>
                  </div>
                </section>

                {/* ── DELIVERY fields ─────────────────────────────── */}
                {fulfillment === "delivery" && (
                  <>
                    <section>
                      <SectionHeading>Delivery Address</SectionHeading>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label className={labelCls}>Street Address *</label>
                          <input type="text" value={form.addressLine} autoComplete="address-line1"
                            className={`${inputCls} ${errors.addressLine ? "border-red-400" : ""}`}
                            onChange={(e) => setField("addressLine", e.target.value)} />
                          <FieldError msg={errors.addressLine} />
                        </div>
                        <div>
                          <label className={labelCls}>City *</label>
                          <input type="text" value={form.city} autoComplete="address-level2"
                            className={`${inputCls} ${errors.city ? "border-red-400" : ""}`}
                            onChange={(e) => setField("city", e.target.value)} />
                          <FieldError msg={errors.city} />
                        </div>
                        <div>
                          <label className={labelCls}>ZIP Code *</label>
                          <input type="text" value={form.zip} autoComplete="postal-code"
                            className={`${inputCls} ${errors.zip ? "border-red-400" : ""}`}
                            onChange={(e) => setField("zip", e.target.value)} />
                          <FieldError msg={errors.zip} />
                        </div>
                        <div>
                          <label className={labelCls}>State</label>
                          <select value={form.state} className={inputCls}
                            onChange={(e) => setField("state", e.target.value)}>
                            <option value="AL">Alabama</option>
                            <option value="GA">Georgia</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>Delivery Zone *</label>
                          <select value={form.deliveryZone}
                            className={`${inputCls} ${errors.deliveryZone ? "border-red-400" : ""}`}
                            onChange={(e) => setField("deliveryZone", e.target.value)}>
                            <option value="">Select zone…</option>
                            {DELIVERY_ZONES.map((z) => (
                              <option key={z.value} value={z.value}>
                                {z.label} (+${z.fee})
                              </option>
                            ))}
                          </select>
                          <FieldError msg={errors.deliveryZone} />
                        </div>
                      </div>
                    </section>

                    <section>
                      <SectionHeading>Delivery Schedule</SectionHeading>
                      <p className="font-sans text-[12px] text-brand-smoke mb-4 leading-relaxed -mt-2">
                        Pick a date and a preferred 2-hour arrival window.
                        Our driver route is planned around your request.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>Delivery Date *</label>
                          <input type="date" value={form.deliveryDate} min={getTomorrowDate()}
                            className={`${inputCls} ${errors.deliveryDate ? "border-red-400" : ""}`}
                            onChange={(e) => setField("deliveryDate", e.target.value)} />
                          <FieldError msg={errors.deliveryDate} />
                          <p className="font-sans text-[10px] text-brand-smoke/50 mt-1">No Sunday deliveries.</p>
                        </div>
                        <div>
                          <label className={labelCls}>Preferred Window *</label>
                          <select value={form.deliveryWindow} className={inputCls}
                            onChange={(e) => setField("deliveryWindow", e.target.value)}>
                            {TIME_WINDOWS.map((w) => (
                              <option key={w.value} value={w.value}>{w.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </section>
                  </>
                )}

                {/* ── PICKUP fields ────────────────────────────────── */}
                {fulfillment === "pickup" && (
                  <section>
                    {/* Store info card */}
                    <div
                      className="flex gap-4 p-5 mb-6 border-[3px] border-brand-black"
                      style={{ background: B.bark }}
                    >
                      <div className="text-[32px] flex-shrink-0">📍</div>
                      <div>
                        <div className="font-serif font-black text-brand-cream text-[16px] mb-1">
                          {STORE.name}
                        </div>
                        <div className="font-sans text-brand-cream/80 text-[13px]">
                          {STORE.address}<br />{STORE.city}
                        </div>
                        <div className="font-sans text-brand-orange text-[12px] font-extrabold mt-1">
                          {STORE.phone}
                        </div>
                        <div className="font-sans text-brand-cream/50 text-[11px] mt-1">
                          {STORE.hours}
                        </div>
                      </div>
                    </div>

                    <SectionHeading>Pickup Schedule</SectionHeading>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Pickup Date *</label>
                        <input type="date" value={form.pickupDate} min={getTomorrowDate()}
                          className={`${inputCls} ${errors.pickupDate ? "border-red-400" : ""}`}
                          onChange={(e) => setField("pickupDate", e.target.value)} />
                        <FieldError msg={errors.pickupDate} />
                        <p className="font-sans text-[10px] text-brand-smoke/50 mt-1">Closed Sundays.</p>
                      </div>
                      <div>
                        <label className={labelCls}>Preferred Pickup Time *</label>
                        <select value={form.pickupTime} className={inputCls}
                          onChange={(e) => setField("pickupTime", e.target.value)}>
                          {PICKUP_TIMES.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </section>
                )}

                {/* Special instructions */}
                <section>
                  <SectionHeading>
                    Special Instructions
                    <span className="font-sans font-normal text-brand-smoke text-[12px] tracking-normal">
                      (optional)
                    </span>
                  </SectionHeading>
                  <textarea value={form.noteMessage} rows={3}
                    placeholder={
                      fulfillment === "delivery"
                        ? "Card message, gate code, leave at door…"
                        : "Card message, anything we should know…"
                    }
                    className={`${inputCls} resize-none`}
                    onChange={(e) => setField("noteMessage", e.target.value)} />
                </section>

                {intentError && (
                  <div className="bg-red-50 border-2 border-red-300 px-4 py-3 font-sans text-[12px] text-red-600">
                    {intentError}
                  </div>
                )}

                {/* Continue button */}
                <button
                  onClick={handleContinueToPayment}
                  disabled={creatingIntent || items.length === 0}
                  className={`w-full py-4 font-sans font-black text-[13px] tracking-[2px] uppercase border-[3px] flex items-center justify-center gap-3 transition-all ${
                    creatingIntent || items.length === 0
                      ? "bg-brand-smoke/20 text-brand-smoke/50 border-brand-smoke/20 cursor-not-allowed"
                      : "bg-brand-black text-brand-cream border-brand-black cursor-pointer shadow-retro-md hover:bg-brand-orange hover:border-brand-orange hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-retro-sm"
                  }`}
                >
                  {creatingIntent ? (
                    <>
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                        <path d="M12 2a10 10 0 0 1 10 10" />
                      </svg>
                      Preparing…
                    </>
                  ) : (
                    `Continue to Payment — $${orderTotal.toFixed(2)}`
                  )}
                </button>
              </>
            )}

            {/* ── STEP 2: Payment ──────────────────────────────────── */}
            {step === "payment" && clientSecret && (
              <section>
                <SectionHeading>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke={B.orange} strokeWidth="2.5" strokeLinecap="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                  Secure Payment
                </SectionHeading>

                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "stripe",
                      variables: {
                        colorPrimary      : B.orange,
                        colorText         : "#111111",
                        colorDanger       : "#EF4444",
                        fontFamily        : "'Inter', 'Helvetica Neue', sans-serif",
                        borderRadius      : "0px",
                        fontSizeBase      : "14px",
                      },
                      rules: {
                        ".Input": {
                          border         : "2px solid #e5e5e5",
                          boxShadow      : "none",
                          padding        : "12px 16px",
                        },
                        ".Input:focus": {
                          border         : `2px solid ${B.orange}`,
                          boxShadow      : "none",
                          outline        : "none",
                        },
                        ".Label": {
                          fontWeight     : "700",
                          fontSize       : "10px",
                          letterSpacing  : "2px",
                          textTransform  : "uppercase",
                          color          : "#7A6A58",
                        },
                      },
                    },
                  }}
                >
                  <StripePaymentForm
                    orderTotal={orderTotal}
                    onSuccess={handlePaymentSuccess}
                    onBack={() => { setStep("details"); setClientSecret(null); }}
                    orderData={orderData}
                    disabled={items.length === 0}
                  />
                </Elements>
              </section>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════
              RIGHT COLUMN — sticky order summary
          ═══════════════════════════════════════════════════════════ */}
          <div className="sticky top-6">
            <div className="bg-white border-[3px] border-brand-black shadow-retro-md overflow-hidden">

              {/* Summary header stripe */}
              <div
                className="h-[5px]"
                style={{
                  background: `repeating-linear-gradient(90deg,
                    ${B.orange} 0, ${B.orange} 36px,
                    ${B.gold}   36px, ${B.gold}   44px,
                    ${B.orange} 44px, ${B.orange} 80px,
                    ${B.black}  80px, ${B.black}  84px)`,
                }}
              />

              <div className="p-6">
                <h2 className="font-serif font-black text-brand-black text-[18px] tracking-[-0.5px] mb-5 flex items-center justify-between">
                  Order Summary
                  <span className="font-sans text-[11px] text-brand-smoke font-normal tracking-[1px] uppercase">
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </span>
                </h2>

                {/* Items */}
                <div className="flex flex-col gap-3 mb-5">
                  {items.map((item) => (
                    <div key={`${item.id}__${item.size}`} className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-sans font-extrabold text-[12px] text-brand-black leading-tight truncate">
                          {item.name}
                        </div>
                        {item.size && (
                          <div className="font-sans text-[10px] text-brand-smoke uppercase tracking-[1px] mt-0.5">
                            {item.size} · qty {item.qty}
                          </div>
                        )}
                      </div>
                      <span className="font-sans font-black text-[13px] text-brand-black flex-shrink-0">
                        ${(item.price * item.qty).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Fulfillment detail */}
                <div
                  className="flex items-start gap-3 p-3 mb-4 text-[12px]"
                  style={{ background: fulfillment === "pickup" ? `${B.bark}12` : `${B.orange}0D` }}
                >
                  <span className="text-[18px]">{fulfillment === "pickup" ? "🌸" : "🚐"}</span>
                  <div className="font-sans text-brand-smoke">
                    {fulfillment === "pickup" ? (
                      <>
                        <span className="font-extrabold text-brand-black">In-Store Pickup</span>
                        <br />
                        {form.pickupDate && (
                          <span>
                            {new Date(form.pickupDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                            {" · "}{PICKUP_TIMES.find((t) => t.value === form.pickupTime)?.label ?? form.pickupTime}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="font-extrabold text-brand-black">Delivery</span>
                        {form.deliveryZone && (
                          <><br />{DELIVERY_ZONES.find((z) => z.value === form.deliveryZone)?.label ?? form.deliveryZone}</>
                        )}
                        {form.deliveryDate && (
                          <><br />{new Date(form.deliveryDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t border-brand-black/10 pt-4 flex flex-col gap-2">
                  <div className="flex justify-between font-sans text-[13px] text-brand-smoke">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-sans text-[13px] text-brand-smoke">
                    <span>{fulfillment === "pickup" ? "Delivery" : "Delivery"}</span>
                    <span>
                      {fulfillment === "pickup" ? (
                        <span className="text-brand-orange font-extrabold">Free</span>
                      ) : form.deliveryZone ? (
                        `$${deliveryFee.toFixed(2)}`
                      ) : (
                        <span className="text-brand-smoke/40">Select zone</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between font-sans font-black text-[20px] text-brand-black border-t border-brand-black/10 pt-3 mt-1">
                    <span>Total</span>
                    <span style={{ color: B.orange }}>${orderTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="mt-4 flex flex-col gap-2">
              {[
                { icon: "🔒", text: "Payments secured by Stripe" },
                { icon: "🌸", text: "Cut fresh daily in Piedmont, AL" },
                { icon: "📞", text: "Questions? Call (256) 447-4800" },
              ].map((b) => (
                <div key={b.text} className="flex items-center gap-2 font-sans text-[11px] text-brand-smoke">
                  <span>{b.icon}</span>
                  <span>{b.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}