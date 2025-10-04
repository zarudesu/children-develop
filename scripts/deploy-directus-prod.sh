#!/bin/bash

# Скрипт развертывания Directus на продакшене
# Использование: ./scripts/deploy-directus-prod.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🚀 Развертывание Directus на продакшене children.hhivp.com"
echo "==============================================="

# Проверяем, что мы на сервере или имеем доступ
if [ ! -f "/etc/nginx/sites-available/children.hhivp.com" ]; then
    echo "⚠️  Внимание: Скрипт должен запускаться на продакшен-сервере"
    echo "   Если запускаете локально, убедитесь в правильности путей"
    read -p "Продолжить? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 1. Проверяем наличие .env файла
echo "📋 1. Проверка конфигурации..."

if [ ! -f "$PROJECT_ROOT/.env.directus-prod" ]; then
    echo "❌ Файл .env.directus-prod не найден!"
    echo "   Скопируйте .env.directus-prod.example и заполните переменные:"
    echo "   cp .env.directus-prod.example .env.directus-prod"
    echo "   nano .env.directus-prod"
    exit 1
fi

# Загружаем переменные окружения
set -a
source "$PROJECT_ROOT/.env.directus-prod"
set +a

echo "✅ Конфигурация загружена"

# 2. Проверяем Docker
echo "🐳 2. Проверка Docker..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не установлен"
    exit 1
fi

echo "✅ Docker готов"

# 3. Останавливаем существующие контейнеры Directus (если есть)
echo "🛑 3. Остановка существующих контейнеров..."

docker-compose -f "$PROJECT_ROOT/docker-compose.directus-prod.yml" down || true

echo "✅ Контейнеры остановлены"

# 4. Создаем необходимые директории
echo "📁 4. Создание директорий..."

sudo mkdir -p /var/lib/childdev/postgres-directus
sudo mkdir -p /var/lib/childdev/directus-uploads
sudo mkdir -p /var/lib/childdev/directus-data
sudo mkdir -p /var/lib/childdev/redis

# Права доступа
sudo chown -R 999:999 /var/lib/childdev/postgres-directus
sudo chown -R node:node /var/lib/childdev/directus-uploads
sudo chown -R node:node /var/lib/childdev/directus-data
sudo chown -R 999:999 /var/lib/childdev/redis

echo "✅ Директории созданы"

# 5. Запускаем контейнеры
echo "🚀 5. Запуск Directus и зависимостей..."

cd "$PROJECT_ROOT"

# Собираем образы
docker-compose -f docker-compose.directus-prod.yml build

# Запускаем в фоне
docker-compose -f docker-compose.directus-prod.yml up -d

echo "✅ Контейнеры запущены"

# 6. Ждем готовности сервисов
echo "⏳ 6. Ожидание готовности сервисов..."

# Функция проверки здоровья
check_health() {
    local service=$1
    local url=$2
    local max_attempts=30
    local attempt=1

    echo "   Проверяем $service..."

    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url" > /dev/null 2>&1; then
            echo "   ✅ $service готов"
            return 0
        fi

        echo "   ⏳ Попытка $attempt/$max_attempts..."
        sleep 10
        ((attempt++))
    done

    echo "   ❌ $service не готов после $max_attempts попыток"
    return 1
}

# Проверяем Directus
if ! check_health "Directus" "http://localhost:8055/server/health"; then
    echo "❌ Directus не запустился"
    docker-compose -f docker-compose.directus-prod.yml logs directus
    exit 1
fi

# Проверяем Redis
if ! check_health "Redis" "http://localhost:6379"; then
    echo "❌ Redis не запустился"
    docker-compose -f docker-compose.directus-prod.yml logs redis
    exit 1
fi

echo "✅ Все сервисы готовы"

# 7. Настраиваем схему данных
echo "🔧 7. Настройка схемы данных..."

# Запускаем скрипт настройки схемы
export DIRECTUS_URL="http://localhost:8055"
export DIRECTUS_ADMIN_EMAIL="$DIRECTUS_ADMIN_EMAIL"
export DIRECTUS_ADMIN_PASSWORD="$DIRECTUS_ADMIN_PASSWORD"

if node "$PROJECT_ROOT/scripts/setup-directus-schema.js"; then
    echo "✅ Схема данных настроена"
else
    echo "⚠️  Схема данных настроена частично или с ошибками"
    echo "   Проверьте вручную через админку: http://children.hhivp.com/admin"
fi

# 8. Обновляем Nginx конфигурацию
echo "🌐 8. Обновление Nginx..."

# Создаем резервную копию
sudo cp /etc/nginx/sites-available/children.hhivp.com /etc/nginx/sites-available/children.hhivp.com.backup.$(date +%Y%m%d_%H%M%S)

# Проверяем, есть ли уже настройки для /api/
if ! grep -q "location /api/" /etc/nginx/sites-available/children.hhivp.com; then
    echo "   Добавляем маршрутизацию для Directus API..."

    # Создаем временный файл с дополнительными location блоками
    cat > /tmp/directus-nginx-locations << 'EOF'

    # Directus API
    location /api/ {
        proxy_pass http://localhost:8055/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $server_name;

        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Directus Admin (опционально, для прямого доступа)
    location /admin/ {
        proxy_pass http://localhost:8055/admin/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $server_name;

        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
EOF

    # Вставляем блоки перед закрывающей скобкой server
    sudo sed -i '/^}/i\\n# Directus routes' /etc/nginx/sites-available/children.hhivp.com
    sudo sed -i '/^# Directus routes/r /tmp/directus-nginx-locations' /etc/nginx/sites-available/children.hhivp.com

    # Удаляем временный файл
    rm /tmp/directus-nginx-locations

    echo "   ✅ Nginx конфигурация обновлена"
else
    echo "   ✅ Nginx уже настроен для Directus"
fi

# Проверяем конфигурацию Nginx
if sudo nginx -t; then
    echo "   ✅ Конфигурация Nginx корректна"
    sudo systemctl reload nginx
    echo "   ✅ Nginx перезагружен"
else
    echo "   ❌ Ошибка в конфигурации Nginx"
    echo "   Восстанавливаем резервную копию..."
    sudo cp /etc/nginx/sites-available/children.hhivp.com.backup.$(date +%Y%m%d_%H%M%S) /etc/nginx/sites-available/children.hhivp.com
    sudo systemctl reload nginx
    exit 1
fi

# 9. Обновляем веб-сервис для использования Directus
echo "🔧 9. Обновление веб-сервиса..."

# Останавливаем веб-сервис
sudo systemctl stop childdev-web || true

# Обновляем переменные окружения веб-сервиса
ENV_FILE="/opt/childdev/services/web/.env.production"

if [ -f "$ENV_FILE" ]; then
    # Добавляем переменные Directus если их нет
    if ! grep -q "DIRECTUS_URL" "$ENV_FILE"; then
        echo "DIRECTUS_URL=http://localhost:8055" | sudo tee -a "$ENV_FILE"
    fi

    if ! grep -q "NEXT_PUBLIC_DIRECTUS_URL" "$ENV_FILE"; then
        echo "NEXT_PUBLIC_DIRECTUS_URL=https://children.hhivp.com/api" | sudo tee -a "$ENV_FILE"
    fi

    echo "   ✅ Переменные окружения обновлены"
fi

# Пересобираем и запускаем веб-сервис
cd /opt/childdev/services/web
sudo npm run build
sudo systemctl start childdev-web

echo "   ✅ Веб-сервис обновлен"

# 10. Финальные проверки
echo "🔍 10. Финальные проверки..."

# Проверяем доступность API
if curl -f -s "https://children.hhivp.com/api/server/ping" > /dev/null; then
    echo "   ✅ Directus API доступен через https://children.hhivp.com/api/"
else
    echo "   ⚠️  Directus API недоступен через внешний URL"
    echo "   Проверьте настройки Nginx и SSL"
fi

# Проверяем админку
echo "   🌐 Админка Directus: https://children.hhivp.com/admin/"
echo "   📧 Email: $DIRECTUS_ADMIN_EMAIL"
echo "   🔑 Password: [скрыт]"

# Статус контейнеров
echo ""
echo "📊 Статус контейнеров:"
docker-compose -f docker-compose.directus-prod.yml ps

echo ""
echo "🎉 Развертывание Directus завершено!"
echo "==============================================="
echo ""
echo "📋 Следующие шаги:"
echo "1. Откройте админку: https://children.hhivp.com/admin/"
echo "2. Войдите с указанными учетными данными"
echo "3. Проверьте созданные коллекции: generators, user_generations"
echo "4. Добавьте тестовые данные через интерфейс"
echo "5. Обновите веб-приложение для использования Directus API"
echo ""
echo "🔧 Полезные команды:"
echo "docker-compose -f docker-compose.directus-prod.yml logs -f        # Логи"
echo "docker-compose -f docker-compose.directus-prod.yml restart        # Перезапуск"
echo "docker-compose -f docker-compose.directus-prod.yml down           # Остановка"
echo ""
echo "📚 Документация: docs/DIRECTUS_INTEGRATION_PLAN.md"