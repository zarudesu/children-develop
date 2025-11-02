import { NextRequest, NextResponse } from 'next/server'
import { handwritingParamsSchema } from '../../../handwriting/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Валидация параметров с помощью Zod
    const validatedParams = handwritingParamsSchema.parse(body)

    // Отправка запроса к PDF-сервису
    const pdfServiceUrl = process.env.PDF_SERVICE_URL || 'http://localhost:3001'
    const response = await fetch(`${pdfServiceUrl}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'handwriting',
        params: validatedParams
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('PDF service error:', response.status, errorText)
      throw new Error(`PDF service error: ${response.status}`)
    }

    const pdfBuffer = await response.arrayBuffer()

    // Генерация имени файла с временной меткой
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    const filename = `прописи-${timestamp}.pdf`

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Content-Length': pdfBuffer.byteLength.toString(),
      },
    })

  } catch (error) {
    console.error('Error in handwriting generation:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Ошибка валидации параметров', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Ошибка генерации прописей' },
      { status: 500 }
    )
  }
}