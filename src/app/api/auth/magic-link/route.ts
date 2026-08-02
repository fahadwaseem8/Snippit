import { NextRequest, NextResponse } from "next/server";
import { withAPILogging } from "@/lib/api-logger";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  return withAPILogging(request, async () => {
    try {
      const body = await request.json();
      const { email } = body;

      if (!email) {
        return NextResponse.json(
          { error: "Email is required" },
          { status: 400 }
        );
      }

      const supabase = await createClient();

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          // This ensures the PKCE flow is used: the magic link will contain
          // ?token_hash=...&type=magiclink and hit our /api/auth/confirm endpoint
          emailRedirectTo: `${new URL(request.url).origin}/api/auth/confirm`,
        },
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ message: "Magic link sent! Check your email." });
    } catch (error) {
      console.error("Magic link error:", error);
      return NextResponse.json(
        { error: "An unexpected error occurred" },
        { status: 500 }
      );
    }
  });
}
