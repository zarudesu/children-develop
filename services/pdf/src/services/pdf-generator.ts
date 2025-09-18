import { chromium, Browser, BrowserContext } from 'playwright'
import { readFileSync } from 'fs'
import { join } from 'path'
import Handlebars from 'handlebars'
import { FilwordParams, TemplateData, GenerateRequest, ReadingTextParams, ReadingTextTemplateData, TEXT_TYPE_DESCRIPTIONS } from '../types'
import { FilwordEngine } from './filword-engine'
import { applyTextCase } from '../utils/text-utils'
import { TextTransformer } from './text-transformer'

// Глобальные переменные для переиспользования браузера
let browser: Browser | null = null
let context: BrowserContext | null = null

async function getBrowser(): Promise<Browser> {
  if (!browser) {
    const launchOptions: any = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=TranslateUI',
        '--disable-extensions',
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding',
        '--disable-backgrounding-occluded-windows',
      ]
    }

    browser = await chromium.launch(launchOptions)
  }
  return browser
}

async function getContext(): Promise<BrowserContext> {
  if (!context) {
    const browserInstance = await getBrowser()
    context = await browserInstance.newContext({
      viewport: { width: 794, height: 1123 }, // A4 размер в пикселях
    })
  }
  return context
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing browser...')
  if (context) await context.close()
  if (browser) await browser.close()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('Closing browser...')
  if (context) await context.close()
  if (browser) await browser.close()
  process.exit(0)
})

export async function generatePDF(request: GenerateRequest | FilwordParams): Promise<Buffer> {
  // Обратная совместимость: если передали FilwordParams напрямую
  const requestData: GenerateRequest = 'type' in request
    ? request as GenerateRequest
    : { type: 'filword', params: request as FilwordParams }

  if (requestData.type === 'reading-text') {
    return generateReadingTextPDF(requestData.params as ReadingTextParams)
  } else {
    return generateFilwordPDF(requestData.params as FilwordParams)
  }
}

async function generateFilwordPDF(params: FilwordParams): Promise<Buffer> {
  const startTime = Date.now()
  
  try {
    console.log(`Starting PDF generation for ${params.gridSize} grid with ${params.words.length} words`)
    
    // Генерация филворда
    const engine = new FilwordEngine(params.gridSize)
    const filwordData = engine.generateGrid(params.words, params.directions)
    
    console.log(`Grid generated in ${Date.now() - startTime}ms`)
    
    // Применение регистра к словам
    const processedWords = params.words.map(word => applyTextCase(word, params.textCase))
    
    // Получение браузера и контекста
    const browserContext = await getContext()
    const page = await browserContext.newPage()
    
    try {
      // Загрузка и компиляция шаблонов
      // В production шаблоны находятся в /app/templates, в dev - относительно src
      const templatesPath = process.env.NODE_ENV === 'production' 
        ? join(process.cwd(), 'templates') 
        : join(__dirname, '../templates')
      
      const layoutTemplate = readFileSync(join(templatesPath, 'layout.hbs'), 'utf8')
      const filwordTemplate = readFileSync(join(templatesPath, 'filword.hbs'), 'utf8')
      
      const compiledLayout = Handlebars.compile(layoutTemplate)
      const compiledFilword = Handlebars.compile(filwordTemplate)
      
      // Подготовка данных для шаблона задания (страница 1)
      const taskData: TemplateData = {
        title: 'Найди слова:',
        words: processedWords,
        grid: filwordData.grid.map(row => 
          row.map(cell => ({
            letter: applyTextCase(cell.letter, params.textCase),
            isPartOfWord: false, // На странице задания не показываем ответы
          }))
        ),
        gridSize: filwordData.size,
        fontSize: params.fontSize,
        isAnswerPage: false,
        placedWords: filwordData.placedWords
      }
      
      // Подготовка данных для страницы ответов (страница 2)
      const answerData: TemplateData = {
        title: 'Ответы:',
        words: processedWords,
        grid: filwordData.grid.map(row => 
          row.map(cell => ({
            letter: applyTextCase(cell.letter, params.textCase),
            isPartOfWord: cell.isPartOfWord, // Показываем выделение
            wordId: cell.wordId
          }))
        ),
        gridSize: filwordData.size,
        fontSize: params.fontSize,
        isAnswerPage: true,
        placedWords: filwordData.placedWords
      }
      
      // Генерация HTML для обеих страниц
      const taskPageContent = compiledFilword(taskData)
      const answerPageContent = compiledFilword(answerData)
      
      const fullHTML = compiledLayout({
        taskPage: taskPageContent,
        answerPage: answerPageContent,
        gridSize: filwordData.size
      })
      
      console.log(`HTML generated in ${Date.now() - startTime}ms`)
      
      // Загрузка HTML в браузер
      await page.setContent(fullHTML, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      })
      
      // Генерация PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { 
          top: '1cm', 
          bottom: '1cm', 
          left: '1cm', 
          right: '1cm' 
        },
        preferCSSPageSize: true
      })
      
      console.log(`PDF generated successfully in ${Date.now() - startTime}ms (${pdfBuffer.length} bytes)`)
      
      return pdfBuffer
      
    } finally {
      await page.close()
    }
    
  } catch (error) {
    console.error('PDF generation failed:', error)
    throw error
  }
}

async function generateReadingTextPDF(params: ReadingTextParams): Promise<Buffer> {
  const startTime = Date.now()

  try {
    console.log(`Starting reading text PDF generation: ${params.textType}`)

    // Трансформация текста
    const transformedText = TextTransformer.transform(params.inputText, params.textType, {
      cutPercentage: params.cutPercentage,
      endingLength: params.endingLength,
      reversedWordCount: params.reversedWordCount,
      extraLetterDensity: params.extraLetterDensity,
      textCase: params.textCase
    })

    // Подсчет метаданных
    const words = params.inputText.trim().split(/\s+/).filter(w => w.length > 0)
    const typeInfo = TEXT_TYPE_DESCRIPTIONS[params.textType]

    // Получение браузера и контекста
    const browserContext = await getContext()
    const page = await browserContext.newPage()

    try {
      // Загрузка шаблона
      const templatesPath = process.env.NODE_ENV === 'production'
        ? join(process.cwd(), 'templates')
        : join(__dirname, '../templates')

      const templateContent = readFileSync(join(templatesPath, 'reading-text-simple.html'), 'utf8')

      // Регистрация простых Handlebars хелперов (избегаем сложных конструкций)
      if (!Handlebars.helpers.eq) {
        Handlebars.registerHelper('eq', function(a: any, b: any) {
          return a === b
        })
      }

      const compiledTemplate = Handlebars.compile(templateContent)

      // Подготовка данных для шаблона
      const templateData: ReadingTextTemplateData = {
        type: params.textType,
        title: params.title || 'Упражнение на технику чтения',
        centerTitle: params.centerTitle !== false,
        originalText: params.inputText,
        transformedText,
        fontSize: params.fontSize,
        pageNumbers: params.pageNumbers !== false,
        includeInstructions: params.includeInstructions !== false,
        instructions: params.customInstructions,
        metadata: {
          wordsCount: words.length,
          charactersCount: params.inputText.length,
          difficulty: typeInfo.difficulty
        }
      }

      // Генерация HTML
      const html = compiledTemplate(templateData)

      console.log(`HTML generated for reading text in ${Date.now() - startTime}ms`)

      // Загрузка HTML в браузер
      await page.setContent(html, {
        waitUntil: 'networkidle',
        timeout: 30000
      })

      // Добавляем CSS стили для трансформаций
      await page.addStyleTag({
        content: TextTransformer.getTransformationStyles()
      })

      // Генерация PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '1.5cm',
          bottom: '1.5cm',
          left: '2cm',
          right: '2cm'
        },
        preferCSSPageSize: true
      })

      console.log(`Reading text PDF generated successfully in ${Date.now() - startTime}ms (${pdfBuffer.length} bytes)`)

      return pdfBuffer

    } finally {
      await page.close()
    }

  } catch (error) {
    console.error('Reading text PDF generation failed:', error)
    throw new Error(`text transformation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Функция для очистки ресурсов (можно вызывать периодически)
export async function cleanup(): Promise<void> {
  if (context) {
    await context.close()
    context = null
  }
  if (browser) {
    await browser.close()
    browser = null
  }
}