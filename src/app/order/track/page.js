"use client";

import { useState }   from "react";
import Link           from "next/link";
import AnnouncementBar from "@/app/components/AnnouncementBar/AnnouncementBar";
import Navbar         from "@/app/components/Navbar/Navbar";
import Footer         from "@/app/components/Footer/Footer";
import { B }          from "@/lib/brand";

const ORDER_STATUSES = [
  { key: "pending",          label: "Pending"          },
  { key: "confirmed",        label: "Confirmed"        },
  { key: "preparing",        label: "Preparing"        },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered",        label: "Delivered"        },
];

const STATUS_META = {
  pending         : { label: "Pending",          color: "#F59E0B" },
  confirmed       : { label: "Confirmed",        color: "#3B82F6" },
  preparing       : { label: "Preparing",        color: "#8B5CF6" },
  out_for_delivery: { label: "Out for Delivery", color: "#D4511A" },
  delivered       : { label: "Delivered",        color: "#22C55E" },
  cancelled       : { label: "Cancelled",        color: "#EF4444" },
};

function formatDate(raw) {
  if (!raw) return "—";
  const [y, m, d] = raw.slice(0, 10).split("-");
  return new Date(Number(y), Number(m) - 1, Number(d))
    .toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function StatusPipeline({ status }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-red-400" />
        <span className="font-sans font-extrabold text-[12px] text-red-500 uppercase tracking-[1px]">
          Order Cancelled
        </span>
      </div>
    );
  }

  const pipelineStatuses = ORDER_STATUSES;
  const currentIdx = pipelineStatuses.findIndex((s) => s.key === status);

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {pipelineStatuses.map((s, i) => {
        const isPast    = i < currentIdx;
        const isCurrent = i === currentIdx;
        const meta      = STATUS_META[s.key];
        return (
          <div key={s.key} className="flex items-center gap-1 flex-shrink-0">
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-3 h-3 rounded-full border-2 transition-all"
                style={{
                  background : (isPast || isCurrent) ? meta.color : "transparent",
                  borderColor: meta.color,
                }} />
              <span className="font-sans text-[9px] font-extrabold tracking-[0.5px] uppercase whitespace-nowrap"
                style={{ color: isCurrent ? meta.color : isPast ? "#9CA3AF" : "#D1D5DB" }}>
                {s.label}
              </span>
            </div>
            {i < pipelineStatuses.length - 1 && (
              <div className="w-8 h-0.5 mb-4 flex-shrink-0"
                style={{ background: isPast ? "#9CA3AF" : "#E5E7EB" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderResult({ order }) {
  const meta  = STATUS_META[order.status] ?? { label: order.status, color: B.smoke };
  const items = Array.isArray(order.items)
    ? order.items
    : (typeof order.items === "string" ? JSON.parse(order.items) : []);

  return (
    <div className="border-[2px] border-brand-black bg-white overflow-hidden">

      {/* Order header bar */}
      <div className="px-6 py-4 flex items-start justify-between gap-4 flex-wrap"
        style={{ background: B.bark }}>
        <div>
          <div className="font-sans font-extrabold text-[9px] tracking-[3px] uppercase text-brand-cream/50 mb-1">
            Order Status
          </div>
          <div className="font-serif font-black text-brand-cream text-[22px] tracking-[-0.5px] leading-none">
            {order.order_number}
          </div>
          <div className="font-sans text-[12px] text-brand-cream/60 mt-1">
            Placed {new Date(order.created_at).toLocaleDateString("en-US", { dateStyle: "medium" })}
            {" · "}{order.customer_name}
          </div>
        </div>
        <span className="font-sans font-extrabold text-[10px] tracking-[1.5px] uppercase px-3 py-1.5 border-2"
          style={{ color: meta.color, borderColor: meta.color, background: `${meta.color}20` }}>
          {meta.label}
        </span>
      </div>

      <div className="px-6 py-5 flex flex-col gap-6">

        {/* Pipeline */}
        <div>
          <div className="font-sans font-extrabold text-[9px] tracking-[2px] uppercase text-brand-smoke mb-4">
            Progress
          </div>
          <StatusPipeline status={order.status} />
        </div>

        {/* Fulfillment details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="font-sans font-extrabold text-[9px] tracking-[2px] uppercase text-brand-smoke mb-2">
              {order.fulfillment_type === "pickup" ? "Pickup Details" : "Delivery Details"}
            </div>
            {order.fulfillment_type === "pickup" ? (
              <div className="font-sans text-[13px] text-brand-black leading-relaxed">
                <div className="font-extrabold">
                  {order.pickup_location === "centre" ? "Centre" : "Piedmont"}
                </div>
                <div className="text-brand-smoke">
                  {order.pickup_location === "centre"
                    ? "1470 W Main St, Ste H, Centre, AL 35960"
                    : "211 Memorial Dr, Piedmont, AL 36272"}
                </div>
                {order.delivery_date && (
                  <div className="text-brand-smoke mt-1">{formatDate(order.delivery_date)}</div>
                )}
                {order.pickup_time && (
                  <div className="text-brand-smoke">{order.pickup_time.replace("-", " – ")}</div>
                )}
              </div>
            ) : (
              <div className="font-sans text-[13px] text-brand-black leading-relaxed">
                <div>{order.delivery_address}</div>
                {order.delivery_date && (
                  <div className="text-brand-smoke mt-1">{formatDate(order.delivery_date)}</div>
                )}
                {order.delivery_window && (
                  <div className="text-brand-smoke capitalize">
                    {order.delivery_window === "morning" ? "Morning (9AM – 12PM)" : "Afternoon (12PM – 5PM)"}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Order total */}
          <div>
            <div className="font-sans font-extrabold text-[9px] tracking-[2px] uppercase text-brand-smoke mb-2">
              Order Total
            </div>
            <div className="font-serif font-black text-brand-black text-[24px] tracking-[-0.5px]">
              ${Number(order.total).toFixed(2)}
            </div>
            {Number(order.delivery_fee) > 0 && (
              <div className="font-sans text-[11px] text-brand-smoke">
                incl. ${Number(order.delivery_fee).toFixed(2)} delivery fee
              </div>
            )}
          </div>
        </div>

        {/* Items */}
        <div>
          <div className="font-sans font-extrabold text-[9px] tracking-[2px] uppercase text-brand-smoke mb-3">
            Items Ordered
          </div>
          <div className="border border-gray-200">
            {items.map((item, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0">
                <div>
                  <span className="font-sans font-extrabold text-[13px] text-brand-black">{item.name}</span>
                  <span className="font-sans text-[12px] text-brand-smoke ml-2">{item.size} × {item.qty}</span>
                </div>
                <span className="font-sans font-black text-[14px] text-brand-black">
                  ${(Number(item.price) * Number(item.qty)).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Help */}
        <p className="font-sans text-[12px] text-brand-smoke/70 text-center border-t border-gray-100 pt-4">
          Questions about your order?{" "}
          <a href="tel:+12564476331" className="text-brand-orange font-extrabold no-underline hover:underline">
            Call (256) 447-6331
          </a>
        </p>
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  const [form,    setForm   ] = useState({ orderNumber: "", email: "" });
  const [order,   setOrder  ] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError  ] = useState(null);

  const handleLookup = async (e) => {
    e.preventDefault();
    const orderNumber = form.orderNumber.trim().toUpperCase();
    const email       = form.email.trim().toLowerCase();

    if (!orderNumber || !email) {
      setError("Both order number and email are required.");
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const res  = await fetch(`/api/orders/lookup?order_number=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No order found. Please check your order number and email.");
      } else {
        setOrder(data.data);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full border-[2px] border-brand-black/30 px-4 py-3 font-sans text-[14px] text-brand-black placeholder:text-brand-smoke/40 focus:outline-none focus:border-brand-orange transition-colors bg-white";

  return (
    <>
      <AnnouncementBar />
      <Navbar />

      <main className="min-h-screen bg-brand-cream pt-10 pb-20 px-4">
        <div className="max-w-[560px] mx-auto flex flex-col gap-8">

          {/* Header */}
          <div className="text-center">
            <h1 className="font-serif font-black text-brand-black text-[36px] sm:text-[44px] tracking-[-2px] leading-none mb-3">
              Track Your Order
            </h1>
            <p className="font-sans text-brand-smoke text-[14px] leading-relaxed">
              Enter your order number and the email you used at checkout.
            </p>
          </div>

          {/* Lookup form */}
          <form onSubmit={handleLookup} className="bg-white border-[2px] border-brand-black p-6 flex flex-col gap-4">
            <div>
              <label className="block font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-1.5">
                Order Number
              </label>
              <input
                type="text"
                className={inputCls}
                placeholder="e.g. LF-2025-0042"
                value={form.orderNumber}
                onChange={(e) => setForm((f) => ({ ...f, orderNumber: e.target.value }))}
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                className={inputCls}
                placeholder="email@example.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                autoComplete="email"
              />
            </div>

            {error && (
              <p className="font-sans text-[12px] text-red-500 bg-red-50 border border-red-200 px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 font-sans font-black text-[12px] tracking-[2px] uppercase border-[3px] border-brand-black bg-brand-orange text-brand-cream cursor-pointer shadow-retro-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0">
              {loading ? "Looking up…" : "Find My Order"}
            </button>
          </form>

          {/* Result */}
          {order && <OrderResult order={order} />}

          {/* Signed-in prompt */}
          <p className="font-sans text-[12px] text-brand-smoke/70 text-center">
            Have an account?{" "}
            <Link href="/account" className="text-brand-orange font-extrabold no-underline hover:underline">
              Sign in
            </Link>{" "}
            to view your full order history.
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}
