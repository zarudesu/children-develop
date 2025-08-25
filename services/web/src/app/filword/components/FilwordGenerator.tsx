'use client'

import { useState, useRef } from 'react'
import { FilwordParams, GridSize, TextCase } from '../types'
import { validateFilwordParams } from '../utils/validation'
import ParametersForm from './ParametersForm'
import ResultsDisplay from './ResultsDisplay'

export default function FilwordGenerator() {
  const [params, setParams] = useState<FilwordParams>({
    words: [],
    gridSize: '14x14',
    directions: {
      right: true,
      left: true,
      up: true,
      down: true,
    },
    textCase: 'upper',
  })
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<{
    pdfUrl: string
    metadata: {
      wordsCount: number
      gridSize: string
      generatedAt: string
    }
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Ref для автоскролла к результатам
  const resultsRef = useRef<HTMLDivElement>(null)

  const handleGenerate = async (newParams: FilwordParams) => {
    setError(null)
    setResult(null)
    
    // Валидация
    const validation = validateFilwordParams(newParams)
    if (!validation.success) {
      setError(validation.error)
      // Автоскролл к ошибке
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        })
      }, 100)
      return
    }

    setIsGenerating(true)
    
    // Автоскролл к результатам через небольшую задержку
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }, 100)
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newParams),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Ошибка генерации PDF')
      }

      // Получаем PDF как blob
      const pdfBlob = await response.blob()
      const pdfUrl = URL.createObjectURL(pdfBlob)
      
      setResult({
        pdfUrl,
        metadata: {
          wordsCount: newParams.words.length,
          gridSize: newParams.gridSize,
          generatedAt: new Date().toLocaleString('ru-RU'),
        }
      })
      
      setParams(newParams)
      
    } catch (err) {
      console.error('Generation error:', err)
      setError(err instanceof Error ? err.message : 'Произошла неизвестная ошибка')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Форма настроек */}
      <ParametersForm
        initialParams={params}
        onParamsChange={setParams}
        onGenerate={handleGenerate}
        isLoading={isGenerating}
        error={error} // Передаем ошибку в форму для отображения
      />

      {/* Результат сразу под формой */}
      <div ref={resultsRef}>
        <ResultsDisplay
          result={result}
          error={error}
          isLoading={isGenerating}
        />
      </div>
    </div>
  )
}