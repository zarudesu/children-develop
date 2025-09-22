interface DownloadStats {
  filword: number
  readingText: number
  crossword: number
  total: number
  lastUpdate: string
}

interface DownloadEvent {
  type: 'filword' | 'reading-text' | 'crossword'
  gridSize?: string
  textType?: string
  timestamp: string
  sessionId: string
}

class StatisticsService {
  private readonly STORAGE_KEY = 'childdev_download_stats'
  private readonly EVENTS_KEY = 'childdev_download_events'

  // Получение текущей статистики
  getStats(): DownloadStats {
    if (typeof window === 'undefined') {
      return { filword: 0, readingText: 0, crossword: 0, total: 0, lastUpdate: new Date().toISOString() }
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.warn('Error reading download stats:', error)
    }

    return { filword: 0, readingText: 0, crossword: 0, total: 0, lastUpdate: new Date().toISOString() }
  }

  // Сохранение статистики
  private saveStats(stats: DownloadStats) {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stats))
    } catch (error) {
      console.warn('Error saving download stats:', error)
    }
  }

  // Генерация ID сессии
  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server'

    let sessionId = sessionStorage.getItem('childdev_session_id')
    if (!sessionId) {
      sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2)
      sessionStorage.setItem('childdev_session_id', sessionId)
    }
    return sessionId
  }

  // Записать событие скачивания
  recordDownload(type: 'filword' | 'reading-text' | 'crossword', metadata?: { gridSize?: string; textType?: string }) {
    // Обновляем статистику
    const stats = this.getStats()
    if (type === 'filword') {
      stats.filword++
    } else if (type === 'reading-text') {
      stats.readingText++
    } else if (type === 'crossword') {
      stats.crossword++
    }
    stats.total++
    stats.lastUpdate = new Date().toISOString()
    this.saveStats(stats)

    // Записываем детальное событие
    const event: DownloadEvent = {
      type,
      gridSize: metadata?.gridSize,
      textType: metadata?.textType,
      timestamp: new Date().toISOString(),
      sessionId: this.getSessionId()
    }

    this.saveEvent(event)

    // Уведомляем подписчиков
    this.notifyStatsChanged(stats)
  }

  // Сохранение события
  private saveEvent(event: DownloadEvent) {
    if (typeof window === 'undefined') return

    try {
      const events = this.getRecentEvents()
      events.push(event)

      // Оставляем только последние 100 событий
      const recentEvents = events.slice(-100)
      localStorage.setItem(this.EVENTS_KEY, JSON.stringify(recentEvents))
    } catch (error) {
      console.warn('Error saving download event:', error)
    }
  }

  // Получение последних событий
  getRecentEvents(): DownloadEvent[] {
    if (typeof window === 'undefined') return []

    try {
      const stored = localStorage.getItem(this.EVENTS_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.warn('Error reading download events:', error)
      return []
    }
  }

  // Подписка на изменения статистики
  private listeners: ((stats: DownloadStats) => void)[] = []

  onStatsChanged(callback: (stats: DownloadStats) => void) {
    this.listeners.push(callback)
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  // Алиас для subscribe для совместимости
  subscribe(callback: (stats: DownloadStats) => void) {
    return this.onStatsChanged(callback)
  }

  private notifyStatsChanged(stats: DownloadStats) {
    this.listeners.forEach(callback => callback(stats))
  }

  // Получение статистики за период
  getStatsForPeriod(hours: number = 24): { filword: number; readingText: number; crossword: number; total: number } {
    const events = this.getRecentEvents()
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

    const recentEvents = events.filter(event => event.timestamp > cutoff)

    const filword = recentEvents.filter(e => e.type === 'filword').length
    const readingText = recentEvents.filter(e => e.type === 'reading-text').length
    const crossword = recentEvents.filter(e => e.type === 'crossword').length

    return {
      filword,
      readingText,
      crossword,
      total: filword + readingText + crossword
    }
  }

  // Очистка статистики (для отладки)
  clearStats() {
    if (typeof window === 'undefined') return

    localStorage.removeItem(this.STORAGE_KEY)
    localStorage.removeItem(this.EVENTS_KEY)

    const emptyStats = { filword: 0, readingText: 0, crossword: 0, total: 0, lastUpdate: new Date().toISOString() }
    this.notifyStatsChanged(emptyStats)
  }
}

// Синглтон для использования по всему приложению
export const statisticsService = new StatisticsService()

// Хук для React компонентов
export function useDownloadStats() {
  const [stats, setStats] = React.useState<DownloadStats>(() => statisticsService.getStats())

  React.useEffect(() => {
    const unsubscribe = statisticsService.onStatsChanged(setStats)
    return unsubscribe
  }, [])

  return {
    stats,
    recordDownload: statisticsService.recordDownload.bind(statisticsService),
    getStatsForPeriod: statisticsService.getStatsForPeriod.bind(statisticsService),
    clearStats: statisticsService.clearStats.bind(statisticsService)
  }
}

// Импорт React для хука
import React from 'react'