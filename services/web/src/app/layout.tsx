import './globals.css'
import type { Metadata } from 'next'
import Navigation from '../components/Navigation'

export const metadata: Metadata = {
  title: 'ChildDev - Генераторы образовательных заданий',
  description: 'Создайте профессиональные дидактические материалы за 2 минуты. Филворды, тексты для чтения с 12 типами трансформаций, и другие развивающие упражнения.',
  keywords: 'филворд, тексты для чтения, образовательные задания, техника чтения, скорочтение, дислексия, головоломки, дети, школа, дидактические материалы',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className="light" style={{colorScheme: 'light'}}>
      <body className="min-h-screen font-sans antialiased bg-white text-gray-900">
        <Navigation />

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
                © 2025 ChildDev. Образовательная платформа.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
