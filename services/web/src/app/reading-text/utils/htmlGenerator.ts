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
      const words = text.split(/(\s+|[.,!?;:])/)

      // Обрабатываем только кириллические слова - каждое второе
      let wordIndex = 0
      return words.map((part) => {
        // Проверяем, является ли часть словом (кириллица)
        if (/^[а-яё]+$/i.test(part) && part.length > endingLength + 1) {
          wordIndex++
          const shouldProcess = wordIndex % 2 === 0 // каждое второе слово

          if (shouldProcess) {
            const truncated = part.slice(0, -endingLength)
            const underscores = '_'.repeat(endingLength)
            return truncated + underscores
          }
        }

        return part // оставляем как есть (слово или разделитель)
      }).join('')

    case 'missing-vowels':
      return text.replace(/[аеёиоуыэюя]/gi, '_')

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
      // Убираем пробелы между словами, но сохраняем знаки препинания
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
      // Разбиваем текст на предложения по знакам препинания
      const sentences = text.split(/([.!?]+)/).filter(s => s.trim())
      const mirroredSentences: string[] = []

      for (let i = 0; i < sentences.length; i += 2) {
        const sentence = sentences[i]
        const punctuation = sentences[i + 1] || ''

        if (sentence.trim()) {
          const mirrored = mirrorSentence(sentence.trim())
          mirroredSentences.push(mirrored + punctuation)
        } else if (punctuation) {
          // Если есть только знаки препинания без предложения
          mirroredSentences.push(punctuation)
        }
      }

      return `<span class="mirror-text">${mirroredSentences.join(' ')}</span>`

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

// Функция для зеркального отражения предложения с сохранением заглавной буквы
function mirrorSentence(sentence: string): string {
  if (!sentence.trim()) return sentence

  // Убираем лишние пробелы
  const trimmed = sentence.trim()

  // Проверяем, начинается ли с заглавной буквы
  const isCapitalized = /^[А-ЯЁ]/.test(trimmed)

  // Переворачиваем всё предложение
  const reversed = trimmed.split('').reverse().join('')

  if (isCapitalized) {
    // Делаем первую букву заглавной, остальные строчными
    return reversed.charAt(0).toUpperCase() + reversed.slice(1).toLowerCase()
  } else {
    return reversed.toLowerCase()
  }
}

// CSS стили для PDF
function getCSS(): string {
  return `
    <style>
      body {
        font-family: Arial, sans-serif;
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
        font-size: 14pt;
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
  const transformedText = transformText(params.inputText, params.textType, {
    cutPercentage: params.cutPercentage,
    endingLength: params.endingLength,
    reversedWordCount: params.reversedWordCount,
    extraLetterDensity: params.extraLetterDensity,
    keepFirstLast: params.keepFirstLast
  })

  const words = params.inputText.trim().split(/\\s+/).filter(w => w.length > 0)

  const typeNames: Record<string, string> = {
    'normal': 'Обычный текст',
    'bottom-cut': 'Текст с обрезанной нижней частью',
    'top-cut': 'Текст с обрезанной верхней частью',
    'missing-endings': 'Текст без окончаний',
    'missing-vowels': 'Текст без гласных букв',
    'partial-reversed': 'Текст с перевернутыми словами',
    'scrambled-words': 'Анаграммы',
    'merged-text': 'Слитный текст',
    'extra-letters': 'Текст с лишними буквами',
    'mirror-text': 'Зеркальный текст',
    'mixed-types': 'Смешанный тип',
    'word-ladder': 'Лесенка из слов'
  }

  const title = params.hasTitle && params.title ? params.title : typeNames[params.textType] || 'Упражнение для чтения'

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  ${getCSS()}
</head>
<body>
  ${params.hasTitle ? `<div class="title">${title}</div>` : ''}

  <div class="metadata">
    <p>Тип: ${typeNames[params.textType] || params.textType} | Слов: ${words.length} | Размер шрифта: ${params.fontSize}</p>
  </div>

  <div style="margin: 10px 0;">
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