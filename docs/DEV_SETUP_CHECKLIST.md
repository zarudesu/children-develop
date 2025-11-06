# Чек-лист настройки окружения разработки

## 📋 Быстрый старт на новом компьютере

### 1. Предварительные требования

**Установите следующее ПО:**
```bash
# Node.js (v18+)
node --version  # Должно быть >= 18.0.0

# npm (обычно идёт с Node.js)
npm --version

# Git
git --version

# Docker Desktop (опционально, для PDF-сервиса)
docker --version
docker-compose --version
```

### 2. Клонирование репозитория

```bash
# Клонируйте репозиторий
git clone git@github.com:zarudesu/children-develop.git childdev-cl
cd childdev-cl

# Проверьте текущую ветку
git branch
# Должна быть: * main

# Проверьте последний коммит
git log --oneline -1
# Должен быть: 2277772 ✨ Улучшения UI/UX: skeleton screens, loading states, mobile responsiveness
```

### 3. Автоматическая настройка

**Запустите setup скрипт:**
```bash
# Из корня проекта
./scripts/dev-setup.sh
```

Этот скрипт автоматически:
- ✅ Установит зависимости для веб-сервиса
- ✅ Установит зависимости для PDF-сервиса
- ✅ Установит Playwright браузеры
- ✅ Создаст .env файлы из примеров
- ✅ Создаст необходимые директории

### 4. Запуск локальной разработки

**Вариант 1: Стандартный запуск (npm)**
```bash
# Из корня проекта
./scripts/run-local.sh

# Проверьте доступность:
# - Веб-сервис: http://localhost:3002
# - PDF-сервис: http://localhost:3001/health
```

**Вариант 2: С Docker для PDF (рекомендуется)**
```bash
# Запустите PDF-сервис через Docker
./scripts/run-docker-pdf.sh

# Запустите веб-сервис отдельно
cd services/web
npm run dev
```

**Вариант 3: Полная среда с Directus**
```bash
# Для работы с аутентификацией и контентом
./scripts/run-local-with-directus.sh

# Доступно:
# - Веб-приложение: http://localhost:3002
# - PDF сервис: http://localhost:3001
# - Directus админка: http://localhost:8055
# - Логин: admin@childdev.local / directus123
```

### 5. Проверка работоспособности

```bash
# Проверьте health endpoints
curl http://localhost:3001/health  # PDF service
curl http://localhost:3002/api/health  # Web service

# Или используйте скрипт проверки
./scripts/check-health.sh
```

### 6. Структура .env файлов

**services/web/.env**
```env
# API endpoints
PDF_SERVICE_URL=http://localhost:3001

# Environment
NODE_ENV=development
```

**services/pdf/.env**
```env
# Server configuration
PORT=3001
NODE_ENV=development

# Playwright
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=false
```

### 7. Полезные команды

```bash
# Остановить все сервисы
./scripts/stop-local.sh

# Просмотр логов
tail -f logs/web-service.log
tail -f logs/pdf-service.log

# Линтинг
cd services/web && npm run lint
cd services/pdf && npm run lint

# Проверка типов
cd services/web && npm run type-check
cd services/pdf && npm run build

# Тесты
cd services/pdf && npm test
```

## 🔧 Troubleshooting

### Проблема: Playwright браузеры не установлены
```bash
cd services/pdf
npx playwright install chromium
```

### Проблема: Порты заняты
```bash
# Найти процесс на порту 3001 или 3002
lsof -i :3001
lsof -i :3002

# Убить процесс
kill -9 <PID>
```

### Проблема: Ошибки типов TypeScript
```bash
# Переустановите зависимости
cd services/web
rm -rf node_modules package-lock.json
npm install

cd ../pdf
rm -rf node_modules package-lock.json
npm install
```

### Проблема: Docker не работает
```bash
# Убедитесь, что Docker Desktop запущен
docker info

# Очистите Docker кэш
docker system prune -af --volumes
```

## 📦 Production Deployment

### SSH доступ к production серверу
```bash
# Настройте SSH конфиг (~/.ssh/config)
Host children-vps
    HostName children.hhivp.com
    User chhh
    IdentityFile ~/.ssh/childdev_vps
    Port 22

# Подключение
ssh children-vps
```

### Deployment команды
```bash
# Обновление приложения
ssh children-vps "cd /home/chhh/childdev-cl && git pull && docker-compose -f docker-compose.prod.yml restart"

# Просмотр логов
ssh children-vps "cd /home/chhh/childdev-cl && docker-compose -f docker-compose.prod.yml logs -f"

# Проверка статуса
ssh children-vps "cd /home/chhh/childdev-cl && docker-compose -f docker-compose.prod.yml ps"
```

## 📚 Дополнительная документация

- **Архитектура:** `docs/technical/ARCHITECTURE.md`
- **Технологический стек:** `docs/technical/TECH_STACK.md`
- **Deployment:** `docs/operations/DEPLOYMENT.md`
- **Directus интеграция:** `docs/DIRECTUS_DEPLOYMENT_GUIDE.md`
- **Правила кода:** `CLAUDE.md`

## ✅ Финальный чек-лист

Перед началом работы убедитесь:

- [ ] Node.js v18+ установлен
- [ ] npm установлен
- [ ] Git настроен
- [ ] Репозиторий склонирован
- [ ] `./scripts/dev-setup.sh` выполнен успешно
- [ ] `./scripts/run-local.sh` запускается без ошибок
- [ ] http://localhost:3002 открывается в браузере
- [ ] http://localhost:3001/health возвращает {"status":"healthy"}
- [ ] Генерация PDF работает (попробуйте создать филворд)

## 🎉 Готово!

Если все пункты выполнены — окружение настроено и готово к разработке!

**Быстрый запуск после настройки:**
```bash
cd childdev-cl
./scripts/run-local.sh
# Откройте http://localhost:3002
```
