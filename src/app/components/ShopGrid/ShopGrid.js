"use client";

import { useState }       from "react";
import Link               from "next/link";
import { useCart }        from "@/app/CartContext";
import ProductCardActions from "@/app/components/ProductCardActions/ProductCardActions";
import Image from "next/image";

export default function ShopGrid({ items }) {
  const { addItem, items: cartItems } = useCart();
  const [pickerOpen, setPickerOpen] = useState({});

  const togglePicker = (id) =>
    setPickerOpen((p) => ({ ...p, [id]: !p[id] }));

  const totalQtyFor = (id) =>
    cartItems.filter((c) => c.id === id).reduce((s, c) => s + c.qty, 0);

  const qtyForSize = (id, size) =>
    cartItems.find((c) => c.id === id && c.size === size)?.qty ?? 0;

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
      {items.map((item) => {
        const multiSize = item.sizes?.length > 1;
        const isOpen    = !!pickerOpen[item.id];
        const totalQty  = totalQtyFor(item.id);
        const inCart    = totalQty > 0;

        return (
          <div
            key={item.id}
            className={`bg-brand-cream border-[3px] overflow-hidden transition-all duration-[180ms] group ${
              item.inStock ? "border-brand-black" : "border-brand-smoke/40"
            } hover:-translate-y-2 hover:shadow-retro-xl shadow-retro-sm`}
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
              {item.images?.[0]?.path ? (
                <Image src={item.images[0].path} alt={item.name} height={200} width={200}
                  className={`transition-transform duration-200 group-hover:scale-105 ${
                    !item.inStock ? "opacity-40 grayscale" : ""
                  }`} />
              ) : (
                <span className={`text-[72px] z-[1] leading-none ${
                  !item.inStock ? "opacity-40 grayscale" : ""
                }`}>🌸</span>
              )}

              {/* In Bag badge */}
              {inCart && item.inStock && (
                <div className="absolute top-3 left-0 bg-brand-orange text-brand-black font-sans font-extrabold text-[9px] tracking-[1.5px] uppercase px-3 py-1 border-r-[3px] border-brand-black z-[3] flex items-center gap-1.5">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  In Bag · {totalQty}
                </div>
              )}

              {/* Tag badge — only when not in cart */}
              {item.tag && item.inStock && !inCart && (
                <div className="absolute top-3 left-0 bg-brand-black text-brand-cream font-sans font-extrabold text-[9px] tracking-[2px] uppercase px-3 py-1 border-r-[3px] border-brand-orange z-[3]">
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
              <p className="font-sans text-[11px] text-brand-smoke leading-relaxed mb-3 line-clamp-2">
                {item.description}
              </p>

              {/* Size picker — shown for multi-size whenever isOpen,
                  regardless of whether item is already in cart.
                  Chips show ×qty so the customer sees what's in bag. */}
              {isOpen && multiSize && item.inStock && (
                <div className="mb-3 flex flex-wrap gap-1.5 pt-2 border-t border-brand-black/10">
                  <span className="font-sans text-[9px] font-extrabold tracking-[1px] uppercase text-brand-smoke w-full mb-0.5">
                    {inCart ? "Add size:" : "Select size:"}
                  </span>
                  {item.sizes.map((size) => {
                    const sizeQty = qtyForSize(item.id, size);
                    return (
                      <button
                        key={size}
                        onClick={() => addItem(item, size)}
                        className={`font-sans text-[9px] font-extrabold tracking-[1px] uppercase px-3 py-1.5 border-[2px] cursor-pointer transition-colors ${
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

              {/* Price + actions */}
              <div className="flex justify-between items-center gap-2 flex-wrap">
                <span className="font-sans font-black text-[20px] text-brand-black">
                  {item.prices?.length > 1 ? "from " : ""}${item.prices?.[0] ?? item.price ?? 0}
                </span>
                <div className="flex gap-2 items-center">
                  <Link
                    href={`/shop/${item.id}`}
                    className="bg-transparent text-brand-black border-[2px] border-brand-black px-3 py-2 font-sans font-extrabold text-[9px] tracking-[1.5px] uppercase no-underline hover:bg-brand-black hover:text-brand-cream transition-colors duration-150"
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
                    <button
                      disabled
                      className="border-none px-3 py-2 font-sans font-extrabold text-[9px] tracking-[1.5px] uppercase bg-brand-smoke/30 text-brand-smoke/60 cursor-not-allowed"
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
  );
}