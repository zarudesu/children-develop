// Типы для генератора кроссвордов

export type CrosswordSize = '11x11' | '13x13' | '15x15' | '17x17' | '19x19' | '21x21'
export type CrosswordDifficulty = 'easy' | 'medium' | 'hard'
export type CrosswordStyle = 'classic' | 'american' | 'scandinavian'

export interface CrosswordWord {
  word: string
  clue: string
  answer: string
  length: number
}

export interface CrosswordCell {
  letter: string
  isBlack: boolean
  number?: number
  isPartOfWord: boolean
  wordIds: number[] // ID слов, которые проходят через эту клетку
}

export interface PlacedCrosswordWord {
  id: number
  word: string
  clue: string
  startRow: number
  startCol: number
  direction: 'horizontal' | 'vertical'
  length: number
  number: number // Номер для определений
}

export interface CrosswordGrid {
  grid: CrosswordCell[][]
  size: number
  placedWords: PlacedCrosswordWord[]
  clues: {
    horizontal: Array<{number: number, clue: string, length: number}>
    vertical: Array<{number: number, clue: string, length: number}>
  }
}

export interface CrosswordParams {
  words: CrosswordWord[]
  gridSize: CrosswordSize
  difficulty: CrosswordDifficulty
  style: CrosswordStyle
  fontSize: 'large' | 'medium' | 'small'
  includeAnswers: boolean
  showNumbers: boolean
  blackSquareRatio: number // Процент чёрных клеток (5-15%)
}

// Константы размеров сеток для кроссвордов
export const CROSSWORD_GRID_SIZES: Record<CrosswordSize, number> = {
  '11x11': 11,
  '13x13': 13,
  '15x15': 15,
  '17x17': 17,
  '19x19': 19,
  '21x21': 21
}

// Настройки сложности
export const CROSSWORD_DIFFICULTY_SETTINGS = {
  easy: {
    name: 'Лёгкий',
    description: 'Простые слова, много пересечений',
    minWordLength: 3,
    maxWordLength: 8,
    blackSquareRatio: 0.15,
    maxWords: 30
  },
  medium: {
    name: 'Средний',
    description: 'Умеренная сложность',
    minWordLength: 4,
    maxWordLength: 12,
    blackSquareRatio: 0.12,
    maxWords: 50
  },
  hard: {
    name: 'Сложный',
    description: 'Длинные слова, мало пересечений',
    minWordLength: 5,
    maxWordLength: 15,
    blackSquareRatio: 0.08,
    maxWords: 70
  }
} as const

// Стили кроссвордов
export const CROSSWORD_STYLES = {
  classic: {
    name: 'Классический',
    description: 'Симметричный, много пересечений',
    symmetry: true,
    minIntersections: 2
  },
  american: {
    name: 'Американский',
    description: 'Поворотная симметрия, крупная сетка',
    symmetry: true,
    minIntersections: 3
  },
  scandinavian: {
    name: 'Скандинавский',
    description: 'Свободная форма, меньше ограничений',
    symmetry: false,
    minIntersections: 1
  }
} as const

// Пресеты слов для кроссвордов с определениями
export const CROSSWORD_PRESET_CATEGORIES = {
  school: {
    name: 'Школа',
    words: [
      { word: 'парта', clue: 'Школьная мебель для ученика', answer: 'парта', length: 5 },
      { word: 'урок', clue: 'Учебное занятие', answer: 'урок', length: 4 },
      { word: 'доска', clue: 'На ней пишут мелом', answer: 'доска', length: 5 },
      { word: 'мел', clue: 'Белая палочка для письма', answer: 'мел', length: 3 },
      { word: 'книга', clue: 'Источник знаний', answer: 'книга', length: 5 },
      { word: 'тетрадь', clue: 'В неё записывают домашние задания', answer: 'тетрадь', length: 7 },
      { word: 'ручка', clue: 'Пишущий инструмент', answer: 'ручка', length: 5 },
      { word: 'карандаш', clue: 'Деревянный помощник художника', answer: 'карандаш', length: 8 },
    ]
  },
  animals: {
    name: 'Животные',
    words: [
      { word: 'кот', clue: 'Домашний мурлыка', answer: 'кот', length: 3 },
      { word: 'собака', clue: 'Друг человека', answer: 'собака', length: 6 },
      { word: 'корова', clue: 'Даёт молоко', answer: 'корова', length: 6 },
      { word: 'лошадь', clue: 'Быстроногий скакун', answer: 'лошадь', length: 6 },
      { word: 'медведь', clue: 'Косолапый житель леса', answer: 'медведь', length: 7 },
      { word: 'заяц', clue: 'Длинноухий трусишка', answer: 'заяц', length: 4 },
      { word: 'лиса', clue: 'Рыжая плутовка', answer: 'лиса', length: 4 },
      { word: 'волк', clue: 'Серый хищник', answer: 'волк', length: 4 },
    ]
  },
  nature: {
    name: 'Природа',
    words: [
      { word: 'дерево', clue: 'Зелёный великан', answer: 'дерево', length: 6 },
      { word: 'цветок', clue: 'Красивое растение', answer: 'цветок', length: 6 },
      { word: 'река', clue: 'Водный поток', answer: 'река', length: 4 },
      { word: 'море', clue: 'Большая вода', answer: 'море', length: 4 },
      { word: 'солнце', clue: 'Светило дня', answer: 'солнце', length: 6 },
      { word: 'луна', clue: 'Спутник Земли', answer: 'луна', length: 4 },
      { word: 'звезда', clue: 'Ночной огонёк', answer: 'звезда', length: 6 },
      { word: 'облако', clue: 'Белая вата в небе', answer: 'облако', length: 6 },
    ]
  }
} as const

export type CrosswordPresetCategory = keyof typeof CROSSWORD_PRESET_CATEGORIES