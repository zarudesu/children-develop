import { ReadingTextGenerator } from './reading-text-generator'
import { ReadingTextParams } from '../types'

describe('ReadingTextGenerator', () => {
  let generator: ReadingTextGenerator

  beforeEach(() => {
    generator = new ReadingTextGenerator()
  })

  describe('validateParams', () => {
    it('should return no errors for valid params', () => {
      const validParams: ReadingTextParams = {
        textType: 'normal',
        inputText: 'Тестовый текст для проверки',
        fontSize: 'medium',
        fontFamily: 'sans-serif',
        textCase: 'mixed'
      }

      const errors = generator.validateParams(validParams)
      expect(errors).toHaveLength(0)
    })

    it('should return error for empty input text', () => {
      const invalidParams: ReadingTextParams = {
        textType: 'normal',
        inputText: '',
        fontSize: 'medium',
        fontFamily: 'sans-serif',
        textCase: 'mixed'
      }

      const errors = generator.validateParams(invalidParams)
      expect(errors).toContain('Входной текст не может быть пустым')
    })

    it('should return error for text that is too long', () => {
      const invalidParams: ReadingTextParams = {
        textType: 'normal',
        inputText: 'А'.repeat(5001), // Too long
        fontSize: 'medium',
        fontFamily: 'sans-serif',
        textCase: 'mixed'
      }

      const errors = generator.validateParams(invalidParams)
      expect(errors).toContain('Текст слишком длинный (максимум 5000 символов)')
    })

    it('should return error for invalid font size', () => {
      const invalidParams: ReadingTextParams = {
        textType: 'normal',
        inputText: 'Тестовый текст',
        fontSize: 'invalid' as any,
        fontFamily: 'sans-serif',
        textCase: 'mixed'
      }

      const errors = generator.validateParams(invalidParams)
      expect(errors).toContain('Неверный размер шрифта')
    })

    it('should return error for invalid text type', () => {
      const invalidParams: ReadingTextParams = {
        textType: 'invalid' as any,
        inputText: 'Тестовый текст',
        fontSize: 'medium',
        fontFamily: 'sans-serif',
        textCase: 'mixed'
      }

      const errors = generator.validateParams(invalidParams)
      expect(errors).toContain('Неверный тип текста: invalid')
    })

    it('should validate array of text types', () => {
      const validParams: ReadingTextParams = {
        textType: ['normal', 'bottom-cut'],
        inputText: 'Тестовый текст',
        fontSize: 'medium',
        fontFamily: 'sans-serif',
        textCase: 'mixed'
      }

      const errors = generator.validateParams(validParams)
      expect(errors).toHaveLength(0)
    })

    it('should validate cut percentage range', () => {
      const invalidParams: ReadingTextParams = {
        textType: 'bottom-cut',
        inputText: 'Тестовый текст',
        fontSize: 'medium',
        fontFamily: 'sans-serif',
        textCase: 'mixed',
        cutPercentage: 95 // Too high
      }

      const errors = generator.validateParams(invalidParams)
      expect(errors).toContain('Процент обрезания должен быть от 10 до 90')
    })
  })

  describe('generateTemplateData', () => {
    it('should generate correct template data for normal text', () => {
      const params: ReadingTextParams = {
        textType: 'normal',
        inputText: 'Привет мир! Это тестовый текст.',
        fontSize: 'large',
        fontFamily: 'serif',
        textCase: 'mixed',
        title: 'Тестовое упражнение',
        centerTitle: true,
        pageNumbers: true,
        includeInstructions: true
      }

      const templateData = generator.generateTemplateData(params)

      expect(templateData.type).toBe('normal')
      expect(templateData.title).toBe('Тестовое упражнение')
      expect(templateData.centerTitle).toBe(true)
      expect(templateData.originalText).toBe(params.inputText)
      expect(templateData.fontSize).toBe('large')
      expect(templateData.fontFamily).toBe('serif')
      expect(templateData.pageNumbers).toBe(true)
      expect(templateData.includeInstructions).toBe(true)
      expect(templateData.metadata.wordsCount).toBe(5) // "Привет мир! Это тестовый текст."
      expect(templateData.metadata.charactersCount).toBe(params.inputText.length)
      expect(templateData.metadata.difficulty).toBe('easy')
    })

    it('should generate default title when not provided', () => {
      const params: ReadingTextParams = {
        textType: 'bottom-cut',
        inputText: 'Тестовый текст',
        fontSize: 'medium',
        fontFamily: 'sans-serif',
        textCase: 'mixed'
      }

      const templateData = generator.generateTemplateData(params)
      expect(templateData.title).toBe('Упражнение: Текст без нижней части')
    })

    it('should generate default instructions when not provided', () => {
      const params: ReadingTextParams = {
        textType: 'missing-vowels',
        inputText: 'Тестовый текст',
        fontSize: 'medium',
        fontFamily: 'sans-serif',
        textCase: 'mixed'
      }

      const templateData = generator.generateTemplateData(params)
      expect(templateData.instructions).toContain('гласные')
    })

    it('should handle array of text types by using first one', () => {
      const params: ReadingTextParams = {
        textType: ['top-cut', 'bottom-cut'],
        inputText: 'Тестовый текст',
        fontSize: 'medium',
        fontFamily: 'sans-serif',
        textCase: 'mixed'
      }

      const templateData = generator.generateTemplateData(params)
      expect(templateData.type).toBe('top-cut')
    })

    it('should use default values for optional parameters', () => {
      const params: ReadingTextParams = {
        textType: 'normal',
        inputText: 'Тестовый текст',
        fontSize: 'medium',
        fontFamily: 'sans-serif',
        textCase: 'mixed'
      }

      const templateData = generator.generateTemplateData(params)
      expect(templateData.centerTitle).toBe(true) // Default
      expect(templateData.pageNumbers).toBe(true) // Default
      expect(templateData.includeInstructions).toBe(true) // Default
    })
  })
})