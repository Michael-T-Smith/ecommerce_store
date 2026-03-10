
export default function StatusBadge({ label, color, dot = false }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 font-sans font-extrabold text-[10px] tracking-[1px] uppercase px-2.5 py-1 border whitespace-nowrap"
      style={{
        color,
        borderColor : `${color}50`,
        background  : `${color}12`,
      }}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse"
          style={{ background: color }}
        />
      )}
      {label}
    </span>
  );
}