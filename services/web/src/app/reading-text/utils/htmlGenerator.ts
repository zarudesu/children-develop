import { ReadingTextParams } from '../types'

// Трансформации текста (копия из PDF-сервиса)
function transformText(text: string, type: string, options: any = {}): string {
  switch (type) {
    case 'normal':
      return text

    case 'bottom-cut':
      const cutPercentage = options.cutPercentage || 40
      // Пословная обработка: каждое слово в отдельном span с настраиваемым процентом
      return text.split(/(\s+)/).map(part => {
        // Только слова оборачиваем, пробелы оставляем как есть
        return part.trim()
          ? `<span class="bottom-cut-pseudo" style="--cut-height: ${cutPercentage}%">${part}</span>`
          : part
      }).join('')

    case 'top-cut':
      const topCutPercentage = options.cutPercentage || 40
      // Пословная обработка: каждое слово в отдельном span с настраиваемым процентом
      return text.split(/(\s+)/).map(part => {
        // Только слова оборачиваем, пробелы оставляем как есть
        return part.trim()
          ? `<span class="top-cut-pseudo" style="--cut-height: ${topCutPercentage}%">${part}</span>`
          : part
      }).join('')

    case 'missing-endings':
      const endingLength = options.endingLength || 2
      const endingWords = text.split(/(\s+|[.,!?;:])/)

      // Обрабатываем только кириллические слова - каждое второе
      let wordIndex = 0
      return endingWords.map((part) => {
        // Проверяем, является ли часть словом (кириллица)
        if (/^[а-яё]+$/i.test(part) && part.length > endingLength + 1) {
          wordIndex++
          const shouldProcess = wordIndex % 2 === 0 // каждое второе слово

          if (shouldProcess) {
            const truncated = part.slice(0, -endingLength)
            const underscores = '_'.repeat(endingLength)
            return `<span class="missing-letters-spacing">${truncated + underscores}</span>`
          }
        }

        return part // оставляем как есть (слово или разделитель)
      }).join('')

    case 'missing-vowels':
      const vowelText = text.replace(/[аеёиоуыэюя]/gi, '_')
      return `<span class="missing-letters-spacing">${vowelText}</span>`

    case 'partial-reversed':
      const reversedWordCount = options.reversedWordCount || 2
      const reversedParts = text.split(/(\s+|[.,!?;:])/)

      // Переворачиваем каждое второе слово на 180°
      let reversedWordIndex = 0
      return reversedParts.map((part) => {
        // Проверяем, является ли часть словом (кириллица)
        if (/^[а-яё]+$/i.test(part) && part.length > 2) {
          reversedWordIndex++
          const shouldRotate = reversedWordIndex % 2 === 0 // каждое второе слово

          if (shouldRotate) {
            return `<span class="rotated-text">${part}</span>`
          }
        }

        return part // оставляем как есть (слово или разделитель)
      }).join('')

    case 'scrambled-words':
      const keepFirstLast = options.keepFirstLast !== false // по умолчанию true
      const scrambledParts = text.split(/(\s+|[.,!?;:])/)

      return scrambledParts.map((part) => {
        // Обрабатываем только кириллические слова длиной больше 3 букв
        if (/^[а-яё]+$/i.test(part) && part.length > 3) {
          return scrambleWord(part, keepFirstLast)
        }
        return part // оставляем пробелы и знаки препинания как есть
      }).join('')

    case 'merged-text':
      // Используем умный перенос если есть параметры шрифта
      if (options.fontFamily && options.fontSize) {
        return wrapTextWithSmartBreaks(text, options.fontFamily, options.fontSize)
      }
      // Иначе просто убираем пробелы
      return text.replace(/\s+/g, '')

    case 'extra-letters':
      const density = options.extraLetterDensity || 30
      const chars = text.split('')
      const result: string[] = []

      chars.forEach(char => {
        result.push(char)

        // Добавляем случайную букву с заданной вероятностью
        if (/[а-яё]/i.test(char) && Math.random() * 100 < density) {
          const randomLetter = getRandomCyrillicLetter()
          result.push(`<span class="extra-letter">${randomLetter}</span>`)
        }
      })

      return result.join('')

    case 'mirror-text':
      // Создаем зеркальное отображение текста - переворачиваем каждое слово по буквам
      const mirrorWords = text.split(/(\s+|[.,!?;:])/)

      return mirrorWords.map(part => {
        // Если это слово (кириллица), переворачиваем его и добавляем CSS для зеркального отображения
        if (/^[а-яё]+$/i.test(part) && part.length > 0) {
          const reversed = part.split('').reverse().join('')
          return `<span class="mirror-text">${reversed}</span>`
        }
        return part // оставляем пробелы и знаки препинания как есть
      }).join('')

    case 'mixed-types':
      const mode = options.mixedMode || 'sentence'

      if (mode === 'sentence') {
        return processMixedBySentence(text, options)
      } else {
        return processMixedByWord(text, options)
      }

    default:
      return text
  }
}

// Функция для перемешивания букв в слове
function scrambleWord(word: string, keepFirstLast: boolean): string {
  if (word.length <= 3) return word // слишком короткое слово не перемешиваем

  const chars = word.split('')
  const isCapitalized = /^[А-ЯЁ]/.test(word) // проверяем, начинается ли с заглавной

  if (keepFirstLast) {
    // Режим: первая и последняя буквы остаются на месте
    if (word.length <= 4) return word // для слов из 4 букв нечего перемешивать

    const first = chars[0]
    const last = chars[chars.length - 1]
    const middle = chars.slice(1, -1)

    // Перемешиваем средние буквы
    const shuffledMiddle = shuffleArray(middle.slice())

    const result = [first, ...shuffledMiddle, last].join('')

    // Обрабатываем заглавные буквы
    return adjustCapitalization(result, isCapitalized)
  } else {
    // Режим: перемешиваем все буквы
    const shuffled = shuffleArray(chars.slice())
    const result = shuffled.join('')

    // Обрабатываем заглавные буквы
    return adjustCapitalization(result, isCapitalized)
  }
}

// Функция для перемешивания массива (алгоритм Фишера-Йетса)
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// Функция для корректной обработки заглавных букв
function adjustCapitalization(word: string, shouldBeCapitalized: boolean): string {
  if (!shouldBeCapitalized) return word.toLowerCase()

  // Делаем первую букву заглавной, остальные строчными
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

// Функция для получения случайной кириллической буквы
function getRandomCyrillicLetter(): string {
  const vowels = ['а', 'е', 'ё', 'и', 'о', 'у', 'ы', 'э', 'ю', 'я']
  const consonants = ['б', 'в', 'г', 'д', 'ж', 'з', 'й', 'к', 'л', 'м', 'н', 'п', 'р', 'с', 'т', 'ф', 'х', 'ц', 'ч', 'ш', 'щ']
  const allLetters = [...vowels, ...consonants]

  return allLetters[Math.floor(Math.random() * allLetters.length)]
}

// Функция для смешанного типа по предложениям
function processMixedBySentence(text: string, options: any): string {
  // Улучшенная разбивка на предложения - разделяем по точкам, восклицательным и вопросительным знакам
  const sentences = text.split(/([.!?]+\s*)/).filter(s => s.trim())

  // Трансформации для предложений (merged-text и mirror-text применяются ко всему предложению)
  const sentenceTransformations = [
    'missing-vowels',    // применяется к каждому слову
    'scrambled-words',   // применяется к каждому слову
    'missing-endings',   // применяется к каждому слову
    'merged-text',       // применяется ко всему предложению
    'mirror-text'        // применяется ко всему предложению
  ]

  let result = ''
  let sentenceIndex = 0

  for (let i = 0; i < sentences.length; i += 2) {
    const sentence = sentences[i]?.trim()
    const punctuation = sentences[i + 1] || ''

    if (sentence && sentence.length > 0) {
      const transformationType = sentenceTransformations[sentenceIndex % sentenceTransformations.length]

      // Применяем трансформацию к предложению (исключаем рекурсию mixed-types)
      const safeOptions = { ...options, mixedMode: undefined }
      const transformed = transformText(sentence, transformationType, safeOptions)
      result += transformed + punctuation + ' '
      sentenceIndex++
    } else if (punctuation.trim()) {
      result += punctuation + ' '
    }
  }

  return result.trim()
}

// Функция для смешанного типа по словам (сборная солянка)
function processMixedByWord(text: string, options: any): string {
  // Сначала разбиваем на предложения для "целых" трансформаций
  const sentences = text.split(/([.!?]+\s*)/).filter(s => s.trim())

  // Трансформации: часть применяется к словам, часть к предложениям
  const allTransformations = [
    'missing-vowels',     // к словам
    'scrambled-words',    // к словам
    'missing-endings',    // к словам
    'merged-text',        // к предложению целиком
    'mirror-text'         // к предложению целиком
  ]

  let result = ''
  let transformIndex = 0

  for (let i = 0; i < sentences.length; i += 2) {
    const sentence = sentences[i]?.trim()
    const punctuation = sentences[i + 1] || ''

    if (sentence && sentence.length > 0) {
      const transformationType = allTransformations[transformIndex % allTransformations.length]
      transformIndex++

      // Если это трансформация для всего предложения
      if (transformationType === 'merged-text' || transformationType === 'mirror-text') {
        const safeOptions = { ...options, mixedMode: undefined }
        const transformed = transformText(sentence, transformationType, safeOptions)
        result += transformed + punctuation + ' '
      } else {
        // Применяем трансформацию к каждому слову в предложении
        const words = sentence.split(/(\s+)/)
        const transformedWords = words.map((part) => {
          if (/^[а-яё]+$/i.test(part) && part.length > 2) {
            const safeOptions = { ...options, mixedMode: undefined }
            return transformText(part, transformationType, safeOptions)
          }
          return part
        }).join('')
        result += transformedWords + punctuation + ' '
      }
    } else if (punctuation.trim()) {
      result += punctuation + ' '
    }
  }

  return result.trim()
}

// Функция умного переноса для слитного текста
function wrapTextWithSmartBreaks(text: string, fontFamily: string, fontSize: string): string {
  // Константы ширины символов для разных шрифтов (в px при размере 14px)
  const FONT_CHAR_WIDTHS: Record<string, number> = {
    'serif': 8.5,
    'sans-serif': 8.2,
    'mono': 8.4,
    'cursive': 9.1,
    'propisi': 9.5
  }

  // Размеры шрифтов
  const FONT_SIZES: Record<string, number> = {
    'tiny': 10,
    'small': 12,
    'medium': 14,
    'large': 18,
    'extra-large': 24,
    'huge': 32,
    'super-huge': 40
  }

  const containerWidth = 690 // A4 ширина минус padding
  const baseCharWidth = FONT_CHAR_WIDTHS[fontFamily] || 8.2
  const fontSizePx = FONT_SIZES[fontSize] || 14

  // Масштабируем ширину символа под размер шрифта
  const charWidth = baseCharWidth * (fontSizePx / 14)

  // Вычисляем сколько символов помещается в строку
  const maxCharsPerLine = Math.floor((containerWidth - 60) / charWidth)

  // Извлекаем слова из исходного текста (с пробелами)
  const words = text.split(/(\s+|[.,!?;:])/)
  const cleanWords = words.filter(word => !/^\s+$/.test(word) && word.length > 0)

  // Склеиваем слова в одну строку (убираем пробелы)
  const mergedText = cleanWords.join('')

  if (maxCharsPerLine <= 0 || mergedText.length <= maxCharsPerLine) {
    return mergedText // не нужно переносить
  }

  // Разбиваем склеенный текст по границам исходных слов
  const lines: string[] = []
  let currentLine = ''

  for (const word of cleanWords) {
    // Если добавление слова превышает лимит - начинаем новую строку
    if (currentLine.length + word.length > maxCharsPerLine && currentLine.length > 0) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine += word
    }
  }

  // Добавляем последнюю строку
  if (currentLine.length > 0) {
    lines.push(currentLine)
  }

  return lines.join('<br>')
}


// CSS стили для PDF
function getCSS(fontSize: string = 'medium', fontFamily: string = 'sans-serif'): string {
  // Мапинг размеров шрифтов
  const fontSizeMap: Record<string, string> = {
    'super-huge': '40px',
    'huge': '32px',
    'extra-large': '24px',
    'large': '18px',
    'medium': '14px'
  }

  // Мапинг семейств шрифтов
  const fontFamilyMap: Record<string, string> = {
    'serif': '"Times New Roman", Times, serif',
    'sans-serif': '"Arial", "Helvetica", sans-serif',
    'mono': '"Courier New", Courier, monospace',
    'cursive': '"Comic Sans MS", cursive',
    'propisi': '"Propisi", "Kalam", "Comic Sans MS", cursive'
  }

  const cssSize = fontSizeMap[fontSize] || '14px'
  const cssFontFamily = fontFamilyMap[fontFamily] || '"Arial", "Helvetica", sans-serif'

  return `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&family=Comfortaa:wght@300;400;700&display=swap');

      @font-face {
        font-family: 'Propisi';
        src: url('/fonts/Propisi.TTF') format('truetype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }

      body {
        font-family: ${cssFontFamily};
        font-size: ${cssSize};
        padding: 2cm;
        line-height: 1.6;
        margin: 0;
      }
      .title {
        font-size: 18pt;
        font-weight: bold;
        text-align: center;
        margin-bottom: 20px;
      }
      .exercise-text {
        font-size: ${cssSize};
        font-family: ${cssFontFamily};
        line-height: 1.8;
        padding: 20px;
        border: 1px solid #ccc;
        margin: 20px 0;
      }
      .metadata {
        font-size: 10pt;
        color: #666;
        margin-bottom: 20px;
      }

      /* CSS-методы обрезания текста */

      /* Метод 1: overflow hidden - базовый метод */
      .bottom-cut-overflow {
        display: inline-block;
        height: 0.4em;
        overflow: hidden;
        vertical-align: baseline;
      }

      .top-cut-overflow {
        display: inline-block;
        height: 0.6em;
        overflow: hidden;
        line-height: 1em;
        margin-top: 0.4em;
        vertical-align: baseline;
      }

      /* Метод 2: clip-path - современный метод */
      .bottom-cut-clippath {
        display: inline-block;
        clip-path: polygon(0% 60%, 100% 60%, 100% 100%, 0% 100%);
        vertical-align: baseline;
        line-height: 1 !important;
        padding: 0 !important;
        margin: 0 !important;
      }

      .top-cut-clippath {
        display: inline-block;
        clip-path: polygon(0% 0%, 100% 0%, 100% 40%, 0% 40%);
        vertical-align: baseline;
        line-height: 1 !important;
        padding: 0 !important;
        margin: 0 !important;
      }

      /* Метод 3: scaleY - трансформация */
      .bottom-cut-scale {
        display: inline-block;
        transform: scaleY(0.4) translateY(60%);
        transform-origin: bottom;
        vertical-align: baseline;
      }

      .top-cut-scale {
        display: inline-block;
        transform: scaleY(0.6) translateY(-40%);
        transform-origin: top;
        vertical-align: baseline;
      }

      /* Метод 4: псевдоэлементы - через :before/:after */
      .bottom-cut-pseudo {
        position: relative;
        display: inline-block;
        vertical-align: baseline;
      }

      .bottom-cut-pseudo:before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: var(--cut-height, 60%);
        background: white;
        z-index: 1;
      }

      .top-cut-pseudo {
        position: relative;
        display: inline-block;
        vertical-align: baseline;
      }

      .top-cut-pseudo:before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: var(--cut-height, 60%);
        background: white;
        z-index: 1;
      }

      /* Метод 5: CSS mask - маскирование */
      .bottom-cut-mask {
        display: inline-block;
        mask: linear-gradient(to bottom, transparent 0%, transparent 60%, black 60%, black 100%);
        -webkit-mask: linear-gradient(to bottom, transparent 0%, transparent 60%, black 60%, black 100%);
        vertical-align: baseline;
      }

      .top-cut-mask {
        display: inline-block;
        mask: linear-gradient(to bottom, black 0%, black 40%, transparent 40%, transparent 100%);
        -webkit-mask: linear-gradient(to bottom, black 0%, black 40%, transparent 40%, transparent 100%);
        vertical-align: baseline;
      }

      /* ОСНОВНОЙ МЕТОД - используется в продакшене */
      .bottom-cut {
        --cut-percentage: 60%;
        display: inline-block;
        clip-path: polygon(0% var(--cut-percentage), 100% var(--cut-percentage), 100% 100%, 0% 100%);
        vertical-align: baseline;
      }

      .top-cut {
        --cut-percentage: 40%;
        display: inline-block;
        clip-path: polygon(0% 0%, 100% 0%, 100% var(--cut-percentage), 0% var(--cut-percentage));
        vertical-align: baseline;
      }

      /* Стили для других трансформаций */
      .extra-letter {
        color: #888;
        font-weight: normal;
      }

      .mirror-text {
        transform: scaleX(-1);
        display: inline-block;
      }

      .rotated-text {
        transform: rotate(180deg);
        display: inline-block;
      }
    </style>
  `
}

// Главная функция генерации HTML
export function generateReadingTextHTML(params: ReadingTextParams): string {
  const typeNames: Record<string, string> = {
    'normal': 'Обычный текст',
    'bottom-cut': 'Текст с обрезанной нижней частью',
    'top-cut': 'Текст с обрезанной верхней частью',
    'missing-endings': 'Текст без окончаний',
    'missing-vowels': 'Текст без гласных букв',
    'partial-reversed': 'Текст с перевернутыми словами',
    'scrambled-words': 'Перепутанные слова',
    'merged-text': 'Слитный текст',
    'extra-letters': 'Текст с лишними буквами',
    'mirror-text': 'Зеркальный текст',
    'mixed-types': 'Смешанный тип',
    'word-ladder': 'Лесенка из слов'
  }

  // Проверяем, массив ли textType для многостраничной генерации
  if (Array.isArray(params.textType)) {
    return generateCSSBasedMultiPageHTML(params, typeNames)
  }

  // Однообразная генерация для одного типа
  return generateSinglePageHTML(params, typeNames)
}

// Функция для генерации одностраничного HTML
function generateSinglePageHTML(params: ReadingTextParams, typeNames: Record<string, string>): string {
  const textType = Array.isArray(params.textType) ? params.textType[0] : params.textType

  const transformedText = transformText(params.inputText, textType, {
    cutPercentage: params.cutPercentage,
    endingLength: params.endingLength,
    reversedWordCount: params.reversedWordCount,
    extraLetterDensity: params.extraLetterDensity,
    keepFirstLast: params.keepFirstLast,
    mixedMode: params.mixedMode,
    fontFamily: params.fontFamily,
    fontSize: params.fontSize
  })

  const words = params.inputText.trim().split(/\s+/).filter(w => w.length > 0)
  const title = params.hasTitle && params.title ? params.title : typeNames[textType] || 'Упражнение для чтения'

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  ${getCSS(params.fontSize, params.fontFamily)}
</head>
<body>
  ${params.hasTitle ? `<div class="title">${title}</div>` : ''}

  <div class="exercise-text">
    ${transformedText}
  </div>

  <div style="page-break-before: always;">
    <div class="title">Исходный текст</div>
    <div class="exercise-text">
      ${params.inputText}
    </div>
  </div>
</body>
</html>`
}

// Функция для вычисления приблизительной высоты текста
function calculateTextHeight(text: string, fontSize: string, fontFamily: string): number {
  // Мапинг размеров шрифтов в пикселях
  const fontSizeMap: Record<string, number> = {
    'super-huge': 40,
    'huge': 32,
    'extra-large': 24,
    'large': 18,
    'medium': 14,
    'small': 12,
    'tiny': 10
  }

  const fontSizePx = fontSizeMap[fontSize] || 14
  const lineHeight = 1.4 // уменьшено для более компактного текста
  const lineHeightPx = fontSizePx * lineHeight

  // Очистим HTML теги для подсчета символов, но учтем переносы строк
  const cleanText = text.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, 'X')

  // Более точная ширина символа с учетом кириллицы
  const charWidthMap: Record<string, number> = {
    'serif': 0.65,       // Times New Roman - шире для кириллицы
    'sans-serif': 0.58,  // Arial - немного шире
    'mono': 0.6,         // Courier
    'cursive': 0.7,      // Comic Sans
    'propisi': 0.75      // Propisi - самый широкий
  }

  const charWidthFactor = charWidthMap[fontFamily] || 0.58
  const avgCharWidth = fontSizePx * charWidthFactor

  // Увеличиваем доступную ширину контейнера для лучшего использования пространства
  // 210mm - 20mm padding - 6px border = примерно 720px
  const containerWidth = 720
  const charsPerLine = Math.floor(containerWidth / avgCharWidth)

  // Учитываем явные переносы строк (<br>)
  const explicitBreaks = (text.match(/<br\s*\/?>/gi) || []).length

  // Количество строк с учетом явных переносов
  const totalChars = cleanText.length
  const naturalLines = Math.ceil(totalChars / charsPerLine)
  const totalLines = naturalLines + explicitBreaks

  // Уменьшаем запас высоты до 5% для более эффективного использования пространства
  const calculatedHeight = totalLines * lineHeightPx
  return Math.ceil(calculatedHeight * 1.05)
}

// Функция для разделения текста на части по высоте
function splitTextByHeight(text: string, maxHeight: number, fontSize: string, fontFamily: string): string[] {
  // Для больших шрифтов используем более агрессивное разделение
  const fontSizeMap: Record<string, number> = {
    'super-huge': 40, 'huge': 32, 'extra-large': 24, 'large': 18, 'medium': 14
  }
  const fontSizePx = fontSizeMap[fontSize] || 14

  // Менее агрессивное разделение для больших шрифтов
  if (fontSizePx >= 24) {
    maxHeight = maxHeight * 0.9 // Используем 90% доступной высоты
  } else if (fontSizePx >= 18) {
    maxHeight = maxHeight * 0.95 // 95% для больших шрифтов
  }

  // Разделяем на предложения, но также добавляем разделение по запятым для длинных предложений
  const sentences = text.split(/([.!?]+\s*|,\s+)/).filter(s => s.trim() && s !== ',')
  const parts: string[] = []
  let currentPart = ''

  for (const sentence of sentences) {
    const testPart = currentPart + sentence
    const testHeight = calculateTextHeight(testPart, fontSize, fontFamily)

    if (testHeight > maxHeight && currentPart.length > 0) {
      // Текущая часть переполняется, сохраняем предыдущую и начинаем новую
      parts.push(currentPart.trim())
      currentPart = sentence
    } else {
      currentPart = testPart
    }
  }

  // Добавляем последнюю часть
  if (currentPart.trim()) {
    parts.push(currentPart.trim())
  }

  // Дополнительная проверка - если часть все еще слишком большая, разделяем по словам
  const finalParts: string[] = []
  for (const part of parts) {
    const partHeight = calculateTextHeight(part, fontSize, fontFamily)
    if (partHeight > maxHeight) {
      // Разделяем по словам
      const words = part.split(/(\s+)/)
      let wordPart = ''

      for (const word of words) {
        const testWordPart = wordPart + word
        const testWordHeight = calculateTextHeight(testWordPart, fontSize, fontFamily)

        if (testWordHeight > maxHeight && wordPart.length > 0) {
          finalParts.push(wordPart.trim())
          wordPart = word
        } else {
          wordPart = testWordPart
        }
      }

      if (wordPart.trim()) {
        finalParts.push(wordPart.trim())
      }
    } else {
      finalParts.push(part)
    }
  }

  return finalParts.length > 0 ? finalParts : [text] // fallback на весь текст если что-то пошло не так
}

// Функция для генерации многостраничного HTML
function generateMultiPageHTML(params: ReadingTextParams, typeNames: Record<string, string>): string {
  const textTypes = params.textType as string[]

  // Вычисляем доступную высоту для текста на странице
  // A4 высота = 297mm ≈ 1123px
  // Более консервативная оценка высот компонентов:
  // header (~120px), exercise-title (~80px), footer (~80px), padding (~60px)
  // Для первой страницы: минус source-text (~150px для больших шрифтов)

  // Увеличиваем доступную высоту для лучшего использования пространства
  // A4 высота = 297mm ≈ 1123px
  // header (~100px), exercise-title (~60px), footer (~60px), padding (~40px)
  const baseAvailableHeight = 1123 - 100 - 60 - 60 - 40 // ≈ 863px

  // Для первой страницы с исходным текстом
  const firstPageAvailableHeight = baseAvailableHeight - 120 // ≈ 743px для первой страницы

  const allPages: string[] = []
  let globalPageNumber = 1

  textTypes.forEach((textType, typeIndex) => {
    const transformedText = transformText(params.inputText, textType, {
      cutPercentage: params.cutPercentage,
      endingLength: params.endingLength,
      reversedWordCount: params.reversedWordCount,
      extraLetterDensity: params.extraLetterDensity,
      keepFirstLast: params.keepFirstLast,
      mixedMode: params.mixedMode,
      fontFamily: params.fontFamily,
      fontSize: params.fontSize
    })

    const pageTitle = typeNames[textType] || textType
    const isFirstTypeAndPage = typeIndex === 0

    // Для первой страницы используем меньшую доступную высоту
    const availableHeight = isFirstTypeAndPage ? firstPageAvailableHeight : baseAvailableHeight

    // Проверяем, нужно ли разделять текст
    const textHeight = calculateTextHeight(transformedText, params.fontSize, params.fontFamily)

    if (textHeight > availableHeight) {
      // Текст не помещается, разделяем на части
      const textParts = splitTextByHeight(transformedText, availableHeight, params.fontSize, params.fontFamily)

      textParts.forEach((textPart, partIndex) => {
        const isFirstPart = partIndex === 0
        const isOnlyPart = textParts.length === 1

        allPages.push(`
        <div class="page">
          <div class="header">
            <div class="brand-title">СКОРОЧТЕНИЕ</div>
            <div class="page-number">${globalPageNumber}</div>
          </div>

          <div class="exercise-title">${pageTitle}${textParts.length > 1 ? ` (часть ${partIndex + 1})` : ''}</div>

          ${isFirstTypeAndPage && isFirstPart ? `
          <div class="source-text">
            <div class="source-label">Прочитай исходный текст</div>
            ${params.inputText}
          </div>
          ` : ''}

          <div class="exercise-text">
            ${textPart}
          </div>

          <div class="footer">
            <div class="footer-brand">
              <div class="footer-logo">R</div>
              <span>Развитие ребёнка</span>
            </div>
          </div>
        </div>`)

        globalPageNumber++
      })
    } else {
      // Текст помещается на одну страницу
      allPages.push(`
      <div class="page">
        <div class="header">
          <div class="brand-title">СКОРОЧТЕНИЕ</div>
          <div class="page-number">${globalPageNumber}</div>
        </div>

        <div class="exercise-title">${pageTitle}</div>

        ${isFirstTypeAndPage ? `
        <div class="source-text">
          <div class="source-label">Прочитай исходный текст</div>
          ${params.inputText}
        </div>
        ` : ''}

        <div class="exercise-text">
          ${transformedText}
        </div>

        <div class="footer">
          <div class="footer-brand">
            <div class="footer-logo">R</div>
            <span>Развитие ребёнка</span>
          </div>
        </div>
      </div>`)

      globalPageNumber++
    }
  })

  const title = params.hasTitle && params.title ? params.title : `Многостраничное упражнение (${allPages.length} стр.)`

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  ${getMultiPageCSS(params.fontSize, params.fontFamily)}
</head>
<body>
  ${allPages.join('\n')}
</body>
</html>`
}

// CSS стили для многостраничного PDF
function getMultiPageCSS(fontSize: string = 'medium', fontFamily: string = 'sans-serif'): string {
  // Мапинг размеров шрифтов
  const fontSizeMap: Record<string, string> = {
    'super-huge': '40px',
    'huge': '32px',
    'extra-large': '24px',
    'large': '18px',
    'medium': '14px'
  }

  // Мапинг семейств шрифтов
  const fontFamilyMap: Record<string, string> = {
    'serif': '"Times New Roman", Times, serif',
    'sans-serif': '"Arial", "Helvetica", sans-serif',
    'mono': '"Courier New", Courier, monospace',
    'cursive': '"Comic Sans MS", cursive',
    'propisi': '"Propisi", "Kalam", "Comic Sans MS", cursive'
  }

  const cssSize = fontSizeMap[fontSize] || '14px'
  const cssFontFamily = fontFamilyMap[fontFamily] || '"Arial", "Helvetica", sans-serif'

  return `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&family=Comfortaa:wght@300;400;700&display=swap');

      @font-face {
        font-family: 'Propisi';
        src: url('/fonts/Propisi.TTF') format('truetype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }

      /* Базовые стили */
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: 'Arial', 'Helvetica', sans-serif;
        color: #000;
        background: white;
        overflow: hidden;
      }

      /* Страница */
      .page {
        width: 210mm;
        height: 297mm;
        position: relative;
        padding: 15mm;
        page-break-after: always;
        display: flex;
        flex-direction: column;
      }

      .page:last-child {
        page-break-after: avoid;
      }

      /* Хедер */
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 2px solid #333;
      }

      .brand-title {
        font-size: 36px;
        font-weight: bold;
        color: #2c3e50;
        letter-spacing: -1px;
      }

      .page-number {
        font-size: 48px;
        font-weight: 300;
        color: #95a5a6;
      }

      /* Подзаголовок упражнения */
      .exercise-title {
        font-size: 18px;
        color: #34495e;
        margin-bottom: 20px;
        padding-bottom: 8px;
        border-bottom: 1px solid #34495e;
        font-weight: 500;
      }

      /* Исходный текст (всегда стандартный) */
      .source-text {
        font-family: 'Arial', 'Helvetica', sans-serif !important;
        font-size: 14px !important;
        line-height: 1.6;
        margin-bottom: 30px;
        padding: 20px;
        border: 1px solid #bdc3c7;
        border-radius: 8px;
        background: #ecf0f1;
      }

      .source-label {
        font-weight: bold;
        margin-bottom: 10px;
        color: #34495e;
      }

      /* Упражнение */
      .exercise-text {
        font-family: ${cssFontFamily};
        font-size: ${cssSize};
        line-height: 1.8;
        flex-grow: 1;
        padding: 20px;
        border: 1px solid #bdc3c7;
        border-radius: 8px;
      }

      /* Футер */
      .footer {
        margin-top: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        padding-top: 20px;
        border-top: 1px solid #bdc3c7;
      }

      .footer-brand {
        display: flex;
        align-items: center;
        gap: 10px;
        color: #7f8c8d;
        font-size: 12px;
      }

      .footer-logo {
        width: 24px;
        height: 24px;
        background: linear-gradient(135deg, #3498db, #2980b9);
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
      }

      /* Специальные стили для упражнений */
      .bottom-cut-pseudo {
        position: relative;
        display: inline-block;
        overflow: hidden;
      }

      .bottom-cut-pseudo::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: var(--cut-height, 40%);
        background: white;
        z-index: 1;
      }

      .top-cut-pseudo {
        position: relative;
        display: inline-block;
        overflow: hidden;
      }

      .top-cut-pseudo::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: var(--cut-height, 40%);
        background: white;
        z-index: 1;
      }

      /* Стили для других трансформаций */
      .extra-letter {
        color: #888;
        font-weight: normal;
      }

      .mirror-text {
        transform: scaleX(-1);
        display: inline-block;
      }

      .rotated-text {
        transform: rotate(180deg);
        display: inline-block;
      }

      @media print {
        body {
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
        }
      }
    </style>
  `
}

// CSS-based многостраничная генерация - дает браузеру самому решать где делать page-break
function generateCSSBasedMultiPageHTML(params: ReadingTextParams, typeNames: Record<string, string>): string {
  const textTypes = params.textType as string[]
  const title = params.title || 'Упражнения на технику чтения'

  // Генерируем все упражнения подряд
  const exercises = textTypes.map((textType, index) => {
    const transformedText = transformText(params.inputText, textType, {
      cutPercentage: params.cutPercentage,
      endingLength: params.endingLength,
      reversedWordCount: params.reversedWordCount,
      extraLetterDensity: params.extraLetterDensity,
      keepFirstLast: params.keepFirstLast,
      mixedMode: params.mixedMode,
      fontFamily: params.fontFamily,
      fontSize: params.fontSize
    })

    const typeInfo = typeNames[textType] || textType
    const pageNumber = index + 1
    const isFirstPage = index === 0

    return `
    <div class="exercise-page">
      <div class="exercise-content">
        ${transformedText}
      </div>
    </div>`
  }).join('\n')

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  ${getCSSBasedStyles(params.fontSize, params.fontFamily)}
</head>
<body>
  ${exercises}
</body>
</html>`
}

// CSS стили с автоматическим page-break
function getCSSBasedStyles(fontSize: string = 'medium', fontFamily: string = 'sans-serif'): string {
  // Адаптивный line-height в зависимости от размера шрифта
  const getLineHeight = (size: string): string => {
    switch(size) {
      case 'super-huge':
      case 'huge': return '1.2'      // Для огромных шрифтов - очень компактно
      case 'extra-large':
      case 'large': return '1.3'     // Для больших - компактно
      case 'medium':
      default: return '1.4'          // Для средних и маленьких - стандартно
    }
  }

  // Мапинг размеров шрифтов
  const fontSizeMap: Record<string, string> = {
    'super-huge': '40px',
    'huge': '32px',
    'extra-large': '24px',
    'large': '18px',
    'medium': '14px',
    'small': '12px',
    'tiny': '10px'
  }

  // Мапинг шрифтов
  const fontFamilyMap: Record<string, string> = {
    'serif': '"Times New Roman", Times, serif',
    'sans-serif': '"Arial", "Helvetica", sans-serif',
    'mono': '"Courier New", Courier, monospace',
    'cursive': '"Comic Sans MS", cursive',
    'propisi': '"Propisi", "Kalam", "Comic Sans MS", cursive'
  }

  return `<style>
    @import url('https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&family=Comfortaa:wght@300;400;700&display=swap');

    @font-face {
      font-family: 'Propisi';
      src: url('file:///Users/zardes/Projects/childdev-cl/services/pdf/public/fonts/Propisi.TTF') format('truetype');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: ${fontFamilyMap[fontFamily] || fontFamilyMap['sans-serif']};
      color: #000;
      background: white;
    }

    /* Страница упражнения */
    .exercise-page {
      width: 210mm;
      min-height: 297mm;
      position: relative;
      padding: 10mm;
      page-break-after: always;
      display: flex;
      flex-direction: column;
    }

    .exercise-page:last-child {
      page-break-after: avoid;
    }

    /* Убираем хедер и заголовки для чистого дизайна */

    /* Контент упражнения - убираем рамки */
    .exercise-content {
      font-size: ${fontSizeMap[fontSize] || '14px'};
      line-height: ${getLineHeight(fontSize)};
      flex-grow: 1;
      padding: 0;
      margin: 0;
      box-sizing: border-box;
      word-wrap: break-word;
      overflow-wrap: break-word;

      /* Убираем принудительные переносы - используем целые слова */
      word-break: normal;
      hyphens: none;

      /* Увеличиваем межстрочный интервал для лучшей читаемости */
      line-height: 2.0;

      /* CSS для предотвращения переполнения */
      max-height: none;
      overflow: visible;
    }

    /* Дополнительные отступы между словами для вариантов с пропущенными буквами */
    .missing-letters-spacing {
      word-spacing: 1em;
    }

    /* Специальные стили для упражнений */
    .bottom-cut-pseudo {
      position: relative;
      display: inline-block;
      overflow: hidden;
    }

    .bottom-cut-pseudo::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 40%;
      background: white;
      z-index: 1;
    }

    .top-cut-pseudo {
      position: relative;
      display: inline-block;
      overflow: hidden;
    }

    .top-cut-pseudo::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 40%;
      background: white;
      z-index: 1;
    }

    .extra-letter {
      color: #888;
      font-weight: normal;
    }

    .mirror-text {
      transform: scaleX(-1);
      display: inline-block;
    }

    .merged-text {
      word-break: break-all;
      overflow-wrap: anywhere;
      hyphens: none;
    }

    @media print {
      body {
        -webkit-print-color-adjust: exact;
        color-adjust: exact;
      }

      .exercise-page {
        page-break-inside: avoid;
      }
    }
  </style>`
}