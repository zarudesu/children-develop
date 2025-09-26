import { z } from 'zod'
import { ReadingTextType, FontSize, TextCase } from '../types'

// Схема для параметров конструктора текстов
export const readingTextParamsSchema = z.object({
  textType: z.union([
    z.enum([
      'normal',
      'bottom-cut',
      'top-cut',
      'missing-endings',
      'missing-vowels',
      'partial-reversed',
      'scrambled-words',
      'merged-text',
      'extra-letters',
      'mirror-text',
      'mixed-types',
      'word-ladder'
    ] as const),
    z.array(z.enum([
      'normal',
      'bottom-cut',
      'top-cut',
      'missing-endings',
      'missing-vowels',
      'partial-reversed',
      'scrambled-words',
      'merged-text',
      'extra-letters',
      'mirror-text',
      'mixed-types',
      'word-ladder'
    ] as const)).min(1).max(12)
  ]),

  inputText: z.string()
    .min(10, 'Текст должен содержать минимум 10 символов')
    .max(2000, 'Текст не должен превышать 2000 символов')
    .refine(
      (text) => text.trim().split(/\s+/).length >= 3,
      'Текст должен содержать минимум 3 слова'
    )
    .refine(
      (text) => /[а-яё]/i.test(text),
      'Текст должен содержать кириллические символы'
    ),

  fontSize: z.enum(['super-huge', 'huge', 'extra-large', 'large', 'medium'] as const),
  fontFamily: z.enum(['serif', 'sans-serif', 'mono', 'cursive', 'propisi'] as const),
  textCase: z.enum(['upper', 'lower', 'mixed'] as const),

  // Опциональные параметры для специфичных типов
  cutPercentage: z.number().min(20).max(70).optional(),
  endingLength: z.number().min(1).max(3).optional(),
  reversedWordCount: z.number().min(1).max(10).optional(),
  extraLetterDensity: z.number().min(10).max(50).optional(),

  // Форматирование
  hasTitle: z.boolean().optional().default(false),
  title: z.string().max(100).optional(),
  centerTitle: z.boolean().optional().default(true),
  pageNumbers: z.boolean().optional().default(true),
  includeInstructions: z.boolean().optional().default(true),
  customInstructions: z.string().max(500).optional()
})

export type ValidatedReadingTextParams = z.infer<typeof readingTextParamsSchema>

// Функция валидации с детальными ошибками
export function validateReadingTextParams(data: unknown): {
  success: boolean
  data?: ValidatedReadingTextParams
  errors?: string[]
} {
  try {
    const result = readingTextParamsSchema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      return { success: false, errors }
    }
    return { success: false, errors: ['Неизвестная ошибка валидации'] }
  }
}

// Проверка кириллического текста
export function isCyrillicText(text: string): boolean {
  const cyrillicRegex = /[а-яё]/i
  return cyrillicRegex.test(text)
}

// Подсчет слов в кириллическом тексте
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

// Проверка сложности текста для выбранного типа
export function validateTextComplexity(
  text: string,
  textType: ReadingTextType | ReadingTextType[]
): { valid: boolean; warnings: string[] } {
  const words = text.trim().split(/\s+/)
  const warnings: string[] = []

  // Общие проверки
  if (words.length < 5) {
    warnings.push('Рекомендуется использовать минимум 5 слов для лучшего эффекта')
  }

  if (words.length > 50) {
    warnings.push('Слишком длинный текст может быть сложным для обработки')
  }

  // Если массив типов, проверяем каждый
  const typesToCheck = Array.isArray(textType) ? textType : [textType]

  // Специфичные проверки для разных типов
  for (const type of typesToCheck) {
    switch (type) {
    case 'scrambled-words':
      const longWords = words.filter(word => word.length > 8)
      if (longWords.length > words.length * 0.3) {
        warnings.push('Для анаграмм рекомендуется использовать более короткие слова')
      }
      break


    case 'merged-text':
      if (text.length > 200) {
        warnings.push('Слитный текст лучше делать покороче для удобства чтения')
      }
      break

    case 'missing-vowels':
      const hasComplexWords = words.some(word => {
        const vowelCount = (word.match(/[аеёиоуыэюя]/gi) || []).length
        return vowelCount < 2
      })
      if (hasComplexWords) {
        warnings.push('В тексте есть слова с малым количеством гласных - они могут быть слишком сложными')
      }
      break
    }
  }

  return {
    valid: warnings.length === 0,
    warnings
  }
}

// Проверка корректности дополнительных параметров
export function validateTypeSpecificParams(
  textType: ReadingTextType,
  params: Partial<ValidatedReadingTextParams>
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  switch (textType) {
    case 'bottom-cut':
    case 'top-cut':
      if (!params.cutPercentage || params.cutPercentage < 20 || params.cutPercentage > 70) {
        errors.push('Процент обрезания должен быть от 20% до 70%')
      }
      break

    case 'missing-endings':
      if (!params.endingLength || params.endingLength < 1 || params.endingLength > 3) {
        errors.push('Количество пропущенных букв должно быть от 1 до 3')
      }
      break

    case 'partial-reversed':
      if (params.reversedWordCount) {
        const wordCount = countWords(params.inputText || '')
        if (params.reversedWordCount > wordCount) {
          errors.push('Количество перевернутых слов не может превышать общее количество слов')
        }
      }
      break

    case 'extra-letters':
      if (!params.extraLetterDensity || params.extraLetterDensity < 10 || params.extraLetterDensity > 50) {
        errors.push('Плотность лишних букв должна быть от 10% до 50%')
      }
      break
  }

  return {
    valid: errors.length === 0,
    errors
  }
}