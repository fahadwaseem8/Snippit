import { NextRequest, NextResponse } from "next/server";
import { withAPILogging } from "@/lib/api-logger";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  return withAPILogging(
    request,
    async () => {
      try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
          return NextResponse.json(
            { error: "Email and password are required" },
            { status: 400 },
          );
        }

        const supabase = await createClient();

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          return NextResponse.json(
            { error: "Invalid email or password" },
            { status: 401 },
          );
        }

        return NextResponse.json({ user: data.user }, { status: 200 });
      } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
          { error: "An unexpected error occurred" },
          { status: 500 },
        );
      }
    },
    { sensitiveFields: ["password"] },
  );
}
