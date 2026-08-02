import { NextRequest, NextResponse } from "next/server";
import { withAPILogging } from "@/lib/api-logger";

export async function GET(request: NextRequest) {
  return withAPILogging(request, async () => {
    // Verify the request is coming from Vercel Cron
    const authHeader = request.headers.get("authorization");
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // withAPILogging will automatically insert a row to request_logs
    // with the actual dynamic IP, user agent, headers, etc.
    return NextResponse.json({ success: true, message: "Health check and DB ping completed" });
  });
}
