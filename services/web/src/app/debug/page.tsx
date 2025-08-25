import Link from 'next/link'

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            🧪 Тест стилей и компонентов
          </h1>
          <p className="text-gray-600">Проверка применения стилей и корректности компонентов</p>
        </div>

        {/* Тест кнопок */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Кнопки</h2>
          <div className="flex flex-wrap gap-4">
            <button className="btn-primary">Primary</button>
            <button className="btn-secondary">Secondary</button>
            <button className="btn-success">Success</button>
            <button className="btn-danger">Danger</button>
            <button className="btn-outline">Outline</button>
            <button className="btn-ghost">Ghost</button>
          </div>
        </div>

        {/* Тест размеров кнопок */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Размеры кнопок</h2>
          <div className="flex flex-wrap items-center gap-4">
            <button className="btn-primary btn-xs">Extra Small</button>
            <button className="btn-primary btn-sm">Small</button>
            <button className="btn-primary">Default</button>
            <button className="btn-primary btn-lg">Large</button>
          </div>
        </div>

        {/* Тест градиентов */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Градиенты</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold">
              Blue-Purple
            </div>
            <div className="h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-semibold">
              Green-Blue
            </div>
            <div className="h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white font-semibold">
              Orange-Red
            </div>
          </div>
        </div>

        {/* Тест текстовых градиентов */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Текстовые градиенты</h2>
          <div className="space-y-2">
            <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Синий градиент</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Зелёный градиент</p>
          </div>
        </div>

        {/* Навигация */}
        <div className="text-center space-y-4">
          <div className="flex gap-4 justify-center">
            <Link href="/" className="btn-secondary">
              ← Главная
            </Link>
            <Link href="/filword" className="btn-primary">
              Филворд →
            </Link>
          </div>
          <p className="text-sm text-gray-500">
            Если стили применяются корректно, все элементы выше должны выглядеть красиво
          </p>
        </div>
      </div>
    </div>
  )
}
