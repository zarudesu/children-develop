import { NextRequest, NextResponse } from 'next/server'
import { CopyTextParamsSchema } from '../../../copy-text/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Валидируем входные данные
    const validatedParams = CopyTextParamsSchema.parse(body)

    // Вызываем PDF сервис
    const pdfServiceUrl = process.env.PDF_SERVICE_URL || 'http://localhost:3001'
    const response = await fetch(`${pdfServiceUrl}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'copy-text',
        params: validatedParams
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('PDF service error:', errorText)
      return NextResponse.json(
        { error: 'Ошибка генерации PDF' },
        { status: response.status }
      )
    }

    // Получаем PDF как buffer
    const pdfBuffer = await response.arrayBuffer()

    // Возвращаем PDF с правильными заголовками
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="copy-text-exercise.pdf"',
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    })

  } catch (error) {
    console.error('Copy text API error:', error)

    if (error instanceof Error && 'issues' in error) {
      // Zod validation error
      const zodError = error as any
      const validationErrors = zodError.issues?.map((issue: any) => ({
        field: issue.path.join('.'),
        message: issue.message
      }))

      return NextResponse.json(
        {
          error: 'Ошибка валидации данных',
          details: validationErrors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}