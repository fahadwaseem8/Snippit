import { NextRequest, NextResponse } from "next/server";
import {
  buildSessionCookieOptions,
  createSession,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";
import { validateUserCredentials } from "@/lib/auth/users";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: unknown;
      password?: unknown;
    };
    const email = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const user = await validateUserCredentials(email, password);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const { token, expiresAt } = await createSession({
      id: user.id,
      email: user.email,
    });

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
    });

    response.cookies.set(
      SESSION_COOKIE_NAME,
      token,
      buildSessionCookieOptions(expiresAt),
    );

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
