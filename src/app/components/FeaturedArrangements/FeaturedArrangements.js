"use client";

import { useState }        from "react";
import Link                from "next/link";
import { useCart }         from "@/app/CartContext";
import { B }               from "@/lib/brand";
import FlowerMark          from "@/app/components/icons/FlowerMark";
import ProductCardActions  from "@/app/components/ProductCardActions/ProductCardActions";

export default function FeaturedArrangements({ items = [] }) {
  const { addItem, items: cartItems } = useCart();
  const [pickerOpen, setPickerOpen] = useState({});

  const togglePicker = (id) =>
    setPickerOpen((p) => ({ ...p, [id]: !p[id] }));

  const totalQtyFor = (id) =>
    cartItems.filter((c) => c.id === id).reduce((s, c) => s + c.qty, 0);

  const qtyForSize = (id, size) =>
    cartItems.find((c) => c.id === id && c.size === size)?.qty ?? 0;

  // Fallback if no items are featured yet
  if (items.length === 0) {
    return (
      <section className="px-5 sm:px-10 lg:px-16 py-20 sm:py-28 bg-brand-cream">
        <div className="max-w-[1200px] mx-auto text-center py-16">
          <div className="text-[56px] mb-4">🌸</div>
          <p className="font-sans text-brand-smoke text-[14px] leading-relaxed">
            No featured arrangements set. An admin can mark up to 3 items as
            featured from the{" "}
            <a href="/dashboard/inventory"
              className="text-brand-orange font-extrabold no-underline hover:underline">
              inventory dashboard
            </a>.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-5 sm:px-10 lg:px-16 py-20 sm:py-28 bg-brand-cream">

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 max-w-[1200px] mx-auto">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FlowerMark size={16} fill={B.orange} stroke={B.orange} />
            <span className="font-sans font-extrabold text-[10px] tracking-[4px] uppercase text-brand-orange">
              This Week&apos;s Picks
            </span>
          </div>
          <h2 className="font-serif font-black text-brand-black text-[36px] sm:text-[52px] tracking-[-2px] leading-[1.05] m-0">
            Featured<br className="sm:hidden" /> Arrangements
          </h2>
        </div>
        <Link
          href="/shop"
          className="font-sans font-extrabold text-[11px] tracking-[2px] uppercase text-brand-black no-underline border-b-[3px] border-brand-orange pb-0.5 hover:text-brand-orange transition-colors self-start sm:self-auto mb-1"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1200px] mx-auto">
        {items.map((item) => {
          const multiSize = item.sizes?.length > 1;
          const isOpen    = !!pickerOpen[item.id];
          const totalQty  = totalQtyFor(item.id);
          const inCart    = totalQty > 0;
          const accent    = item.featuredAccent || B.orange;

          return (
            <div
              key={item.id}
              className="bg-brand-cream border-[3px] border-brand-black overflow-hidden group hover:-translate-y-2 hover:shadow-retro-xl shadow-retro-sm transition-all duration-[180ms]"
            >
              {/* Hero image zone */}
              <div
                className="h-[260px] sm:h-[300px] flex items-center justify-center relative overflow-hidden"
                style={{ background: accent }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: `repeating-linear-gradient(-55deg,
                      transparent 0, transparent 24px,
                      rgba(255,255,255,0.07) 24px, rgba(255,255,255,0.07) 28px)`,
                  }}
                />
                <span className="text-[88px] z-[1] leading-none transition-transform duration-200 group-hover:scale-110">
                  {item.emoji}
                </span>

                {inCart && (
                  <div className="absolute top-4 left-0 bg-brand-orange text-brand-cream font-sans font-extrabold text-[10px] tracking-[2px] uppercase px-4 py-1.5 border-r-[3px] border-brand-black z-[2] flex items-center gap-2">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    In Bag · {totalQty}
                  </div>
                )}
                {item.tag && !inCart && (
                  <div className="absolute top-4 left-0 bg-brand-black text-brand-cream font-sans font-extrabold text-[10px] tracking-[2px] uppercase px-4 py-1.5 border-r-[3px] border-brand-orange z-[2]">
                    {item.tag}
                  </div>
                )}
              </div>

              {/* Card body */}
              <div className="p-6">
                <div className="font-serif text-[18px] font-bold text-brand-black leading-tight mb-2">
                  {item.name}
                </div>
                {item.description && (
                  <p className="font-sans text-[12px] text-brand-smoke leading-relaxed mb-4 line-clamp-2">
                    {item.description}
                  </p>
                )}

                {/* Size picker */}
                {isOpen && multiSize && item.inStock && (
                  <div className="mb-4 pt-3 border-t border-brand-black/10 flex flex-wrap gap-2">
                    <span className="font-sans text-[9px] font-extrabold tracking-[1px] uppercase text-brand-smoke w-full mb-0.5">
                      {inCart ? "Add size:" : "Select size:"}
                    </span>
                    {item.sizes.map((size) => {
                      const sizeQty = qtyForSize(item.id, size);
                      return (
                        <button
                          key={size}
                          onClick={() => addItem(item, size)}
                          className={`font-sans text-[10px] font-extrabold tracking-[1px] uppercase px-3 py-2 border-[2px] cursor-pointer transition-colors ${
                            sizeQty > 0
                              ? "border-brand-orange bg-brand-orange text-brand-cream hover:bg-brand-black hover:border-brand-black"
                              : "border-brand-black bg-brand-cream text-brand-black hover:bg-brand-black hover:text-brand-cream"
                          }`}
                        >
                          {size}{sizeQty > 0 ? ` ×${sizeQty}` : ""}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <span className="font-sans font-black text-[24px] text-brand-orange">
                    {item.prices?.length > 1 ? "from " : ""}${item.prices?.[0] ?? item.price ?? 0}
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/shop/${item.id}`}
                      className="font-sans font-extrabold text-[10px] tracking-[1.5px] uppercase text-brand-black border-[2px] border-brand-black px-4 py-2.5 no-underline hover:bg-brand-black hover:text-brand-cream transition-colors"
                    >
                      View
                    </Link>
                    {item.inStock ? (
                      <ProductCardActions
                        product={item}
                        isPickerOpen={isOpen}
                        onTogglePicker={() => togglePicker(item.id)}
                      />
                    ) : (
                      <span className="font-sans font-extrabold text-[10px] tracking-[1.5px] uppercase text-brand-smoke/50 border-[2px] border-brand-smoke/20 px-4 py-2.5">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}