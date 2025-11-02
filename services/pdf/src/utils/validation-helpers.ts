// Общие валидаторы для PDF генераторов

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

// Валидация текста
export function validateInputText(
  text: string | undefined,
  maxLength: number,
  fieldName = 'Текст'
): string[] {
  const errors: string[] = []

  if (!text || text.trim().length === 0) {
    errors.push(`${fieldName} не может быть пустым`)
  }

  if (text && text.length > maxLength) {
    errors.push(`${fieldName} слишком длинный (максимум ${maxLength} символов)`)
  }

  return errors
}

// Валидация размера шрифта
export function validateFontSize(
  fontSize: string,
  allowedSizes: string[]
): string[] {
  const errors: string[] = []

  if (!allowedSizes.includes(fontSize)) {
    errors.push('Неверный размер шрифта')
  }

  return errors
}

// Валидация семейства шрифта
export function validateFontFamily(fontFamily: string): string[] {
  const errors: string[] = []
  const validFontFamilies = ['serif', 'sans-serif', 'mono', 'cursive', 'propisi']

  if (!validFontFamilies.includes(fontFamily)) {
    errors.push('Неверное семейство шрифта')
  }

  return errors
}

// Валидация регистра текста
export function validateTextCase(textCase: string): string[] {
  const errors: string[] = []
  const validTextCases = ['upper', 'lower', 'mixed']

  if (!validTextCases.includes(textCase)) {
    errors.push('Неверный регистр текста')
  }

  return errors
}

// Валидация значения из списка
export function validateFromList(
  value: string,
  allowedValues: string[],
  errorMessage: string
): string[] {
  const errors: string[] = []

  if (!allowedValues.includes(value)) {
    errors.push(errorMessage)
  }

  return errors
}

// Валидация числового диапазона
export function validateNumberRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): string[] {
  const errors: string[] = []

  if (value < min || value > max) {
    errors.push(`${fieldName} должно быть между ${min} и ${max}`)
  }

  return errors
}

// Валидация параметров прописей
export function validateHandwritingParameters(params: any): string[] {
  const errors: string[] = []

  // Валидация типа строк
  const validLineTypes = ['narrow-with-diagonal', 'narrow-simple', 'regular']
  if (!validLineTypes.includes(params.lineType)) {
    errors.push('Неверный тип строк')
  }

  // Валидация размера шрифта для прописей
  const validFontSizes = ['medium', 'large']
  if (!validFontSizes.includes(params.fontSize)) {
    errors.push('Неверный размер шрифта для прописей')
  }

  // Валидация стиля текста
  const validTextStyles = ['solid-gray', 'dashed-gray']
  if (!validTextStyles.includes(params.textStyle)) {
    errors.push('Неверный стиль текста')
  }

  return errors
}

// Константы для общих наборов значений
export const COMMON_FONT_SIZES = {
  COPY_TEXT: ['medium', 'large', 'extra-large'],
  READING_TEXT: ['super-huge', 'huge', 'extra-large', 'large', 'medium'],
  HANDWRITING: ['medium', 'large'],
  ALL: ['super-huge', 'huge', 'extra-large', 'large', 'medium']
}

export const FONT_FAMILIES = ['serif', 'sans-serif', 'mono', 'cursive', 'propisi']
export const TEXT_CASES = ['upper', 'lower', 'mixed']
export const LINE_SPACINGS = ['1.25', '1.5', '1.75']
export const HANDWRITING_LINE_TYPES = ['narrow-with-diagonal', 'narrow-simple', 'regular']
export const HANDWRITING_TEXT_STYLES = ['solid-gray', 'dashed-gray']