"use client";

import { useState }    from "react";
import Link            from "next/link";
import AnnouncementBar from "@/app/components/AnnouncementBar/AnnouncementBar";
import Navbar          from "@/app/components/Navbar/Navbar";
import Footer          from "@/app/components/Footer/Footer";
import { C }           from "@/lib/brand";

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

export default function NoteDetailClient({ note }) {
  const [cartCount, setCartCount] = useState(0);

  const paragraphs = note.body.split("\n").filter(Boolean);

  return (
    <div className="font-serif bg-brand-cream min-h-screen overflow-x-hidden">
      <AnnouncementBar />
      <Navbar cartCount={cartCount} onCartClick={() => setCartCount((c) => c + 1)} />

      {/* Hero bar */}
      <div className="bg-brand-black border-b-[6px] border-brand-orange">
        <div
          className="h-[6px] w-full"
          style={{
            background: `repeating-linear-gradient(90deg,
              ${C.blush} 0, ${C.blush} 32px,
              ${C.gold}   32px, ${C.gold}   40px,
              ${C.blush} 40px, ${C.blush} 72px,
              ${C.black}  72px, ${C.black}  76px)`,
          }}
        />
        <div className="max-w-[760px] mx-auto px-5 sm:px-10 py-12 sm:py-16">
          {/* Back link */}
          <Link
            href="/notes"
            className="inline-flex items-center gap-2 font-sans font-extrabold text-[10px] tracking-[3px] uppercase text-brand-smoke hover:text-brand-orange transition-colors no-underline mb-6"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 5 5 12 12 19" />
            </svg>
            All Notes
          </Link>

          {/* Date */}
          <div className="font-sans text-[10px] font-extrabold tracking-[3px] uppercase text-brand-orange mb-4">
            {formatDate(note.published_at)}
          </div>

          {/* Title */}
          <h1 className="font-serif font-black text-brand-cream text-[36px] sm:text-[52px] tracking-[-2px] leading-[1.05] m-0">
            {note.title}
          </h1>

          {note.author_name && (
            <p className="font-sans text-brand-smoke text-[12px] mt-4">
              By {note.author_name}
            </p>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="max-w-[760px] mx-auto px-5 sm:px-10 py-14 sm:py-20">
        <div className="flex flex-col gap-5">
          {paragraphs.map((para, i) => (
            <p
              key={i}
              className="font-sans text-brand-black text-[15px] sm:text-[16px] leading-[1.85]"
            >
              {para}
            </p>
          ))}
        </div>

        {/* Back footer */}
        <div className="mt-16 pt-8 border-t-[2px] border-brand-black/10">
          <Link
            href="/notes"
            className="inline-flex items-center gap-2 font-sans font-extrabold text-[11px] tracking-[2px] uppercase text-brand-orange no-underline hover:text-brand-black transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 5 5 12 12 19" />
            </svg>
            Back to All Notes
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
