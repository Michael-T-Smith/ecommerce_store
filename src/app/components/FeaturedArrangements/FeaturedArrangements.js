
"use client";

import { useState }  from "react";
import { FEATURED }  from "@/lib/data";
import { B }         from "@/lib/brand";
import FlowerMark    from "@/app/components/icons/FlowerMark";

export default function FeaturedArrangements({ onAddToCart }) {
  const [hovered, setHovered] = useState(null);

  return (
    <section className="px-5 sm:px-10 lg:px-16 py-16 sm:py-20 lg:py-24 bg-brand-cream">

      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-10 sm:mb-[52px]">
        <div>
          <div className="flex items-center gap-2 font-sans text-[10px] font-extrabold tracking-[4px] text-brand-orange uppercase mb-3">
            <FlowerMark size={16} fill={B.orange} stroke={B.orange} />
            This Week&apos;s Picks
          </div>
          <h2 className="font-serif text-[38px] sm:text-[48px] lg:text-[52px] font-black text-brand-black tracking-[-2px] leading-[1.05] m-0">
            Featured<br />Arrangements
          </h2>
        </div>
        <a
          href="#"
          className="font-sans font-extrabold text-[12px] tracking-[2px] text-brand-black no-underline border-b-[3px] border-brand-orange pb-0.5 uppercase self-start sm:self-auto"
        >
          View All →
        </a>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
        {FEATURED.map((item, i) => (
          <div
            key={item.name}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            className={`bg-brand-cream border-[3px] border-brand-black overflow-hidden cursor-pointer transition-all duration-[180ms] ${
              hovered === i ? "-translate-y-2 shadow-retro-xl" : "shadow-retro-md"
            }`}
          >
            <div
              className="h-[220px] sm:h-[260px] lg:h-[280px] flex items-center justify-center relative overflow-hidden"
              style={{ background: item.accent }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: `repeating-linear-gradient(-55deg,
                    transparent 0, transparent 24px,
                    rgba(255,255,255,0.07) 24px, rgba(255,255,255,0.07) 28px)`,
                }}
              />
              <span className="text-[72px] sm:text-[88px] z-[1] leading-none">{item.emoji}</span>
              <div className="absolute top-4 left-0 bg-brand-black text-brand-cream font-sans font-extrabold text-[9px] sm:text-[10px] tracking-[2px] uppercase px-3 py-1.5 border-r-[3px] border-brand-orange">
                {item.tag}
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="font-serif text-base sm:text-lg font-bold text-brand-black mb-3">
                {item.name}
              </div>
              <div className="flex justify-between items-center">
                <span className="font-sans font-black text-[20px] sm:text-[24px] text-brand-orange">
                  {item.price}
                </span>
                <button
                  onClick={() => onAddToCart()}
                  className="bg-brand-black text-brand-cream border-none px-4 sm:px-5 py-2 sm:py-2.5 font-sans font-extrabold text-[10px] sm:text-[11px] tracking-[2px] uppercase cursor-pointer"
                >
                  Add to Bag
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}