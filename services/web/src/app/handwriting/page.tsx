'use client'

import { useState } from 'react'
import { HandwritingGenerator } from './components/HandwritingGenerator'

export default function HandwritingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              ✍️ Конструктор прописей
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Создавайте качественные прописи для обучения письму.
              Выберите тип строк, размер шрифта и стиль текста для идеальных упражнений.
            </p>
          </div>

          <HandwritingGenerator />
        </div>
      </div>
    </div>
  )
}