'use client'

import { useState, useCallback } from 'react'
import { CopyTextParams, CopyTextResult } from './types'
import { CopyTextGenerator } from './components/CopyTextGenerator'

export default function CopyTextPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = useCallback(async (params: CopyTextParams) => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/copy-text/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ошибка генерации')
      }

      // Получаем PDF как blob
      const pdfBlob = await response.blob()

      // Создаем URL для скачивания
      const url = window.URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url

      // Генерируем имя файла
      const timestamp = new Date().toISOString().slice(0, 16).replace(/[-:]/g, '').replace('T', '_')
      const filename = `Списывание_${params.style === 'printed' ? 'печатное' : 'письменное'}_${timestamp}.pdf`

      link.download = filename
      document.body.appendChild(link)
      link.click()

      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Ошибка генерации:', error)
      setError(error instanceof Error ? error.message : 'Неизвестная ошибка')
    } finally {
      setIsGenerating(false)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container-width section-padding">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gradient-blue mb-4">
            📝 Списывание текста по образцу
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Создайте упражнения для развития навыков списывания текста.
            Выберите стиль текста (печатный или письменный) и настройте параметры форматирования.
          </p>
        </div>

        {/* Основной контент */}
        <div className="max-w-4xl mx-auto">
          <CopyTextGenerator
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            error={error}
          />
        </div>

        {/* Информация о генераторе */}
        <div className="mt-12 max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              ℹ️ О генераторе списывания
            </h2>
            <div className="space-y-4 text-gray-600">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">🎯 Назначение:</h3>
                <p>
                  Генератор создает упражнения для развития навыков аккуратного переписывания текста,
                  что важно для формирования красивого почерка и внимательности.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-800 mb-2">📋 Варианты упражнений:</h3>
                <ul className="list-disc ml-6 space-y-1">
                  <li><strong>С печатного текста:</strong> ребенок переписывает печатный текст письменными буквами</li>
                  <li><strong>С письменного текста:</strong> ребенок копирует уже написанный от руки текст</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-gray-800 mb-2">⚙️ Настройки:</h3>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Размер шрифта от 12pt до 16pt для комфортного чтения</li>
                  <li>Межстрочный интервал 1.25-1.75 для удобства письма</li>
                  <li>Сохранение абзацев и правильных переносов слов</li>
                  <li>Возможность центрирования заголовка</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}