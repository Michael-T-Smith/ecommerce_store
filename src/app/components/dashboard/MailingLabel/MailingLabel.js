"use client";

import { useRef } from "react";

// BityBird Co sender info — edit as needed
const SENDER = {
  name   : "BityBird Co",
  line1  : "hello@company.com",
  line2  : "bitybirdco.com",
};

export default function MailingLabel({ order }) {
  const labelRef = useRef(null);

  function handlePrint() {
    const win = window.open("", "_blank", "width=720,height=520");
    const content = labelRef.current?.innerHTML ?? "";
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Mailing Label — ${order.orderNumber}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #fff; }
    .label {
      width: 4in; height: 6in;
      border: 3px solid #111;
      padding: 0.25in;
      display: flex;
      flex-direction: column;
      gap: 0.25in;
      margin: 0.25in auto;
    }
    .logo {
      font-size: 22px;
      font-weight: 900;
      letter-spacing: -0.5px;
      border-bottom: 2px solid #111;
      padding-bottom: 0.15in;
      text-transform: uppercase;
    }
    .logo span { font-weight: 400; font-size: 10px; letter-spacing: 3px; display: block; }
    .from-block { font-size: 10px; color: #555; line-height: 1.4; }
    .from-block strong { display: block; font-size: 11px; color: #111; }
    .to-label {
      font-size: 9px;
      font-weight: 900;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #888;
      border-top: 1px dashed #ccc;
      padding-top: 0.15in;
    }
    .to-block { font-size: 16px; font-weight: 700; line-height: 1.6; color: #111; }
    .to-block .name { font-size: 20px; font-weight: 900; }
    .order-ref {
      margin-top: auto;
      border-top: 1px solid #111;
      padding-top: 0.1in;
      font-size: 10px;
      color: #888;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .order-ref strong { font-size: 13px; color: #111; font-weight: 900; letter-spacing: 1px; }
    @media print {
      body { margin: 0; }
      .label { margin: 0; border: 3px solid #111; }
    }
  </style>
</head>
<body>
  <div class="label">
    <div class="logo">BityBird<br/><span>Co</span></div>
    <div class="from-block">
      <strong>${SENDER.name}</strong>
      ${SENDER.line1}<br/>
      ${SENDER.line2}
    </div>
    <div class="to-label">Ship To</div>
    <div class="to-block">
      <div class="name">${escapeHtml(order.customerName)}</div>
      ${escapeHtml(order.deliveryAddress ?? "").split(",").map((l) => `<div>${l.trim()}</div>`).join("")}
      ${order.customerPhone ? `<div style="font-size:13px;color:#555;margin-top:4px;">${escapeHtml(order.customerPhone)}</div>` : ""}
    </div>
    <div class="order-ref">
      <span>Order Ref</span>
      <strong>${escapeHtml(order.orderNumber)}</strong>
    </div>
  </div>
  <script>window.onload = () => { window.print(); window.close(); }<\/script>
</body>
</html>`);
    win.document.close();
  }

  if (!order.deliveryAddress) return null;

  return (
    <div className="sm:col-span-2 border-t border-gray-200 pt-5">
      <div className="flex items-center justify-between mb-4">
        <div className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke">
          Mailing Label
        </div>
        <button
          onClick={handlePrint}
          className="font-sans font-extrabold text-[10px] tracking-[1.5px] uppercase px-4 py-2 border-[2px] border-brand-black text-brand-black bg-white cursor-pointer hover:bg-brand-black hover:text-brand-cream transition-all flex items-center gap-2"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          Print Label
        </button>
      </div>

      {/* Label preview */}
      <div
        ref={labelRef}
        className="border-[3px] border-brand-black bg-white overflow-hidden"
        style={{ width: "100%", maxWidth: 360 }}
      >
        {/* Header stripe */}
        <div className="h-[5px] w-full" style={{
          background: "repeating-linear-gradient(90deg,#C08FA3 0,#C08FA3 20px,#BFA05C 20px,#BFA05C 24px,#0E0E0E 24px,#0E0E0E 26px)"
        }} />
        <div className="p-4">
          {/* From */}
          <div className="mb-3 pb-3 border-b border-brand-black/10">
            <div className="font-sans font-extrabold text-[8px] tracking-[2px] uppercase text-brand-smoke/50 mb-1">From</div>
            <div className="font-serif font-black text-brand-black text-[14px] leading-tight">{SENDER.name}</div>
            <div className="font-sans text-[11px] text-brand-smoke">{SENDER.line1}</div>
            <div className="font-sans text-[11px] text-brand-smoke">{SENDER.line2}</div>
          </div>

          {/* To */}
          <div className="mb-3">
            <div className="font-sans font-extrabold text-[8px] tracking-[2px] uppercase text-brand-smoke/50 mb-1">Ship To</div>
            <div className="font-serif font-black text-brand-black text-[18px] leading-tight mb-1">
              {order.customerName}
            </div>
            <div className="font-sans text-[12px] text-brand-black leading-relaxed">
              {(order.deliveryAddress ?? "").split(",").map((part, i) => (
                <span key={i} className="block">{part.trim()}</span>
              ))}
            </div>
            {order.customerPhone && (
              <div className="font-sans text-[11px] text-brand-smoke mt-1">{order.customerPhone}</div>
            )}
          </div>

          {/* Order ref */}
          <div className="border-t border-brand-black/20 pt-2 flex items-center justify-between">
            <span className="font-sans text-[9px] tracking-[1px] uppercase text-brand-smoke/50">Ref</span>
            <span className="font-sans font-extrabold text-[11px] tracking-[1.5px] text-brand-black">{order.orderNumber}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
