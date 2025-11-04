import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const STATS_FILE = path.join(process.cwd(), 'data', 'global-stats.json')

export interface GlobalStats {
  filword: number
  readingText: number
  crossword: number
  copyText: number
  handwriting: number
  total: number
  lastUpdate: string
}

// GET - получить глобальную статистику
export async function GET() {
  try {
    const data = await fs.readFile(STATS_FILE, 'utf-8')
    const stats: GlobalStats = JSON.parse(data)

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error reading global stats:', error)

    // Если файл не существует, вернуть пустую статистику
    const emptyStats: GlobalStats = {
      filword: 0,
      readingText: 0,
      crossword: 0,
      copyText: 0,
      handwriting: 0,
      total: 0,
      lastUpdate: new Date().toISOString()
    }

    return NextResponse.json(emptyStats)
  }
}

// POST - увеличить счётчик для определённого типа
export async function POST(request: Request) {
  try {
    const { type } = await request.json()

    if (!type || !['filword', 'readingText', 'crossword', 'copyText', 'handwriting'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be one of: filword, readingText, crossword, copyText, handwriting' },
        { status: 400 }
      )
    }

    // Читаем текущую статистику
    let stats: GlobalStats
    try {
      const data = await fs.readFile(STATS_FILE, 'utf-8')
      stats = JSON.parse(data)
    } catch {
      // Если файл не существует, создаём новый
      stats = {
        filword: 0,
        readingText: 0,
        crossword: 0,
        copyText: 0,
        handwriting: 0,
        total: 0,
        lastUpdate: new Date().toISOString()
      }
    }

    // Увеличиваем счётчик
    stats[type as keyof Omit<GlobalStats, 'total' | 'lastUpdate'>]++
    stats.total++
    stats.lastUpdate = new Date().toISOString()

    // Сохраняем обратно
    await fs.writeFile(STATS_FILE, JSON.stringify(stats, null, 2))

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error updating global stats:', error)
    return NextResponse.json(
      { error: 'Failed to update statistics' },
      { status: 500 }
    )
  }
}
