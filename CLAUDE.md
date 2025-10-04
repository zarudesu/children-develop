# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Обзор проекта

**ChildDev** — платформа с образовательными генераторами для развития навыков чтения и логического мышления.

**Текущие генераторы:**
1. **Филворды** — словесные головоломки с двухстраничным PDF (задание + ответы)
2. **Конструктор текстов для чтения** — 12 типов упражнений для развития техники чтения, скорочтения и коррекции дислексии

Ориентирована на кириллицу и крупную типографику для образовательных учреждений.

**Архитектура модульная:**
- Веб-интерфейс (Next.js) отдельно
- PDF-рендер (Playwright + Chromium) отдельно  
- Core-генераторы отдельно (опционально, планируется)

Веб-интерфейс вызывает выделенный PDF-сервис для генерации документов.

### Распределение ответственности сервисов
- **services/web** — UI, формы параметров, валидация, вызов PDF-сервиса, SEO/маршрутизация
- **services/pdf** — HTTP-эндпоинт /generate: получает JSON с параметрами, рендерит HTML-шаблон, отдаёт PDF (A4, 2 страницы)
- **services/api** (опционально) — ядро генераторов и словари; веб и pdf общаются с ним по HTTP/gRPC (по мере роста)

**Коммуникации:** web → pdf (обязательно), web → api (опционально), pdf → S3 (если сохраняем файлы)

## Deployment Infrastructure

### Production VPS: children.hhivp.com
- **Host**: children.hhivp.com (45.10.53.247)
- **User**: chhh
- **OS**: Ubuntu 24.04.3 LTS
- **RAM**: 7.7GB total, 7.1GB available
- **Swap**: 4.0GB
- **Storage**: 24GB (~15GB available)

### SSH Access
Локальные SSH ключи созданы и настроены:
```bash
# SSH конфигурация (в ~/.ssh/config)
Host children-vps
    HostName children.hhivp.com
    User chhh
    IdentityFile ~/.ssh/childdev_vps
    Port 22
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null

# Подключение к серверу
ssh children-vps
```

### Deployment Status
- ✅ SSH ключи настроены и работают
- ✅ Сервер доступен (Ubuntu 24.04.3, 7.7GB RAM, 4GB swap)
- ✅ Docker установлен (v27.5.1 + docker-compose v1.29.2)
- ✅ Репозиторий склонирован с GitHub
- ✅ Production Docker Compose конфигурация создана
- 🔄 Docker образы собираются на сервере
- ⏳ ChildDev приложение запускается

### Production Environment
**⚠️ ЧУВСТВИТЕЛЬНАЯ ИНФОРМАЦИЯ - НЕ КОММИТИТЬ В GIT!**

```bash
# Доступы к production серверу children.hhivp.com:
Server: children.hhivp.com (45.10.53.247)
User: chhh
Password: ITSLch25

# SSH подключение:
ssh children-vps

# Docker команды:
cd /home/chhh/childdev-cl
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml logs -f

# Проверка сервисов:
curl http://children.hhivp.com:3002  # Web service
curl http://children.hhivp.com:3001/health  # PDF service

# Перезапуск:
docker-compose -f docker-compose.prod.yml restart
```

### Deployment Commands
```bash
# Обновление приложения:
ssh children-vps "cd childdev-cl && git pull && docker-compose -f docker-compose.prod.yml restart"

# Просмотр логов:
ssh children-vps "cd childdev-cl && docker-compose -f docker-compose.prod.yml logs -f"

# Остановка/запуск:
ssh children-vps "cd childdev-cl && docker-compose -f docker-compose.prod.yml down"
ssh children-vps "cd childdev-cl && docker-compose -f docker-compose.prod.yml up -d"
```

## Детали генераторов

### Конструктор текстов для чтения

Специализированный инструмент для создания упражнений по развитию техники чтения, скорочтения и коррекции дислексии.

#### 12 типов заданий (ReadingTextType)

**Лёгкие (easy):**
1. **normal** — Обычный текст без модификаций
2. **bottom-cut** — Текст с обрезанной нижней частью букв (развитие зрительного восприятия)
3. **top-cut** — Текст с обрезанной верхней частью букв (развитие зрительного восприятия)
4. **word-ladder** — Лесенка из слов (развитие плавности чтения)

**Средние (medium):**
5. **missing-endings** — Слова без окончаний 1-2 буквы (развитие прогнозирования)
6. **missing-vowels** — Гласные заменены черточками (развитие анализа и синтеза)
7. **partial-reversed** — Некоторые слова написаны справа налево (развитие внимания)
8. **merged-text** — Текст без пробелов между словами (развитие сегментации)

**Сложные (hard):**
9. **scrambled-words** — Буквы в словах перемешаны (анаграммы)
10. **extra-letters** — Между основными буквами вставлены случайные
11. **mirror-text** — Весь текст написан справа налево
12. **mixed-types** — Комбинация разных типов в одном тексте

#### Технические настройки

**Размеры шрифта:**
- **large** (14pt) — для начального обучения и проблем со зрением
- **medium** (12pt) — стандартный размер для школьников
- **small** (11pt) — как в учебниках

**Регистр текста:**
- **upper** — ЗАГЛАВНЫЕ БУКВЫ
- **lower** — строчные буквы
- **mixed** — Смешанный регистр

**Форматирование:**
- Настраиваемые заголовки
- Номера страниц
- Инструкции для выполнения
- Центрирование заголовка

#### Целевая аудитория
- Учителя начальных классов
- Логопеды и дефектологи
- Родители детей с дислексией
- Специалисты по скорочтению
- Психологи образовательных учреждений

### Филворды

Классические словесные головоломки с поддержкой кириллицы.

**Основные возможности:**
- Сетки от 10x10 до 20x20
- Тематические категории слов (животные, школа, семья, цвета, еда)
- Настройка направлений размещения (право/лево/верх/низ)
- Двухстраничный PDF: задание + ответы

## Development Commands

### Setup
```bash
# Initial setup (installs dependencies, creates env files)
./scripts/dev-setup.sh

# Start all services for development (npm)
./scripts/run-local.sh

# Start PDF service через Docker (рекомендуется)
./scripts/run-docker-pdf.sh

# Stop all services
./scripts/stop-local.sh
```

### Web Service (services/web)
```bash
cd services/web

# Development server (port 3002)
npm run dev

# Build for production
npm run build

# Start production server (port 3002)
npm start

# Lint code
npm run lint

# Type checking
npm run type-check
```

### PDF Service (services/pdf)

#### Локальная разработка (npm)
```bash
cd services/pdf

# Development server with hot reload (port 3001)
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint
```

#### Docker разработка (рекомендуется для точности)
⚠️ **ВАЖНО**: Для корректной работы CSS обрезания текста рекомендуется использовать Docker с официальным Microsoft Playwright образом.

```bash
cd services/pdf

# Build Docker image
docker build -t childdev-pdf .

# Run PDF service через Docker (port 3001)
docker run -p 3001:3001 childdev-pdf

# Run в background mode
docker run -d -p 3001:3001 --name pdf-service childdev-pdf

# Stop Docker container
docker stop pdf-service && docker rm pdf-service
```

**Причина использования Docker для Конструктора текстов:**
- Локальный npm использует автоматически скачанный Chromium (может различаться по версиям)
- Docker использует официальный Microsoft Playwright образ v1.40.0 с точной версией Chromium 119.0.6045.105
- **Критично для CSS-обрезания букв** — система тестирует 5+ методов в каждом PDF:

**CSS-методы обрезания текста:**
1. **overflow + height** — базовое обрезание через переполнение
2. **clip-path** — современный метод точного обрезания
3. **scaleY** — масштабирование по вертикали
4. **псевдоэлементы (::before/::after)** — маскировка частей букв
5. **CSS mask** — градиентные маски
6. **Основной метод (.bottom-cut/.top-cut)** — финальная реализация для продакшена

**Проблема несовместимости:**
- Разные версии Chromium интерпретируют CSS clip-path и mask по-разному
- Локальная разработка может показывать один результат, продакшен — другой
- Docker гарантирует одинаковую интерпретацию всех CSS-методов обрезания

## Технический стек

### Frontend
- **Next.js** (App Router), React 18, TypeScript, SSR/ISR
- **Стили:** Tailwind CSS, крупная типографика для кириллицы
- **Валидация:** Zod для типобезопасных схем

### PDF-сервис
- **Node.js + TypeScript**, Express
- **Playwright (Chromium)** для HTML→PDF
- Двухстраничный вывод A4 с поддержкой русских шрифтов

### Core API (планируется)
- **Node.js + Fastify/NestJS** (TypeScript)
- Когда генераторов станет много

### Хранилище (планируется)
- **PostgreSQL** — словари, пресеты
- **Redis** — кэш/лимиты
- **S3/MinIO** — готовые PDF и превью

### Инфраструктура
- **Docker/Compose** (локально)
- **Traefik/Nginx** (edge)
- **GitHub Actions** (CI)
- Один сервер/staging для старта

### Качество кода
- **ESLint/Prettier** — форматирование
- **Vitest/Jest** — unit тесты
- **Playwright tests** — e2e интерфейса
- **Knex/Prisma** — ORM (если нужен)

## Детали архитектуры

### Взаимодействие сервисов
- Веб-сервис работает на порту 3002
- PDF-сервис работает на порту 3001

#### Архитектура генерации для Reading Text (правильная архитектура)
- **Веб-сервис генерирует HTML** через `generateReadingTextHTML()`
- **HTML отправляется в PDF-сервис** на endpoint `/generate-from-html`
- **PDF-сервис только конвертирует HTML→PDF** через Playwright + Chromium
- **Результат: предварительный просмотр = PDF** (один источник HTML)

#### Архитектура генерации для Filword (устаревшая, требует рефакторинга)
- Веб-сервис отправляет JSON параметры в PDF-сервис на `/generate`
- PDF-сервис сам генерирует HTML из Handlebars шаблона
- Результат: дублирование логики генерации HTML

#### Планы по унификации архитектуры
- Все генераторы должны использовать схему: **Веб генерирует HTML → PDF конвертирует**
- Убрать дублирование логики между веб и PDF сервисами
- PDF-сервис должен быть только HTML→PDF конвертером

#### Техническая реализация Reading Text
- **CSS обрезание текста**: используются псевдоэлементы `.bottom-cut-pseudo`, `.top-cut-pseudo`
- **Пословная обработка**: каждое слово оборачивается в отдельный `<span>` для гибкости
- **Комбинированные генерации**: разные слова могут иметь разные трансформации

### Key Components

#### Web Service Structure
- `src/app/filword/` - Main filword generator feature
- `src/app/api/` - API routes (health check, generate proxy)
- `src/app/filword/types/index.ts` - Shared TypeScript types and constants
- `src/app/filword/components/` - React components
- `src/app/filword/utils/` - Validation utilities

#### PDF Service Structure  
- `src/app.ts` - Express server entry point
- `src/services/filword-engine.ts` - Core filword generation logic
- `src/services/pdf-generator.ts` - PDF rendering with Playwright
- `src/types/index.ts` - Shared types matching web service

### Type System
Both services share identical type definitions for FilwordParams, GridSize, etc. Keep these synchronized between:
- `services/web/src/app/filword/types/index.ts`
- `services/pdf/src/types/index.ts`

### Preset Categories
The system includes predefined word categories (animals, colors, school, family, food) defined in the web service types. Each category has a Russian name and array of Cyrillic words.

## Development Workflows

### Adding New Features
1. Start with type definitions in both services
2. Implement business logic in PDF service first
3. Add API endpoints as needed
4. Build UI components in web service
5. Test end-to-end PDF generation

### Debugging
- Web service logs: `tail -f logs/web-service.log`
- PDF service logs: `tail -f logs/pdf-service.log`
- Health checks: `http://localhost:3001/health` and `http://localhost:3002/api/health`

### Ключевые эндпоинты
- `GET /filword` — UI генератора филвордов
- `GET /reading-text` — UI конструктора текстов для чтения
- `POST /api/generate` — прокси к PDF-сервису (поддерживает оба типа генераторов)
- `POST http://localhost:3001/generate` — прямой эндпоинт PDF-генерации
- `POST http://localhost:3001/debug-html` — предварительный просмотр HTML для отладки
- `GET /health` — проверки здоровья для обоих сервисов

## Project Structure
```
childdev/
├── services/
│   ├── web/          # Next.js frontend
│   └── pdf/          # PDF generation service  
├── content/          # Dictionaries and presets
├── infra/            # Docker configs, nginx
├── scripts/          # Development and deployment scripts
└── docs/            # Documentation
```

## Принципы разработки для Claude Code

### Архитектурные принципы
1. **Split of concerns:** UI ≠ рендер PDF ≠ алгоритмы. Отдельные сервисы — меньше конфликтов и легче масштабировать
2. **12-factor:** конфиг только через ENV, stateless-сервисы, повторяемые сборки
3. **Иммутабельные артефакты:** собираем образ → разворачиваем «как есть»
4. **Идемпотентность:** генерация при одинаковом вводе детерминирована (если не просим рандом)
5. **Код → тесты → документация:** каждая фича сопровождается DoD и обновлёнными доками
6. **Локаль ≈ staging ≈ prod:** одинаковые compose/бандлы и ENV-ключи
7. **Observability first:** логи, коды ответов, p95 времени рендера, алерты

### Принципы кода для удобной работы Claude

#### Модульность и размер файлов
- **Максимум 200-300 строк на файл** — легче читать и редактировать
- **Один класс/функция — один файл** — четкая ответственность
- **Максимум 50 строк на функцию** — если больше, разделить на подфункции
- **Экспорт только нужного** — избегать `export *`, явные импорты

#### Структура компонентов
```typescript
// ✅ Хорошо: отдельные файлы
components/
├── FilwordForm/
│   ├── index.ts           # экспорт компонента
│   ├── FilwordForm.tsx    # основной компонент
│   ├── hooks.ts           # хуки компонента
│   ├── types.ts           # локальные типы
│   └── utils.ts           # утилиты компонента

// ❌ Плохо: все в одном файле
FilwordForm.tsx  # 500+ строк
```

#### Именование файлов и папок
- **PascalCase для компонентов:** `FilwordForm.tsx`, `PDFGenerator.ts`
- **camelCase для утилит:** `wordValidator.ts`, `gridBuilder.ts`
- **kebab-case для папок:** `filword-generator/`, `pdf-service/`
- **Суффиксы для типов:** `.types.ts`, `.constants.ts`, `.utils.ts`

#### Организация импортов
```typescript
// ✅ Группировка импортов
// 1. External libraries
import React from 'react'
import { z } from 'zod'

// 2. Internal modules
import { FilwordParams } from '../types'
import { validateWords } from '../utils'

// 3. Relative imports
import './styles.css'
```

#### Типизация и валидация
- **Zod для всех входных данных** — автоматическая валидация + TypeScript типы
- **Общие типы в отдельных файлах** — синхронизация между сервисами
- **Конкретные типы близко к использованию** — не создавать мегафайлы типов

```typescript
// ✅ Хорошо: специфичные типы рядом с компонентом
// components/FilwordForm/types.ts
export interface FilwordFormProps {
  onSubmit: (params: FilwordParams) => void
  loading?: boolean
}

// ❌ Плохо: все типы в одном файле
// types/index.ts (500+ строк)
```

#### Обработка ошибок
- **Единый формат ошибок** — Error с message + code
- **Типизированные ошибки** — не generic Error
- **Graceful degradation** — показать пользователю что-то полезное

```typescript
// ✅ Хорошо: типизированные ошибки
export class FilwordGenerationError extends Error {
  constructor(
    message: string,
    public code: 'INVALID_WORDS' | 'GRID_TOO_SMALL' | 'TIMEOUT'
  ) {
    super(message)
  }
}
```

#### Конфигурация
- **Константы в отдельных файлах** — не магические числа в коде
- **ENV переменные с fallback** — разработка должна работать из коробки
- **Типизированная конфигурация** — Zod схемы для ENV

```typescript
// ✅ Хорошо: типизированная конфигурация
// config/index.ts
const configSchema = z.object({
  PDF_SERVICE_URL: z.string().default('http://localhost:3001'),
  WEB_PORT: z.number().default(3002)
})

export const config = configSchema.parse(process.env)
```

#### Тестирование для Claude-friendly кода
- **Unit тесты рядом с кодом** — `component.test.ts` рядом с `component.ts`
- **Простые тестовые сценарии** — один тест = одна функция
- **Моки выносить в отдельные файлы** — `__mocks__/` папки

```typescript
// ✅ Хорошо: простой и понятный тест
describe('wordValidator', () => {
  it('should accept valid Cyrillic words', () => {
    expect(isValidWord('кот')).toBe(true)
  })
  
  it('should reject words with Latin characters', () => {
    expect(isValidWord('cat')).toBe(false)
  })
})
```

#### Комментарии и документация
- **JSDoc для публичных функций** — особенно для алгоритмов
- **Inline комментарии для бизнес-логики** — почему, а не что
- **README в каждой значимой папке** — quick start для раздела

```typescript
/**
 * Размещает слова в сетке филворда с учетом направлений
 * @param words - массив слов на кириллице (3-15 символов)
 * @param gridSize - размер сетки (10x10 до 20x20)
 * @param directions - разрешенные направления размещения
 * @returns сетка с размещенными словами и карта ответов
 */
export function placeWordsInGrid(
  words: string[],
  gridSize: GridSize,
  directions: DirectionSettings
): FilwordGrid {
  // Сортируем слова по длине (длинные первыми)
  // Это увеличивает вероятность успешного размещения
  const sortedWords = words.sort((a, b) => b.length - a.length)
  
  // ... остальная логика
}
```

## Организация кода для эффективной работы Claude

### Файловая структура
**Принцип:** один экран Claude = один файл. Максимум контекста без прокрутки.

```typescript
// ✅ Идеальная структура для чтения Claude
services/web/src/app/filword/
├── components/
│   ├── FilwordForm/
│   │   ├── index.ts          # 5-10 строк: экспорт
│   │   ├── FilwordForm.tsx   # 100-150 строк: UI компонент
│   │   ├── useFilwordForm.ts # 50-80 строк: бизнес-логика
│   │   ├── validation.ts     # 30-50 строк: Zod схемы
│   │   └── constants.ts      # 10-20 строк: константы
│   └── PDFPreview/
│       ├── index.ts
│       ├── PDFPreview.tsx
│       └── hooks.ts
├── services/
│   ├── filwordGenerator.ts   # 100-200 строк: основной алгоритм
│   ├── gridBuilder.ts        # 80-120 строк: построение сетки
│   ├── wordPlacer.ts         # 80-120 строк: размещение слов
│   └── answerMapper.ts       # 50-80 строк: карта ответов
├── utils/
│   ├── validation.ts         # 50-100 строк: валидация
│   ├── wordUtils.ts          # 40-80 строк: работа со словами
│   └── gridUtils.ts          # 40-80 строк: работа с сеткой
├── types/
│   ├── index.ts              # 50-100 строк: основные типы
│   ├── api.ts                # 30-50 строк: API типы
│   └── ui.ts                 # 20-40 строк: UI типы
└── constants/
    ├── index.ts              # 20-40 строк: экспорт всех
    ├── gridSizes.ts          # 10-20 строк: размеры сеток
    ├── directions.ts         # 10-20 строк: направления
    └── presets.ts            # 30-60 строк: пресеты
```

### Правила для удобной работы Claude

#### 1. Размер файлов
- **Компоненты React:** 100-200 строк
- **Сервисы/утилиты:** 80-150 строк  
- **Типы:** 30-100 строк
- **Константы:** 10-50 строк
- **Тесты:** 50-150 строк

#### 2. Структура функций
```typescript
// ✅ Хорошо: читаемая функция
export function generateFilword(params: FilwordParams): FilwordResult {
  // 1. Валидация входных данных
  const validatedParams = validateFilwordParams(params)
  
  // 2. Подготовка сетки
  const grid = createEmptyGrid(validatedParams.gridSize)
  
  // 3. Размещение слов
  const placedWords = placeWordsInGrid(grid, validatedParams.words)
  
  // 4. Заполнение пустых ячеек
  const filledGrid = fillEmptyCells(placedWords.grid)
  
  // 5. Создание карты ответов
  const answerMap = createAnswerMap(placedWords.placements)
  
  return {
    grid: filledGrid,
    answers: answerMap,
    metadata: createMetadata(validatedParams)
  }
}

// ❌ Плохо: монолитная функция 200+ строк
export function generateFilwordMonolith(params: FilwordParams) {
  // ... 200+ строк всей логики в одной функции
}
```

#### 3. Константы и конфигурация
```typescript
// ✅ Хорошо: сгруппированные константы
// constants/gridSizes.ts
export const GRID_SIZES = {
  SMALL: '10x10',
  MEDIUM: '14x14', 
  LARGE: '18x18'
} as const

export const GRID_LIMITS = {
  '10x10': { minWords: 8, maxWords: 12 },
  '14x14': { minWords: 15, maxWords: 25 },
  '18x18': { minWords: 25, maxWords: 45 }
} as const

// constants/directions.ts  
export const DIRECTIONS = {
  RIGHT: 'right',
  LEFT: 'left',
  UP: 'up',
  DOWN: 'down'
} as const

// ❌ Плохо: магические числа в коде
if (words.length > 25) { // что означает 25?
  throw new Error('Too many words')
}
```

#### 4. Обработка асинхронности
```typescript
// ✅ Хорошо: типизированные промисы
export async function generatePDF(params: FilwordParams): Promise<{
  success: true
  pdf: Buffer
} | {
  success: false
  error: FilwordGenerationError
}> {
  try {
    const result = await pdfService.generate(params)
    return { success: true, pdf: result }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof FilwordGenerationError 
        ? error 
        : new FilwordGenerationError('Unknown error', 'UNKNOWN')
    }
  }
}
```

### Соглашения по именованию

#### Файлы и папки
- **Компоненты:** `PascalCase.tsx` — `FilwordForm.tsx`
- **Хуки:** `use + PascalCase.ts` — `useFilwordForm.ts`
- **Утилиты:** `camelCase.ts` — `wordValidator.ts`
- **Сервисы:** `camelCase.ts` — `pdfGenerator.ts`
- **Типы:** `camelCase.types.ts` — `filword.types.ts`
- **Константы:** `camelCase.constants.ts` — `grid.constants.ts`

#### Переменные и функции
- **React компоненты:** `PascalCase` — `FilwordForm`
- **Хуки:** `camelCase` — `useFilwordForm`
- **Функции:** `camelCase` — `generateFilword`
- **Константы:** `SCREAMING_SNAKE_CASE` — `GRID_SIZE_LIMITS`
- **Типы:** `PascalCase` — `FilwordParams`
- **Интерфейсы:** `PascalCase` — `FilwordGenerator`

### Дополнительные принципы для оптимальной работы Claude Code

#### 5. Принцип "рассказывающих названий"
Название функции должно четко объяснять, что она делает, без необходимости читать код.

```typescript
// ✅ Отлично: понятно сразу
function validateCyrillicWords(words: string[]): ValidationResult
function generateFilwordGrid(params: FilwordParams): GridResult  
function convertGridToPDF(grid: FilwordGrid): Promise<Buffer>
function checkWordsCanFitInGrid(words: string[], gridSize: GridSize): boolean

// ❌ Плохо: нужно читать код, чтобы понять
function validate(data: any): any
function process(input: unknown): unknown
function handle(params: object): void
function check(items: any[]): boolean
```

#### 6. Принцип "явных зависимостей"
Все зависимости функции должны быть переданы как параметры, а не импортированы глобально внутри функции.

```typescript
// ✅ Отлично: все зависимости видны в сигнатуре
function generatePDF(
  params: FilwordParams, 
  pdfService: PDFService,
  logger: Logger
): Promise<PDFResult> {
  logger.info('Generating PDF', { gridSize: params.gridSize })
  return pdfService.generate(params)
}

function validateFilwordParams(
  params: unknown,
  validator: FilwordValidator
): FilwordParams {
  return validator.parse(params)
}

// ❌ Плохо: скрытые зависимости
function generatePDF(params: FilwordParams): Promise<PDFResult> {
  const pdfService = getPDFService() // откуда это взялось?
  const logger = getLogger() // непонятно, откуда
  // ...
}
```

#### 7. Принцип "одного уровня абстракции"
Функция должна работать на одном уровне абстракции — либо высокоуровневая координация, либо низкоуровневые детали.

```typescript
// ✅ Хорошо: высокоуровневая координация
function generateFilword(params: FilwordParams): Promise<FilwordResult> {
  const validatedParams = validateParams(params)
  const grid = createGrid(validatedParams)
  const placedWords = placeWords(grid, validatedParams.words)
  const filledGrid = fillEmptySpaces(placedWords)
  const answers = generateAnswers(placedWords)
  
  return {
    grid: filledGrid,
    answers,
    metadata: createMetadata(validatedParams)
  }
}

// ✅ Хорошо: низкоуровневые детали
function placeWordInGrid(
  grid: Grid, 
  word: string, 
  startX: number, 
  startY: number, 
  direction: Direction
): PlacementResult {
  // детальная логика размещения слова
  for (let i = 0; i < word.length; i++) {
    const x = startX + (direction === 'right' ? i : 0)
    const y = startY + (direction === 'down' ? i : 0)
    grid[y][x] = word[i]
  }
  // ...
}

// ❌ Плохо: смешаны уровни абстракции
function generateFilword(params: FilwordParams): FilwordResult {
  // высокий уровень
  const validatedParams = validateParams(params)
  const grid = createGrid(validatedParams)
  
  // внезапно низкий уровень
  for (let word of validatedParams.words) {
    for (let i = 0; i < word.length; i++) {
      grid[y][x] = word[i] // что за x, y?
    }
  }
  
  // снова высокий уровень
  const answers = generateAnswers(placedWords)
  // ...
}
```

#### 8. Принцип "быстрой неудачи"
Валидация и проверки должны происходить как можно раньше с четкими сообщениями об ошибках.

```typescript
// ✅ Отлично: ранняя валидация с понятными ошибками
function generateFilword(params: FilwordParams): FilwordResult {
  // Проверяем сразу в начале
  if (!params.words || params.words.length === 0) {
    throw new FilwordError('Words array is required and cannot be empty', 'EMPTY_WORDS')
  }
  
  if (params.words.length > GRID_LIMITS[params.gridSize].maxWords) {
    throw new FilwordError(
      `Too many words for grid size ${params.gridSize}. Max: ${GRID_LIMITS[params.gridSize].maxWords}`,
      'TOO_MANY_WORDS'
    )
  }
  
  const invalidWords = params.words.filter(word => !isValidCyrillicWord(word))
  if (invalidWords.length > 0) {
    throw new FilwordError(
      `Invalid words found: ${invalidWords.join(', ')}. Only Cyrillic characters allowed`,
      'INVALID_CHARACTERS'
    )
  }
  
  // Основная логика только после всех проверок
  return generateGridSafely(params)
}

// ❌ Плохо: проверки разбросаны по коду
function generateFilword(params: FilwordParams): FilwordResult {
  const grid = createGrid(params.gridSize)
  
  for (let word of params.words) {
    if (!word) continue // почему здесь проверка?
    
    const placement = findPlacement(grid, word)
    if (!placement && word.includes('a')) { // почему 'a' вдруг здесь проверяется?
      throw new Error('Invalid word') // неинформативно
    }
  }
  // ...
}
```

#### 9. Принцип "чистых функций для алгоритмов"
Алгоритмические функции должны быть чистыми — одинаковый ввод всегда дает одинаковый результат.

```typescript
// ✅ Отлично: чистая функция
function calculateWordPlacements(
  words: readonly string[], 
  gridSize: GridSize,
  seed?: number // для контролируемой случайности
): readonly WordPlacement[] {
  const random = seed ? new Random(seed) : new Random()
  // детерминированная логика
  return words.map(word => findBestPlacement(word, gridSize, random))
}

// ✅ Отлично: сайд-эффекты вынесены отдельно
function generateFilwordWithLogging(
  params: FilwordParams,
  logger: Logger
): FilwordResult {
  logger.info('Starting filword generation', { gridSize: params.gridSize })
  
  const result = calculateWordPlacements(params.words, params.gridSize)
  
  logger.info('Filword generation completed', { wordsPlaced: result.length })
  return result
}

// ❌ Плохо: сайд-эффекты в алгоритме
function calculateWordPlacements(words: string[], gridSize: GridSize): WordPlacement[] {
  console.log('Calculating placements...') // сайд-эффект
  
  const placements = []
  for (let word of words) {
    console.log(`Placing word: ${word}`) // сайд-эффект
    
    const placement = Math.random() > 0.5 ? // недетерминированность
      { word, x: 0, y: 0 } : 
      { word, x: 5, y: 5 }
      
    placements.push(placement)
  }
  return placements
}
```

#### 10. Принцип "защитного программирования"
Код должен быть устойчив к неожиданным входным данным и graceful degradation.

```typescript
// ✅ Отлично: защитное программирование
function processUserWords(userInput: unknown): string[] {
  // Защита от неожиданных типов
  if (!userInput || typeof userInput !== 'string') {
    return []
  }
  
  // Защита от пустых строк
  const words = userInput
    .split(',')
    .map(word => word.trim())
    .filter(word => word.length > 0)
  
  // Защита от слишком длинных слов
  const validWords = words.filter(word => {
    if (word.length > MAX_WORD_LENGTH) {
      console.warn(`Word "${word}" is too long, skipping`)
      return false
    }
    return true
  })
  
  return validWords.slice(0, MAX_WORDS_COUNT) // защита от переполнения
}

// ✅ Отлично: graceful degradation
function generateFilwordSafely(params: FilwordParams): FilwordResult {
  try {
    return generateFilword(params)
  } catch (error) {
    if (error instanceof FilwordError && error.code === 'PLACEMENT_FAILED') {
      // Пробуем с меньшим количеством слов
      const reducedWords = params.words.slice(0, Math.floor(params.words.length * 0.8))
      console.warn('Reducing word count and retrying', { 
        original: params.words.length, 
        reduced: reducedWords.length 
      })
      
      return generateFilword({ ...params, words: reducedWords })
    }
    
    throw error // перебрасываем неожиданные ошибки
  }
}
```

### Принципы для работы Claude в команде

#### 11. Принцип "контекстной документации"
Каждое важное решение должно быть задокументировано рядом с кодом.

```typescript
/**
 * Использует алгоритм backtracking для размещения слов в сетке.
 * 
 * Почему backtracking:
 * - Гарантирует нахождение решения, если оно существует
 * - Позволяет оптимизировать заполнение сетки
 * - Лучше работает с кириллицей (меньше коллизий)
 * 
 * Альтернативы (отклонены):
 * - Random placement: слишком много неудачных попыток
 * - Greedy algorithm: часто не может разместить последние слова
 */
function placeWordsWithBacktracking(
  grid: Grid, 
  words: string[]
): PlacementResult {
  // ...
}

// Объяснение магических констант
const BACKTRACK_MAX_ATTEMPTS = 1000 // основано на тестах: 1000 достаточно для сеток до 20x20
const PLACEMENT_TIMEOUT_MS = 5000   // UX требование: пользователь не должен ждать больше 5 сек
```

#### 12. Принцип "явного состояния ошибок"
Состояния ошибок должны быть частью типовой системы, а не исключениями.

```typescript
// ✅ Отлично: ошибки как часть типовой системы
type FilwordResult = 
  | { success: true; data: FilwordGrid }
  | { success: false; error: FilwordError; recoverable: boolean }

function generateFilword(params: FilwordParams): FilwordResult {
  if (params.words.length === 0) {
    return { 
      success: false, 
      error: new FilwordError('No words provided', 'EMPTY_INPUT'),
      recoverable: true 
    }
  }
  
  const placementResult = attemptPlacement(params)
  if (!placementResult.success) {
    return {
      success: false,
      error: placementResult.error,
      recoverable: placementResult.canRetryWithFewerWords
    }
  }
  
  return { success: true, data: placementResult.grid }
}

// ❌ Плохо: неконтролируемые исключения
function generateFilword(params: FilwordParams): FilwordGrid {
  if (params.words.length === 0) {
    throw new Error('No words') // какую ошибку? можно ли восстановиться?
  }
  
  return attemptPlacement(params) // может бросить любое исключение
}
```

#### 13. Принцип "линейного чтения кода"
Код должен читаться как история — от общего к частному, сверху вниз.

```typescript
// ✅ Отлично: читается как книга
function generateFilwordPDF(params: FilwordParams): Promise<PDFResult> {
  // 1. Что мы делаем (общая картина)
  return generateFilwordSteps(params)
    .then(validateResult)
    .then(convertToPDF)
    .then(optimizePDFSize)
    .catch(handleGenerationError)
}

// 2. Как мы это делаем (детали по порядку)
async function generateFilwordSteps(params: FilwordParams): Promise<FilwordData> {
  const validatedParams = validateInput(params)
  const grid = await createGrid(validatedParams) 
  const placedWords = await placeAllWords(grid, validatedParams.words)
  const filledGrid = fillEmptySpaces(placedWords)
  
  return {
    grid: filledGrid,
    words: placedWords,
    metadata: createMetadata(validatedParams)
  }
}

// 3. Детальная реализация каждого шага
function validateInput(params: FilwordParams): ValidatedParams {
  // конкретная логика валидации
}

function createGrid(params: ValidatedParams): Promise<Grid> {
  // конкретная логика создания сетки  
}

// ❌ Плохо: хаотичный порядок функций
function createGrid() { /* ... */ }        // детали в начале
function generateFilwordPDF() { /* ... */ } // общая логика в середине  
function validateInput() { /* ... */ }      // другие детали в конце
```

#### 14. Принцип "минимальной когнитивной нагрузки"
В любой момент времени Claude должен держать в голове минимум информации.

```typescript
// ✅ Отлично: каждая функция решает одну задачу
function generateFilword(params: FilwordParams): FilwordResult {
  const steps = [
    () => validateParams(params),
    (validated) => createEmptyGrid(validated.gridSize),
    (grid) => placeWords(grid, params.words),
    (placed) => fillEmptySpaces(placed),
    (filled) => generateAnswerKey(filled)
  ]
  
  return executeSteps(steps) // линейное выполнение, понятная последовательность
}

// Каждый шаг изолирован и понятен
function placeWords(grid: Grid, words: string[]): PlacedWordsResult {
  // только логика размещения слов
  // не думаем о валидации, заполнении пустых мест, etc.
}

// ❌ Плохо: много разных задач в одной функции
function generateFilword(params: FilwordParams): FilwordResult {
  // валидация
  if (!params || !params.words) throw new Error('Invalid params')
  if (params.words.some(w => w.includes('a'))) throw new Error('No latin')
  
  // создание сетки  
  const grid = Array(size).fill(null).map(() => Array(size).fill(''))
  
  // размещение слов
  for (let word of params.words) {
    let placed = false
    for (let attempts = 0; attempts < 100; attempts++) {
      // сложная логика размещения...
    }
  }
  
  // заполнение пустых мест
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (!grid[i][j]) grid[i][j] = getRandomCyrillicChar()
    }
  }
  
  // создание ответов
  // ...
  
  // слишком много всего в одной функции!
}
```

### Итоговые принципы Claude-friendly кода

**Мнемоника CLEAR CODE:**
- **C**lean functions (чистые функции, одна ответственность)
- **L**inear reading (линейное чтение сверху вниз)
- **E**xplicit dependencies (явные зависимости)
- **A**bstraction levels (один уровень абстракции)
- **R**ecoverable errors (восстановимые ошибки как типы)

**C**ontext documentation (документация решений)
**O**bvious naming (говорящие имена)
**D**efensive programming (защитное программирование)  
**E**arly validation (ранняя валидация)

**Обновленная структура проекта:**
```
childdev/
├── services/
│   ├── web/                      # Next.js веб-приложение
│   ├── pdf/                      # PDF генератор (Playwright)
│   └── api/                      # Core API (планируется)
│
├── content/                      # контент и словари
│   ├── dictionaries/             # тематические словари (.ru.txt)
│   │   ├── README.md            # правила и форматы словарей
│   │   ├── animals.ru.txt       # животные
│   │   ├── school.ru.txt        # школьная тематика
│   │   ├── colors.ru.txt        # цвета
│   │   └── family.ru.txt        # семья
│   └── presets/                 # готовые пресеты заданий
│       ├── README.md            # форматы и правила пресетов
│       ├── easy-animals.json    # простые задания с животными
│       └── medium-school.json   # средние школьные задания
│
├── docs/                        # документация проекта (организованная)
│   ├── project/                 # проектная документация
│   │   ├── README.md           # обзор проектной документации
│   │   ├── ROADMAP.md          # дорожная карта развития
│   │   ├── SPECS_MVP.md        # ТЗ на MVP
│   │   ├── UX_FLOW.md          # пользовательские сценарии
│   │   ├── QA_CHECKLIST.md     # чек-лист тестирования
│   │   ├── CONTRIBUTING.md     # участие в разработке
│   │   └── UI_IMPROVEMENTS_SUMMARY.md
│   ├── technical/              # техническая документация
│   │   ├── README.md           # обзор технической документации
│   │   ├── ARCHITECTURE.md     # детальная архитектура системы
│   │   └── TECH_STACK.md       # технологический стек и обоснования
│   ├── operations/             # операционная документация
│   │   ├── README.md           # обзор операционной документации
│   │   ├── DEPLOYMENT.md       # руководство по развертыванию
│   │   ├── OPERATIONS.md       # эксплуатация и мониторинг
│   │   └── DEPLOYMENT_READY.md # готовность к продакшену
│   └── product/                # продуктовая документация
│       ├── README.md           # обзор продуктовой документации
│       ├── CONTENT_GUIDE.md    # правила контента и локализации
│       └── LEGAL.md            # правовые аспекты и лицензии
│
├── infra/                       # инфраструктура и окружения
│   ├── docker/                 # dockerfiles, compose-файлы
│   ├── env/                    # примеры переменных окружения
│   ├── nginx/                  # конфиги Nginx
│   ├── k8s/                    # манифесты Kubernetes (планируется)
│   └── ci/                     # CI/CD конфигурация
│
└── scripts/                     # утилиты и скрипты разработки
    ├── README.md               # описание доступных скриптов
    ├── dev-setup.sh            # первоначальная настройка
    ├── run-local.sh            # запуск для разработки
    ├── stop-local.sh           # остановка сервисов
    └── check-health.sh         # проверка состояния
```

## Быстрое включение в проект

### Для новых разработчиков
1. **Прочитайте сначала:**
   - `README.md` — общий обзор и быстрый старт
   - `docs/project/ROADMAP.md` — долгосрочное видение и этапы развития
   - `docs/project/SPECS_MVP.md` — техническое задание на MVP
   
2. **Изучите архитектуру:**
   - `docs/technical/ARCHITECTURE.md` — детальная архитектура
   - `docs/technical/TECH_STACK.md` — выбор технологий
   
3. **Настройте окружение:**
   ```bash
   ./scripts/dev-setup.sh  # Первоначальная настройка
   ./scripts/run-local.sh  # Запуск всех сервисов
   ```
   
4. **Проверьте работу:**
   - http://localhost:3002/filword — веб-интерфейс
   - http://localhost:3001/health — PDF-сервис

### Типичные задачи

**Добавление новых слов в категорию:**
1. Откройте `services/web/src/app/filword/types/index.ts`
2. Найдите `PRESET_CATEGORIES`
3. Добавьте слова в нужную категорию
4. Синхронизируйте с `services/pdf/src/types/index.ts`

**Создание новой категории:**
1. Добавьте в `PRESET_CATEGORIES` обоих сервисов
2. Создайте файл `content/dictionaries/category-name.ru.txt`
3. Обновите документацию

**Отладка PDF генерации:**
1. Проверьте логи: `tail -f logs/pdf-service.log`
2. Тестируйте через прямой API: `POST http://localhost:3001/generate`
3. Валидируйте входные данные через Zod схемы

**Изменение UI:**
1. Компоненты: `services/web/src/app/filword/components/`
2. Стили: Tailwind CSS классы
3. Тестируйте на разных размерах экрана

### Полезные команды

```bash
# Проверка состояния сервисов
./scripts/check-health.sh

# Просмотр логов
tail -f logs/web-service.log
tail -f logs/pdf-service.log

# Линтинг всего проекта
cd services/web && npm run lint
cd services/pdf && npm run lint

# Проверка типов
cd services/web && npm run type-check
cd services/pdf && npm run build

# Тестирование
cd services/pdf && npm test
```

### Структура запросов к PDF API

**POST /generate для филвордов:**
```json
{
  "type": "filword",
  "words": ["кот", "собака", "мышь"],
  "gridSize": "14x14",
  "directions": {
    "right": true,
    "left": false,
    "up": true,
    "down": true
  },
  "textCase": "upper"
}
```

**POST /generate для конструктора текстов:**
```json
{
  "type": "reading-text",
  "params": {
    "textType": "bottom-cut",
    "inputText": "Боря плыл в лодке. Над рекой летали птицы. Солнце ярко светило.",
    "fontSize": "large",
    "textCase": "mixed",
    "hasTitle": true,
    "title": "Упражнение на технику чтения",
    "includeInstructions": true,
    "cutPercentage": 40
  }
}
```

**Примеры различных типов заданий:**
```json
// Текст без гласных
{
  "type": "reading-text",
  "params": {
    "textType": "missing-vowels",
    "inputText": "Мама мыла раму",
    "fontSize": "medium"
  }
}

// Анаграммы (перемешанные буквы)
{
  "type": "reading-text",
  "params": {
    "textType": "scrambled-words",
    "inputText": "Солнце светит ярко",
    "fontSize": "large"
  }
}

// Зеркальный текст
{
  "type": "reading-text",
  "params": {
    "textType": "mirror-text",
    "inputText": "Читаем справа налево",
    "fontSize": "medium"
  }
}
```

**Ответ:** PDF файл (binary) с 2-3 страницами

### Важные моменты
- **Всегда запускайте `./scripts/run-local.sh` из корня проекта**
- **PDF-сервис требует браузеры Playwright** — устанавливаются через dev-setup.sh
- **Синхронизация типов** между web и pdf сервисами обязательна
- **Кириллица — приоритет:** все тексты должны корректно отображаться
- **Многостраничный PDF:** филворды (2 стр.), тексты для чтения (2-3 стр.)

### Валидация для Конструктора текстов
- **Минимум 10 символов** в inputText
- **Минимум 3 слова** в тексте
- **Только кириллические символы** (проверка через `/[а-яё]/i`)
- **12 типов заданий** с различными параметрами
- **3 размера шрифта:** large (14pt), medium (12pt), small (11pt)
- **Дополнительные параметры:** cutPercentage (30-70%), endingLength (1-2), etc.

### Отладка CSS-обрезания
- **Используйте debug-html эндпоинт** для предварительного просмотра
- **Тестирование в Docker обязательно** для точности CSS-рендеринга
- **PDF содержит тесты всех CSS-методов** для сравнения результатов
- **Продуктовые детали:** полное видение в `docs/project/SITE_STRUCTURE.md`

## Контент и словари

### Структура словарей
Словари находятся в `content/dictionaries/` и организованы по темам:
- `animals.ru.txt` — животные (домашние, дикие, птицы)
- `school.ru.txt` — школьная тематика
- `colors.ru.txt` — цвета и оттенки
- `family.ru.txt` — семья и родственные отношения
- `food.ru.txt` — еда и напитки

**Требования к словам:**
- Только кириллица (русские буквы)
- Длина: 3-15 букв
- UTF-8 кодировка
- Один word на строку
- Без пробелов в начале/конце

### Пресеты заданий
Готовые комбинации параметров в `content/presets/`:
- `easy-animals.json` — простые задания для детей 3-5 лет
- `medium-school.json` — школьная тема, средняя сложность
- `hard-mixed.json` — смешанная тема, высокая сложность

**Формат пресета:**
```json
{
  "name": "Животные для малышей",
  "description": "Простые задания для детей 3-5 лет",
  "difficulty": "easy",
  "theme": "animals",
  "gridSize": "10x10",
  "words": ["кот", "пес", "корова"],
  "settings": {
    "directions": ["right", "down"],
    "textCase": "upper",
    "fontSize": "large"
  }
}
```

## Валидация и типы

### Zod схемы
Валидация происходит через Zod схемы, определенные в обоих сервисах:

**FilwordParams:**
- `words`: array of strings (3-15 chars each, Cyrillic only)
- `gridSize`: "10x10" | "12x12" | "14x14" | "16x16" | "18x18" | "20x20"
- `directions`: object with boolean flags for right/left/up/down
- `textCase`: "upper" | "lower"

### Общие константы
```typescript
export const GRID_SIZE_LIMITS = {
  '10x10': { min: 8, max: 12 },
  '12x12': { min: 10, max: 16 },
  '14x14': { min: 15, max: 25 },
  '16x16': { min: 20, max: 35 },
  '18x18': { min: 25, max: 45 },
  '20x20': { min: 30, max: 55 }
}
```

## Troubleshooting

### Частые проблемы
1. **PDF не генерируется:**
   - Проверьте, что Playwright браузеры установлены: `npx playwright install`
   - Убедитесь, что PDF-сервис доступен: `curl http://localhost:3001/health`

2. **Ошибки типов:**
   - Синхронизируйте типы между сервисами
   - Запустите `npm run type-check` в обоих сервисах

3. **Проблемы с кириллицей:**
   - Проверьте кодировку файлов: `file -bi filename.txt`
   - Убедитесь в корректной настройке шрифтов в PDF

4. **Docker проблемы:**
   - Очистите контейнеры: `docker compose down -v`
   - Пересоберите образы: `docker compose build --no-cache`

### Полезные команды отладки
```bash
# Проверка портов
lsof -i :3001  # PDF service
lsof -i :3002  # Web service

# Тестирование PDF API напрямую
curl -X POST http://localhost:3001/generate \
  -H "Content-Type: application/json" \
  -d '{"words":["кот","собака"],"gridSize":"10x10","directions":{"right":true,"down":true},"textCase":"upper"}' \
  --output test.pdf

# Проверка файлов словарей
wc -l content/dictionaries/*.txt  # количество слов
head -5 content/dictionaries/animals.ru.txt  # первые слова
```

## Фазы развития проекта

**Текущий статус:** MVP+ (Филворды + Конструктор текстов для чтения) ✅

**Готовые генераторы:**
- **Филворды** — словесные головоломки с сетками 10x10-20x20 ✅
- **Конструктор текстов для чтения** — 12 типов упражнений для развития техники чтения ✅

**Phase 2 (v0.2-0.4):** Расширение генераторов
- Кроссворды, математические задачи, раскраски, прописи

**Phase 3 (v1.0):** Система пользователей
- Регистрация, личные кабинеты, подписки, монетизация

**Phase 4 (v2.0):** Контентная платформа
- Библиотека, журнал, форум, услуги специалистов

**Phase 5 (v3.0+):** Продвинутые функции
- AI-рекомендации, адаптивные задания, мобильные приложения