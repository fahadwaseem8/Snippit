import { NextRequest, NextResponse } from 'next/server'
import { withAPILogging } from '@/lib/api-logger'

export async function GET(request: NextRequest) {
  return withAPILogging(request, async () => {
    try {
      // Verify this is a legitimate cron request from Vercel
      const authHeader = request.headers.get('authorization')
      
      // In production, Vercel automatically adds this header to cron requests
      // For local testing, we'll allow requests without it
      if (process.env.NODE_ENV === 'production') {
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          )
        }
      }

      const cronInfo = {
        type: 'scheduled_health_check',
        timestamp: new Date().toISOString(),
        day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        scheduled_message: 'Automated daily health check at midnight UTC',
        server_info: {
          node_version: process.version,
          platform: process.platform,
          memory_usage: process.memoryUsage(),
          uptime: process.uptime(),
        },
      }

      const response = NextResponse.json({
        success: true,
        message: 'Health check completed successfully',
        ...cronInfo,
      })

      return response
    } catch (error) {
      console.error('Cron health check error:', error)
      
      return NextResponse.json(
        { error: 'Health check failed' },
        { status: 500 }
      )
    }
  })
}
