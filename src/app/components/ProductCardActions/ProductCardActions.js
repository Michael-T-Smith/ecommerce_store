"use client";

import { useCart } from "@/app/CartContext";

export default function ProductCardActions({
  product,
  isPickerOpen,
  onTogglePicker,
  compact = false,
}) {
  const { items: cartItems, addItem, updateQty } = useCart();

  const cartEntries = cartItems.filter((c) => c.id === product.id);
  const totalInCart = cartEntries.reduce((s, c) => s + c.qty, 0);
  const inCart      = totalInCart > 0;
  const multiSize   = product.sizes?.length > 1;

  // Decrement the entry with the highest qty (most natural "remove one")
  const handleDecrement = () => {
    if (!cartEntries.length) return;
    const entry = cartEntries.reduce((a, b) => (b.qty > a.qty ? b : a));
    updateQty(entry.id, entry.size, entry.qty - 1);
  };

  // Single-size only: increment the one entry
  const handleIncrementSingle = () => {
    if (!cartEntries.length) {
      addItem(product, product.sizes?.[0] ?? null);
    } else {
      addItem(product, cartEntries[0].size);
    }
  };

  const sz  = compact ? "w-7 h-7 text-[13px]"  : "w-8 h-8 text-[15px]";
  const qty = compact ? "min-w-[22px] h-7 text-[10px]" : "min-w-[28px] h-8 text-[11px]";
  const px  = compact ? "px-2 py-1.5 text-[8px]"  : "px-3 py-2 text-[9px]";
  const btnBase = `font-sans font-extrabold tracking-[1.5px] uppercase transition-all duration-150 cursor-pointer border-none`;

  // ── IN CART — single size: simple stepper ──────────────────────────────────
  if (inCart && !multiSize) {
    return (
      <div className="flex items-center gap-0 border-[2px] border-brand-black overflow-hidden">
        <button
          onClick={handleDecrement}
          className={`${sz} flex items-center justify-center bg-brand-cream border-none cursor-pointer text-brand-black font-black hover:bg-brand-black hover:text-brand-cream transition-colors leading-none`}
          aria-label="Remove one"
        >
          −
        </button>
        <div className={`${qty} bg-brand-orange text-brand-cream font-sans font-black flex items-center justify-center px-1 leading-none`}>
          {totalInCart}
        </div>
        <button
          onClick={handleIncrementSingle}
          className={`${sz} flex items-center justify-center bg-brand-cream border-none cursor-pointer text-brand-black font-black hover:bg-brand-black hover:text-brand-cream transition-colors leading-none`}
          aria-label="Add one more"
        >
          +
        </button>
      </div>
    );
  }

  // ── IN CART — multi-size: decrement + qty badge + picker toggle ────────────
  if (inCart && multiSize) {
    return (
      <div className="flex items-center gap-0 border-[2px] border-brand-black overflow-hidden">
        <button
          onClick={handleDecrement}
          className={`${sz} flex items-center justify-center bg-brand-cream border-none cursor-pointer text-brand-black font-black hover:bg-brand-black hover:text-brand-cream transition-colors leading-none`}
          aria-label="Remove one"
        >
          −
        </button>
        <div className={`${qty} bg-brand-orange text-brand-cream font-sans font-black flex items-center justify-center px-1 leading-none`}>
          {totalInCart}
        </div>
        {/* ▾ opens size picker to add more of same OR different size */}
        <button
          onClick={onTogglePicker}
          title="Add a size"
          className={`${sz} flex items-center justify-center border-none cursor-pointer font-black transition-colors leading-none ${
            isPickerOpen
              ? "bg-brand-orange text-brand-cream"
              : "bg-brand-black text-brand-cream hover:bg-brand-orange"
          }`}
          aria-label="Choose size to add"
        >
          {isPickerOpen ? "↑" : "▾"}
        </button>
      </div>
    );
  }

  // ── NOT IN CART — single size ──────────────────────────────────────────────
  if (!multiSize) {
    return (
      <button
        onClick={() => addItem(product, product.sizes?.[0] ?? null)}
        className={`${btnBase} ${px} bg-brand-black text-brand-cream hover:bg-brand-orange`}
      >
        + Bag
      </button>
    );
  }

  // ── NOT IN CART — multi-size: delegate to parent picker ───────────────────
  return (
    <button
      onClick={onTogglePicker}
      className={`${btnBase} ${px} ${
        isPickerOpen
          ? "bg-brand-orange text-brand-cream"
          : "bg-brand-black text-brand-cream hover:bg-brand-orange"
      }`}
    >
      {isPickerOpen ? "↑ Close" : "+ Bag"}
    </button>
  );
}