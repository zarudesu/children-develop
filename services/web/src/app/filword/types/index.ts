export type GridSize = '10x10' | '14x14' | '18x18' | '24x24'
export type TextCase = 'upper' | 'lower' | 'mixed'

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

// Лимиты для разных размеров сетки (более реалистичные)
export const GRID_SIZE_LIMITS: Record<GridSize, { maxWords: number; maxWordLength: number }> = {
  '10x10': { maxWords: 12, maxWordLength: 8 },   // 100 ячеек -> до 12 слов (учитываем сложность пересечений)
  '14x14': { maxWords: 20, maxWordLength: 10 },  // 196 ячеек -> до 20 слов  
  '18x18': { maxWords: 30, maxWordLength: 12 },  // 324 ячейки -> до 30 слов
  '24x24': { maxWords: 45, maxWordLength: 15 }   // 576 ячеек -> до 45 слов
}