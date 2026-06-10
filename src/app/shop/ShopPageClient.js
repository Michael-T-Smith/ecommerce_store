"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AnnouncementBar from "@/app/components/AnnouncementBar/AnnouncementBar";
import Navbar          from "@/app/components/Navbar/Navbar";
import ShopGrid        from "@/app/components/ShopGrid/ShopGrid";
import Footer          from "@/app/components/Footer/Footer";
import { C }           from "@/lib/brand";

const PAGE_SIZE = 12;

function ShopInner({ initialItems, categories, dbError }) {
  const searchParams = useSearchParams();

  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy,         setSortBy        ] = useState("default");
  const [searchQuery,    setSearchQuery   ] = useState("");
  const [inStockOnly,    setInStockOnly   ] = useState(false);
  const [page,           setPage          ] = useState(1);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearchQuery(decodeURIComponent(q));
  }, [searchParams]);

  const filteredItems = useMemo(() => {
    let result = [...initialItems];
    if (activeCategory !== "All") result = result.filter((i) => i.category === activeCategory);
    if (inStockOnly)               result = result.filter((i) => i.inStock);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.description ?? "").toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case "price-asc":  result.sort((a, b) => a.price - b.price);            break;
      case "price-desc": result.sort((a, b) => b.price - a.price);            break;
      case "name-asc":   result.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: break;
    }
    return result;
  }, [initialItems, activeCategory, sortBy, searchQuery, inStockOnly]);

  useEffect(() => { setPage(1); }, [activeCategory, sortBy, searchQuery, inStockOnly]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const pagedItems = filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (dbError) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-5 text-center">
        <div className="text-[48px] mb-4">🌾</div>
        <h2 className="font-serif font-black text-brand-black text-[24px] tracking-[-1px] mb-3">
          Shop temporarily unavailable
        </h2>
        <p className="font-sans text-brand-smoke text-[13px] leading-relaxed max-w-[400px]">
          We couldn&apos;t load our inventory right now. Please try refreshing in a moment.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ── Page header ── */}
      <div className="border-b-[3px] border-brand-black">
        <div className="px-5 sm:px-10 lg:px-16 pt-10 pb-8 flex items-end justify-between gap-6">
          <div>
            <div className="font-sans text-[9px] font-extrabold tracking-[4px] uppercase text-brand-orange mb-2">
              ✦ BityBird Co
            </div>
            <h1 className="font-serif font-black text-brand-black text-[52px] sm:text-[72px] lg:text-[88px] tracking-[-3px] leading-none">
              Shop
            </h1>
          </div>

          <div className="hidden sm:flex flex-col items-end gap-2 pb-2">
            <div className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke">
              {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-0 border-b-2 border-brand-black py-1 font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-black cursor-pointer focus:outline-none appearance-none pr-6"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%230E0E0E' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 4px center",
              }}
            >
              <option value="default">Featured</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="name-asc">Name: A → Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Sticky filter bar ── */}
      <div className="bg-brand-cream border-b border-brand-black/10 sticky top-[73px] z-40">
        <div className="px-5 sm:px-10 lg:px-16 py-0 flex items-center gap-0 overflow-x-auto">

          {/* Search */}
          <div className="relative flex items-center flex-shrink-0 border-r border-brand-black/10 pr-5 mr-5 py-3">
            <svg
              className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none"
              width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="#8C8288" strokeWidth="2.5" strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="22" y2="22" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search…"
              className="bg-transparent border-0 pl-5 py-0 font-sans text-[11px] text-brand-black placeholder:text-brand-smoke/50 focus:outline-none w-[100px] sm:w-[140px]"
            />
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-0 flex-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`font-sans font-extrabold text-[10px] tracking-[1.5px] uppercase px-3 sm:px-4 py-3.5 cursor-pointer transition-all duration-150 whitespace-nowrap bg-transparent border-0 border-b-2 ${
                  activeCategory === cat
                    ? "text-brand-black border-brand-orange"
                    : "text-brand-smoke border-transparent hover:text-brand-black hover:border-brand-black/20"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-4 flex-shrink-0 border-l border-brand-black/10 pl-5 ml-2 py-3">
            <button
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`flex items-center gap-1.5 font-sans font-extrabold text-[10px] tracking-[1.5px] uppercase cursor-pointer transition-all bg-transparent border-0 whitespace-nowrap ${
                inStockOnly ? "text-brand-orange" : "text-brand-smoke hover:text-brand-black"
              }`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors"
                style={{ background: inStockOnly ? C.blush : "#8C8288" }}
              />
              In Stock
            </button>

            {/* Sort — mobile only (desktop sort is in header) */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sm:hidden bg-transparent border-0 border-b border-brand-black py-0 font-sans font-extrabold text-[10px] tracking-[1.5px] uppercase text-brand-black cursor-pointer focus:outline-none appearance-none pr-5"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='9' height='5' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%230E0E0E' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0px center",
              }}
            >
              <option value="default">Sort</option>
              <option value="price-asc">Price ↑</option>
              <option value="price-desc">Price ↓</option>
              <option value="name-asc">A → Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Grid ── */}
      <main className="px-5 sm:px-10 lg:px-16 py-12 sm:py-16">
        {pagedItems.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center">
            <div className="font-sans text-brand-smoke text-[11px] tracking-[3px] uppercase mb-4">
              No items found
            </div>
            <button
              onClick={() => { setSearchQuery(""); setActiveCategory("All"); setInStockOnly(false); }}
              className="font-sans font-extrabold text-[11px] tracking-[2px] uppercase text-brand-orange border-b border-brand-orange pb-0.5 cursor-pointer bg-transparent border-0 border-b border-brand-orange"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <ShopGrid items={pagedItems} />
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-16 sm:mt-20">
            <button
              onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              disabled={page === 1}
              className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke hover:text-brand-black transition-colors disabled:opacity-25 disabled:cursor-not-allowed bg-transparent border-0 cursor-pointer"
            >
              ← Prev
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => { setPage(n); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  aria-label={`Page ${n}`}
                  className="cursor-pointer border-0 bg-transparent p-0 transition-all duration-200"
                  style={{
                    width        : n === page ? "22px" : "7px",
                    height       : "7px",
                    borderRadius : n === page ? "4px" : "50%",
                    background   : n === page ? C.blush : "#8C8288",
                    opacity      : n === page ? 1 : 0.35,
                  }}
                />
              ))}
            </div>

            <button
              onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              disabled={page === totalPages}
              className="font-sans font-extrabold text-[10px] tracking-[2px] uppercase text-brand-smoke hover:text-brand-black transition-colors disabled:opacity-25 disabled:cursor-not-allowed bg-transparent border-0 cursor-pointer"
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </>
  );
}

export default function ShopPageClient({ initialItems, categories, dbError }) {
  return (
    <div className="font-serif bg-brand-cream min-h-screen overflow-x-hidden">
      <AnnouncementBar />
      <Navbar />

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-32">
            <div className="font-sans text-brand-smoke text-[13px] tracking-[2px] uppercase animate-pulse">
              Loading…
            </div>
          </div>
        }
      >
        <ShopInner
          initialItems={initialItems}
          categories={categories}
          dbError={dbError}
        />
      </Suspense>

      <Footer />
    </div>
  );
}
