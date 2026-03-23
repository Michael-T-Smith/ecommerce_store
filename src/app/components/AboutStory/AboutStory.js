
import FlowerMark from "@/app/components/icons/FlowerMark";
import { B }      from "@/lib/brand";

export default function AboutStory() {
  return (
    <section className="bg-brand-cream px-5 sm:px-10 lg:px-16 py-16 sm:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

        {/* ── LEFT: Photo placeholder ── */}
        <div className="relative">
          {/* Main photo frame */}
          <div
            className="w-full aspect-[4/5] bg-brand-bark border-[4px] border-brand-black relative overflow-hidden shadow-retro-lg"
          >
            {/* Stripe texture stands in until real photo is dropped in */}
            <div
              className="absolute inset-0"
              style={{
                background: `repeating-linear-gradient(-55deg,
                  transparent 0px, transparent 40px,
                  rgba(212,81,26,0.12) 40px, rgba(212,81,26,0.12) 48px,
                  transparent 48px, transparent 56px,
                  rgba(212,81,26,0.06) 56px, rgba(212,81,26,0.06) 60px)`,
              }}
            />
            {/* Placeholder label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10">
              <FlowerMark size={64} fill={B.cream} stroke={B.cream} />
              <span className="font-sans font-extrabold text-[10px] tracking-[4px] uppercase text-brand-cream/60">
                Photo of Cecelia &amp; Frank
              </span>
            </div>
            {/* Gold pinstripe ring overlay */}
            <div
              className="absolute inset-[20px] border-2 border-brand-gold/40 pointer-events-none"
            />
          </div>

          {/* Floating caption badge */}
          <div
            className="absolute -bottom-4 -right-4 sm:-bottom-5 sm:-right-5 bg-brand-orange border-[3px] border-brand-black px-5 py-3 shadow-retro-sm z-20"
          >
            <div className="font-sans font-extrabold text-[9px] tracking-[3px] uppercase text-brand-cream/80 mb-0.5">
              Est. Piedmont, AL
            </div>
            <div className="font-serif font-black text-brand-cream text-[18px] tracking-[-0.5px] leading-none">
              Lamb&apos;s Florist
            </div>
          </div>

          {/* Pinstripe accent bar — left edge */}
          <div className="absolute -left-3 top-8 bottom-8 flex flex-col gap-[3px]">
            {[B.orange, B.gold, B.orange].map((c, i) => (
              <div key={i} style={{ background: c }} className="flex-1 w-[6px]" />
            ))}
          </div>
        </div>

        {/* ── RIGHT: Narrative ── */}
        <div className="flex flex-col gap-6">

          <div className="flex items-center gap-2 font-sans text-[10px] font-extrabold tracking-[4px] text-brand-orange uppercase">
            <FlowerMark size={16} fill={B.orange} stroke={B.orange} />
            Our Story
          </div>

          <h2 className="font-serif font-black text-brand-black text-[36px] sm:text-[44px] lg:text-[52px] tracking-[-2px] leading-[1.05] m-0">
            Rooted in<br />
            <span className="text-brand-orange">Piedmont.</span><br />
            Built on Flowers.
          </h2>

          <div className="flex flex-col gap-5 font-sans text-[14px] sm:text-[15px] text-brand-smoke leading-[1.8]">
            <p>
              Lamb&apos;s Florist started the way most good things do — with a person
              who simply loved what they did. Cecelia Lamb has spent decades
              learning the language of flowers: which blooms hold up in Alabama
              heat, which combinations catch the eye, which arrangements make
              people stop and stare.
            </p>
            <p>
              Frank keeps everything running. The deliveries, the logistics, the
              quiet reliability that makes a florist shop feel like a promise you
              can count on. Together they've built something that doesn&apos;t just
              sell flowers — it marks moments.
            </p>
            <p>
              With locations serving the Piedmont, Anniston, and Centre areas,
              Lamb&apos;s has become the shop people call when it matters. Births.
              Funerals. Anniversaries. Tuesdays.
            </p>
          </div>

          {/* Signature detail */}
          <div className="flex items-center gap-4 pt-2 border-t-[2px] border-brand-black/10">
            <div className="w-12 h-12 bg-brand-orange rounded-full border-[3px] border-brand-black flex items-center justify-center flex-shrink-0">
              <FlowerMark size={28} fill={B.cream} stroke={B.black} />
            </div>
            <div>
              <div className="font-serif font-black text-brand-black text-[16px] tracking-[-0.5px]">
                Cecelia &amp; Frank Lamb
              </div>
              <div className="font-sans text-[11px] font-extrabold tracking-[2px] uppercase text-brand-smoke">
                Owners, Lamb&apos;s Florist
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
