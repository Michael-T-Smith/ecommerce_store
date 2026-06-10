"use client";

export default function ShopFilters({
  categories,
  activeCategory,
  onCategory,
  sortBy,
  onSort,
  searchQuery,
  onSearch,
  inStockOnly,
  onInStock,
  resultCount,
}) {
  return (
    <div className="bg-brand-cream border-b-[3px] border-brand-black sticky top-[73px] z-40">
      <div className="px-5 sm:px-10 lg:px-16 py-4 sm:py-5 flex flex-col gap-4">

        {/* Row 1: Search + Sort + In-stock toggle */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">

          {/* Search input */}
          <div className="relative flex-1 max-w-full sm:max-w-[360px]">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="#8C8288" strokeWidth="2.5" strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="22" y2="22" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search items..."
              className="w-full bg-transparent border-[2px] border-brand-black pl-9 pr-4 py-2.5 font-sans text-[12px] text-brand-black placeholder:text-brand-smoke tracking-[1px] focus:outline-none focus:border-brand-orange transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">

            {/* In-stock toggle */}
            <button
              onClick={() => onInStock(!inStockOnly)}
              className={`flex items-center gap-2 font-sans font-extrabold text-[10px] tracking-[2px] uppercase px-4 py-2.5 border-2 cursor-pointer transition-all duration-150 ${
                inStockOnly
                  ? "bg-brand-orange text-brand-cream border-brand-orange"
                  : "bg-transparent text-brand-smoke border-brand-smoke hover:border-brand-orange hover:text-brand-orange"
              }`}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${inStockOnly ? "bg-brand-cream" : "bg-brand-smoke"}`} />
              In Stock Only
            </button>

            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => onSort(e.target.value)}
              className="bg-brand-cream border-[2px] border-brand-black px-4 py-2.5 font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-black cursor-pointer focus:outline-none focus:border-brand-orange transition-colors appearance-none pr-8"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23111111' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
              }}
            >
              <option value="default">Sort: Featured</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="name-asc">Name: A → Z</option>
            </select>
          </div>
        </div>

        {/* Row 2: Category pills + result count */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onCategory(cat)}
                className={`font-sans font-extrabold text-[10px] sm:text-[11px] tracking-[2px] uppercase px-4 py-2 border-2 cursor-pointer transition-all duration-150 ${
                  activeCategory === cat
                    ? "bg-brand-orange text-brand-cream border-brand-orange shadow-retro-sm"
                    : "bg-transparent text-brand-smoke border-brand-smoke hover:border-brand-orange hover:text-brand-orange"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <span className="font-sans text-[11px] text-brand-smoke tracking-[1px] uppercase whitespace-nowrap">
            {resultCount} item{resultCount !== 1 ? "s" : ""}
          </span>
        </div>

      </div>
    </div>
  );
}
