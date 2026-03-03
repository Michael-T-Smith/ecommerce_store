
import { B } from "@/lib/brand";

const PILLARS = [
  {
    icon : (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={B.cream} strokeWidth="2" strokeLinecap="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    headline: "No Third-Party Couriers",
    sub     : "Every delivery is made by our own team.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={B.cream} strokeWidth="2" strokeLinecap="round">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <path d="M16 8l4 2v5h-4V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    headline: "Same-Day Available",
    sub     : "Order before cutoff, delivered today.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={B.cream} strokeWidth="2" strokeLinecap="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    headline: "Handwritten Note Included",
    sub     : "Every order, no exceptions.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={B.cream} strokeWidth="2" strokeLinecap="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    headline: "Safe Drop Guaranteed",
    sub     : "We never leave flowers in direct sun.",
  },
];

export default function DeliveryPolicy() {
  return (
    <section className="bg-brand-orange border-t-[3px] border-brand-black border-b-[3px] px-5 sm:px-10 lg:px-16 py-10 sm:py-12 relative overflow-hidden">

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `repeating-linear-gradient(-55deg,
            transparent 0, transparent 48px,
            rgba(0,0,0,0.08) 48px, rgba(0,0,0,0.08) 54px)`,
        }}
      />

      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {PILLARS.map((p, i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="w-10 h-10 bg-brand-black/20 border-2 border-brand-cream/30 flex items-center justify-center flex-shrink-0">
              {p.icon}
            </div>
            <div>
              <div className="font-serif font-black text-brand-cream text-[15px] sm:text-[17px] leading-tight mb-1">
                {p.headline}
              </div>
              <div className="font-sans text-[11px] sm:text-[12px] text-brand-cream/75 leading-relaxed">
                {p.sub}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

