import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "BityBird Co <orders@company.com>";

function formatItems(items) {
  return items
    .map((i) => {
      const size           = i.size ? ` (${i.size})` : "";
      const customization  = i.customizationText
        ? `<br><span style="font-size:11px;color:#8c8288;font-style:italic;">${i.customizationType ? i.customizationType.charAt(0).toUpperCase() + i.customizationType.slice(1) + ": " : ""}&ldquo;${i.customizationText}&rdquo;</span>`
        : "";
      return `<tr>
        <td style="padding:6px 0;border-bottom:1px solid #f0ece8;">${i.name}${size} × ${i.qty}${customization}</td>
        <td style="padding:6px 0;border-bottom:1px solid #f0ece8;text-align:right;">$${(i.price * i.qty).toFixed(2)}</td>
      </tr>`;
    })
    .join("");
}

export async function sendOrderConfirmation(order) {
  const items   = Array.isArray(order.items) ? order.items : JSON.parse(order.items ?? "[]");
  const shipping = Number(order.delivery_fee ?? 0);
  const total    = Number(order.total ?? 0);

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f3ef;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f3ef;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:2px solid #0e0e0e;max-width:560px;">

        <!-- Header -->
        <tr>
          <td style="background:#0e0e0e;padding:24px 32px;">
            <p style="margin:0;color:#f7f3ef;font-size:22px;font-weight:900;letter-spacing:-1px;">BityBird Co</p>
            <p style="margin:4px 0 0;color:#d4511a;font-size:10px;font-weight:700;letter-spacing:4px;text-transform:uppercase;">Every Piece Belongs</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 8px;font-size:13px;color:#8c8288;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Order Confirmed</p>
            <h1 style="margin:0 0 24px;font-size:28px;font-weight:900;color:#0e0e0e;letter-spacing:-1px;">Thanks, ${order.customer_name.split(" ")[0]}.</h1>
            <p style="margin:0 0 24px;font-size:14px;color:#4a4a4a;line-height:1.6;">
              We received your order and we're getting it ready. You'll hear from us when it ships.
            </p>

            <!-- Order number -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f3ef;border:2px solid #0e0e0e;margin-bottom:24px;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#8c8288;">Order Number</p>
                  <p style="margin:4px 0 0;font-size:20px;font-weight:900;color:#d4511a;letter-spacing:-0.5px;">${order.order_number}</p>
                </td>
              </tr>
            </table>

            <!-- Items -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
              <tr>
                <td colspan="2" style="padding:0 0 8px;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#8c8288;border-bottom:2px solid #0e0e0e;">Items</td>
              </tr>
              ${formatItems(items)}
              <tr>
                <td style="padding:10px 0 4px;font-size:13px;color:#4a4a4a;">Shipping</td>
                <td style="padding:10px 0 4px;font-size:13px;color:#4a4a4a;text-align:right;">${shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</td>
              </tr>
              <tr>
                <td style="padding:8px 0 0;font-size:16px;font-weight:900;color:#0e0e0e;border-top:2px solid #0e0e0e;">Total</td>
                <td style="padding:8px 0 0;font-size:16px;font-weight:900;color:#d4511a;text-align:right;border-top:2px solid #0e0e0e;">$${total.toFixed(2)}</td>
              </tr>
            </table>

            <!-- Shipping address -->
            ${order.delivery_address ? `
            <p style="margin:24px 0 6px;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#8c8288;">Ships To</p>
            <p style="margin:0;font-size:14px;color:#4a4a4a;line-height:1.6;">${order.delivery_address}</p>
            ` : ""}

            <!-- Note -->
            ${order.note_message ? `
            <p style="margin:24px 0 6px;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#8c8288;">Your Note</p>
            <p style="margin:0;font-size:14px;color:#4a4a4a;line-height:1.6;font-style:italic;">"${order.note_message}"</p>
            ` : ""}

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
              <tr>
                <td>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/order/${order.order_number}"
                     style="display:inline-block;background:#d4511a;color:#ffffff;font-size:12px;font-weight:900;letter-spacing:2px;text-transform:uppercase;padding:14px 28px;text-decoration:none;border:2px solid #0e0e0e;">
                    View Order →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f7f3ef;border-top:2px solid #0e0e0e;padding:20px 32px;">
            <p style="margin:0;font-size:11px;color:#8c8288;line-height:1.6;">
              Questions? Reply to this email or reach us at <a href="mailto:hello@company.com" style="color:#d4511a;">hello@company.com</a><br>
              BityBird Co — handcrafted &amp; refurbished finds.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await resend.emails.send({
    from   : FROM,
    to     : order.customer_email,
    subject: `Order confirmed — ${order.order_number}`,
    html,
  });
}
