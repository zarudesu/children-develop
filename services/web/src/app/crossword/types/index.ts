import { z } from 'zod'

// Базовые типы для кроссвордов
export interface CrosswordWord {
  word: string
  clue: string
  answer: string
  length: number
}

export type GridSize = '9x9' | '11x11' | '13x13' | '15x15' | '17x17' | '19x19'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type CrosswordStyle = 'classic' | 'modern' | 'themed'
export type FontSize = 'small' | 'medium' | 'large'

// Параметры генерации кроссворда
export interface CrosswordParams {
  words: CrosswordWord[]
  gridSize: GridSize
  difficulty: Difficulty
  style: CrosswordStyle
  fontSize: FontSize
  includeAnswers: boolean
  showNumbers: boolean
  blackSquareRatio: number
}

// Схемы валидации Zod
export const crosswordWordSchema = z.object({
  word: z.string()
    .min(3, 'Слово должно содержать минимум 3 буквы')
    .max(15, 'Слово должно содержать максимум 15 букв')
    .regex(/^[а-яёА-ЯЁ]+$/, 'Слово должно содержать только русские буквы'),
  clue: z.string()
    .min(5, 'Определение должно содержать минимум 5 символов')
    .max(100, 'Определение должно содержать максимум 100 символов'),
  answer: z.string(),
  length: z.number()
})

export const crosswordParamsSchema = z.object({
  words: z.array(crosswordWordSchema)
    .min(5, 'Необходимо минимум 5 слов')
    .max(50, 'Максимум 50 слов'),
  gridSize: z.enum(['9x9', '11x11', '13x13', '15x15', '17x17', '19x19']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  style: z.enum(['classic', 'modern', 'themed']),
  fontSize: z.enum(['small', 'medium', 'large']),
  includeAnswers: z.boolean(),
  showNumbers: z.boolean(),
  blackSquareRatio: z.number().min(0.1).max(0.3)
})

// Константы
export const GRID_SIZES: { value: GridSize; label: string; description: string }[] = [
  { value: '9x9', label: '9×9 клеток', description: 'Компактный размер для начинающих' },
  { value: '11x11', label: '11×11 клеток', description: 'Стандартный размер для детей' },
  { value: '13x13', label: '13×13 клеток', description: 'Средний размер' },
  { value: '15x15', label: '15×15 клеток', description: 'Классический размер газетных кроссвордов' },
  { value: '17x17', label: '17×17 клеток', description: 'Большой размер для опытных' },
  { value: '19x19', label: '19×19 клеток', description: 'Максимальный размер для экспертов' }
]

export const DIFFICULTIES: { value: Difficulty; label: string; description: string }[] = [
  { value: 'easy', label: 'Легкий', description: 'Простые слова и определения' },
  { value: 'medium', label: 'Средний', description: 'Умеренная сложность' },
  { value: 'hard', label: 'Сложный', description: 'Сложные слова и хитрые определения' }
]

export const CROSSWORD_STYLES: { value: CrosswordStyle; label: string; description: string }[] = [
  { value: 'classic', label: 'Классический', description: 'Традиционный черно-белый стиль' },
  { value: 'modern', label: 'Современный', description: 'Стильный дизайн с цветными акцентами' },
  { value: 'themed', label: 'Тематический', description: 'Дизайн в соответствии с темой слов' }
]

export const FONT_SIZES: { value: FontSize; label: string; description: string }[] = [
  { value: 'small', label: 'Мелкий', description: 'Для компактной печати' },
  { value: 'medium', label: 'Средний', description: 'Оптимальный для чтения' },
  { value: 'large', label: 'Крупный', description: 'Для людей с проблемами зрения' }
]

// Предустановленные темы
export const CROSSWORD_THEMES = {
  animals: {
    name: 'Животные',
    icon: '🐾',
    words: [
      { word: 'кот', clue: 'Домашнее мурлыкающее животное', answer: 'кот', length: 3 },
      { word: 'собака', clue: 'Лучший друг человека', answer: 'собака', length: 6 },
      { word: 'корова', clue: 'Дает молоко на ферме', answer: 'корова', length: 6 },
      { word: 'лошадь', clue: 'Быстрое верховое животное', answer: 'лошадь', length: 6 },
      { word: 'медведь', clue: 'Крупный лесной хищник', answer: 'медведь', length: 7 },
      { word: 'заяц', clue: 'Длинноухий прыгун', answer: 'заяц', length: 4 },
      { word: 'волк', clue: 'Серый лесной хищник', answer: 'волк', length: 4 },
      { word: 'лиса', clue: 'Рыжая хитрая плутовка', answer: 'лиса', length: 4 }
    ]
  },
  school: {
    name: 'Школа',
    icon: '📚',
    words: [
      { word: 'урок', clue: 'Школьное занятие', answer: 'урок', length: 4 },
      { word: 'учитель', clue: 'Преподаватель в школе', answer: 'учитель', length: 7 },
      { word: 'книга', clue: 'Источник знаний с страницами', answer: 'книга', length: 5 },
      { word: 'тетрадь', clue: 'Для записей и домашних заданий', answer: 'тетрадь', length: 7 },
      { word: 'ручка', clue: 'Пишущий инструмент', answer: 'ручка', length: 5 },
      { word: 'доска', clue: 'На ней пишут мелом', answer: 'доска', length: 5 },
      { word: 'класс', clue: 'Школьная комната для уроков', answer: 'класс', length: 5 },
      { word: 'парта', clue: 'Школьный стол для учеников', answer: 'парта', length: 5 }
    ]
  }
} as const
