"use client";

import { useState, useEffect, useRef } from "react";
import { ANNOUNCEMENT_CONFIG as CFG }  from "@/lib/announcementConfig";

// ── Background style per variant ─────────────────────────────────────────────
function getBackground() {
  switch (CFG.variant) {
    case "gradient":
      return {
        background: `linear-gradient(${CFG.gradient.angle}deg, ${CFG.gradient.from}, ${CFG.gradient.via}, ${CFG.gradient.to})`,
      };
    case "checkerboard": {
      const s = CFG.checkerboard.squareSize;
      const c1 = CFG.checkerboard.color1;
      const c2 = CFG.checkerboard.color2;
      return {
        backgroundImage: `
          linear-gradient(45deg, ${c1} 25%, transparent 25%),
          linear-gradient(-45deg, ${c1} 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, ${c1} 75%),
          linear-gradient(-45deg, transparent 75%, ${c1} 75%)`,
        backgroundSize : `${s * 2}px ${s * 2}px`,
        backgroundPosition: `0 0, 0 ${s}px, ${s}px -${s}px, -${s}px 0px`,
        backgroundColor: c2,
      };
    }
    case "neon":
      return {
        background: CFG.background,
        boxShadow : `0 0 12px 2px ${CFG.accentColor}60, inset 0 0 20px ${CFG.accentColor}20`,
      };
    case "solid":
    case "classic":
    default:
      return { background: CFG.background };
  }
}

// ── Stripe cluster ────────────────────────────────────────────────────────────
function Stripes({ side }) {
  const { stripes: S } = CFG;
  if (!S.enabled || S.position === "none") return null;
  if (S.position === "left"  && side === "right") return null;
  if (S.position === "right" && side === "left")  return null;

  const colors = S.colors.length ? S.colors : ["#BFA05C", "#FAF8F4", "#BFA05C"];
  const style  = { marginLeft: side === "left" ? 0 : S.margin, marginRight: side === "right" ? 0 : S.margin };

  return (
    <div className="hidden sm:flex flex-shrink-0" style={{ gap: S.gap, ...style }}>
      {colors.map((c, i) => (
        <div
          key={i}
          style={{ width: S.width, height: CFG.height, background: c, flexShrink: 0 }}
        />
      ))}
    </div>
  );
}

// ── Marquee wrapper ───────────────────────────────────────────────────────────
function MarqueeText({ text }) {
  const dur = `${Math.max(5, 100 / (CFG.marquee.speed / 10))}s`;
  return (
    <div className="overflow-hidden flex-1" style={{ maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}>
      <div
        className="whitespace-nowrap inline-flex"
        style={{
          animation: `bity-marquee ${dur} linear infinite`,
          gap      : CFG.marquee.gap,
        }}
      >
        {[text, text, text].map((t, i) => (
          <span key={i} style={{ marginRight: CFG.marquee.gap }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AnnouncementBar() {
  const [closed,   setClosed  ] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const [fading,   setFading  ] = useState(false);

  // Dismiss state persisted to sessionStorage
  useEffect(() => {
    if (CFG.closeable && sessionStorage.getItem("bity_ann_closed") === "1") {
      setClosed(true);
    }
  }, []);

  // Message rotation
  useEffect(() => {
    if (!CFG.enabled || CFG.messages.length <= 1) return;
    const id = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setMsgIndex((i) => (i + 1) % CFG.messages.length);
        setFading(false);
      }, 300);
    }, CFG.rotateInterval);
    return () => clearInterval(id);
  }, []);

  if (!CFG.enabled || closed) return null;

  const text       = CFG.messages[msgIndex] ?? "";
  const bgStyle    = getBackground();
  const textStyle  = {
    color      : CFG.variant === "neon" ? CFG.accentColor : CFG.textColor,
    fontSize   : CFG.fontSize ? CFG.fontSize : undefined,
    letterSpacing: CFG.tracking,
    fontWeight : CFG.fontWeight,
    textShadow : CFG.variant === "neon" ? `0 0 8px ${CFG.accentColor}` : undefined,
    transition : "opacity 0.3s ease",
    opacity    : fading ? 0 : 1,
  };

  const inner = (
    <div
      className="relative flex items-center justify-center overflow-hidden w-full"
      style={{ height: CFG.height, ...bgStyle }}
    >
      {/* Shimmer overlay */}
      {CFG.shimmer.enabled && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background : `linear-gradient(105deg, transparent 40%, ${CFG.shimmer.color} 50%, transparent 60%)`,
            backgroundSize: "200% 100%",
            animation  : `bity-shimmer ${CFG.shimmer.duration} ease-in-out infinite`,
          }}
        />
      )}

      <Stripes side="left" />

      {CFG.leftIcon && (
        <span className="mr-3 flex-shrink-0 text-[14px]">{CFG.leftIcon}</span>
      )}

      {CFG.marquee.enabled ? (
        <MarqueeText text={text} />
      ) : (
        <span
          className="font-sans text-center px-4 sm:px-0"
          style={{
            ...textStyle,
            animation: CFG.pulse.enabled ? `bity-pulse ${CFG.pulse.duration} ease-in-out infinite` : undefined,
          }}
        >
          {text}
        </span>
      )}

      {CFG.rightIcon && (
        <span className="ml-3 flex-shrink-0 text-[14px]">{CFG.rightIcon}</span>
      )}

      <Stripes side="right" />

      {CFG.closeable && (
        <button
          onClick={(e) => {
            e.preventDefault();
            setClosed(true);
            sessionStorage.setItem("bity_ann_closed", "1");
          }}
          className="absolute right-3 flex items-center justify-center w-6 h-6 opacity-60 hover:opacity-100 transition-opacity cursor-pointer bg-transparent border-none"
          aria-label="Dismiss announcement"
          style={{ color: CFG.textColor }}
        >
          ✕
        </button>
      )}

      {/* Inject keyframes once */}
      <style>{`
        @keyframes bity-marquee  { from { transform: translateX(0) } to { transform: translateX(-33.333%) } }
        @keyframes bity-pulse    { 0%,100% { opacity: 1 } 50% { opacity: 0.6 } }
        @keyframes bity-shimmer  { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
      `}</style>
    </div>
  );

  if (CFG.link.enabled) {
    return (
      <a href={CFG.link.href} className="block no-underline" style={{ display: "block" }}>
        {inner}
      </a>
    );
  }

  return inner;
}
