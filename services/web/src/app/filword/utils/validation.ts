import { FilwordParams, GRID_SIZE_LIMITS } from '../types'

interface ValidationResult {
  success: boolean
  error?: string
}

export function validateFilwordParams(params: FilwordParams): ValidationResult {
  // Проверка слов
  if (!params.words || params.words.length === 0) {
    return { success: false, error: 'Добавьте хотя бы одно слово' }
  }

  // Проверка лимитов для размера сетки
  const limits = GRID_SIZE_LIMITS[params.gridSize]
  if (params.words.length > limits.maxWords) {
    return { 
      success: false, 
      error: `Слишком много слов для сетки ${params.gridSize}. Максимум: ${limits.maxWords}` 
    }
  }

  // Проверка длины слов
  const tooLongWords = params.words.filter(word => word.length > limits.maxWordLength)
  if (tooLongWords.length > 0) {
    return { 
      success: false, 
      error: `Слишком длинные слова для сетки ${params.gridSize}: ${tooLongWords.join(', ')}. Максимум: ${limits.maxWordLength} символов` 
    }
  }

  // Проверка коротких слов
  const tooShortWords = params.words.filter(word => word.length < 3)
  if (tooShortWords.length > 0) {
    return { 
      success: false, 
      error: `Слишком короткие слова: ${tooShortWords.join(', ')}. Минимум: 3 символа` 
    }
  }

  // Проверка символов (кириллица и латиница)
  const invalidWords = params.words.filter(word => !/^[а-яёa-z]+$/i.test(word))
  if (invalidWords.length > 0) {
    return { 
      success: false, 
      error: `Недопустимые символы в словах: ${invalidWords.join(', ')}. Используйте только русские или английские буквы` 
    }
  }

  // Проверка направлений
  const hasAnyDirection = Object.values(params.directions).some(Boolean)
  if (!hasAnyDirection) {
    return { success: false, error: 'Выберите хотя бы одно направление для размещения слов' }
  }

  // Проверка дублей
  const uniqueWords = new Set(params.words.map(w => w.toLowerCase()))
  if (uniqueWords.size < params.words.length) {
    return { success: false, error: 'Обнаружены повторяющиеся слова' }
  }

  return { success: true }
}

// Утилита для очистки и нормализации слов
export function normalizeWords(input: string): string[] {
  return input
    .split(/[,\n]/)
    .map(word => word.trim().toLowerCase())
    .filter(word => word.length >= 3)
    .filter(word => /^[а-яёa-z]+$/i.test(word))
    .filter((word, index, arr) => arr.indexOf(word) === index) // убираем дубли
}
