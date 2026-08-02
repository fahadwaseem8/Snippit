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

        // Supabase signUp automatically sends a confirmation email if configured,
        // otherwise it logs the user in immediately.
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          return NextResponse.json(
            { error: error.message },
            { status: 400 },
          );
        }

        return NextResponse.json(
          { 
            user: data.user, 
            session: data.session,
            message: data.session ? "Registration successful" : "Check your email for the confirmation link"
          },
          { status: 201 },
        );
      } catch (error) {
        console.error("Register error:", error);
        return NextResponse.json(
          { error: "An unexpected error occurred" },
          { status: 500 },
        );
      }
    },
    { sensitiveFields: ["password"] },
  );
}
