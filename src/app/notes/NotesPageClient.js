"use client";

import Link            from "next/link";
import AnnouncementBar from "@/app/components/AnnouncementBar/AnnouncementBar";
import Navbar          from "@/app/components/Navbar/Navbar";
import Footer          from "@/app/components/Footer/Footer";
import BirdLogo        from "@/app/components/icons/BirdLogo";
import { C }           from "@/lib/brand";

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

export default function NotesPageClient({ notes = [], dbError = false }) {
  return (
    <div className="font-sans bg-brand-cream min-h-screen overflow-x-hidden">
      <AnnouncementBar />
      <Navbar />

      {/* ── HERO ── */}
      <section className="bg-brand-black relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23g)' opacity='0.055'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "200px 200px",
          }}
        />
        <div className="absolute right-0 top-0 bottom-0 flex items-center pr-8 lg:pr-16 pointer-events-none select-none opacity-[0.04]">
          <BirdLogo size={320} color={C.cream} />
        </div>

        <div className="relative z-10 px-5 sm:px-10 lg:px-16 pt-12 sm:pt-16">
          <div className="flex items-center gap-2 font-sans text-[10px] font-extrabold tracking-[3px] uppercase text-brand-smoke mb-12">
            <Link href="/" className="text-brand-smoke hover:text-brand-orange transition-colors no-underline">Home</Link>
            <span className="text-brand-orange">◆</span>
            <span className="text-brand-orange">Notes</span>
          </div>

          <div className="flex items-center gap-2 font-sans text-[10px] font-extrabold tracking-[4px] uppercase text-brand-orange mb-6">
            <BirdLogo size={14} color={C.blush} />
            Journal
          </div>

          <h1 className="font-serif font-black leading-[0.95] tracking-[-3px] m-0">
            <span className="block text-[52px] sm:text-[76px] lg:text-[108px] text-brand-cream">
              Thoughts, finds,
            </span>
            <span className="block text-[52px] sm:text-[76px] lg:text-[108px] text-brand-orange italic">
              and stories.
            </span>
          </h1>

          <p className="font-sans text-brand-smoke text-[13px] sm:text-[15px] mt-8 mb-16 sm:mb-20 max-w-[380px] leading-relaxed">
            From behind the shop.
          </p>
        </div>

        <div className="h-12 w-full" style={{ background: "linear-gradient(to bottom, transparent, rgba(14,14,14,0.6))" }} />
      </section>

      {/* ── NOTES GRID ── */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 lg:px-16 py-16 sm:py-24">

        {dbError && (
          <div className="mb-10 px-4 py-3 border-2 border-brand-orange/40 bg-brand-orange/5 font-sans text-[12px] text-brand-smoke">
            ⚠ Showing preview content — database not connected.
          </div>
        )}

        {notes.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-[56px] mb-4">✍️</div>
            <h2 className="font-serif font-black text-brand-black text-[24px] tracking-[-0.5px] mb-3">
              No notes yet.
            </h2>
            <p className="font-sans text-brand-smoke text-[14px] leading-relaxed max-w-[340px] mx-auto">
              No blogs published here yet — check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {notes.map((note) => (
              <Link key={note.id} href={`/notes/${note.slug}`} className="no-underline group">
                <article className="border-[3px] border-brand-black bg-brand-cream h-full flex flex-col shadow-retro-sm hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all duration-150">

                  {/* Solid accent bar — gold */}
                  <div className="h-[4px] w-full flex-shrink-0" style={{ background: C.gold }} />

                  <div className="p-6 sm:p-7 flex flex-col flex-1">
                    <div className="font-sans text-[10px] font-extrabold tracking-[3px] uppercase text-brand-orange mb-3">
                      {formatDate(note.published_at)}
                    </div>

                    <h2 className="font-serif font-black text-brand-black text-[20px] sm:text-[22px] tracking-[-0.5px] leading-[1.2] mb-3 group-hover:text-brand-orange transition-colors">
                      {note.title}
                    </h2>

                    {note.excerpt && (
                      <p className="font-sans text-brand-smoke text-[13px] leading-[1.75] flex-1 mb-5">
                        {note.excerpt}
                      </p>
                    )}

                    <div className="font-sans font-extrabold text-[11px] tracking-[1.5px] uppercase text-brand-orange flex items-center gap-1.5 mt-auto">
                      Read Note
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
