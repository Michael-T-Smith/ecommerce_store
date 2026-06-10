
export default function FlowerMark({ size = 44, fill = "#FAF8F4", stroke = "#0E0E0E" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <ellipse
          key={deg}
          cx="22" cy="22" rx="5" ry="10"
          fill={fill}
          stroke={stroke}
          strokeWidth="1.4"
          transform={`rotate(${deg} 22 22) translate(0 -8)`}
        />
      ))}
      <circle cx="22" cy="22" r="5" fill="#C08FA3" stroke={stroke} strokeWidth="1.4" />
    </svg>
  );
}

