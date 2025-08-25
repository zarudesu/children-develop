#!/bin/bash

echo "🚀 Запуск ChildDev в режиме разработки"
echo "====================================="

# Проверка что мы в корне проекта
if [ ! -f "README.md" ]; then
    echo "❌ Запустите скрипт из корня проекта"
    exit 1
fi

# Проверка .env файлов
if [ ! -f ".env.local" ]; then
    echo "❌ Файл .env.local не найден. Запустите ./scripts/dev-setup.sh"
    exit 1
fi

echo "📄 Запуск PDF сервиса..."
cd services/pdf

# Проверка зависимостей PDF сервиса
if [ ! -d "node_modules" ]; then
    echo "❌ Зависимости PDF сервиса не установлены. Запустите ./scripts/dev-setup.sh"
    exit 1
fi

# Запуск PDF сервиса в фоне
npm run dev > ../../logs/pdf-service.log 2>&1 &
PDF_PID=$!
echo "✅ PDF сервис запущен (PID: $PDF_PID) на порту 3001"

# Небольшая задержка для старта PDF сервиса
sleep 3

echo "🌐 Запуск Web сервиса..."
cd ../web

# Проверка зависимостей Web сервиса
if [ ! -d "node_modules" ]; then
    echo "❌ Зависимости Web сервиса не установлены. Запустите ./scripts/dev-setup.sh"
    exit 1
fi

# Создание папки логов
mkdir -p ../../logs

# Запуск Web сервиса в фоне
npm run dev > ../../logs/web-service.log 2>&1 &
WEB_PID=$!
echo "✅ Web сервис запущен (PID: $WEB_PID) на порту 3002"

cd ../..

# Сохранение PID для остановки
echo $PDF_PID > .pdf.pid
echo $WEB_PID > .web.pid

echo ""
echo "🎉 Все сервисы запущены!"
echo ""
echo "📱 Веб-интерфейс: http://localhost:3002"
echo "📄 Филворд: http://localhost:3002/filword"
echo "🔧 PDF API: http://localhost:3001/health"
echo ""
echo "📋 Логи:"
echo "   Web: tail -f logs/web-service.log"
echo "   PDF: tail -f logs/pdf-service.log"
echo ""
echo "⏹️  Для остановки: ./scripts/stop-local.sh"
echo ""

# Ожидание пока сервисы стартуют
echo "⏳ Ожидание старта сервисов..."
sleep 5

# Проверка что сервисы работают
./scripts/check-health.sh