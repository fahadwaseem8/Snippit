import { NextRequest, NextResponse } from "next/server";
import {
  findUserByEmailConfirmationToken,
  markUserEmailAsVerified,
} from "@/lib/auth/users";

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token") || "";

    if (!token) {
      const redirectUrl = new URL("/login?verified=invalid", request.nextUrl.origin);
      return NextResponse.redirect(redirectUrl);
    }

    const user = await findUserByEmailConfirmationToken(token);

    if (!user) {
      const redirectUrl = new URL("/login?verified=invalid", request.nextUrl.origin);
      return NextResponse.redirect(redirectUrl);
    }

    await markUserEmailAsVerified(user.id);

    const redirectUrl = new URL("/login?verified=1", request.nextUrl.origin);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Confirm signup error:", error);
    const redirectUrl = new URL("/login?verified=error", request.nextUrl.origin);
    return NextResponse.redirect(redirectUrl);
  }
}
