// GET /notes/feed.xml
// Returns a valid RSS 2.0 feed of all published notes.
// Linked from <head> of /notes via metadata.alternates.

import pool             from "@/lib/db";
import { NOTES_MOCK }  from "@/lib/notesData";

export const dynamic   = "force-dynamic"; // always fresh
export const revalidate = 0;

const SITE_URL   = "https://bitybirdco.com";
const FEED_TITLE = "BityBird Co — Notes";
const FEED_DESC  = "Thoughts, finds, and stories from Candice at BityBird Co.";

function escapeXml(str) {
  return String(str ?? "")
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;")
    .replace(/'/g,  "&apos;");
}

function buildFeed(notes) {
  const pubDate  = notes[0]?.published_at ? new Date(notes[0].published_at).toUTCString() : new Date().toUTCString();
  const items    = notes.map((n) => {
    const url      = `${SITE_URL}/notes/${n.slug}`;
    const pubAt    = n.published_at ? new Date(n.published_at).toUTCString() : new Date().toUTCString();
    const excerpt  = escapeXml(n.excerpt ?? "");
    return `
    <item>
      <title>${escapeXml(n.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubAt}</pubDate>
      <description>${excerpt}</description>
    </item>`;
  }).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <link>${SITE_URL}/notes</link>
    <description>${escapeXml(FEED_DESC)}</description>
    <language>en-us</language>
    <lastBuildDate>${pubDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/notes/feed.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;
}

export async function GET() {
  let notes = [];

  try {
    const result = await pool.query(
      `SELECT id, title, slug, excerpt, published_at
       FROM notes
       WHERE status = 'published'
       ORDER BY published_at DESC
       LIMIT 50`
    );
    notes = result.rows;
  } catch {
    notes = NOTES_MOCK
      .filter((n) => n.status === "published")
      .slice(0, 50);
  }

  const xml = buildFeed(notes);

  return new Response(xml, {
    headers: {
      "Content-Type"  : "application/rss+xml; charset=utf-8",
      "Cache-Control" : "public, max-age=3600, s-maxage=3600",
    },
  });
}
