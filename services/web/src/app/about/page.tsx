import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            О проекте ChildDev
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Образовательная платформа для создания качественных дидактических материалов
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="space-y-8">
            {/* Mission */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Наша миссия</h2>
              <p className="text-gray-600 leading-relaxed">
                ChildDev создана для того, чтобы помочь учителям, родителям и специалистам
                создавать профессиональные образовательные материалы быстро и легко.
                Мы убеждены, что качественные дидактические материалы должны быть доступны каждому.
              </p>
            </section>

            {/* Current Generators */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Реализованные генераторы</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🧩</span>
                    <h3 className="text-lg font-semibold text-gray-900">Филворды</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">
                    Словесные головоломки для развития внимания и логического мышления.
                    Настраиваемые сетки, тематические категории слов.
                  </p>
                  <Link
                    href="/filword"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Попробовать →
                  </Link>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">📖</span>
                    <h3 className="text-lg font-semibold text-gray-900">Тексты для чтения</h3>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                      Новое
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">
                    12 типов трансформаций текста для развития техники чтения,
                    скорочтения и коррекции дислексии.
                  </p>
                  <Link
                    href="/reading-text"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Попробовать →
                  </Link>
                </div>
              </div>
            </section>

            {/* Roadmap */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Планы развития</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">Фаза 2: Расширение генераторов</p>
                    <p className="text-gray-600 text-sm">
                      Кроссворды, математические задачи, раскраски, прописи
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gray-300 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">Фаза 3: Система пользователей</p>
                    <p className="text-gray-600 text-sm">
                      Личные кабинеты, избранное, подписки
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gray-300 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">Фаза 4: Образовательная экосистема</p>
                    <p className="text-gray-600 text-sm">
                      Библиотека материалов, журнал, сообщество специалистов
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Technology */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Технологии</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Платформа построена на современных технологиях для обеспечения высокой
                производительности и качества генерируемых PDF:
              </p>
              <ul className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Next.js 15 + TypeScript
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Playwright для PDF-рендера
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Docker для масштабирования
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Zod для валидации данных
                </li>
              </ul>
            </section>

            {/* Business Model */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Принципы работы</h2>
              <p className="text-gray-600 leading-relaxed">
                ChildDev создается как качественная образовательная платформа.
                Сейчас все генераторы доступны бесплатно в период MVP.
                В будущем планируется подписочная модель с расширенными возможностями
                и сохранением базового бесплатного доступа.
              </p>
            </section>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Начните создавать материалы прямо сейчас
          </h2>
          <p className="text-blue-100 mb-6">
            Выберите подходящий генератор и создайте первое задание
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/filword"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              🧩 Создать филворд
            </Link>
            <Link
              href="/reading-text"
              className="bg-white/10 backdrop-blur text-white border border-white/20 px-6 py-3 rounded-lg font-medium hover:bg-white/20 transition-colors"
            >
              📖 Тексты для чтения
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}