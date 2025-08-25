import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if PDF service is reachable
    const pdfServiceUrl = process.env.PDF_SERVICE_URL || 'http://localhost:3001'
    
    let pdfServiceStatus = 'unknown'
    try {
      const response = await fetch(`${pdfServiceUrl}/health`, {
        method: 'GET',
        headers: {
          'User-Agent': 'ChildDev-Web-HealthCheck',
        },
        // Short timeout for health check
        signal: AbortSignal.timeout(5000),
      })
      
      pdfServiceStatus = response.ok ? 'healthy' : 'unhealthy'
    } catch (error) {
      pdfServiceStatus = 'unreachable'
    }

    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'childdev-web',
      version: process.env.npm_package_version || '0.1.0',
      environment: process.env.NODE_ENV || 'development',
      dependencies: {
        pdfService: pdfServiceStatus,
      },
    }

    return NextResponse.json(healthData, { status: 200 })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        service: 'childdev-web',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
