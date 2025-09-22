export type GridSize = '10x10' | '11x11' | '12x12' | '13x13' | '14x14' | '15x15' | '16x16' | '17x17' | '18x18' | '19x19' | '20x20' | '21x21' | '22x22' | '23x23' | '24x24' | '25x25'
export type TextCase = 'upper' | 'lower' | 'mixed'
export type FontSize = 'large' | 'medium' | 'small' | 'cursive'

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
  allowIntersections: boolean
}

// Предустановленные категории слов для MVP
export const PRESET_CATEGORIES: Record<string, { name: string; words: string[] }> = {
  animals: {
    name: 'Животные',
    words: [
      'кот', 'собака', 'корова', 'лошадь', 'свинья', 'коза', 'овца', 
      'курица', 'петух', 'утка', 'кролик', 'хомяк', 'медведь', 'волк', 
      'лиса', 'заяц', 'белка', 'ёжик'
    ]
  },
  colors: {
    name: 'Цвета',
    words: [
      'красный', 'синий', 'жёлтый', 'зелёный', 'белый', 'чёрный', 
      'серый', 'розовый', 'голубой', 'бурый', 'алый', 'рыжий'
    ]
  },
  school: {
    name: 'Школа',
    words: [
      'урок', 'класс', 'доска', 'парта', 'ручка', 'тетрадь', 'книга', 
      'учитель', 'ученик', 'звонок', 'перемена', 'домашнее', 'отметка'
    ]
  },
  family: {
    name: 'Семья',
    words: [
      'мама', 'папа', 'сын', 'дочь', 'дедушка', 'бабушка', 'брат', 
      'сестра', 'тётя', 'дядя', 'семья', 'дом', 'любовь'
    ]
  },
  food: {
    name: 'Еда',
    words: [
      'хлеб', 'молоко', 'каша', 'суп', 'мясо', 'рыба', 'овощи', 
      'фрукты', 'яблоко', 'банан', 'морковь', 'картошка', 'помидор'
    ]
  }
}

// Лимиты для разных размеров сетки (динамические)
export const GRID_SIZE_LIMITS: Record<GridSize, { maxWords: number; maxWordLength: number }> = {
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

// Настройки размеров шрифтов для оптимального восприятия
export const FONT_SIZE_SETTINGS: Record<FontSize, {
  name: string
  description: string
  cellSizeMultiplier: number
  baseFontSize: number
  borderWidth: number
}> = {
  'large': {
    name: 'Крупный',
    description: 'Для начального обучения и проблем со зрением',
    cellSizeMultiplier: 1.3,
    baseFontSize: 18,
    borderWidth: 2
  },
  'medium': {
    name: 'Средний',
    description: 'Стандартный размер для школьников',
    cellSizeMultiplier: 1.0,
    baseFontSize: 14,
    borderWidth: 1.5
  },
  'small': {
    name: 'Мелкий',
    description: 'Компактный размер для старших классов',
    cellSizeMultiplier: 0.8,
    baseFontSize: 12,
    borderWidth: 1
  },
  'cursive': {
    name: 'Письменный',
    description: 'Для обучения письму и иностранным языкам',
    cellSizeMultiplier: 1.1,
    baseFontSize: 16,
    borderWidth: 1.5
  }
}