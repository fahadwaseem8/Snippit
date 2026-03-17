import { NextRequest, NextResponse } from 'next/server'
import { withAPILogging } from '@/lib/api-logger'

export async function GET(request: NextRequest) {
  return withAPILogging(request, async () => {
    // Simple health check endpoint
    // All visitor tracking is handled by withAPILogging middleware:
    // - IP address
    // - User agent
    // - Headers (including referer)
    // - Timestamp
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    })
  })
}
