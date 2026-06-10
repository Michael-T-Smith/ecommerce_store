// src/app/bag/page.js
//
// Full bag/cart review page at /bag.
// Shows all cart items with qty controls and remove.
// Calculates subtotal — delivery fee shown at checkout.
// Empty state has a CTA back to the shop.

"use client";

import { useState }   from "react";
import Link           from "next/link";
import { useRouter }  from "next/navigation";
import AnnouncementBar from "@/app/components/AnnouncementBar/AnnouncementBar";
import Navbar          from "@/app/components/Navbar/Navbar";
import Footer          from "@/app/components/Footer/Footer";
import { useCart }     from "@/app/CartContext";
import { C }           from "@/lib/brand";

// ── Qty stepper ──────────────────────────────────────────────────────────────
function QtyStepper({ qty, onDecrement, onIncrement }) {
  return (
    <div className="flex items-center border-[2px] border-brand-black">
      <button
        onClick={onDecrement}
        className="w-8 h-8 flex items-center justify-center bg-transparent border-none cursor-pointer font-sans font-black text-[16px] text-brand-black hover:bg-brand-black hover:text-brand-cream transition-colors"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="w-8 text-center font-sans font-extrabold text-[13px] text-brand-black">
        {qty}
      </span>
      <button
        onClick={onIncrement}
        className="w-8 h-8 flex items-center justify-center bg-transparent border-none cursor-pointer font-sans font-black text-[16px] text-brand-black hover:bg-brand-black hover:text-brand-cream transition-colors"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyBag() {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-5 text-center">
      {/* Decorative flower */}
      <div className="text-[88px] mb-6 leading-none">🐦</div>

      {/* Gold pinstripe accent */}
      <div
        className="w-24 h-[3px] mb-8 mx-auto"
        style={{
          background: `repeating-linear-gradient(90deg,
            ${C.gold} 0, ${C.gold} 16px,
            transparent 16px, transparent 20px)`,
        }}
      />

      <h2 className="font-serif font-black text-brand-black text-[32px] sm:text-[38px] tracking-[-1.5px] mb-3">
        Your bag is empty
      </h2>
      <p className="font-sans text-brand-smoke text-[14px] leading-relaxed max-w-[320px] mb-10">
        Browse our handcrafted goods and refurbished finds — one-of-a-kind pieces curated just for you.
      </p>
      <Link
        href="/shop"
        className="font-sans font-black text-[12px] tracking-[2px] uppercase bg-brand-orange text-brand-cream border-[3px] border-brand-black px-8 py-4 no-underline shadow-retro-md hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-retro-sm transition-all inline-flex items-center gap-3"
      >
        Browse the Shop
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
        </svg>
      </Link>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function BagPage() {
  const { items, updateQty, removeItem, subtotal, itemCount } = useCart();
  const router = useRouter();
  const [removing, setRemoving] = useState(null);

  const handleRemove = (id, size) => {
    setRemoving(`${id}__${size}`);
    setTimeout(() => {
      removeItem(id, size);
      setRemoving(null);
    }, 200);
  };

  return (
    <div className="font-serif bg-brand-cream min-h-screen overflow-x-hidden">
      <AnnouncementBar />
      <Navbar />

      {/* Page header */}
      <div
        className="border-b-[3px] border-brand-black px-5 sm:px-10 lg:px-16 py-8 sm:py-10 relative overflow-hidden"
        style={{
          background: `repeating-linear-gradient(-55deg,
            transparent 0px, transparent 60px,
            rgba(212,81,26,0.04) 60px, rgba(212,81,26,0.04) 66px)`,
        }}
      >
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-baseline gap-4">
            <h1 className="font-serif font-black text-brand-black text-[32px] sm:text-[42px] tracking-[-2px]">
              Your Bag
            </h1>
            {itemCount > 0 && (
              <span className="font-sans font-extrabold text-[13px] tracking-[1px] text-brand-smoke">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            )}
          </div>
          {/* Gold stripe */}
          <div
            className="mt-4 h-[4px] w-24"
            style={{
              background: `repeating-linear-gradient(90deg,
                ${C.gold} 0, ${C.gold} 16px,
                ${C.black} 16px, ${C.black} 20px)`,
            }}
          />
        </div>
      </div>

      <main className="px-5 sm:px-10 lg:px-16 py-10 sm:py-14 max-w-[1200px] mx-auto">
        {items.length === 0 ? (
          <EmptyBag />
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

            {/* ── Item list ─────────────────────────────────────────────── */}
            <div className="flex-1 w-full">

              {/* Column headers (desktop only) */}
              <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-4 pb-3 border-b-[2px] border-brand-black/20 mb-2">
                <span className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke">
                  Product
                </span>
                <span className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke text-center">
                  Qty
                </span>
                <span className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke text-right w-20">
                  Price
                </span>
                <span className="w-8" />
              </div>

              {items.map((item) => {
                const key     = `${item.id}__${item.size}`;
                const fading  = removing === key;
                const lineTotal = item.price * item.qty;

                return (
                  <div
                    key={key}
                    className={`flex flex-col sm:grid sm:grid-cols-[1fr_auto_auto_auto] gap-3 sm:gap-4 items-start sm:items-center py-5 border-b-[2px] border-brand-black/10 transition-all duration-200 ${
                      fading ? "opacity-0 -translate-x-4" : "opacity-100"
                    }`}
                  >
                    {/* Product info */}
                    <div className="flex items-center gap-4">
                      {/* Emoji thumbnail */}
                      <div
                        className="w-[72px] h-[72px] flex items-center justify-center flex-shrink-0 border-[2px] border-brand-black/20 text-[36px] leading-none"
                        style={{
                          background: `repeating-linear-gradient(-55deg,
                            transparent 0, transparent 10px,
                            rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 12px),
                            #F0E8DE`,
                        }}
                      >
                        {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : "🌸"}
                      </div>
                      <div>
                        <div className="font-serif font-bold text-brand-black text-[16px] leading-tight mb-1">
                          {item.name}
                        </div>
                        {item.size && (
                          <span className="font-sans text-[10px] font-extrabold tracking-[1.5px] uppercase text-brand-smoke border border-brand-smoke/40 px-2 py-0.5">
                            {item.size}
                          </span>
                        )}
                        <div className="mt-1 font-sans font-black text-brand-orange text-[15px] sm:hidden">
                          ${item.price.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Qty stepper */}
                    <div className="flex items-center gap-3 sm:justify-center">
                      <QtyStepper
                        qty={item.qty}
                        onDecrement={() => updateQty(item.id, item.size, item.qty - 1)}
                        onIncrement={() => updateQty(item.id, item.size, item.qty + 1)}
                      />
                    </div>

                    {/* Line total (desktop) */}
                    <div className="hidden sm:block font-sans font-black text-brand-black text-[16px] text-right w-20">
                      ${lineTotal.toFixed(2)}
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => handleRemove(item.id, item.size)}
                      title="Remove item"
                      className="flex items-center gap-1 bg-transparent border-none cursor-pointer text-brand-smoke hover:text-red-500 transition-colors font-sans text-[11px] font-extrabold tracking-[1px] uppercase p-1"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                );
              })}

              {/* Continue shopping */}
              <div className="mt-6">
                <Link
                  href="/shop"
                  className="font-sans text-[12px] font-extrabold tracking-[1.5px] uppercase text-brand-smoke hover:text-brand-orange transition-colors no-underline flex items-center gap-2"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                  </svg>
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* ── Order summary sidebar ──────────────────────────────────── */}
            <div className="w-full lg:w-[340px] flex-shrink-0">
              <div className="bg-white border-[3px] border-brand-black shadow-retro-lg overflow-hidden sticky top-24">

                {/* Header stripe */}
                <div
                  className="h-[5px]"
                  style={{
                    background: `repeating-linear-gradient(90deg,
                      ${C.blush} 0, ${C.blush} 40px,
                      ${C.gold}   40px, ${C.gold}   50px,
                      ${C.black}  50px, ${C.black}  54px)`,
                  }}
                />

                <div className="px-6 py-6">
                  <h2 className="font-serif font-black text-brand-black text-[20px] tracking-[-0.5px] mb-5">
                    Order Summary
                  </h2>

                  {/* Item breakdown */}
                  <div className="flex flex-col gap-2 mb-5 pb-5 border-b border-brand-black/10">
                    {items.map((item) => (
                      <div
                        key={`${item.id}__${item.size}`}
                        className="flex items-start justify-between gap-3"
                      >
                        <span className="font-sans text-[12px] text-brand-smoke leading-tight flex-1">
                          {item.name}
                          {item.size && (
                            <span className="text-brand-smoke/60"> ({item.size})</span>
                          )}
                          {" "}× {item.qty}
                        </span>
                        <span className="font-sans font-extrabold text-[13px] text-brand-black flex-shrink-0">
                          ${(item.price * item.qty).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Subtotal */}
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-sans font-extrabold text-[12px] tracking-[1px] uppercase text-brand-smoke">
                      Subtotal
                    </span>
                    <span className="font-sans font-black text-[18px] text-brand-black">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Delivery note */}
                  <div className="bg-brand-cream border border-brand-smoke/20 px-3 py-2.5 mb-6 flex items-start gap-2">
                    <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke={"#8C8288"} strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span className="font-sans text-[11px] text-brand-smoke leading-relaxed">
                      Delivery fee is calculated at checkout based on your zone.
                    </span>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => router.push("/checkout")}
                    className="w-full bg-brand-orange text-brand-cream border-[3px] border-brand-black py-4 font-sans font-black text-[13px] tracking-[2px] uppercase cursor-pointer shadow-retro-md hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-retro-sm transition-all flex items-center justify-center gap-3"
                  >
                    Proceed to Checkout
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>

                  {/* Trust note */}
                  <p className="font-sans text-[10px] text-brand-smoke/60 text-center mt-4 leading-relaxed">
                    Hand-delivered by our team. Mon–Sat delivery only.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}