"use client";

import { useState, useEffect, useMemo, useRef }  from "react";
import Link                              from "next/link";
import { useRouter }                     from "next/navigation";
import { loadStripe }                    from "@stripe/stripe-js";
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
import { B }            from "@/lib/brand";

import { calcProcessingFee, DELIVERY_FEE } from "@/lib/fees";

// Stripe singleton — outside component so it's never re-created on render
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

// ── Constants ─────────────────────────────────────────────────────────────────
const DELIVERY_WINDOWS = [
  { value: "morning",   label: "Morning",   sub: "9 am – 12 pm" },
  { value: "afternoon", label: "Afternoon", sub: "12 pm – 5 pm" },
];

const PICKUP_TIMES = [
  { value: "09:00-10:00", label: "9:00 am – 10:00 am" },
  { value: "10:00-11:00", label: "10:00 am – 11:00 am" },
  { value: "11:00-12:00", label: "11:00 am – 12:00 pm" },
  { value: "12:00-13:00", label: "12:00 pm – 1:00 pm"  },
  { value: "13:00-14:00", label: "1:00 pm – 2:00 pm"   },
  { value: "14:00-15:00", label: "2:00 pm – 3:00 pm"   },
  { value: "15:00-16:00", label: "3:00 pm – 4:00 pm"   },
  { value: "16:00-17:00", label: "4:00 pm – 5:00 pm"   },
];

function getTomorrowDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

// ── Shared UI pieces (unchanged from original) ────────────────────────────────
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
  return <p className="font-sans text-[11px] text-red-500 mt-1">{msg}</p>;
}

function SectionHeader({ number, title }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="w-8 h-8 bg-brand-orange border-[2px] border-brand-black flex items-center justify-center flex-shrink-0">
        <span className="font-sans font-black text-brand-cream text-[13px]">{number}</span>
      </div>
      <h2 className="font-serif font-black text-brand-black text-[22px] tracking-[-0.5px]">
        {title}
      </h2>
    </div>
  );
}

// ── Stripe card form — lives inside <Elements> ────────────────────────────────
function StripePaymentForm({ total, orderData, onSuccess, onBack }) {
  const stripe   = useStripe();
  const elements = useElements();
  const [ready,  setReady ] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error,  setError ] = useState(null);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setError(null);
    setPaying(true);

    try {
      const { error: stripeErr, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
        confirmParams: {
          payment_method_data: {
            billing_details: {
              email: orderData.customerEmail,
            },
          },
        },
      });

      if (stripeErr) {
        // Stripe returned a known error (card declined, insufficient funds, etc.)
        setError(stripeErr.message ?? "Payment failed. Please try again.");
        setPaying(false);
        return;
      }

      if (
        paymentIntent?.status === "succeeded" ||
        paymentIntent?.status === "processing"
      ) {
        const res  = await fetch("/api/orders", {
          method : "POST",
          headers: { "Content-Type": "application/json" },
          body   : JSON.stringify({ ...orderData, stripePaymentId: paymentIntent.id }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(
            data.error ??
            "Payment went through but we couldn't save your order. Please call (256) 447-4800."
          );
          setPaying(false);
          return;
        }

        onSuccess(data.data);
      } else {
        setError(
          paymentIntent
            ? `Payment status: ${paymentIntent.status}. Please try again.`
            : "Payment was not completed. Please try again."
        );
        setPaying(false);
      }
    } catch (err) {
      // Catches: network failures, unexpected Stripe SDK throws,
      // Connect account mismatches, and anything else unforeseen.
      console.error("[StripePaymentForm] confirmPayment threw:", err);
      setError(
        err?.message
          ? `Payment error: ${err.message}`
          : "An unexpected error occurred. Please try again or call (256) 447-4800."
      );
      setPaying(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">

      {/* Stripe PaymentElement */}
      <div className="border-[2px] border-brand-black/20 bg-white p-5">
        <PaymentElement
          onReady={() => setReady(true)}
          options={{
            layout : "tabs",
            wallets: { applePay: "auto", googlePay: "auto" },
            fields : { billingDetails: { name: "auto", email: "never" } },
          }}
        />
        {!ready && (
          <div className="h-[120px] flex items-center justify-center">
            <p className="font-sans text-[12px] text-brand-smoke tracking-[1px] uppercase animate-pulse">
              Loading secure payment form…
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-[2px] border-red-300 px-5 py-4 flex items-start gap-3">
          <svg className="flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span className="font-sans text-[13px] text-red-600">{error}</span>
        </div>
      )}

      {/* Pay button */}
      <button
        onClick={handlePay}
        disabled={!stripe || !ready || paying}
        className={`w-full py-4 font-sans font-black text-[13px] tracking-[2px] uppercase border-[3px] flex items-center justify-center gap-3 transition-all ${
          !stripe || !ready || paying
            ? "bg-brand-smoke/20 text-brand-smoke/40 border-brand-smoke/20 cursor-not-allowed"
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
            Processing payment…
          </>
        ) : (
          <>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <rect x="1" y="4" width="22" height="16" rx="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            Pay ${total.toFixed(2)}
          </>
        )}
      </button>

      <button
        onClick={onBack}
        disabled={paying}
        className="font-sans font-extrabold text-[11px] tracking-[1.5px] uppercase text-brand-smoke/60 hover:text-brand-orange transition-colors disabled:opacity-40"
      >
        ← Edit details
      </button>

      <p className="font-sans text-[10px] text-brand-smoke/50 text-center leading-relaxed">
        🔒 Secured by Stripe. Your card details never touch our servers.
      </p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  // ── Step ──────────────────────────────────────────────────────────────────
  const [step,          setStep         ] = useState("details"); // "details" | "payment"
  const [clientSecret,  setClientSecret ] = useState(null);
  const [stripeAccount, setStripeAccount] = useState(null); // acct_... in Connect mode, null in direct
  const checkedOut = useRef(false); 
  
  // ── Fulfillment ───────────────────────────────────────────────────────────
  const [fulfillment, setFulfillment] = useState("delivery"); // "delivery" | "pickup"

  // ── Session prefill ───────────────────────────────────────────────────────
  const [customerId, setCustomerId] = useState(null);

  // ── Form ──────────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    // contact
    customerName   : "",
    customerEmail  : "",
    customerPhone  : "",
    // delivery
    addressLine    : "",
    city           : "",
    state          : "AL",
    zip            : "",
    deliveryDate   : getTomorrowDate(),
    deliveryWindow : "morning",
    // pickup
    pickupDate     : getTomorrowDate(),
    pickupTime     : "10:00-11:00",
    pickupLocation : "piedmont",
    // shared
    noteMessage    : "",
  });

  const [errors,        setErrors       ] = useState({});
  const [intentLoading, setIntentLoading] = useState(false);
  const [intentError,   setIntentError  ] = useState(null);

  // Redirect if cart empty
  useEffect(() => {
    if (items.length === 0 && !checkedOut.current) router.replace("/bag");
  }, [items, router]);

  // Session prefill
  useEffect(() => {
    fetch("/api/customers/session")
      .then((r) => r.json())
      .then((data) => {
        if (!data.customer) return;
        setCustomerId(data.customer.id);
        return fetch("/api/customers/me")
          .then((r) => r.json())
          .then((p) => {
            if (!p.data) return;
            const d = p.data;
            setForm((f) => ({
              ...f,
              customerName : d.name  || f.customerName,
              customerEmail: d.email || f.customerEmail,
              customerPhone: d.phone || f.customerPhone,
            }));
            const addr = (d.addresses ?? []).find((a) => a.is_default) ?? d.addresses?.[0];
            if (addr) {
              setForm((f) => ({
                ...f,
                addressLine : addr.address_line || f.addressLine,
                city        : addr.city          || f.city,
                state       : addr.state         || f.state,
                zip         : addr.zip           || f.zip,
              }));
            }
          });
      })
      .catch(() => {});
  }, []);

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  };

  // Derived totals
  const deliveryFee = fulfillment === "delivery" ? DELIVERY_FEE : 0;
  const orderTotal = useMemo(() => subtotal + deliveryFee, [subtotal, deliveryFee]);

  // Gross-up: customer pays enough so merchant nets orderTotal exactly
  const { processingFee, chargeTotal } = useMemo(
    () => calcProcessingFee(orderTotal),
    [orderTotal]
  );

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.customerName.trim())  e.customerName  = "Name is required.";
    if (!form.customerEmail.trim()) e.customerEmail = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail))
      e.customerEmail = "Enter a valid email address.";

    if (form.customerPhone.trim() && !/^\+?[\d\s\-().]{7,15}$/.test(form.customerPhone.trim()))
      e.customerPhone = "Enter a valid phone number.";

    if (fulfillment === "delivery") {
      if (!form.addressLine.trim()) e.addressLine  = "Street address is required.";
      if (!form.city.trim())        e.city         = "City is required.";
      if (!form.zip.trim())         e.zip          = "ZIP code is required.";
      if (!form.deliveryDate)       e.deliveryDate = "Please select a delivery date.";
      else {
        const day = new Date(form.deliveryDate + "T12:00:00").getDay();
        if (day === 0) e.deliveryDate = "We don't deliver on Sundays. Please choose another day.";
      }
    }

    if (fulfillment === "pickup") {
      if (!form.pickupDate) e.pickupDate = "Please select a pickup date.";
      else {
        const day = new Date(form.pickupDate + "T12:00:00").getDay();
        if (day === 0) e.pickupDate = "We're closed on Sundays. Please choose another day.";
      }
    }

    return e;
  };

  // ── Step 1 → create PaymentIntent → Step 2 ───────────────────────────────
  const handleContinue = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setIntentLoading(true);
    setIntentError(null);

    try {
      const res  = await fetch("/api/payments/intent", {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({
          amount         : chargeTotal,
          customerEmail  : form.customerEmail.trim().toLowerCase(),
          description    : `Lamb's Florist — ${fulfillment === "pickup" ? "Pickup" : "Delivery"} order`,
          fulfillmentType: fulfillment,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.clientSecret) {
        setIntentError(data.error || "Could not start payment. Please try again.");
        return;
      }

      setClientSecret(data.clientSecret);
      setStripeAccount(data.stripeAccount ?? null);
      setStep("payment");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setIntentError("Unable to reach the server. Check your connection and try again.");
    } finally {
      setIntentLoading(false);
    }
  };

  // ── Payment success ───────────────────────────────────────────────────────
  const handleSuccess = (order) => {
    checkedOut.current = true;
    clearCart();
    try { sessionStorage.setItem("lambs_pending_order", JSON.stringify(order)); } catch {}
    router.push(`/order/${order.order_number}`);
  };

  // ── Order data passed to POST /api/orders after Stripe confirms ───────────
  const STORE_INFO = {
    piedmont: { address: "211 Memorial Dr, Piedmont, AL 36272",         phone: "(256) 447-4800" },
    centre  : { address: "1470 W Main St, Ste H, Centre, AL 35960",     phone: "(256) 484-0819" },
  };

  const orderData = useMemo(() => {
    const loc = form.pickupLocation === "centre" ? "centre" : "piedmont";
    const deliveryAddress =
      fulfillment === "delivery"
        ? [form.addressLine, form.city, form.state, form.zip].filter(Boolean).join(", ")
        : `In-Store Pickup — ${STORE_INFO[loc].address}`;
    return {
      customerName   : form.customerName.trim(),
      customerEmail  : form.customerEmail.trim().toLowerCase(),
      customerPhone  : form.customerPhone.trim() || null,
      items          : items.map((i) => ({ id: i.id, name: i.name, size: i.size, qty: i.qty, price: i.price })),
      subtotal,
      deliveryFee,
      total          : chargeTotal,
      processingFee  : processingFee,
      fulfillmentType: fulfillment,
      deliveryAddress,
      deliveryDate   : fulfillment === "delivery" ? form.deliveryDate   : null,
      deliveryWindow : fulfillment === "delivery" ? form.deliveryWindow : null,
      pickupDate     : fulfillment === "pickup"   ? form.pickupDate     : null,
      pickupTime     : fulfillment === "pickup"   ? form.pickupTime     : null,
      pickupLocation : fulfillment === "pickup"   ? loc                 : null,
      noteMessage    : form.noteMessage.trim() || null,
      customerId     : customerId || null,
    };
  }, [form, fulfillment, items, subtotal, deliveryFee, orderTotal, customerId]);

  // ── Render ────────────────────────────────────────────────────────────────
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
            <span className="text-brand-orange">
              {step === "details" ? "Checkout" : "Payment"}
            </span>
          </div>

          <h1 className="font-serif font-black text-brand-black text-[32px] sm:text-[42px] tracking-[-2px]">
            {step === "details" ? "Checkout" : "Secure Payment"}
          </h1>

          {/* Step indicator */}
          <div className="flex items-center gap-4 mt-4">
            {[
              { key: "details", label: "Your Details" },
              { key: "payment", label: "Payment"      },
            ].map((s, i) => (
              <div key={s.key} className="flex items-center gap-3">
                {i > 0 && <div className="w-8 h-[2px] bg-brand-black/20" />}
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 flex items-center justify-center font-sans font-black text-[11px] border-2 transition-colors"
                    style={{
                      background  : step === s.key || (s.key === "details" && step === "payment") ? B.orange : "transparent",
                      borderColor : step === s.key || (s.key === "details" && step === "payment") ? B.orange : "#ccc",
                      color       : step === s.key || (s.key === "details" && step === "payment") ? B.cream  : "#999",
                    }}
                  >
                    {s.key === "details" && step === "payment" ? "✓" : i + 1}
                  </div>
                  <span className={`font-sans font-extrabold text-[11px] tracking-[1px] uppercase ${
                    step === s.key ? "text-brand-black" : "text-brand-smoke/50"
                  }`}>
                    {s.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

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
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-start">

          {/* ══════════════════════════════════════════════════════════════
              LEFT — form content switches on step
          ══════════════════════════════════════════════════════════════ */}
          <div className="flex-1 w-full flex flex-col gap-10">

            {/* ─────────────────────── STEP 1: DETAILS ─────────────────── */}
            {step === "details" && (
              <>

                {/* ── Fulfillment toggle ─────────────────────────────────── */}
                <section>
                  <SectionHeader number="1" title="How would you like your order?" />
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {
                        value   : "delivery",
                        emoji   : "🚐",
                        label   : "Delivery",
                        sub     : "We bring it to your door",
                        feeNote : `+$${DELIVERY_FEE} flat delivery fee`,
                      },
                      {
                        value   : "pickup",
                        emoji   : "🌸",
                        label   : "In-Store Pickup",
                        sub     : "Piedmont or Centre",
                        feeNote : "No delivery charge",
                      },
                    ].map((opt) => {
                      const active = fulfillment === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setFulfillment(opt.value)}
                          className={`text-left p-4 border-[3px] transition-all cursor-pointer ${
                            active
                              ? "border-brand-orange bg-brand-orange/5 shadow-retro-sm"
                              : "border-brand-black/20 bg-white hover:border-brand-orange/40"
                          }`}
                        >
                          <div className="text-[28px] mb-2">{opt.emoji}</div>
                          <div className={`font-sans font-extrabold text-[13px] tracking-[0.5px] ${
                            active ? "text-brand-orange" : "text-brand-black"
                          }`}>
                            {opt.label}
                          </div>
                          <div className="font-sans text-[11px] text-brand-smoke mt-0.5">
                            {opt.sub}
                          </div>
                          <div className={`font-sans font-extrabold text-[10px] tracking-[1px] uppercase mt-2 ${
                            active ? "text-brand-orange" : "text-brand-smoke/50"
                          }`}>
                            {opt.feeNote}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* ── Contact ────────────────────────────────────────────── */}
                <section>
                  <SectionHeader number="2" title="Contact Information" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                      <Label required>Full Name</Label>
                      <input type="text" value={form.customerName}
                        placeholder="Recipient or your name"
                        autoComplete="name"
                        className={`${inputCls} ${errors.customerName ? "border-red-400" : ""}`}
                        onChange={(e) => setField("customerName", e.target.value)} />
                      <FieldError msg={errors.customerName} />
                    </div>
                    <div>
                      <Label required>Email Address</Label>
                      <input type="email" value={form.customerEmail}
                        placeholder="you@example.com"
                        autoComplete="email"
                        className={`${inputCls} ${errors.customerEmail ? "border-red-400" : ""}`}
                        onChange={(e) => setField("customerEmail", e.target.value)} />
                      <FieldError msg={errors.customerEmail} />
                    </div>
                    <div>
                      <Label>Phone <span className="font-normal normal-case tracking-normal">(optional)</span></Label>
                      <input type="tel" value={form.customerPhone}
                        placeholder="(256) 555-0100"
                        autoComplete="tel"
                        className={`${inputCls} ${errors.customerPhone ? "border-red-400" : ""}`}
                        onChange={(e) => setField("customerPhone", e.target.value)} />
                      <FieldError msg={errors.customerPhone} />
                    </div>
                  </div>
                </section>

                {/* ── DELIVERY fields ────────────────────────────────────── */}
                {fulfillment === "delivery" && (
                  <section>
                    <SectionHeader number="3" title="Delivery Details" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                      <div className="sm:col-span-2">
                        <Label required>Street Address</Label>
                        <input type="text" value={form.addressLine}
                          placeholder="123 Oak Street"
                          autoComplete="address-line1"
                          className={`${inputCls} ${errors.addressLine ? "border-red-400" : ""}`}
                          onChange={(e) => setField("addressLine", e.target.value)} />
                        <FieldError msg={errors.addressLine} />
                      </div>

                      <div>
                        <Label required>City</Label>
                        <input type="text" value={form.city}
                          placeholder="Piedmont"
                          autoComplete="address-level2"
                          className={`${inputCls} ${errors.city ? "border-red-400" : ""}`}
                          onChange={(e) => setField("city", e.target.value)} />
                        <FieldError msg={errors.city} />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>State</Label>
                          <select value={form.state} className={`${inputCls} cursor-pointer`}
                            onChange={(e) => setField("state", e.target.value)}>
                            <option value="AL">AL</option>
                            <option value="GA">GA</option>
                          </select>
                        </div>
                        <div>
                          <Label required>ZIP Code</Label>
                          <input type="text" value={form.zip}
                            placeholder="36272"
                            autoComplete="postal-code"
                            maxLength={5}
                            className={`${inputCls} ${errors.zip ? "border-red-400" : ""}`}
                            onChange={(e) => setField("zip", e.target.value.replace(/\D/g, ""))} />
                          <FieldError msg={errors.zip} />
                        </div>
                      </div>

                      <div>
                        <Label required>Delivery Date</Label>
                        <input type="date" value={form.deliveryDate}
                          min={getTomorrowDate()}
                          className={`${inputCls} cursor-pointer ${errors.deliveryDate ? "border-red-400" : ""}`}
                          onChange={(e) => setField("deliveryDate", e.target.value)} />
                        <FieldError msg={errors.deliveryDate} />
                        <p className="font-sans text-[10px] text-brand-smoke/60 mt-1">
                          Mon–Sat only. We don&apos;t deliver on Sundays.
                        </p>
                      </div>

                      <div>
                        <Label required>Delivery Window</Label>
                        <div className="flex gap-3">
                          {DELIVERY_WINDOWS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
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
                    </div>
                  </section>
                )}

                {/* ── PICKUP fields ───────────────────────────────────────── */}
                {fulfillment === "pickup" && (
                  <section>
                    <SectionHeader number="3" title="Pickup Details" />

                    {/* Location selector */}
                    <div className="mb-5">
                      <Label required>Pickup Location</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                        {[
                          { value: "piedmont", name: "Piedmont",  addr: "211 Memorial Dr, Piedmont AL 36272" },
                          { value: "centre",   name: "Centre",    addr: "1470 W Main St, Ste H, Centre AL 35960" },
                        ].map((loc) => {
                          const active = form.pickupLocation === loc.value;
                          return (
                            <button key={loc.value} type="button"
                              onClick={() => setField("pickupLocation", loc.value)}
                              className={`text-left p-4 border-[2px] transition-all cursor-pointer ${
                                active
                                  ? "border-brand-orange bg-brand-orange/5"
                                  : "border-brand-black/20 bg-white hover:border-brand-orange/40"
                              }`}>
                              <div className="flex items-center gap-2 mb-1">
                                <div className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${
                                  active ? "border-brand-orange bg-brand-orange" : "border-brand-black/30"
                                }`} />
                                <span className={`font-sans font-extrabold text-[12px] tracking-[0.5px] ${
                                  active ? "text-brand-orange" : "text-brand-black"
                                }`}>{loc.name}</span>
                              </div>
                              <div className="font-sans text-[11px] text-brand-smoke pl-5">{loc.addr}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Store info card — updates based on selected location */}
                    <div
                      className="flex gap-4 p-5 mb-6 border-[3px] border-brand-black"
                      style={{ background: B.bark }}
                    >
                      <div className="text-[36px] leading-none flex-shrink-0">📍</div>
                      <div>
                        <div className="font-serif font-black text-brand-cream text-[17px] mb-1">
                          Lamb&apos;s Florist — {form.pickupLocation === "centre" ? "Centre" : "Piedmont"}
                        </div>
                        <div className="font-sans text-brand-cream/80 text-[13px] leading-relaxed">
                          {STORE_INFO[form.pickupLocation === "centre" ? "centre" : "piedmont"].address}
                        </div>
                        <a
                          href="tel:+12564476331"
                          className="font-sans font-extrabold text-brand-orange text-[13px] no-underline hover:underline block mt-1"
                        >
                          (256) 447-6331
                        </a>
                        <div className="font-sans text-brand-cream/50 text-[11px] mt-1.5">
                          Mon–Fri 8 am–6 pm · Sat 8 am–5 pm · Closed Sunday
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <Label required>Pickup Date</Label>
                        <input type="date" value={form.pickupDate}
                          min={getTomorrowDate()}
                          className={`${inputCls} cursor-pointer ${errors.pickupDate ? "border-red-400" : ""}`}
                          onChange={(e) => setField("pickupDate", e.target.value)} />
                        <FieldError msg={errors.pickupDate} />
                        <p className="font-sans text-[10px] text-brand-smoke/60 mt-1">
                          Closed Sundays.
                        </p>
                      </div>

                      <div>
                        <Label required>Preferred Pickup Time</Label>
                        <select value={form.pickupTime}
                          className={`${inputCls} cursor-pointer`}
                          onChange={(e) => setField("pickupTime", e.target.value)}>
                          {PICKUP_TIMES.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </section>
                )}

                {/* ── Card / gift message ─────────────────────────────────── */}
                <section>
                  <SectionHeader
                    number={fulfillment === "delivery" ? "4" : "4"}
                    title="Card / Gift Message"
                  />
                  <Label>Message <span className="font-normal normal-case tracking-normal">(optional)</span></Label>
                  <textarea
                    value={form.noteMessage}
                    placeholder="e.g. Happy Birthday! With love from the family…"
                    rows={3}
                    className={`${inputCls} resize-none`}
                    onChange={(e) => setField("noteMessage", e.target.value)}
                  />
                  <p className="font-sans text-[10px] text-brand-smoke/60 mt-1">
                    We&apos;ll handwrite this on a card included with your arrangement.
                  </p>
                </section>

                {/* Intent error */}
                {intentError && (
                  <div className="bg-red-50 border-[2px] border-red-300 px-5 py-4 flex items-start gap-3">
                    <svg className="flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24"
                      fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span className="font-sans text-[13px] text-red-600">{intentError}</span>
                  </div>
                )}
              </>
            )}

            {/* ─────────────────────── STEP 2: PAYMENT ─────────────────── */}
            {step === "payment" && clientSecret && stripePromise && (
              <section>
                <SectionHeader number="3" title="Secure Payment" />
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    // stripeAccount tells Elements which connected account
                    // the PaymentIntent belongs to. null = direct mode (ignored).
                    ...(stripeAccount ? { stripeAccount } : {}),
                    appearance: {
                      theme    : "stripe",
                      variables: {
                        colorPrimary  : B.orange,
                        colorText     : "#111111",
                        colorDanger   : "#EF4444",
                        fontFamily    : "'Inter', 'Helvetica Neue', sans-serif",
                        borderRadius  : "0px",
                        fontSizeBase  : "14px",
                      },
                      rules: {
                        ".Input": {
                          border   : "2px solid rgba(17,17,17,0.2)",
                          boxShadow: "none",
                          padding  : "12px 16px",
                        },
                        ".Input:focus": {
                          border   : `2px solid ${B.orange}`,
                          boxShadow: "none",
                        },
                        ".Label": {
                          fontWeight   : "700",
                          fontSize     : "10px",
                          letterSpacing: "2px",
                          textTransform: "uppercase",
                          color        : "#7A6A58",
                        },
                      },
                    },
                  }}
                >
                  <StripePaymentForm
                    total={chargeTotal}
                    orderData={orderData}
                    onSuccess={handleSuccess}
                    onBack={() => { setStep("details"); setClientSecret(null); }}
                  />
                </Elements>
              </section>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════════
              RIGHT — sticky order summary (unchanged from original)
          ══════════════════════════════════════════════════════════════ */}
          <div className="w-full lg:w-[360px] flex-shrink-0">
            <div className="bg-white border-[3px] border-brand-black shadow-retro-lg overflow-hidden sticky top-24">

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
                  {step === "details" && (
                    <Link href="/bag"
                      className="font-sans text-[10px] font-extrabold tracking-[1.5px] uppercase text-brand-smoke hover:text-brand-orange transition-colors no-underline">
                      Edit Bag
                    </Link>
                  )}
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
                        <div className="font-sans text-[10px] text-brand-smoke">× {item.qty}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Fulfillment summary line */}
                <div className="flex items-center gap-2 pb-4 mb-4 border-b border-brand-black/10">
                  <span className="text-[16px]">{fulfillment === "pickup" ? "🌸" : "🚐"}</span>
                  <div className="font-sans text-[11px] text-brand-smoke">
                    <span className="font-extrabold text-brand-black">
                      {fulfillment === "pickup" ? "In-Store Pickup" : "Delivery"}
                    </span>
                    {fulfillment === "pickup" && form.pickupDate && (
                      <> · {new Date(form.pickupDate + "T12:00:00").toLocaleDateString("en-US", {
                        weekday: "short", month: "short", day: "numeric",
                      })}</>
                    )}
                  </div>
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
                    <span className="font-sans text-[12px] text-brand-smoke">
                      {fulfillment === "pickup" ? "Delivery" : "Delivery fee"}
                    </span>
                    <span className={`font-sans font-extrabold text-[13px] ${
                      fulfillment === "pickup" ? "text-brand-orange" : "text-brand-black"
                    }`}>
                      {fulfillment === "pickup" ? "Free" : `$${DELIVERY_FEE}.00`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-sans text-[12px] text-brand-smoke flex items-center gap-1">
                      Processing fee
                      <span
                        title="Card processing and Web Platform fee"
                        className="w-3.5 h-3.5 rounded-full border border-brand-smoke/40 flex items-center justify-center font-sans font-black text-[8px] text-brand-smoke/60 cursor-default flex-shrink-0"
                      >?</span>
                    </span>
                    <span className="font-sans font-extrabold text-[13px] text-brand-black">
                      ${processingFee.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="font-sans font-extrabold text-[13px] tracking-[1px] uppercase text-brand-black">
                    Total
                  </span>
                  <span className="font-sans font-black text-[22px] text-brand-orange">
                    ${chargeTotal.toFixed(2)}
                  </span>
                </div>

                {/* CTA — only shown in step 1 */}
                {step === "details" && (
                  <>
                    <button
                      onClick={handleContinue}
                      disabled={intentLoading || items.length === 0}
                      className="w-full bg-brand-orange text-brand-cream border-[3px] border-brand-black py-4 font-sans font-black text-[13px] tracking-[2px] uppercase cursor-pointer shadow-retro-md hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-retro-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none transition-all flex items-center justify-center gap-3"
                    >
                      {intentLoading ? (
                        <>
                          <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                            <path d="M12 2a10 10 0 0 1 10 10" />
                          </svg>
                          Preparing…
                        </>
                      ) : (
                        <>
                          Continue to Payment
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                          </svg>
                        </>
                      )}
                    </button>

                    <div className="mt-5 flex flex-col gap-2">
                      {[
                        fulfillment === "pickup"
                          ? "No delivery fee for pickup orders"
                          : "Mon–Sat delivery, Piedmont to Centre",
                        "🔒 Payments secured by Stripe",
                        "Handcrafted same or next day",
                      ].map((text) => (
                        <div key={text} className="flex items-start gap-2">
                          <svg className="flex-shrink-0 mt-0.5" width="12" height="12"
                            viewBox="0 0 24 24" fill="none" stroke={B.orange}
                            strokeWidth="3" strokeLinecap="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span className="font-sans text-[10px] text-brand-smoke leading-relaxed">
                            {text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}