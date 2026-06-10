import pool          from "@/lib/db";
import { NOTES_MOCK } from "@/lib/notesData";
import NotesPageClient from "@/app/notes/NotesPageClient";

export const metadata = {
  title      : "Notes — BityBird Co",
  description: "Thoughts, finds, and stories from Candice — the person behind BityBird Co.",
  alternates : {
    types: {
      "application/rss+xml": "/notes/feed.xml",
    },
  },
};

export const revalidate = 60;

export default async function NotesPage() {
  let notes   = [];
  let dbError = false;

  try {
    const result = await pool.query(
      `SELECT n.id, n.title, n.slug, n.excerpt, n.published_at,
              e.name AS author_name
       FROM notes n
       LEFT JOIN employees e ON e.id = n.author_id
       WHERE n.status = 'published'
       ORDER BY n.published_at DESC`
    );
    notes = result.rows;
  } catch {
    notes   = NOTES_MOCK.filter((n) => n.status === "published");
    dbError = true;
  }

  return <NotesPageClient notes={notes} dbError={dbError} />;
}
