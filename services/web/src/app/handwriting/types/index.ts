import { z } from 'zod'

// Типы строк для прописей
export type LineType = 'narrow-with-diagonal' | 'narrow-simple' | 'regular'

// Размеры шрифта
export type FontSize = 'medium' | 'large'

// Стиль текста
export type TextStyle = 'solid-gray' | 'dashed-gray'

// Параметры для генерации прописей
export interface HandwritingParams {
  inputText: string
  title?: string
  centerTitle?: boolean
  lineType: LineType
  fontSize: FontSize
  textStyle: TextStyle
  preserveParagraphs?: boolean
  includeInstructions?: boolean
}

// Данные для шаблона прописей
export interface HandwritingTemplateData {
  title: string
  inputText: string
  lineType: LineType
  fontSize: FontSize
  textStyle: TextStyle
  centerTitle: boolean
  preserveParagraphs: boolean
  includeInstructions: boolean
  instructions?: string
  metadata: {
    wordCount: number
    characterCount: number
    estimatedTime: number
  }
}

// Zod схема для валидации
export const handwritingParamsSchema = z.object({
  inputText: z.string().min(1, 'Текст не может быть пустым').max(3000, 'Текст слишком длинный (максимум 3000 символов)'),
  title: z.string().optional(),
  centerTitle: z.boolean().optional().default(true),
  lineType: z.enum(['narrow-with-diagonal', 'narrow-simple', 'regular']),
  fontSize: z.enum(['medium', 'large']),
  textStyle: z.enum(['solid-gray', 'dashed-gray']),
  preserveParagraphs: z.boolean().optional().default(true),
  includeInstructions: z.boolean().optional().default(true)
})

// Константы
export const LINE_TYPE_DESCRIPTIONS = {
  'narrow-with-diagonal': {
    name: 'Узкая строка с косой линией',
    description: 'Классические прописи с косыми направляющими'
  },
  'narrow-simple': {
    name: 'Узкая строка без косой линии',
    description: 'Упрощенные прописи без косых направляющих'
  },
  'regular': {
    name: 'Обычная строка',
    description: 'Стандартная линейка для письма'
  }
} as const

export const FONT_SIZE_DESCRIPTIONS = {
  'medium': {
    name: 'Средний',
    description: 'Стандартный размер для обучения письму'
  },
  'large': {
    name: 'Крупный',
    description: 'Увеличенный размер для начинающих'
  }
} as const

export const TEXT_STYLE_DESCRIPTIONS = {
  'solid-gray': {
    name: 'Сплошная серая линия',
    description: 'Непрерывный серый текст для обводки'
  },
  'dashed-gray': {
    name: 'Пунктирная серая линия',
    description: 'Мелко пунктирный серый текст для обводки'
  }
} as const