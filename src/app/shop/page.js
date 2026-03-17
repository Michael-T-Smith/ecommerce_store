"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AnnouncementBar  from "@/app/components/AnnouncementBar/AnnouncementBar";
import Navbar           from "@/app/components/Navbar/Navbar";
import ShopBanner       from "@/app/components/ShopBanner/ShopBanner";
import ShopFilters      from "@/app/components/ShopFilters/ShopFilters";
import ShopGrid         from "@/app/components/ShopGrid/ShopGrid";
import PromoBand        from "@/app/components/PromoBand/PromoBand";
import Footer           from "@/app/components/Footer/Footer";
import { CATALOG, CATALOG_CATEGORIES } from "@/lib/data";

export default function ShopPage() {
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy,         setSortBy        ] = useState("default");
  const [searchQuery,    setSearchQuery   ] = useState("");
  const [inStockOnly,    setInStockOnly   ] = useState(false);

  // Seed search query from Navbar ?q= param
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearchQuery(decodeURIComponent(q));
  }, [searchParams]);

    useEffect(() => {
    const cate = searchParams.get("category");
    if (cate) setActiveCategory(cate);
  }, [searchParams]);

  const filteredItems = useMemo(() => {
    let result = [...CATALOG];

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
          i.description.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case "price-asc":  result.sort((a, b) => a.price - b.price);           break;
      case "price-desc": result.sort((a, b) => b.price - a.price);           break;
      case "name-asc":   result.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: break;
    }

    return result;
  }, [activeCategory, sortBy, searchQuery, inStockOnly]);

  return (
    <div className="font-serif bg-brand-cream min-h-screen overflow-x-hidden">
      <AnnouncementBar />
      <Navbar />

      <ShopBanner
        title="Shop"
        subtitle="Fresh arrangements, plants, and gifts — all handcrafted at our Piedmont studio."
      />

      <ShopFilters
        categories={CATALOG_CATEGORIES}
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

      <PromoBand />
      <Footer />
    </div>
  );
}