"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
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
import { C }            from "@/lib/brand";

import { calcProcessingFee, DELIVERY_FEE } from "@/lib/fees";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

const US_STATES = [
  ["AL","Alabama"],["AK","Alaska"],["AZ","Arizona"],["AR","Arkansas"],["CA","California"],
  ["CO","Colorado"],["CT","Connecticut"],["DE","Delaware"],["FL","Florida"],["GA","Georgia"],
  ["HI","Hawaii"],["ID","Idaho"],["IL","Illinois"],["IN","Indiana"],["IA","Iowa"],
  ["KS","Kansas"],["KY","Kentucky"],["LA","Louisiana"],["ME","Maine"],["MD","Maryland"],
  ["MA","Massachusetts"],["MI","Michigan"],["MN","Minnesota"],["MS","Mississippi"],["MO","Missouri"],
  ["MT","Montana"],["NE","Nebraska"],["NV","Nevada"],["NH","New Hampshire"],["NJ","New Jersey"],
  ["NM","New Mexico"],["NY","New York"],["NC","North Carolina"],["ND","North Dakota"],["OH","Ohio"],
  ["OK","Oklahoma"],["OR","Oregon"],["PA","Pennsylvania"],["RI","Rhode Island"],["SC","South Carolina"],
  ["SD","South Dakota"],["TN","Tennessee"],["TX","Texas"],["UT","Utah"],["VT","Vermont"],
  ["VA","Virginia"],["WA","Washington"],["WV","West Virginia"],["WI","Wisconsin"],["WY","Wyoming"],
];


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

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const [step,          setStep         ] = useState("details");
  const [clientSecret,  setClientSecret ] = useState(null);
  const [stripeAccount, setStripeAccount] = useState(null);
  const checkedOut = useRef(false);

  const [customerId, setCustomerId] = useState(null);

  const [form, setForm] = useState({
    customerName   : "",
    customerEmail  : "",
    customerPhone  : "",
    addressLine    : "",
    addressLine2   : "",
    city           : "",
    state          : "AL",
    zip            : "",
  });

  const [customizations, setCustomizations] = useState({});
  const [errors,        setErrors       ] = useState({});
  const [intentLoading, setIntentLoading] = useState(false);
  const [intentError,   setIntentError  ] = useState(null);
  const [addrStatus,    setAddrStatus   ] = useState("idle"); // "idle"|"verifying"|"verified"|"failed"
  const [addrNote,      setAddrNote     ] = useState("");

  useEffect(() => {
    if (items.length === 0 && !checkedOut.current) router.replace("/bag");
  }, [items, router]);

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

  const ADDRESS_FIELDS = new Set(["addressLine", "addressLine2", "city", "state", "zip"]);

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
    if (ADDRESS_FIELDS.has(key)) { setAddrStatus("idle"); setAddrNote(""); }
  };

  const verifyAddress = useCallback(async (f = form) => {
    if (!f.addressLine.trim() || !f.city.trim() || !f.zip.trim()) return "incomplete";
    setAddrStatus("verifying");
    try {
      const res  = await fetch("/api/shipping/address", {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({
          streetAddress   : f.addressLine.trim(),
          secondaryAddress: f.addressLine2?.trim() || undefined,
          city            : f.city.trim(),
          state           : f.state,
          zip             : f.zip.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.standardized) {
        const s = data.standardized;
        setForm((prev) => ({
          ...prev,
          addressLine : s.streetAddress,
          addressLine2: s.secondaryAddress || prev.addressLine2,
          city        : s.city,
          state       : s.state,
          zip         : s.zipPlus4 ? `${s.zip}-${s.zipPlus4}` : s.zip,
        }));
        setAddrStatus("verified");
        setAddrNote("Address verified by USPS.");
        return "verified";
      } else {
        setAddrStatus("failed");
        setAddrNote(data.error ?? "Address could not be verified — double-check before continuing.");
        return "failed";
      }
    } catch {
      setAddrStatus("failed");
      setAddrNote("Could not reach address verification — you can still continue.");
      return "unavailable";
    }
  }, [form]);

  const orderTotal = useMemo(() => subtotal + DELIVERY_FEE, [subtotal]);

  const { processingFee, chargeTotal } = useMemo(
    () => calcProcessingFee(orderTotal),
    [orderTotal]
  );

  const validate = () => {
    const e = {};
    if (!form.customerName.trim())  e.customerName  = "Name is required.";
    if (!form.customerEmail.trim()) e.customerEmail = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail))
      e.customerEmail = "Enter a valid email address.";

    if (form.customerPhone.trim() && !/^\+?[\d\s\-().]{7,15}$/.test(form.customerPhone.trim()))
      e.customerPhone = "Enter a valid phone number.";

    if (!form.addressLine.trim()) e.addressLine  = "Street address is required.";
    if (!form.city.trim())        e.city         = "City is required.";
    if (!form.zip.trim())         e.zip          = "ZIP code is required.";

    const missingPersonalization = items.some(
      (i) => i.isCustomizable && !customizations[`${i.id}__${i.size}`]?.trim()
    );
    if (missingPersonalization)
      e.customizations = "Please enter personalization text for all custom items.";

    return e;
  };

  const handleContinue = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setIntentLoading(true);
    setIntentError(null);

    if (addrStatus !== "verified") {
      const result = await verifyAddress();
      if (result === "failed") { setIntentLoading(false); return; }
    }

    try {
      const res  = await fetch("/api/payments/intent", {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({
          amount         : chargeTotal,
          customerEmail  : form.customerEmail.trim().toLowerCase(),
          description    : "BityBird Co — Delivery order",
          fulfillmentType: "delivery",
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

  const handleSuccess = (order) => {
    checkedOut.current = true;
    clearCart();
    try { sessionStorage.setItem("bitybird_pending_order", JSON.stringify(order)); } catch {}
    router.push(`/order/${order.order_number}`);
  };

  const orderData = useMemo(() => {
    const parts = [form.addressLine.trim()];
    if (form.addressLine2.trim()) parts.push(form.addressLine2.trim());
    parts.push(`${form.city}, ${form.state} ${form.zip}`);
    return {
      customerName   : form.customerName.trim(),
      customerEmail  : form.customerEmail.trim().toLowerCase(),
      customerPhone  : form.customerPhone.trim() || null,
      items          : items.map((i) => {
        const base = { id: i.id, name: i.name, size: i.size, qty: i.qty, price: i.price };
        if (i.isCustomizable) {
          base.customizationType = i.customizationType;
          base.customizationText = customizations[`${i.id}__${i.size}`] ?? "";
        }
        return base;
      }),
      subtotal,
      deliveryFee    : DELIVERY_FEE,
      total          : chargeTotal,
      processingFee,
      fulfillmentType: "delivery",
      deliveryAddress: parts.join(", "),
      customerId     : customerId || null,
    };
  }, [form, items, subtotal, chargeTotal, processingFee, customerId, customizations]);

  return (
    <div className="font-serif bg-brand-cream min-h-screen overflow-x-hidden">
      <AnnouncementBar />
      <Navbar />

      <div
        className="border-b-[3px] border-brand-black px-5 sm:px-10 lg:px-16 py-8 sm:py-10"
        style={{
          background: `repeating-linear-gradient(-55deg,
            transparent 0px, transparent 60px,
            rgba(212,81,26,0.04) 60px, rgba(212,81,26,0.04) 66px)`,
        }}
      >
        <div className="max-w-[1200px] mx-auto">
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
                      background  : step === s.key || (s.key === "details" && step === "payment") ? C.blush : "transparent",
                      borderColor : step === s.key || (s.key === "details" && step === "payment") ? C.blush : "#ccc",
                      color       : step === s.key || (s.key === "details" && step === "payment") ? C.cream  : "#999",
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
                ${C.gold} 0, ${C.gold} 16px,
                ${C.black} 16px, ${C.black} 20px)`,
            }}
          />
        </div>
      </div>

      <main className="px-5 sm:px-10 lg:px-16 py-10 sm:py-14 max-w-[1200px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-start">

          <div className="flex-1 w-full flex flex-col gap-10">

            {step === "details" && (
              <>
                {/* ── Contact ─────────────────────────────────────────────── */}
                <section>
                  <SectionHeader number="1" title="Contact Information" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                      <Label required>Full Name</Label>
                      <input type="text" value={form.customerName}
                        placeholder="Your name"
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

                {/* ── Delivery Details ─────────────────────────────────────── */}
                <section>
                  <SectionHeader number="2" title="Delivery Details" />
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

                    <div className="sm:col-span-2">
                      <Label>Apt / Suite / Unit <span className="font-normal normal-case tracking-normal">(optional)</span></Label>
                      <input type="text" value={form.addressLine2}
                        placeholder="Apt 4B"
                        autoComplete="address-line2"
                        className={inputCls}
                        onChange={(e) => setField("addressLine2", e.target.value)} />
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
                          {US_STATES.map(([code, name]) => (
                            <option key={code} value={code}>{name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label required>ZIP Code</Label>
                        <input type="text" value={form.zip}
                          placeholder="36272"
                          autoComplete="postal-code"
                          maxLength={10}
                          className={`${inputCls} ${errors.zip ? "border-red-400" : ""}`}
                          onChange={(e) => setField("zip", e.target.value)}
                          onBlur={() => verifyAddress()} />
                        <FieldError msg={errors.zip} />
                      </div>
                    </div>

                    {addrStatus !== "idle" && (
                      <div className={`sm:col-span-2 flex items-center gap-2 px-3 py-2 text-[11px] font-sans font-extrabold tracking-[1px] uppercase border-2 ${
                        addrStatus === "verifying" ? "border-brand-smoke/30 text-brand-smoke bg-brand-smoke/5" :
                        addrStatus === "verified"  ? "border-green-500/40 text-green-700 bg-green-50" :
                        "border-amber-400/50 text-amber-700 bg-amber-50"
                      }`}>
                        {addrStatus === "verifying" && (
                          <svg className="animate-spin flex-shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" />
                          </svg>
                        )}
                        {addrStatus === "verified" && <span className="flex-shrink-0">✓</span>}
                        {addrStatus === "failed"   && <span className="flex-shrink-0">⚠</span>}
                        <span className="normal-case tracking-normal font-normal text-[12px]">{addrNote}</span>
                      </div>
                    )}

                  </div>
                </section>

                {/* ── Personalization ──────────────────────────────────── */}
                {items.some((i) => i.isCustomizable) && (
                  <section>
                    <SectionHeader number="3" title="Personalization" />
                    <div className="flex flex-col gap-5">
                      {items.filter((i) => i.isCustomizable).map((item) => {
                        const key   = `${item.id}__${item.size}`;
                        const label = item.customizationType === "other"
                          ? "Personalization text"
                          : `What would you like ${item.customizationType}?`;
                        return (
                          <div key={key}>
                            <Label required>
                              {item.name}{item.size ? ` — ${item.size}` : ""}: {label}
                            </Label>
                            <input
                              type="text"
                              maxLength={100}
                              placeholder={`e.g. "Happy Birthday Sarah"`}
                              className={`${inputCls} ${errors.customizations ? "border-red-400" : ""}`}
                              value={customizations[key] ?? ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCustomizations((prev) => ({ ...prev, [key]: val }));
                                if (errors.customizations)
                                  setErrors((prev) => { const n = { ...prev }; delete n.customizations; return n; });
                              }}
                            />
                          </div>
                        );
                      })}
                      {errors.customizations && (
                        <FieldError msg={errors.customizations} />
                      )}
                    </div>
                  </section>
                )}

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

            {step === "payment" && clientSecret && stripePromise && (
              <section>
                <SectionHeader number="3" title="Secure Payment" />
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    ...(stripeAccount ? { stripeAccount } : {}),
                    appearance: {
                      theme    : "stripe",
                      variables: {
                        colorPrimary  : C.blush,
                        colorText     : "#0E0E0E",
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
                          border   : `2px solid ${C.blush}`,
                          boxShadow: "none",
                        },
                        ".Label": {
                          fontWeight   : "700",
                          fontSize     : "10px",
                          letterSpacing: "2px",
                          textTransform: "uppercase",
                          color        : "#8C8288",
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

          {/* ── Order summary sidebar ───────────────────────────────────── */}
          <div className="w-full lg:w-[360px] flex-shrink-0">
            <div className="bg-white border-[3px] border-brand-black shadow-retro-lg overflow-hidden sticky top-24">

              <div
                className="h-[5px]"
                style={{
                  background: `repeating-linear-gradient(90deg,
                    ${C.blush} 0, ${C.blush} 40px,
                    ${C.gold}   40px, ${C.gold}   50px,
                    ${C.black}  50px, ${C.black}  54px)`,
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

                <div className="flex items-center gap-2 pb-4 mb-4 border-b border-brand-black/10">
                  <span className="text-[16px]">📦</span>
                  <div className="font-sans text-[11px] text-brand-smoke">
                    <span className="font-extrabold text-brand-black">Ships via Mail</span>
                    <> · Tracking number provided after purchase</>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pb-5 mb-5 border-b border-brand-black/10">
                  <div className="flex justify-between items-center">
                    <span className="font-sans text-[12px] text-brand-smoke">Subtotal</span>
                    <span className="font-sans font-extrabold text-[13px] text-brand-black">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-sans text-[12px] text-brand-smoke">Delivery fee</span>
                    <span className="font-sans font-extrabold text-[13px] text-brand-black">
                      ${DELIVERY_FEE}.00
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
                        "Tracking number emailed after purchase",
                        "🔒 Payments secured by Stripe",
                        "Order confirmation sent to your email",
                      ].map((text) => (
                        <div key={text} className="flex items-start gap-2">
                          <svg className="flex-shrink-0 mt-0.5" width="12" height="12"
                            viewBox="0 0 24 24" fill="none" stroke={C.blush}
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
