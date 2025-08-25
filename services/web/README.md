# Web Frontend Service

## Обзор

Next.js приложение с пользовательским интерфейсом для создания образовательных заданий.

## Стек технологий

- **Next.js 15** с App Router
- **React 18** с Server Components
- **TypeScript** для типобезопасности
- **Tailwind CSS** для стилей
- **shadcn/ui** компоненты

## Структура проекта

```
services/web/
├── app/                    # App Router (Next.js 13+)
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Главная страница  
│   ├── filword/           # Генератор филворда
│   │   ├── page.tsx       # UI страница
│   │   └── loading.tsx    # Loading state
│   └── api/               # API routes
│       └── generate/      # Проксирование в PDF service
├── components/            # Переиспользуемые компоненты
│   ├── ui/               # shadcn/ui компоненты
│   ├── forms/            # Формы генераторов
│   └── layout/           # Layout компоненты
├── lib/                  # Утилиты
│   ├── api.ts           # HTTP клиент
│   ├── validation.ts    # Zod схемы
│   └── utils.ts         # Общие утилиты
├── public/              # Статические файлы
└── styles/              # Глобальные стили
```

## Ключевые компоненты

### FilwordGenerator
Основная форма создания филворда с:
- Выбором размера сетки (10x10, 14x14, 18x18, 24x24) 
- Настройками направления слов
- Выбором регистра текста
- Вводом слов или выбором категории

### PDFPreview  
Компонент предварительного просмотра с:
- Миниатюрой первой страницы
- Информацией о параметрах
- Кнопками скачивания и регенерации

## API Integration

### PDF Service
```typescript
// lib/api.ts
export async function generateFilword(params: FilwordParams): Promise<Blob> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return response.blob();
}
```

### Validation
```typescript
// lib/validation.ts
import { z } from 'zod';

export const FilwordSchema = z.object({
  words: z.array(z.string().min(3).max(12)).min(1).max(20),
  gridSize: z.enum(['10x10', '14x14', '18x18', '24x24']),
  directions: z.object({
    right: z.boolean(),
    left: z.boolean(), 
    up: z.boolean(),
    down: z.boolean(),
  }),
  textCase: z.enum(['upper', 'lower', 'mixed']),
});
```

## Разработка

### Установка
```bash
cd services/web
npm install
```

### Запуск в dev режиме
```bash
npm run dev
# Приложение доступно на http://localhost:3000
```

### Сборка для продакшена
```bash
npm run build
npm start
```

### Тестирование
```bash
npm test              # Unit тесты
npm run test:e2e      # E2E тесты с Playwright
npm run test:visual   # Визуальные тесты
```

## Деплой

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Переменные окружения
```bash
# .env.local
NEXT_PUBLIC_APP_URL=http://localhost:3000
PDF_SERVICE_URL=http://localhost:3001
REDIS_URL=redis://localhost:6379
```

## Планируемые улучшения

### v1.1 (ближайшие)
- [ ] Предпросмотр в реальном времени
- [ ] Сохранение настроек в localStorage
- [ ] Прогресс-бар генерации

### v1.2 (средний срок)
- [ ] Пользовательские аккаунты
- [ ] История созданных заданий  
- [ ] Пакетная генерация

### v2.0 (долгосрочные)
- [ ] Редактор словарей
- [ ] Шаринг заданий
- [ ] Мобильное приложение
