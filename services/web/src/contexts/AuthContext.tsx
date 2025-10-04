'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import directus, { DirectusUser, getCurrentUser, loginUser, logoutUser, registerUser } from '../lib/directus'

interface AuthContextType {
  user: DirectusUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<DirectusUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      setLoading(true)

      // Получаем данные текущего пользователя (если авторизован)
      const currentUser = await getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
      }
    } catch (error) {
      console.error('Auth initialization failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)

      const user = await loginUser(email, password)
      if (user) {
        setUser(user)
      } else {
        throw new Error('Неверный email или пароль')
      }
    } catch (error) {
      console.error('Login failed:', error)
      throw new Error('Неверный email или пароль')
    } finally {
      setLoading(false)
    }
  }

  const register = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) => {
    try {
      setLoading(true)

      const user = await registerUser({
        email,
        password,
        first_name: firstName,
        last_name: lastName
      })

      if (user) {
        setUser(user)
      } else {
        throw new Error('Ошибка регистрации')
      }
    } catch (error) {
      console.error('Registration failed:', error)
      throw new Error('Ошибка регистрации. Возможно, пользователь с таким email уже существует')
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await logoutUser()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Очищаем локальное состояние в любом случае
      setUser(null)
    }
  }

  const refreshAuth = async () => {
    if (!user) return

    try {
      const updatedUser = await getCurrentUser()
      if (updatedUser) {
        setUser(updatedUser)
      } else {
        await logout()
      }
    } catch (error) {
      console.error('Auth refresh failed:', error)
      // При ошибке разлогиниваем пользователя
      await logout()
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    refreshAuth
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}