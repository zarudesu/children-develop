import express from 'express'
import cors from 'cors'
import { generatePDF } from './services/pdf-generator'
import { validateRequest, validateReadingTextRequest } from './utils/validation'
import { GenerateRequest, GeneratorType } from './types'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json({ limit: '1mb' }))

// Логирование запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`)
  next()
})

// Health check with Playwright verification
app.get('/health', async (req, res) => {
  try {
    // Quick check - can we import playwright?
    const { chromium } = await import('playwright')
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
      service: 'childdev-pdf',
      environment: process.env.NODE_ENV || 'development',
      playwright: {
        available: true,
        chromiumPath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || 'bundled'
      }
    }
    
    res.json(healthData)
  } catch (error) {
    console.error('Health check failed:', error)
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'childdev-pdf',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Основной endpoint генерации PDF
app.post('/generate', async (req, res) => {
  try {
    const requestBody = req.body as GenerateRequest

    console.log('Received generation request:', {
      type: requestBody.type,
      ...(requestBody.type === 'filword' && {
        words: (requestBody.params as any).words?.length,
        gridSize: (requestBody.params as any).gridSize,
        textCase: (requestBody.params as any).textCase
      }),
      ...(requestBody.type === 'reading-text' && {
        textType: (requestBody.params as any).textType,
        textLength: (requestBody.params as any).inputText?.length,
        fontSize: (requestBody.params as any).fontSize
      })
    })

    // Валидация в зависимости от типа генератора
    let validation: { success: boolean; error?: string }

    if (requestBody.type === 'reading-text') {
      validation = validateReadingTextRequest(requestBody.params)
    } else {
      // По умолчанию валидируем как филворд для обратной совместимости
      validation = validateRequest(requestBody.params || requestBody)
    }

    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        message: validation.error
      })
    }

    // Генерация PDF
    const pdfBuffer = await generatePDF(requestBody)

    // Отправка PDF
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Length', pdfBuffer.length)
    res.setHeader('Cache-Control', 'no-cache')

    res.send(pdfBuffer)

    console.log(`PDF generated successfully: ${pdfBuffer.length} bytes`)

  } catch (error) {
    console.error('PDF generation error:', error)

    if (error instanceof Error && error.message.includes('placement failed')) {
      return res.status(422).json({
        error: 'Word placement failed',
        message: 'Не удалось разместить все слова в сетке. Попробуйте уменьшить количество слов или увеличить размер сетки.'
      })
    }

    if (error instanceof Error && error.message.includes('text transformation failed')) {
      return res.status(422).json({
        error: 'Text transformation failed',
        message: 'Ошибка обработки текста. Проверьте корректность входных данных.'
      })
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Ошибка генерации PDF'
    })
  }
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  })
})

// Error handler
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error)
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  })
})

// Запуск сервера
app.listen(PORT, () => {
  console.log(`PDF Service running on port ${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
})

export default app