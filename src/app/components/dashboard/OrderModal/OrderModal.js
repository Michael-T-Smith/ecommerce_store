
"use client";

import { ORDER_STATUSES, STATUS_NEXT } from "@/lib/ordersData";
import { canDo }   from "@/lib/permissions";
import StatusBadge from "@/app/components/dashboard/StatusBadge/StatusBadge";
import { B }       from "@/lib/brand";

export default function OrderModal({ order, onClose, onAdvance, onCancel, userRole }) {
  const canUpdate = canDo(userRole, "orders", "update");
  const canDelete = canDo(userRole, "orders", "delete");

  const currentMeta = ORDER_STATUSES.find((s) => s.key === order.status);
  const nextStatus  = STATUS_NEXT[order.status];
  const nextMeta    = nextStatus ? ORDER_STATUSES.find((s) => s.key === nextStatus) : null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(17,17,17,0.65)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full max-w-[680px] max-h-[90vh] flex flex-col border-[3px] border-brand-black shadow-retro-lg overflow-hidden">

        {/* Header */}
        <div
          className="px-6 py-4 flex items-start justify-between gap-4 border-b-[3px] border-brand-black flex-shrink-0"
          style={{ background: B.bark }}
        >
          <div>
            <div className="font-sans font-extrabold text-[9px] tracking-[3px] uppercase text-brand-cream/50 mb-1">
              Order Details
            </div>
            <div className="font-serif font-black text-brand-cream text-[22px] tracking-[-0.5px] leading-none">
              {order.orderNumber}
            </div>
            <div className="font-sans text-[12px] text-brand-cream/60 mt-1">
              {new Date(order.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })}
              {" · "}{order.customerName}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <StatusBadge label={currentMeta?.label} color={currentMeta?.color} dot={order.status === "out_for_delivery"} />
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center bg-brand-cream/10 border border-brand-cream/20 text-brand-cream cursor-pointer hover:bg-brand-cream/20 flex-shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">

          {/* Status pipeline visual */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-1 overflow-x-auto">
              {ORDER_STATUSES.filter((s) => s.key !== "cancelled").map((s, i, arr) => {
                const statuses = ORDER_STATUSES.filter((x) => x.key !== "cancelled").map((x) => x.key);
                const currentIdx = statuses.indexOf(order.status);
                const thisIdx    = statuses.indexOf(s.key);
                const isPast     = thisIdx < currentIdx;
                const isCurrent  = thisIdx === currentIdx;
                const isFuture   = thisIdx > currentIdx;
                const isCancelled = order.status === "cancelled";

                return (
                  <div key={s.key} className="flex items-center gap-1 flex-shrink-0">
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className="w-2.5 h-2.5 rounded-full border-2"
                        style={{
                          background    : isCancelled ? "#E5E7EB" : (isPast || isCurrent) ? s.color : "transparent",
                          borderColor   : isCancelled ? "#E5E7EB" : s.color,
                        }}
                      />
                      <span
                        className="font-sans text-[8px] font-extrabold tracking-[0.5px] uppercase whitespace-nowrap"
                        style={{ color: isCancelled ? "#D1D5DB" : isCurrent ? s.color : isPast ? "#9CA3AF" : "#D1D5DB" }}
                      >
                        {s.label}
                      </span>
                    </div>
                    {i < arr.length - 1 && (
                      <div
                        className="w-6 h-0.5 mb-3 flex-shrink-0"
                        style={{ background: isPast ? "#9CA3AF" : "#E5E7EB" }}
                      />
                    )}
                  </div>
                );
              })}
              {order.status === "cancelled" && (
                <div className="ml-3 flex flex-col items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400 border-2 border-red-400" />
                  <span className="font-sans text-[8px] font-extrabold tracking-[0.5px] uppercase text-red-400">
                    Cancelled
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Customer */}
            <div>
              <div className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-3">
                Customer
              </div>
              <div className="font-serif font-bold text-brand-black text-[16px] mb-1">{order.customerName}</div>
              {order.customerEmail && (
                <a href={`mailto:${order.customerEmail}`}
                  className="block font-sans text-[13px] text-brand-smoke no-underline hover:text-brand-orange transition-colors">
                  {order.customerEmail}
                </a>
              )}
              {order.customerPhone && (
                <a href={`tel:${order.customerPhone}`}
                  className="block font-sans text-[13px] text-brand-smoke no-underline hover:text-brand-orange transition-colors">
                  {order.customerPhone}
                </a>
              )}
            </div>

            {/* Delivery info */}
            <div>
              <div className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-3">
                Delivery
              </div>
              <div className="font-sans text-[13px] text-brand-black leading-relaxed mb-1">
                {order.deliveryAddress}
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span
                  className="font-sans font-extrabold text-[9px] tracking-[1.5px] uppercase px-2 py-1 border"
                  style={{ color: B.orange, borderColor: `${B.orange}40`, background: `${B.orange}10` }}
                >
                  {order.deliveryZone.charAt(0).toUpperCase() + order.deliveryZone.slice(1)}
                </span>
                <span className="font-sans text-[12px] text-brand-smoke">
                  {new Date(order.deliveryDate + "T00:00:00").toLocaleDateString("en-US", { dateStyle: "medium" })}
                  {" · "}{order.deliveryWindow === "morning" ? "Morning (9AM–12PM)" : "Afternoon (12PM–5PM)"}
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="sm:col-span-2">
              <div className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-3">
                Items Ordered
              </div>
              <div className="border border-gray-200">
                {order.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <div>
                      <span className="font-sans font-extrabold text-[13px] text-brand-black">
                        {item.name}
                      </span>
                      <span className="font-sans text-[12px] text-brand-smoke ml-2">
                        {item.size} × {item.qty}
                      </span>
                    </div>
                    <span className="font-sans font-black text-[14px] text-brand-black">
                      ${(item.price * item.qty).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="px-4 py-3 bg-gray-50 flex flex-col gap-1 items-end border-t border-gray-200">
                  <div className="font-sans text-[12px] text-brand-smoke">
                    Subtotal: ${order.subtotal.toFixed(2)}
                  </div>
                  {order.deliveryFee > 0 && (
                    <div className="font-sans text-[12px] text-brand-smoke">
                      Delivery fee: ${order.deliveryFee.toFixed(2)}
                    </div>
                  )}
                  <div className="font-serif font-black text-[18px] text-brand-black">
                    Total: ${order.total.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Note message */}
            {order.noteMessage && (
              <div className="sm:col-span-2">
                <div className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-2">
                  Handwritten Note
                </div>
                <div className="bg-brand-cream border-l-4 border-brand-gold px-4 py-3 font-serif text-[14px] text-brand-bark italic leading-relaxed">
                  &ldquo;{order.noteMessage}&rdquo;
                </div>
              </div>
            )}

            {/* Staff notes */}
            <div className="sm:col-span-2">
              <div className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-2">
                Staff Notes <span className="normal-case font-normal text-brand-smoke/60 tracking-normal">(internal only)</span>
              </div>
              <div className="border border-gray-200 px-4 py-3 font-sans text-[13px] text-brand-smoke min-h-[60px]">
                {order.staffNotes || <span className="opacity-40 italic">No notes</span>}
              </div>
            </div>

            {/* Stripe reference */}
            {order.stripePaymentId && (
              <div className="sm:col-span-2">
                <div className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-1">
                  Stripe Payment ID
                </div>
                <code className="font-sans text-[12px] text-brand-smoke bg-gray-100 px-2 py-1 border border-gray-200">
                  {order.stripePaymentId}
                </code>
              </div>
            )}

          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-3 flex-shrink-0 flex-wrap">
          <div className="flex gap-2">
            <button onClick={onClose}
              className="font-sans font-extrabold text-[11px] tracking-[1px] uppercase px-5 py-2.5 border-2 border-gray-300 text-brand-smoke bg-white cursor-pointer hover:border-brand-black hover:text-brand-black transition-colors">
              Close
            </button>
            {canDelete && order.status !== "cancelled" && order.status !== "delivered" && (
              <button onClick={() => { onCancel(order.id); onClose(); }}
                className="font-sans font-extrabold text-[11px] tracking-[1px] uppercase px-5 py-2.5 border-2 border-red-300 text-red-500 bg-white cursor-pointer hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors">
                Cancel Order
              </button>
            )}
          </div>

          {canUpdate && nextMeta && (
            <button
              onClick={() => { onAdvance(order.id, nextStatus); onClose(); }}
              className="font-sans font-extrabold text-[12px] tracking-[1px] uppercase px-6 py-2.5 border-2 border-brand-black text-brand-cream cursor-pointer shadow-retro-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-2"
              style={{ background: nextMeta.color, borderColor: B.black }}
            >
              Advance → {nextMeta.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}