import { NextResponse }          from "next/server";
import { getCustomerSession }    from "@/lib/customerAuth";

export async function GET() {
  const session = await getCustomerSession();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  return NextResponse.json({
    customer: { id: session.id, name: session.name, email: session.email },
  });
}