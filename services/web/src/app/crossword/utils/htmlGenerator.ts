import { CrosswordParams } from '../types'

// Динамический импорт для CommonJS модуля
let CrosswordLayoutGenerator: any = null

async function getCrosswordLayoutGenerator() {
  if (!CrosswordLayoutGenerator) {
    CrosswordLayoutGenerator = require('crossword-layout-generator')
  }
  return CrosswordLayoutGenerator
}

interface CrosswordCell {
  letter: string
  isBlack: boolean
  number?: number
  isPartOfWord: boolean
  wordIds: number[]
}

interface CrosswordGrid {
  grid: CrosswordCell[][]
  size: number
  clues: {
    horizontal: Array<{number: number, clue: string, length: number, answer: string}>
    vertical: Array<{number: number, clue: string, length: number, answer: string}>
  }
}

export async function generateCrosswordHTML(params: CrosswordParams): Promise<string> {
  try {
    console.log('🎯 Starting crossword HTML generation with params:', {
      wordsCount: params.words.length,
      gridSize: params.gridSize
    })

    // Получаем модуль генератора
    const generator = await getCrosswordLayoutGenerator()

    // Подготавливаем слова для генератора
    const words = params.words.map(wordObj => ({
      clue: wordObj.clue,
      answer: wordObj.word.toLowerCase()
    }))

    console.log('🔤 Prepared words for layout generator:', words)

    // Генерируем сетку кроссворда
    const layout = generator.generateLayout(words)

    console.log('📐 Generated layout type:', typeof layout)
    console.log('📐 Generated layout:', JSON.stringify(layout, null, 2))

    // Проверяем, что возвращает генератор
    if (!layout) {
      throw new Error('Генератор вернул null/undefined')
    }

    // Проверяем структуру результата
    if (!layout.result || !Array.isArray(layout.result)) {
      throw new Error('Некорректный результат от генератора кроссворда')
    }

    console.log('📐 Layout result array:', layout.result.length, 'items')

    // Фильтруем только успешно размещенные слова (без orientation: 'none')
    const placedWords = layout.result.filter(word => word.orientation !== 'none')
    console.log('📐 Successfully placed words:', placedWords.length, 'out of', layout.result.length)

    if (placedWords.length === 0) {
      throw new Error('Не удалось разместить ни одного слова в сетке кроссворда')
    }

    // Преобразуем результат в нашу структуру
    const crosswordData = convertLayoutToGrid(layout, params)

    console.log('🗂️ Converted to grid structure:', {
      gridSize: crosswordData.size,
      horizontalClues: crosswordData.clues.horizontal.length,
      verticalClues: crosswordData.clues.vertical.length
    })

    // Генерируем HTML
    const html = generateHTML(crosswordData, params)

    console.log('✅ Generated HTML length:', html.length)
    return html

  } catch (error) {
    console.error('❌ Ошибка генерации кроссворда:', error)
    throw new Error(`Не удалось создать кроссворд: ${error.message || 'неизвестная ошибка'}`)
  }
}

function convertLayoutToGrid(layout: any, params: CrosswordParams): CrosswordGrid {
  // Определяем размер сетки
  const gridSizeNum = parseInt(params.gridSize.split('x')[0])

  // Находим реальные границы размещенных слов
  // Используем только успешно размещенные слова
  const placedWords = layout.result.filter(word => word.orientation !== 'none')
  let minX = 0, maxX = 0, minY = 0, maxY = 0
  placedWords.forEach(item => {
    minX = Math.min(minX, item.startx)
    maxX = Math.max(maxX, item.startx + (item.orientation === 'across' ? item.answer.length - 1 : 0))
    minY = Math.min(minY, item.starty)
    maxY = Math.max(maxY, item.starty + (item.orientation === 'down' ? item.answer.length - 1 : 0))
  })

  // Сдвигаем в положительные координаты и центрируем
  const offsetX = Math.max(0, -minX)
  const offsetY = Math.max(0, -minY)
  const usedWidth = maxX - minX + 1
  const usedHeight = maxY - minY + 1
  const centerOffsetX = Math.max(0, Math.floor((gridSizeNum - usedWidth) / 2))
  const centerOffsetY = Math.max(0, Math.floor((gridSizeNum - usedHeight) / 2))

  // Создаем пустую сетку
  const grid: CrosswordCell[][] = Array(gridSizeNum).fill(null).map(() =>
    Array(gridSizeNum).fill(null).map(() => ({
      letter: '',
      isBlack: false,
      isPartOfWord: false,
      wordIds: []
    }))
  )

  const clues = {
    horizontal: [] as Array<{number: number, clue: string, length: number, answer: string}>,
    vertical: [] as Array<{number: number, clue: string, length: number, answer: string}>
  }

  let wordNumber = 1

  // Размещаем слова в сетке
  placedWords.forEach((item, index) => {
    const startX = item.startx + offsetX + centerOffsetX
    const startY = item.starty + offsetY + centerOffsetY

    // Проверяем границы
    if (startX < 0 || startY < 0 || startX >= gridSizeNum || startY >= gridSizeNum) {
      return
    }

    const isHorizontal = item.orientation === 'across'
    const word = item.answer.toUpperCase()

    // Размещаем буквы
    for (let i = 0; i < word.length; i++) {
      const x = startX + (isHorizontal ? i : 0)
      const y = startY + (isHorizontal ? 0 : i)

      if (x >= 0 && x < gridSizeNum && y >= 0 && y < gridSizeNum) {
        grid[y][x].letter = word[i]
        grid[y][x].isPartOfWord = true
        grid[y][x].wordIds.push(index)

        // Устанавливаем номер только для первой буквы
        if (i === 0) {
          grid[y][x].number = wordNumber
        }
      }
    }

    // Добавляем определение
    const clueList = isHorizontal ? clues.horizontal : clues.vertical
    clueList.push({
      number: wordNumber,
      clue: item.clue,
      length: word.length,
      answer: word
    })

    wordNumber++
  })

  // Заполняем черными клетками пустые места
  for (let y = 0; y < gridSizeNum; y++) {
    for (let x = 0; x < gridSizeNum; x++) {
      if (!grid[y][x].isPartOfWord) {
        grid[y][x].isBlack = true
      }
    }
  }

  return {
    grid,
    size: gridSizeNum,
    clues
  }
}

function generateHTML(crosswordData: CrosswordGrid, params: CrosswordParams): string {
  const { grid, clues } = crosswordData

  // Генерируем страницу с заданием
  const taskPage = generateTaskPage(grid, clues, params)

  // Генерируем страницу с ответами если нужно
  const answerPage = params.includeAnswers
    ? generateAnswerPage(grid, clues, params)
    : ''

  return `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Кроссворд</title>
    <style>
        ${getCrosswordCSS(params)}
    </style>
</head>
<body>
    ${taskPage}
    ${answerPage}
</body>
</html>`
}

function generateTaskPage(grid: CrosswordCell[][], clues: any, params: CrosswordParams): string {
  return `
    <div class="page">
        <div class="header">
            <h1>КРОССВОРД</h1>
            <p class="instructions">Разгадайте кроссворд, используя определения ниже.</p>
        </div>

        <div class="crossword-container">
            <div class="crossword-grid grid-${params.gridSize} font-${params.fontSize}">
                ${generateGridHTML(grid, false)}
            </div>
        </div>

        <div class="clues-section">
            <div class="clues-container">
                ${clues.horizontal.length > 0 ? `
                <div class="clues-column">
                    <h3>По горизонтали:</h3>
                    <ol class="clues-list">
                        ${clues.horizontal.map((clue: any) =>
                          `<li><span class="clue-number">${clue.number}.</span> ${clue.clue} (${clue.length} букв)</li>`
                        ).join('')}
                    </ol>
                </div>
                ` : ''}

                ${clues.vertical.length > 0 ? `
                <div class="clues-column">
                    <h3>По вертикали:</h3>
                    <ol class="clues-list">
                        ${clues.vertical.map((clue: any) =>
                          `<li><span class="clue-number">${clue.number}.</span> ${clue.clue} (${clue.length} букв)</li>`
                        ).join('')}
                    </ol>
                </div>
                ` : ''}
            </div>
        </div>
    </div>`
}

function generateAnswerPage(grid: CrosswordCell[][], clues: any, params: CrosswordParams): string {
  return `
    <div class="page page-break">
        <div class="header">
            <h1>ОТВЕТЫ</h1>
        </div>

        <div class="crossword-container">
            <div class="crossword-grid grid-${params.gridSize} font-${params.fontSize}">
                ${generateGridHTML(grid, true)}
            </div>
        </div>

        <div class="answer-info">
            <div class="answer-lists">
                ${clues.horizontal.length > 0 ? `
                <div class="answer-column">
                    <h4>По горизонтали:</h4>
                    <ul class="answer-list">
                        ${clues.horizontal.map((clue: any) =>
                          `<li><span class="answer-number">${clue.number}.</span> ${clue.answer}</li>`
                        ).join('')}
                    </ul>
                </div>
                ` : ''}

                ${clues.vertical.length > 0 ? `
                <div class="answer-column">
                    <h4>По вертикали:</h4>
                    <ul class="answer-list">
                        ${clues.vertical.map((clue: any) =>
                          `<li><span class="answer-number">${clue.number}.</span> ${clue.answer}</li>`
                        ).join('')}
                    </ul>
                </div>
                ` : ''}
            </div>
        </div>
    </div>`
}

function generateGridHTML(grid: CrosswordCell[][], showAnswers: boolean): string {
  return grid.map((row, rowIndex) => `
    <div class="grid-row">
        ${row.map((cell, colIndex) => `
            <div class="crossword-cell${cell.isBlack ? ' black-cell' : ''}${cell.isPartOfWord ? ' word-cell' : ''}"
                 data-row="${rowIndex}" data-col="${colIndex}">
                ${cell.number ? `<span class="cell-number">${cell.number}</span>` : ''}
                ${showAnswers && !cell.isBlack ? cell.letter : ''}
            </div>
        `).join('')}
    </div>
  `).join('')
}

function getCrosswordCSS(params: CrosswordParams): string {
  return `
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        font-family: Arial, sans-serif;
        color: #000;
        background: white;
    }

    .page {
        width: 210mm;
        min-height: 297mm;
        padding: 15mm;
        margin: 0 auto;
        background: white;
    }

    .page-break {
        page-break-before: always;
    }

    .header {
        text-align: center;
        margin-bottom: 15mm;
    }

    .header h1 {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 5mm;
    }

    .instructions {
        font-size: 12px;
        color: #666;
        margin-bottom: 5mm;
    }

    .crossword-container {
        display: flex;
        justify-content: center;
        margin: 10mm 0;
    }

    .crossword-grid {
        display: grid;
        gap: 0;
        background-color: transparent;
        border: none;
        max-width: 150mm;
    }

    .crossword-grid.grid-11x11 { grid-template-columns: repeat(11, 1fr); }
    .crossword-grid.grid-13x13 { grid-template-columns: repeat(13, 1fr); }
    .crossword-grid.grid-15x15 { grid-template-columns: repeat(15, 1fr); }
    .crossword-grid.grid-17x17 { grid-template-columns: repeat(17, 1fr); }
    .crossword-grid.grid-19x19 { grid-template-columns: repeat(19, 1fr); }
    .crossword-grid.grid-21x21 { grid-template-columns: repeat(21, 1fr); }

    .grid-row {
        display: contents;
    }

    .crossword-cell {
        width: 12mm;
        height: 12mm;
        background-color: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        font-family: Arial, sans-serif;
        font-weight: bold;
    }

    .crossword-cell.black-cell {
        background-color: transparent;
    }

    .crossword-cell.word-cell {
        background-color: #fff;
        outline: 1px solid #000;
        outline-offset: -1px;
    }

    .cell-number {
        position: absolute;
        top: 1px;
        left: 2px;
        font-size: 6px;
        font-weight: normal;
        color: #000;
        line-height: 1;
    }

    .crossword-grid.font-large .crossword-cell {
        width: 15mm;
        height: 15mm;
        font-size: 14px;
    }

    .crossword-grid.font-medium .crossword-cell {
        width: 12mm;
        height: 12mm;
        font-size: 12px;
    }

    .crossword-grid.font-small .crossword-cell {
        width: 10mm;
        height: 10mm;
        font-size: 10px;
    }

    .clues-section {
        margin-top: 15mm;
    }

    .clues-container {
        display: flex;
        gap: 20mm;
        justify-content: space-between;
    }

    .clues-column {
        flex: 1;
    }

    .clues-column h3 {
        font-size: 14px;
        margin-bottom: 5mm;
        color: #333;
    }

    .clues-list {
        list-style: none;
        padding: 0;
        margin: 0;
        font-size: 11px;
        line-height: 1.4;
    }

    .clues-list li {
        margin-bottom: 2mm;
    }

    .clue-number {
        font-weight: bold;
        color: #000;
    }

    .answer-info {
        margin-top: 15mm;
    }

    .answer-lists {
        display: flex;
        gap: 20mm;
        justify-content: space-between;
    }

    .answer-column {
        flex: 1;
    }

    .answer-column h4 {
        font-size: 12px;
        margin-bottom: 5mm;
        color: #333;
    }

    .answer-list {
        list-style: none;
        padding: 0;
        margin: 0;
        font-size: 10px;
        line-height: 1.3;
    }

    .answer-list li {
        margin-bottom: 1.5mm;
    }

    .answer-number {
        font-weight: bold;
        color: #000;
    }

    @media print {
        body {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
        }
    }
  `
}