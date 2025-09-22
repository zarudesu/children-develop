'use client'

import { statisticsService } from './statistics'

// Утилита для отслеживания скачиваний
export class DownloadTracker {

  // Отслеживание скачивания через fetch
  static async trackDownloadFromFetch(url: string, options: RequestInit = {}) {
    try {
      const response = await fetch(url, options)

      if (response.ok) {
        // Извлекаем информацию о скачивании из заголовков
        const downloadType = response.headers.get('X-Download-Type')
        const metadataStr = response.headers.get('X-Download-Metadata')

        if (downloadType) {
          const metadata = metadataStr ? JSON.parse(metadataStr) : {}
          this.recordDownload(downloadType as 'filword' | 'reading-text', metadata)
        }
      }

      return response
    } catch (error) {
      console.error('Error tracking download:', error)
      throw error
    }
  }

  // Отслеживание скачивания через форму (для случаев когда используется form submit)
  static trackDownloadFromForm(type: 'filword' | 'reading-text', metadata?: any) {
    // Задержка чтобы убедиться что запрос отправился
    setTimeout(() => {
      this.recordDownload(type, metadata)
    }, 100)
  }

  // Записать скачивание в статистику
  private static recordDownload(type: 'filword' | 'reading-text', metadata?: any) {
    statisticsService.recordDownload(type, metadata)
  }

  // Создание ссылки для скачивания с отслеживанием
  static createDownloadLink(data: Blob, filename: string, type: 'filword' | 'reading-text', metadata?: any): string {
    const url = URL.createObjectURL(data)

    // Записываем скачивание
    this.recordDownload(type, metadata)

    return url
  }

  // Триггер скачивания файла с отслеживанием
  static triggerDownload(data: Blob, filename: string, type: 'filword' | 'reading-text', metadata?: any) {
    const url = this.createDownloadLink(data, filename, type, metadata)

    // Создаем временную ссылку и кликаем по ней
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Очищаем URL через некоторое время
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}

// Хук для использования в React компонентах
export function useDownloadTracker() {
  return {
    trackDownloadFromFetch: DownloadTracker.trackDownloadFromFetch.bind(DownloadTracker),
    trackDownloadFromForm: DownloadTracker.trackDownloadFromForm.bind(DownloadTracker),
    triggerDownload: DownloadTracker.triggerDownload.bind(DownloadTracker)
  }
}