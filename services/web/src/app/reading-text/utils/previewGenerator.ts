import { ReadingTextType, TextCase } from '../types'

/**
 * Генерирует превью текста с применением трансформации (упрощенная версия для быстрого показа)
 */
export function generatePreviewText(
  inputText: string,
  textType: ReadingTextType | ReadingTextType[],
  textCase: TextCase
): string {
  if (!inputText || !inputText.trim()) {
    return 'Введите текст для предварительного просмотра...'
  }

  // Берем первые 50 символов для превью
  const previewText = inputText.slice(0, 50).trim()

  // Если textType - массив, берем первый элемент для превью
  const primaryType = Array.isArray(textType) ? textType[0] : textType

  let result = applySimpleTransformation(previewText, primaryType)

  // Применяем регистр
  result = applyTextCase(result, textCase)

  return result + (inputText.length > 50 ? '...' : '')
}

/**
 * Применяет упрощенную версию трансформации для быстрого превью
 */
function applySimpleTransformation(text: string, type: ReadingTextType): string {
  switch (type) {
    case 'normal':
      return text

    case 'missing-vowels':
      return text.replace(/[аеёиоуыэюя]/gi, '_')

    case 'missing-consonants':
      return text.replace(/[бвгджзйклмнпрстфхцчшщ]/gi, '_')

    case 'missing-endings':
      return text.replace(/\b\w+\b/g, (word) => {
        if (word.length <= 3) return word
        return word.slice(0, -2) + '__'
      })

    case 'scrambled-words':
      return text.replace(/\b[а-яёА-ЯЁ]{3,}\b/g, (word) => {
        const chars = word.split('')
        // Простое перемешивание для превью (не полноценное)
        if (chars.length > 3) {
          const middle = chars.slice(1, -1)
          const shuffled = middle.sort(() => Math.random() - 0.5)
          return chars[0] + shuffled.join('') + chars[chars.length - 1]
        }
        return word
      })

    case 'bottom-cut':
      return `<span class="bottom-cut-preview">${text}</span>`

    case 'top-cut':
      return `<span class="top-cut-preview">${text}</span>`

    case 'mirror-text':
      return `<span class="mirror-text-preview">${text}</span>`

    case 'extra-letters':
      return text.replace(/\b\w+\b/g, (word) => {
        if (word.length < 3) return word
        // Добавляем случайную букву в середину
        const mid = Math.floor(word.length / 2)
        const extra = 'б' // Простая буква для превью
        return word.slice(0, mid) + extra + word.slice(mid)
      })

    case 'word-ladder':
      return text.replace(/\s+/g, '\n') // Простое превью - каждое слово с новой строки

    case 'merged-text':
      return text.replace(/\s+/g, '') // Убираем пробелы

    case 'partial-reversed':
      const words = text.split(/\s+/)
      return words.map((word, index) =>
        index % 2 === 0 ? word : word.split('').reverse().join('')
      ).join(' ')

    case 'mixed-types':
      // Для превью применяем missing-vowels
      return text.replace(/[аеёиоуыэюя]/gi, '_')

    default:
      return text
  }
}

/**
 * Применяет регистр к тексту
 */
function applyTextCase(text: string, textCase: TextCase): string {
  switch (textCase) {
    case 'upper':
      return text.toUpperCase()
    case 'lower':
      return text.toLowerCase()
    case 'mixed':
      return text // Смешанный регистр оставляем как есть
    default:
      return text
  }
}

/**
 * Получает описание трансформации для UI
 */
export function getTransformationDescription(type: ReadingTextType): string {
  switch (type) {
    case 'normal':
      return 'Обычный текст без изменений'
    case 'missing-vowels':
      return 'Пропущены гласные буквы (а, е, ё, и, о, у, ы, э, ю, я)'
    case 'missing-consonants':
      return 'Пропущены согласные буквы'
    case 'missing-endings':
      return 'Пропущены окончания слов (последние 1-2 буквы)'
    case 'scrambled-words':
      return 'Перемешаны буквы в словах (первая и последняя остаются)'
    case 'bottom-cut':
      return 'Обрезана нижняя часть букв'
    case 'top-cut':
      return 'Обрезана верхняя часть букв'
    case 'mirror-text':
      return 'Зеркальный текст (отражен по горизонтали)'
    case 'extra-letters':
      return 'Добавлены лишние буквы в слова'
    case 'word-ladder':
      return 'Слова расположены вертикально (лесенкой)'
    case 'merged-text':
      return 'Слова слиты вместе (без пробелов)'
    case 'partial-reversed':
      return 'Некоторые слова написаны задом наперед'
    case 'mixed-types':
      return 'Смешанные типы трансформаций'
    default:
      return 'Неизвестный тип трансформации'
  }
}