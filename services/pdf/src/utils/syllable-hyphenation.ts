/**
 * Система переносов по слогам для русского языка
 * Соблюдает правила:
 * - Перенос только по слогам
 * - Запрет переноса одной буквы
 * - Учет особенностей кириллицы
 */

const VOWELS = 'аеёиоуыэюя'
const CONSONANTS = 'бвгджзйклмнпрстфхцчшщ'
const SOFT_SIGN = 'ь'
const HARD_SIGN = 'ъ'

interface SyllableBreakpoint {
  position: number
  canBreak: boolean
  reason?: string
}

export class SyllableHyphenator {
  /**
   * Разбивает слово на слоги
   */
  static divideBySyllables(word: string): string[] {
    if (!word || word.length < 2) {
      return [word]
    }

    const cleanWord = word.toLowerCase().replace(/[^а-яё]/g, '')
    if (cleanWord.length < 2) {
      return [word]
    }

    const syllables: string[] = []
    let currentSyllable = ''

    for (let i = 0; i < cleanWord.length; i++) {
      const char = cleanWord[i]
      currentSyllable += char

      // Проверяем, нужно ли начать новый слог
      if (this.shouldStartNewSyllable(cleanWord, i)) {
        syllables.push(currentSyllable)
        currentSyllable = ''
      }
    }

    // Добавляем последний слог
    if (currentSyllable) {
      syllables.push(currentSyllable)
    }

    // Если слогов не получилось, возвращаем исходное слово
    return syllables.length > 0 ? syllables : [word]
  }

  /**
   * Находит возможные места переноса в слове
   */
  static findHyphenationPoints(word: string): SyllableBreakpoint[] {
    if (!word || word.length < 4) {
      return [] // Слишком короткие слова не переносим
    }

    const syllables = this.divideBySyllables(word)
    const breakpoints: SyllableBreakpoint[] = []

    let position = 0
    for (let i = 0; i < syllables.length - 1; i++) {
      position += syllables[i].length

      // Проверяем правила переноса
      const canBreak = this.canHyphenateAt(word, position, syllables, i)
      breakpoints.push({
        position,
        canBreak,
        reason: canBreak ? undefined : this.getHyphenationBlockReason(word, position, syllables, i)
      })
    }

    return breakpoints
  }

  /**
   * Переносит текст с учетом правил слогоделения
   */
  static hyphenateText(text: string, maxLineLength: number): string[] {
    const words = text.split(/(\s+)/)
    const lines: string[] = []
    let currentLine = ''

    for (const word of words) {
      // Если это пробел или знак препинания, просто добавляем
      if (!/[а-яё]/i.test(word)) {
        if (currentLine.length + word.length <= maxLineLength) {
          currentLine += word
        } else {
          if (currentLine.trim()) {
            lines.push(currentLine.trim())
          }
          currentLine = word
        }
        continue
      }

      // Если слово помещается в текущую строку
      if (currentLine.length + word.length <= maxLineLength) {
        currentLine += word
        continue
      }

      // Нужно перенести слово
      const breakpoints = this.findHyphenationPoints(word)
      const validBreakpoints = breakpoints.filter(bp => bp.canBreak)

      if (validBreakpoints.length === 0) {
        // Слово нельзя перенести - выносим на новую строку
        if (currentLine.trim()) {
          lines.push(currentLine.trim())
        }
        currentLine = word
        continue
      }

      // Находим лучшую точку переноса
      const bestBreakpoint = this.findBestBreakpoint(
        word,
        validBreakpoints,
        maxLineLength - currentLine.length
      )

      if (bestBreakpoint) {
        const firstPart = word.substring(0, bestBreakpoint.position) + '-'
        const secondPart = word.substring(bestBreakpoint.position)

        currentLine += firstPart
        lines.push(currentLine.trim())
        currentLine = secondPart
      } else {
        // Не удалось найти подходящую точку переноса
        if (currentLine.trim()) {
          lines.push(currentLine.trim())
        }
        currentLine = word
      }
    }

    if (currentLine.trim()) {
      lines.push(currentLine.trim())
    }

    return lines
  }

  /**
   * Проверяет, нужно ли начать новый слог
   */
  private static shouldStartNewSyllable(word: string, position: number): boolean {
    if (position >= word.length - 1) return false

    const current = word[position]
    const next = word[position + 1]

    // Правило: после гласной начинается новый слог
    if (this.isVowel(current) && this.isConsonant(next)) {
      return true
    }

    // Правило: между согласными, если далее идет гласная
    if (this.isConsonant(current) && this.isConsonant(next)) {
      const afterNext = word[position + 2]
      if (afterNext && this.isVowel(afterNext)) {
        return true
      }
    }

    return false
  }

  /**
   * Проверяет, можно ли делать перенос в данной позиции
   */
  private static canHyphenateAt(
    word: string,
    position: number,
    syllables: string[],
    syllableIndex: number
  ): boolean {
    // Правило 1: Нельзя оставлять одну букву
    if (position <= 1 || position >= word.length - 1) {
      return false
    }

    // Правило 2: Нельзя переносить одну букву на следующую строку
    const beforeBreak = syllables.slice(0, syllableIndex + 1).join('')
    const afterBreak = syllables.slice(syllableIndex + 1).join('')

    if (beforeBreak.length <= 1 || afterBreak.length <= 1) {
      return false
    }

    // Правило 3: Ь и Ъ не отрываются от предыдущей буквы
    const charBefore = word[position - 1]
    const charAt = word[position]

    if (charAt === SOFT_SIGN || charAt === HARD_SIGN) {
      return false
    }

    if (charBefore === SOFT_SIGN || charBefore === HARD_SIGN) {
      return false
    }

    // Правило 4: Некоторые сочетания не разрываются
    const twoCharsBefore = word.substring(position - 2, position)
    const twoCharsAfter = word.substring(position, position + 2)

    // Не разрываем сочетания типа "ст", "сп", "ск" и т.д.
    const unbreakablePairs = ['ст', 'сп', 'ск', 'сл', 'см', 'сн', 'св', 'тр', 'пр', 'кр', 'бр', 'гр', 'др']
    if (unbreakablePairs.includes(twoCharsAfter.toLowerCase())) {
      return false
    }

    return true
  }

  /**
   * Находит лучшую точку переноса для заданной длины строки
   */
  private static findBestBreakpoint(
    word: string,
    breakpoints: SyllableBreakpoint[],
    availableSpace: number
  ): SyllableBreakpoint | null {
    // Ищем последнюю точку переноса, которая помещается в доступное место
    for (let i = breakpoints.length - 1; i >= 0; i--) {
      const breakpoint = breakpoints[i]
      const firstPartLength = breakpoint.position + 1 // +1 для дефиса

      if (firstPartLength <= availableSpace) {
        return breakpoint
      }
    }

    return null
  }

  /**
   * Возвращает причину, почему нельзя делать перенос в данной позиции
   */
  private static getHyphenationBlockReason(
    word: string,
    position: number,
    syllables: string[],
    syllableIndex: number
  ): string {
    if (position <= 1) {
      return 'Нельзя оставлять одну букву'
    }

    if (position >= word.length - 1) {
      return 'Нельзя переносить одну букву'
    }

    const charAt = word[position]
    if (charAt === SOFT_SIGN || charAt === HARD_SIGN) {
      return 'Ь и Ъ не отрываются от предыдущей буквы'
    }

    return 'Нарушение правил слогоделения'
  }

  /**
   * Вспомогательные методы
   */
  private static isVowel(char: string): boolean {
    return VOWELS.includes(char.toLowerCase())
  }

  private static isConsonant(char: string): boolean {
    return CONSONANTS.includes(char.toLowerCase())
  }

  /**
   * Проверяет корректность разбивки на слоги
   */
  static validateSyllableBreaking(word: string, syllables: string[]): boolean {
    // Проверяем, что слоги образуют исходное слово
    const reconstructed = syllables.join('')
    if (reconstructed.toLowerCase() !== word.toLowerCase()) {
      return false
    }

    // Проверяем, что каждый слог содержит гласную (кроме последнего)
    for (let i = 0; i < syllables.length - 1; i++) {
      const syllable = syllables[i].toLowerCase()
      if (!Array.from(syllable).some(char => this.isVowel(char))) {
        return false
      }
    }

    return true
  }
}