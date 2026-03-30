
import { B } from "@/lib/brand";

const VALUES = [
  {
    number  : "01",
    headline: "Cut Fresh. Every Day.",
    body    : "We don't keep flowers sitting in a cooler waiting for a sale. Every arrangement is built the day it leaves our studio — which is why they last.",
    accent  : B.orange,
  },
  {
    number  : "02",
    headline: "Made by Hand. Always.",
    body    : "No assembly line. No template. Cecilia designs every arrangement herself, which means what you receive is a genuine creative decision — not a product number.",
    accent  : B.gold,
  },
  {
    number  : "03",
    headline: "Local, and Proud of It.",
    body    : "We source from local growers whenever the season allows. Piedmont money staying in Piedmont — that matters to us as much as it does to you.",
    accent  : B.bark,
  },
];

export default function AboutValues() {
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

      {/* Section label */}
      <div className="relative z-10 font-sans text-[10px] font-extrabold tracking-[4px] uppercase text-brand-orange mb-10 sm:mb-14">
        ✦ What We Believe
      </div>

      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
        {VALUES.map((v) => (
          <div
            key={v.number}
            className="border-[3px] border-brand-cream/10 p-6 sm:p-8 hover:border-brand-orange transition-colors duration-200 group"
          >
            {/* Large number */}
            <div
              className="font-serif font-black text-[64px] sm:text-[72px] leading-none tracking-[-3px] mb-6 transition-colors duration-200"
              style={{ color: v.accent }}
            >
              {v.number}
            </div>

            {/* Divider stripe */}
            <div className="flex gap-[3px] mb-6">
              <div className="h-[3px] w-8 bg-brand-orange" />
              <div className="h-[3px] w-2" style={{ background: B.gold }} />
              <div className="h-[3px] flex-1 bg-brand-cream/10" />
            </div>

            <h3 className="font-serif font-black text-brand-cream text-[20px] sm:text-[22px] tracking-[-0.5px] leading-[1.15] mb-4">
              {v.headline}
            </h3>
            <p className="font-sans text-brand-smoke text-[13px] sm:text-[14px] leading-[1.8]">
              {v.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
