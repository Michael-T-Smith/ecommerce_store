
import BirdLogo from "@/app/components/icons/BirdLogo";
import { C }      from "@/lib/brand";

export default function OccasionsIntro() {
  return (
    <section className="bg-brand-cream px-5 sm:px-10 lg:px-16 py-12 sm:py-16 border-b-[3px] border-brand-black/10">
      <div className="max-w-[720px]">

        <div className="flex items-center gap-2 font-sans text-[10px] font-extrabold tracking-[4px] text-brand-orange uppercase mb-4">
          <BirdLogo size={16} color={C.blush} />
          Start Here
        </div>

        <h2 className="font-serif font-black text-brand-black text-[32px] sm:text-[40px] tracking-[-1.5px] leading-[1.05] mb-4">
          Find what speaks to you.<br />
          <span className="text-brand-orange">BityBird gathers with intention.</span>
        </h2>

        <p className="font-sans text-brand-smoke text-[14px] sm:text-[15px] leading-[1.8] max-w-[560px]">
          Explore collections of handcrafted pieces and restored treasures —
          each one shaped, mended, or chosen by Us.
          These aren&apos;t categories, but groupings of objects that share a feeling, a texture, a story.
        </p>

        <div className="mt-10 flex items-center gap-3">
          <div className="h-[2px] w-10" style={{ background: C.gold }} />
          <div className="h-[1px] flex-1 bg-brand-black/10" />
        </div>
      </div>
    </section>
  );
}
