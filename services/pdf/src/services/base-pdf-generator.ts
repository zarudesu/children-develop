import { readFileSync } from 'fs'
import { join } from 'path'
import Handlebars from 'handlebars'
import { registerCommonHelpers } from '../utils/handlebars-helpers'

// Базовый класс для всех PDF генераторов
export abstract class BasePDFGenerator<TParams, TTemplateData> {
  protected templateName: string

  constructor(templateName: string) {
    this.templateName = templateName
  }

  // Абстрактные методы для каждого типа генератора
  abstract validateParams(params: TParams): string[]
  abstract generateTemplateData(params: TParams): TTemplateData

  // Общий метод генерации HTML
  generateHTML(params: TParams): string {
    try {
      console.log(`Starting ${this.templateName} HTML generation...`)

      // Валидация параметров
      const errors = this.validateParams(params)
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(', ')}`)
      }

      // Генерация данных для шаблона
      const templateData = this.generateTemplateData(params)

      // Загрузка и компиляция шаблона
      const templatePath = this.getTemplatePath()
      const templateContent = readFileSync(templatePath, 'utf-8')
      const template = Handlebars.compile(templateContent)

      // Регистрация общих хелперов
      registerCommonHelpers()

      // Генерация HTML
      const html = template(templateData)

      console.log(`${this.templateName} HTML generated successfully`)
      return html

    } catch (error) {
      console.error(`${this.templateName} HTML generation failed:`, error)
      throw new Error(`${this.templateName} generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Вспомогательный метод для получения пути к шаблону
  protected getTemplatePath(): string {
    const templatesPath = process.env.NODE_ENV === 'production'
      ? join(process.cwd(), 'templates')
      : join(__dirname, '../templates')

    return join(templatesPath, this.templateName)
  }

  // Вспомогательный метод для подсчета слов
  protected countWords(text: string): number {
    return text.trim().split(/\s+/).filter(w => w.length > 0).length
  }

  // Вспомогательный метод для подсчета символов
  protected countCharacters(text: string): number {
    return text.length
  }

  // Вспомогательный метод для оценки времени выполнения
  protected estimateTime(text: string): number {
    const wordCount = this.countWords(text)
    // Примерно 10 слов в минуту для списывания
    return Math.ceil(wordCount / 10)
  }
}