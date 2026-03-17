import { NextRequest, NextResponse } from "next/server";
import {
  createEmailConfirmationToken,
  sendSignupConfirmation,
} from "@/lib/auth/confirm";
import {
  buildSessionCookieOptions,
  createSession,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";
import { setUserEmailConfirmation, validateUserCredentials } from "@/lib/auth/users";
import { withAPILogging } from "@/lib/api-logger";

export async function POST(request: NextRequest) {
  return withAPILogging(request, async () => {
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

      if (!user.is_email_verified) {
        const token = createEmailConfirmationToken();
        const expiresAt = new Date(
          Date.now() + 1000 * 60 * 60 * 24,
        ).toISOString();

        await setUserEmailConfirmation(user.id, token, expiresAt);
        const { confirmationLink } = await sendSignupConfirmation(
          user.email,
          request.nextUrl.origin,
          token,
        );

        const payload: {
          error: string;
          confirmationLink?: string;
        } = {
          error:
            "Please confirm your email before logging in. A new confirmation email has been sent.",
        };

        if (process.env.NODE_ENV !== "production") {
          payload.confirmationLink = confirmationLink;
        }

        return NextResponse.json(payload, { status: 403 });
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
  });
}
