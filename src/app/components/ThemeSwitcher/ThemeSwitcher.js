
"use client";

import { useState }    from "react";
import { HERO_THEMES } from "@/lib/themes";
import { B }           from "@/lib/brand";

export default function ThemeSwitcher({ activeTheme, onChange }) {
  const [open, setOpen] = useState(true);

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[999]"
      style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
    >
      {/* Collapsed state on mobile — show toggle button only */}
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="bg-brand-black border-[3px] border-brand-orange text-brand-gold font-sans font-extrabold text-[10px] tracking-[2px] uppercase px-5 py-3"
        >
          🎨 Themes
        </button>
      ) : (
        <div className="bg-brand-black border-[3px] border-brand-orange px-4 py-3 flex flex-wrap gap-2 items-center max-w-[95vw]">
          <span className="font-sans text-[10px] font-extrabold tracking-[2px] text-brand-gold uppercase mr-1 whitespace-nowrap">
            Preview:
          </span>
          {Object.entries(HERO_THEMES).map(([key, t]) => (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`px-3 py-1.5 font-sans font-extrabold text-[10px] tracking-[1px] uppercase cursor-pointer whitespace-nowrap border-2 transition-all duration-150 ${
                activeTheme === key
                  ? "bg-brand-orange text-brand-cream border-brand-orange"
                  : "bg-transparent text-brand-smoke border-brand-smoke"
              }`}
            >
              {t.label}
            </button>
          ))}
          <button
            onClick={() => setOpen(false)}
            className="ml-1 text-brand-smoke font-sans font-extrabold text-[10px] tracking-[1px] uppercase bg-transparent border-none cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}