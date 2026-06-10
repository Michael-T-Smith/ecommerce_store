
import BirdLogo from "@/app/components/icons/BirdLogo";
import { C }      from "@/lib/brand";
import { Playfair_Display } from 'next/font/google';

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

export default function AboutStory() {
  return (
    <section className="bg-brand-cream px-5 sm:px-10 lg:px-16 py-16 sm:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

        {/* ── LEFT: Photo placeholder ── */}
        <div className="relative">
          {/* Main photo frame */}
          <div
            className="w-full aspect-[4/5]  border-brand-black relative overflow-hidden"
          >
            {/* Stripe texture stands in until real photo is dropped in */}
            <div
              className="absolute inset-0"
              style={{
                background: `#a5a5a5`,
              }}
            />
            {/* Placeholder label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-120 z-10 p-32">
              <BirdLogo size={64} color={C.cream} />
              <span className={`text-[28px] tracking-[4px] leading-[80px] text-brand-cream ${playfair.className}`}>
                You are a mosaic of moments - the tender ones, the heavy ones, the ones that lift you up and the shadows you walk through before you knew you were strong enough to survive. But here you are, every peice matters, every peice belongs, and together they create the beautiful story of you.
              </span>
            </div>
          </div>

          {/* Floating caption badge */}
          <div
            className="absolute -bottom-4 -right-4 sm:-bottom-5 sm:-right-5 bg-brand-orange border-[3px] border-brand-black px-5 py-3 shadow-retro-sm z-20"
          >
            <div className="font-sans font-extrabold text-[9px] tracking-[3px] uppercase text-brand-cream/80 mb-0.5">
              Est. 2024
            </div>
            <div className="font-serif font-black text-brand-cream text-[18px] tracking-[-0.5px] leading-none">
              BityBird Co.
            </div>
          </div>
        </div>

        {/* ── RIGHT: Narrative ── */}
        <div className="flex flex-col gap-6">

          <div className="flex items-center gap-2 font-sans text-[10px] font-extrabold tracking-[4px] text-brand-orange uppercase">
            <BirdLogo size={16} color={C.blush} />
            Our Story
          </div>

          <h2 className="font-serif font-black text-brand-black text-[36px] sm:text-[44px] lg:text-[52px] tracking-[-2px] leading-[1.05] m-0">
            Every piece tells a<br />
            <span className="text-brand-orange">Story.</span><br />
          </h2>

          <div className="flex flex-col gap-5 font-sans text-[14px] sm:text-[15px] text-brand-smoke leading-[1.8]">
            <p>
              BityBird Co was created to remind you that every part of your story matters —  The hard moments, the healing ones, and everything in between.
            </p>
          </div>

          {/* Signature detail */}
          <div className="flex items-center gap-4 pt-2 border-t-[2px] border-brand-black/10">
            <div className="w-12 h-12 bg-brand-orange rounded-full border-[3px] border-brand-black flex items-center justify-center flex-shrink-0">
              <BirdLogo size={28} color={C.cream} />
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
  );
}
