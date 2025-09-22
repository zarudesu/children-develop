'use client'

import React, { useState } from 'react'
import CrosswordGenerator from './components/CrosswordGenerator'
import { CrosswordParams } from './types'
import { DownloadTracker } from '../utils/downloadTracker'

export default function CrosswordPage() {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async (params: CrosswordParams) => {
    try {
      setIsGenerating(true)

      console.log('Generating crossword with params:', params)

      // Используем DownloadTracker для отслеживания скачиваний
      const response = await DownloadTracker.trackDownloadFromFetch('/api/generate', {
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
        throw new Error(error.message || 'Ошибка генерации кроссворда')
      }

      // Скачиваем PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      // Генерируем имя файла
      const difficultyNames = {
        'easy': 'лёгкий',
        'medium': 'средний',
        'hard': 'сложный'
      }

      const difficultyName = difficultyNames[params.difficulty] || params.difficulty
      const fileName = `кроссворд-${difficultyName}-${params.gridSize}-${Date.now()}.pdf`

      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      console.log('Crossword PDF generated and downloaded successfully')

    } catch (error) {
      console.error('Error generating crossword:', error)
      alert(error instanceof Error ? error.message : 'Произошла ошибка при генерации кроссворда')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Генератор кроссвордов
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Создавайте профессиональные кроссворды с определениями.
              Выберите сложность, размер и стиль — получите готовый PDF для печати.
            </p>
          </div>

          <CrosswordGenerator
            onGenerate={handleGenerate}
            loading={isGenerating}
          />


          {/* Информационная секция */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                О генераторе кроссвордов
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">
                    Типы кроссвордов
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• <strong>Классический:</strong> Симметричный, много пересечений</li>
                    <li>• <strong>Американский:</strong> Поворотная симметрия, крупная сетка</li>
                    <li>• <strong>Скандинавский:</strong> Свободная форма, меньше ограничений</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">
                    Уровни сложности
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• <strong>Лёгкий:</strong> Слова 3-8 букв, много пересечений</li>
                    <li>• <strong>Средний:</strong> Слова 4-12 букв, умеренная сложность</li>
                    <li>• <strong>Сложный:</strong> Слова 5-15 букв, мало пересечений</li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">
                  💡 Совет методиста
                </h4>
                <p className="text-green-700 text-sm">
                  Начинайте с лёгких кроссвордов размером 11x11 для младших школьников.
                  Используйте знакомые слова и понятные определения. Постепенно увеличивайте
                  сложность и размер сетки.
                </p>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">
                  ✅ Особенности PDF
                </h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Автоматическая нумерация слов и определений</li>
                  <li>• Отдельная страница с ответами</li>
                  <li>• Крупная типографика для лучшей читаемости</li>
                  <li>• Симметричное расположение чёрных клеток</li>
                  <li>• Список определений по горизонтали и вертикали</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  )
}