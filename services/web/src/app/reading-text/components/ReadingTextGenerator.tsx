'use client'

import React, { useState } from 'react'
import {
  ReadingTextParams,
  ReadingTextType,
  FontSize,
  FontFamily,
  TextCase,
  TEXT_TYPE_DESCRIPTIONS,
  FONT_SIZE_SETTINGS,
  FONT_FAMILY_SETTINGS
} from '../types'
import { generatePreviewText, getTransformationDescription } from '../utils/previewGenerator'

interface ReadingTextGeneratorProps {
  onGenerate?: (params: ReadingTextParams) => void
  loading?: boolean
}

export default function ReadingTextGenerator({
  onGenerate,
  loading = false
}: ReadingTextGeneratorProps) {
  const [selectedTypes, setSelectedTypes] = useState<ReadingTextType[]>(['normal'])
  const [collapsed, setCollapsed] = useState({
    textTypes: false,
    typography: true, // Свернуто по умолчанию для лучшего UX
    advanced: true,
    formatting: true
  })
  const [params, setParams] = useState<ReadingTextParams>({
    textType: ['normal'], // Изменено на массив
    inputText: 'Боря плыл в лодке. Над рекой летали птицы. Солнце ярко светило.',
    fontSize: 'medium',
    fontFamily: 'sans-serif',
    textCase: 'mixed',
    hasTitle: true,
    title: 'Упражнение на технику чтения',
    centerTitle: true,
    pageNumbers: true,
    includeInstructions: true,
    cutPercentage: 40,
    endingLength: 2,
    reversedWordCount: 2,
    extraLetterDensity: 30,
    keepFirstLast: true,
    mixedMode: 'sentence'
  })

  const handleParamChange = <K extends keyof ReadingTextParams>(
    key: K,
    value: ReadingTextParams[K]
  ) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }

  const toggleSection = (section: keyof typeof collapsed) => {
    setCollapsed(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleTypeToggle = (type: ReadingTextType) => {
    setSelectedTypes(prev => {
      let newTypes: ReadingTextType[]

      if (prev.includes(type)) {
        // Убираем тип из выбранных
        newTypes = prev.filter(t => t !== type)
      } else {
        // Добавляем тип к выбранным
        newTypes = [...prev, type]

        // Если выбрали не-normal тип, и normal был в списке, убираем normal
        if (type !== 'normal' && prev.includes('normal')) {
          newTypes = newTypes.filter(t => t !== 'normal')
        }

        // Если выбрали normal, убираем все остальные типы
        if (type === 'normal') {
          newTypes = ['normal']
        }
      }

      // Если список пустой, добавляем 'normal'
      const finalTypes = newTypes.length === 0 ? ['normal'] : newTypes

      setParams(prevParams => ({
        ...prevParams,
        textType: finalTypes as ReadingTextType[]
      }))

      return finalTypes as ReadingTextType[]
    })
  }

  const handleGenerate = () => {
    // Валидация перед отправкой
    const wordCount = params.inputText.trim().split(/\s+/).filter(w => w.length > 0).length

    if (wordCount < 3) {
      alert('Текст должен содержать минимум 3 слова')
      return
    }

    if (params.inputText.trim().length < 10) {
      alert('Текст должен содержать минимум 10 символов')
      return
    }

    if (!/[а-яё]/i.test(params.inputText)) {
      alert('Текст должен содержать кириллические символы')
      return
    }

    // Отладочный вывод
    console.log('Генерация PDF с параметрами:', {
      textType: params.textType,
      selectedTypes,
      isMultiPage: Array.isArray(params.textType) && params.textType.length > 1
    })

    if (onGenerate) {
      onGenerate(params)
    }
  }

  const handleDebugPreview = async () => {
    // Валидация перед отправкой
    const wordCount = params.inputText.trim().split(/\s+/).filter(w => w.length > 0).length

    if (wordCount < 3) {
      alert('Текст должен содержать минимум 3 слова')
      return
    }

    if (params.inputText.trim().length < 10) {
      alert('Текст должен содержать минимум 10 символов')
      return
    }

    if (!/[а-яё]/i.test(params.inputText)) {
      alert('Текст должен содержать кириллические символы')
      return
    }

    try {
      // Используем веб-генератор напрямую для предварительного просмотра
      const response = await fetch('/api/reading-text/debug-html', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Ошибка генерации HTML')
      }

      const htmlContent = await response.text()

      // Открываем HTML в новом окне
      const newWindow = window.open('', '_blank')
      if (newWindow) {
        newWindow.document.write(htmlContent)
        newWindow.document.close()
      } else {
        alert('Не удалось открыть новое окно. Проверьте настройки блокировки всплывающих окон.')
      }

    } catch (error) {
      console.error('Error generating HTML preview:', error)
      alert(error instanceof Error ? error.message : 'Произошла ошибка при генерации HTML preview')
    }
  }

  // Для отображения информации берем первый выбранный тип
  const firstType = Array.isArray(params.textType) ? params.textType[0] : params.textType
  const typeInfo = TEXT_TYPE_DESCRIPTIONS[firstType || 'normal']

  // Проверки для визуальной валидации
  const wordCount = params.inputText.trim().split(/\s+/).filter(w => w.length > 0).length
  const hasEnoughWords = wordCount >= 3
  const hasEnoughChars = params.inputText.trim().length >= 10
  const hasCyrillic = /[а-яё]/i.test(params.inputText)
  const isValidInput = hasEnoughWords && hasEnoughChars && hasCyrillic

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Конструктор текстов для чтения
        </h1>
        <p className="text-gray-600">
          Создавайте упражнения для развития техники чтения и скорочтения
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Левая колонка - настройки */}
        <div className="space-y-6">
          {/* Типы заданий - Компактный интерфейс */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Типы заданий
              <span className="text-xs text-gray-500 ml-2">
                (выберите один или несколько для создания многостраничного PDF)
              </span>
            </label>

            {/* Компактный выбор типов */}
            <div className="space-y-3">
              {/* Быстрый выбор */}
              <div className="flex flex-wrap gap-2">
                {Object.entries(TEXT_TYPE_DESCRIPTIONS)
                  .sort(([, a], [, b]) => {
                    const difficultyOrder = { easy: 1, medium: 2, hard: 3 }
                    return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
                  })
                  .map(([type, info]) => {
                    const isSelected = selectedTypes.includes(type as ReadingTextType)
                    const difficultyColor = {
                      easy: 'border-green-300 hover:border-green-400 text-green-800',
                      medium: 'border-yellow-300 hover:border-yellow-400 text-yellow-800',
                      hard: 'border-red-300 hover:border-red-400 text-red-800'
                    }[info.difficulty]

                    return (
                      <div key={type} className="relative">
                        <label
                          className={`
                            relative group inline-flex items-center px-3 py-2 text-xs font-medium border rounded-full cursor-pointer transition-all
                            ${isSelected
                              ? 'bg-blue-100 border-blue-300 text-blue-800 shadow-sm'
                              : `bg-white ${difficultyColor} hover:shadow-sm`
                            }
                          `}
                          title={`${info.description} • ${info.purpose}`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleTypeToggle(type as ReadingTextType)}
                            className="sr-only"
                          />
                          <span className={`w-2 h-2 rounded-full mr-2 ${
                            info.difficulty === 'easy' ? 'bg-green-400' :
                            info.difficulty === 'medium' ? 'bg-yellow-400' : 'bg-red-400'
                          }`}></span>
                          {info.name}
                          {isSelected && <span className="ml-1">✓</span>}

                          {/* Тултип с описанием */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                            <div className="font-semibold mb-1">{info.name}</div>
                            <div className="text-gray-300 mb-1">{info.description}</div>
                            <div className="text-blue-300 text-xs">📚 {info.purpose}</div>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </label>
                      </div>
                    )
                  })}
              </div>

              {/* Выбранные типы с параметрами */}
              {selectedTypes.length > 0 && selectedTypes.some(type => type !== 'normal') && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    ⚙️ Настройки выбранных типов
                    <span className="ml-2 text-xs text-gray-500">
                      ({selectedTypes.length} тип{selectedTypes.length > 1 ? 'а' : ''})
                    </span>
                  </h4>

                  <div className="space-y-3">
                    {selectedTypes.filter(type => type !== 'normal').map(type => (
                      <div key={type} className="bg-white p-3 rounded-md border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-800">
                              {TEXT_TYPE_DESCRIPTIONS[type].name}
                            </span>
                            <div className="text-xs text-gray-600 mt-1">
                              {TEXT_TYPE_DESCRIPTIONS[type].description}
                            </div>
                            <div className="text-xs text-blue-600 mt-1">
                              📚 {TEXT_TYPE_DESCRIPTIONS[type].purpose}
                            </div>
                          </div>
                          <button
                            onClick={() => handleTypeToggle(type)}
                            className="text-xs text-red-600 hover:text-red-800 ml-3"
                          >
                            Убрать
                          </button>
                        </div>

                        {/* Параметры для каждого типа */}
                        {(type === 'bottom-cut' || type === 'top-cut') && (
                          <div className="flex items-center space-x-3">
                            <label className="text-xs text-gray-600">Обрезание:</label>
                            <input
                              type="range"
                              min="20"
                              max="70"
                              value={params.cutPercentage || 40}
                              onChange={(e) => handleParamChange('cutPercentage', parseInt(e.target.value))}
                              className="flex-1 h-1 bg-gray-200 rounded-lg slider"
                            />
                            <span className="text-xs text-gray-700 min-w-[3rem]">
                              {params.cutPercentage || 40}%
                            </span>
                          </div>
                        )}

                        {type === 'missing-endings' && (
                          <div className="flex items-center space-x-3">
                            <label className="text-xs text-gray-600">Букв убрать:</label>
                            <div className="flex space-x-1">
                              {[1, 2, 3].map(length => (
                                <button
                                  key={length}
                                  onClick={() => handleParamChange('endingLength', length)}
                                  className={`w-8 h-8 text-xs border rounded ${
                                    params.endingLength === length
                                      ? 'bg-blue-500 text-white border-blue-500'
                                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                  }`}
                                >
                                  {length}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {type === 'partial-reversed' && (
                          <div className="flex items-center space-x-3">
                            <label className="text-xs text-gray-600">Перевернуть слов:</label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={params.reversedWordCount || 2}
                              onChange={(e) => handleParamChange('reversedWordCount', parseInt(e.target.value))}
                              className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                            />
                          </div>
                        )}

                        {type === 'extra-letters' && (
                          <div className="flex items-center space-x-3">
                            <label className="text-xs text-gray-600">Плотность:</label>
                            <input
                              type="range"
                              min="10"
                              max="50"
                              value={params.extraLetterDensity || 30}
                              onChange={(e) => handleParamChange('extraLetterDensity', parseInt(e.target.value))}
                              className="flex-1 h-1 bg-gray-200 rounded-lg slider"
                            />
                            <span className="text-xs text-gray-700 min-w-[3rem]">
                              {params.extraLetterDensity || 30}%
                            </span>
                          </div>
                        )}

                        {type === 'scrambled-words' && (
                          <div className="space-y-2">
                            <label className="text-xs text-gray-600">Режим анаграмм:</label>
                            <div className="space-y-1">
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name={`scrambleMode-${type}`}
                                  checked={params.keepFirstLast === true}
                                  onChange={() => handleParamChange('keepFirstLast', true)}
                                  className="mr-2 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-xs text-gray-700">
                                  Сохранять первую и последнюю буквы
                                </span>
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name={`scrambleMode-${type}`}
                                  checked={params.keepFirstLast === false}
                                  onChange={() => handleParamChange('keepFirstLast', false)}
                                  className="mr-2 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-xs text-gray-700">
                                  Перемешивать все буквы
                                </span>
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Суммарная информация */}
              {selectedTypes.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-800">
                    <span className="font-medium">Будет создано:</span> {' '}
                    {selectedTypes.length === 1
                      ? '1 страница'
                      : `${selectedTypes.length} страницы (многостраничный PDF)`
                    }
                    {selectedTypes.length > 1 && (
                      <span className="text-xs block mt-1 text-blue-600">
                        Первая страница включает исходный текст для сравнения
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Типографика - Компактная версия */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSection('typography')}
              className="w-full p-3 text-left flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-t-lg"
            >
              <div className="flex items-center space-x-3">
                <span>🎨</span>
                <div>
                  <h3 className="font-medium text-gray-900">Шрифт и стиль</h3>
                  <p className="text-xs text-gray-500">
                    {FONT_SIZE_SETTINGS[params.fontSize]?.name} • {FONT_FAMILY_SETTINGS[params.fontFamily]?.name}
                  </p>
                </div>
              </div>
              <span className={`transform transition-transform ${collapsed.typography ? 'rotate-0' : 'rotate-180'}`}>
                ▼
              </span>
            </button>

            {!collapsed.typography && (
              <div className="p-4 space-y-4">
                {/* Размер шрифта - компактные кнопки */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Размер шрифта
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(FONT_SIZE_SETTINGS).map(([size, info]) => (
                      <button
                        key={size}
                        onClick={() => handleParamChange('fontSize', size as FontSize)}
                        className={`px-3 py-2 text-xs border rounded-full transition-all ${
                          params.fontSize === size
                            ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {info.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Семейство шрифтов - выпадающий список */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Тип шрифта
                  </label>
                  <select
                    value={params.fontFamily}
                    onChange={(e) => handleParamChange('fontFamily', e.target.value as FontFamily)}
                    className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(FONT_FAMILY_SETTINGS).map(([family, info]) => (
                      <option key={family} value={family}>
                        {info.name} - {info.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Регистр букв */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Регистр букв
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: 'upper', label: 'ЗАГЛАВНЫЕ' },
                      { value: 'lower', label: 'строчные' },
                      { value: 'mixed', label: 'Смешанный' }
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => handleParamChange('textCase', value as TextCase)}
                        className={`px-3 py-2 text-xs border rounded transition-all ${
                          params.textCase === value
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>


                {/* Превью типографики */}
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <div className="text-xs text-gray-600 mb-2">
                    Превью: {FONT_SIZE_SETTINGS[params.fontSize].name} + {FONT_FAMILY_SETTINGS[params.fontFamily].name}
                  </div>
                  <div
                    className="text-gray-800 p-2 bg-white rounded border-2 border-dashed border-gray-300"
                    style={{
                      fontSize: FONT_SIZE_SETTINGS[params.fontSize].cssSize,
                      lineHeight: FONT_SIZE_SETTINGS[params.fontSize].lineHeight,
                      fontFamily: FONT_FAMILY_SETTINGS[params.fontFamily].cssFamily
                    }}
                    dangerouslySetInnerHTML={{
                      __html: generatePreviewText(
                        params.inputText || 'Введите текст для предварительного просмотра...',
                        params.textType,
                        params.textCase
                      )
                    }}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    CSS: font-family: {FONT_FAMILY_SETTINGS[params.fontFamily].cssFamily}; font-size: {FONT_SIZE_SETTINGS[params.fontSize].cssSize};
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Дополнительные настройки для конкретных типов */}
          {params.textType === 'bottom-cut' || params.textType === 'top-cut' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Процент обрезания ({params.cutPercentage}%)
              </label>
              <input
                type="range"
                min="20"
                max="70"
                value={params.cutPercentage || 40}
                onChange={(e) => handleParamChange('cutPercentage', parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>20%</span>
                <span>70%</span>
              </div>
            </div>
          ) : null}

          {params.textType === 'missing-endings' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Количество пропущенных букв
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2].map((length) => (
                  <button
                    key={length}
                    onClick={() => handleParamChange('endingLength', length)}
                    className={`p-2 text-center border rounded-md transition-colors ${
                      params.endingLength === length
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {length} букв{length === 1 ? 'а' : 'ы'}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {params.textType === 'partial-reversed' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Количество перевернутых слов
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={params.reversedWordCount || 2}
                onChange={(e) => handleParamChange('reversedWordCount', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ) : null}

          {params.textType === 'extra-letters' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Плотность лишних букв ({params.extraLetterDensity}%)
              </label>
              <input
                type="range"
                min="10"
                max="50"
                value={params.extraLetterDensity || 30}
                onChange={(e) => handleParamChange('extraLetterDensity', parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10%</span>
                <span>50%</span>
              </div>
            </div>
          ) : null}

          {params.textType === 'scrambled-words' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Режим анаграмм
              </label>
              <div className="grid grid-cols-1 gap-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="scrambleMode"
                    checked={params.keepFirstLast === true}
                    onChange={() => handleParamChange('keepFirstLast', true)}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Сохранять первую и последнюю буквы (рекомендуется)
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="scrambleMode"
                    checked={params.keepFirstLast === false}
                    onChange={() => handleParamChange('keepFirstLast', false)}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Перемешивать все буквы (сложнее)
                  </span>
                </label>
              </div>
            </div>
          ) : null}

          {params.textType === 'mixed-types' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Режим смешанного типа
              </label>
              <div className="grid grid-cols-1 gap-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="mixedMode"
                    checked={params.mixedMode === 'sentence'}
                    onChange={() => handleParamChange('mixedMode', 'sentence')}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    По предложениям (каждое предложение - свой тип)
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="mixedMode"
                    checked={params.mixedMode === 'word'}
                    onChange={() => handleParamChange('mixedMode', 'word')}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Сборная солянка (разные слова - разные типы)
                  </span>
                </label>
              </div>
              <div className="mt-2 p-2 bg-yellow-50 rounded-md text-xs text-yellow-800">
                <strong>Сборная солянка</strong> - самый сложный режим! Каждое слово обрабатывается своим типом трансформации.
              </div>
            </div>
          ) : null}

          {/* Форматирование - Компактная версия */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSection('formatting')}
              className="w-full p-3 text-left flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-t-lg"
            >
              <div className="flex items-center space-x-3">
                <span>📝</span>
                <div>
                  <h3 className="font-medium text-gray-900">Форматирование</h3>
                  <p className="text-xs text-gray-500">
                    {params.hasTitle ? 'С заголовком' : 'Без заголовка'} •
                    {params.pageNumbers ? ' С номерами' : ' Без номеров'}
                  </p>
                </div>
              </div>
              <span className={`transform transition-transform ${collapsed.formatting ? 'rotate-0' : 'rotate-180'}`}>
                ▼
              </span>
            </button>

            {!collapsed.formatting && (
              <div className="p-4 space-y-3">
                {/* Заголовок */}
                <div>
                  <label className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={params.hasTitle}
                      onChange={(e) => handleParamChange('hasTitle', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Добавить заголовок</span>
                  </label>

                  {params.hasTitle && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={params.title || ''}
                        onChange={(e) => handleParamChange('title', e.target.value)}
                        placeholder="Заголовок упражнения"
                        className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={params.centerTitle}
                          onChange={(e) => handleParamChange('centerTitle', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-xs text-gray-600">Центрировать заголовок</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Опции PDF */}
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={params.pageNumbers}
                      onChange={(e) => handleParamChange('pageNumbers', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-xs text-gray-700">Номера страниц</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={params.includeInstructions}
                      onChange={(e) => handleParamChange('includeInstructions', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-xs text-gray-700">Включить инструкции</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Правая колонка - ввод текста */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Исходный текст
            </label>
            <textarea
              value={params.inputText}
              onChange={(e) => handleParamChange('inputText', e.target.value)}
              placeholder="Введите текст для обработки..."
              rows={8}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            <div className="mt-1 text-xs">
              <span className={hasEnoughChars ? 'text-green-600' : 'text-red-500'}>
                Символов: {params.inputText.length} (мин. 10)
              </span>
              {' | '}
              <span className={hasEnoughWords ? 'text-green-600' : 'text-red-500'}>
                Слов: {wordCount} (мин. 3)
              </span>
              {' | '}
              <span className={hasCyrillic ? 'text-green-600' : 'text-red-500'}>
                {hasCyrillic ? '✓ Кириллица' : '✗ Нужна кириллица'}
              </span>
            </div>
          </div>

          {/* Кнопки генерации */}
          <div className="space-y-3">
            <button
              onClick={handleGenerate}
              disabled={loading || !isValidInput}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Создание PDF...' : 'Создать упражнение'}
            </button>

            <button
              onClick={handleDebugPreview}
              disabled={loading || !isValidInput}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
            >
              🔍 Предварительный просмотр HTML
            </button>
          </div>

          {/* Информация о результате */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h4 className="font-medium text-gray-700 mb-2">Что будет создано:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• PDF с обработанным текстом</li>
              <li>• {params.includeInstructions ? 'Страница с инструкциями' : 'Без инструкций'}</li>
              <li>• Размер: {FONT_SIZE_SETTINGS[params.fontSize].name} ({FONT_SIZE_SETTINGS[params.fontSize].baseFontSize}pt)</li>
              <li>• Шрифт: {FONT_FAMILY_SETTINGS[params.fontFamily].name}</li>
              <li>• {params.pageNumbers ? 'С номерами страниц' : 'Без номеров страниц'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}