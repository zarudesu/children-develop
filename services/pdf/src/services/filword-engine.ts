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

  private canPlaceWord(word: string, row: number, col: number, direction: Direction, allowIntersections: boolean): boolean {
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

      if (allowIntersections) {
        // Классический филворд: разрешены пересечения только одинаковыми буквами
        if (cell.isPartOfWord && cell.letter !== word[i].toUpperCase()) {
          return false
        }
      } else {
        // Упрощенный режим: запрещены любые пересечения
        if (cell.isPartOfWord) {
          return false
        }
      }
    }

    // Проверка, что слово не "прилипает" к другим словам
    return this.checkWordIsolation(word, row, col, direction)
  }

  private checkWordIsolation(word: string, row: number, col: number, direction: Direction): boolean {
    // В филворде слова могут пересекаться, поэтому убираем строгую изоляцию
    // Проверяем только, что слово не начинается/заканчивается вплотную к другому слову в том же направлении
    const [deltaRow, deltaCol] = DIRECTION_VECTORS[direction]
    
    // Проверяем клетки перед и после слова только в том же направлении
    const beforeRow = row - deltaRow
    const beforeCol = col - deltaCol
    const afterRow = row + (deltaRow * word.length)
    const afterCol = col + (deltaCol * word.length)
    
    // Клетка перед словом не должна быть частью слова в том же направлении
    if (this.isValidPosition(beforeRow, beforeCol)) {
      const beforeCell = this.grid[beforeRow][beforeCol]
      if (beforeCell.isPartOfWord) {
        // Проверяем, является ли это продолжением слова в том же направлении
        const nextRow = beforeRow - deltaRow
        const nextCol = beforeCol - deltaCol
        if (this.isValidPosition(nextRow, nextCol) && this.grid[nextRow][nextCol].isPartOfWord) {
          return false
        }
      }
    }
    
    // Клетка после слова не должна быть частью слова в том же направлении
    if (this.isValidPosition(afterRow, afterCol)) {
      const afterCell = this.grid[afterRow][afterCol]
      if (afterCell.isPartOfWord) {
        // Проверяем, является ли это продолжением слова в том же направлении
        const nextRow = afterRow + deltaRow
        const nextCol = afterCol + deltaCol
        if (this.isValidPosition(nextRow, nextCol) && this.grid[nextRow][nextCol].isPartOfWord) {
          return false
        }
      }
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

  private findPlacementPositions(word: string, allowIntersections: boolean): Array<{row: number, col: number, direction: Direction}> {
    const positions: Array<{row: number, col: number, direction: Direction}> = []

    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        for (const direction of this.availableDirections) {
          if (this.canPlaceWord(word, row, col, direction, allowIntersections)) {
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

  public generateGrid(words: string[], directions: FilwordParams['directions'], allowIntersections: boolean = true): FilwordGrid {
    // Сбрасываем состояние  
    this.grid = this.initializeGrid()
    this.placedWords = []
    this.availableDirections = this.getAvailableDirections(directions)
    
    if (this.availableDirections.length === 0) {
      throw new Error('No directions specified')
    }

    // Пытаемся разместить слова несколько раз с разными стратегиями
    const maxAttempts = 5
    let attempt = 0
    
    while (attempt < maxAttempts) {
      try {
        this.attemptPlacement(words, attempt, allowIntersections)
        break // Успешно разместили все слова
      } catch (error) {
        attempt++
        if (attempt >= maxAttempts) {
          // В последней попытке разрешаем частичное размещение
          this.attemptPlacement(words, attempt, allowIntersections, true)
          break
        }
        // Сбрасываем и пробуем заново
        this.grid = this.initializeGrid()
        this.placedWords = []
      }
    }
    
    // Заполняем пустые клетки случайными буквами
    this.fillEmptyCells()
    
    return {
      grid: this.grid,
      placedWords: this.placedWords,
      size: this.size
    }
  }

  private attemptPlacement(words: string[], attempt: number, allowIntersections: boolean, allowPartial: boolean = false): void {
    // Сортируем слова по длине (длинные первыми для лучшего размещения)
    const sortedWords = [...words].sort((a, b) => b.length - a.length)
    
    // В каждой попытке перемешиваем слова по-разному для большей вариативности
    if (attempt > 0) {
      for (let i = sortedWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sortedWords[i], sortedWords[j]] = [sortedWords[j], sortedWords[i]]
      }
    }
    
    let placedCount = 0
    
    // Размещаем слова
    for (let i = 0; i < sortedWords.length; i++) {
      const word = sortedWords[i]
      const positions = this.findPlacementPositions(word, allowIntersections)
      
      if (positions.length === 0) {
        if (!allowPartial) {
          throw new Error(`Word placement failed: cannot place "${word}"`)
        }
        // В режиме частичного размещения просто пропускаем слово
        console.warn(`Skipping word "${word}" - no available positions`)
        continue
      }
      
      // Берём случайную позицию из доступных (для большей вариативности)
      const randomIndex = Math.floor(Math.random() * positions.length)
      const position = positions[randomIndex]
      this.placeWord(word, position.row, position.col, position.direction, placedCount)
      placedCount++
    }
    
    // Проверяем, что разместили достаточно слов (минимум 80%)
    if (!allowPartial && placedCount < Math.floor(sortedWords.length * 0.8)) {
      throw new Error(`Too few words placed: ${placedCount}/${sortedWords.length}`)
    }
  }
}