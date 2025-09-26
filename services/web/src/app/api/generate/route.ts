import { NextRequest, NextResponse } from 'next/server'
import { validateFilwordParams } from '../../filword/utils/validation'
import { validateReadingTextParams } from '../../reading-text/utils/validation'
import { validateCrosswordParams } from '../../crossword/utils/validation'
import { generateReadingTextHTML } from '../../reading-text/utils/htmlGenerator'
import { generateCrosswordHTML } from '../../crossword/utils/htmlGenerator'
import { FilwordParams } from '../../filword/types'
import { ReadingTextParams } from '../../reading-text/types'
import { CrosswordParams } from '../../crossword/types'

type GenerateRequest =
  | { type: 'filword', params: FilwordParams }
  | { type: 'reading-text', params: ReadingTextParams }
  | { type: 'crossword', params: CrosswordParams }
  | FilwordParams // обратная совместимость

export async function POST(request: NextRequest) {
  try {
    // Получаем URL PDF сервиса в runtime, а не при сборке
    const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL || 'http://127.0.0.1:3001'
    console.log('PDF_SERVICE_URL:', PDF_SERVICE_URL)

    // Парсинг запроса
    const body = await request.json() as GenerateRequest

    // Определяем тип запроса и валидируем
    let validationResult: { success: boolean; error?: string }

    if ('type' in body && body.type === 'reading-text') {
      // Новый API для reading-text
      const validationData = validateReadingTextParams(body.params)
      validationResult = validationData.success
        ? { success: true }
        : { success: false, error: validationData.errors?.join(', ') || 'Ошибка валидации' }
    } else if ('type' in body && body.type === 'crossword') {
      // Новый API для crossword
      const validationData = validateCrosswordParams(body.params)
      validationResult = validationData.success
        ? { success: true }
        : { success: false, error: validationData.errors?.join(', ') || 'Ошибка валидации' }
    } else if ('type' in body && body.type === 'filword') {
      // Новый API для filword
      validationResult = validateFilwordParams(body.params)
    } else {
      // Обратная совместимость - считаем что это filword
      validationResult = validateFilwordParams(body as FilwordParams)
    }

    if (!validationResult.success) {
      return NextResponse.json(
        { message: validationResult.error },
        { status: 400 }
      )
    }

    // Новая архитектура: генерируем HTML сначала, потом PDF
    if ('type' in body && body.type === 'reading-text') {
      // Для reading-text используем новую архитектуру HTML->PDF

      // 1. Генерируем HTML в веб-сервисе (один источник истины!)
      const html = generateReadingTextHTML(body.params as ReadingTextParams)

      // 2. Отправляем HTML в новый эндпоинт для генерации PDF
      const pdfResponse = await fetch(`${PDF_SERVICE_URL}/generate-from-html`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ html }),
      })

      if (!pdfResponse.ok) {
        const errorText = await pdfResponse.text()
        console.error('PDF from HTML error:', errorText)
        return NextResponse.json(
          { message: 'Ошибка генерации PDF из HTML' },
          { status: pdfResponse.status }
        )
      }

      // Получаем PDF как stream
      const pdfBuffer = await pdfResponse.arrayBuffer()

      // Генерируем имя файла
      const params = body.params as ReadingTextParams
      const filename = `reading-text-${params.textType}-${Date.now()}.pdf`

      // Записываем статистику скачивания (серверная сторона - логируем в консоль)
      console.log('📊 Download recorded:', {
        type: 'reading-text',
        textType: params.textType,
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get('user-agent')?.substring(0, 50)
      })

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
          'Cache-Control': 'no-cache',
          'X-Download-Type': 'reading-text', // Для клиентской статистики
          'X-Download-Metadata': JSON.stringify({ textType: params.textType }),
        },
      })

    } else if ('type' in body && body.type === 'crossword') {
      // Для crossword используем новую архитектуру HTML->PDF

      try {
        console.log('🎯 Crossword generation started')

        // 1. Генерируем HTML в веб-сервисе (один источник истины!)
        const html = await generateCrosswordHTML(body.params as CrosswordParams)

        console.log('✅ HTML generated, length:', html.length)

      // 2. Отправляем HTML в новый эндпоинт для генерации PDF
      const pdfResponse = await fetch(`${PDF_SERVICE_URL}/generate-from-html`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ html }),
      })

      if (!pdfResponse.ok) {
        const errorText = await pdfResponse.text()
        console.error('PDF from HTML error:', errorText)
        return NextResponse.json(
          { message: 'Ошибка генерации кроссворда из HTML' },
          { status: pdfResponse.status }
        )
      }

      // Получаем PDF как stream
      const pdfBuffer = await pdfResponse.arrayBuffer()

      // Генерируем имя файла для crossword
      const params = body.params as CrosswordParams
      const filename = `crossword-${params.gridSize}-${Date.now()}.pdf`

      // Записываем статистику скачивания (серверная сторона - логируем в консоль)
      console.log('📊 Download recorded:', {
        type: 'crossword',
        gridSize: params.gridSize,
        wordsCount: params.words.length,
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get('user-agent')?.substring(0, 50)
      })

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
          'Cache-Control': 'no-cache',
          'X-Download-Type': 'crossword', // Для клиентской статистики
          'X-Download-Metadata': JSON.stringify({ gridSize: params.gridSize, wordsCount: params.words.length }),
        },
      })

      } catch (error) {
        console.error('❌ Crossword error:', error)
        return NextResponse.json(
          { message: `Ошибка генерации кроссворда: ${error.message}` },
          { status: 500 }
        )
      }

    } else {
      // Для filword пока оставляем старую архитектуру
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

      // Генерируем имя файла для filword
      const params = 'params' in body ? body.params as FilwordParams : body as FilwordParams
      const filename = `filword-${params.gridSize}-${params.fontSize}-${params.words.length}words-${Date.now()}.pdf`

      // Записываем статистику скачивания (серверная сторона - логируем в консоль)
      console.log('📊 Download recorded:', {
        type: 'filword',
        gridSize: params.gridSize,
        wordsCount: params.words.length,
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get('user-agent')?.substring(0, 50)
      })

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
          'Cache-Control': 'no-cache',
          'X-Download-Type': 'filword', // Для клиентской статистики
          'X-Download-Metadata': JSON.stringify({ gridSize: params.gridSize, wordsCount: params.words.length }),
        },
      })
    }

  } catch (error) {
    console.error('API error:', error)
    
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}// Force rebuild Mon Aug 25 21:32:12 -03 2025
