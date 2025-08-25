import './globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'ChildDev - Генератор образовательных заданий',
  description: 'Создайте профессиональные дидактические материалы за 2 минуты. Филворды, кроссворды и другие головоломки.',
  keywords: 'филворд, образовательные задания, головоломки, дети, школа, дидактические материалы',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className="light" style={{colorScheme: 'light'}}>
      <body className="min-h-screen font-sans antialiased bg-white text-gray-900">
        <header className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white text-lg font-bold">CD</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    ChildDev
                  </h1>
                  <span className="text-xs text-gray-500">
                    Образовательные материалы
                  </span>
                </div>
              </Link>

              {/* Навигация */}
              <nav className="hidden sm:flex items-center gap-6">
                <Link 
                  href="/filword" 
                  className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
                >
                  Филворд
                </Link>
                <span className="text-gray-400 text-sm">Кроссворд (скоро)</span>
                <span className="text-gray-400 text-sm">Анаграммы (скоро)</span>
              </nav>

              {/* Мобильное меню */}
              <div className="sm:hidden">
                <Link 
                  href="/filword" 
                  className="btn-primary btn-sm"
                >
                  Создать
                </Link>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1">
          {children}
        </main>
        
        <footer className="bg-white border-t">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">CD</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm max-w-md mx-auto">
                Создаем качественные образовательные материалы для учителей, родителей и репетиторов
              </p>
              <p className="text-gray-400 text-xs">
                © 2025 ChildDev. Бесплатно и с открытым исходным кодом.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
