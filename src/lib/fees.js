// src/lib/fees.js
//
// Fee configuration — single source of truth used by both
// the checkout client (display) and the payments API (charging).
//
// ── Architecture ────────────────────────────────────────────────────────────
// This project uses Stripe Connect (Express accounts).
//
//   YOU (platform)     — your Stripe account, holds STRIPE_SECRET_KEY
//   CANDICE (merchant) — her connected Express account, STRIPE_CONNECTED_ACCOUNT_ID
//
// When a customer pays $72.59 on a $68 order:
//   Stripe routes the full charge through your platform account.
//   application_fee_amount ($2.18) is withheld by your platform account → yours.
//   Stripe deducts their fee ($2.41) from the merchant's share.
//   Candice's connected account receives ~$68.00.
//
// ── Fee breakdown ────────────────────────────────────────────────────────────
//   STRIPE_PCT    2.9%   Stripe's per-transaction percentage
//   STRIPE_FIXED  $0.30  Stripe's per-transaction fixed fee
//   PLATFORM_PCT  3.0%   Your platform fee (application_fee_amount)
//
// ── Gross-up formula ─────────────────────────────────────────────────────────
//   chargeTotal = ceil((orderTotal + STRIPE_FIXED) / (1 - TOTAL_PCT))
//
// This ensures Candice nets *exactly* orderTotal after all deductions.
// The customer pays the difference as a visible "Processing fee" line.
//
// ── Going live ───────────────────────────────────────────────────────────────
// 1. Create your Stripe platform account at dashboard.stripe.com
// 2. Enable Connect → Express in your Stripe dashboard
// 3. Candice onboards via your Connect link — she gets a connected account ID
// 4. Set in .env.local:
//      STRIPE_SECRET_KEY=sk_live_...          ← your platform secret key
//      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...  ← your platform publishable key
//      STRIPE_CONNECTED_ACCOUNT_ID=acct_...   ← Candice's connected account ID
// 5. Swap sk_test/pk_test → sk_live/pk_live when ready to take real payments

// Flat delivery fee — applied to all delivery orders regardless of location.
// Change this one number to update the fee everywhere.
export const DELIVERY_FEE = 10;        // $10 flat

export const STRIPE_PCT   = 0.029;  // 2.9%  — Stripe's cut
export const STRIPE_FIXED = 0.30;   // $0.30 — Stripe's fixed fee
export const PLATFORM_PCT = 0.03;   // 3.0%  — your platform fee
export const TOTAL_PCT    = STRIPE_PCT + PLATFORM_PCT; // 5.9% combined

/**
 * calcProcessingFee(orderTotal)
 *
 * Returns:
 *   processingFee  — fee shown to customer as a line item
 *   chargeTotal    — total charged to the card (passed to PaymentIntent amount)
 *   platformFee    — your share in dollars (passed as application_fee_amount in cents)
 */
export function calcProcessingFee(orderTotal) {
  if (!orderTotal || orderTotal <= 0) {
    return { processingFee: 0, chargeTotal: 0, platformFee: 0 };
  }

  // Gross-up: ceil to nearest cent so merchant is never short-changed by rounding
  const chargeTotal   = Math.ceil(((orderTotal + STRIPE_FIXED) / (1 - TOTAL_PCT)) * 100) / 100;
  const processingFee = Math.round((chargeTotal - orderTotal) * 100) / 100;
  const platformFee   = Math.round(chargeTotal * PLATFORM_PCT * 100) / 100;

  return { processingFee, chargeTotal, platformFee };
}