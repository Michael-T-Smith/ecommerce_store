"use client";

import { useState } from "react";
import { ORDER_STATUSES, STATUS_NEXT, STATUS_PREV } from "@/lib/ordersData";
import { canDo }       from "@/lib/permissions";
import StatusBadge     from "@/app/components/dashboard/StatusBadge/StatusBadge";
import MailingLabel    from "@/app/components/dashboard/MailingLabel/MailingLabel";
import { updateOrder } from "@/lib/dashboardApi";
import { C }           from "@/lib/brand";

export default function OrderModal({ order, onClose, onAdvance, onBackpedal, onCancel, onSave, userRole }) {
  const canUpdate    = canDo(userRole, "orders", "update");
  const canDelete    = canDo(userRole, "orders", "delete");
  const canEdit      = userRole === "admin" || userRole === "manager";
  const canBackpedal = canEdit;

  const currentMeta = ORDER_STATUSES.find((s) => s.key === order.status);
  const nextStatus  = STATUS_NEXT[order.status];
  const nextMeta    = nextStatus ? ORDER_STATUSES.find((s) => s.key === nextStatus) : null;
  const prevStatus  = STATUS_PREV[order.status];

  const [editing,   setEditing  ] = useState(false);
  const [saving,    setSaving   ] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [editForm,  setEditForm ] = useState({});

  const enterEdit = () => {
    setEditForm({
      deliveryDate   : order.deliveryDate ? order.deliveryDate.slice(0, 10) : "",
      deliveryWindow : order.deliveryWindow || "afternoon",
      deliveryAddress: order.deliveryAddress || "",
      staffNotes     : order.staffNotes || "",
    });
    setSaveError(null);
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await updateOrder(order.id, editForm);
      const updated = {
        ...order,
        deliveryDate   : editForm.deliveryDate    || null,
        deliveryWindow : editForm.deliveryWindow,
        deliveryAddress: editForm.deliveryAddress,
        staffNotes     : editForm.staffNotes      || null,
      };
      onSave(updated);
      setEditing(false);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const formatDeliveryDate = (raw) => {
    if (!raw) return "—";
    const [y, m, d] = raw.slice(0, 10).split("-");
    return new Date(Number(y), Number(m) - 1, Number(d))
      .toLocaleDateString("en-US", { dateStyle: "medium" });
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(17,17,17,0.65)" }}
      onClick={(e) => { if (e.target === e.currentTarget && !editing) onClose(); }}
    >
      <div className="bg-white w-full max-w-[680px] max-h-[90vh] flex flex-col border-[3px] border-brand-black shadow-retro-lg overflow-hidden">

        {/* Header */}
        <div
          className="px-6 py-4 flex items-start justify-between gap-4 border-b-[3px] border-brand-black flex-shrink-0"
          style={{ background: C.darkGrey }}
        >
          <div>
            <div className="font-sans font-extrabold text-[9px] tracking-[3px] uppercase text-brand-cream/50 mb-1">
              {editing ? "Editing Order" : "Order Details"}
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
            {!editing && <StatusBadge label={currentMeta?.label} color={currentMeta?.color} dot={order.status === "out_for_delivery"} />}
            <button
              onClick={() => { if (editing) { setEditing(false); } else { onClose(); } }}
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

          {/* Status pipeline — hidden in edit mode */}
          {!editing && (
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-1 overflow-x-auto">
                {ORDER_STATUSES.filter((s) => s.key !== "cancelled").map((s, i, arr) => {
                  const statuses    = ORDER_STATUSES.filter((x) => x.key !== "cancelled").map((x) => x.key);
                  const currentIdx  = statuses.indexOf(order.status);
                  const thisIdx     = statuses.indexOf(s.key);
                  const isPast      = thisIdx < currentIdx;
                  const isCurrent   = thisIdx === currentIdx;
                  const isCancelled = order.status === "cancelled";

                  return (
                    <div key={s.key} className="flex items-center gap-1 flex-shrink-0">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-2.5 h-2.5 rounded-full border-2"
                          style={{
                            background : isCancelled ? "#E5E7EB" : (isPast || isCurrent) ? s.color : "transparent",
                            borderColor: isCancelled ? "#E5E7EB" : s.color,
                          }} />
                        <span className="font-sans text-[8px] font-extrabold tracking-[0.5px] uppercase whitespace-nowrap"
                          style={{ color: isCancelled ? "#D1D5DB" : isCurrent ? s.color : isPast ? "#9CA3AF" : "#D1D5DB" }}>
                          {s.label}
                        </span>
                      </div>
                      {i < arr.length - 1 && (
                        <div className="w-6 h-0.5 mb-3 flex-shrink-0"
                          style={{ background: isPast ? "#9CA3AF" : "#E5E7EB" }} />
                      )}
                    </div>
                  );
                })}
                {order.status === "cancelled" && (
                  <div className="ml-3 flex flex-col items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400 border-2 border-red-400" />
                    <span className="font-sans text-[8px] font-extrabold tracking-[0.5px] uppercase text-red-400">Cancelled</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Customer — always read-only */}
            <div>
              <div className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-3">Customer</div>
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

            {/* Delivery / Pickup — editable in edit mode */}
            <div>
              <div className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-3">
                {order.fulfillmentType === "pickup" ? "Pickup" : "Delivery"}
              </div>
              {editing ? (
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="font-sans text-[10px] font-extrabold tracking-[1px] uppercase text-brand-smoke block mb-1">Address</label>
                    <textarea
                      value={editForm.deliveryAddress}
                      onChange={(e) => setEditForm((f) => ({ ...f, deliveryAddress: e.target.value }))}
                      rows={2}
                      className="w-full border border-gray-300 px-3 py-2 font-sans text-[12px] text-brand-black focus:outline-none focus:border-brand-orange transition-colors resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="font-sans text-[10px] font-extrabold tracking-[1px] uppercase text-brand-smoke block mb-1">Delivery Date</label>
                      <input
                        type="date"
                        value={editForm.deliveryDate}
                        onChange={(e) => setEditForm((f) => ({ ...f, deliveryDate: e.target.value }))}
                        className="w-full border border-gray-300 px-3 py-2 font-sans text-[12px] text-brand-black focus:outline-none focus:border-brand-orange transition-colors"
                      />
                    </div>
                    <div>
                      <label className="font-sans text-[10px] font-extrabold tracking-[1px] uppercase text-brand-smoke block mb-1">Window</label>
                      <select
                        value={editForm.deliveryWindow}
                        onChange={(e) => setEditForm((f) => ({ ...f, deliveryWindow: e.target.value }))}
                        className="border border-gray-300 px-3 py-2 font-sans text-[12px] text-brand-black focus:outline-none focus:border-brand-orange transition-colors bg-white cursor-pointer">
                        <option value="morning">Morning (9AM–12PM)</option>
                        <option value="afternoon">Afternoon (12PM–5PM)</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : order.fulfillmentType === "pickup" ? (
                <div className="flex flex-col gap-1">
                  <span className="font-sans font-extrabold text-[9px] tracking-[1.5px] uppercase px-2 py-1 border inline-self-start w-fit"
                    style={{ color: C.blush, borderColor: `${C.blush}40`, background: `${C.blush}10` }}>
                    {order.pickupLocation === "centre" ? "Centre" : "Piedmont"}
                  </span>
                  <div className="font-sans text-[12px] text-brand-smoke">
                    {order.pickupLocation === "centre"
                      ? "1470 W Main St, Ste H, Centre, AL 35960"
                      : "211 Memorial Dr, Piedmont, AL 36272"}
                  </div>
                  {order.deliveryDate && (
                    <div className="font-sans text-[12px] text-brand-smoke">
                      {formatDeliveryDate(order.deliveryDate)}
                      {order.pickupTime && ` · ${order.pickupTime.replace("-", " – ")}`}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="font-sans text-[13px] text-brand-black leading-relaxed mb-1">
                    {order.deliveryAddress}
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="font-sans font-extrabold text-[9px] tracking-[1.5px] uppercase px-2 py-1 border"
                      style={{ color: C.blush, borderColor: `${C.blush}40`, background: `${C.blush}10` }}>
                      {order.deliveryZone && order.deliveryZone.charAt(0).toUpperCase() + order.deliveryZone.slice(1)}
                    </span>
                    <span className="font-sans text-[12px] text-brand-smoke">
                      {formatDeliveryDate(order.deliveryDate)}
                      {" · "}
                      {order.deliveryWindow === "morning" ? "Morning (9AM–12PM)" : "Afternoon (12PM–5PM)"}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Items — always read-only */}
            <div className="sm:col-span-2">
              <div className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-3">Items Ordered</div>
              <div className="border border-gray-200">
                {order.items.map((item, i) => (
                  <div key={i} className="px-4 py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-sans font-extrabold text-[13px] text-brand-black">{item.name}</span>
                        <span className="font-sans text-[12px] text-brand-smoke ml-2">{item.size} × {item.qty}</span>
                      </div>
                      <span className="font-sans font-black text-[14px] text-brand-black">${(item.price * item.qty).toFixed(2)}</span>
                    </div>
                    {item.customizationText && (
                      <div className="mt-2 flex items-start gap-2 bg-brand-orange/5 border-l-[3px] border-brand-orange px-3 py-2">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                          stroke="#D4511A" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0 mt-0.5">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        <div>
                          <span className="font-sans font-extrabold text-[9px] tracking-[2px] uppercase text-brand-orange">
                            {item.customizationType
                              ? item.customizationType.charAt(0).toUpperCase() + item.customizationType.slice(1)
                              : "Personalized"}
                          </span>
                          <p className="font-sans text-[13px] text-brand-black mt-0.5 leading-snug">
                            &ldquo;{item.customizationText}&rdquo;
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div className="px-4 py-3 bg-gray-50 flex flex-col gap-1 items-end border-t border-gray-200">
                  <div className="font-sans text-[12px] text-brand-smoke">Subtotal: ${order.subtotal.toFixed(2)}</div>
                  {order.deliveryFee > 0 && (
                    <div className="font-sans text-[12px] text-brand-smoke">Delivery fee: ${order.deliveryFee.toFixed(2)}</div>
                  )}
                  <div className="font-serif font-black text-[18px] text-brand-black">Total: ${order.total.toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* Handwritten note — read-only */}
            {order.noteMessage && (
              <div className="sm:col-span-2">
                <div className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-2">Handwritten Note</div>
                <div className="bg-brand-cream border-l-4 border-brand-gold px-4 py-3 font-serif text-[14px] text-brand-bark italic leading-relaxed">
                  &ldquo;{order.noteMessage}&rdquo;
                </div>
              </div>
            )}

            {/* Staff notes — editable in edit mode */}
            <div className="sm:col-span-2">
              <div className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-2">
                Staff Notes <span className="normal-case font-normal text-brand-smoke/60 tracking-normal">(internal only)</span>
              </div>
              {editing ? (
                <textarea
                  value={editForm.staffNotes}
                  onChange={(e) => setEditForm((f) => ({ ...f, staffNotes: e.target.value }))}
                  rows={3}
                  placeholder="Internal notes for staff..."
                  className="w-full border border-gray-300 px-4 py-3 font-sans text-[13px] text-brand-black placeholder:text-brand-smoke/40 focus:outline-none focus:border-brand-orange transition-colors resize-none"
                />
              ) : (
                <div className="border border-gray-200 px-4 py-3 font-sans text-[13px] text-brand-smoke min-h-[60px]">
                  {order.staffNotes || <span className="opacity-40 italic">No notes</span>}
                </div>
              )}
            </div>

            {/* Mailing label — shown when order has a shipping address */}
            {!editing && order.deliveryAddress && (
              <MailingLabel order={order} />
            )}

            {/* Stripe reference */}
            {order.stripePaymentId && (
              <div className="sm:col-span-2">
                <div className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-1">Stripe Payment ID</div>
                <code className="font-sans text-[12px] text-brand-smoke bg-gray-100 px-2 py-1 border border-gray-200">
                  {order.stripePaymentId}
                </code>
              </div>
            )}

            {/* Save error */}
            {saveError && (
              <div className="sm:col-span-2 bg-red-50 border border-red-200 px-4 py-3 font-sans text-[12px] text-red-600">
                Save failed: {saveError}
              </div>
            )}

          </div>
        </div>

        {/* Footer actions */}
        {editing ? (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-3 flex-shrink-0 flex-wrap">
            <button onClick={() => setEditing(false)} disabled={saving}
              className="font-sans font-extrabold text-[11px] tracking-[1px] uppercase px-5 py-2.5 border-2 border-gray-300 text-brand-smoke bg-white cursor-pointer hover:border-brand-black hover:text-brand-black transition-colors disabled:opacity-50">
              Discard
            </button>
            <button onClick={handleSaveEdit} disabled={saving}
              className="font-sans font-extrabold text-[12px] tracking-[1px] uppercase px-6 py-2.5 border-2 border-brand-black text-brand-cream cursor-pointer shadow-retro-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50"
              style={{ background: C.darkGrey }}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        ) : (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-3 flex-shrink-0 flex-wrap">
            <div className="flex gap-2 flex-wrap">
              <button onClick={onClose}
                className="font-sans font-extrabold text-[11px] tracking-[1px] uppercase px-5 py-2.5 border-2 border-gray-300 text-brand-smoke bg-white cursor-pointer hover:border-brand-black hover:text-brand-black transition-colors">
                Close
              </button>
              {canEdit && (
                <button onClick={enterEdit}
                  className="font-sans font-extrabold text-[11px] tracking-[1px] uppercase px-5 py-2.5 border-2 border-gray-400 text-brand-smoke bg-white cursor-pointer hover:border-brand-black hover:text-brand-black transition-colors">
                  Edit Details
                </button>
              )}
              {canDelete && order.status !== "cancelled" && order.status !== "delivered" && (
                <button onClick={() => { onCancel(order.id); onClose(); }}
                  className="font-sans font-extrabold text-[11px] tracking-[1px] uppercase px-5 py-2.5 border-2 border-red-300 text-red-500 bg-white cursor-pointer hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors">
                  Cancel Order
                </button>
              )}
            </div>
            <div className="flex gap-2">
              {canBackpedal && prevStatus && (
                <button onClick={() => { onBackpedal(order.id); onClose(); }}
                  className="font-sans font-extrabold text-[11px] tracking-[1px] uppercase px-5 py-2.5 border-2 border-gray-300 text-brand-smoke bg-white cursor-pointer hover:bg-gray-100 transition-colors">
                  ← Back
                </button>
              )}
              {canUpdate && nextMeta && (
                <button
                  onClick={() => { onAdvance(order.id, nextStatus); onClose(); }}
                  className="font-sans font-extrabold text-[12px] tracking-[1px] uppercase px-6 py-2.5 border-2 border-brand-black text-brand-cream cursor-pointer shadow-retro-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-2"
                  style={{ background: nextMeta.color, borderColor: C.black }}>
                  Advance → {nextMeta.label}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
