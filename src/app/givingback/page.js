import pool                  from "@/lib/db";
import { GIVING_BACK_MOCK }  from "@/lib/givingBackData";
import GivingBackPageClient  from "@/app/givingback/GivingBackPageClient";

export const metadata = {
  title      : "Giving Back — BityBird Co",
  description: "How BityBird Co gives back to the Calhoun County community through donations, workshops, and local drives.",
};

export const revalidate = 60;

export default async function GivingBackPage() {
  let initiatives = [];
  let dbError     = false;

  try {
    const result = await pool.query(
      `SELECT id, title, description, impact_statement, emoji, sort_order
       FROM giving_back
       WHERE active = true
       ORDER BY sort_order ASC, created_at ASC`
    );
    initiatives = result.rows;
  } catch {
    initiatives = GIVING_BACK_MOCK.filter((i) => i.active);
    dbError     = true;
  }

  return <GivingBackPageClient initiatives={initiatives} dbError={dbError} />;
}
