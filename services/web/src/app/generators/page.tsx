import Link from 'next/link'
import { GeneratorCard } from '../../components/GeneratorCard'

export default function GeneratorsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              На главную
            </Link>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg font-bold">CD</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Все генераторы</h1>
                <p className="text-sm text-gray-600">Выберите подходящий инструмент</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generators Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Active Generators */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ✨ Доступные генераторы
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Готовые к использованию инструменты для создания развивающих материалов
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
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
              description="Трансформации текста для развития техники чтения и скорочтения."
              icon="📖"
              href="/reading-text"
              difficulty={['Легко', 'Средне', 'Сложно']}
              ageGroups={['6-8 лет', '9-12 лет', '13+ лет']}
              features={[
                'Недописанные буквы',
                'Перепутанные слова',
                'Зеркальный текст',
                'Смешанные типы упражнений'
              ]}
              isNew={true}
            />

            {/* Кроссворды */}
            <GeneratorCard
              title="Кроссворды"
              description="Классические и тематические кроссворды с автоматической генерацией сетки и подсказок."
              icon="🔤"
              href="/crossword"
              difficulty={['Легко', 'Средне', 'Сложно']}
              ageGroups={['8-10 лет', '11-15 лет', '16+ лет']}
              features={[
                'Автоматическая сетка',
                'Тематические категории',
                'Настройка сложности',
                'Красивые шаблоны'
              ]}
              isNew={true}
            />
          </div>
        </section>

        {/* Coming Soon */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🚀 В разработке
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Новые генераторы, которые скоро появятся на платформе
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Математические задачи */}
            <GeneratorCard
              title="Математика"
              description="Автоматическая генерация математических примеров и задач разной сложности."
              icon="🔢"
              href="#"
              difficulty={['1-2 класс', '3-4 класс', '5-6 класс']}
              ageGroups={['6-8 лет', '9-12 лет', '13+ лет']}
              features={[
                'Примеры на сложение',
                'Задачи на логику',
                'Геометрические фигуры',
                'Дроби и проценты'
              ]}
              isComingSoon={true}
            />

            {/* Раскраски */}
            <GeneratorCard
              title="Раскраски"
              description="Создание контурных рисунков для раскрашивания с различными темами."
              icon="🎨"
              href="#"
              difficulty={['Простые', 'Детальные', 'Сложные']}
              ageGroups={['3-5 лет', '6-8 лет', '9+ лет']}
              features={[
                'Тематические картинки',
                'Контроль детализации',
                'Подписи к элементам',
                'Цветные образцы'
              ]}
              isComingSoon={true}
            />

            {/* Прописи */}
            <GeneratorCard
              title="Прописи"
              description="Генерация листов для тренировки письма букв, слов и предложений."
              icon="✍️"
              href="/handwriting"
              difficulty={['Буквы', 'Слоги', 'Слова']}
              ageGroups={['4-6 лет', '7-8 лет']}
              features={[
                'Печатные и прописные',
                'Направляющие линии',
                'Пошаговые инструкции',
                'Контроль наклона'
              ]}
              isNew={true}
            />

            {/* Лабиринты */}
            <GeneratorCard
              title="Лабиринты"
              description="Автоматическое создание лабиринтов разной сложности и тематики."
              icon="🌀"
              href="#"
              difficulty={['Простые', 'Средние', 'Сложные']}
              ageGroups={['5-7 лет', '8-12 лет', '13+ лет']}
              features={[
                'Разные размеры сеток',
                'Тематические элементы',
                'Несколько решений',
                'Контроль сложности'
              ]}
              isComingSoon={true}
            />
          </div>
        </section>

        {/* Categories */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              📚 По категориям
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Выберите генераторы по направлению развития
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/generators?category=language"
              className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 hover:border-blue-200"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <span className="text-2xl">📝</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Развитие речи</h3>
                  <p className="text-gray-600">Филворды, кроссворды, чтение</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Генераторы для развития словарного запаса, техники чтения и грамотности
              </p>
            </Link>

            <Link
              href="/generators?category=math"
              className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 hover:border-green-200"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <span className="text-2xl">🔢</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Математика</h3>
                  <p className="text-gray-600">Примеры, задачи, логика</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Инструменты для изучения математики и развития логического мышления
              </p>
            </Link>

            <Link
              href="/generators?category=creative"
              className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 hover:border-purple-200"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <span className="text-2xl">🎨</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Творчество</h3>
                  <p className="text-gray-600">Раскраски, прописи</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Развитие мелкой моторики, художественного вкуса и творческих способностей
              </p>
            </Link>
          </div>
        </section>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Создавайте материалы прямо сейчас
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Выберите генератор и создайте первое задание за 2 минуты
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
            <Link
              href="/crossword"
              className="inline-flex items-center gap-3 bg-white/10 backdrop-blur text-white border border-white/20 px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl hover:bg-white/20 transform hover:scale-105 transition-all"
            >
              <span className="text-xl">🔤</span>
              Создать кроссворд
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}