'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface UserMenuProps {
  onLoginClick: () => void
  onRegisterClick: () => void
}

export function UserMenu({ onLoginClick, onRegisterClick }: UserMenuProps) {
  const { user, logout, loading } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await logout()
    setIsDropdownOpen(false)
  }

  const getSubscriptionBadge = (subscriptionType: string) => {
    switch (subscriptionType) {
      case 'premium':
        return <span className="text-xs bg-gold-100 text-gold-800 px-2 py-1 rounded-full">Premium</span>
      case 'family':
        return <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Family</span>
      case 'basic':
        return <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Basic</span>
      default:
        return <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Free</span>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={onLoginClick}
          className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          Войти
        </button>
        <button
          onClick={onRegisterClick}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Регистрация
        </button>
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {user.first_name ? user.first_name[0].toUpperCase() : user.email[0].toUpperCase()}
          </span>
        </div>
        <div className="text-left hidden sm:block">
          <div className="font-medium text-gray-900">
            {user.first_name && user.last_name
              ? `${user.first_name} ${user.last_name}`
              : user.first_name || 'Пользователь'
            }
          </div>
          <div className="text-sm text-gray-600">{user.email}</div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-medium">
                  {user.first_name ? user.first_name[0].toUpperCase() : user.email[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {user.first_name && user.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : user.first_name || 'Пользователь'
                  }
                </div>
                <div className="text-sm text-gray-600">{user.email}</div>
                <div className="mt-1">
                  {getSubscriptionBadge(user.subscription_type)}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-b border-gray-100">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Генераций сегодня</div>
                <div className="font-medium text-gray-900">{user.generations_today}</div>
              </div>
              <div>
                <div className="text-gray-600">Статус</div>
                <div className="font-medium text-green-600">Активен</div>
              </div>
            </div>
          </div>

          <div className="p-2">
            <button
              onClick={() => {
                setIsDropdownOpen(false)
                // TODO: Открыть страницу профиля
              }}
              className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Профиль
              </div>
            </button>

            <button
              onClick={() => {
                setIsDropdownOpen(false)
                // TODO: Открыть историю генераций
              }}
              className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                История генераций
              </div>
            </button>

            <button
              onClick={() => {
                setIsDropdownOpen(false)
                // TODO: Открыть настройки
              }}
              className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Настройки
              </div>
            </button>

            <div className="border-t border-gray-100 mt-2 pt-2">
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Выйти
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}