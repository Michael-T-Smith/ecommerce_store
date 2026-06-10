// USPS Labels API v3
// Docs: https://developer.usps.com/api/74
//
// Setup:
//   1. Register at developer.usps.com — create an app, get Client ID + Secret
//   2. Add USPS_CLIENT_ID, USPS_CLIENT_SECRET, and sender address vars to .env.local / Vercel
//
// This module handles OAuth token fetching (tokens expire in 3600s) and label creation.
// Tokens are cached in module scope — safe for serverless since the cache is per-invocation,
// but avoids a double token fetch within a single request.

const TOKEN_URL = "https://api.usps.com/oauth2/v3/token";
const LABEL_URL = "https://api.usps.com/labels/v3/label";

let _cachedToken    = null;
let _tokenExpiresAt = 0;

async function getToken() {
  if (_cachedToken && Date.now() < _tokenExpiresAt - 30_000) return _cachedToken;

  const res = await fetch(TOKEN_URL, {
    method : "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body   : new URLSearchParams({
      grant_type   : "client_credentials",
      client_id    : process.env.USPS_CLIENT_ID,
      client_secret: process.env.USPS_CLIENT_SECRET,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`USPS token error ${res.status}: ${text}`);
  }

  const data      = await res.json();
  _cachedToken    = data.access_token;
  _tokenExpiresAt = Date.now() + (data.expires_in ?? 3600) * 1000;
  return _cachedToken;
}

/**
 * standardizeAddress(params) → USPS-corrected address object
 * Throws if the address is not found or USPS returns an error.
 *
 * @param {object} params
 * @param {string} params.streetAddress
 * @param {string} [params.secondaryAddress]
 * @param {string} params.city
 * @param {string} params.state
 * @param {string} params.zip
 */
export async function standardizeAddress({ streetAddress, secondaryAddress, city, state, zip }) {
  const token = await getToken();

  const params = new URLSearchParams({ streetAddress, city, state, ZIPCode: zip.slice(0, 5) });
  if (secondaryAddress) params.set("secondaryAddress", secondaryAddress);

  const res = await fetch(`https://api.usps.com/addresses/v3/address?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message ?? `USPS address error ${res.status}`);
  }
  return data.address; // { streetAddress, secondaryAddress, city, state, ZIPCode, ZIPPlus4 }
}

/**
 * createShippingLabel(params) → { labelImage: string (base64 PDF), trackingNumber: string }
 *
 * @param {object} params
 * @param {string} params.recipientName
 * @param {string} params.recipientStreet
 * @param {string} params.recipientCity
 * @param {string} params.recipientState   — 2-letter code
 * @param {string} params.recipientZip
 * @param {number} params.weightOz         — package weight in ounces
 * @param {string} [params.serviceType]    — defaults to "USPS_GROUND_ADVANTAGE"
 */
export async function createShippingLabel({
  recipientName,
  recipientStreet,
  recipientCity,
  recipientState,
  recipientZip,
  weightOz,
  serviceType = "USPS_GROUND_ADVANTAGE",
}) {
  const token = await getToken();

  const body = {
    imageInfo: {
      imageType         : "PDF",
      labelType         : "4X6LABEL",
      receiptOption     : "NONE",
      suppressPostage   : false,
    },
    toAddress: {
      firstName  : recipientName,
      streetAddress: recipientStreet,
      city       : recipientCity,
      state      : recipientState,
      ZIPCode    : recipientZip.slice(0, 5),
    },
    fromAddress: {
      senderName   : process.env.USPS_SENDER_NAME,
      streetAddress: process.env.USPS_SENDER_STREET,
      city         : process.env.USPS_SENDER_CITY,
      state        : process.env.USPS_SENDER_STATE,
      ZIPCode      : process.env.USPS_SENDER_ZIP,
    },
    packageDescription: {
      mailClass    : serviceType,
      weightUOM    : "oz",
      weight       : weightOz,
      rateIndicator: "SP",
      processingCategory: "NON_MACHINABLE",
    },
  };

  const res = await fetch(LABEL_URL, {
    method : "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type" : "application/json",
      "Accept"       : "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`USPS label error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return {
    labelImage     : data.labelImage,      // base64-encoded PDF
    trackingNumber : data.trackingNumber,
    labelMetadata  : data.labelMetadata,
  };
}
