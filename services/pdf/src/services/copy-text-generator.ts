import { CopyTextParams, CopyTextTemplateData } from '../types'
import { BasePDFGenerator } from './base-pdf-generator'
import { validateInputText, validateFontSize, validateFromList, COMMON_FONT_SIZES, LINE_SPACINGS } from '../utils/validation-helpers'

export class CopyTextGenerator extends BasePDFGenerator<CopyTextParams, CopyTextTemplateData> {
  constructor() {
    super('copy-text.html')
  }

  validateParams(params: CopyTextParams): string[] {
    const errors: string[] = []

    // Валидация текста
    errors.push(...validateInputText(params.inputText, 2000, 'Текст для списывания'))

    // Валидация стиля
    errors.push(...validateFromList(params.style, ['printed', 'handwritten'], 'Неверный стиль текста'))

    // Валидация размера шрифта
    errors.push(...validateFontSize(params.fontSize, COMMON_FONT_SIZES.COPY_TEXT))

    // Валидация межстрочного интервала
    errors.push(...validateFromList(params.lineSpacing, LINE_SPACINGS, 'Неверный межстрочный интервал'))

    return errors
  }

  generateTemplateData(params: CopyTextParams): CopyTextTemplateData {
    const wordCount = this.countWords(params.inputText)
    const characterCount = this.countCharacters(params.inputText)
    const estimatedTime = this.estimateTime(params.inputText)

    return {
      title: params.title || this.generateDefaultTitle(params.style),
      inputText: params.inputText,
      style: params.style,
      fontSize: params.fontSize,
      lineSpacing: params.lineSpacing,
      centerTitle: params.centerTitle || false,
      preserveParagraphs: params.preserveParagraphs || false,
      allowWordBreaks: params.allowWordBreaks || false,
      includeInstructions: params.includeExerciseInstructions || false,
      instructions: this.generateInstructions(params.style),
      metadata: {
        wordCount,
        characterCount,
        estimatedTime
      }
    }
  }

  private generateDefaultTitle(style: 'printed' | 'handwritten'): string {
    return style === 'printed'
      ? 'Списывание с печатного текста'
      : 'Списывание с письменного текста'
  }

  private generateInstructions(style: 'printed' | 'handwritten'): string {
    return style === 'printed'
      ? 'Внимательно прочитайте текст и аккуратно переписжите его письменными буквами. Соблюдайте абзацы и знаки препинания.'
      : 'Внимательно прочитайте письменный текст и аккуратно переписжите его. Соблюдайте абзацы и знаки препинания.'
  }
}