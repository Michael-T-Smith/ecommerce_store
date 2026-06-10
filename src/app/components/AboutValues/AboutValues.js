
import { C } from "@/lib/brand";

const VALUES = [
  {
    number  : "01",
    headline: "Made to Last. Every Piece.",
    body    : "We don't carry mass-produced goods. Every item is either handcrafted or carefully restored — which is exactly why each one holds up.",
    accent  : C.blush,
  },
  {
    number  : "02",
    headline: "Made by Hand. Always.",
    body    : "No assembly line. No duplicates. Every handcrafted piece is a genuine creative decision and every refurbished find is chosen by hand — not picked from a catalog.",
    accent  : C.gold,
  },
  {
    number  : "03",
    headline: "One of a Kind. Always.",
    body    : "When it's gone, it's gone. We source refurbished and handcrafted goods that can't be reordered off a shelf — so what you buy is truly yours alone.",
    accent  : C.darkGrey,
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
            rgba(192,143,163,0.07) 60px, rgba(192,143,163,0.07) 70px)`,
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
              <div className="h-[3px] w-2" style={{ background: C.gold }} />
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
