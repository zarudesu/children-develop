export type GridSize = '10x10' | '11x11' | '12x12' | '13x13' | '14x14' | '15x15' | '16x16' | '17x17' | '18x18' | '19x19' | '20x20' | '21x21' | '22x22' | '23x23' | '24x24' | '25x25'
export type TextCase = 'upper' | 'lower' | 'mixed'
export type FontSize = 'large' | 'medium' | 'small' | 'cursive'
export type Direction = 'right' | 'left' | 'up' | 'down'

// Типы для конструктора текстов
export type ReadingTextType =
  | 'normal'              // 1. Обычный текст
  | 'bottom-cut'          // 2. Текст не дописанный снизу
  | 'top-cut'             // 3. Текст не дописанный сверху
  | 'missing-endings'     // 4. Текст без окончаний (1-2 буквы)
  | 'missing-vowels'      // 5. Текст с пропущенными гласными
  | 'partial-reversed'    // 6. Текст с частично перевернутыми словами
  | 'scrambled-words'     // 7. Текст с буквами в хаотичном порядке
  | 'merged-text'         // 8. Слитный текст
  | 'extra-letters'       // 9. Текст с дополнительными буквами
  | 'mirror-text'         // 10. Зеркальный текст
  | 'mixed-types'         // 11. Смешанный тип ("сборная солянка")
  | 'word-ladder'         // 12. Лесенка из слов

export type GeneratorType = 'filword' | 'reading-text'

export interface FilwordParams {
  words: string[]
  gridSize: GridSize
  directions: {
    right: boolean
    left: boolean
    up: boolean
    down: boolean
  }
  textCase: TextCase
  fontSize: FontSize
}

export interface GridCell {
  letter: string
  isPartOfWord: boolean
  wordId?: number
}

export interface PlacedWord {
  word: string
  startRow: number
  startCol: number
  direction: Direction
  id: number
}

export interface FilwordGrid {
  grid: GridCell[][]
  placedWords: PlacedWord[]
  size: number
}

export interface ReadingTextParams {
  // Основные параметры
  textType: ReadingTextType
  inputText: string
  fontSize: FontSize
  textCase: TextCase

  // Настройки для конкретных типов
  cutPercentage?: number      // для bottom-cut, top-cut (30-70%)
  endingLength?: number       // для missing-endings (1-2 буквы)
  reversedWordCount?: number  // для partial-reversed (сколько слов перевернуть)
  extraLetterDensity?: number // для extra-letters (плотность лишних букв)
  keepFirstLast?: boolean     // для scrambled-words (сохранять ли первую и последнюю буквы)
  mixedMode?: 'sentence' | 'word'  // для mixed-types (режим смешивания)

  // Форматирование
  hasTitle?: boolean
  title?: string
  centerTitle?: boolean
  pageNumbers?: boolean

  // Инструкции
  includeInstructions?: boolean
  customInstructions?: string
}

export interface GenerateRequest {
  type: GeneratorType
  params: FilwordParams | ReadingTextParams
}

export interface TemplateData {
  title: string
  words: string[]
  grid: GridCell[][]
  gridSize: number
  fontSize: FontSize
  isAnswerPage: boolean
  placedWords: PlacedWord[]
}

export interface ReadingTextTemplateData {
  type: ReadingTextType
  title?: string
  centerTitle: boolean
  originalText: string
  transformedText: string
  fontSize: FontSize
  pageNumbers: boolean
  includeInstructions: boolean
  instructions?: string
  metadata: {
    wordsCount: number
    charactersCount: number
    difficulty: 'easy' | 'medium' | 'hard'
  }
}

// Размеры сеток
export const GRID_SIZES: Record<GridSize, number> = {
  '10x10': 10,
  '11x11': 11,
  '12x12': 12,
  '13x13': 13,
  '14x14': 14,
  '15x15': 15,
  '16x16': 16,
  '17x17': 17,
  '18x18': 18,
  '19x19': 19,
  '20x20': 20,
  '21x21': 21,
  '22x22': 22,
  '23x23': 23,
  '24x24': 24,
  '25x25': 25
}

// Направления как векторы
export const DIRECTION_VECTORS: Record<Direction, [number, number]> = {
  right: [0, 1],
  left: [0, -1],
  down: [1, 0],
  up: [-1, 0]
}

// Описания типов заданий
export const TEXT_TYPE_DESCRIPTIONS: Record<ReadingTextType, {
  name: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  purpose: string
}> = {
  'normal': {
    name: 'Обычный текст',
    description: 'Стандартный текст без модификаций',
    difficulty: 'easy',
    purpose: 'Базовое чтение'
  },
  'bottom-cut': {
    name: 'Текст без нижней части',
    description: 'Нижняя часть букв обрезана',
    difficulty: 'easy',
    purpose: 'Развитие зрительного восприятия'
  },
  'top-cut': {
    name: 'Текст без верхней части',
    description: 'Верхняя часть букв обрезана',
    difficulty: 'easy',
    purpose: 'Развитие зрительного восприятия'
  },
  'missing-endings': {
    name: 'Без окончаний',
    description: 'В словах отсутствуют последние 1-2 буквы',
    difficulty: 'medium',
    purpose: 'Развитие прогнозирования и догадки'
  },
  'missing-vowels': {
    name: 'Без гласных',
    description: 'Гласные буквы заменены черточками',
    difficulty: 'medium',
    purpose: 'Развитие анализа и синтеза'
  },
  'partial-reversed': {
    name: 'Частично перевернутые слова',
    description: 'Некоторые слова написаны справа налево',
    difficulty: 'medium',
    purpose: 'Развитие внимания и гибкости чтения'
  },
  'scrambled-words': {
    name: 'Анаграммы',
    description: 'Буквы в словах перемешаны',
    difficulty: 'hard',
    purpose: 'Развитие анализа и синтеза слов'
  },
  'merged-text': {
    name: 'Слитный текст',
    description: 'Текст написан без пробелов между словами',
    difficulty: 'medium',
    purpose: 'Развитие сегментации и понимания границ слов'
  },
  'extra-letters': {
    name: 'С лишними буквами',
    description: 'Между основными буквами вставлены случайные',
    difficulty: 'hard',
    purpose: 'Развитие избирательного внимания'
  },
  'mirror-text': {
    name: 'Зеркальный текст',
    description: 'Весь текст написан справа налево',
    difficulty: 'hard',
    purpose: 'Развитие пространственного мышления'
  },
  'mixed-types': {
    name: 'Смешанный тип',
    description: 'Комбинация разных типов в одном тексте',
    difficulty: 'hard',
    purpose: 'Развитие переключения внимания'
  },
  'word-ladder': {
    name: 'Лесенка слов',
    description: 'Нарастающие фразы по принципу лесенки',
    difficulty: 'easy',
    purpose: 'Развитие плавности чтения'
  }
}