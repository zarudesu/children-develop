import { z } from 'zod'
import { FilwordParams } from '../types'

const FilwordParamsSchema = z.object({
  words: z.array(z.string().min(3).max(15).regex(/^[а-яё]+$/i, 'Only Cyrillic letters allowed')).min(1).max(20),
  gridSize: z.enum(['10x10', '14x14', '18x18', '24x24']),
  directions: z.object({
    right: z.boolean(),
    left: z.boolean(),
    up: z.boolean(),
    down: z.boolean(),
  }).refine(dirs => Object.values(dirs).some(Boolean), {
    message: 'At least one direction must be selected'
  }),
  textCase: z.enum(['upper', 'lower', 'mixed'])
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
      '10x10': { maxWords: 15, maxWordLength: 8 },   // 100 ячеек -> до 15 слов
      '14x14': { maxWords: 25, maxWordLength: 10 },  // 196 ячеек -> до 25 слов
      '18x18': { maxWords: 35, maxWordLength: 12 },  // 324 ячейки -> до 35 слов
      '24x24': { maxWords: 50, maxWordLength: 15 }   // 576 ячеек -> до 50 слов
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