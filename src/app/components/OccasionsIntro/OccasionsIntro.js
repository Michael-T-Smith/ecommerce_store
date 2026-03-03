
import FlowerMark from "@/app/components/icons/FlowerMark";
import { B }      from "@/lib/brand";

export default function OccasionsIntro() {
  return (
    <section className="bg-brand-cream px-5 sm:px-10 lg:px-16 py-12 sm:py-16 border-b-[3px] border-brand-black/10">
      <div className="max-w-[720px]">

        <div className="flex items-center gap-2 font-sans text-[10px] font-extrabold tracking-[4px] text-brand-orange uppercase mb-4">
          <FlowerMark size={16} fill={B.orange} stroke={B.orange} />
          Start Here
        </div>

        <h2 className="font-serif font-black text-brand-black text-[32px] sm:text-[40px] tracking-[-1.5px] leading-[1.05] mb-4">
          You know the moment.<br />
          <span className="text-brand-orange">We know the flowers.</span>
        </h2>

        <p className="font-sans text-brand-smoke text-[14px] sm:text-[15px] leading-[1.8] max-w-[560px]">
          Pick the occasion below and we'll show you exactly what works —
          curated from our studio by Cecelia & Frank, not an algorithm.
          Each recommendation is handpicked for the emotion behind it.
        </p>
      </div>

      {/* Divider stripe */}
      <div className="mt-10 flex gap-[3px]">
        {[B.orange, B.gold, B.orange, B.black, B.orange, B.gold, B.orange].map((c, i) => (
          <div key={i} style={{ background: c }} className="h-[4px] flex-1" />
        ))}
      </div>
    </section>
  );
}