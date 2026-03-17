import { NextRequest, NextResponse } from "next/server";
import { createResetToken, sendPasswordReset } from "@/lib/auth/reset";
import {
  clearUserResetToken,
  findUserByEmail,
  findUserByResetToken,
  setUserResetToken,
  updateUserPassword,
} from "@/lib/auth/users";
import { deleteSessionsForUser } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: unknown };
    const email = typeof body.email === "string" ? body.email : "";

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await findUserByEmail(email);

    // Do not reveal whether an email exists.
    if (!user) {
      return NextResponse.json(
        { message: "If that email exists, a reset link has been sent." },
        { status: 200 },
      );
    }

    const token = createResetToken();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString();

    await setUserResetToken(user.id, token, expiresAt);

    const { resetLink } = await sendPasswordReset(
      user.email,
      request.nextUrl.origin,
      token,
    );

    const payload: { message: string; resetLink?: string } = {
      message: "If that email exists, a reset link has been sent.",
    };

    if (process.env.NODE_ENV !== "production") {
      payload.resetLink = resetLink;
    }

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      token?: unknown;
      password?: unknown;
    };
    const token = body.token;
    const password = body.password;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Reset token is required" },
        { status: 400 },
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    const user = await findUserByResetToken(token);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 },
      );
    }

    await updateUserPassword(user.id, password);
    await clearUserResetToken(user.id);
    await deleteSessionsForUser(user.id);

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Password update error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
