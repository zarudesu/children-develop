import { z } from 'zod'
import { CrosswordDifficulty, CrosswordStyle } from '../types'

// Схема для одного слова кроссворда
export const crosswordWordSchema = z.object({
  word: z.string()
    .min(3, 'Слово должно содержать минимум 3 буквы')
    .max(15, 'Слово не должно превышать 15 букв')
    .refine(
      (word) => /^[а-яё]+$/i.test(word),
      'Слово должно содержать только кириллические буквы'
    ),
  clue: z.string()
    .min(5, 'Определение должно содержать минимум 5 символов')
    .max(100, 'Определение не должно превышать 100 символов'),
  answer: z.string()
    .min(3, 'Ответ должен содержать минимум 3 буквы')
    .max(15, 'Ответ не должен превышать 15 букв'),
  length: z.number().min(3).max(15)
})

// Схема для параметров кроссворда
export const crosswordParamsSchema = z.object({
  words: z.array(crosswordWordSchema)
    .min(5, 'Кроссворд должен содержать минимум 5 слов')
    .max(50, 'Кроссворд не должен содержать более 50 слов')
    .refine(
      (words) => {
        // Проверяем, что все слова уникальны
        const wordTexts = words.map(w => w.word.toLowerCase())
        return new Set(wordTexts).size === wordTexts.length
      },
      'Все слова должны быть уникальными'
    ),

  gridSize: z.enum(['11x11', '13x13', '15x15', '17x17', '19x19', '21x21'] as const),

  difficulty: z.enum(['easy', 'medium', 'hard'] as const),

  style: z.enum(['classic', 'american', 'scandinavian'] as const),

  fontSize: z.enum(['large', 'medium', 'small'] as const),

  includeAnswers: z.boolean(),

  showNumbers: z.boolean(),

  blackSquareRatio: z.number()
    .min(0.05, 'Доля чёрных клеток должна быть минимум 5%')
    .max(0.20, 'Доля чёрных клеток не должна превышать 20%')
})

export type ValidatedCrosswordParams = z.infer<typeof crosswordParamsSchema>

// Функция валидации с детальными ошибками
export function validateCrosswordParams(data: unknown): {
  success: boolean
  data?: ValidatedCrosswordParams
  errors?: string[]
} {
  try {
    const result = crosswordParamsSchema.parse(data)

    // Дополнительные проверки совместимости
    const compatibilityCheck = validateCrosswordCompatibility(result)
    if (!compatibilityCheck.valid) {
      return { success: false, errors: compatibilityCheck.errors }
    }

    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      return { success: false, errors }
    }
    return { success: false, errors: ['Неизвестная ошибка валидации'] }
  }
}

// Проверка совместимости параметров кроссворда
export function validateCrosswordCompatibility(params: ValidatedCrosswordParams): {
  valid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Проверяем соответствие количества слов размеру сетки
  const gridSize = parseInt(params.gridSize.split('x')[0])
  const maxPossibleWords = Math.floor(gridSize * gridSize * 0.3) // приблизительно 30% ячеек

  if (params.words.length > maxPossibleWords) {
    errors.push(`Слишком много слов для сетки ${params.gridSize}. Максимум: ${maxPossibleWords}`)
  }

  // Проверяем минимальное количество слов для заполнения сетки
  const minWordsForGrid = Math.max(5, Math.floor(gridSize * 0.8))
  if (params.words.length < minWordsForGrid) {
    warnings.push(`Для сетки ${params.gridSize} рекомендуется минимум ${minWordsForGrid} слов`)
  }

  // Проверяем соответствие длины слов сложности
  const difficultySettings = {
    easy: { minLength: 3, maxLength: 8 },
    medium: { minLength: 4, maxLength: 12 },
    hard: { minLength: 5, maxLength: 15 }
  }

  const settings = difficultySettings[params.difficulty]
  const wordsOutOfRange = params.words.filter(word =>
    word.word.length < settings.minLength || word.word.length > settings.maxLength
  )

  if (wordsOutOfRange.length > 0) {
    warnings.push(
      `Для сложности "${params.difficulty}" рекомендуется длина слов ${settings.minLength}-${settings.maxLength} букв. ` +
      `Несоответствующие слова: ${wordsOutOfRange.map(w => w.word).join(', ')}`
    )
  }

  // Проверяем, что word и answer совпадают
  const mismatchedWords = params.words.filter(item =>
    item.word.toLowerCase() !== item.answer.toLowerCase()
  )
  if (mismatchedWords.length > 0) {
    errors.push(`Слово и ответ должны совпадать: ${mismatchedWords.map(w => w.word).join(', ')}`)
  }

  // Проверяем, что length соответствует длине слова
  const wrongLengths = params.words.filter(item => item.length !== item.word.length)
  if (wrongLengths.length > 0) {
    errors.push(`Неверная длина слова: ${wrongLengths.map(w => `${w.word} (указано: ${w.length}, фактически: ${w.word.length})`).join(', ')}`)
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

// Проверка кириллического слова
export function isCyrillicWord(word: string): boolean {
  const cyrillicRegex = /^[а-яё]+$/i
  return cyrillicRegex.test(word)
}

// Подсчет уникальных букв в словах (для оценки сложности размещения)
export function analyzeWordComplexity(words: string[]): {
  uniqueLetters: number
  averageLength: number
  complexity: 'low' | 'medium' | 'high'
} {
  const allLetters = words.join('').toLowerCase()
  const uniqueLetters = new Set(allLetters).size
  const averageLength = words.reduce((sum, word) => sum + word.length, 0) / words.length

  let complexity: 'low' | 'medium' | 'high' = 'medium'

  if (uniqueLetters < 15 && averageLength < 6) {
    complexity = 'low'
  } else if (uniqueLetters > 20 && averageLength > 8) {
    complexity = 'high'
  }

  return {
    uniqueLetters,
    averageLength: Math.round(averageLength * 10) / 10,
    complexity
  }
}

// Генерация рекомендаций по улучшению кроссворда
export function generateCrosswordRecommendations(params: ValidatedCrosswordParams): string[] {
  const recommendations: string[] = []
  const analysis = analyzeWordComplexity(params.words.map(w => w.word))

  if (analysis.complexity === 'low') {
    recommendations.push('Попробуйте добавить более длинные слова для увеличения сложности')
  }

  if (analysis.uniqueLetters < 12) {
    recommendations.push('Добавьте слова с большим разнообразием букв для лучших пересечений')
  }

  const shortWords = params.words.filter(w => w.word.length < 4)
  if (shortWords.length > params.words.length * 0.3) {
    recommendations.push('Слишком много коротких слов. Добавьте слова длиной 5-8 букв')
  }

  const longWords = params.words.filter(w => w.word.length > 10)
  if (longWords.length > params.words.length * 0.2) {
    recommendations.push('Слишком много длинных слов может затруднить размещение')
  }

  // Проверяем качество определений
  const shortClues = params.words.filter(w => w.clue.length < 15)
  if (shortClues.length > params.words.length * 0.5) {
    recommendations.push('Добавьте более подробные определения для лучшего понимания')
  }

  return recommendations
}