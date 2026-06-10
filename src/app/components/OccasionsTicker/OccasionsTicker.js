
import { OCCASIONS } from "@/lib/data";

export default function OccasionsTicker() {
  const items = [...OCCASIONS, ...OCCASIONS, ...OCCASIONS];

  return (
    <div className="bg-brand-black border-t-[3px] border-b-[3px] border-brand-orange py-[16px] sm:py-[18px] flex overflow-x-auto scrollbar-none">
      {items.map((occasion, i) => (
        <div
          key={i}
          className={`flex items-center gap-4 sm:gap-5 px-5 sm:px-7 whitespace-nowrap font-sans text-[10px] sm:text-[11px] font-extrabold tracking-[2px] sm:tracking-[3px] uppercase cursor-pointer flex-shrink-0 ${
            i % 2 === 0 ? "text-brand-orange" : "text-brand-cream"
          }`}
        >
          {occasion}
          <span className="text-brand-gold text-sm sm:text-base">◆</span>
        </div>
      ))}
    </div>
  );
}
