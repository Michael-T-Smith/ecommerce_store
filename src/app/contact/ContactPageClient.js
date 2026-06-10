"use client";

import { useState } from "react";
import AnnouncementBar from "@/app/components/AnnouncementBar/AnnouncementBar";
import Navbar          from "@/app/components/Navbar/Navbar";
import Footer          from "@/app/components/Footer/Footer";
import { C }           from "@/lib/brand";

const RETURN_POLICY = [
  {
    q: "What is your return window?",
    a: "We accept returns within 14 days of delivery. Items must be unused, in original condition, and packed securely for return shipping.",
  },
  {
    q: "How do I start a return?",
    a: "Email hello@company.com with your order number and a brief description of the issue. We'll reply within one business day with next steps.",
  },
  {
    q: "Are handcrafted or one-of-a-kind items returnable?",
    a: "Yes — if an item arrives damaged or isn't as described, we'll make it right. Because every piece is unique, we handle these case by case. Just reach out.",
  },
  {
    q: "Who pays for return shipping?",
    a: "If the item is defective or we made an error, we cover return shipping. For change-of-mind returns, the buyer covers return postage.",
  },
  {
    q: "When will I receive my refund?",
    a: "Once we receive and inspect the returned item, refunds are processed within 3–5 business days back to your original payment method.",
  },
  {
    q: "What if my order arrived damaged?",
    a: "Please email us a photo of the damaged item and packaging within 48 hours of delivery. We'll send a replacement or issue a full refund — your choice.",
  },
];

export default function ContactPageClient() {
  const [openIdx,  setOpenIdx ] = useState(null);
  const [sent,     setSent    ] = useState(false);
  const [sending,  setSending ] = useState(false);
  const [formErr,  setFormErr ] = useState(null);
  const [form,     setForm    ] = useState({
    name   : "",
    email  : "",
    order  : "",
    subject: "general",
    message: "",
  });

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setFormErr("Please fill in all required fields.");
      return;
    }
    setSending(true);
    setFormErr(null);
    // Simulate async send — wire to an email/API route later
    await new Promise((r) => setTimeout(r, 800));
    setSending(false);
    setSent(true);
  }

  const inputCls = "w-full border-[2px] border-brand-black/20 px-4 py-3 font-sans text-[13px] text-brand-black focus:outline-none focus:border-brand-orange transition-colors bg-white";
  const labelCls = "block font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-1.5";

  return (
    <div className="font-serif bg-brand-cream min-h-screen overflow-x-hidden">
      <AnnouncementBar />
      <Navbar />

      {/* Hero */}
      <div
        className="relative overflow-hidden"
        style={{ background: C.darkGrey }}
      >
        <div
          className="h-[5px] w-full"
          style={{
            background: `repeating-linear-gradient(90deg,
              ${C.blush} 0, ${C.blush} 28px,
              ${C.gold}   28px, ${C.gold}   34px,
              ${C.black}  34px, ${C.black}  38px)`,
          }}
        />
        <div className="max-w-[900px] mx-auto px-5 sm:px-10 py-14 sm:py-20">
          <div className="font-sans font-extrabold text-[10px] tracking-[4px] uppercase text-brand-orange mb-3">
            BityBird Co
          </div>
          <h1 className="font-serif font-black text-brand-cream text-[38px] sm:text-[52px] tracking-[-2px] leading-[1.0] mb-4">
            Contact &amp; Returns
          </h1>
          <p className="font-sans text-brand-cream/60 text-[15px] max-w-[480px] leading-relaxed">
            Questions about an order, a return, or just want to say hi?
            We&apos;re a small shop — expect a real reply, not a bot.
          </p>
        </div>
      </div>

      <main className="max-w-[1100px] mx-auto px-5 sm:px-10 lg:px-16 py-14 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-14 lg:gap-20 items-start">

          {/* LEFT — Contact form */}
          <div>
            <h2 className="font-serif font-black text-brand-black text-[26px] tracking-[-1px] mb-2">
              Send Us a Message
            </h2>
            <p className="font-sans text-brand-smoke text-[13px] mb-8 leading-relaxed">
              We typically reply within one business day. Include your order number if this is about an existing order.
            </p>

            {sent ? (
              <div className="bg-white border-[3px] border-brand-black shadow-retro-md p-8 text-center">
                <div className="text-[48px] mb-4">✉️</div>
                <h3 className="font-serif font-black text-brand-black text-[22px] tracking-[-0.5px] mb-2">
                  Message sent!
                </h3>
                <p className="font-sans text-brand-smoke text-[13px] leading-relaxed max-w-[320px] mx-auto">
                  We&apos;ll get back to you at <strong>{form.email}</strong> within one business day.
                </p>
                <button
                  onClick={() => { setSent(false); setForm({ name: "", email: "", order: "", subject: "general", message: "" }); }}
                  className="mt-6 font-sans font-extrabold text-[10px] tracking-[2px] uppercase px-5 py-2.5 border-[2px] border-brand-black text-brand-black cursor-pointer hover:bg-brand-black hover:text-brand-cream transition-all"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>Your Name *</label>
                    <input type="text" value={form.name} className={inputCls}
                      onChange={(e) => setField("name", e.target.value)}
                      placeholder="Full name" />
                  </div>
                  <div>
                    <label className={labelCls}>Email Address *</label>
                    <input type="email" value={form.email} className={inputCls}
                      onChange={(e) => setField("email", e.target.value)}
                      placeholder="you@example.com" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>Order Number <span className="font-normal normal-case tracking-normal text-brand-smoke/50">(if applicable)</span></label>
                    <input type="text" value={form.order} className={inputCls}
                      onChange={(e) => setField("order", e.target.value)}
                      placeholder="BB-2025-0001" />
                  </div>
                  <div>
                    <label className={labelCls}>Topic</label>
                    <select value={form.subject} className={`${inputCls} cursor-pointer`}
                      onChange={(e) => setField("subject", e.target.value)}>
                      <option value="general">General Question</option>
                      <option value="order">Order Status</option>
                      <option value="return">Return / Exchange</option>
                      <option value="damaged">Damaged Item</option>
                      <option value="wholesale">Wholesale Inquiry</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Message *</label>
                  <textarea value={form.message} rows={6}
                    className={`${inputCls} resize-none`}
                    onChange={(e) => setField("message", e.target.value)}
                    placeholder="Tell us what's going on…" />
                </div>

                {formErr && (
                  <div className="bg-red-50 border-2 border-red-300 px-4 py-3 font-sans text-[12px] text-red-600">
                    {formErr}
                  </div>
                )}

                <button type="submit" disabled={sending}
                  className="self-start font-sans font-extrabold text-[12px] tracking-[2px] uppercase px-8 py-3 bg-brand-orange text-brand-cream border-[3px] border-brand-black cursor-pointer shadow-retro-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3">
                  {sending ? (
                    <>
                      <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                        <path d="M12 2a10 10 0 0 1 10 10" />
                      </svg>
                      Sending…
                    </>
                  ) : "Send Message"}
                </button>
              </form>
            )}

            {/* Direct contact */}
            <div className="mt-10 pt-8 border-t border-brand-black/10">
              <h3 className="font-sans font-extrabold text-[10px] tracking-[3px] uppercase text-brand-smoke mb-4">
                Or reach us directly
              </h3>
              <div className="flex flex-col gap-3">
                <a href="mailto:hello@company.com"
                  className="flex items-center gap-3 font-sans text-[14px] text-brand-black no-underline hover:text-brand-orange transition-colors group">
                  <span className="w-9 h-9 flex items-center justify-center border-[2px] border-brand-black/20 group-hover:border-brand-orange transition-colors flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                  <span>hello@company.com</span>
                </a>
              </div>
              <p className="font-sans text-[12px] text-brand-smoke/60 mt-3 leading-relaxed">
                Mon – Fri &nbsp;·&nbsp; Usually responds within a few hours
              </p>
            </div>
          </div>

          {/* RIGHT — Returns + FAQ */}
          <div className="flex flex-col gap-10">

            {/* Return policy card */}
            <div className="bg-white border-[3px] border-brand-black shadow-retro-md overflow-hidden">
              <div
                className="h-[5px]"
                style={{
                  background: `repeating-linear-gradient(90deg,
                    ${C.blush} 0, ${C.blush} 24px,
                    ${C.gold}   24px, ${C.gold}   30px,
                    ${C.black}  30px, ${C.black}  34px)`,
                }}
              />
              <div className="px-6 py-6">
                <div className="text-[28px] mb-3">📦</div>
                <h3 className="font-serif font-black text-brand-black text-[18px] tracking-[-0.5px] mb-3">
                  Return Policy
                </h3>
                <ul className="flex flex-col gap-2">
                  {[
                    "14-day return window from delivery",
                    "Item must be unused & in original condition",
                    "Damaged on arrival? We make it right, no questions",
                    "Refunds processed within 3–5 business days",
                    "Email us first — we handle everything through email",
                  ].map((point) => (
                    <li key={point} className="flex items-start gap-2 font-sans text-[13px] text-brand-smoke leading-snug">
                      <span className="text-brand-orange mt-0.5 flex-shrink-0">✦</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* FAQ accordion */}
            <div>
              <h3 className="font-serif font-black text-brand-black text-[20px] tracking-[-0.5px] mb-5">
                Common Questions
              </h3>
              <div className="flex flex-col gap-1">
                {RETURN_POLICY.map((item, i) => (
                  <div key={i} className="bg-white border-[2px] border-brand-black/10 hover:border-brand-black/30 transition-colors overflow-hidden">
                    <button
                      onClick={() => setOpenIdx(openIdx === i ? null : i)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer bg-transparent border-none"
                    >
                      <span className="font-sans font-extrabold text-[13px] text-brand-black pr-4 leading-snug">
                        {item.q}
                      </span>
                      <span
                        className="text-brand-orange text-[18px] flex-shrink-0 transition-transform duration-200"
                        style={{ transform: openIdx === i ? "rotate(45deg)" : "rotate(0)" }}
                      >
                        +
                      </span>
                    </button>
                    {openIdx === i && (
                      <div className="px-5 pb-5">
                        <p className="font-sans text-[13px] text-brand-smoke leading-relaxed">
                          {item.a}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
