import { NextRequest, NextResponse } from "next/server";
import { withAPILogging } from "@/lib/api-logger";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  return withAPILogging(request, async () => {
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Logout error:", error);
      return NextResponse.json(
        { error: "An unexpected error occurred" },
        { status: 500 },
      );
    }
  });
}
