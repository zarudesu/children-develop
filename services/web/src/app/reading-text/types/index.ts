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

export type FontSize = 'large' | 'medium' | 'small'
export type TextCase = 'upper' | 'lower' | 'mixed'

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

  // Форматирование
  hasTitle?: boolean
  title?: string
  centerTitle?: boolean
  pageNumbers?: boolean

  // Инструкции
  includeInstructions?: boolean
  customInstructions?: string
}

// Результат обработки текста
export interface ProcessedText {
  original: string
  transformed: string
  metadata: {
    type: ReadingTextType
    wordsCount: number
    charactersCount: number
    transformationDetails?: Record<string, any>
  }
}

// Настройки для разных типов шрифтов
export const FONT_SIZE_SETTINGS: Record<FontSize, {
  name: string
  description: string
  baseFontSize: number
  lineHeight: number
}> = {
  'large': {
    name: 'Крупный',
    description: 'Для начального обучения и проблем со зрением',
    baseFontSize: 14,
    lineHeight: 1.8
  },
  'medium': {
    name: 'Средний',
    description: 'Стандартный размер для школьников',
    baseFontSize: 12,
    lineHeight: 1.6
  },
  'small': {
    name: 'Обычный',
    description: 'Как в учебниках',
    baseFontSize: 11,
    lineHeight: 1.4
  }
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

// Константы для алгоритмов
export const CYRILLIC_VOWELS = ['а', 'е', 'ё', 'и', 'о', 'у', 'ы', 'э', 'ю', 'я']
export const CYRILLIC_CONSONANTS = [
  'б', 'в', 'г', 'д', 'ж', 'з', 'й', 'к', 'л', 'м', 'н', 'п', 'р', 'с', 'т', 'ф', 'х', 'ц', 'ч', 'ш', 'щ'
]

// Случайные буквы для вставки в extra-letters
export const RANDOM_CYRILLIC_LETTERS = [
  ...CYRILLIC_VOWELS,
  ...CYRILLIC_CONSONANTS
]