'use client'

import { useState } from 'react'
import { CrosswordParams, CrosswordWord, GRID_SIZES, DIFFICULTIES, CROSSWORD_STYLES, FONT_SIZES, CROSSWORD_THEMES } from '../types'

interface CrosswordGeneratorProps {
  onGenerate: (params: CrosswordParams) => Promise<void>
  isGenerating: boolean
}

export function CrosswordGenerator({ onGenerate, isGenerating }: CrosswordGeneratorProps) {
  const [words, setWords] = useState<CrosswordWord[]>([])
  const [currentWord, setCurrentWord] = useState('')
  const [currentClue, setCurrentClue] = useState('')
  const [gridSize, setGridSize] = useState<'9x9' | '11x11' | '13x13' | '15x15' | '17x17' | '19x19'>('11x11')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')
  const [style, setStyle] = useState<'classic' | 'modern' | 'themed'>('classic')
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [includeAnswers, setIncludeAnswers] = useState(true)
  const [showNumbers, setShowNumbers] = useState(true)
  const [blackSquareRatio, setBlackSquareRatio] = useState(0.15)
  const [errors, setErrors] = useState<string[]>([])

  const addWord = () => {
    if (!currentWord.trim() || !currentClue.trim()) {
      setErrors(['Введите слово и определение'])
      return
    }

    if (currentWord.length < 3) {
      setErrors(['Слово должно содержать минимум 3 буквы'])
      return
    }

    if (currentClue.length < 5) {
      setErrors(['Определение должно содержать минимум 5 символов'])
      return
    }

    if (!/^[а-яёА-ЯЁ]+$/.test(currentWord)) {
      setErrors(['Слово должно содержать только русские буквы'])
      return
    }

    const newWord: CrosswordWord = {
      word: currentWord.toLowerCase(),
      clue: currentClue,
      answer: currentWord.toLowerCase(),
      length: currentWord.length
    }

    setWords([...words, newWord])
    setCurrentWord('')
    setCurrentClue('')
    setErrors([])
  }

  const removeWord = (index: number) => {
    setWords(words.filter((_, i) => i !== index))
  }

  const loadTheme = (themeName: keyof typeof CROSSWORD_THEMES) => {
    const theme = CROSSWORD_THEMES[themeName]
    setWords([...theme.words])
    setErrors([])
  }

  const handleGenerate = async () => {
    if (words.length < 5) {
      setErrors(['Необходимо минимум 5 слов для создания кроссворда'])
      return
    }

    if (words.length > 50) {
      setErrors(['Максимум 50 слов'])
      return
    }

    const params: CrosswordParams = {
      words,
      gridSize,
      difficulty,
      style,
      fontSize,
      includeAnswers,
      showNumbers,
      blackSquareRatio
    }

    setErrors([])
    await onGenerate(params)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Создание кроссворда</h2>

      {/* Ошибки */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="text-red-400">⚠️</div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Исправьте ошибки:</h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Готовые темы */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Готовые темы</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(CROSSWORD_THEMES).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => loadTheme(key as keyof typeof CROSSWORD_THEMES)}
              className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-center"
            >
              <div className="text-2xl mb-1">{theme.icon}</div>
              <div className="text-sm font-medium text-gray-800">{theme.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Добавление слов */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Добавить слова</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Слово
            </label>
            <input
              type="text"
              value={currentWord}
              onChange={(e) => setCurrentWord(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Введите слово"
              maxLength={15}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Определение
            </label>
            <input
              type="text"
              value={currentClue}
              onChange={(e) => setCurrentClue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Определение слова"
              maxLength={100}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={addWord}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Добавить
            </button>
          </div>
        </div>
      </div>

      {/* Список слов */}
      {words.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Слова для кроссворда ({words.length})
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {words.map((word, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex-1">
                  <span className="font-medium text-gray-800">{word.word}</span>
                  <span className="text-gray-600 ml-2">— {word.clue}</span>
                </div>
                <button
                  onClick={() => removeWord(index)}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Настройки */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Размер сетки
          </label>
          <select
            value={gridSize}
            onChange={(e) => setGridSize(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {GRID_SIZES.map((size) => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Сложность
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {DIFFICULTIES.map((diff) => (
              <option key={diff.value} value={diff.value}>
                {diff.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Стиль
          </label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {CROSSWORD_STYLES.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Размер шрифта
          </label>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {FONT_SIZES.map((size) => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Дополнительные настройки */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="includeAnswers"
            checked={includeAnswers}
            onChange={(e) => setIncludeAnswers(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="includeAnswers" className="ml-2 text-sm text-gray-700">
            Включить ответы
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="showNumbers"
            checked={showNumbers}
            onChange={(e) => setShowNumbers(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="showNumbers" className="ml-2 text-sm text-gray-700">
            Показать номера
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Плотность сетки
          </label>
          <input
            type="range"
            min="0.1"
            max="0.3"
            step="0.05"
            value={blackSquareRatio}
            onChange={(e) => setBlackSquareRatio(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-gray-500 mt-1">
            {Math.round(blackSquareRatio * 100)}% черных клеток
          </div>
        </div>
      </div>

      {/* Кнопка генерации */}
      <div className="text-center">
        <button
          onClick={handleGenerate}
          disabled={isGenerating || words.length < 5}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg font-semibold"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Создание кроссворда...
            </>
          ) : (
            '🧩 Создать кроссворд'
          )}
        </button>
      </div>
    </div>
  )
}
