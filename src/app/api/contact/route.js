import { Resend }             from "resend";
import { badRequest, ok, serverError } from "@/lib/apiHelpers";

const resend = new Resend(process.env.RESEND_API_KEY);

const SUBJECT_LABELS = {
  general  : "General Question",
  order    : "Order Status",
  return   : "Return / Exchange",
  damaged  : "Damaged Item",
  wholesale: "Wholesale Inquiry",
  other    : "Other",
};

export async function POST(request) {
  try {
    const { name, email, order, subject, message } = await request.json();

    if (!name?.trim() || !email?.trim() || !message?.trim())
      return badRequest("Name, email, and message are required.");

    const to   = process.env.CONTACT_EMAIL;
    const from = process.env.CONTACT_FROM_EMAIL ?? "noreply@company.com";
    if (!to) return serverError(new Error("CONTACT_EMAIL env var not set"), "POST /api/contact");

    const topicLabel = SUBJECT_LABELS[subject] ?? subject;
    const orderLine  = order?.trim() ? `<p><strong>Order #:</strong> ${order.trim()}</p>` : "";

    await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `[BityBird Contact] ${topicLabel} — ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;color:#1D1B1C">
          <h2 style="margin:0 0 16px;font-size:20px">New Contact Form Message</h2>
          <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
          <p><strong>Topic:</strong> ${topicLabel}</p>
          ${orderLine}
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0" />
          <p style="white-space:pre-wrap">${message.trim()}</p>
        </div>
      `,
    });

    return ok({ sent: true });
  } catch (err) {
    return serverError(err, "POST /api/contact");
  }
}

