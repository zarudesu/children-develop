'use client'

import { useState } from 'react'
import { CrosswordGenerator } from './components/CrosswordGenerator'
import { CrosswordParams } from './types'

export default function CrosswordPage() {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async (params: CrosswordParams) => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate', {
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
        throw new Error(error.message || 'Ошибка генерации')
      }

      // Скачиваем PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `кроссворд-${new Date().getTime()}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Ошибка генерации:', error)
      alert(error instanceof Error ? error.message : 'Произошла ошибка')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🧩 Генератор кроссвордов
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Создавайте увлекательные кроссворды для развития словарного запаса и логического мышления.
            Идеально подходит для учебы, досуга и семейного времяпрепровождения.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <CrosswordGenerator
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        </div>

        {/* Информация о кроссвордах */}
        <div className="max-w-4xl mx-auto mt-12 bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            ✨ Особенности генератора кроссвордов
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Автоматическое размещение</h3>
                  <p className="text-gray-600 text-sm">Умный алгоритм размещения слов с пересечениями</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Настраиваемая сложность</h3>
                  <p className="text-gray-600 text-sm">Выбор размера сетки и уровня сложности</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Готовые шаблоны</h3>
                  <p className="text-gray-600 text-sm">Предустановленные темы и наборы слов</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Печатное качество</h3>
                  <p className="text-gray-600 text-sm">PDF с высоким разрешением для печати</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Ответы включены</h3>
                  <p className="text-gray-600 text-sm">Отдельная страница с решениями</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Кириллица</h3>
                  <p className="text-gray-600 text-sm">Полная поддержка русского языка</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}