'use client'

import { useEffect, useState } from 'react'
import { statisticsService, type DownloadStats } from '../app/utils/statistics'

export function FooterStats() {
  const [stats, setStats] = useState<DownloadStats>({
    total: 0,
    filword: 0,
    readingText: 0,
    crossword: 0,
    lastUpdate: new Date().toISOString()
  })

  useEffect(() => {
    setStats(statisticsService.getStats())

    const unsubscribe = statisticsService.subscribe((newStats) => {
      setStats(newStats)
    })

    return unsubscribe
  }, [])

  if (stats.total === 0) {
    return null
  }

  return (
    <div className="text-center text-xs text-gray-500 mt-4 pt-4 border-t border-gray-200">
      <div className="flex justify-center items-center gap-4">
        <span>📊 Заданий создано:</span>
        <span className="font-medium">{stats.total}</span>
        {stats.filword > 0 && (
          <>
            <span>•</span>
            <span>Филворды: {stats.filword}</span>
          </>
        )}
        {stats.readingText > 0 && (
          <>
            <span>•</span>
            <span>Тексты: {stats.readingText}</span>
          </>
        )}
        {stats.crossword > 0 && (
          <>
            <span>•</span>
            <span>Кроссворды: {stats.crossword}</span>
          </>
        )}
      </div>
    </div>
  )
}