'use client'

interface ResultsDisplayProps {
  result: {
    pdfUrl: string
    metadata: {
      wordsCount: number
      gridSize: string
      generatedAt: string
    }
  } | null
  error: string | null
  isLoading: boolean
}

export default function ResultsDisplay({ result, error, isLoading }: ResultsDisplayProps) {
  const handleDownload = () => {
    if (!result) return
    
    const link = document.createElement('a')
    link.href = result.pdfUrl
    link.download = `filword-${result.metadata.gridSize}-${Date.now()}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleNewGeneration = () => {
    if (result?.pdfUrl) {
      URL.revokeObjectURL(result.pdfUrl)
    }
    window.location.reload()
  }

  const handlePrint = () => {
    if (!result) return
    const printWindow = window.open(result.pdfUrl, '_blank')
    if (printWindow) {
      printWindow.addEventListener('load', () => {
        printWindow.print()
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Состояние загрузки */}
      {isLoading && (
        <div className="card text-center py-12 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 animate-pulse">
            <svg 
              className="animate-spin h-8 w-8 text-white" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          
          <div className="max-w-md mx-auto space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">
              🎯 Создаю филворд...
            </h3>
            <div className="space-y-1 text-gray-600">
              <p className="text-sm">Размещаю слова в сетке</p>
              <p className="text-sm">Заполняю пустые ячейки</p>
              <p className="text-sm">Генерирую PDF с заданием и ответами</p>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse" 
                   style={{ width: '60%' }}></div>
            </div>
            <p className="text-xs text-gray-500">
              Обычно процесс занимает 15-45 секунд
            </p>
          </div>
        </div>
      )}

      {/* Ошибка */}
      {error && (
        <div className="card border-red-300 bg-red-50">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg 
                className="h-6 w-6 text-red-600" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Ошибка генерации
              </h3>
              <p className="text-red-700 mb-4">
                {error}
              </p>
              
              <div className="bg-red-100/50 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2">💡 Возможные решения:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Попробуйте уменьшить количество слов</li>
                  <li>• Увеличьте размер сетки</li>
                  <li>• Проверьте интернет-соединение</li>
                  <li>• Обновите страницу и попробуйте снова</li>
                </ul>
              </div>
              
              <button
                onClick={() => window.location.reload()}
                className="mt-4 btn-secondary"
              >
                🔄 Обновить страницу
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Успешный результат */}
      {result && !isLoading && (
        <div className="space-y-4">
          <div className="card border-green-300 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                <svg 
                  className="h-5 w-5 text-green-600" 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  🎉 Филворд готов!
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="bg-white/70 p-2 rounded-lg">
                    <p className="font-medium text-green-800 text-xs">Размер сетки</p>
                    <p className="text-green-700">{result.metadata.gridSize}</p>
                  </div>
                  <div className="bg-white/70 p-2 rounded-lg">
                    <p className="font-medium text-green-800 text-xs">Слов в филворде</p>
                    <p className="text-green-700">{result.metadata.wordsCount}</p>
                  </div>
                  <div className="bg-white/70 p-2 rounded-lg">
                    <p className="font-medium text-green-800 text-xs">Создан</p>
                    <p className="text-green-700 text-xs">{result.metadata.generatedAt}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-24 h-28 bg-gradient-to-b from-red-500 to-red-600 rounded-lg shadow-lg transform hover:scale-105 transition-transform">
                <div className="text-center text-white">
                  <svg 
                    className="h-12 w-10 mx-auto mb-1" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                  <span className="text-xs font-bold">PDF</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Филворд готов к использованию
                </h3>
                <p className="text-gray-600 mb-6">
                  PDF содержит 2 страницы: головоломку для учеников и ответы для проверки
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                  <button
                    onClick={handleDownload}
                    className="btn-primary flex items-center justify-center gap-2 flex-1"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Скачать PDF
                  </button>
                  
                  <button
                    onClick={handlePrint}
                    className="btn-secondary flex items-center justify-center gap-2 flex-1"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Печать
                  </button>
                </div>
                
                <button
                  onClick={handleNewGeneration}
                  className="mt-4 text-gray-600 hover:text-gray-800 text-sm underline"
                >
                  Создать новый филворд
                </button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="card bg-blue-50 border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <span className="text-lg">📋</span>
                Для учителей
              </h4>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Страница 1 — задание для распечатки ученикам</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Страница 2 — ответы для быстрой проверки</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Используйте цветные карандаши для выделения найденных слов</span>
                </li>
              </ul>
            </div>

            <div className="card bg-green-50 border-green-200">
              <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                <span className="text-lg">🎯</span>
                Правила игры
              </h4>
              <ul className="text-sm text-green-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>Найдите все слова из списка в буквенной сетке</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>Слова могут идти в разных направлениях</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>Обведите или выделите найденные слова</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Начальное состояние */}
      {!result && !error && !isLoading && (
        <div className="card text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-sm mx-auto space-y-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center">
              <span className="text-3xl text-white">📄</span>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Готов к созданию филворда
              </h3>
              <p className="text-gray-600 mb-4">
                Настройте параметры в левой части экрана и нажмите кнопку создания
              </p>
              
              <div className="text-left bg-white/50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-gray-800 text-center mb-3">Быстрый старт:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    Выберите размер сетки
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    Укажите направления слов
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    Добавьте слова или выберите категорию
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                    Нажмите "Создать филворд"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
