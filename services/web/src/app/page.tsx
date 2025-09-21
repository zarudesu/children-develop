import Link from 'next/link'
import { GeneratorCard } from '../components/GeneratorCard'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform">
                <span className="text-white text-3xl font-bold">CD</span>
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Генератор образовательных
              </span>
              <br />
              <span className="text-gray-900">заданий</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Создавайте профессиональные дидактические материалы 
              <span className="font-semibold text-blue-600">за 2 минуты</span>. 
              Готовые PDF с заданиями и ответами.
            </p>
            
            {/* Quick stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-12 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Бесплатно</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Без регистрации</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Мгновенно</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/filword"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                <span className="text-xl">🧩</span>
                Создать филворд
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>

              <Link
                href="/reading-text"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                <span className="text-xl">📖</span>
                Тексты для чтения
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
        </div>
      </div>

      {/* Generators Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Наши генераторы
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Выберите подходящий инструмент для создания образовательных материалов
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {/* Филворды */}
            <GeneratorCard
              title="Филворды"
              description="Создавайте словесные головоломки с настраиваемыми параметрами. Идеально для развития внимания и логического мышления."
              icon="🧩"
              href="/filword"
              difficulty={['Легко', 'Средне', 'Сложно']}
              ageGroups={['6-8 лет', '9-12 лет', '13+ лет']}
              features={[
                'Сетки от 10x10 до 20x20',
                'Тематические категории слов',
                'Настройка направлений размещения',
                'Двухстраничный PDF с ответами'
              ]}
            />

            {/* Тексты для чтения */}
            <GeneratorCard
              title="Тексты для чтения"
              description="12 типов трансформаций текста для развития техники чтения, скорочтения и коррекции дислексии."
              icon="📖"
              href="/reading-text"
              difficulty={['Легко', 'Средне', 'Сложно']}
              ageGroups={['3-5 лет', '6-8 лет', '9-12 лет', '13+ лет']}
              features={[
                'Обрезание букв (верх/низ)',
                'Анаграммы с настройками',
                'Зеркальный текст',
                'Смешанные типы упражнений'
              ]}
              isNew={true}
            />

            {/* Планируемые генераторы */}
            <GeneratorCard
              title="Кроссворды"
              description="Классические и тематические кроссворды с автоматической генерацией сетки и подсказок."
              icon="🔤"
              href="#"
              difficulty={['Легко', 'Средне', 'Сложно']}
              ageGroups={['8-10 лет', '11-15 лет', '16+ лет']}
              features={[
                'Автоматическая сетка',
                'Тематические категории',
                'Настройка сложности',
                'Красивые шаблоны'
              ]}
              isComingSoon={true}
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Почему выбирают ChildDev?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Мы создали платформу, которая экономит время учителей и делает обучение интереснее
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all transform group-hover:scale-110">
                <span className="text-white text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Мгновенно</h3>
              <p className="text-gray-600">
                От идеи до готового PDF — всего несколько кликов. Никаких сложных редакторов.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all transform group-hover:scale-110">
                <span className="text-white text-2xl">🎨</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Профессионально</h3>
              <p className="text-gray-600">
                Красивый дизайн, оптимизированный для печати. Крупные шрифты, четкие линии.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all transform group-hover:scale-110">
                <span className="text-white text-2xl">⚙️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Гибко</h3>
              <p className="text-gray-600">
                Множество настроек: размер, сложность, темы. Подходит для любого возраста.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-red-400 to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all transform group-hover:scale-110">
                <span className="text-white text-2xl">🆓</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Бесплатно</h3>
              <p className="text-gray-600">
                Полный доступ без регистрации. Создавайте сколько угодно заданий.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Начните создавать прямо сейчас
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Выберите генератор и создайте первое задание за 2 минуты. Никакой регистрации или оплаты.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/filword"
              className="inline-flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              <span className="text-xl">🧩</span>
              Создать филворд
            </Link>
            <Link
              href="/reading-text"
              className="inline-flex items-center gap-3 bg-white/10 backdrop-blur text-white border border-white/20 px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl hover:bg-white/20 transform hover:scale-105 transition-all"
            >
              <span className="text-xl">📖</span>
              Тексты для чтения
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
