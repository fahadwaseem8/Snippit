import { NextRequest, NextResponse } from "next/server";
import { createUser, findUserByEmail } from "@/lib/auth/users";

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
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 },
      );
    }

    await createUser(email, password);

    return NextResponse.json({
      success: true,
      message: "Registration successful. You can now log in.",
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
