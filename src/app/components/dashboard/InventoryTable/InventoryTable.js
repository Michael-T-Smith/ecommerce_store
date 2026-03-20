"use client";

import { canDo }  from "@/lib/permissions";
import { B }      from "@/lib/brand";

// Stock status badge
function StockBadge({ inStock, stockCount, threshold }) {
  const isLow = inStock && stockCount <= threshold;
  if (!inStock) {
    return (
      <span className="inline-flex items-center gap-1.5 font-sans font-extrabold text-[10px] tracking-[1px] uppercase text-red-500 bg-red-50 border border-red-200 px-2 py-1">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
        Out of Stock
      </span>
    );
  }
  if (isLow) {
    return (
      <span className="inline-flex items-center gap-1.5 font-sans font-extrabold text-[10px] tracking-[1px] uppercase text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        Low ({stockCount})
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 font-sans font-extrabold text-[10px] tracking-[1px] uppercase text-green-700 bg-green-50 border border-green-200 px-2 py-1">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
      In Stock ({stockCount})
    </span>
  );
}

export default function InventoryTable({
  items,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  onToggleStock,
  userRole,
}) {

  if (items.length === 0) {
    return (
      <div className="bg-white border border-gray-200 flex flex-col items-center justify-center py-24 text-center">
        <div className="text-[48px] mb-4">🌾</div>
        <div className="font-serif font-black text-brand-black text-[22px] mb-2">No items found</div>
        <div className="font-sans text-brand-smoke text-[13px]">Try adjusting your filters.</div>
      </div>
    );
  }
  console.log(items);
  return (
    <div className="bg-white border border-gray-200 overflow-hidden">
      {/* Responsive scroll wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {["Item", "SKU", "Category", "Price / Cost", "Stock", "Featured", "Supplier", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-sans font-extrabold text-[10px] tracking-[1.5px] uppercase text-brand-smoke whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr
                key={item.id}
                className={`border-b border-gray-100 last:border-b-0 transition-colors hover:bg-gray-50/60 ${
                  i % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                }`}
              >
                {/* Item name + photo thumbnail */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 border border-brand-black/10 overflow-hidden flex-shrink-0 flex items-center justify-center bg-[#F0E8DE]">
                      {item.images?.[0]?.path ? (
                        <img src={item.images[0].path} alt={item.name}
                          className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[18px]">🌸</span>
                      )}
                    </div>
                    <div>
                      <div className="font-serif font-bold text-brand-black text-[14px] leading-tight">
                        {item.name}
                      </div>
                      {item.tag && (
                        <span
                          className="font-sans font-extrabold text-[9px] tracking-[1px] uppercase px-1.5 py-0.5 border mt-0.5 inline-block"
                          style={{ color: B.orange, borderColor: `${B.orange}40`, background: `${B.orange}10` }}
                        >
                          {item.tag}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* SKU */}
                <td className="px-4 py-3">
                  <span className="font-sans text-[11px] text-brand-smoke tracking-[1px] font-extrabold bg-gray-100 px-2 py-1">
                    {item.sku}
                  </span>
                </td>

                {/* Category */}
                <td className="px-4 py-3">
                  <span className="font-sans font-extrabold text-[11px] text-brand-smoke uppercase tracking-[0.5px]">
                    {item.category}
                  </span>
                </td>

                {/* Price / Cost */}
                <td className="px-4 py-3">
                  <div>
                    {/* Show from–to range when sizes have different prices */}
                    {(() => {
                      const prices = item.prices ?? [];
                      const sorted = [...prices].sort((a, b) => a - b);
                      const lo = sorted[0] ?? 0;
                      const hi = sorted[sorted.length - 1] ?? 0;
                      return (
                        <div className="font-sans font-black text-[14px] text-brand-black">
                          {lo === hi ? `$${lo}` : `$${lo} – $${hi}`}
                        </div>
                      );
                    })()}
                    {(() => {
                      const costs = item.costPrices ?? [];
                      const lo = Math.min(...costs);
                      const hi = Math.max(...costs);
                      return (
                        <div className="font-sans text-[11px] text-brand-smoke">
                          cost {lo === hi ? `$${lo}` : `$${lo} – $${hi}`}
                        </div>
                      );
                    })()}
                    {item.sizes?.length > 1 && (
                      <div className="font-sans text-[9px] text-brand-smoke/50 tracking-[0.5px] mt-0.5">
                        {item.sizes.map((s, i) => `${s}: $${item.prices?.[i] ?? "?"}`).join(" · ")}
                      </div>
                    )}
                  </div>
                </td>

                {/* Stock status */}
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1.5 items-start">
                    <StockBadge
                      inStock={item.inStock}
                      stockCount={item.stockCount}
                      threshold={item.lowStockThreshold}
                    />
                    {/* Toggle — only if user can update */}
                    {canEdit && (
                      <button
                        onClick={() => onToggleStock(item.id)}
                        className="font-sans text-[10px] text-brand-smoke underline cursor-pointer bg-transparent border-none hover:text-brand-orange transition-colors"
                      >
                        {item.inStock ? "Mark out" : "Mark in"}
                      </button>
                    )}
                  </div>
                </td>

                {/* Supplier */}
                {/* Featured indicator */}
                <td className="px-4 py-3 text-center">
                  {item.isFeatured ? (
                    <div className="flex flex-col items-center gap-1">
                      <span title="Featured on homepage" className="text-[16px]">⭐</span>
                      <div
                        className="w-5 h-3 border border-brand-black/20 rounded-sm"
                        style={{ background: item.featuredAccent ?? "#D4511A" }}
                        title={`Accent: ${item.featuredAccent ?? "#D4511A"}`}
                      />
                    </div>
                  ) : (
                    <span className="text-brand-smoke/30 text-[14px]">—</span>
                  )}
                </td>

                <td className="px-4 py-3">
                  <span className="font-sans text-[12px] text-brand-smoke">{item.supplier}</span>
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {canEdit && (
                      <button
                        onClick={() => onEdit(item)}
                        className="font-sans font-extrabold text-[10px] tracking-[1px] uppercase px-3 py-1.5 border-2 border-brand-black text-brand-black bg-transparent cursor-pointer hover:bg-brand-black hover:text-brand-cream transition-colors"
                      >
                        Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => onDelete(item.id)}
                        className="font-sans font-extrabold text-[10px] tracking-[1px] uppercase px-3 py-1.5 border-2 border-red-300 text-red-500 bg-transparent cursor-pointer hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                    {!canEdit && !canDelete && (
                      <span className="font-sans text-[11px] text-brand-smoke/50 italic">View only</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}