import { ReadingTextType, TextCase } from '../types'

// Константы для работы с кириллицей
const CYRILLIC_VOWELS = ['а', 'е', 'ё', 'и', 'о', 'у', 'ы', 'э', 'ю', 'я']
const CYRILLIC_CONSONANTS = [
  'б', 'в', 'г', 'д', 'ж', 'з', 'й', 'к', 'л', 'м', 'н', 'п', 'р', 'с', 'т', 'ф', 'х', 'ц', 'ч', 'ш', 'щ'
]
const RANDOM_LETTERS = [...CYRILLIC_VOWELS, ...CYRILLIC_CONSONANTS]

interface TransformationOptions {
  cutPercentage?: number
  endingLength?: number
  reversedWordCount?: number
  extraLetterDensity?: number
  keepFirstLast?: boolean
  mixedMode?: 'sentence' | 'word'
  textCase?: TextCase
}

export class TextTransformer {
  /**
   * Главная функция трансформации текста
   */
  static transform(
    text: string,
    type: ReadingTextType,
    options: TransformationOptions = {}
  ): string {
    let result = text.trim()

    // Применяем трансформацию в зависимости от типа
    switch (type) {
      case 'normal':
        result = this.normalText(result)
        break

      case 'bottom-cut':
        result = this.bottomCutText(result, options.cutPercentage || 40)
        break

      case 'top-cut':
        result = this.topCutText(result, options.cutPercentage || 40)
        break

      case 'missing-endings':
        result = this.missingEndingsText(result, options.endingLength || 2)
        break

      case 'missing-vowels':
        result = this.missingVowelsText(result)
        break

      case 'partial-reversed':
        result = this.partialReversedText(result, options.reversedWordCount || 2)
        break

      case 'scrambled-words':
        result = this.scrambledWordsText(result)
        break

      case 'merged-text':
        result = this.mergedText(result)
        break

      case 'extra-letters':
        result = this.extraLettersText(result, options.extraLetterDensity || 30)
        break

      case 'mirror-text':
        result = this.mirrorText(result)
        break

      case 'word-ladder':
        result = this.wordLadderText(result)
        break

      case 'mixed-types':
        result = this.mixedTypesText(result, options)
        break

      default:
        result = this.normalText(result)
    }

    // Применяем регистр
    if (options.textCase) {
      result = this.applyTextCase(result, options.textCase)
    }

    return result
  }

  /**
   * 1. Обычный текст - без изменений
   */
  private static normalText(text: string): string {
    return text
  }

  /**
   * 2. Текст с обрезанной нижней частью
   * Реализация через CSS будет в шаблоне
   */
  private static bottomCutText(text: string, percentage: number): string {
    // Используем псевдоэлементы для стабильной работы в PDF
    return `<span class="bottom-cut-pseudo">${text}</span>`
  }

  /**
   * 3. Текст с обрезанной верхней частью
   */
  private static topCutText(text: string, percentage: number): string {
    return `<span class="top-cut-pseudo">${text}</span>`
  }

  /**
   * 4. Текст без окончаний (1-2 буквы)
   */
  private static missingEndingsText(text: string, endingLength: number): string {
    const words = text.split(/(\s+|[.,!?;:])/)

    return words.map(word => {
      // Обрабатываем только слова (не пробелы и знаки препинания)
      if (!/^[а-яё]+$/i.test(word) || word.length <= endingLength + 1) {
        return word
      }

      // Убираем последние буквы и добавляем подчеркивания
      const truncated = word.slice(0, -endingLength)
      const underscores = '_'.repeat(endingLength)
      return truncated + underscores
    }).join('')
  }

  /**
   * 5. Текст с пропущенными гласными
   */
  private static missingVowelsText(text: string): string {
    return text.replace(/[аеёиоуыэюя]/gi, '_')
  }

  /**
   * 6. Текст с частично перевернутыми словами
   */
  private static partialReversedText(text: string, reversedCount: number): string {
    const words = text.split(/(\s+|[.,!?;:])/)
    const wordIndices: number[] = []

    // Находим индексы слов (не пробелов и знаков препинания)
    words.forEach((word, index) => {
      if (/^[а-яё]+$/i.test(word)) {
        wordIndices.push(index)
      }
    })

    // Случайно выбираем слова для переворота
    const toReverse = this.getRandomIndices(wordIndices, Math.min(reversedCount, wordIndices.length))

    return words.map((word, index) => {
      if (toReverse.includes(index)) {
        return word.split('').reverse().join('')
      }
      return word
    }).join('')
  }

  /**
   * 7. Анаграммы - буквы в хаотичном порядке
   */
  private static scrambledWordsText(text: string): string {
    const words = text.split(/(\s+|[.,!?;:])/)

    return words.map(word => {
      if (/^[а-яё]+$/i.test(word) && word.length > 3) {
        return this.shuffleString(word)
      }
      return word
    }).join('')
  }

  /**
   * 8. Слитный текст
   */
  private static mergedText(text: string): string {
    // Удаляем пробелы, но сохраняем знаки препинания
    return text.replace(/\s+/g, '')
  }

  /**
   * 9. Текст с дополнительными буквами
   */
  private static extraLettersText(text: string, density: number): string {
    const chars = text.split('')
    const result: string[] = []

    chars.forEach(char => {
      result.push(char)

      // Добавляем случайную букву с заданной вероятностью
      if (/[а-яё]/i.test(char) && Math.random() * 100 < density) {
        const randomLetter = RANDOM_LETTERS[Math.floor(Math.random() * RANDOM_LETTERS.length)]
        result.push(`<span class="extra-letter">${randomLetter}</span>`)
      }
    })

    return result.join('')
  }

  /**
   * 10. Зеркальный текст
   */
  private static mirrorText(text: string): string {
    // Переворачиваем весь текст, но сохраняем направление букв через CSS
    const reversed = text.split('').reverse().join('')
    return `<span class="mirror-text">${reversed}</span>`
  }

  /**
   * 12. Лесенка из слов
   */
  private static wordLadderText(text: string): string {
    const words = text.split(/\s+/).filter(w => /^[а-яё]+$/i.test(w))
    const lines: string[] = []

    let currentPhrase = ''
    words.forEach(word => {
      currentPhrase += (currentPhrase ? ' ' : '') + word
      lines.push(currentPhrase)
    })

    return lines.join('<br>')
  }

  /**
   * 11. Смешанный тип - комбинация разных трансформаций
   */
  private static mixedTypesText(text: string, options: TransformationOptions): string {
    const mode = options.mixedMode || 'sentence'

    if (mode === 'sentence') {
      return this.processMixedBySentence(text, options)
    } else {
      return this.processMixedByWord(text, options)
    }
  }

  /**
   * Смешанный тип по предложениям - каждое предложение использует свой тип
   */
  private static processMixedBySentence(text: string, options: TransformationOptions): string {
    const sentences = text.split(/([.!?]+\s*)/).filter(s => s.trim())

    // Трансформации для предложений (merged-text и mirror-text применяются ко всему предложению)
    const sentenceTransformations: ReadingTextType[] = [
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
        const transformed = this.transform(sentence, transformationType, safeOptions)
        result += transformed + punctuation + ' '
        sentenceIndex++
      } else if (punctuation.trim()) {
        result += punctuation + ' '
      }
    }

    return result.trim()
  }

  /**
   * Смешанный тип по словам - максимальная сложность
   */
  private static processMixedByWord(text: string, options: TransformationOptions): string {
    // Сначала разбиваем на предложения для "целых" трансформаций
    const sentences = text.split(/([.!?]+\s*)/).filter(s => s.trim())

    // Трансформации: часть применяется к словам, часть к предложениям
    const allTransformations: ReadingTextType[] = [
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
          const transformed = this.transform(sentence, transformationType, safeOptions)
          result += transformed + punctuation + ' '
        } else {
          // Применяем трансформацию к каждому слову в предложении
          const words = sentence.split(/(\s+)/)
          const transformedWords = words.map((part) => {
            if (/^[а-яё]+$/i.test(part) && part.length > 2) {
              const safeOptions = { ...options, mixedMode: undefined }
              return this.transform(part, transformationType, safeOptions)
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

  /**
   * Применение регистра текста
   */
  private static applyTextCase(text: string, textCase: TextCase): string {
    switch (textCase) {
      case 'upper':
        return text.toUpperCase()
      case 'lower':
        return text.toLowerCase()
      case 'mixed':
      default:
        return text
    }
  }

  /**
   * Вспомогательные функции
   */
  private static shuffleString(str: string): string {
    const arr = str.split('')
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr.join('')
  }

  private static getRandomIndices(array: number[], count: number): number[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }

  /**
   * Получение CSS стилей для трансформаций
   */
  static getTransformationStyles(): string {
    return `
      .bottom-cut {
        display: inline-block;
        clip-path: polygon(0% 60%, 100% 60%, 100% 100%, 0% 100%);
        vertical-align: baseline;
      }

      .top-cut {
        display: inline-block;
        clip-path: polygon(0% 0%, 100% 0%, 100% 40%, 0% 40%);
        vertical-align: baseline;
      }

      .extra-letter {
        color: #888;
        font-weight: normal;
      }

      .mirror-text {
        transform: scaleX(-1);
        display: inline-block;
      }
    `
  }
}