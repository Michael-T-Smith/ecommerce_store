"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams }  from "next/navigation";
import Link                 from "next/link";
import AnnouncementBar      from "@/app/components/AnnouncementBar/AnnouncementBar";
import Navbar               from "@/app/components/Navbar/Navbar";
import OccasionsIntro       from "@/app/components/OccasionsIntro/OccasionsIntro";
import OccasionCard         from "@/app/components/OccasionCard/OccasionCard";
import Footer               from "@/app/components/Footer/Footer";
import BirdLogo             from "@/app/components/icons/BirdLogo";
import { C }                from "@/lib/brand";

// Normalize DB snake_case row → camelCase shape expected by OccasionCard
function normalizeCollection(c) {
  return {
    id         : c.slug,
    slug       : c.slug,
    label      : c.label,
    emoji      : c.emoji,
    accentColor: c.accent_color,
    lightText  : c.light_text,
    headline   : c.headline,
    subheadline: c.subheadline,
    bodyCopy   : c.body_copy,
    tags       : c.tags ?? [],
  };
}

function CollectionsContent() {
  const [openCardId,        setOpenCardId       ] = useState(null);
  const [collections,       setCollections      ] = useState([]);
  const [itemsByCollection, setItemsByCollection] = useState({});
  const searchParams = useSearchParams();

  useEffect(() => {
    Promise.all([
      fetch("/api/public/collections").then((r) => r.json()),
      fetch("/api/public/inventory").then((r) => r.json()),
    ]).then(([colRes, invRes]) => {
      setCollections((colRes.data ?? []).map(normalizeCollection));

      const map = {};
      (invRes.data ?? []).forEach((item) => {
        (item.collectionIds ?? []).forEach((slug) => {
          if (!map[slug]) map[slug] = [];
          map[slug].push(item);
        });
      });
      setItemsByCollection(map);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const open = searchParams.get("open");
    if (open) {
      setOpenCardId(open);
      setTimeout(() => {
        const el = document.getElementById(`occasion-${open}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [searchParams]);

  const handleToggle = (id) =>
    setOpenCardId((prev) => (prev === id ? null : id));

  return (
    <div className="font-sans bg-brand-cream min-h-screen overflow-x-hidden">
      <AnnouncementBar />
      <Navbar />

      {/* ═══════════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-brand-black relative overflow-hidden">

        {/* Paper grain */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23g)' opacity='0.055'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "200px 200px",
          }}
        />

        {/* Watermark BirdLogo */}
        <div className="absolute right-0 top-0 bottom-0 flex items-center pr-8 lg:pr-16 pointer-events-none select-none opacity-[0.04]">
          <BirdLogo size={320} color={C.cream} />
        </div>

        <div className="relative z-10 px-5 sm:px-10 lg:px-16 pt-12 sm:pt-16">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 font-sans text-[10px] font-extrabold tracking-[3px] uppercase text-brand-smoke mb-12">
            <Link href="/" className="text-brand-smoke hover:text-brand-orange transition-colors no-underline">
              Home
            </Link>
            <span className="text-brand-orange">◆</span>
            <span className="text-brand-orange">Collections</span>
          </div>

          {/* Eyebrow */}
          <div className="flex items-center gap-2 font-sans text-[10px] font-extrabold tracking-[4px] uppercase text-brand-orange mb-6">
            <BirdLogo size={14} color={C.blush} />
            {collections.length} Collections
          </div>

          {/* Headline */}
          <h1 className="font-serif font-black leading-[0.95] tracking-[-3px] m-0">
            <span className="block text-[52px] sm:text-[76px] lg:text-[108px] text-brand-cream">
              Start with what
            </span>
            <span className="block text-[52px] sm:text-[76px] lg:text-[108px] text-brand-orange italic">
              you feel.
            </span>
          </h1>

          <p className="font-sans text-brand-smoke text-[13px] sm:text-[15px] mt-8 mb-16 sm:mb-20 max-w-[380px] leading-relaxed">
            The rest will follow.
          </p>
        </div>

        {/* Soft bottom fade */}
        <div
          className="h-12 w-full"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(14,14,14,0.6))" }}
        />
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          INTRO
      ═══════════════════════════════════════════════════════════════ */}
      <OccasionsIntro />

      {/* ═══════════════════════════════════════════════════════════════
          COLLECTION ACCORDION
      ═══════════════════════════════════════════════════════════════ */}
      <main className="px-5 sm:px-10 lg:px-16 py-10 sm:py-14 flex flex-col gap-5 sm:gap-6">
        {collections.map((occasion, i) => (
          <div key={occasion.slug} id={`occasion-${occasion.slug}`}>
            <OccasionCard
              occasion={occasion}
              catalogItems={itemsByCollection[occasion.slug] ?? []}
              isOpen={openCardId === occasion.slug}
              onToggle={() => handleToggle(occasion.slug)}
              onAddToCart={() => {}}
              index={i}
            />
          </div>
        ))}
      </main>

      {/* ═══════════════════════════════════════════════════════════════
          BOTTOM CTA
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-brand-black border-t-[6px] border-brand-orange px-5 sm:px-10 lg:px-16 py-14 sm:py-20 relative overflow-hidden">

        {/* Paper grain */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23g)' opacity='0.05'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "200px 200px",
          }}
        />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-8 max-w-[1200px]">
          <div>
            <div className="flex items-center gap-2 font-sans text-[10px] font-extrabold tracking-[4px] uppercase text-brand-orange mb-4">
              <BirdLogo size={14} color={C.blush} />
              Still Looking?
            </div>
            <h3 className="font-serif font-black text-brand-cream text-[28px] sm:text-[36px] tracking-[-1px] leading-[1.1] mb-3">
              Every piece has a place.<br />
              <span className="text-brand-orange italic">Yours might be in the full shop.</span>
            </h3>
            <p className="font-sans text-brand-smoke text-[13px] sm:text-[14px] leading-relaxed max-w-[420px]">
              Not every piece fits a collection — and that&apos;s exactly the point.
              Browse everything we carry and find what speaks to you.
            </p>
          </div>

          <div className="flex-shrink-0">
            <Link
              href="/shop"
              className="inline-block bg-brand-orange text-brand-black border-[3px] border-brand-orange px-8 py-4 font-sans font-black text-[12px] tracking-[2px] uppercase no-underline shadow-retro-md hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all duration-100"
            >
              Browse All →
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default function CollectionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-cream" />}>
      <CollectionsContent />
    </Suspense>
  );
}
