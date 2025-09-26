import { NextRequest, NextResponse } from 'next/server'
import { validateCrosswordParams } from '../../../crossword/utils/validation'
import { generateCrosswordHTML } from '../../../crossword/utils/htmlGenerator'
import { CrosswordParams } from '../../../crossword/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CrosswordParams

    // Валидация параметров
    const validationResult = validateCrosswordParams(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.errors?.join(', ') || 'Неизвестная ошибка валидации'
        },
        { status: 400 }
      )
    }

    // Генерируем HTML
    const html = await generateCrosswordHTML(body)

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('Crossword debug HTML error:', error)
    return NextResponse.json(
      {
        error: 'HTML generation failed',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    )
  }
}