'use client'

import React from 'react'
import { useDownloadStats } from '../utils/statistics'

interface DownloadStatsProps {
  compact?: boolean
  showDetailed?: boolean
}

export function DownloadStats({ compact = false, showDetailed = false }: DownloadStatsProps) {
  const { stats, getStatsForPeriod } = useDownloadStats()

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
        <span className="text-blue-600">📊</span>
        <span className="font-medium">{stats.total}</span>
        <span>скачиваний</span>
      </div>
    )
  }

  // Не показываем статистику, если еще не было скачиваний
  if (stats.total === 0) {
    return null
  }

  const todayStats = getStatsForPeriod(24)

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 shadow-sm max-w-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">📊</span>
        <h3 className="font-medium text-gray-900">Скачивания</h3>
      </div>

      <div className="space-y-3">
        {/* Компактная статистика */}
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs text-blue-700">Всего</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">{stats.filword}</div>
            <div className="text-xs text-green-700">Филворды</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-purple-600">{stats.readingText}</div>
            <div className="text-xs text-purple-700">Чтение</div>
          </div>
        </div>

        {showDetailed && todayStats.total > 0 && (
          <div className="border-t border-blue-200 pt-2">
            <div className="text-xs text-gray-600 text-center">
              За сегодня: {todayStats.total} ({todayStats.filword}+{todayStats.readingText})
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Компонент для показа в углу экрана (floating)
export function FloatingDownloadStats() {
  const { stats } = useDownloadStats()
  const [isExpanded, setIsExpanded] = React.useState(false)

  if (stats.total === 0) {
    return null // Не показываем, если еще не было скачиваний
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isExpanded ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-64">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Статистика</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600 text-lg"
            >
              ×
            </button>
          </div>
          <DownloadStats showDetailed />
        </div>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-lg transition-colors flex items-center gap-2"
        >
          <span>📊</span>
          <span className="font-medium">{stats.total}</span>
        </button>
      )}
    </div>
  )
}