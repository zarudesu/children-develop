import { z } from 'zod'
import { FilwordParams, ReadingTextParams, CrosswordParams } from '../types'

const FilwordParamsSchema = z.object({
  words: z.array(z.string().min(3).max(15).regex(/^[а-яёa-z]+$/i, 'Only Cyrillic and Latin letters allowed')).min(1).max(20),
  gridSize: z.enum(['10x10', '11x11', '12x12', '13x13', '14x14', '15x15', '16x16', '17x17', '18x18', '19x19', '20x20', '21x21', '22x22', '23x23', '24x24', '25x25']),
  directions: z.object({
    right: z.boolean(),
    left: z.boolean(),
    up: z.boolean(),
    down: z.boolean(),
  }).refine(dirs => Object.values(dirs).some(Boolean), {
    message: 'At least one direction must be selected'
  }),
  textCase: z.enum(['upper', 'lower', 'mixed']),
  fontSize: z.enum(['super-huge', 'huge', 'extra-large', 'large', 'medium']),
  allowIntersections: z.boolean()
})

interface ValidationResult {
  success: boolean
  error?: string
  data?: FilwordParams
}

export function validateRequest(body: any): ValidationResult {
  try {
    const validated = FilwordParamsSchema.parse(body)
    
    // Дополнительная проверка лимитов (обновленные лимиты)
    const gridLimits = {
      '10x10': { maxWords: 12, maxWordLength: 8 },
      '11x11': { maxWords: 15, maxWordLength: 9 },
      '12x12': { maxWords: 18, maxWordLength: 9 },
      '13x13': { maxWords: 21, maxWordLength: 10 },
      '14x14': { maxWords: 25, maxWordLength: 10 },
      '15x15': { maxWords: 30, maxWordLength: 11 },
      '16x16': { maxWords: 35, maxWordLength: 11 },
      '17x17': { maxWords: 40, maxWordLength: 12 },
      '18x18': { maxWords: 45, maxWordLength: 12 },
      '19x19': { maxWords: 50, maxWordLength: 13 },
      '20x20': { maxWords: 55, maxWordLength: 13 },
      '21x21': { maxWords: 60, maxWordLength: 14 },
      '22x22': { maxWords: 65, maxWordLength: 14 },
      '23x23': { maxWords: 70, maxWordLength: 15 },
      '24x24': { maxWords: 75, maxWordLength: 15 },
      '25x25': { maxWords: 80, maxWordLength: 16 }
    }
    
    const limits = gridLimits[validated.gridSize]
    
    if (validated.words.length > limits.maxWords) {
      return {
        success: false,
        error: `Too many words for grid ${validated.gridSize}. Maximum: ${limits.maxWords}`
      }
    }
    
    const tooLongWords = validated.words.filter(word => word.length > limits.maxWordLength)
    if (tooLongWords.length > 0) {
      return {
        success: false,
        error: `Words too long for grid ${validated.gridSize}: ${tooLongWords.join(', ')}. Maximum length: ${limits.maxWordLength}`
      }
    }
    
    // Проверка дублей
    const uniqueWords = new Set(validated.words.map(w => w.toLowerCase()))
    if (uniqueWords.size < validated.words.length) {
      return {
        success: false,
        error: 'Duplicate words found'
      }
    }
    
    return {
      success: true,
      data: validated
    }
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return {
        success: false,
        error: `Validation error: ${firstError.path.join('.')} - ${firstError.message}`
      }
    }
    
    return {
      success: false,
      error: 'Unknown validation error'
    }
  }
}

// Схема для параметров reading-text
const ReadingTextParamsSchema = z.object({
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
    ]),
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
    ])).min(1).max(12)
  ]),
  inputText: z.string()
    .min(10, 'Text must be at least 10 characters')
    .max(2000, 'Text must be no more than 2000 characters')
    .refine(text => /[а-яё]/i.test(text), 'Text must contain Cyrillic characters'),
  fontSize: z.enum(['super-huge', 'huge', 'extra-large', 'large', 'medium']),
  fontFamily: z.enum(['serif', 'sans-serif', 'mono', 'cursive', 'propisi']),
  textCase: z.enum(['upper', 'lower', 'mixed']),

  // Опциональные параметры
  cutPercentage: z.number().min(20).max(70).optional(),
  endingLength: z.number().min(1).max(3).optional(),
  reversedWordCount: z.number().min(1).max(10).optional(),
  extraLetterDensity: z.number().min(10).max(50).optional(),

  // Форматирование
  hasTitle: z.boolean().optional(),
  title: z.string().max(100).optional(),
  centerTitle: z.boolean().optional(),
  pageNumbers: z.boolean().optional(),
  includeInstructions: z.boolean().optional(),
  customInstructions: z.string().max(500).optional()
})

interface ReadingTextValidationResult {
  success: boolean
  error?: string
  data?: ReadingTextParams
}

export function validateReadingTextRequest(body: any): ReadingTextValidationResult {
  try {
    const validated = ReadingTextParamsSchema.parse(body)

    // Дополнительные проверки
    const wordCount = validated.inputText.trim().split(/\s+/).filter(w => w.length > 0).length

    if (wordCount < 3) {
      return {
        success: false,
        error: 'Text must contain at least 3 words'
      }
    }

    if (wordCount > 200) {
      return {
        success: false,
        error: 'Text is too long (max 200 words)'
      }
    }

    // Проверки для специфичных типов
    if (validated.textType === 'partial-reversed' && validated.reversedWordCount) {
      if (validated.reversedWordCount > wordCount) {
        return {
          success: false,
          error: 'Cannot reverse more words than available in text'
        }
      }
    }

    if (validated.textType === 'word-ladder' && wordCount > 20) {
      return {
        success: false,
        error: 'Word ladder works best with 20 words or fewer'
      }
    }

    return {
      success: true,
      data: validated
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return {
        success: false,
        error: `Validation error: ${firstError.path.join('.')} - ${firstError.message}`
      }
    }

    return {
      success: false,
      error: 'Unknown validation error'
    }
  }
}

// Схема для параметров crossword
const CrosswordParamsSchema = z.object({
  words: z.array(z.object({
    word: z.string().min(3).max(15),
    clue: z.string().min(5).max(200),
    answer: z.string().min(3).max(15),
    length: z.number().min(3).max(15)
  })).min(3).max(30),
  gridSize: z.enum(['11x11', '13x13', '15x15', '17x17', '19x19', '21x21']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  style: z.enum(['classic', 'american', 'scandinavian']),
  fontSize: z.enum(['super-huge', 'huge', 'extra-large', 'large', 'medium']),
  includeAnswers: z.boolean(),
  showNumbers: z.boolean(),
  blackSquareRatio: z.number().min(0.1).max(0.5)
})

interface CrosswordValidationResult {
  success: boolean
  error?: string
  data?: CrosswordParams
}

export function validateCrosswordRequest(body: any): CrosswordValidationResult {
  try {
    const validated = CrosswordParamsSchema.parse(body)

    // Дополнительные проверки
    for (const wordObj of validated.words) {
      if (wordObj.word !== wordObj.answer) {
        return {
          success: false,
          error: `Word and answer must match for: ${wordObj.word}`
        }
      }

      if (wordObj.word.length !== wordObj.length) {
        return {
          success: false,
          error: `Word length mismatch for: ${wordObj.word}`
        }
      }
    }

    // Проверка на дубли
    const words = validated.words.map(w => w.word.toLowerCase())
    const uniqueWords = new Set(words)
    if (uniqueWords.size < words.length) {
      return {
        success: false,
        error: 'Duplicate words found in crossword'
      }
    }

    return {
      success: true,
      data: validated
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return {
        success: false,
        error: `Validation error: ${firstError.path.join('.')} - ${firstError.message}`
      }
    }

    return {
      success: false,
      error: 'Unknown crossword validation error'
    }
  }
}