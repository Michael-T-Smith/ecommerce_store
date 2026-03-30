import { NextResponse }  from "next/server";
import Stripe            from "stripe";
import { badRequest, serverError } from "@/lib/apiHelpers";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set in .env.local");
  return new Stripe(key, { apiVersion: "2024-06-20" });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, customerEmail, description, fulfillmentType } = body;

    if (!amount || amount <= 0)
      return badRequest("A positive amount is required.");
    if (!customerEmail)
      return badRequest("customerEmail is required.");

    const stripe           = getStripe();
    const connectedAccount = process.env.STRIPE_CONNECTED_ACCOUNT_ID || null;
    const amountCents      = Math.round(amount * 100);

    // Base PaymentIntent params — used in both modes
    const intentParams = {
      amount                   : amountCents,
      currency                 : "usd",
      receipt_email            : customerEmail,
      description              : description ?? "Lamb's Florist order",
      automatic_payment_methods: { enabled: true },
      metadata: {
        fulfillment_type: fulfillmentType ?? "delivery",
        source          : "lambsflorist.com",
        connect_mode    : connectedAccount ? "true" : "false",
      },
    };

    // Connect mode: route money to Cecilia's account, withhold platform fee
    if (connectedAccount) {
      intentParams.application_fee_amount = Math.round(amount * 0.03 * 100);
      intentParams.on_behalf_of           = connectedAccount;
      intentParams.transfer_data          = { destination: connectedAccount };
      intentParams.metadata.platform_fee  = (amount * 0.03).toFixed(2);
    }

    const intent = await stripe.paymentIntents.create(intentParams);

    // Return both the secret and whether Connect is active.
    // The client uses stripeAccount to initialise Elements in Connect mode.
    return NextResponse.json({
      clientSecret   : intent.client_secret,
      stripeAccount  : connectedAccount,  // null in direct mode
    });

  } catch (err) {
    if (err?.type?.startsWith("Stripe") || err?.raw) {
      console.error("[payments/intent] Stripe error:", err.message);
      return NextResponse.json({ error: err.message }, { status: 402 });
    }
    return serverError(err, "POST /api/payments/intent");
  }
}