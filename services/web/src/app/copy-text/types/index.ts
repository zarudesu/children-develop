// Типы для генератора списывания текста по образцу

export type CopyTextStyle = 'printed' | 'handwritten'
export type FontSize = 'medium' | 'large' | 'extra-large'
export type LineSpacing = '1.25' | '1.5' | '1.75'

export interface CopyTextParams {
  inputText: string
  style: CopyTextStyle
  fontSize: FontSize
  lineSpacing: LineSpacing
  centerTitle: boolean
  preserveParagraphs: boolean
  allowWordBreaks: boolean
  includeExerciseInstructions: boolean
  title?: string
}

// Описания стилей
export const COPY_TEXT_STYLES: Record<CopyTextStyle, {
  name: string
  description: string
  purpose: string
}> = {
  printed: {
    name: 'С печатного текста',
    description: 'Текст представлен печатными буквами для переписывания от руки',
    purpose: 'Развитие навыков списывания с печатного образца'
  },
  handwritten: {
    name: 'С письменного текста',
    description: 'Текст представлен письменными буквами для переписывания',
    purpose: 'Развитие навыков копирования рукописного текста'
  }
}

// Настройки размеров шрифтов
export const FONT_SIZE_SETTINGS: Record<FontSize, {
  name: string
  cssSize: string
  description: string
}> = {
  medium: {
    name: 'Средний (12pt)',
    cssSize: '12pt',
    description: 'Базовый размер для младших школьников'
  },
  large: {
    name: 'Крупный (14pt)',
    cssSize: '14pt',
    description: 'Увеличенный размер для лучшей читаемости'
  },
  'extra-large': {
    name: 'Очень крупный (16pt)',
    cssSize: '16pt',
    description: 'Максимальный размер для начинающих'
  }
}

// Настройки межстрочного интервала
export const LINE_SPACING_SETTINGS: Record<LineSpacing, {
  name: string
  cssValue: string
  description: string
}> = {
  '1.25': {
    name: 'Стандартный (1.25)',
    cssValue: '1.25',
    description: 'Базовый интервал'
  },
  '1.5': {
    name: 'Увеличенный (1.5)',
    cssValue: '1.5',
    description: 'Больше места между строками'
  },
  '1.75': {
    name: 'Широкий (1.75)',
    cssValue: '1.75',
    description: 'Максимальный интервал'
  }
}

// Валидация параметров с помощью Zod
import { z } from 'zod'

export const CopyTextParamsSchema = z.object({
  inputText: z.string().min(1, 'Введите текст для списывания').max(2000, 'Текст слишком длинный (максимум 2000 символов)'),
  style: z.enum(['printed', 'handwritten']),
  fontSize: z.enum(['medium', 'large', 'extra-large']),
  lineSpacing: z.enum(['1.25', '1.5', '1.75']),
  centerTitle: z.boolean().default(true),
  preserveParagraphs: z.boolean().default(true),
  allowWordBreaks: z.boolean().default(false),
  includeExerciseInstructions: z.boolean().default(true),
  title: z.string().optional()
})

export type CopyTextParamsInput = z.input<typeof CopyTextParamsSchema>
export type CopyTextParamsOutput = z.output<typeof CopyTextParamsSchema>

// Результат генерации
export interface CopyTextResult {
  success: boolean
  pdfBuffer?: Buffer
  error?: string
  metadata?: {
    wordCount: number
    characterCount: number
    lineCount: number
    estimatedTime: number // минут
  }
}