
"use client";

import Link      from "next/link";
import { B }     from "@/lib/brand";
import FlowerMark from "@/app/components/icons/FlowerMark";

export default function OccasionCard({
  occasion,
  catalogItems,
  isOpen,
  onToggle,
  onAddToCart,
}) {
  return (
    <div
      className={`border-[3px] border-brand-black overflow-hidden transition-all duration-300 ${
        isOpen ? "shadow-retro-lg" : "shadow-retro-sm hover:-translate-y-1 hover:shadow-retro-md"
      }`}
    >
      {/* ── CARD HEADER — always visible ── */}
      <button
        onClick={onToggle}
        className="w-full text-left cursor-pointer border-none p-0 block"
        aria-expanded={isOpen}
      >
        <div
          className="relative overflow-hidden px-6 sm:px-10 py-8 sm:py-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 transition-all duration-300"
          style={{ background: occasion.accentColor }}
        >
          {/* Diagonal stripe texture */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `repeating-linear-gradient(-55deg,
                transparent 0px, transparent 40px,
                rgba(0,0,0,0.08) 40px, rgba(0,0,0,0.08) 48px,
                transparent 48px, transparent 56px,
                rgba(0,0,0,0.04) 56px, rgba(0,0,0,0.04) 60px)`,
            }}
          />

          {/* Left: Emoji + copy */}
          <div className="relative z-10 flex-1">
            <div className="text-[48px] sm:text-[56px] leading-none mb-4">
              {occasion.emoji}
            </div>

            <div className="font-sans text-[10px] font-extrabold tracking-[3px] uppercase text-brand-cream/70 mb-2">
              {occasion.label}
            </div>

            <h2 className="font-serif font-black text-brand-cream text-[28px] sm:text-[36px] lg:text-[42px] tracking-[-1.5px] leading-[1.05] mb-2">
              {occasion.headline}
            </h2>

            <p className="font-sans text-brand-cream/80 text-[13px] sm:text-[14px] leading-relaxed mb-5 max-w-[440px]">
              {occasion.subheadline}
            </p>

            {/* Mood tags */}
            <div className="flex gap-2 flex-wrap">
              {occasion.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-brand-cream/15 text-brand-cream font-sans font-extrabold text-[9px] tracking-[2px] uppercase px-3 py-1.5 border border-brand-cream/30"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Expand toggle + product count */}
          <div className="relative z-10 flex sm:flex-col items-center sm:items-end gap-4 sm:gap-3 flex-shrink-0">

            {/* Product count badge */}
            <div className="flex items-center gap-2 bg-brand-cream/15 border border-brand-cream/30 px-4 py-2">
              <FlowerMark size={14} fill={B.cream} stroke={B.cream} />
              <span className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-cream">
                {catalogItems.length} Arrangements
              </span>
            </div>

            {/* Expand / collapse indicator */}
            <div
              className={`w-10 h-10 bg-brand-cream border-[2px] border-brand-cream flex items-center justify-center transition-transform duration-300 flex-shrink-0 ${
                isOpen ? "rotate-45" : "rotate-0"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <line x1="8" y1="2" x2="8" y2="14" stroke={B.black} strokeWidth="2.5" strokeLinecap="round" />
                <line x1="2" y1="8" x2="14" y2="8" stroke={B.black} strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      </button>

      {/* ── EXPANDED PANEL — product recommendations ── */}
      {isOpen && (
        <div className="bg-brand-cream border-t-[3px] border-brand-black">

          {/* Emotional body copy */}
          <div className="px-6 sm:px-10 py-6 border-b-[2px] border-brand-black/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="font-sans text-brand-smoke text-[13px] sm:text-[14px] leading-relaxed max-w-[540px]">
              {occasion.bodyCopy}
            </p>
            <Link
              href={`/shop?occasion=${occasion.id}`}
              className="font-sans font-extrabold text-[11px] tracking-[2px] uppercase text-brand-black no-underline border-b-[3px] pb-0.5 whitespace-nowrap self-start sm:self-auto flex-shrink-0"
              style={{ borderBottomColor: occasion.accentColor }}
            >
              Shop All {occasion.label} →
            </Link>
          </div>

          {/* Curated product cards — horizontal scroll on mobile */}
          <div className="px-6 sm:px-10 py-6">
            <div className="font-sans text-[10px] font-extrabold tracking-[3px] uppercase mb-5"
              style={{ color: occasion.accentColor }}>
              ✦ Recommended for {occasion.label}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {catalogItems.map((item) => (
                <OccasionProductCard
                  key={item.id}
                  item={item}
                  accentColor={occasion.accentColor}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Inline sub-component — small product card inside the expanded panel
function OccasionProductCard({ item, accentColor, onAddToCart }) {
  return (
    <div className="border-[2px] border-brand-black bg-brand-cream overflow-hidden shadow-retro-sm hover:-translate-y-1 hover:shadow-retro-md transition-all duration-150">
      {/* Mini image zone */}
      <div
        className="h-[120px] sm:h-[140px] flex items-center justify-center relative overflow-hidden"
        style={{ background: item.inStock ? "#F0E8DE" : "#E8E4DE" }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `repeating-linear-gradient(-55deg,
              transparent 0, transparent 18px,
              rgba(0,0,0,0.03) 18px, rgba(0,0,0,0.03) 20px)`,
          }}
        />
        <span className={`text-[48px] sm:text-[52px] z-[1] leading-none ${!item.inStock ? "opacity-40 grayscale" : ""}`}>
          {item.emoji}
        </span>
        {!item.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-brand-cream/60 z-[2]">
            <span className="bg-brand-smoke text-brand-cream font-sans font-extrabold text-[8px] tracking-[1.5px] uppercase px-2 py-1">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="font-serif text-[13px] font-bold text-brand-black leading-tight mb-2">
          {item.name}
        </div>
        <div className="flex items-center justify-between gap-1">
          <span className="font-sans font-black text-[16px]" style={{ color: accentColor }}>
            ${item.price}
          </span>
          <div className="flex gap-1">
            <Link
              href={`/shop/${item.id}`}
              className="bg-transparent text-brand-black border-[2px] border-brand-black px-2 py-1.5 font-sans font-extrabold text-[8px] tracking-[1px] uppercase no-underline hover:bg-brand-black hover:text-brand-cream transition-colors"
            >
              View
            </Link>
            <button
              onClick={() => item.inStock && onAddToCart(item)}
              disabled={!item.inStock}
              className={`border-none px-2 py-1.5 font-sans font-extrabold text-[8px] tracking-[1px] uppercase transition-colors ${
                item.inStock
                  ? "bg-brand-black text-brand-cream cursor-pointer hover:opacity-80"
                  : "bg-brand-smoke/30 text-brand-smoke/60 cursor-not-allowed"
              }`}
              style={item.inStock ? { '--hover-bg': accentColor } : {}}
            >
              + Bag
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
