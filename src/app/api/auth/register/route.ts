import { NextRequest, NextResponse } from "next/server";
import { createEmailConfirmationToken, sendSignupConfirmation } from "@/lib/auth/confirm";
import {
  createUser,
  findUserByEmail,
  setUserEmailConfirmation,
} from "@/lib/auth/users";

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

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      if (existingUser.is_email_verified) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 400 },
        );
      }

      const token = createEmailConfirmationToken();
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();

      await setUserEmailConfirmation(existingUser.id, token, expiresAt);
      const { confirmationLink } = await sendSignupConfirmation(
        existingUser.email,
        request.nextUrl.origin,
        token,
      );

      const payload: {
        success: boolean;
        message: string;
        confirmationLink?: string;
      } = {
        success: true,
        message:
          "Account exists but is not verified. We sent a new confirmation email.",
      };

      if (process.env.NODE_ENV !== "production") {
        payload.confirmationLink = confirmationLink;
      }

      return NextResponse.json(payload, { status: 200 });
    }

    const user = await createUser(email, password);
    const token = createEmailConfirmationToken();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();

    await setUserEmailConfirmation(user.id, token, expiresAt);

    const { confirmationLink } = await sendSignupConfirmation(
      user.email,
      request.nextUrl.origin,
      token,
    );

    const payload: {
      success: boolean;
      message: string;
      confirmationLink?: string;
    } = {
      success: true,
      message:
        "Registration successful. Please check your email and confirm your account before logging in.",
    };

    if (process.env.NODE_ENV !== "production") {
      payload.confirmationLink = confirmationLink;
    }

    return NextResponse.json(payload, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: `An unexpected error occurred, ${error}` },
      { status: 500 },
    );
  }
}
