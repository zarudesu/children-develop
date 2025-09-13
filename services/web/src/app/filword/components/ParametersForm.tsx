'use client'

import { useState, useEffect } from 'react'
import { FilwordParams, PRESET_CATEGORIES, FONT_SIZE_SETTINGS, FontSize } from '../types'
import clsx from 'clsx'

interface ParametersFormProps {
  initialParams: FilwordParams
  onParamsChange: (params: FilwordParams) => void
  onGenerate: (params: FilwordParams) => void
  isLoading: boolean
  error?: string | null
}

const GRID_SIZES = [
  // Популярные размеры (показываются первыми)
  { value: '10x10' as const, label: '10×10', description: 'Простой', cellsCount: 100, estimatedTime: '10-15 сек' },
  { value: '14x14' as const, label: '14×14', description: 'Средний', cellsCount: 196, estimatedTime: '15-25 сек' },
  { value: '18x18' as const, label: '18×18', description: 'Сложный', cellsCount: 324, estimatedTime: '25-35 сек' },
  { value: '24x24' as const, label: '24×24', description: 'Очень сложный', cellsCount: 576, estimatedTime: '35-45 сек' },
  // Остальные размеры
  { value: '11x11' as const, label: '11×11', description: 'Легкий+', cellsCount: 121, estimatedTime: '11-16 сек' },
  { value: '12x12' as const, label: '12×12', description: 'Простой+', cellsCount: 144, estimatedTime: '12-18 сек' },
  { value: '13x13' as const, label: '13×13', description: 'Простой++', cellsCount: 169, estimatedTime: '13-22 сек' },
  { value: '15x15' as const, label: '15×15', description: 'Средний+', cellsCount: 225, estimatedTime: '18-28 сек' },
  { value: '16x16' as const, label: '16×16', description: 'Средний++', cellsCount: 256, estimatedTime: '20-30 сек' },
  { value: '17x17' as const, label: '17×17', description: 'Сложный-', cellsCount: 289, estimatedTime: '22-32 сек' },
  { value: '19x19' as const, label: '19×19', description: 'Сложный+', cellsCount: 361, estimatedTime: '27-38 сек' },
  { value: '20x20' as const, label: '20×20', description: 'Сложный++', cellsCount: 400, estimatedTime: '30-40 сек' },
  { value: '21x21' as const, label: '21×21', description: 'Экспертный-', cellsCount: 441, estimatedTime: '32-42 сек' },
  { value: '22x22' as const, label: '22×22', description: 'Экспертный', cellsCount: 484, estimatedTime: '35-45 сек' },
  { value: '23x23' as const, label: '23×23', description: 'Экспертный+', cellsCount: 529, estimatedTime: '37-47 сек' },
  { value: '25x25' as const, label: '25×25', description: 'Максимальный', cellsCount: 625, estimatedTime: '42-60 сек' },
]

const DIRECTIONS = [
  { key: 'right' as const, label: 'Вправо', icon: '→', description: 'Слова читаются слева направо' },
  { key: 'left' as const, label: 'Влево', icon: '←', description: 'Слова читаются справа налево' },
  { key: 'down' as const, label: 'Вниз', icon: '↓', description: 'Слова читаются сверху вниз' },
  { key: 'up' as const, label: 'Вверх', icon: '↑', description: 'Слова читаются снизу вверх' },
]

const TEXT_CASES = [
  { key: 'upper' as const, label: 'ЗАГЛАВНЫЕ', example: 'КОТ', description: 'Все буквы заглавные' },
  { key: 'lower' as const, label: 'строчные', example: 'кот', description: 'Все буквы строчные' },
  { key: 'mixed' as const, label: 'Смешанный', example: 'Кот', description: 'Первая буква заглавная' },
]

export default function ParametersForm({ 
  initialParams, 
  onParamsChange,
  onGenerate, 
  isLoading,
  error
}: ParametersFormProps) {
  const [params, setParams] = useState<FilwordParams>(initialParams)
  const [wordInput, setWordInput] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  // Синхронизация с внешним состоянием
  useEffect(() => {
    setParams(initialParams)
  }, [initialParams])

  const handleGridSizeChange = (size: FilwordParams['gridSize']) => {
    const newParams = { ...params, gridSize: size }
    setParams(newParams)
    onParamsChange(newParams)
  }

  const handleDirectionChange = (direction: keyof FilwordParams['directions']) => {
    const newParams = {
      ...params,
      directions: {
        ...params.directions,
        [direction]: !params.directions[direction]
      }
    }
    setParams(newParams)
    onParamsChange(newParams)
  }

  const handleTextCaseChange = (textCase: FilwordParams['textCase']) => {
    const newParams = { ...params, textCase }
    setParams(newParams)
    onParamsChange(newParams)
  }

  const handleFontSizeChange = (fontSize: FontSize) => {
    const newParams = { ...params, fontSize }
    setParams(newParams)
    onParamsChange(newParams)
  }

  const handleWordsFromInput = () => {
    const words = wordInput
      .split(/[,\n]/)
      .map(word => word.trim().toLowerCase())
      .filter(word => word.length >= 3 && word.length <= 12)
      .filter(word => /^[а-яё]+$/i.test(word))
    
    if (words.length > 0) {
      const newParams = { ...params, words }
      setParams(newParams)
      onParamsChange(newParams)
      setSelectedCategory(null)
    }
  }

  const handleCategorySelect = (categoryKey: string) => {
    const category = PRESET_CATEGORIES[categoryKey]
    if (category) {
      const newParams = { ...params, words: category.words }
      setParams(newParams)
      onParamsChange(newParams)
      setSelectedCategory(categoryKey)
      setWordInput('')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onGenerate(params)
  }

  const isAtLeastOneDirection = Object.values(params.directions).some(Boolean)
  const selectedGridSize = GRID_SIZES.find(g => g.value === params.gridSize)
  const enabledDirectionsCount = Object.values(params.directions).filter(Boolean).length

  return (
    <div className="space-y-6">
      {/* Заголовок с общей информацией */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg font-bold">⊞</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Настройки филворда
            </h2>
            <p className="text-sm text-gray-600">
              Создание головоломки для поиска слов в буквенной сетке
            </p>
          </div>
        </div>

        {/* Быстрая информация */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">{params.words.length}</p>
            <p className="text-xs text-gray-600">слов выбрано</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">
              {selectedGridSize?.cellsCount || 0}
            </p>
            <p className="text-xs text-gray-600">ячеек в сетке</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Размер сетки */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">📏</span>
            <h3 className="text-lg font-medium text-gray-900">Размер сетки</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {GRID_SIZES.slice(0, 4).map((size) => (
              <button
                key={size.value}
                type="button"
                onClick={() => handleGridSizeChange(size.value)}
                className={clsx(
                  'p-3 text-left rounded-lg border-2 transition-all hover:shadow-sm',
                  params.gridSize === size.value
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                )}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-semibold text-gray-900">{size.label}</span>
                    <p className="text-sm text-gray-600">{size.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {size.cellsCount} ячеек • ~{size.value === '10x10' ? '10-15' : size.value === '14x14' ? '15-25' : size.value === '18x18' ? '25-35' : '35-45'} сек
                    </p>
                  </div>
                  {params.gridSize === size.value && (
                    <span className="text-blue-500 text-lg">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Размер шрифта */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🔤</span>
            <h3 className="text-lg font-medium text-gray-900">Размер шрифта</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.entries(FONT_SIZE_SETTINGS).map(([key, fontSetting]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleFontSizeChange(key as FontSize)}
                className={clsx(
                  'p-4 text-center rounded-lg border-2 transition-all hover:shadow-sm',
                  params.fontSize === key
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                )}
              >
                <div className="space-y-3">
                  <span className="font-medium text-gray-900 block text-sm">{fontSetting.name}</span>
                  
                  {/* Пример с сеткой букв */}
                  <div className="bg-gray-100 rounded p-2 inline-block">
                    <div className="grid grid-cols-3 gap-1">
                      {['К', 'О', 'Т', 'С', 'О', 'Н', 'Ы', 'Р', 'А'].map((letter, index) => (
                        <div 
                          key={index}
                          className="w-6 h-6 border border-gray-300 flex items-center justify-center bg-white font-bold"
                          style={{ fontSize: `${Math.max(10, fontSetting.baseFontSize - 6)}px` }}
                        >
                          {letter}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600">{fontSetting.description}</p>
                  {params.fontSize === key && (
                    <span className="text-blue-500 text-sm">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Направления */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🧭</span>
            <h3 className="text-lg font-medium text-gray-900">Направления слов</h3>
            <span className="text-sm text-gray-600">({enabledDirectionsCount} из 4)</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DIRECTIONS.map(({ key, label, icon, description }) => (
              <label
                key={key}
                className={clsx(
                  'flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-sm',
                  params.directions[key]
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                )}
              >
                <input
                  type="checkbox"
                  checked={params.directions[key]}
                  onChange={() => handleDirectionChange(key)}
                  className="sr-only"
                />
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-xl">{icon}</span>
                  <div>
                    <span className="font-medium text-gray-900">{label}</span>
                    <p className="text-xs text-gray-600">{description}</p>
                  </div>
                </div>
                {params.directions[key] && (
                  <span className="text-blue-500 text-lg">✓</span>
                )}
              </label>
            ))}
          </div>
          
          {!isAtLeastOneDirection && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm flex items-center gap-2">
                <span>⚠️</span>
                Выберите хотя бы одно направление для размещения слов
              </p>
            </div>
          )}
        </div>

        {/* Регистр текста */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🔤</span>
            <h3 className="text-lg font-medium text-gray-900">Формат текста</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {TEXT_CASES.map(({ key, label, example, description }) => (
              <button
                key={key}
                type="button"
                onClick={() => handleTextCaseChange(key)}
                className={clsx(
                  'p-3 text-center rounded-lg border-2 transition-all hover:shadow-sm',
                  params.textCase === key
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                )}
              >
                <div className="space-y-1">
                  <span className="font-medium text-gray-900 block text-sm">{label}</span>
                  <span className="text-base font-mono bg-gray-100 px-2 py-1 rounded block">
                    {example}
                  </span>
                  <p className="text-xs text-gray-600">{description}</p>
                  {params.textCase === key && (
                    <span className="text-blue-500 text-sm">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
        {/* Выбор слов */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">📝</span>
            <h3 className="text-lg font-medium text-gray-900">Слова для поиска</h3>
          </div>
          
          {/* Готовые категории */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700">Готовые категории:</span>
              <button
                type="button"
                onClick={() => setExpandedSection(expandedSection === 'categories' ? null : 'categories')}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                {expandedSection === 'categories' ? 'Скрыть' : 'Показать все'}
              </button>
            </div>
            
            <div className={clsx(
              'grid gap-2 transition-all duration-300',
              expandedSection === 'categories' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1 sm:grid-cols-2'
            )}>
              {Object.entries(PRESET_CATEGORIES)
                .slice(0, expandedSection === 'categories' ? undefined : 6)
                .map(([key, category]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleCategorySelect(key)}
                  className={clsx(
                    'p-2 text-left rounded-lg border-2 transition-all hover:shadow-sm',
                    selectedCategory === key
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  )}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium text-gray-900 text-sm">{category.name}</span>
                      <p className="text-xs text-gray-600">{category.words.length} слов</p>
                    </div>
                    {selectedCategory === key && (
                      <span className="text-green-500 text-sm">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Разделитель */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">или</span>
            </div>
          </div>

          {/* Свои слова */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Введите свои слова:
            </label>
            <div className="relative">
              <textarea
                value={wordInput}
                onChange={(e) => setWordInput(e.target.value)}
                placeholder="кот, собака, корова&#10;птица, рыба, заяц&#10;или каждое слово с новой строки..."
                rows={3}
                className="input text-sm resize-none"
                onBlur={handleWordsFromInput}
              />
              <div className="absolute top-1 right-2 text-xs text-gray-400">
                {wordInput.split(/[,\n]/).filter(w => w.trim()).length} слов
              </div>
            </div>
            <div className="mt-1 text-xs text-gray-500 space-y-0.5">
              <p>• Слова через запятую или с новой строки</p>
              <p>• Только кириллица (русские буквы)</p>
              <p>• Длина слова: от 3 до 12 символов</p>
            </div>
          </div>
        </div>

        {/* Предпросмотр выбранных слов */}
        {params.words.length > 0 && (
          <div className="card border-green-200 bg-green-50">
            <div className="flex items-start gap-3">
              <span className="text-green-600 text-lg mt-1">✓</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800 mb-2">
                  Выбрано слов: {params.words.length}
                </p>
                <div className="bg-white/70 p-2 rounded-lg">
                  <div className="flex flex-wrap gap-1">
                    {params.words.slice(0, 20).map((word, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full border border-green-300"
                      >
                        {word}
                      </span>
                    ))}
                    {params.words.length > 20 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{params.words.length - 20} еще
                      </span>
                    )}
                  </div>
                </div>
                {selectedCategory && (
                  <p className="text-xs text-green-700 mt-1">
                    Категория: {PRESET_CATEGORIES[selectedCategory]?.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Итоговая информация и кнопка генерации */}
        <div className="card bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200">
          <div className="space-y-3">
            {/* Сводка настроек */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div>
                <p className="text-xs text-gray-600">Размер сетки</p>
                <p className="font-semibold text-gray-900">{params.gridSize}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Слов</p>
                <p className="font-semibold text-gray-900">{params.words.length}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Направления</p>
                <p className="font-semibold text-gray-900">{enabledDirectionsCount}/4</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Регистр</p>
                <p className="font-semibold text-gray-900">
                  {TEXT_CASES.find(tc => tc.key === params.textCase)?.example}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Размер шрифта</p>
                <p className="font-semibold text-gray-900">
                  {FONT_SIZE_SETTINGS[params.fontSize].name}
                </p>
              </div>
            </div>

            {/* Прогноз времени */}
            {params.words.length > 0 && selectedGridSize && (
              <div className="text-center p-2 bg-white/50 rounded-lg">
                <p className="text-xs text-gray-600">
                  ⏱️ Примерное время генерации: <span className="font-semibold">{selectedGridSize.estimatedTime}</span>
                </p>
              </div>
            )}

            {/* Кнопка генерации */}
            <button
              type="submit"
              disabled={
                isLoading || 
                params.words.length === 0 || 
                !isAtLeastOneDirection
              }
              className={clsx(
                'w-full py-3 px-6 rounded-lg font-semibold text-base transition-all transform',
                'focus:outline-none focus:ring-4 focus:ring-offset-2',
                isLoading || params.words.length === 0 || !isAtLeastOneDirection
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 focus:ring-blue-500 hover:scale-[1.02] shadow-lg'
              )}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg 
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Генерирую филворд...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <span className="mr-2 text-lg">🎯</span>
                  Создать филворд
                </span>
              )}
            </button>
            
            {/* Подсказки и ошибки */}
            <div className="space-y-1">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 text-center">
                    <span className="mr-2">❌</span>
                    {error}
                  </p>
                </div>
              )}
              {params.words.length === 0 && !error && (
                <p className="text-xs text-gray-600 text-center">
                  💡 Выберите категорию слов или введите свои
                </p>
              )}
              {!isAtLeastOneDirection && !error && (
                <p className="text-xs text-red-600 text-center">
                  ⚠️ Выберите хотя бы одно направление размещения слов
                </p>
              )}
              {params.words.length > 0 && isAtLeastOneDirection && !isLoading && !error && (
                <p className="text-xs text-green-600 text-center">
                  ✅ Все готово для создания филворда
                </p>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
