'use client'

import { useState } from 'react'
import Link from 'next/link'
import { UserMenu } from './auth/UserMenu'
import { LoginModal } from './auth/LoginModal'
import { RegisterModal } from './auth/RegisterModal'

export function Header() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)

  const handleSwitchToRegister = () => {
    setIsLoginModalOpen(false)
    setIsRegisterModalOpen(true)
  }

  const handleSwitchToLogin = () => {
    setIsRegisterModalOpen(false)
    setIsLoginModalOpen(true)
  }

  return (
    <>
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg font-bold">CD</span>
              </div>
              <div className="hidden sm:block">
                <div className="text-xl font-bold text-gray-900">ChildDev</div>
                <div className="text-xs text-gray-600">Конструкторы заданий</div>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/generators"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Генераторы
              </Link>
              <Link
                href="/filword"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Филворды
              </Link>
              <Link
                href="/crossword"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Кроссворды
              </Link>
              <Link
                href="/reading-text"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Тексты
              </Link>
              <Link
                href="/copy-text"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Списывание
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center">
              <UserMenu
                onLoginClick={() => setIsLoginModalOpen(true)}
                onRegisterClick={() => setIsRegisterModalOpen(true)}
              />
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200">
          <div className="px-4 py-3 space-y-1">
            <Link
              href="/generators"
              className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
            >
              🎯 Все генераторы
            </Link>
            <Link
              href="/filword"
              className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
            >
              🧩 Филворды
            </Link>
            <Link
              href="/crossword"
              className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
            >
              🔤 Кроссворды
            </Link>
            <Link
              href="/reading-text"
              className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
            >
              📖 Тексты для чтения
            </Link>
          </div>
        </div>
      </header>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSwitchToRegister={handleSwitchToRegister}
      />

      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </>
  )
}