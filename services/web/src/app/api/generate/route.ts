import { NextRequest, NextResponse } from 'next/server'
import { validateFilwordParams } from '../../filword/utils/validation'
import { FilwordParams } from '../../filword/types'

export async function POST(request: NextRequest) {
  try {
    // Получаем URL PDF сервиса в runtime, а не при сборке
    const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL || 'http://localhost:3001'
    console.log('PDF_SERVICE_URL:', PDF_SERVICE_URL)
    
    // Парсинг и валидация запроса
    const body = await request.json() as FilwordParams
    
    const validation = validateFilwordParams(body)
    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error },
        { status: 400 }
      )
    }

    // Проксирование запроса к PDF сервису
    const pdfResponse = await fetch(`${PDF_SERVICE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!pdfResponse.ok) {
      const errorText = await pdfResponse.text()
      console.error('PDF Service error:', errorText)
      
      return NextResponse.json(
        { 
          message: pdfResponse.status === 422 
            ? 'Не удалось разместить все слова в сетке. Попробуйте уменьшить количество слов или увеличить размер сетки.'
            : 'Ошибка генерации PDF. Попробуйте позже.'
        },
        { status: pdfResponse.status }
      )
    }

    // Получаем PDF как stream
    const pdfBuffer = await pdfResponse.arrayBuffer()
    
    // Возвращаем PDF с правильными заголовками
    const filename = `filword-${body.gridSize}-${body.fontSize}-${body.words.length}слов-${Date.now()}.pdf`
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    })

  } catch (error) {
    console.error('API error:', error)
    
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}// Force rebuild Mon Aug 25 21:32:12 -03 2025
