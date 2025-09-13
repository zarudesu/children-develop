export type GridSize = '10x10' | '11x11' | '12x12' | '13x13' | '14x14' | '15x15' | '16x16' | '17x17' | '18x18' | '19x19' | '20x20' | '21x21' | '22x22' | '23x23' | '24x24' | '25x25'
export type TextCase = 'upper' | 'lower' | 'mixed'
export type FontSize = 'large' | 'medium' | 'small' | 'cursive'
export type Direction = 'right' | 'left' | 'up' | 'down'

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

export interface TemplateData {
  title: string
  words: string[]
  grid: GridCell[][]
  gridSize: number
  fontSize: FontSize
  isAnswerPage: boolean
  placedWords: PlacedWord[]
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