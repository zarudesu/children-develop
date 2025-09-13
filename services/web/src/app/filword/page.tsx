import { Metadata } from 'next'
import FilwordGenerator from './components/FilwordGenerator'

export const metadata: Metadata = {
  title: 'Генератор филворда - ChildDev',
  description: 'Создайте образовательную головоломку "Найди слова" с настраиваемыми параметрами. Мгновенная генерация PDF с заданием и ответами.',
}

export default function FilwordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Хедер страницы */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">⊞</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Генератор филворда
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Создайте головоломку "Найди слова" за несколько кликов
                </p>
              </div>
            </div>
            
            <div className="hidden sm:flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Сервисы работают</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Краткое описание и преимущества */}
        <div className="mb-8 text-center">
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-gray-600 mb-6">
              Создавайте профессиональные филворды для учебы и развлечения. 
              Настройте размер, выберите слова и получите готовый PDF за минуту.
            </p>
            
            {/* Ключевые особенности */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center gap-3 p-4 bg-white/70 rounded-lg border border-white/50 backdrop-blur-sm">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-lg">⚡</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Быстро</h3>
                  <p className="text-sm text-gray-600">15-45 секунд</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-white/70 rounded-lg border border-white/50 backdrop-blur-sm">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-lg">📄</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Готовый PDF</h3>
                  <p className="text-sm text-gray-600">Задание + ответы</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-white/70 rounded-lg border border-white/50 backdrop-blur-sm">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-lg">🎯</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Настраиваемо</h3>
                  <p className="text-sm text-gray-600">Размер, слова, стиль</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Основной генератор */}
        <FilwordGenerator />
      </div>
      
    </div>
  )
}
