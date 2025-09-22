import {
  CrosswordParams,
  CrosswordGrid,
  CrosswordCell,
  PlacedCrosswordWord,
  CrosswordWord
} from '../types'

interface CrosswordPosition {
  row: number
  col: number
  direction: 'horizontal' | 'vertical'
  word: CrosswordWord
  score: number
}

export class CrosswordEngine {
  private grid: CrosswordCell[][]
  private size: number
  private placedWords: PlacedCrosswordWord[] = []
  private nextNumber = 1

  constructor(gridSize: CrosswordParams['gridSize']) {
    this.size = this.getGridSize(gridSize)
    this.grid = this.initializeGrid()
  }

  private getGridSize(gridSize: CrosswordParams['gridSize']): number {
    const sizes: Record<CrosswordParams['gridSize'], number> = {
      '11x11': 11,
      '13x13': 13,
      '15x15': 15,
      '17x17': 17,
      '19x19': 19,
      '21x21': 21
    }
    return sizes[gridSize]
  }

  private initializeGrid(): CrosswordCell[][] {
    return Array(this.size).fill(null).map(() =>
      Array(this.size).fill(null).map(() => ({
        letter: '',
        isBlack: false,
        isPartOfWord: false,
        wordIds: []
      }))
    )
  }

  // Основной метод генерации кроссворда
  public generateCrossword(params: CrosswordParams): CrosswordGrid {
    this.grid = this.initializeGrid()
    this.placedWords = []
    this.nextNumber = 1

    console.log(`Generating crossword: ${params.gridSize}, ${params.words.length} words`)

    // Сортируем слова по длине (длинные первыми)
    const sortedWords = [...params.words].sort((a, b) => b.length - a.length)

    // Размещаем первое слово в центре
    if (sortedWords.length > 0) {
      this.placeFirstWord(sortedWords[0])
    }

    // Размещаем остальные слова
    for (let i = 1; i < sortedWords.length; i++) {
      const word = sortedWords[i]
      const bestPosition = this.findBestPosition(word)

      if (bestPosition) {
        this.placeWord(bestPosition)
      } else {
        console.warn(`Could not place word: ${word.word}`)
      }
    }

    // Добавляем чёрные клетки для симметрии
    if (params.style === 'classic' || params.style === 'american') {
      this.addBlackSquares(params.blackSquareRatio)
    }

    // Генерируем определения
    const clues = this.generateClues()

    return {
      grid: this.grid,
      size: this.size,
      placedWords: this.placedWords,
      clues
    }
  }

  // Размещение первого слова в центре
  private placeFirstWord(word: CrosswordWord) {
    const centerRow = Math.floor(this.size / 2)
    const startCol = Math.floor((this.size - word.length) / 2)

    const position: CrosswordPosition = {
      row: centerRow,
      col: startCol,
      direction: 'horizontal',
      word,
      score: 0
    }

    this.placeWord(position)
  }

  // Поиск лучшей позиции для размещения слова
  private findBestPosition(word: CrosswordWord): CrosswordPosition | null {
    const positions: CrosswordPosition[] = []

    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        // Попробуем горизонтальное размещение
        const horizontalPos = this.tryHorizontalPlacement(word, row, col)
        if (horizontalPos) {
          positions.push(horizontalPos)
        }

        // Попробуем вертикальное размещение
        const verticalPos = this.tryVerticalPlacement(word, row, col)
        if (verticalPos) {
          positions.push(verticalPos)
        }
      }
    }

    // Выбираем позицию с лучшим счётом (больше пересечений)
    return positions.length > 0
      ? positions.reduce((best, current) => current.score > best.score ? current : best)
      : null
  }

  // Попытка горизонтального размещения
  private tryHorizontalPlacement(word: CrosswordWord, row: number, col: number): CrosswordPosition | null {
    // Проверяем границы
    if (col + word.length > this.size) {
      return null
    }

    let intersections = 0
    let canPlace = true

    // Проверяем каждую букву слова
    for (let i = 0; i < word.length; i++) {
      const currentCol = col + i
      const cell = this.grid[row][currentCol]

      if (cell.isPartOfWord) {
        // Если клетка уже занята, проверяем совпадение букв
        if (cell.letter === word.word[i].toUpperCase()) {
          intersections++
        } else {
          canPlace = false
          break
        }
      } else {
        // Проверяем, что рядом нет параллельных слов
        if (this.hasAdjacentHorizontalWords(row, currentCol)) {
          canPlace = false
          break
        }
      }
    }

    // Проверяем, что слово изолировано с боков
    if (canPlace && !this.isHorizontallyIsolated(word, row, col)) {
      canPlace = false
    }

    if (canPlace && intersections > 0) {
      return {
        row,
        col,
        direction: 'horizontal',
        word,
        score: intersections
      }
    }

    return null
  }

  // Попытка вертикального размещения
  private tryVerticalPlacement(word: CrosswordWord, row: number, col: number): CrosswordPosition | null {
    // Проверяем границы
    if (row + word.length > this.size) {
      return null
    }

    let intersections = 0
    let canPlace = true

    // Проверяем каждую букву слова
    for (let i = 0; i < word.length; i++) {
      const currentRow = row + i
      const cell = this.grid[currentRow][col]

      if (cell.isPartOfWord) {
        // Если клетка уже занята, проверяем совпадение букв
        if (cell.letter === word.word[i].toUpperCase()) {
          intersections++
        } else {
          canPlace = false
          break
        }
      } else {
        // Проверяем, что рядом нет параллельных слов
        if (this.hasAdjacentVerticalWords(currentRow, col)) {
          canPlace = false
          break
        }
      }
    }

    // Проверяем, что слово изолировано сверху и снизу
    if (canPlace && !this.isVerticallyIsolated(word, row, col)) {
      canPlace = false
    }

    if (canPlace && intersections > 0) {
      return {
        row,
        col,
        direction: 'vertical',
        word,
        score: intersections
      }
    }

    return null
  }

  // Размещение слова в сетке
  private placeWord(position: CrosswordPosition) {
    const { row, col, direction, word } = position

    // Определяем номер для этого слова
    const wordNumber = this.nextNumber++

    // Размещаем буквы в сетке
    for (let i = 0; i < word.length; i++) {
      const currentRow = direction === 'horizontal' ? row : row + i
      const currentCol = direction === 'horizontal' ? col + i : col

      const cell = this.grid[currentRow][currentCol]

      if (!cell.isPartOfWord) {
        // Новая клетка
        cell.letter = word.word[i].toUpperCase()
        cell.isPartOfWord = true
        cell.wordIds = [this.placedWords.length]

        // Номер ставим только на первую клетку слова
        if (i === 0) {
          cell.number = wordNumber
        }
      } else {
        // Пересечение с существующим словом
        cell.wordIds.push(this.placedWords.length)
      }
    }

    // Добавляем слово в список размещённых
    this.placedWords.push({
      id: this.placedWords.length,
      word: word.word,
      clue: word.clue,
      startRow: row,
      startCol: col,
      direction,
      length: word.length,
      number: wordNumber
    })
  }

  // Проверка изоляции горизонтального слова
  private isHorizontallyIsolated(word: CrosswordWord, row: number, col: number): boolean {
    // Проверяем клетки слева и справа от слова
    if (col > 0 && this.grid[row][col - 1].isPartOfWord) {
      return false
    }
    if (col + word.length < this.size && this.grid[row][col + word.length].isPartOfWord) {
      return false
    }
    return true
  }

  // Проверка изоляции вертикального слова
  private isVerticallyIsolated(word: CrosswordWord, row: number, col: number): boolean {
    // Проверяем клетки сверху и снизу от слова
    if (row > 0 && this.grid[row - 1][col].isPartOfWord) {
      return false
    }
    if (row + word.length < this.size && this.grid[row + word.length][col].isPartOfWord) {
      return false
    }
    return true
  }

  // Проверка соседних горизонтальных слов
  private hasAdjacentHorizontalWords(row: number, col: number): boolean {
    // Проверяем клетки сверху и снизу
    if (row > 0 && this.grid[row - 1][col].isPartOfWord) return true
    if (row < this.size - 1 && this.grid[row + 1][col].isPartOfWord) return true
    return false
  }

  // Проверка соседних вертикальных слов
  private hasAdjacentVerticalWords(row: number, col: number): boolean {
    // Проверяем клетки слева и справа
    if (col > 0 && this.grid[row][col - 1].isPartOfWord) return true
    if (col < this.size - 1 && this.grid[row][col + 1].isPartOfWord) return true
    return false
  }

  // Добавление чёрных клеток для симметрии
  private addBlackSquares(ratio: number) {
    const totalCells = this.size * this.size
    const blackCellsNeeded = Math.floor(totalCells * ratio)
    let blackCellsAdded = 0

    // Простая стратегия: добавляем чёрные клетки в пустые места
    for (let row = 0; row < this.size && blackCellsAdded < blackCellsNeeded; row++) {
      for (let col = 0; col < this.size && blackCellsAdded < blackCellsNeeded; col++) {
        if (!this.grid[row][col].isPartOfWord) {
          this.grid[row][col].isBlack = true

          // Для симметрии добавляем симметричную клетку
          const symRow = this.size - 1 - row
          const symCol = this.size - 1 - col
          if (symRow !== row || symCol !== col) {
            if (!this.grid[symRow][symCol].isPartOfWord) {
              this.grid[symRow][symCol].isBlack = true
              blackCellsAdded += 2
            }
          } else {
            blackCellsAdded++
          }
        }
      }
    }
  }

  // Генерация определений
  private generateClues() {
    const horizontal: Array<{number: number, clue: string, length: number}> = []
    const vertical: Array<{number: number, clue: string, length: number}> = []

    for (const word of this.placedWords) {
      const clueData = {
        number: word.number,
        clue: word.clue,
        length: word.length
      }

      if (word.direction === 'horizontal') {
        horizontal.push(clueData)
      } else {
        vertical.push(clueData)
      }
    }

    // Сортируем по номерам
    horizontal.sort((a, b) => a.number - b.number)
    vertical.sort((a, b) => a.number - b.number)

    return { horizontal, vertical }
  }
}