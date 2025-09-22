import { NextRequest, NextResponse } from 'next/server'

const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL || 'http://localhost:3001'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('Proxying debug-html request to PDF service:', {
      url: `${PDF_SERVICE_URL}/debug-html`,
      type: body.type
    })

    // Проксируем запрос к PDF сервису
    const response = await fetch(`${PDF_SERVICE_URL}/debug-html`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('PDF service debug-html error:', errorText)
      return NextResponse.json(
        {
          error: 'PDF service error',
          message: `PDF service returned ${response.status}`
        },
        { status: response.status }
      )
    }

    // Получаем HTML от PDF сервиса
    const html = await response.text()

    console.log('Debug HTML generated successfully:', {
      htmlLength: html.length,
      type: body.type
    })

    // Возвращаем HTML как text/html
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('Debug HTML API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}