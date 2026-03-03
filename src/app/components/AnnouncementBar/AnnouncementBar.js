
import { B } from "@/lib/brand";

export default function AnnouncementBar() {
  const stripes = [B.orange, B.cream, B.orange];

  return (
    <div className="bg-brand-black text-brand-cream flex items-center justify-center h-[38px] overflow-hidden">
      {/* Stripe clusters hidden on smallest screens to avoid overflow */}
      <div className="hidden sm:flex gap-[3px] mr-5">
        {stripes.map((c, i) => (
          <div key={i} className="w-[6px] h-[38px]" style={{ background: c }} />
        ))}
      </div>

      <span className="font-sans text-[9px] sm:text-[11px] font-bold tracking-[2px] sm:tracking-[3px] uppercase text-center px-4 sm:px-0">
        ✦ Free local delivery on orders over $60 · Piedmont &amp; Anniston ✦
      </span>

      <div className="hidden sm:flex gap-[3px] ml-5">
        {stripes.map((c, i) => (
          <div key={i} className="w-[6px] h-[38px]" style={{ background: c }} />
        ))}
      </div>
    </div>
  );
}
