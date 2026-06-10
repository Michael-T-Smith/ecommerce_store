
export default function StatCard({ label, value, sub, icon, accent, trend }) {
  return (
    <div
      className="bg-white border border-gray-200 p-5 flex flex-col gap-4 relative overflow-hidden"
      style={{ borderLeft: `4px solid ${accent}` }}
    >
      {/* Icon */}
      <div
        className="w-9 h-9 flex items-center justify-center flex-shrink-0"
        style={{ background: `${accent}18` }}
      >
        <span style={{ color: accent }}>{icon}</span>
      </div>

      {/* Value */}
      <div>
        <div className="font-serif font-black text-[32px] text-brand-black tracking-[-1.5px] leading-none mb-1">
          {value}
        </div>
        <div className="font-sans font-extrabold text-[11px] text-brand-smoke tracking-[0.5px]">
          {label}
        </div>
        {sub && (
          <div className="font-sans text-[11px] text-brand-smoke/60 mt-0.5">{sub}</div>
        )}
      </div>

      {/* Trend */}
      {trend && trend.direction && (
        <div className={`flex items-center gap-1.5 font-sans font-extrabold text-[11px] ${
          trend.direction === "up" ? "text-green-600" : "text-red-500"
        }`}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            {trend.direction === "up"
              ? <polyline points="18 15 12 9 6 15" />
              : <polyline points="6 9 12 15 18 9" />
            }
          </svg>
          {trend.label}
        </div>
      )}
    </div>
  );
}
