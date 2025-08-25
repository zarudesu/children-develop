# PDF Service

## Обзор

HTTP сервис для генерации PDF файлов образовательных заданий с использованием Playwright и Chromium.

## Основные возможности

- Генерация филворда из HTML шаблонов в PDF
- Поддержка разных размеров сеток (10x10 - 24x24)
- Рендеринг кириллицы с правильной типографикой
- Кэширование готовых PDF в Redis
- Высокое качество печати (300 DPI)

## Архитектура

```
HTTP Request → Validation → Cache Check → HTML Template → Playwright → PDF Response
                                ↓              ↓              ↓
                          Redis Cache    Handlebars    Chromium Process
```

## Структура проекта

```
services/pdf/
├── src/
│   ├── controllers/          # HTTP контроллеры
│   │   └── generate.ts      # POST /generate endpoint
│   ├── services/            # Бизнес-логика
│   │   ├── pdf-generator.ts # Главный генератор PDF
│   │   ├── filword-engine.ts# Алгоритм размещения слов
│   │   └── cache.ts         # Redis кэширование  
│   ├── templates/           # HTML шаблоны
│   │   ├── filword.hbs     # Шаблон филворда
│   │   └── layout.hbs      # Базовый layout
│   ├── utils/              # Утилиты
│   │   ├── validation.ts   # Валидация запросов
│   │   └── logger.ts       # Логирование
│   └── app.ts              # Express приложение
├── tests/                  # Тесты
├── Dockerfile             # Контейнер
└── package.json
```

## API Endpoints

### POST /generate
Генерирует PDF филворда по переданным параметрам.

**Request:**
```typescript
interface FilwordRequest {
  words: string[];              // Слова для размещения
  gridSize: '10x10' | '14x14' | '18x18' | '24x24';
  directions: {
    right: boolean;
    left: boolean;
    up: boolean; 
    down: boolean;
  };
  textCase: 'upper' | 'lower' | 'mixed';
}
```

**Response:** 
- Content-Type: `application/pdf`
- PDF файл (2 страницы: задание + ответы)

**Errors:**
- `400` - Invalid request parameters
- `422` - Words don't fit in selected grid size  
- `500` - PDF generation failed

### GET /health
Проверка состояния сервиса.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-08-24T10:30:00Z",
  "version": "1.0.0",
  "chromium": "119.0.6045.105"
}
```

## Алгоритм генерации

### 1. Валидация параметров
- Проверка формата слов (кириллица, длина)
- Валидация размера сетки
- Проверка количества слов

### 2. Размещение слов в сетке
```typescript
class FilwordEngine {
  generateGrid(words: string[], size: GridSize): Grid {
    // 1. Сортировка слов по длине (длинные первыми)
    // 2. Случайное размещение каждого слова
    // 3. Проверка пересечений
    // 4. Заполнение пустых ячеек случайными буквами
  }
}
```

### 3. HTML рендеринг
```handlebars
{{!-- templates/filword.hbs --}}
<div class="filword-grid grid-{{gridSize}}">
  {{#each grid}}
    <div class="row">
      {{#each this}}
        <span class="cell">{{this}}</span>
      {{/each}}
    </div>
  {{/each}}
</div>
```

### 4. PDF генерация
```typescript
const pdf = await page.pdf({
  format: 'A4',
  printBackground: true,
  margin: { top: '1cm', bottom: '1cm', left: '1cm', right: '1cm' },
  preferCSSPageSize: true,
});
```

## Кэширование

### Стратегия кэширования
```typescript
// Ключ кэша на основе хэша параметров
const cacheKey = `filword:${hashParams(request)}`;
const cachedPDF = await redis.get(cacheKey);

if (cachedPDF) {
  return Buffer.from(cachedPDF, 'base64');
}

// Генерация нового PDF
const pdf = await generatePDF(request);
await redis.setex(cacheKey, 3600, pdf.toString('base64')); // TTL 1 час
```

### Очистка кэша
```bash
# Очистка всех PDF
redis-cli DEL filword:*

# Очистка кэша определённого размера
redis-cli DEL filword:14x14:*
```

## Производительность

### Оптимизации Playwright
```typescript
// Переиспользование browser instance
const browser = await playwright.chromium.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-web-security'
  ]
});

// Переиспользование контекста
const context = await browser.newContext({
  viewport: { width: 794, height: 1123 }, // A4 размер
});
```

### Мониторинг ресурсов
- Memory usage: Chromium процессы автоматически очищаются
- CPU usage: Ограничение concurrent генераций
- Disk space: Временные файлы автоудаление

## Разработка

### Локальный запуск
```bash
cd services/pdf
npm install
npm run dev  # Запуск в development режиме на порту 3001
```

### Тестирование
```bash
npm test              # Unit тесты
npm run test:integration  # Тесты PDF генерации
npm run test:load     # Нагрузочные тесты
```

### Отладка
```bash
# Запуск с дебагом Playwright
DEBUG=pw:browser npm run dev

# Сохранение временных HTML для отладки
SAVE_HTML=true npm run dev
```

## Docker

### Сборка образа
```dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
EXPOSE 3001

CMD ["npm", "start"]
```

### Запуск контейнера
```bash
docker build -t childdev-pdf .
docker run -p 3001:3001 -e REDIS_URL=redis://host.docker.internal:6379 childdev-pdf
```

## Переменные окружения

```bash
# .env
PORT=3001
NODE_ENV=production
REDIS_URL=redis://localhost:6379

# Playwright настройки
PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# PDF настройки  
PDF_CACHE_TTL=3600
MAX_CONCURRENT_GENERATIONS=3
TEMP_FILES_CLEANUP_INTERVAL=300000
```

## Мониторинг и логи

### Метрики
```typescript
// Prometheus метрики
const pdfGenerationDuration = new Histogram({
  name: 'pdf_generation_duration_seconds',
  help: 'PDF generation duration',
  labelNames: ['grid_size', 'words_count']
});

const cacheHitRate = new Counter({
  name: 'cache_hits_total', 
  help: 'Cache hit rate',
  labelNames: ['cache_type']
});
```

### Структурированные логи
```typescript
logger.info('PDF generation started', {
  requestId: req.id,
  gridSize: params.gridSize,
  wordsCount: params.words.length,
  timestamp: new Date().toISOString()
});
```

## Безопасность

### Валидация входных данных
- Ограничение количества слов (max 20)
- Проверка длины слов (3-12 символов)
- Sanitization HTML контента
- Rate limiting (100 запросов/час на IP)

### Изоляция процессов
- Chromium запускается в sandbox режиме
- Временные файлы автоматически удаляются
- Нет доступа к файловой системе хоста

## Troubleshooting

### Частые проблемы

**Chromium не запускается:**
```bash
# Установка зависимостей в Ubuntu/Debian
apt-get update && apt-get install -y \
    libnss3 libatk-bridge2.0-0 libdrm2 libxkbcommon0 \
    libxcomposite1 libxdamage1 libxrandr2 libgbm1 libxss1 libgconf-2-4
```

**Высокое потребление памяти:**
```typescript
// Ограничение concurrent генераций
const semaphore = new Semaphore(MAX_CONCURRENT_GENERATIONS);
await semaphore.acquire();
try {
  const pdf = await generatePDF(params);
  return pdf;
} finally {
  semaphore.release();
}
```

**Медленная генерация:**
- Проверить hit rate кэша
- Профилировать время рендеринга HTML
- Оптимизировать CSS (избегать сложных селекторов)
