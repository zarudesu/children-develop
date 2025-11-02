'use client'

import { useState, useCallback } from 'react'
import {
  CopyTextParams,
  CopyTextStyle,
  FontSize,
  LineSpacing,
  COPY_TEXT_STYLES,
  FONT_SIZE_SETTINGS,
  LINE_SPACING_SETTINGS,
  CopyTextParamsSchema
} from '../types'

interface CopyTextGeneratorProps {
  onGenerate?: (params: CopyTextParams) => void
  isGenerating?: boolean
  error?: string | null
}

export function CopyTextGenerator({
  onGenerate,
  isGenerating = false,
  error
}: CopyTextGeneratorProps) {
  const [params, setParams] = useState<CopyTextParams>({
    inputText: '',
    style: 'printed',
    fontSize: 'large',
    lineSpacing: '1.5',
    centerTitle: true,
    preserveParagraphs: true,
    allowWordBreaks: false,
    includeExerciseInstructions: true,
    title: ''
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const handleParamChange = useCallback(<K extends keyof CopyTextParams>(
    key: K,
    value: CopyTextParams[K]
  ) => {
    setParams(prev => ({
      ...prev,
      [key]: value
    }))

    // Очищаем ошибку валидации для этого поля
    if (validationErrors[key]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[key]
        return newErrors
      })
    }
  }, [validationErrors])

  const validateAndGenerate = useCallback(() => {
    try {
      const validatedParams = CopyTextParamsSchema.parse(params)
      setValidationErrors({})
      onGenerate?.(validatedParams)
    } catch (error) {
      if (error instanceof Error && 'issues' in error) {
        const zodError = error as any
        const newErrors: Record<string, string> = {}
        zodError.issues?.forEach((issue: any) => {
          const field = issue.path[0]
          if (field) {
            newErrors[field] = issue.message
          }
        })
        setValidationErrors(newErrors)
      }
    }
  }, [params, onGenerate])

  const estimateTime = useCallback(() => {
    const wordCount = params.inputText.trim().split(/\s+/).filter(word => word.length > 0).length
    // Примерно 3-5 слов в минуту для списывания
    return Math.ceil(wordCount / 4)
  }, [params.inputText])

  const getCharacterCount = useCallback(() => {
    return params.inputText.length
  }, [params.inputText])

  const getWordCount = useCallback(() => {
    return params.inputText.trim().split(/\s+/).filter(word => word.length > 0).length
  }, [params.inputText])

  return (
    <div className="space-y-8">
      {/* Ошибки */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600 mr-3">❌</div>
            <div>
              <h3 className="text-sm font-medium text-red-800">Ошибка генерации</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Настройки */}
        <div className="lg:col-span-2 space-y-6">
          {/* Текст для списывания */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              📝 Текст для списывания
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Введите текст
                </label>
                <textarea
                  value={params.inputText}
                  onChange={(e) => handleParamChange('inputText', e.target.value)}
                  placeholder="Введите текст, который нужно будет переписать..."
                  className={`input resize-none h-32 ${
                    validationErrors.inputText ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                />
                {validationErrors.inputText && (
                  <p className="text-sm text-red-600 mt-1">{validationErrors.inputText}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Заголовок (опционально)
                </label>
                <input
                  type="text"
                  value={params.title || ''}
                  onChange={(e) => handleParamChange('title', e.target.value)}
                  placeholder="Заголовок упражнения"
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Стиль текста */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              🎨 Стиль текста
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(COPY_TEXT_STYLES).map(([style, info]) => (
                <div key={style} className="relative">
                  <label
                    className={`
                      block p-4 border-2 rounded-lg cursor-pointer transition-all
                      ${params.style === style
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="style"
                      value={style}
                      checked={params.style === style}
                      onChange={(e) => handleParamChange('style', e.target.value as CopyTextStyle)}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className="text-lg font-medium text-gray-800 mb-2">
                        {info.name}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {info.description}
                      </div>
                      <div className="text-xs text-blue-600">
                        📚 {info.purpose}
                      </div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Форматирование */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              ⚙️ Форматирование
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Размер шрифта */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Размер шрифта
                </label>
                <div className="space-y-2">
                  {Object.entries(FONT_SIZE_SETTINGS).map(([size, info]) => (
                    <label key={size} className="flex items-center">
                      <input
                        type="radio"
                        name="fontSize"
                        value={size}
                        checked={params.fontSize === size}
                        onChange={(e) => handleParamChange('fontSize', e.target.value as FontSize)}
                        className="mr-3"
                      />
                      <div>
                        <span className="font-medium">{info.name}</span>
                        <div className="text-sm text-gray-600">{info.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Межстрочный интервал */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Межстрочный интервал
                </label>
                <div className="space-y-2">
                  {Object.entries(LINE_SPACING_SETTINGS).map(([spacing, info]) => (
                    <label key={spacing} className="flex items-center">
                      <input
                        type="radio"
                        name="lineSpacing"
                        value={spacing}
                        checked={params.lineSpacing === spacing}
                        onChange={(e) => handleParamChange('lineSpacing', e.target.value as LineSpacing)}
                        className="mr-3"
                      />
                      <div>
                        <span className="font-medium">{info.name}</span>
                        <div className="text-sm text-gray-600">{info.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Дополнительные настройки */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              🔧 Дополнительные настройки
            </h2>

            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={params.centerTitle}
                  onChange={(e) => handleParamChange('centerTitle', e.target.checked)}
                  className="mr-3"
                />
                <div>
                  <span className="font-medium">Центрировать заголовок</span>
                  <div className="text-sm text-gray-600">Заголовок будет располагаться по центру страницы</div>
                </div>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={params.preserveParagraphs}
                  onChange={(e) => handleParamChange('preserveParagraphs', e.target.checked)}
                  className="mr-3"
                />
                <div>
                  <span className="font-medium">Сохранять абзацы</span>
                  <div className="text-sm text-gray-600">Переносы строк и абзацы будут сохранены</div>
                </div>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={params.allowWordBreaks}
                  onChange={(e) => handleParamChange('allowWordBreaks', e.target.checked)}
                  className="mr-3"
                />
                <div>
                  <span className="font-medium">Разрешить перенос слов</span>
                  <div className="text-sm text-gray-600">Слова могут переноситься на следующую строку</div>
                </div>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={params.includeExerciseInstructions}
                  onChange={(e) => handleParamChange('includeExerciseInstructions', e.target.checked)}
                  className="mr-3"
                />
                <div>
                  <span className="font-medium">Включить инструкции</span>
                  <div className="text-sm text-gray-600">Добавить краткие инструкции к упражнению</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          {/* Статистика */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              📊 Статистика
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Символов:</span>
                <span className="font-medium">{getCharacterCount()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Слов:</span>
                <span className="font-medium">{getWordCount()}</span>
              </div>
              {getWordCount() > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Время выполнения:</span>
                  <span className="font-medium text-blue-600">~{estimateTime()} мин</span>
                </div>
              )}
            </div>
          </div>

          {/* Превью текста */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              👁️ Превью
            </h3>
            <div
              className="p-4 bg-gray-50 rounded-lg border min-h-[100px]"
              style={{
                fontSize: FONT_SIZE_SETTINGS[params.fontSize].cssSize,
                lineHeight: LINE_SPACING_SETTINGS[params.lineSpacing].cssValue,
                fontFamily: params.style === 'handwritten'
                  ? '"Kalam", "Comic Sans MS", cursive'
                  : '"Times New Roman", serif'
              }}
            >
              {params.title && (
                <div
                  className={`font-bold mb-3 ${params.centerTitle ? 'text-center' : ''}`}
                >
                  {params.title}
                </div>
              )}
              {params.inputText ? (
                <div style={{ whiteSpace: params.preserveParagraphs ? 'pre-line' : 'normal' }}>
                  {params.inputText.slice(0, 200)}
                  {params.inputText.length > 200 && '...'}
                </div>
              ) : (
                <div className="text-gray-400 text-sm">
                  Введите текст для предварительного просмотра
                </div>
              )}
            </div>
          </div>

          {/* Кнопка генерации */}
          <button
            onClick={validateAndGenerate}
            disabled={isGenerating || !params.inputText.trim()}
            className={`w-full btn-primary btn-lg ${
              isGenerating || !params.inputText.trim()
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:shadow-lg'
            }`}
          >
            {isGenerating ? (
              <div className="flex items-center justify-center">
                <div className="loading-spinner w-5 h-5 mr-2"></div>
                Генерируется...
              </div>
            ) : (
              <>
                📄 Создать PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}