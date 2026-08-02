import { NextRequest, NextResponse } from "next/server";
import { withAPILogging } from "@/lib/api-logger";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  return withAPILogging(request, async () => {
    try {
      const body = await request.json();
      const { email, password } = body;
      const supabase = await createClient();

      if (email && !password) {
        // Request reset link
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${new URL(request.url).origin}/reset-password`,
        });

        if (error) {
          return NextResponse.json(
            { error: error.message },
            { status: 400 },
          );
        }

        return NextResponse.json({
          message: "If an account exists, a reset link has been sent.",
        });
      } else if (password) {
        // Actually reset the password using the active session from the emailed link
        const { error } = await supabase.auth.updateUser({
          password: password,
        });

        if (error) {
          return NextResponse.json(
            { error: error.message },
            { status: 400 },
          );
        }

        return NextResponse.json({ success: true });
      }

      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 },
      );
    } catch (error) {
      console.error("Reset password error:", error);
      return NextResponse.json(
        { error: "An unexpected error occurred" },
        { status: 500 },
      );
    }
  });
}
