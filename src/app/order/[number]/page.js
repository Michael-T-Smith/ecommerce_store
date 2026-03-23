"use client";

import { useEffect, useState } from "react";
import Link                    from "next/link";
import { useParams }           from "next/navigation";
import AnnouncementBar  from "@/app/components/AnnouncementBar/AnnouncementBar";
import Navbar           from "@/app/components/Navbar/Navbar";
import Footer           from "@/app/components/Footer/Footer";
import { B }            from "@/lib/brand";
// Zone label shown as stored — works for any custom zone value

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

function capitalise(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}

// ── Minimal confirmation (no order data in sessionStorage) ────────────────────
function MinimalConfirmation({ orderNumber }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-5 text-center max-w-[540px] mx-auto">
      <div className="text-[80px] mb-6 leading-none">🌸</div>
      <h1 className="font-serif font-black text-brand-black text-[36px] sm:text-[44px] tracking-[-2px] mb-4">
        Order Received!
      </h1>
      <p className="font-sans text-brand-smoke text-[14px] leading-relaxed mb-3">
        Your order <strong className="text-brand-orange font-extrabold">{orderNumber}</strong> has been placed successfully.
      </p>
      <p className="font-sans text-brand-smoke text-[13px] leading-relaxed mb-10">
        You&apos;ll receive a confirmation email shortly. If you have any questions, call us at{" "}
        <a href="tel:+12565551234" className="text-brand-orange font-extrabold no-underline hover:underline">
          (256) 555-1234
        </a>.
      </p>
      <Link
        href="/shop"
        className="font-sans font-black text-[12px] tracking-[2px] uppercase bg-brand-orange text-brand-cream border-[3px] border-brand-black px-8 py-4 no-underline shadow-retro-md hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-retro-sm transition-all"
      >
        Continue Shopping
      </Link>
    </div>
  );
}

// ── Full confirmation ─────────────────────────────────────────────────────────
export default function OrderConfirmationPage() {
  const { number }            = useParams();
  const [order, setOrder    ] = useState(null);
  const [ready, setReady    ] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("lambs_pending_order");
      if (raw) {
        const parsed = JSON.parse(raw);
        setOrder(parsed);
        sessionStorage.removeItem("lambs_pending_order");
      }
    } catch { /* non-fatal */ }
    setReady(true);
  }, []);

  // Parse items array — could be a JSON string from DB or already an object
  const parsedItems = (() => {
    if (!order) return [];
    try {
      return typeof order.items === "string" ? JSON.parse(order.items) : (order.items ?? []);
    } catch { return []; }
  })();

  // delivery_zone is stored as a readable slug — display as-is or capitalised
  const zoneLabel = order?.delivery_zone
    ? order.delivery_zone.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : '—';
  const isPickup        = order?.fulfillment_type === "pickup";
  const fulfillmentDate = isPickup ? order?.delivery_date : order?.delivery_date;
  const isGuest         = !order?.customer_id;

  return (
    <div className="font-serif bg-brand-cream min-h-screen overflow-x-hidden">
      <AnnouncementBar />
      <Navbar />

      <main className="px-5 sm:px-10 lg:px-16 py-12 sm:py-20">
        {!ready ? null : !order ? (
          <MinimalConfirmation orderNumber={number} />
        ) : (
          <div className="max-w-[860px] mx-auto">

            {/* ── Success header ─────────────────────────────────────── */}
            <div
              className="border-[3px] border-brand-black overflow-hidden mb-10 shadow-retro-lg"
            >
              {/* Top stripe */}
              <div
                className="h-[6px]"
                style={{
                  background: `repeating-linear-gradient(90deg,
                    ${B.orange} 0, ${B.orange} 40px,
                    ${B.gold}   40px, ${B.gold}   50px,
                    ${B.orange} 50px, ${B.orange} 90px,
                    ${B.black}  90px, ${B.black}  94px)`,
                }}
              />

              <div
                className="px-8 sm:px-12 py-10 sm:py-12 text-center relative overflow-hidden"
                style={{
                  background: `repeating-linear-gradient(-55deg,
                    transparent 0px, transparent 50px,
                    rgba(212,81,26,0.04) 50px, rgba(212,81,26,0.04) 56px),
                    white`,
                }}
              >
                <div className="text-[64px] mb-4 leading-none">🌷</div>
                <h1 className="font-serif font-black text-brand-black text-[32px] sm:text-[44px] tracking-[-2px] mb-3">
                  Order Confirmed!
                </h1>
                <p className="font-sans text-brand-smoke text-[14px] leading-relaxed mb-2">
                  Thank you, <strong className="text-brand-black">{order.customer_name}</strong>. Your order has been received.
                </p>
                <div className="inline-block bg-brand-orange text-brand-cream font-sans font-black text-[13px] tracking-[2px] uppercase px-6 py-2 mt-3 border-[2px] border-brand-black">
                  {order.order_number}
                </div>
                {order.customer_email && (
                  <p className="font-sans text-[12px] text-brand-smoke mt-4">
                    A confirmation will be sent to <strong>{order.customer_email}</strong>
                  </p>
                )}
              </div>
            </div>

            {/* ── Guest tracking notice ──────────────────────────────── */}
            {isGuest && (
              <div className="mb-6 border-[3px] border-brand-orange bg-white overflow-hidden shadow-retro-sm">
                <div className="bg-brand-orange px-6 py-3 flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke={B.cream} strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-cream">
                    Save these to track your order
                  </span>
                </div>
                <div className="px-6 py-5 flex flex-col gap-4">
                  <p className="font-sans text-[13px] text-brand-smoke leading-relaxed">
                    You checked out as a guest. To check your order status at any time, you&apos;ll need both of the following:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-brand-cream border-[2px] border-brand-black/20 px-4 py-3">
                      <div className="font-sans font-extrabold text-[9px] tracking-[2px] uppercase text-brand-smoke mb-1">
                        Order Number
                      </div>
                      <div className="font-sans font-black text-[16px] text-brand-orange tracking-[1px]">
                        {order.order_number}
                      </div>
                    </div>
                    <div className="bg-brand-cream border-[2px] border-brand-black/20 px-4 py-3">
                      <div className="font-sans font-extrabold text-[9px] tracking-[2px] uppercase text-brand-smoke mb-1">
                        Email Address
                      </div>
                      <div className="font-sans font-black text-[14px] text-brand-black break-all">
                        {order.customer_email}
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/order/track"
                    className="inline-flex items-center justify-center gap-2 font-sans font-black text-[11px] tracking-[2px] uppercase bg-brand-orange text-brand-cream border-[2px] border-brand-black px-6 py-3 no-underline shadow-retro-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all self-start"
                  >
                    Track My Order →
                  </Link>
                  <div className="border-t border-gray-200 pt-4">
                    <p className="font-sans text-[12px] text-brand-smoke leading-relaxed">
                      Want to skip this next time?{" "}
                      <Link
                        href={`/account/register?email=${encodeURIComponent(order.customer_email ?? "")}`}
                        className="text-brand-orange font-extrabold no-underline hover:underline"
                      >
                        Create a free account
                      </Link>{" "}
                      using <strong>{order.customer_email}</strong> — your order history will be saved automatically.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* ── Delivery details ─────────────────────────────────── */}
              <div className="bg-white border-[3px] border-brand-black shadow-retro-sm overflow-hidden">
                <div className="bg-brand-bark px-6 py-4 flex items-center gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke={B.cream} strokeWidth="2" strokeLinecap="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span className="font-sans font-extrabold text-[11px] tracking-[2px] uppercase text-brand-cream">
                    Delivery Details
                  </span>
                </div>
                <div className="px-6 py-5 flex flex-col gap-4">
                  {[
                    ...(isPickup ? [
                      { label: "Location", value: order.pickup_location === "centre" ? "Centre — 1470 W Main St, Ste H, Centre, AL 35960" : "Piedmont — 211 Memorial Dr, Piedmont, AL 36272" },
                      { label: "Date",     value: formatDate(order.delivery_date) },
                      { label: "Time",     value: order.pickup_time ?? "—" },
                    ] : [
                      { label: "Deliver To",  value: order.delivery_address },
                      { label: "Zone",        value: zoneLabel },
                      { label: "Date",        value: formatDate(order.delivery_date) },
                      { label: "Window",      value: order.delivery_window ? `${order.delivery_window} window` : "—" },
                    ]),
                    ...(order.note_message ? [{ label: "Card Message", value: order.note_message }] : []),
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div className="font-sans font-extrabold text-[9px] tracking-[2px] uppercase text-brand-smoke mb-0.5">
                        {label}
                      </div>
                      <div className="font-sans text-[13px] text-brand-black leading-relaxed">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Order summary ─────────────────────────────────────── */}
              <div className="bg-white border-[3px] border-brand-black shadow-retro-sm overflow-hidden">
                <div className="bg-brand-bark px-6 py-4 flex items-center gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke={B.cream} strokeWidth="2" strokeLinecap="round">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 01-8 0"/>
                  </svg>
                  <span className="font-sans font-extrabold text-[11px] tracking-[2px] uppercase text-brand-cream">
                    Items Ordered
                  </span>
                </div>
                <div className="px-6 py-5">
                  <div className="flex flex-col gap-3 pb-4 mb-4 border-b border-brand-black/10">
                    {parsedItems.map((item, i) => (
                      <div key={i} className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-sans font-extrabold text-[12px] text-brand-black">
                            {item.name || item.sku}
                          </div>
                          {item.size && (
                            <div className="font-sans text-[10px] text-brand-smoke">{item.size}</div>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-sans font-extrabold text-[12px] text-brand-black">
                            ${((item.price ?? 0) * (item.qty ?? 1)).toFixed(2)}
                          </div>
                          <div className="font-sans text-[10px] text-brand-smoke">× {item.qty ?? 1}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between">
                      <span className="font-sans text-[12px] text-brand-smoke">Subtotal</span>
                      <span className="font-sans font-extrabold text-[12px] text-brand-black">
                        ${Number(order.subtotal).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans text-[12px] text-brand-smoke">Delivery</span>
                      <span className="font-sans font-extrabold text-[12px] text-brand-black">
                        ${Number(order.delivery_fee).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 mt-1 border-t-[2px] border-brand-black">
                      <span className="font-sans font-extrabold text-[13px] uppercase tracking-[1px] text-brand-black">
                        Total
                      </span>
                      <span className="font-sans font-black text-[20px] text-brand-orange">
                        ${Number(order.total).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── What happens next ─────────────────────────────────────── */}
            <div className="mt-8 bg-brand-cream border-[3px] border-brand-black p-6 sm:p-8 shadow-retro-sm">
              <h3 className="font-serif font-bold text-brand-black text-[18px] mb-5">
                What happens next?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  {
                    emoji: "📞",
                    title: "We'll confirm",
                    body : "Cecelia or Frank will call to confirm your order and arrange payment.",
                  },
                  {
                    emoji: "✂️",
                    title: "We'll arrange",
                    body : "Your flowers are cut and arranged fresh on the day of delivery.",
                  },
                  {
                    emoji: "🚗",
                    title: "We'll deliver",
                    body : "Hand-delivered to your door in your chosen time window.",
                  },
                ].map((step) => (
                  <div key={step.title} className="flex items-start gap-4">
                    <span className="text-[28px] leading-none flex-shrink-0">{step.emoji}</span>
                    <div>
                      <div className="font-sans font-extrabold text-[12px] tracking-[1px] uppercase text-brand-black mb-1">
                        {step.title}
                      </div>
                      <div className="font-sans text-[12px] text-brand-smoke leading-relaxed">
                        {step.body}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              {isGuest ? (
                <>
                  <Link
                    href="/order/track"
                    className="font-sans font-black text-[12px] tracking-[2px] uppercase bg-brand-black text-brand-cream border-[3px] border-brand-black px-8 py-4 no-underline shadow-retro-md hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-retro-sm transition-all text-center"
                  >
                    Track My Order
                  </Link>
                  <Link
                    href={`/account/register?email=${encodeURIComponent(order.customer_email ?? "")}`}
                    className="font-sans font-black text-[12px] tracking-[2px] uppercase bg-brand-cream text-brand-black border-[3px] border-brand-black px-8 py-4 no-underline shadow-retro-md hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-retro-sm transition-all text-center"
                  >
                    Create Account
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/account/orders"
                    className="font-sans font-black text-[12px] tracking-[2px] uppercase bg-brand-black text-brand-cream border-[3px] border-brand-black px-8 py-4 no-underline shadow-retro-md hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-retro-sm transition-all text-center"
                  >
                    View My Orders
                  </Link>
                  <Link
                    href="/shop"
                    className="font-sans font-black text-[12px] tracking-[2px] uppercase bg-brand-cream text-brand-black border-[3px] border-brand-black px-8 py-4 no-underline shadow-retro-md hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-retro-sm transition-all text-center"
                  >
                    Continue Shopping
                  </Link>
                </>
              )}
            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}