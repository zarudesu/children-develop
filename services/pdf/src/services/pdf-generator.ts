import { chromium, Browser, BrowserContext } from 'playwright'
import { readFileSync } from 'fs'
import { join } from 'path'
import Handlebars from 'handlebars'
import { FilwordParams, TemplateData } from '../types'
import { FilwordEngine } from './filword-engine'
import { applyTextCase } from '../utils/text-utils'

// Глобальные переменные для переиспользования браузера
let browser: Browser | null = null
let context: BrowserContext | null = null

async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await chromium.launch({
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
    })
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

export async function generatePDF(params: FilwordParams): Promise<Buffer> {
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
      const layoutTemplate = readFileSync(join(__dirname, '../templates/layout.hbs'), 'utf8')
      const filwordTemplate = readFileSync(join(__dirname, '../templates/filword.hbs'), 'utf8')
      
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
        preferCSSPageSize: true,
        timeout: 30000
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