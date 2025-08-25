import { TextCase } from '../types'

export function applyTextCase(text: string, textCase: TextCase): string {
  switch (textCase) {
    case 'upper':
      return text.toUpperCase()
    case 'lower':
      return text.toLowerCase()
    case 'mixed':
      // Первая буква заглавная, остальные строчные
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
    default:
      return text.toUpperCase()
  }
}

export function formatWordsList(words: string[], separator: string = ', '): string {
  return words.join(separator)
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9а-яё\-_]/gi, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase()
}