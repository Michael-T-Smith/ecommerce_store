
"use client";

import { useState, useEffect } from "react";
import { useSearchParams }     from "next/navigation";
import AnnouncementBar    from "@/app/components/AnnouncementBar/AnnouncementBar";
import Navbar             from "@/app/components/Navbar/Navbar";
import ShopBanner         from "@/app/components/ShopBanner/ShopBanner";
import OccasionsIntro     from "@/app/components/OccasionsIntro/OccasionsIntro";
import OccasionCard       from "@/app/components/OccasionCard/OccasionCard";
import PromoBand          from "@/app/components/PromoBand/PromoBand";
import Footer             from "@/app/components/Footer/Footer";
import { OCCASIONS_DATA } from "@/lib/occasions";
import { CATALOG }        from "@/lib/data";

// Cross-reference: resolve productIds to actual CATALOG objects
function resolveProducts(productIds) {
  return productIds
    .map((id) => CATALOG.find((item) => item.id === id))
    .filter(Boolean);
}

export default function OccasionsPage() {
  const [cartCount,  setCartCount ] = useState(0);
  const [openCardId, setOpenCardId] = useState(null);
  const searchParams = useSearchParams();

  // If the page is linked with ?open=anniversary (e.g. from hero
  // occasion ticker or external link), auto-expand that card.
  useEffect(() => {
    const open = searchParams.get("open");
    if (open) {
      setOpenCardId(open);
      // Scroll to the card after render
      setTimeout(() => {
        const el = document.getElementById(`occasion-${open}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [searchParams]);

  const handleToggle = (id) => {
    setOpenCardId((prev) => (prev === id ? null : id));
  };

  const addToCart = () => setCartCount((c) => c + 1);

  return (
    <div className="font-serif bg-brand-cream min-h-screen overflow-x-hidden">
      <AnnouncementBar />
      <Navbar cartCount={cartCount} onCartClick={addToCart} />

      <ShopBanner
        title="Occasions"
        subtitle="Not sure what to order? Start with why you're sending — we'll handle the rest."
      />

      <OccasionsIntro />

      {/* Occasion accordion */}
      <main className="px-5 sm:px-10 lg:px-16 py-10 sm:py-14 flex flex-col gap-5 sm:gap-6">
        {OCCASIONS_DATA.map((occasion) => (
          <div key={occasion.id} id={`occasion-${occasion.id}`}>
            <OccasionCard
              occasion={occasion}
              catalogItems={resolveProducts(occasion.productIds)}
              isOpen={openCardId === occasion.id}
              onToggle={() => handleToggle(occasion.id)}
              onAddToCart={addToCart}
            />
          </div>
        ))}
      </main>

      {/* Bottom CTA — nudge undecided shoppers to the full shop */}
      <section className="bg-brand-black border-t-[3px] border-brand-orange px-5 sm:px-10 lg:px-16 py-12 sm:py-16 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `repeating-linear-gradient(-55deg,
              transparent 0, transparent 60px,
              rgba(212,81,26,0.05) 60px, rgba(212,81,26,0.05) 70px)`,
          }}
        />
        <div className="relative z-10">
          <h3 className="font-serif font-black text-brand-cream text-[28px] sm:text-[34px] tracking-[-1px] leading-[1.1] mb-2">
            Still not sure?
          </h3>
          <p className="font-sans text-brand-smoke text-[13px] sm:text-[14px] leading-relaxed max-w-[400px]">
            Browse everything in the shop or call us — Cecelia and Frank are
            happy to help you find the right arrangement.
          </p>
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row gap-3">
          <a
            href="/shop"
            className="bg-brand-orange text-brand-cream border-[3px] border-brand-orange px-8 py-4 font-sans font-black text-[12px] tracking-[2px] uppercase no-underline shadow-retro-md hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-retro-sm transition-all duration-100 text-center"
          >
            Browse All Flowers →
          </a>
          <a
            href="/delivery"
            className="bg-transparent text-brand-cream border-[3px] border-brand-cream px-8 py-4 font-sans font-black text-[12px] tracking-[2px] uppercase no-underline hover:bg-brand-cream hover:text-brand-black transition-colors duration-150 text-center"
          >
            Delivery Info
          </a>
        </div>
      </section>

      <PromoBand />
      <Footer />
    </div>
  );
}
