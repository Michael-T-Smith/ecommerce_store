
"use client";

import { useState }              from "react";
import { CATALOG, CATALOG_CATEGORIES } from "@/lib/data";
import { B }                     from "@/lib/brand";
import FlowerMark                from "@/app/components/icons/FlowerMark";

export default function CatalogSection({ onAddToCart }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [hovered,        setHovered       ] = useState(null);

  const filtered =
    activeCategory === "All"
      ? CATALOG
      : CATALOG.filter((item) => item.category === activeCategory);

  return (
    <section className="px-5 sm:px-10 lg:px-16 py-16 sm:py-20 lg:py-24 bg-brand-cream border-t-[3px] border-brand-black/10">

      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8 sm:mb-12">
        <div>
          <div className="flex items-center gap-2 font-sans text-[10px] font-extrabold tracking-[4px] text-brand-orange uppercase mb-3">
            <FlowerMark size={16} fill={B.orange} stroke={B.orange} />
            Browse the Shop
          </div>
          <h2 className="font-serif text-[38px] sm:text-[48px] lg:text-[52px] font-black text-brand-black tracking-[-2px] leading-[1.05] m-0">
            Our Collection
          </h2>
        </div>
        <p className="font-sans text-brand-smoke text-[13px] sm:text-[14px] leading-relaxed max-w-[320px] self-start sm:self-auto sm:text-right">
          Every arrangement made fresh.<br className="hidden sm:block" />
          Cut to order at our Piedmont studio.
        </p>
      </div>

      {/* Category filter pills */}
      <div className="flex gap-2 sm:gap-3 flex-wrap mb-8 sm:mb-12">
        {CATALOG_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`font-sans font-extrabold text-[10px] sm:text-[11px] tracking-[2px] uppercase px-4 sm:px-5 py-2 border-2 cursor-pointer transition-all duration-150 ${
              activeCategory === cat
                ? "bg-brand-orange text-brand-cream border-brand-orange shadow-retro-sm"
                : "bg-transparent text-brand-smoke border-brand-smoke hover:border-brand-orange hover:text-brand-orange"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Item count */}
      <p className="font-sans text-[11px] text-brand-smoke tracking-[2px] uppercase mb-6">
        {filtered.length} item{filtered.length !== 1 ? "s" : ""}
        {activeCategory !== "All" && ` in ${activeCategory}`}
      </p>

      {/* Catalog grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filtered.map((item, i) => (
          <div
            key={item.id}
            onMouseEnter={() => setHovered(item.id)}
            onMouseLeave={() => setHovered(null)}
            className={`bg-brand-cream border-[3px] border-brand-black overflow-hidden cursor-pointer transition-all duration-[180ms] ${
              hovered === item.id ? "-translate-y-1.5 shadow-retro-xl" : "shadow-retro-sm"
            }`}
          >
            {/* Image zone */}
            <div
              className="h-[180px] sm:h-[200px] flex items-center justify-center relative overflow-hidden bg-brand-smoke/10"
            >
              <div
                className="absolute inset-0"
                style={{
                  background: `repeating-linear-gradient(-55deg,
                    transparent 0, transparent 20px,
                    rgba(0,0,0,0.03) 20px, rgba(0,0,0,0.03) 22px)`,
                }}
              />
              <span className="text-[64px] sm:text-[72px] z-[1] leading-none">{item.emoji}</span>

              {/* Tag badge */}
              {item.tag && (
                <div className="absolute top-3 left-0 bg-brand-black text-brand-cream font-sans font-extrabold text-[9px] tracking-[2px] uppercase px-3 py-1 border-r-[3px] border-brand-orange">
                  {item.tag}
                </div>
              )}

              {/* Category pill — bottom right */}
              <div className="absolute bottom-3 right-3 bg-brand-cream/90 text-brand-smoke font-sans font-extrabold text-[8px] tracking-[1.5px] uppercase px-2 py-1 border border-brand-smoke/30">
                {item.category}
              </div>
            </div>

            {/* Card info */}
            <div className="p-4">
              <div className="font-serif text-[15px] sm:text-[16px] font-bold text-brand-black mb-3 leading-tight">
                {item.name}
              </div>
              <div className="flex justify-between items-center">
                <span className="font-sans font-black text-[18px] sm:text-[20px] text-brand-orange">
                  {item.price}
                </span>
                <button
                  onClick={() => onAddToCart()}
                  className="bg-brand-black text-brand-cream border-none px-3 sm:px-4 py-2 font-sans font-extrabold text-[9px] sm:text-[10px] tracking-[2px] uppercase cursor-pointer hover:bg-brand-orange transition-colors duration-150"
                >
                  + Bag
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-12 sm:mt-16 flex justify-center">
        <button className="bg-brand-orange text-brand-cream border-[3px] border-brand-black px-10 py-4 font-sans font-black text-[12px] sm:text-[13px] tracking-[2px] uppercase cursor-pointer shadow-retro-md transition-all duration-100 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-retro-sm">
          View Full Inventory →
        </button>
      </div>
    </section>
  );
}