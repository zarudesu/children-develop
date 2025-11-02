import { ReadingTextParams, ReadingTextTemplateData, TEXT_TYPE_DESCRIPTIONS } from '../types'
import { BasePDFGenerator } from './base-pdf-generator'
import { TextTransformer } from './text-transformer'
import { validateInputText, validateFontSize, validateFontFamily, validateTextCase, validateNumberRange, COMMON_FONT_SIZES } from '../utils/validation-helpers'

export class ReadingTextGenerator extends BasePDFGenerator<ReadingTextParams, ReadingTextTemplateData> {
  constructor() {
    super('reading-text-simple.html')
  }

  validateParams(params: ReadingTextParams): string[] {
    const errors: string[] = []

    // Валидация текста
    errors.push(...validateInputText(params.inputText, 5000, 'Входной текст'))

    // Валидация типа текста
    const validTextTypes = Object.keys(TEXT_TYPE_DESCRIPTIONS)
    const textTypes = Array.isArray(params.textType) ? params.textType : [params.textType]

    for (const textType of textTypes) {
      if (!validTextTypes.includes(textType)) {
        errors.push(`Неверный тип текста: ${textType}`)
      }
    }

    // Валидация размера шрифта
    errors.push(...validateFontSize(params.fontSize, COMMON_FONT_SIZES.READING_TEXT))

    // Валидация семейства шрифта
    errors.push(...validateFontFamily(params.fontFamily))

    // Валидация регистра текста
    errors.push(...validateTextCase(params.textCase))

    // Валидация специфичных параметров reading-text
    if (params.cutPercentage !== undefined) {
      errors.push(...validateNumberRange(params.cutPercentage, 10, 90, 'Процент обрезания'))
    }

    // Валидация специфичных параметров reading-text
    if (params.endingLength !== undefined) {
      errors.push(...validateNumberRange(params.endingLength, 1, 3, 'Длина окончания'))
    }

    if (params.reversedWordCount !== undefined) {
      errors.push(...validateNumberRange(params.reversedWordCount, 1, Number.MAX_SAFE_INTEGER, 'Количество перевернутых слов'))
    }

    if (params.extraLetterDensity !== undefined) {
      errors.push(...validateNumberRange(params.extraLetterDensity, 0.1, 0.9, 'Плотность лишних букв'))
    }

    return errors
  }

  generateTemplateData(params: ReadingTextParams): ReadingTextTemplateData {
    // Определяем тип для работы с одиночным типом
    const firstType = Array.isArray(params.textType) ? params.textType[0] : params.textType

    // Трансформация текста
    const transformedText = TextTransformer.transform(params.inputText, firstType, {
      cutPercentage: params.cutPercentage,
      endingLength: params.endingLength,
      reversedWordCount: params.reversedWordCount,
      extraLetterDensity: params.extraLetterDensity,
      keepFirstLast: params.keepFirstLast,
      mixedMode: params.mixedMode,
      textCase: params.textCase
    })

    // Подсчет метаданных
    const words = params.inputText.trim().split(/\s+/).filter(w => w.length > 0)
    const typeInfo = TEXT_TYPE_DESCRIPTIONS[firstType]

    return {
      type: firstType,
      title: params.title || this.generateDefaultTitle(firstType),
      centerTitle: params.centerTitle !== false,
      originalText: params.inputText,
      transformedText,
      fontSize: params.fontSize,
      fontFamily: params.fontFamily || 'sans-serif',
      pageNumbers: params.pageNumbers !== false,
      includeInstructions: params.includeInstructions !== false,
      instructions: params.customInstructions || this.generateDefaultInstructions(firstType),
      metadata: {
        wordsCount: words.length,
        charactersCount: params.inputText.length,
        difficulty: typeInfo.difficulty
      }
    }
  }

  private generateDefaultTitle(textType: string): string {
    const typeInfo = TEXT_TYPE_DESCRIPTIONS[textType as keyof typeof TEXT_TYPE_DESCRIPTIONS]
    return typeInfo ? `Упражнение: ${typeInfo.name}` : 'Упражнение на технику чтения'
  }

  private generateDefaultInstructions(textType: string): string {
    const typeInfo = TEXT_TYPE_DESCRIPTIONS[textType as keyof typeof TEXT_TYPE_DESCRIPTIONS]

    const baseInstructions: Record<string, string> = {
      'normal': 'Прочитайте текст внимательно и выразительно.',
      'bottom-cut': 'Прочитайте текст, где нижняя часть букв обрезана. Внимательно смотрите на верхние части букв.',
      'top-cut': 'Прочитайте текст, где верхняя часть букв обрезана. Внимательно смотрите на нижние части букв.',
      'missing-endings': 'Прочитайте текст и мысленно дополните недостающие окончания слов.',
      'missing-vowels': 'Прочитайте текст, где гласные заменены черточками. Мысленно вставьте пропущенные гласные.',
      'partial-reversed': 'Прочитайте текст. Некоторые слова написаны наоборот — прочитайте их справа налево.',
      'scrambled-words': 'Прочитайте текст, где буквы в словах перемешаны. Попробуйте понять правильный порядок букв.',
      'merged-text': 'Прочитайте слитный текст. Мысленно разделите его на отдельные слова.',
      'extra-letters': 'Прочитайте текст, игнорируя лишние буквы между основными.',
      'mirror-text': 'Прочитайте зеркальный текст справа налево.',
      'mixed-types': 'Прочитайте текст с разными типами трансформаций. Будьте внимательны!',
      'word-ladder': 'Прочитайте лесенку слов, постепенно увеличивая скорость.'
    }

    return baseInstructions[textType] || 'Прочитайте текст внимательно.'
  }
}