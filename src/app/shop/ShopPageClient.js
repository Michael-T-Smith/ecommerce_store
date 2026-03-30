// src/app/shop/ShopPageClient.js
//
// "use client" shell that owns all filter/sort/search state for /shop.
// Receives pre-fetched items from the server component (shop/page.js)
// and filters them client-side — no additional fetches needed.
//
// Props:
//   initialItems  — array of normalised item objects from the DB
//   categories    — array of category strings derived from DB data
//   dbError       — boolean; true if the server couldn't reach the DB

"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams }   from "next/navigation";
import AnnouncementBar       from "@/app/components/AnnouncementBar/AnnouncementBar";
import Navbar                from "@/app/components/Navbar/Navbar";
import ShopBanner            from "@/app/components/ShopBanner/ShopBanner";
import ShopFilters           from "@/app/components/ShopFilters/ShopFilters";
import ShopGrid              from "@/app/components/ShopGrid/ShopGrid";
import PromoBand             from "@/app/components/PromoBand/PromoBand";
import Footer                from "@/app/components/Footer/Footer";

// useSearchParams must be inside Suspense — wrap in a small inner component.
function ShopInner({ initialItems, categories, dbError }) {
  const searchParams = useSearchParams();

  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy,         setSortBy        ] = useState("default");
  const [searchQuery,    setSearchQuery   ] = useState("");
  const [inStockOnly,    setInStockOnly   ] = useState(false);

  // Seed search query from Navbar ?q= URL param
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearchQuery(decodeURIComponent(q));
  }, [searchParams]);

  const filteredItems = useMemo(() => {
    let result = [...initialItems];

    if (activeCategory !== "All") {
      result = result.filter((i) => i.category === activeCategory);
    }
    if (inStockOnly) {
      result = result.filter((i) => i.inStock);
    }
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

  return (
    <>
      <ShopBanner
        title="Shop"
        subtitle="Fresh arrangements, plants, and gifts — all handcrafted at our Piedmont studio."
      />

      {dbError ? (
        <div className="max-w-[560px] mx-auto px-5 py-20 text-center">
          <div className="text-[56px] mb-4">🌾</div>
          <h2 className="font-serif font-black text-brand-black text-[26px] tracking-[-1px] mb-3">
            Shop temporarily unavailable
          </h2>
          <p className="font-sans text-brand-smoke text-[14px] leading-relaxed mb-2">
            We couldn&apos;t load our inventory right now.
            Please try refreshing in a moment, or give us a call.
          </p>
          <a
            href="tel:+12564476331"
            className="font-sans font-extrabold text-brand-orange text-[14px] no-underline hover:underline"
          >
            (256) 447-4800
          </a>
        </div>
      ) : (
        <>
          <ShopFilters
            categories={categories}
            activeCategory={activeCategory}
            onCategory={setActiveCategory}
            sortBy={sortBy}
            onSort={setSortBy}
            searchQuery={searchQuery}
            onSearch={setSearchQuery}
            inStockOnly={inStockOnly}
            onInStock={setInStockOnly}
            resultCount={filteredItems.length}
          />
          <main className="px-5 sm:px-10 lg:px-16 py-10 sm:py-14">
            <ShopGrid items={filteredItems} />
          </main>
        </>
      )}
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

      <PromoBand />
      <Footer />
    </div>
  );
}