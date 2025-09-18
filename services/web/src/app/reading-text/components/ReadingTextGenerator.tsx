'use client'

import React, { useState } from 'react'
import {
  ReadingTextParams,
  ReadingTextType,
  FontSize,
  TextCase,
  TEXT_TYPE_DESCRIPTIONS,
  FONT_SIZE_SETTINGS
} from '../types'

interface ReadingTextGeneratorProps {
  onGenerate?: (params: ReadingTextParams) => void
  loading?: boolean
}

export default function ReadingTextGenerator({
  onGenerate,
  loading = false
}: ReadingTextGeneratorProps) {
  const [params, setParams] = useState<ReadingTextParams>({
    textType: 'normal',
    inputText: 'Боря плыл в лодке. Над рекой летали птицы. Солнце ярко светило.',
    fontSize: 'large',
    textCase: 'mixed',
    hasTitle: true,
    title: 'Упражнение на технику чтения',
    centerTitle: true,
    pageNumbers: true,
    includeInstructions: true,
    cutPercentage: 40,
    endingLength: 2,
    reversedWordCount: 2,
    extraLetterDensity: 30
  })

  const handleParamChange = <K extends keyof ReadingTextParams>(
    key: K,
    value: ReadingTextParams[K]
  ) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }

  const handleGenerate = () => {
    if (onGenerate) {
      onGenerate(params)
    }
  }

  const typeInfo = TEXT_TYPE_DESCRIPTIONS[params.textType]

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
          {/* Тип задания */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Тип задания
            </label>
            <select
              value={params.textType}
              onChange={(e) => handleParamChange('textType', e.target.value as ReadingTextType)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.entries(TEXT_TYPE_DESCRIPTIONS).map(([type, info]) => (
                <option key={type} value={type}>
                  {info.name}
                </option>
              ))}
            </select>

            {/* Описание выбранного типа */}
            <div className="mt-2 p-3 bg-blue-50 rounded-md">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-blue-800">{typeInfo.name}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  typeInfo.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                  typeInfo.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {typeInfo.difficulty === 'easy' ? 'Легко' :
                   typeInfo.difficulty === 'medium' ? 'Средне' : 'Сложно'}
                </span>
              </div>
              <p className="text-sm text-blue-600 mb-1">{typeInfo.description}</p>
              <p className="text-xs text-blue-500">Цель: {typeInfo.purpose}</p>
            </div>
          </div>

          {/* Размер шрифта */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Размер шрифта
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(FONT_SIZE_SETTINGS).map(([size, info]) => (
                <button
                  key={size}
                  onClick={() => handleParamChange('fontSize', size as FontSize)}
                  className={`p-3 text-center border rounded-md transition-colors ${
                    params.fontSize === size
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{info.name}</div>
                  <div className="text-xs opacity-75">{info.baseFontSize}pt</div>
                </button>
              ))}
            </div>
          </div>

          {/* Регистр текста */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Регистр букв
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'upper', label: 'ЗАГЛАВНЫЕ' },
                { value: 'lower', label: 'строчные' },
                { value: 'mixed', label: 'Смешанный' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleParamChange('textCase', option.value as TextCase)}
                  className={`p-2 text-center border rounded-md transition-colors ${
                    params.textCase === option.value
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
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

          {/* Форматирование */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-700">Форматирование</h3>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={params.hasTitle}
                onChange={(e) => handleParamChange('hasTitle', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Добавить заголовок</span>
            </label>

            {params.hasTitle && (
              <input
                type="text"
                value={params.title || ''}
                onChange={(e) => handleParamChange('title', e.target.value)}
                placeholder="Заголовок упражнения"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            )}

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={params.centerTitle}
                onChange={(e) => handleParamChange('centerTitle', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Центрировать заголовок</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={params.pageNumbers}
                onChange={(e) => handleParamChange('pageNumbers', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Номера страниц</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={params.includeInstructions}
                onChange={(e) => handleParamChange('includeInstructions', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Включить инструкции</span>
            </label>
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
            <div className="mt-1 text-xs text-gray-500">
              Символов: {params.inputText.length} |
              Слов: {params.inputText.split(/\s+/).filter(w => w.length > 0).length}
            </div>
          </div>

          {/* Кнопка генерации */}
          <button
            onClick={handleGenerate}
            disabled={loading || !params.inputText.trim()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Создание PDF...' : 'Создать упражнение'}
          </button>

          {/* Информация о результате */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h4 className="font-medium text-gray-700 mb-2">Что будет создано:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• PDF с обработанным текстом</li>
              <li>• {params.includeInstructions ? 'Страница с инструкциями' : 'Без инструкций'}</li>
              <li>• Шрифт: {FONT_SIZE_SETTINGS[params.fontSize].name}</li>
              <li>• {params.pageNumbers ? 'С номерами страниц' : 'Без номеров страниц'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}