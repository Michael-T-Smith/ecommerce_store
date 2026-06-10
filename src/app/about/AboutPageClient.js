"use client";

import Link                from "next/link";
import { Playfair_Display } from "next/font/google";
import AnnouncementBar     from "@/app/components/AnnouncementBar/AnnouncementBar";
import Navbar              from "@/app/components/Navbar/Navbar";
import AboutLocations      from "@/app/components/AboutLocations/AboutLocations";
import Footer              from "@/app/components/Footer/Footer";
import BirdLogo            from "@/app/components/icons/BirdLogo";
import { C }               from "@/lib/brand";

const playfair = Playfair_Display({
  subsets : ["latin"],
  display : "swap",
  variable: "--font-playfair",
});

const VALUES = [
  {
    number  : "01",
    headline: "Made to Last. Every Piece.",
    body    : "We don't carry mass-produced goods. Every item is either handcrafted or carefully restored — which is exactly why each one holds up.",
    accent  : C.blush,
  },
  {
    number  : "02",
    headline: "Made by Hand. Always.",
    body    : "No assembly line. No duplicates. Every handcrafted piece is a genuine creative decision and every refurbished find is chosen by hand — not picked from a catalog.",
    accent  : C.gold,
  },
  {
    number  : "03",
    headline: "One of a Kind. Always.",
    body    : "When it's gone, it's gone. We source refurbished and handcrafted goods that can't be reordered off a shelf — so what you buy is truly yours alone.",
    accent  : C.lightGrey,
  },
];

export default function AboutPageClient() {
  return (
    <div className={`${playfair.variable} font-sans bg-brand-cream min-h-screen overflow-x-hidden`}>
      <AnnouncementBar />
      <Navbar />

      {/* ═══════════════════════════════════════════════════════════════
          HERO — dark editorial banner
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-brand-black relative overflow-hidden">

        {/* Paper grain overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23g)' opacity='0.055'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "200px 200px",
          }}
        />

        {/* Watermark BirdLogo */}
        <div className="absolute right-0 top-0 bottom-0 flex items-center pr-8 lg:pr-16 pointer-events-none select-none opacity-[0.05]">
          <BirdLogo size={340} color={C.cream} />
        </div>

        <div className="relative z-10 px-5 sm:px-10 lg:px-16 pt-12 pb-0 sm:pt-16">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 font-sans text-[10px] font-extrabold tracking-[3px] uppercase text-brand-smoke mb-12">
            <Link href="/" className="text-brand-smoke hover:text-brand-orange transition-colors no-underline">
              Home
            </Link>
            <span className="text-brand-orange">◆</span>
            <span className="text-brand-orange">Our Story</span>
          </div>

          {/* Eyebrow */}
          <div className="flex items-center gap-2 font-sans text-[10px] font-extrabold tracking-[4px] uppercase text-brand-orange mb-6">
            <BirdLogo size={14} color={C.blush} />
            BityBird Co · Est. 2024
          </div>

          {/* Hero headline */}
          <h1 className="font-serif font-black leading-[0.95] tracking-[-3px] m-0">
            <span className="block text-[52px] sm:text-[76px] lg:text-[108px] text-brand-cream">
              Every piece
            </span>
            <span className="block text-[52px] sm:text-[76px] lg:text-[108px] text-brand-orange italic">
              tells a Story.
            </span>
          </h1>

          <p className="font-sans text-brand-smoke text-[13px] sm:text-[15px] mt-8 mb-16 sm:mb-20 max-w-[360px] leading-relaxed tracking-[0.5px]">
            Every piece of your story matters.
          </p>
        </div>

        {/* Soft bottom edge — fades hero into next section */}
        <div
          className="h-12 w-full"
          style={{
            background: `linear-gradient(to bottom, transparent, rgba(14,14,14,0.6))`,
          }}
        />
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          STORY — photo left, copy right
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-brand-cream px-5 sm:px-10 lg:px-16 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Photo frame — quote overlaid */}
          <div className="relative">
            <div className="w-full aspect-[4/5] bg-[#9A9096] overflow-hidden relative">
              {/* Paper grain on photo placeholder */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23g)' opacity='0.09'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "repeat",
                  backgroundSize: "200px 200px",
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 sm:p-10 z-10 gap-8">
                <BirdLogo size={330} color={C.cream} style={{ opacity: 0.9 }} />
                <p
                  className={`text-[13px] sm:text-[15px] leading-[2] text-brand-cream text-center italic ${playfair.variable} font-serif`}
                  style={{ opacity: 0.8 }}
                >
                  "You are a mosaic of moments — the tender ones, the heavy ones, the ones
                  that lift you up and the shadows you walk through before you knew you were
                  strong enough to survive. But here you are. Every piece matters. Every piece
                  belongs. Together they create the beautiful story of you."
                </p>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 -right-4 sm:-bottom-5 sm:-right-5 bg-brand-orange border-[3px] border-brand-black px-5 py-3 shadow-retro-sm z-20">
              <div className="font-sans font-extrabold text-[9px] tracking-[3px] uppercase text-brand-black/60 mb-0.5">
                Est. 2024
              </div>
              <div className="font-serif font-black text-brand-black text-[18px] tracking-[-0.5px] leading-none">
                BityBird Co.
              </div>
            </div>
          </div>

          {/* Story copy */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 font-sans text-[10px] font-extrabold tracking-[4px] text-brand-orange uppercase">
              <BirdLogo size={16} color={C.blush} />
              Our Story
            </div>

            <h2 className="font-serif font-black text-brand-black text-[34px] sm:text-[44px] lg:text-[50px] tracking-[-2px] leading-[1.05] m-0">
              Every part of<br />
              <span className="text-brand-orange">your story</span><br />
              matters.
            </h2>

            <div className="flex flex-col gap-5 font-sans text-[14px] sm:text-[15px] text-brand-smoke leading-[1.85]">
              

                <p>🕊️ Our Story</p>

                <p>Bity Bird Co. didn’t begin from a place of certainty.</p>

                <p>It began in a moment in my life when I was going through a lot of change. I didn’t have everything figured out. I didn’t feel fully ready.</p>
                <p>Honestly, I still don’t have it all figured out, and I’m still not ready.</p>

                <p>Even though I was scared to move forward, I chose to start anyway.</p>

                <p>This brand was built in that space — the in-between. The place where growth is happening, even when it feels uncomfortable. Where you’re learning to trust yourself, one small step at a time.</p>

                <p>Bity Bird Co. is rooted in the belief that your story doesn’t need to be perfect to be meaningful. The hard moments, the healing, the uncertainty—they all belong. Every part of your journey matters.</p>

                <p>Each piece we create is designed to feel like something more than just an object. It’s a reminder you can carry with you. A quiet voice that says you’re allowed to begin, even if you’re unsure. That you don’t have to silence fear—you just don’t let it choose where you go.</p>


                <p>Starting Bity Bird Co. was a step I was afraid to take , but staying where I was—standing at the edge, too afraid to move—felt worse. It felt like I was letting myself down.</p>

                <p>So I stepped into the unknown.</p>

                <p>I didn’t start loudly or with everything perfectly in place. I did what I always do—I closed my eyes, took a breath to calm my racing heart, and then I just stepped.</p>

                <p>With that step came everything—support, growth, and also voices from people who don’t know me but still have something negative to say. That happens. And that’s okay.</p>

                <p>I’m not building this for them.</p>

                <p>I’m here for the ones like me—the ones in the messy middle of change. The ones who keep showing up even when it’s hard. The ones who say “I’m fine” when they’re anything but. The ones still becoming who they’re meant to be.</p>

                <p>If you’re here, maybe you’re standing in that same moment.</p>

                <p>Take a deep breath.<br />
                Open your eyes.<br />
                Now step.</p>

                <p>We got this.</p>
                <p> — Candice 🤍</p>

                <p>P.S.</p>

                <p>When I was young, my grandmother told me not to get stuck looking above me, wishing for more, but to appreciate what I already had—because someone else might be wishing for what I once thought was “not enough.”
                She also told me I would never go wrong helping someone. That stayed with me, and I’ve carried it ever since.
                Because of you, this brand is able to stand for something bigger. Each quarter, a portion of our sales goes to organizations making a real difference in people’s lives—not just the well-known ones, but also the smaller ones quietly showing up for those who need them most.</p>





            </div>

            {/* Divider accent */}
            <div className="flex items-center gap-3 py-1">
              <div className="h-[2px] w-10" style={{ background: C.gold }} />
              <div className="h-[1px] flex-1 bg-brand-black/10" />
            </div>

            {/* Candice signature */}
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-brand-orange rounded-full border-[3px] border-brand-black flex items-center justify-center flex-shrink-0">
                <BirdLogo size={35} color={C.black} />
              </div>
              <div>
                <div className="font-serif font-black text-brand-black text-[16px] tracking-[-0.5px]">
                  Candice Morgan
                </div>
                <div className="font-sans text-[11px] font-extrabold tracking-[2px] uppercase text-brand-smoke">
                  Owner, BityBird Co.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          VALUES — dark, numbered alternating rows
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-brand-black border-t-[6px] border-brand-orange relative overflow-hidden">

        {/* Paper grain overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23g)' opacity='0.05'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "200px 200px",
          }}
        />

        {/* Section label */}
        <div className="relative z-10 px-5 sm:px-10 lg:px-16 pt-16 sm:pt-20 pb-6">
          <div className="font-sans text-[10px] font-extrabold tracking-[4px] uppercase text-brand-orange">
            ✦ What We Believe
          </div>
        </div>

        {/* Value rows */}
        <div className="relative z-10">
          {VALUES.map((v, i) => (
            <div
              key={v.number}
              className={`
                px-5 sm:px-10 lg:px-16 py-10 sm:py-14
                border-t border-brand-cream/10
                grid grid-cols-1 sm:grid-cols-[200px_1fr] lg:grid-cols-[260px_1fr] gap-6 sm:gap-16 items-start
                ${i === VALUES.length - 1 ? "pb-20 sm:pb-28" : ""}
              `}
            >
              {/* Number column */}
              <div className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-2">
                <div
                  className="font-serif font-black text-[72px] sm:text-[88px] leading-none tracking-[-4px]"
                  style={{ color: v.accent }}
                >
                  {v.number}
                </div>
                <div className="flex gap-1 sm:flex-col sm:gap-1 mt-1">
                  <div className="w-6 h-[3px] sm:w-[3px] sm:h-6" style={{ background: v.accent }} />
                  <div className="w-2 h-[3px] sm:w-[3px] sm:h-2 opacity-40" style={{ background: C.gold }} />
                </div>
              </div>

              {/* Text column */}
              <div className="pt-0 sm:pt-4">
                <h3 className="font-serif font-black text-brand-cream text-[22px] sm:text-[28px] tracking-[-0.5px] leading-[1.2] mb-4">
                  {v.headline}
                </h3>
                <p className="font-sans text-brand-smoke text-[13px] sm:text-[14px] leading-[1.9] max-w-[500px]">
                  {v.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <AboutLocations />
      <Footer />
    </div>
  );
}
