'use client'

import React, { useState } from 'react'
import ReadingTextGenerator from './components/ReadingTextGenerator'
import { ReadingTextParams } from './types'

export default function ReadingTextPage() {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async (params: ReadingTextParams) => {
    try {
      setIsGenerating(true)

      console.log('Generating reading text with params:', params)

      // Прямой вызов PDF сервиса (обход проблем с кешированием Next.js)
      const response = await fetch('http://localhost:3001/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'reading-text',
          params
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Ошибка генерации PDF')
      }

      // Скачиваем PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      // Генерируем имя файла на основе типа упражнения
      const typeNames: Record<string, string> = {
        'normal': 'обычный-текст',
        'bottom-cut': 'без-нижней-части',
        'top-cut': 'без-верхней-части',
        'missing-endings': 'без-окончаний',
        'missing-vowels': 'без-гласных',
        'partial-reversed': 'перевернутые-слова',
        'scrambled-words': 'анаграммы',
        'merged-text': 'слитный-текст',
        'extra-letters': 'лишние-буквы',
        'mirror-text': 'зеркальный-текст',
        'mixed-types': 'смешанный-тип',
        'word-ladder': 'лесенка-слов'
      }

      const typeName = typeNames[params.textType] || params.textType
      const fileName = `текст-для-чтения-${typeName}-${Date.now()}.pdf`

      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      console.log('PDF generated and downloaded successfully')

    } catch (error) {
      console.error('Error generating PDF:', error)
      alert(error instanceof Error ? error.message : 'Произошла ошибка при генерации PDF')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Конструктор текстов для чтения
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Создавайте специальные упражнения для развития техники чтения, скорочтения
            и коррекции дислексии. 12 различных типов заданий для эффективного обучения.
          </p>
        </div>

        <ReadingTextGenerator
          onGenerate={handleGenerate}
          loading={isGenerating}
        />

        {/* Информационная секция */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              О конструкторе текстов для чтения
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Для кого предназначен
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Учителя начальных классов</li>
                  <li>• Логопеды и дефектологи</li>
                  <li>• Родители детей с дислексией</li>
                  <li>• Специалисты по скорочтению</li>
                  <li>• Психологи образовательных учреждений</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Что развивает
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Технику и скорость чтения</li>
                  <li>• Зрительное восприятие текста</li>
                  <li>• Концентрацию внимания</li>
                  <li>• Переключаемость внимания</li>
                  <li>• Анализ и синтез слов</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">
                💡 Совет педагога
              </h4>
              <p className="text-blue-700 text-sm">
                Начинайте с простых упражнений (обычный текст, обрезанные буквы)
                и постепенно переходите к более сложным (анаграммы, смешанный тип).
                Важно учитывать индивидуальные особенности ученика и не переутомлять его.
              </p>
            </div>

            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">
                ✅ Требования к PDF
              </h4>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• Соблюдение правил переноса по слогам</li>
                <li>• Крупная типографика для лучшего восприятия</li>
                <li>• Четкие контрасты и читаемые шрифты</li>
                <li>• Инструкции для правильного выполнения</li>
                <li>• Номера страниц для удобной навигации</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}