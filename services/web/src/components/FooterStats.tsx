'use client'

import { useEffect, useState } from 'react'
import { statisticsService, type DownloadStats } from '../app/utils/statistics'

interface GlobalStats {
  filword: number
  readingText: number
  crossword: number
  copyText: number
  handwriting: number
  total: number
  lastUpdate: string
}

export function FooterStats() {
  const [localStats, setLocalStats] = useState<DownloadStats>({
    total: 0,
    filword: 0,
    readingText: 0,
    crossword: 0,
    lastUpdate: new Date().toISOString()
  })

  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null)

  // Подписка на локальную статистику
  useEffect(() => {
    setLocalStats(statisticsService.getStats())

    const unsubscribe = statisticsService.subscribe((newStats) => {
      setLocalStats(newStats)
    })

    return unsubscribe
  }, [])

  // Загрузка глобальной статистики
  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        const response = await fetch('/api/stats/global')
        if (response.ok) {
          const data = await response.json()
          setGlobalStats(data)
        }
      } catch (error) {
        console.warn('Failed to fetch global stats:', error)
      }
    }

    fetchGlobalStats()

    // Обновляем глобальную статистику каждые 30 секунд
    const interval = setInterval(fetchGlobalStats, 30000)
    return () => clearInterval(interval)
  }, [])

  // Показываем только если есть хотя бы локальная или глобальная статистика
  if (localStats.total === 0 && (!globalStats || globalStats.total === 0)) {
    return null
  }

  return (
    <div className="text-center text-xs mt-4 pt-4 border-t border-gray-200">
      <div className="space-y-3">
        {/* Персональная статистика */}
        {localStats.total > 0 && (
          <div className="flex justify-center items-center gap-4 text-gray-700">
            <span className="font-medium">👤 Вы создали:</span>
            <span className="font-semibold text-blue-600">{localStats.total}</span>
            {localStats.filword > 0 && (
              <>
                <span className="text-gray-400">•</span>
                <span>Филворды: {localStats.filword}</span>
              </>
            )}
            {localStats.readingText > 0 && (
              <>
                <span className="text-gray-400">•</span>
                <span>Тексты: {localStats.readingText}</span>
              </>
            )}
            {localStats.crossword > 0 && (
              <>
                <span className="text-gray-400">•</span>
                <span>Кроссворды: {localStats.crossword}</span>
              </>
            )}
          </div>
        )}

        {/* Глобальная статистика */}
        {globalStats && globalStats.total > 0 && (
          <div className="flex justify-center items-center gap-4 text-gray-500">
            <span className="font-medium">🌍 Всего на платформе:</span>
            <span className="font-semibold text-purple-600">{globalStats.total.toLocaleString('ru-RU')}</span>
            {globalStats.filword > 0 && (
              <>
                <span className="text-gray-300">•</span>
                <span>Филворды: {globalStats.filword.toLocaleString('ru-RU')}</span>
              </>
            )}
            {globalStats.readingText > 0 && (
              <>
                <span className="text-gray-300">•</span>
                <span>Тексты: {globalStats.readingText.toLocaleString('ru-RU')}</span>
              </>
            )}
            {globalStats.crossword > 0 && (
              <>
                <span className="text-gray-300">•</span>
                <span>Кроссворды: {globalStats.crossword.toLocaleString('ru-RU')}</span>
              </>
            )}
            {globalStats.copyText > 0 && (
              <>
                <span className="text-gray-300">•</span>
                <span>Списывание: {globalStats.copyText.toLocaleString('ru-RU')}</span>
              </>
            )}
            {globalStats.handwriting > 0 && (
              <>
                <span className="text-gray-300">•</span>
                <span>Прописи: {globalStats.handwriting.toLocaleString('ru-RU')}</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}