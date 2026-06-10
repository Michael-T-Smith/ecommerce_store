import { notFound }      from "next/navigation";
import pool              from "@/lib/db";
import { NOTES_MOCK }    from "@/lib/notesData";
import NoteDetailClient  from "@/app/notes/[slug]/NoteDetailClient";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const note = await getNote(params.slug);
  if (!note) return { title: "Note Not Found — BityBird Co" };
  return {
    title      : `${note.title} — BityBird Co`,
    description: note.excerpt || undefined,
  };
}

async function getNote(slug) {
  try {
    const result = await pool.query(
      `SELECT n.id, n.title, n.slug, n.body, n.excerpt,
              n.status, n.published_at, e.name AS author_name
       FROM notes n
       LEFT JOIN employees e ON e.id = n.author_id
       WHERE n.slug = $1 AND n.status = 'published'`,
      [slug]
    );
    return result.rows[0] ?? null;
  } catch {
    return NOTES_MOCK.find((n) => n.slug === slug && n.status === "published") ?? null;
  }
}

export default async function NoteDetailPage({ params }) {
  const note = await getNote(params.slug);
  if (!note) notFound();
  return <NoteDetailClient note={note} />;
}
