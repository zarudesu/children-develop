'use client'

import { useState } from 'react'
import {
  HandwritingParams,
  LineType,
  FontSize,
  TextStyle,
  LINE_TYPE_DESCRIPTIONS,
  FONT_SIZE_DESCRIPTIONS,
  TEXT_STYLE_DESCRIPTIONS,
  handwritingParamsSchema
} from '../types'

export function HandwritingGenerator() {
  const [params, setParams] = useState<HandwritingParams>({
    inputText: '',
    title: '',
    centerTitle: true,
    lineType: 'narrow-with-diagonal',
    fontSize: 'medium',
    textStyle: 'solid-gray',
    preserveParagraphs: true,
    includeInstructions: true
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const handleInputChange = (field: keyof HandwritingParams, value: any) => {
    setParams(prev => ({
      ...prev,
      [field]: value
    }))
    // Очистить ошибки валидации при изменении
    if (validationErrors.length > 0) {
      setValidationErrors([])
    }
  }

  const validateParams = (): boolean => {
    try {
      handwritingParamsSchema.parse(params)
      setValidationErrors([])
      return true
    } catch (error: any) {
      const errors = error.errors?.map((err: any) => err.message) || ['Ошибка валидации']
      setValidationErrors(errors)
      return false
    }
  }

  const handleGenerate = async () => {
    if (!validateParams()) {
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/handwriting/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
      })

      if (!response.ok) {
        throw new Error('Ошибка генерации PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `прописи-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Ошибка генерации:', error)
      alert('Произошла ошибка при генерации PDF')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Левая панель - настройки */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Настройки прописей</h2>

          {/* Текст для прописей */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Текст для прописей *
            </label>
            <textarea
              value={params.inputText}
              onChange={(e) => handleInputChange('inputText', e.target.value)}
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите текст для создания прописей..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Максимум 3000 символов. Поддерживается разбивка на абзацы.
            </p>
          </div>

          {/* Заголовок */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Заголовок (необязательно)
            </label>
            <input
              type="text"
              value={params.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Упражнение по письму"
            />
          </div>

          {/* Тип строк */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Тип строк *
            </label>
            <div className="space-y-2">
              {Object.entries(LINE_TYPE_DESCRIPTIONS).map(([key, desc]) => (
                <label key={key} className="flex items-start cursor-pointer">
                  <input
                    type="radio"
                    name="lineType"
                    value={key}
                    checked={params.lineType === key}
                    onChange={(e) => handleInputChange('lineType', e.target.value as LineType)}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{desc.name}</div>
                    <div className="text-sm text-gray-600">{desc.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Размер шрифта */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Размер шрифта *
            </label>
            <div className="space-y-2">
              {Object.entries(FONT_SIZE_DESCRIPTIONS).map(([key, desc]) => (
                <label key={key} className="flex items-start cursor-pointer">
                  <input
                    type="radio"
                    name="fontSize"
                    value={key}
                    checked={params.fontSize === key}
                    onChange={(e) => handleInputChange('fontSize', e.target.value as FontSize)}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{desc.name}</div>
                    <div className="text-sm text-gray-600">{desc.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Стиль текста */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Стиль текста *
            </label>
            <div className="space-y-2">
              {Object.entries(TEXT_STYLE_DESCRIPTIONS).map(([key, desc]) => (
                <label key={key} className="flex items-start cursor-pointer">
                  <input
                    type="radio"
                    name="textStyle"
                    value={key}
                    checked={params.textStyle === key}
                    onChange={(e) => handleInputChange('textStyle', e.target.value as TextStyle)}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{desc.name}</div>
                    <div className="text-sm text-gray-600">{desc.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Правая панель - дополнительные настройки и кнопка генерации */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Дополнительные настройки</h2>

          {/* Чекбоксы */}
          <div className="space-y-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={params.centerTitle}
                onChange={(e) => handleInputChange('centerTitle', e.target.checked)}
                className="mr-3"
              />
              <span className="text-gray-700">Центрировать заголовок</span>
            </label>

            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={params.preserveParagraphs}
                onChange={(e) => handleInputChange('preserveParagraphs', e.target.checked)}
                className="mr-3"
              />
              <span className="text-gray-700">Сохранять абзацы</span>
            </label>

            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={params.includeInstructions}
                onChange={(e) => handleInputChange('includeInstructions', e.target.checked)}
                className="mr-3"
              />
              <span className="text-gray-700">Включить инструкции</span>
            </label>
          </div>

          {/* Ошибки валидации */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <h4 className="text-red-800 font-medium mb-2">Ошибки заполнения:</h4>
              <ul className="text-red-700 text-sm space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Превью настроек */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Предварительный просмотр</h3>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Тип строк:</span> {LINE_TYPE_DESCRIPTIONS[params.lineType].name}</div>
              <div><span className="font-medium">Размер шрифта:</span> {FONT_SIZE_DESCRIPTIONS[params.fontSize].name}</div>
              <div><span className="font-medium">Стиль текста:</span> {TEXT_STYLE_DESCRIPTIONS[params.textStyle].name}</div>
              <div><span className="font-medium">Символов:</span> {params.inputText.length}</div>
              <div><span className="font-medium">Примерное время:</span> {Math.ceil(params.inputText.length / 50)} мин</div>
            </div>
          </div>

          {/* Кнопка генерации */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !params.inputText.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md transition-colors"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Создаем прописи...
              </span>
            ) : (
              '📄 Создать прописи PDF'
            )}
          </button>

          <div className="text-xs text-gray-500 text-center">
            PDF будет сохранен автоматически после генерации
          </div>
        </div>
      </div>
    </div>
  )
}