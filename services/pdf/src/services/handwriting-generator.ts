import { HandwritingParams, HandwritingTemplateData } from '../types'
import { BasePDFGenerator } from './base-pdf-generator'
import { validateInputText, validateHandwritingParameters, COMMON_FONT_SIZES } from '../utils/validation-helpers'

export class HandwritingGenerator extends BasePDFGenerator<HandwritingParams, HandwritingTemplateData> {
  constructor() {
    super('handwriting.html')
  }

  validateParams(params: HandwritingParams): string[] {
    const errors: string[] = []

    // Валидация текста
    errors.push(...validateInputText(params.inputText, 3000, 'Текст для прописей'))

    // Валидация параметров прописей
    errors.push(...validateHandwritingParameters(params))

    return errors
  }

  generateTemplateData(params: HandwritingParams): HandwritingTemplateData {
    // Подсчет метаданных
    const words = params.inputText.trim().split(/\s+/).filter(w => w.length > 0)
    const characters = params.inputText.length

    // Оценка времени выполнения (примерно 1 символ = 2-3 секунды для детей)
    const estimatedTimeMinutes = Math.ceil(characters / 30)

    // Разбивка текста на строки для прописей
    const textLines = this.prepareTextLines(params.inputText, params.preserveParagraphs !== false)

    return {
      title: params.title || 'Упражнение по письму',
      inputText: params.inputText,
      lineType: params.lineType,
      fontSize: params.fontSize,
      textStyle: params.textStyle,
      centerTitle: params.centerTitle !== false,
      preserveParagraphs: params.preserveParagraphs !== false,
      includeInstructions: params.includeInstructions !== false,
      instructions: this.generateInstructions(params),
      textLines,
      metadata: {
        wordCount: words.length,
        characterCount: characters,
        estimatedTime: estimatedTimeMinutes
      }
    }
  }

  private prepareTextLines(text: string, preserveParagraphs: boolean): Array<{text?: string, isEmpty?: boolean, isBreak?: boolean}> {
    const lines: Array<{text?: string, isEmpty?: boolean, isBreak?: boolean}> = []

    if (preserveParagraphs) {
      const paragraphs = text.split('\n').filter(p => p.trim().length > 0)

      paragraphs.forEach((paragraph, index) => {
        // Разбиваем длинные абзацы на строки (примерно 40-50 символов на строку)
        const sentences = this.splitIntoLines(paragraph.trim(), 45)

        sentences.forEach(sentence => {
          lines.push({ text: sentence })
        })

        // Добавляем разрыв между абзацами (кроме последнего)
        if (index < paragraphs.length - 1) {
          lines.push({ isBreak: true })
        }
      })
    } else {
      // Без сохранения абзацев - просто разбиваем на строки
      const allText = text.replace(/\n+/g, ' ').trim()
      const sentences = this.splitIntoLines(allText, 45)

      sentences.forEach(sentence => {
        lines.push({ text: sentence })
      })
    }

    // Добавляем несколько пустых строк в конце для самостоятельного письма
    for (let i = 0; i < 3; i++) {
      lines.push({ isEmpty: true })
    }

    return lines
  }

  private splitIntoLines(text: string, maxLength: number): string[] {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''

    words.forEach(word => {
      if ((currentLine + ' ' + word).length <= maxLength) {
        currentLine = currentLine ? currentLine + ' ' + word : word
      } else {
        if (currentLine) {
          lines.push(currentLine)
          currentLine = word
        } else {
          // Слово слишком длинное, разбиваем его
          lines.push(word)
          currentLine = ''
        }
      }
    })

    if (currentLine) {
      lines.push(currentLine)
    }

    return lines
  }

  private generateInstructions(params: HandwritingParams): string {
    const instructions = []

    instructions.push('1. Сядьте прямо, поставьте ноги на пол.')
    instructions.push('2. Положите тетрадь под небольшим углом.')
    instructions.push('3. Правильно держите ручку тремя пальцами.')

    if (params.textStyle === 'solid-gray') {
      instructions.push('4. Обведите серые буквы аккуратно, не отрывая ручку.')
    } else {
      instructions.push('4. Обведите пунктирные линии, следуя направлению письма.')
    }

    if (params.lineType === 'narrow-with-diagonal') {
      instructions.push('5. Соблюдайте наклон букв по косым линиям.')
    }

    instructions.push('6. Пишите медленно и аккуратно.')
    instructions.push('7. Делайте паузы для отдыха руки.')

    return instructions.join('\n')
  }
}