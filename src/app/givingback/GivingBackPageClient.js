"use client";

import Link            from "next/link";
import AnnouncementBar from "@/app/components/AnnouncementBar/AnnouncementBar";
import Navbar          from "@/app/components/Navbar/Navbar";
import Footer          from "@/app/components/Footer/Footer";
import BirdLogo        from "@/app/components/icons/BirdLogo";
import { C }           from "@/lib/brand";

const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23g)' opacity='0.055'/%3E%3C/svg%3E")`;

export default function GivingBackPageClient({ initiatives = [], dbError = false }) {
  return (
    <div className="font-sans bg-brand-cream min-h-screen overflow-x-hidden">
      <AnnouncementBar />
      <Navbar />

      {/* ── HERO ── */}
      <section className="bg-brand-black relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: GRAIN, backgroundRepeat: "repeat", backgroundSize: "200px 200px" }}
        />
        <div className="absolute right-0 top-0 bottom-0 flex items-center pr-8 lg:pr-16 pointer-events-none select-none opacity-[0.04]">
          <BirdLogo size={320} color={C.cream} />
        </div>

        <div className="relative z-10 px-5 sm:px-10 lg:px-16 pt-12 sm:pt-16">
          <div className="flex items-center gap-2 font-sans text-[10px] font-extrabold tracking-[3px] uppercase text-brand-smoke mb-12">
            <Link href="/" className="text-brand-smoke hover:text-brand-orange transition-colors no-underline">Home</Link>
            <span className="text-brand-orange">◆</span>
            <span className="text-brand-orange">Giving Back</span>
          </div>

          <div className="flex items-center gap-2 font-sans text-[10px] font-extrabold tracking-[4px] uppercase text-brand-orange mb-6">
            <BirdLogo size={14} color={C.blush} />
            Community
          </div>

          <h1 className="font-serif font-black leading-[0.95] tracking-[-3px] m-0">
            <span className="block text-[52px] sm:text-[76px] lg:text-[108px] text-brand-cream">
              Every purchase
            </span>
            <span className="block text-[52px] sm:text-[76px] lg:text-[108px] text-brand-orange italic">
              gives back.
            </span>
          </h1>

          <p className="font-sans text-brand-smoke text-[13px] sm:text-[15px] mt-8 mb-16 sm:mb-20 max-w-[420px] leading-relaxed">
            Every purchase at BityBird Co helps fund something real in our community.
          </p>
        </div>

        <div className="h-12 w-full" style={{ background: "linear-gradient(to bottom, transparent, rgba(14,14,14,0.6))" }} />
      </section>

      {/* ── MISSION STATEMENT ── */}
      <section className="bg-brand-black border-b-[6px] border-brand-orange px-5 sm:px-10 lg:px-16 py-16 sm:py-20 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: GRAIN, backgroundRepeat: "repeat", backgroundSize: "200px 200px" }}
        />
        <div className="relative z-10 max-w-[760px]">
          <div className="font-sans text-[10px] font-extrabold tracking-[4px] uppercase text-brand-orange mb-4">
            ✦ Our Commitment
          </div>
          <h2 className="font-serif font-black text-brand-cream text-[32px] sm:text-[44px] lg:text-[52px] tracking-[-2px] leading-[1.05] mb-6">
            This store exists<br />
            <span className="text-brand-orange">for more than selling.</span>
          </h2>
          <p className="font-sans text-brand-smoke text-[14px] sm:text-[15px] leading-[1.85] max-w-[600px]">
            BityBird Co was built on the idea that buying something secondhand or handcrafted
            should feel good — not just for the person buying it, but for the community around it.
            A portion of every sale goes toward the people and programs listed below.
            No corporate matching. No press releases. Just real money going to real places.
          </p>
        </div>
      </section>

      {/* ── INITIATIVES ── */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 lg:px-16 py-16 sm:py-24">

        {dbError && (
          <div className="mb-10 px-4 py-3 border-2 border-brand-orange/40 bg-brand-orange/5 font-sans text-[12px] text-brand-smoke">
            ⚠ Showing preview content — database not connected.
          </div>
        )}

        {initiatives.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-[56px] mb-4">🌱</div>
            <p className="font-sans text-brand-smoke text-[14px]">
              Community initiatives coming soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {initiatives.map((item) => (
              <div key={item.id} className="border-[3px] border-brand-black bg-brand-cream shadow-retro-sm flex flex-col">

                {/* Solid accent bar — blush */}
                <div className="h-[4px] w-full flex-shrink-0" style={{ background: C.blush }} />

                <div className="p-6 sm:p-8 flex flex-col flex-1">
                  <div className="text-[44px] leading-none mb-5">{item.emoji}</div>

                  <h3 className="font-serif font-black text-brand-black text-[20px] sm:text-[22px] tracking-[-0.5px] leading-[1.2] mb-4">
                    {item.title}
                  </h3>

                  <p className="font-sans text-brand-smoke text-[13px] sm:text-[14px] leading-[1.8] flex-1 mb-5">
                    {item.description}
                  </p>

                  {item.impact_statement && (
                    <div className="border-t-[2px] border-brand-black/10 pt-4 mt-auto">
                      <div className="flex items-start gap-2.5">
                        <div className="w-1 flex-shrink-0 self-stretch" style={{ background: C.blush }} />
                        <p className="font-sans font-extrabold text-[11px] text-brand-black leading-relaxed">
                          {item.impact_statement}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── CTA BAND ── */}
      <section className="bg-brand-orange border-t-[3px] border-brand-black border-b-[3px] px-5 sm:px-10 lg:px-16 py-12 sm:py-14 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23g)' opacity='0.07'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "200px 200px",
          }}
        />
        <div className="relative z-10 max-w-[700px]">
          <h3 className="font-serif font-black text-brand-black text-[26px] sm:text-[32px] tracking-[-1px] leading-[1.15] mb-3">
            Every purchase makes this possible.
          </h3>
          <p className="font-sans text-brand-black/70 text-[13px] sm:text-[14px] leading-relaxed mb-6 max-w-[480px]">
            When you buy from BityBird Co — whether it&apos;s a refurbished find or a handcrafted piece
            — a portion goes directly to the work above. No extra steps. Just shop.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-3 font-sans font-black text-[11px] tracking-[2px] uppercase bg-brand-black text-brand-cream px-7 py-3.5 border-[3px] border-brand-black no-underline shadow-retro-sm hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all"
          >
            Shop the Collection
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
