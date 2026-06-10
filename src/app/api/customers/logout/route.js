import { NextResponse }           from "next/server";
import {
  CUSTOMER_COOKIE_NAME,
  CUSTOMER_HINT_COOKIE_NAME,
} from "@/lib/customerAuth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(CUSTOMER_COOKIE_NAME, "", {
    httpOnly: true,
    secure  : process.env.NODE_ENV === "production",
    sameSite: "lax",
    path    : "/",
    maxAge  : 0,
  });
  response.cookies.set(CUSTOMER_HINT_COOKIE_NAME, "", {
    httpOnly: false,
    secure  : process.env.NODE_ENV === "production",
    sameSite: "lax",
    path    : "/",
    maxAge  : 0,
  });
  return response;
}