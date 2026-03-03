
"use client";

import { useState } from "react";
import Link         from "next/link";

export default function ShopGrid({ items, onAddToCart }) {
  const [hovered, setHovered] = useState(null);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-5 text-center">
        <div className="text-[72px] mb-6">🌾</div>
        <h3 className="font-serif font-black text-brand-black text-[28px] tracking-[-1px] mb-3">
          Nothing found
        </h3>
        <p className="font-sans text-brand-smoke text-[14px] leading-relaxed max-w-[320px]">
          Try adjusting your filters or search term. Our inventory changes weekly.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {items.map((item) => (
        <div
          key={item.id}
          onMouseEnter={() => setHovered(item.id)}
          onMouseLeave={() => setHovered(null)}
          className={`bg-brand-cream border-[3px] overflow-hidden transition-all duration-[180ms] ${
            item.inStock ? "border-brand-black" : "border-brand-smoke/40"
          } ${
            hovered === item.id && item.inStock
              ? "-translate-y-2 shadow-retro-xl"
              : "shadow-retro-sm"
          }`}
        >
          {/* Image zone */}
          <div
            className="h-[200px] sm:h-[220px] flex items-center justify-center relative overflow-hidden"
            style={{ background: item.inStock ? "#F0E8DE" : "#E8E4DE" }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: `repeating-linear-gradient(-55deg,
                  transparent 0, transparent 20px,
                  rgba(0,0,0,0.03) 20px, rgba(0,0,0,0.03) 22px)`,
              }}
            />
            <span
              className={`text-[72px] z-[1] leading-none transition-transform duration-200 ${
                hovered === item.id ? "scale-110" : "scale-100"
              } ${!item.inStock ? "opacity-40 grayscale" : ""}`}
            >
              {item.emoji}
            </span>

            {/* Tag badge */}
            {item.tag && item.inStock && (
              <div className="absolute top-3 left-0 bg-brand-black text-brand-cream font-sans font-extrabold text-[9px] tracking-[2px] uppercase px-3 py-1 border-r-[3px] border-brand-orange">
                {item.tag}
              </div>
            )}

            {/* Out of stock overlay */}
            {!item.inStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-brand-cream/60 z-[2]">
                <span className="bg-brand-smoke text-brand-cream font-sans font-extrabold text-[10px] tracking-[2px] uppercase px-4 py-2 border-2 border-brand-smoke">
                  Out of Stock
                </span>
              </div>
            )}

            {/* Category label */}
            <div className="absolute bottom-2 right-2 bg-brand-cream/90 text-brand-smoke font-sans font-extrabold text-[8px] tracking-[1.5px] uppercase px-2 py-1 border border-brand-smoke/30 z-[3]">
              {item.category}
            </div>
          </div>

          {/* Card body */}
          <div className="p-4">
            <div className="font-serif text-[15px] sm:text-[16px] font-bold text-brand-black leading-tight mb-1.5">
              {item.name}
            </div>

            {/* Size chips */}
            {item.sizes?.length > 0 && (
              <div className="flex gap-1 mb-3 flex-wrap">
                {item.sizes.map((size) => (
                  <span
                    key={size}
                    className="font-sans text-[8px] font-extrabold tracking-[1px] uppercase text-brand-smoke border border-brand-smoke/40 px-1.5 py-0.5"
                  >
                    {size}
                  </span>
                ))}
              </div>
            )}

            {/* Description preview */}
            <p className="font-sans text-[11px] text-brand-smoke leading-relaxed mb-4 line-clamp-2">
              {item.description}
            </p>

            <div className="flex justify-between items-center gap-2">
              <span className="font-sans font-black text-[20px] text-brand-orange">
                ${item.price}
              </span>
              <div className="flex gap-2">
                <Link
                  href={`/shop/${item.id}`}
                  className="bg-transparent text-brand-black border-[2px] border-brand-black px-3 py-2 font-sans font-extrabold text-[9px] tracking-[1.5px] uppercase no-underline hover:bg-brand-black hover:text-brand-cream transition-colors duration-150"
                >
                  View
                </Link>
                <button
                  onClick={() => item.inStock && onAddToCart(item)}
                  disabled={!item.inStock}
                  className={`border-none px-3 py-2 font-sans font-extrabold text-[9px] tracking-[1.5px] uppercase transition-colors duration-150 ${
                    item.inStock
                      ? "bg-brand-black text-brand-cream cursor-pointer hover:bg-brand-orange"
                      : "bg-brand-smoke/30 text-brand-smoke/60 cursor-not-allowed"
                  }`}
                >
                  + Bag
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}