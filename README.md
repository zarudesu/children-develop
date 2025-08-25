# 📚 ChildDev - Educational Content Generator

> **MVP: Филворд генератор** - Платформа для создания развивающих заданий с экспортом в PDF

[![Production Status](https://img.shields.io/badge/status-ready%20for%20deploy-green)](https://github.com/zarudesu/children-develop)
[![Docker](https://img.shields.io/badge/docker-ready-blue)](https://github.com/zarudesu/children-develop)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🎯 Описание проекта

ChildDev - это веб-платформа для генерации образовательного контента, ориентированная на создание развивающих заданий для детей. MVP включает генератор филвордов с выводом качественного PDF на кириллице.

### ✨ Основные возможности

- 🧩 **Филворд генератор**: Создание словесных головоломок с настраиваемыми параметрами
- 📄 **PDF экспорт**: Двухстраничный документ (задание + ответы) с качественной типографикой
- 🎨 **Адаптивный дизайн**: Современный интерфейс с поддержкой мобильных устройств
- ⚡ **Быстрая генерация**: Оптимизированный PDF-рендер через Playwright
- 🌐 **Кириллица**: Полная поддержка русского языка и специальных шрифтов

## 🏗️ Архитектура

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   Web Service   │───▶│   PDF Service   │───▶│   PDF Output    │
│   (Next.js)     │    │   (Playwright)  │    │   (A4, 2 pages) │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Микросервисная архитектура:**
- **Web Service**: UI, валидация, маршрутизация (Next.js)
- **PDF Service**: HTML→PDF рендер (Node.js + Playwright)
- **Core API**: Генераторы и словари (планируется)
## 🚀 Быстрый старт

### Локальная разработка

```bash
# 1. Клонируем репозиторий
git clone https://github.com/zarudesu/children-develop.git childdev
cd childdev

# 2. Копируем переменные окружения
cp .env.local.example .env.local

# 3. Запускаем сервисы
./scripts/run-local.sh

# 4. Открываем в браузере
open http://localhost:3002/filword
```

### Production деплой

```bash
# 1. Настраиваем переменные окружения
cp infra/env/.env.production.example .env.production
# Отредактируйте домен и URL

# 2. Настраиваем SSL сертификаты
./scripts/setup-ssl.sh your-domain.com

# 3. Запускаем деплой
./scripts/deploy-prod.sh
```

📖 **Подробная документация по деплою**: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## 🛠️ Технический стек

| Компонент | Технология | Назначение |
|-----------|------------|------------|
| **Frontend** | Next.js 15, React 18, TypeScript | Веб-интерфейс, SSR |
| **PDF Engine** | Node.js, Playwright, Chromium | HTML→PDF рендер |
| **Стили** | Tailwind CSS, CSS Modules | Адаптивная вёрстка |
| **Валидация** | Zod | Типобезопасные схемы |
| **Контейнеры** | Docker, Docker Compose | Изоляция сервисов |
| **Reverse Proxy** | Nginx | SSL, балансировка |
| **CI/CD** | GitHub Actions | Автоматизация |

## 📁 Структура проекта

```
childdev/
├── 📁 services/          # Микросервисы
│   ├── web/              # Next.js приложение
│   ├── pdf/              # PDF генератор
│   └── api/              # Core API (планируется)
├── 📁 content/           # Контент и словари
│   ├── dictionaries/     # Словари по темам
│   └── presets/          # Готовые пресеты
├── 📁 infra/             # Инфраструктура
│   ├── docker/           # Docker Compose
│   ├── nginx/            # Nginx конфиги
│   └── env/              # Переменные окружения
├── 📁 docs/              # Документация
│   ├── DEPLOYMENT.md     # Гид по деплою
│   ├── ROADMAP.md        # Дорожная карта
│   └── ARCHITECTURE.md   # Техническая архитектура
└── 📁 scripts/           # Утилиты и скрипты
```

## 🧩 Использование

### Генерация филворда

1. Откройте `/filword` в браузере
2. Выберите тематику (животные, школа, цвета)
3. Настройте параметры (размер поля, сложность)
4. Нажмите "Сгенерировать PDF"
5. Получите готовый документ для печати

### API для разработчиков

```bash
# Генерация PDF через API
curl -X POST http://localhost:3001/generate \
  -H "Content-Type: application/json" \
  -d '{
    "type": "filword",
    "theme": "animals", 
    "size": 15,
    "words": ["кот", "собака", "мышь"]
  }' \
  --output filword.pdf
```

## 📊 Статус разработки

- ✅ **MVP Филворд**: Готов к продакшену
- ✅ **Docker & деплой**: Настроен
- ✅ **UI/UX**: Модернизирован
- 🔄 **Тестирование**: В процессе
- 📋 **Новые генераторы**: Планируется

### Roadmap

| Фича | Статус | Релиз |
|------|--------|-------|
| 🧩 Филворд генератор | ✅ Готово | v0.1 |
| 🔤 Кроссворды | 📋 Планируется | v0.2 |
| 🔢 Математические задачи | 📋 Планируется | v0.3 |
| 🎨 Раскраски | 📋 Планируется | v0.4 |
| 👤 Пользовательские аккаунты | 📋 Планируется | v1.0 |

## 🤝 Участие в разработке

Мы рады вашему участию! Пожалуйста, ознакомьтесь с [CONTRIBUTING.md](CONTRIBUTING.md) перед началом.

### Локальная разработка

```bash
# Установка зависимостей
cd services/web && npm install
cd ../pdf && npm install

# Запуск в режиме разработки
npm run dev  # в каждом сервисе
```

### Тестирование

```bash
# Unit тесты
npm test

# E2E тесты (планируется)
npm run test:e2e

# Проверка типов
npm run type-check
```

## 📋 Требования

- **Node.js**: ≥18.0.0
- **Docker**: ≥20.10.0
- **Docker Compose**: ≥2.0.0
- **RAM**: минимум 2GB для сборки
- **Disk**: минимум 5GB свободного места

## 📄 Лицензия

MIT License. Подробности в [LICENSE](LICENSE).

## 🆘 Поддержка

- 📚 [Документация](docs/)
- 🐛 [Issue трекер](https://github.com/zarudesu/children-develop/issues)
- 💬 [Discussions](https://github.com/zarudesu/children-develop/discussions)

---

Создано с ❤️ для развития детей и образования
