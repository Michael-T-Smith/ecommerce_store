"use client";

import { useState, useCallback }  from "react";
import Link                       from "next/link";
import { useRouter }              from "next/navigation";
import AnnouncementBar  from "@/app/components/AnnouncementBar/AnnouncementBar";
import Navbar           from "@/app/components/Navbar/Navbar";
import Footer           from "@/app/components/Footer/Footer";
import { useCart }      from "@/app/CartContext";
import { B }            from "@/lib/brand";

// ── Small helper: stock status pill ─────────────────────────────────────────
function StockPill({ inStock, stockCount }) {
  if (!inStock) {
    return (
      <span className="inline-flex items-center gap-1.5 font-sans font-extrabold text-[10px] tracking-[2px] uppercase px-3 py-1.5 border-[2px] border-brand-smoke text-brand-smoke bg-brand-smoke/10">
        <span className="w-2 h-2 rounded-full bg-brand-smoke/60 flex-shrink-0" />
        Out of Stock
      </span>
    );
  }
  if (stockCount !== null && stockCount <= 3) {
    return (
      <span className="inline-flex items-center gap-1.5 font-sans font-extrabold text-[10px] tracking-[2px] uppercase px-3 py-1.5 border-[2px] border-brand-gold text-brand-gold bg-brand-gold/10">
        <span className="w-2 h-2 rounded-full bg-brand-gold flex-shrink-0" />
        Only {stockCount} left
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 font-sans font-extrabold text-[10px] tracking-[2px] uppercase px-3 py-1.5 border-[2px] border-green-600 text-green-700 bg-green-50">
      <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
      In Stock
    </span>
  );
}

// ── Related product card ─────────────────────────────────────────────────────
function RelatedCard({ item }) {
  const { addItem, items: cartItems } = useCart();
  const totalQty = cartItems.filter((c) => c.id === item.id).reduce((s, c) => s + c.qty, 0);
  const inCart   = totalQty > 0;
  const single   = !item.sizes || item.sizes.length <= 1;

  return (
    <div className="bg-brand-cream border-[3px] border-brand-black overflow-hidden group hover:-translate-y-1 hover:shadow-retro-lg shadow-retro-sm transition-all duration-[180ms]">
      <Link href={`/shop/${item.id}`} className="block no-underline">
        <div
          className="h-[160px] flex items-center justify-center relative overflow-hidden"
          style={{ background: "#F0E8DE" }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: `repeating-linear-gradient(-55deg,
                transparent 0, transparent 20px,
                rgba(0,0,0,0.03) 20px, rgba(0,0,0,0.03) 22px)`,
            }}
          />
          <span className="text-[64px] z-[1] leading-none transition-transform duration-200 group-hover:scale-110">
            {item.emoji}
          </span>
          {inCart && (
            <div className="absolute top-2 left-0 bg-brand-orange text-brand-cream font-sans font-extrabold text-[8px] tracking-[1px] uppercase px-2.5 py-1 border-r-[2px] border-brand-black z-[2]">
              In Bag · {totalQty}
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/shop/${item.id}`} className="no-underline">
          <div className="font-serif text-[15px] font-bold text-brand-black leading-tight mb-1 hover:text-brand-orange transition-colors">
            {item.name}
          </div>
        </Link>
        <div className="flex items-center justify-between mt-3">
          <span className="font-sans font-black text-[18px] text-brand-orange">{item.prices?.length > 1 ? "from " : ""}${item.prices?.[0] ?? item.price ?? 0}</span>
          {item.inStock && (
            single ? (
              <button
                onClick={() => addItem(item, item.sizes?.[0] ?? null)}
                className="border-none px-3 py-2 font-sans font-extrabold text-[9px] tracking-[1px] uppercase bg-brand-black text-brand-cream cursor-pointer hover:bg-brand-orange transition-colors"
              >
                {inCart ? `In Bag ×${totalQty}` : "+ Bag"}
              </button>
            ) : (
              <Link
                href={`/shop/${item.id}`}
                className="border-[2px] border-brand-black px-3 py-2 font-sans font-extrabold text-[9px] tracking-[1px] uppercase no-underline text-brand-black hover:bg-brand-black hover:text-brand-cream transition-colors"
              >
                View →
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function ProductDetail({ product, related }) {
  const router = useRouter();
  const { addItem, items: cartItems } = useCart();

  const multiSize    = product.sizes?.length > 1;
  const [selectedSize, setSelectedSize] = useState(
    multiSize ? null : (product.sizes?.[0] ?? null)
  );

  // Resolve displayed price from prices[sizes.indexOf(selectedSize)]
  // Falls back to prices[0] when no size chosen yet.
  const resolveDisplayPrice = (size) => {
    const prices = product.prices;
    const sizes  = product.sizes;
    if (!Array.isArray(prices) || prices.length === 0) return product.price ?? 0;
    if (!size || !Array.isArray(sizes)) return prices[0] ?? 0;
    const idx = sizes.indexOf(size);
    return idx !== -1 ? (prices[idx] ?? prices[0] ?? 0) : (prices[0] ?? 0);
  };
  const displayPrice = resolveDisplayPrice(selectedSize);
  const [qty, setQty] = useState(1);

  // Cart entries for this product
  const cartEntries  = cartItems.filter((c) => c.id === product.id);
  const totalInCart  = cartEntries.reduce((s, c) => s + c.qty, 0);
  const inCart       = totalInCart > 0;

  const qtyForSize = (size) =>
    cartEntries.find((c) => c.size === size)?.qty ?? 0;

  const handleAddToBag = useCallback(() => {
    if (!product.inStock) return;
    if (multiSize && !selectedSize) return;
    for (let i = 0; i < qty; i++) {
      addItem(product, selectedSize);
    }
    setQty(1);
  }, [product, selectedSize, qty, addItem, multiSize]);

  // Derived button state
  const canAdd      = product.inStock && (!multiSize || !!selectedSize);
  const sizeQtyInCart = selectedSize ? qtyForSize(selectedSize) : 0;

  return (
    <div className="font-serif bg-brand-cream min-h-screen overflow-x-hidden">
      <AnnouncementBar />
      <Navbar />

      {/* ── Breadcrumb ──────────────────────────────────────────────────────── */}
      <div className="px-5 sm:px-10 lg:px-16 pt-6 pb-0 max-w-[1200px] mx-auto">
        <nav className="flex items-center gap-2 font-sans text-[11px] font-extrabold tracking-[1.5px] uppercase text-brand-smoke">
          <Link href="/"     className="hover:text-brand-orange transition-colors no-underline">Home</Link>
          <span>›</span>
          <Link href="/shop" className="hover:text-brand-orange transition-colors no-underline">Shop</Link>
          <span>›</span>
          <span className="text-brand-orange truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      {/* ── Main product section ─────────────────────────────────────────────── */}
      <main className="px-5 sm:px-10 lg:px-16 py-10 sm:py-14 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

          {/* ── Left: Hero image ──────────────────────────────────────────── */}
          <div>
            <div
              className="w-full aspect-square max-w-[560px] mx-auto border-[3px] border-brand-black relative overflow-hidden shadow-retro-lg"
              style={{ background: product.inStock ? "#F0E8DE" : "#E8E4DE" }}
            >
              {/* Racing stripe overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background: `repeating-linear-gradient(-55deg,
                    transparent 0, transparent 40px,
                    rgba(0,0,0,0.025) 40px, rgba(0,0,0,0.025) 44px)`,
                }}
              />

              {/* Gold corner accent */}
              <div
                className="absolute bottom-0 left-0 w-[80px] h-[80px]"
                style={{
                  background: `repeating-linear-gradient(90deg,
                    ${B.gold} 0, ${B.gold} 16px,
                    transparent 16px, transparent 20px)`,
                  opacity: 0.5,
                }}
              />

              {/* Product emoji */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className={`text-[160px] leading-none select-none ${
                    !product.inStock ? "opacity-40 grayscale" : ""
                  }`}
                >
                  {product.emoji}
                </span>
              </div>

              {/* Out of stock overlay */}
              {!product.inStock && (
                <div className="absolute inset-0 bg-brand-cream/50 flex items-center justify-center z-10">
                  <div className="bg-brand-smoke text-brand-cream font-sans font-black text-[14px] tracking-[3px] uppercase px-6 py-3 border-[3px] border-brand-black">
                    Out of Stock
                  </div>
                </div>
              )}

              {/* Tag banner */}
              {product.tag && product.inStock && (
                <div className="absolute top-5 left-0 bg-brand-black text-brand-cream font-sans font-extrabold text-[11px] tracking-[2.5px] uppercase px-5 py-2 border-r-[4px] border-brand-orange z-[5]">
                  {product.tag}
                </div>
              )}

              {/* In Bag indicator */}
              {inCart && (
                <div className="absolute top-5 right-0 bg-brand-orange text-brand-cream font-sans font-extrabold text-[11px] tracking-[2px] uppercase px-5 py-2 border-l-[4px] border-brand-black z-[5] flex items-center gap-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  In Bag · {totalInCart}
                </div>
              )}
            </div>

            {/* SKU / supplier — subtle metadata */}
            {(product.sku || product.supplier) && (
              <div className="max-w-[560px] mx-auto mt-4 flex flex-wrap gap-x-6 gap-y-1">
                {product.sku && (
                  <span className="font-sans text-[10px] text-brand-smoke/60 tracking-[1px]">
                    SKU: {product.sku}
                  </span>
                )}
                {product.supplier && (
                  <span className="font-sans text-[10px] text-brand-smoke/60 tracking-[1px]">
                    Source: {product.supplier}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ── Right: Product info + controls ───────────────────────────── */}
          <div className="flex flex-col gap-6">

            {/* Category + Stock */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-sans font-extrabold text-[10px] tracking-[3px] uppercase text-brand-smoke border border-brand-smoke/30 px-3 py-1.5">
                {product.category}
              </span>
              <StockPill inStock={product.inStock} stockCount={product.stockCount} />
            </div>

            {/* Name */}
            <h1 className="font-serif font-black text-brand-black text-[32px] sm:text-[42px] tracking-[-2px] leading-[1.05] m-0">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span className="font-sans font-black text-[40px] text-brand-orange leading-none">
                {!selectedSize && product.prices?.length > 1 ? "from " : ""}${displayPrice}
              </span>
              {product.sizes?.length <= 1 && product.sizes?.[0] && product.sizes[0] !== "Standard" && (
                <span className="font-sans text-[13px] text-brand-smoke">
                  {product.sizes[0]}
                </span>
              )}
            </div>

            {/* Gold divider */}
            <div
              className="h-[3px] w-20"
              style={{
                background: `repeating-linear-gradient(90deg,
                  ${B.gold} 0, ${B.gold} 12px,
                  ${B.black} 12px, ${B.black} 15px)`,
              }}
            />

            {/* Description */}
            <p className="font-sans text-[14px] text-brand-smoke leading-[1.7]">
              {product.description}
            </p>

            {/* ── Size selector ─────────────────────────────────────────── */}
            {multiSize && (
              <div>
                <div className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-3 flex items-center gap-3">
                  Size
                  {selectedSize && (
                    <span className="text-brand-orange">— {selectedSize}</span>
                  )}
                  {selectedSize && sizeQtyInCart > 0 && (
                    <span className="text-brand-smoke/60 font-normal normal-case tracking-normal">
                      (×{sizeQtyInCart} already in bag)
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => {
                    const inBag  = qtyForSize(size);
                    const active = selectedSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`relative font-sans font-extrabold text-[11px] tracking-[1.5px] uppercase px-5 py-3 border-[2px] cursor-pointer transition-all ${
                          active
                            ? "bg-brand-orange border-brand-orange text-brand-cream shadow-retro-sm"
                            : "bg-brand-cream border-brand-black text-brand-black hover:border-brand-orange hover:text-brand-orange"
                        }`}
                      >
                        {size}
                        {inBag > 0 && (
                          <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-brand-orange text-brand-cream font-black text-[9px] flex items-center justify-center border-[2px] border-white shadow">
                            {inBag}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {multiSize && !selectedSize && (
                  <p className="font-sans text-[11px] text-brand-smoke/60 mt-2">
                    Please select a size before adding to your bag.
                  </p>
                )}
              </div>
            )}

            {/* ── Qty picker ────────────────────────────────────────────── */}
            {product.inStock && (
              <div>
                <div className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke mb-3">
                  Quantity
                </div>
                <div className="flex items-center gap-0 border-[2px] border-brand-black w-fit overflow-hidden">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center bg-brand-cream border-none cursor-pointer text-brand-black text-[18px] font-black hover:bg-brand-black hover:text-brand-cream transition-colors"
                    aria-label="Decrease"
                  >
                    −
                  </button>
                  <div className="w-12 h-10 flex items-center justify-center font-sans font-black text-[16px] text-brand-black border-x-[2px] border-brand-black bg-white">
                    {qty}
                  </div>
                  <button
                    onClick={() => setQty((q) => Math.min(10, q + 1))}
                    className="w-10 h-10 flex items-center justify-center bg-brand-cream border-none cursor-pointer text-brand-black text-[18px] font-black hover:bg-brand-black hover:text-brand-cream transition-colors"
                    aria-label="Increase"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* ── Add to Bag ────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToBag}
                disabled={!canAdd}
                className={`flex-1 py-4 font-sans font-black text-[13px] tracking-[2px] uppercase border-[3px] transition-all flex items-center justify-center gap-3 ${
                  canAdd
                    ? "bg-brand-orange text-brand-cream border-brand-black cursor-pointer shadow-retro-md hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-retro-sm"
                    : "bg-brand-smoke/20 text-brand-smoke/50 border-brand-smoke/30 cursor-not-allowed"
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                {!product.inStock
                  ? "Out of Stock"
                  : multiSize && !selectedSize
                  ? "Select a Size"
                  : `Add ${qty > 1 ? `${qty} ` : ""}to Bag`}
              </button>

              {inCart && (
                <button
                  onClick={() => router.push("/bag")}
                  className="flex-1 sm:flex-none py-4 sm:px-6 font-sans font-black text-[13px] tracking-[2px] uppercase border-[3px] border-brand-black bg-brand-black text-brand-cream cursor-pointer shadow-retro-md hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-retro-sm transition-all flex items-center justify-center gap-2"
                >
                  View Bag ({totalInCart})
                </button>
              )}
            </div>

            {/* Trust points */}
            <div className="border-t border-brand-black/10 pt-5 flex flex-col gap-2.5">
              {[
                "Handcrafted fresh in Piedmont, AL",
                "Mon–Sat delivery to Piedmont, Anniston & Centre",
                "Payment on delivery or by invoice",
              ].map((point) => (
                <div key={point} className="flex items-start gap-3">
                  <svg className="flex-shrink-0 mt-0.5" width="13" height="13" viewBox="0 0 24 24"
                    fill="none" stroke={B.orange} strokeWidth="3" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="font-sans text-[12px] text-brand-smoke leading-relaxed">
                    {point}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Related products ──────────────────────────────────────────────── */}
        {related.length > 0 && (
          <section className="mt-20 pt-10 border-t-[3px] border-brand-black">
            <div className="flex items-baseline gap-4 mb-8">
              <h2 className="font-serif font-black text-brand-black text-[26px] sm:text-[32px] tracking-[-1px]">
                You might also like
              </h2>
              <Link
                href="/shop"
                className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke hover:text-brand-orange transition-colors no-underline border-b border-brand-smoke/30 pb-0.5"
              >
                See All →
              </Link>
            </div>

            {/* Gold accent */}
            <div
              className="h-[3px] w-16 mb-8"
              style={{
                background: `repeating-linear-gradient(90deg,
                  ${B.gold} 0, ${B.gold} 12px,
                  ${B.black} 12px, ${B.black} 15px)`,
              }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((item) => (
                <RelatedCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}