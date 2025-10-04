#!/bin/bash

# Запуск локальной среды разработки с Directus
# Использование: ./scripts/run-local-with-directus.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🚀 Запуск локальной среды разработки с Directus"
echo "=============================================="

# Переходим в корень проекта
cd "$PROJECT_ROOT"

# Проверяем наличие Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен"
    exit 1
fi

# Создаем .env.directus-local если не существует
if [ ! -f ".env.directus-local" ]; then
    echo "📝 Создание .env.directus-local..."
    cat > .env.directus-local << 'ENVEOF'
DIRECTUS_KEY=d41d8cd98f00b204e9800998ecf8427e
DIRECTUS_SECRET=6dbd9a8e8fb85e4a3c09c6c5dc2a7a7b7f6c3e2f1a9b8c7d6e5f4a3b2c1d0e9f8
DIRECTUS_DB_PASSWORD=directus123
DIRECTUS_ADMIN_EMAIL=admin@childdev.local
DIRECTUS_ADMIN_PASSWORD=directus123
REDIS_PASSWORD=redis123
EMAIL_FROM=noreply@childdev.local
EMAIL_TRANSPORT=sendmail
ENVEOF
    echo "✅ .env.directus-local создан"
fi

# Загружаем переменные
set -a
source .env.directus-local
set +a

# Функция ожидания
wait_for_service() {
    local service_name=$1
    local url=$2
    local max_attempts=30
    local attempt=1

    echo "⏳ Ожидание $service_name..."
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url" > /dev/null 2>&1; then
            echo "✅ $service_name готов"
            return 0
        fi
        echo "   Попытка $attempt/$max_attempts..."
        sleep 5
        ((attempt++))
    done
    return 1
}

# Останавливаем контейнеры
docker-compose -f docker-compose.directus-local.yml down 2>/dev/null || true

# Создаем docker-compose
if [ ! -f "docker-compose.directus-local.yml" ]; then
    echo "📝 Создание docker-compose.directus-local.yml..."
    cat > docker-compose.directus-local.yml << 'DOCKEREOF'
version: '3.8'
services:
  postgres-directus-local:
    image: postgres:15
    container_name: childdev-postgres-directus-local
    environment:
      POSTGRES_DB: childdev_directus_local
      POSTGRES_USER: directus_local
      POSTGRES_PASSWORD: ${DIRECTUS_DB_PASSWORD}
    volumes:
      - postgres_directus_local_data:/var/lib/postgresql/data
    ports:
      - "5434:5432"
    networks:
      - childdev-local-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U directus_local"]
      interval: 10s
      timeout: 5s
      retries: 5

  directus-local:
    image: directus/directus:latest
    container_name: childdev-directus-local
    ports:
      - "8055:8055"
    environment:
      KEY: ${DIRECTUS_KEY}
      SECRET: ${DIRECTUS_SECRET}
      DB_CLIENT: pg
      DB_HOST: postgres-directus-local
      DB_PORT: 5432
      DB_DATABASE: childdev_directus_local
      DB_USER: directus_local
      DB_PASSWORD: ${DIRECTUS_DB_PASSWORD}
      PUBLIC_URL: http://localhost:8055
      ADMIN_EMAIL: ${DIRECTUS_ADMIN_EMAIL}
      ADMIN_PASSWORD: ${DIRECTUS_ADMIN_PASSWORD}
      CORS_ENABLED: "true"
      CORS_ORIGIN: "http://localhost:3002"
      LOG_LEVEL: "debug"
      TELEMETRY: "false"
    networks:
      - childdev-local-network
    depends_on:
      postgres-directus-local:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8055/server/health"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

networks:
  childdev-local-network:
    driver: bridge

volumes:
  postgres_directus_local_data:
    driver: local
DOCKEREOF
fi

# Запускаем
echo "🐳 Запуск Directus..."
docker-compose -f docker-compose.directus-local.yml up -d

# Ждем готовности
if ! wait_for_service "Directus" "http://localhost:8055/server/health"; then
    echo "❌ Directus не запустился"
    exit 1
fi

# Настраиваем схему
echo "🔧 Настройка схемы..."
sleep 10
export DIRECTUS_URL="http://localhost:8055"
node scripts/setup-directus-schema.js || echo "⚠️ Частичная настройка схемы"

# Создаем .env для веб-сервиса
cat > services/web/.env.local << 'WEBENVEOF'
PDF_SERVICE_URL=http://localhost:3001
DIRECTUS_URL=http://localhost:8055
NEXT_PUBLIC_DIRECTUS_URL=http://localhost:8055
NEXT_TELEMETRY_DISABLED=1
WEBENVEOF

# Создаем скрипт остановки
cat > scripts/stop-local-directus.sh << 'STOPEOF'
#!/bin/bash
echo "🛑 Остановка Directus..."
docker-compose -f docker-compose.directus-local.yml down
echo "✅ Остановлено"
STOPEOF
chmod +x scripts/stop-local-directus.sh

echo ""
echo "🎉 Directus запущен!"
echo "==================="
echo "Directus Admin: http://localhost:8055/admin"
echo "Email: $DIRECTUS_ADMIN_EMAIL"
echo "Password: $DIRECTUS_ADMIN_PASSWORD"
echo ""
echo "Остановка: ./scripts/stop-local-directus.sh"
