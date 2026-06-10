
"use client";

import { useState } from "react";
import { C }        from "@/lib/brand";

const FAQS = [
  {
    q: "What's the latest I can order for same-day delivery?",
    a: "Piedmont orders must be placed by 1:00 PM. Anniston by 11:00 AM. Centre by 10:00 AM. Orders placed after cutoff are automatically scheduled for next-day delivery — you'll see the estimated date at checkout.",
  },
  {
    q: "Do you deliver on weekends?",
    a: "Yes on Saturdays, with earlier cutoffs across all zones. We are closed Sundays — no deliveries or pickups. Holiday weekends may have adjusted hours; check the announcement bar at the top of the site for any changes.",
  },
  {
    q: "What happens if nobody is home when you deliver?",
    a: "Our drivers will leave your order in a safe, sheltered spot at the door and send a delivery photo. If there's no safe location, we'll call the recipient and arrange a second attempt at no extra charge.",
  },
  {
    q: "Can I schedule a delivery for a specific time?",
    a: "We offer morning (9AM–12PM) and afternoon (12PM–5PM) delivery windows. Specific time requests (e.g. 'before 10am') can be added in the order notes and we'll do our best to accommodate, but they are not guaranteed.",
  },
  {
    q: "Can I include a personal note with my order?",
    a: "Every order includes a handwritten note at no extra cost. You'll enter your message during checkout. We handwrite it on our branded notecard before your order leaves.",
  },
  {
    q: "What if my order arrives damaged?",
    a: "That has never happened and we intend to keep it that way — but if it ever does, reach out immediately. We will replace your item same-day or next-day at no charge. No photos required, no questions asked.",
  },
  {
    q: "Do you deliver outside Piedmont, Anniston, and Centre?",
    a: "Not currently for standard orders. For large or custom orders outside our standard zones, contact us directly — we handle those on a case-by-case basis and will always find a way to make it work.",
  },
];

export default function DeliveryFAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="bg-brand-black border-t-[6px] border-brand-orange px-5 sm:px-10 lg:px-16 py-16 sm:py-24 relative overflow-hidden">

      {/* Stripe wallpaper */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `repeating-linear-gradient(-55deg,
            transparent 0, transparent 60px,
            rgba(212,81,26,0.05) 60px, rgba(212,81,26,0.05) 70px)`,
        }}
      />

      <div className="relative z-10 max-w-[760px]">

        <div className="font-sans text-[10px] font-extrabold tracking-[4px] uppercase text-brand-orange mb-4">
          ✦ Got Questions
        </div>
        <h2 className="font-serif font-black text-brand-cream text-[36px] sm:text-[44px] tracking-[-2px] leading-[1.05] mb-10 sm:mb-14">
          Delivery FAQ
        </h2>

        <div className="flex flex-col gap-0">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="border-b-[2px] border-brand-cream/10 last:border-b-0"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full text-left py-5 flex items-start justify-between gap-6 cursor-pointer bg-transparent border-none group"
                >
                  <span className={`font-serif font-black text-[16px] sm:text-[18px] tracking-[-0.3px] leading-snug transition-colors duration-150 ${
                    isOpen ? "text-brand-orange" : "text-brand-cream group-hover:text-brand-orange"
                  }`}>
                    {faq.q}
                  </span>

                  {/* +/× toggle */}
                  <div
                    className={`w-7 h-7 flex-shrink-0 border-2 flex items-center justify-center transition-all duration-200 mt-0.5 ${
                      isOpen
                        ? "bg-brand-orange border-brand-orange rotate-45"
                        : "bg-transparent border-brand-cream/30 rotate-0 group-hover:border-brand-orange"
                    }`}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <line x1="6" y1="1" x2="6" y2="11" stroke={isOpen ? C.cream : C.cream} strokeWidth="2" strokeLinecap="round" />
                      <line x1="1" y1="6" x2="11" y2="6" stroke={isOpen ? C.cream : C.cream} strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                </button>

                {isOpen && (
                  <div className="pb-6 pr-10">
                    <p className="font-sans text-brand-smoke text-[13px] sm:text-[14px] leading-[1.8]">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}