'use client'

import React, { useState } from 'react'
import {
  CrosswordParams,
  CrosswordSize,
  CrosswordDifficulty,
  CrosswordStyle,
  CrosswordWord,
  CROSSWORD_GRID_SIZES,
  CROSSWORD_DIFFICULTY_SETTINGS,
  CROSSWORD_STYLES,
  CROSSWORD_PRESET_CATEGORIES,
  CrosswordPresetCategory
} from '../types'

interface CrosswordGeneratorProps {
  onGenerate?: (params: CrosswordParams) => void
  loading?: boolean
}

export default function CrosswordGenerator({
  onGenerate,
  loading = false
}: CrosswordGeneratorProps) {
  const [params, setParams] = useState<CrosswordParams>({
    words: [],
    gridSize: '15x15',
    difficulty: 'medium',
    style: 'classic',
    fontSize: 'medium',
    includeAnswers: true,
    showNumbers: true,
    blackSquareRatio: 0.12
  })

  const [selectedCategory, setSelectedCategory] = useState<CrosswordPresetCategory | null>(null)
  const [customWords, setCustomWords] = useState('')
  const [wordInputError, setWordInputError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  // Обновление параметров
  const handleParamChange = <K extends keyof CrosswordParams>(
    key: K,
    value: CrosswordParams[K]
  ) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }

  // Выбор готовой категории
  const handleCategorySelect = (category: CrosswordPresetCategory) => {
    setSelectedCategory(category)
    setCustomWords('')
    setWordInputError(null)
    const categoryWords = CROSSWORD_PRESET_CATEGORIES[category].words
    setParams(prev => ({ ...prev, words: categoryWords }))
  }

  // Обработка пользовательского ввода слов
  const handleCustomWordsChange = (input: string) => {
    setCustomWords(input)
    setWordInputError(null)

    if (input.trim()) {
      setSelectedCategory(null)

      try {
        const parsed = parseCustomWords(input)
        setParams(prev => ({ ...prev, words: parsed }))
      } catch (error) {
        setWordInputError(error instanceof Error ? error.message : 'Ошибка разбора слов')
        setParams(prev => ({ ...prev, words: [] }))
      }
    } else {
      setParams(prev => ({ ...prev, words: [] }))
    }
  }

  // Парсинг слов с определениями
  const parseCustomWords = (input: string): CrosswordWord[] => {
    const lines = input.split('\n').filter(line => line.trim())
    const words: CrosswordWord[] = []

    for (const line of lines) {
      const trimmed = line.trim()

      // Формат: "слово - определение" или "слово: определение"
      const match = trimmed.match(/^([а-яё]+)\s*[-:]\s*(.+)$/i)

      if (match) {
        const [, word, clue] = match
        const cleanWord = word.toLowerCase().trim()
        const cleanClue = clue.trim()

        if (cleanWord.length < 3) {
          throw new Error(`Слово "${cleanWord}" слишком короткое (минимум 3 буквы)`)
        }

        if (cleanWord.length > 15) {
          throw new Error(`Слово "${cleanWord}" слишком длинное (максимум 15 букв)`)
        }

        if (cleanClue.length < 3) {
          throw new Error(`Определение для "${cleanWord}" слишком короткое`)
        }

        words.push({
          word: cleanWord,
          clue: cleanClue,
          answer: cleanWord,
          length: cleanWord.length
        })
      } else {
        throw new Error(`Неверный формат строки: "${trimmed}". Используйте: слово - определение`)
      }
    }

    if (words.length === 0) {
      throw new Error('Не найдено корректных слов')
    }

    // Проверка на дубли
    const uniqueWords = new Set(words.map(w => w.word))
    if (uniqueWords.size < words.length) {
      throw new Error('Найдены повторяющиеся слова')
    }

    return words
  }

  // HTML превью
  const handlePreview = async () => {
    if (params.words.length === 0) {
      alert('Выберите категорию слов или введите свои слова с определениями')
      return
    }

    if (params.words.length < 5) {
      alert('Минимум 5 слов нужно для создания кроссворда')
      return
    }

    setPreviewLoading(true)
    try {
      const response = await fetch('/api/debug-html', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'crossword',
          params
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Ошибка генерации превью')
      }

      const html = await response.text()
      setPreviewHtml(html)
      setShowPreview(true)
    } catch (error) {
      console.error('Preview error:', error)
      alert(error instanceof Error ? error.message : 'Ошибка создания превью')
    } finally {
      setPreviewLoading(false)
    }
  }

  // Генерация кроссворда
  const handleGenerate = () => {
    if (params.words.length === 0) {
      alert('Выберите категорию слов или введите свои слова с определениями')
      return
    }

    if (params.words.length < 5) {
      alert('Минимум 5 слов нужно для создания кроссворда')
      return
    }

    const maxWords = CROSSWORD_DIFFICULTY_SETTINGS[params.difficulty].maxWords
    if (params.words.length > maxWords) {
      alert(`Слишком много слов для уровня сложности "${CROSSWORD_DIFFICULTY_SETTINGS[params.difficulty].name}". Максимум: ${maxWords}`)
      return
    }

    if (onGenerate) {
      onGenerate(params)
    }
  }

  const canGenerate = params.words.length >= 5 && !loading && !wordInputError

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Левая колонка - Настройки */}
        <div className="space-y-6">
          {/* Размер и сложность */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🎯</span>
              <h3 className="text-lg font-medium text-gray-900">Основные настройки</h3>
            </div>

            {/* Размер сетки */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Размер сетки
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(CROSSWORD_GRID_SIZES).map(([size, num]) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleParamChange('gridSize', size as CrosswordSize)}
                    className={`p-2 text-center rounded-lg border-2 transition-all text-sm ${
                      params.gridSize === size
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold">{size}</div>
                    <div className="text-xs text-gray-600">{num}×{num}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Сложность */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Уровень сложности
              </label>
              <div className="space-y-2">
                {Object.entries(CROSSWORD_DIFFICULTY_SETTINGS).map(([key, settings]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleParamChange('difficulty', key as CrosswordDifficulty)}
                    className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                      params.difficulty === key
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{settings.name}</div>
                        <div className="text-sm text-gray-600">{settings.description}</div>
                      </div>
                      {params.difficulty === key && (
                        <span className="text-green-500 text-lg">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Стиль кроссворда */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Стиль кроссворда
              </label>
              <div className="space-y-2">
                {Object.entries(CROSSWORD_STYLES).map(([key, style]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleParamChange('style', key as CrosswordStyle)}
                    className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                      params.style === key
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{style.name}</div>
                        <div className="text-sm text-gray-600">{style.description}</div>
                      </div>
                      {params.style === key && (
                        <span className="text-green-500 text-lg">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Дополнительные настройки */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">⚙️</span>
              <h3 className="text-lg font-medium text-gray-900">Дополнительные настройки</h3>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={params.includeAnswers}
                  onChange={(e) => handleParamChange('includeAnswers', e.target.checked)}
                  className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Включить страницу с ответами</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={params.showNumbers}
                  onChange={(e) => handleParamChange('showNumbers', e.target.checked)}
                  className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Показывать номера клеток</span>
              </label>
            </div>
          </div>
        </div>

        {/* Правая колонка - Слова */}
        <div className="space-y-6">
          {/* Готовые категории */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">📚</span>
              <h3 className="text-lg font-medium text-gray-900">Готовые категории</h3>
            </div>

            <div className="space-y-2">
              {Object.entries(CROSSWORD_PRESET_CATEGORIES).map(([key, category]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleCategorySelect(key as CrosswordPresetCategory)}
                  className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                    selectedCategory === key
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{category.name}</div>
                      <div className="text-sm text-gray-600">
                        {category.words.length} слов с определениями
                      </div>
                    </div>
                    {selectedCategory === key && (
                      <span className="text-green-500 text-lg">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Свои слова */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">✏️</span>
              <h3 className="text-lg font-medium text-gray-900">Свои слова с определениями</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Введите слова с определениями:
              </label>
              <textarea
                value={customWords}
                onChange={(e) => handleCustomWordsChange(e.target.value)}
                placeholder={`кот - домашнее животное
собака - друг человека
дом - место где мы живём

Формат: слово - определение
Каждое слово с новой строки`}
                rows={8}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm ${
                  wordInputError ? 'border-red-300' : 'border-gray-300'
                }`}
              />

              {wordInputError && (
                <div className="mt-2 text-sm text-red-600">
                  {wordInputError}
                </div>
              )}

              <div className="mt-2 text-xs text-gray-500 space-y-1">
                <p>• Формат: слово - определение (через дефис)</p>
                <p>• Только кириллица, длина слова: 3-15 букв</p>
                <p>• Минимум 5 слов для создания кроссворда</p>
              </div>
            </div>
          </div>

          {/* Кнопка генерации */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
            <div className="text-center space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Слов готово</p>
                  <p className="font-semibold text-gray-900">{params.words.length}</p>
                </div>
                <div>
                  <p className="text-gray-600">Размер сетки</p>
                  <p className="font-semibold text-gray-900">{params.gridSize}</p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handlePreview}
                  disabled={!canGenerate || previewLoading}
                  className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-all transform focus:outline-none focus:ring-4 focus:ring-offset-2 ${
                    canGenerate && !previewLoading
                      ? 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 hover:scale-105 focus:ring-gray-300'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {previewLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Создание превью...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <span className="mr-2 text-lg">👁️</span>
                      Показать превью
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                  className={`w-full py-3 px-6 rounded-lg font-semibold text-base transition-all transform focus:outline-none focus:ring-4 focus:ring-offset-2 ${
                    canGenerate
                      ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 hover:scale-105 focus:ring-green-300'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Генерация кроссворда...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <span className="mr-2 text-lg">🧩</span>
                      Создать кроссворд
                    </span>
                  )}
                </button>
              </div>

              {!canGenerate && !loading && (
                <p className="text-xs text-gray-600">
                  {params.words.length === 0
                    ? '💡 Выберите категорию или введите свои слова'
                    : params.words.length < 5
                    ? `💡 Добавьте ещё ${5 - params.words.length} слов`
                    : wordInputError
                    ? '❌ Исправьте ошибки в словах'
                    : '💡 Готов к созданию'
                  }
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* HTML Preview Modal */}
      {showPreview && previewHtml && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Превью кроссворда</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div
                dangerouslySetInnerHTML={{ __html: previewHtml }}
                className="crossword-preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}