#!/bin/bash

# run-docker-pdf.sh
# Запуск PDF сервиса через Docker с Microsoft Playwright образом

set -e

echo "🚀 Запуск PDF сервиса через Docker..."

# Переходим в директорию PDF сервиса
cd "$(dirname "$0")/../services/pdf"

# Остановить существующие процессы на порту 3001
echo "📋 Остановка существующих процессов..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

# Остановить и удалить существующий Docker контейнер
echo "🐳 Остановка Docker контейнера..."
docker stop childdev-pdf 2>/dev/null || true
docker rm childdev-pdf 2>/dev/null || true

# Сборка Docker образа
echo "🔧 Сборка Docker образа..."
docker build -t childdev-pdf .

# Запуск PDF сервиса в Docker
echo "🚀 Запуск PDF сервиса в Docker..."
docker run -d \
  --name childdev-pdf \
  -p 3001:3001 \
  childdev-pdf

echo "✅ PDF сервис запущен в Docker на порту 3001"
echo "🔗 Health check: http://localhost:3001/health"
echo "📊 Логи: docker logs -f childdev-pdf"
echo "🛑 Остановка: docker stop childdev-pdf"

# Запуск веб-сервиса параллельно (если не запущен)
if ! lsof -i:3002 | grep LISTEN > /dev/null; then
  echo "🌐 Запуск веб-сервиса..."
  cd ../web
  npm run dev &
  echo "✅ Веб-сервис запущен на порту 3002"
else
  echo "✅ Веб-сервис уже запущен на порту 3002"
fi

echo ""
echo "🎯 Готово! Сервисы запущены:"
echo "  📄 PDF Service (Docker): http://localhost:3001/health"
echo "  🌐 Web Service: http://localhost:3002"