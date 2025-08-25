import { FilwordParams, FilwordGrid, GridCell, PlacedWord, Direction, GRID_SIZES, DIRECTION_VECTORS } from '../types'

export class FilwordEngine {
  private grid: GridCell[][]
  private size: number
  private placedWords: PlacedWord[] = []
  private availableDirections: Direction[] = []

  constructor(gridSize: FilwordParams['gridSize']) {
    this.size = GRID_SIZES[gridSize]
    this.grid = this.initializeGrid()
  }

  private initializeGrid(): GridCell[][] {
    return Array(this.size).fill(null).map(() =>
      Array(this.size).fill(null).map(() => ({
        letter: '',
        isPartOfWord: false
      }))
    )
  }

  private getAvailableDirections(directions: FilwordParams['directions']): Direction[] {
    const available: Direction[] = []
    if (directions.right) available.push('right')
    if (directions.left) available.push('left')
    if (directions.up) available.push('up')
    if (directions.down) available.push('down')
    return available
  }

  private canPlaceWord(word: string, row: number, col: number, direction: Direction): boolean {
    const [deltaRow, deltaCol] = DIRECTION_VECTORS[direction]
    
    // Проверка границ
    const endRow = row + (deltaRow * (word.length - 1))
    const endCol = col + (deltaCol * (word.length - 1))
    
    if (endRow < 0 || endRow >= this.size || endCol < 0 || endCol >= this.size) {
      return false
    }

    // Проверка пересечений
    for (let i = 0; i < word.length; i++) {
      const currentRow = row + (deltaRow * i)
      const currentCol = col + (deltaCol * i)
      const cell = this.grid[currentRow][currentCol]
      
      // Если клетка занята, но буква не совпадает - нельзя размещать
      if (cell.isPartOfWord && cell.letter !== word[i].toUpperCase()) {
        return false
      }
    }

    // Проверка, что слово не "прилипает" к другим словам
    return this.checkWordIsolation(word, row, col, direction)
  }

  private checkWordIsolation(word: string, row: number, col: number, direction: Direction): boolean {
    const [deltaRow, deltaCol] = DIRECTION_VECTORS[direction]
    
    // Проверяем клетки перед и после слова
    const beforeRow = row - deltaRow
    const beforeCol = col - deltaCol
    const afterRow = row + (deltaRow * word.length)
    const afterCol = col + (deltaCol * word.length)
    
    // Клетка перед словом должна быть свободной
    if (this.isValidPosition(beforeRow, beforeCol) && this.grid[beforeRow][beforeCol].isPartOfWord) {
      return false
    }
    
    // Клетка после слова должна быть свободной  
    if (this.isValidPosition(afterRow, afterCol) && this.grid[afterRow][afterCol].isPartOfWord) {
      return false
    }
    
    return true
  }

  private isValidPosition(row: number, col: number): boolean {
    return row >= 0 && row < this.size && col >= 0 && col < this.size
  }

  private placeWord(word: string, row: number, col: number, direction: Direction, id: number): void {
    const [deltaRow, deltaCol] = DIRECTION_VECTORS[direction]
    
    for (let i = 0; i < word.length; i++) {
      const currentRow = row + (deltaRow * i)
      const currentCol = col + (deltaCol * i)
      
      this.grid[currentRow][currentCol] = {
        letter: word[i].toUpperCase(),
        isPartOfWord: true,
        wordId: id
      }
    }
    
    this.placedWords.push({
      word: word.toLowerCase(),
      startRow: row,
      startCol: col,
      direction,
      id
    })
  }

  private findPlacementPositions(word: string): Array<{row: number, col: number, direction: Direction}> {
    const positions: Array<{row: number, col: number, direction: Direction}> = []
    
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        for (const direction of this.availableDirections) {
          if (this.canPlaceWord(word, row, col, direction)) {
            positions.push({ row, col, direction })
          }
        }
      }
    }
    
    // Перемешиваем позиции для случайного размещения
    return this.shuffleArray(positions)
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  private fillEmptyCells(): void {
    const russianLetters = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯ'
    
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (!this.grid[row][col].isPartOfWord) {
          const randomLetter = russianLetters[Math.floor(Math.random() * russianLetters.length)]
          this.grid[row][col] = {
            letter: randomLetter,
            isPartOfWord: false
          }
        }
      }
    }
  }

  public generateGrid(words: string[], directions: FilwordParams['directions']): FilwordGrid {
    this.availableDirections = this.getAvailableDirections(directions)
    
    if (this.availableDirections.length === 0) {
      throw new Error('No directions specified')
    }

    // Сортируем слова по длине (длинные первыми для лучшего размещения)
    const sortedWords = [...words].sort((a, b) => b.length - a.length)
    
    // Размещаем слова
    for (let i = 0; i < sortedWords.length; i++) {
      const word = sortedWords[i]
      const positions = this.findPlacementPositions(word)
      
      if (positions.length === 0) {
        throw new Error(`Word placement failed: cannot place "${word}"`)
      }
      
      // Берём первую доступную позицию (уже перемешана)
      const position = positions[0]
      this.placeWord(word, position.row, position.col, position.direction, i)
    }
    
    // Заполняем пустые клетки случайными буквами
    this.fillEmptyCells()
    
    return {
      grid: this.grid,
      placedWords: this.placedWords,
      size: this.size
    }
  }
}