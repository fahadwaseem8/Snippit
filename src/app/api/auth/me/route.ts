import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";
import { withAPILogging } from "@/lib/api-logger";

export async function GET(request: NextRequest) {
  return withAPILogging(request, async () => {
    try {
      const session = await getSessionFromRequest(request);

      if (!session) {
        return NextResponse.json({ user: null }, { status: 401 });
      }

      return NextResponse.json({ user: session.user }, { status: 200 });
    } catch (error) {
      console.error("Get session user error:", error);
      return NextResponse.json(
        { error: "An unexpected error occurred" },
        { status: 500 },
      );
    }
  });
}
