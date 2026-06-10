"use client";

import { useState }       from "react";
import Link               from "next/link";
import { useCart }        from "@/app/CartContext";
import { C }              from "@/lib/brand";
import BirdLogo         from "@/app/components/icons/BirdLogo";
import ProductCardActions from "@/app/components/ProductCardActions/ProductCardActions";
import Image from "next/image";

export default function CatalogSection({ items = [] }) {
  const { addItem, items: cartItems } = useCart();
  const [pickerOpen, setPickerOpen] = useState({});

  const togglePicker = (id) =>
    setPickerOpen((p) => ({ ...p, [id]: !p[id] }));

  const totalQtyFor = (id) =>
    cartItems.filter((c) => c.id === id).reduce((s, c) => s + c.qty, 0);

  const qtyForSize = (id, size) =>
    cartItems.find((c) => c.id === id && c.size === size)?.qty ?? 0;

  return (
    <section className="py-20 sm:py-28 bg-white border-t-[3px] border-brand-black overflow-hidden">

      <div className="px-5 sm:px-10 lg:px-16 mb-10 max-w-[1200px] mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BirdLogo size={16} color={C.blush} />
            <span className="font-sans font-extrabold text-[10px] tracking-[4px] uppercase text-brand-orange">
              Fresh This Season
            </span>
          </div>
          <h2 className="font-serif font-black text-brand-black text-[34px] sm:text-[48px] tracking-[-2px] leading-[1.05] m-0">
            Shop the Collection
          </h2>
        </div>
        <Link
          href="/shop"
          className="font-sans font-black text-[11px] tracking-[2px] uppercase bg-brand-black text-brand-cream border-[3px] border-brand-black px-6 py-3 no-underline shadow-retro-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all self-start sm:self-auto"
        >
          View Full Collection →
        </Link>
      </div>

      <div className="px-5 sm:px-10 lg:px-16 mb-10 max-w-[1200px] mx-auto">
        <div
          className="h-[4px] w-32"
          style={{
            background: `repeating-linear-gradient(90deg,
              ${C.gold} 0, ${C.gold} 16px,
              ${C.black} 16px, ${C.black} 20px)`,
          }}
        />
      </div>

      {items.length === 0 ? (
        <div className="px-5 sm:px-10 lg:px-16 max-w-[1200px] mx-auto py-16 text-center">
          <div className="text-[56px] mb-4">🌾</div>
          <p className="font-sans text-brand-smoke text-[14px] leading-relaxed">
            No inventory found. Add items from the{" "}
            <a href="/dashboard/inventory"
              className="text-brand-orange font-extrabold no-underline hover:underline">
              dashboard
            </a>.
          </p>
        </div>
      ) : (
        <div className="px-5 sm:px-10 lg:px-16">
          <div className="flex gap-4 overflow-x-auto pb-4 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 max-w-[1200px] mx-auto scrollbar-hide">
            {items.map((item) => {
              const multiSize = item.sizes?.length > 1;
              const isOpen    = !!pickerOpen[item.id];
              const totalQty  = totalQtyFor(item.id);
              const inCart    = totalQty > 0;

              return (
                <div
                  key={item.id}
                  className={`flex-shrink-0 w-[240px] sm:w-auto bg-brand-cream border-[3px] overflow-hidden group hover:-translate-y-1 hover:shadow-retro-lg shadow-retro-sm transition-all duration-[180ms] ${
                    item.inStock ? "border-brand-black" : "border-brand-smoke/40"
                  }`}
                >
                  {/* Image */}
                  <div
                    className="h-[180px] flex items-center justify-center relative overflow-hidden"
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
                    {item.images?.[0]?.path ? (
                      <Image src={item.images[0].path} alt={item.name} height={150} width={150}
                        className={`${
                          !item.inStock ? "opacity-40 grayscale" : ""
                        }`} />
                    ) : (
                      <span className={`text-[60px] z-[1] leading-none ${
                        !item.inStock ? "opacity-40 grayscale" : ""
                      }`}>🌸</span>
                    )}

                    {inCart && item.inStock && (
                      <div className="absolute top-2 left-0 bg-brand-orange text-brand-black font-sans font-extrabold text-[8px] tracking-[1px] uppercase px-2.5 py-1 border-r-[3px] border-brand-black z-[2] flex items-center gap-1">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="4" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        In Bag · {totalQty}
                      </div>
                    )}
                    {item.tag && item.inStock && !inCart && (
                      <div className="absolute top-2 left-0 bg-brand-black text-brand-cream font-sans font-extrabold text-[8px] tracking-[1.5px] uppercase px-2.5 py-1 border-r-[2px] border-brand-orange z-[2]">
                        {item.tag}
                      </div>
                    )}
                    {!item.inStock && (
                      <div className="absolute inset-0 flex items-center justify-center bg-brand-cream/60 z-[2]">
                        <span className="bg-brand-smoke text-brand-cream font-sans font-extrabold text-[9px] tracking-[2px] uppercase px-3 py-1 border border-brand-smoke">
                          Out of Stock
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-1.5 right-1.5 bg-brand-cream/90 text-brand-smoke font-sans font-extrabold text-[7px] tracking-[1px] uppercase px-1.5 py-0.5 border border-brand-smoke/30 z-[3]">
                      {item.category}
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-3.5">
                    <div className="font-serif text-[14px] font-bold text-brand-black leading-tight mb-1">
                      {item.name}
                    </div>
                    <p className="font-sans text-[10px] text-brand-smoke leading-relaxed mb-3 line-clamp-2">
                      {item.description}
                    </p>

                    {/* Size picker */}
                    {isOpen && multiSize && item.inStock && (
                      <div className="mb-3 pt-2 border-t border-brand-black/10 flex flex-wrap gap-1.5">
                        <span className="font-sans text-[8px] font-extrabold tracking-[1px] uppercase text-brand-smoke w-full mb-0.5">
                          {inCart ? "Add size:" : "Size:"}
                        </span>
                        {item.sizes.map((size) => {
                          const sizeQty = qtyForSize(item.id, size);
                          return (
                            <button
                              key={size}
                              onClick={() => addItem(item, size)}
                              className={`font-sans text-[8px] font-extrabold tracking-[1px] uppercase px-2 py-1 border-[2px] cursor-pointer transition-colors ${
                                sizeQty > 0
                                  ? "border-brand-orange bg-brand-orange text-brand-black hover:bg-brand-black hover:border-brand-black hover:text-brand-cream"
                                  : "border-brand-black bg-brand-cream text-brand-black hover:bg-brand-black hover:text-brand-cream"
                              }`}
                            >
                              {size}{sizeQty > 0 ? ` ×${sizeQty}` : ""}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-sans font-black text-[18px] text-brand-black">
                        {item.prices?.length > 1 ? "from " : ""}${item.prices?.[0] ?? item.price ?? 0}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {item.inStock ? (
                          <ProductCardActions
                            product={item}
                            isPickerOpen={isOpen}
                            onTogglePicker={() => togglePicker(item.id)}
                            compact
                          />
                        ) : (
                          <button
                            disabled
                            className="border-none px-2.5 py-1.5 font-sans font-extrabold text-[8px] tracking-[1px] uppercase bg-brand-smoke/30 text-brand-smoke/60 cursor-not-allowed"
                          >
                            + Bag
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}