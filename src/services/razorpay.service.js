import config from "../config/config.js";

const RAZORPAY_API_URL = "https://api.razorpay.com/v1";

function getAuthorizationHeader() {
  if (!config.RAZORPAY_KEY_ID || !config.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay credentials are not configured");
  }

  const credentials = Buffer.from(
    `${config.RAZORPAY_KEY_ID}:${config.RAZORPAY_KEY_SECRET}`,
  ).toString("base64");

  return `Basic ${credentials}`;
}

export async function createRazorpayOrder({ amount, currency, receipt }) {
  const response = await fetch(`${RAZORPAY_API_URL}/orders`, {
    method: "POST",
    headers: {
      Authorization: getAuthorizationHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount, currency, receipt }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error?.description ?? "Razorpay order creation failed");
  }

  return data;
}
