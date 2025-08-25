export type GridSize = '10x10' | '14x14' | '18x18' | '24x24'
export type TextCase = 'upper' | 'lower' | 'mixed'
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
  isAnswerPage: boolean
  placedWords: PlacedWord[]
}

// Размеры сеток
export const GRID_SIZES: Record<GridSize, number> = {
  '10x10': 10,
  '14x14': 14,
  '18x18': 18,
  '24x24': 24
}

// Направления как векторы
export const DIRECTION_VECTORS: Record<Direction, [number, number]> = {
  right: [0, 1],
  left: [0, -1],
  down: [1, 0],
  up: [-1, 0]
}