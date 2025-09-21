import { NextRequest, NextResponse } from 'next/server'
import { validateReadingTextParams } from '../../../reading-text/utils/validation'
import { generateReadingTextHTML } from '../../../reading-text/utils/htmlGenerator'
import { ReadingTextParams } from '../../../reading-text/types'

export async function POST(request: NextRequest) {
  try {
    // Парсинг параметров
    const params = await request.json() as ReadingTextParams

    // Валидация параметров
    const validationResult = validateReadingTextParams(params)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: validationResult.errors?.join(', ') || 'Ошибка валидации'
        },
        { status: 400 }
      )
    }

    // Генерируем HTML используя веб-генератор (тот же что и для PDF)
    const htmlContent = generateReadingTextHTML(params)

    // Возвращаем HTML
    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    })

  } catch (error) {
    console.error('HTML debug generation error:', error)

    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера при генерации HTML' },
      { status: 500 }
    )
  }
}