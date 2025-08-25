#!/bin/bash

echo "🚀 ChildDev Development Setup"
echo "=============================="

# Проверка что мы в корне проекта
if [ ! -f "README.md" ]; then
    echo "❌ Запустите скрипт из корня проекта"
    exit 1
fi

# Создание .env файлов если их нет
echo "📄 Создание конфигурационных файлов..."

if [ ! -f ".env.local" ]; then
    cp infra/env/.env.local.example .env.local
    echo "✅ Создан .env.local"
fi

# Создание папки логов
mkdir -p logs
echo "✅ Создана папка logs"

# Установка зависимостей Web сервиса
echo "🌐 Установка зависимостей Web сервиса..."
cd services/web
if [ ! -d "node_modules" ]; then
    npm install
    echo "✅ Web dependencies установлены"
else
    echo "✅ Web dependencies уже установлены"
fi

# Установка зависимостей PDF сервиса  
echo "📄 Установка зависимостей PDF сервиса..."
cd ../pdf
if [ ! -d "node_modules" ]; then
    npm install
    echo "✅ PDF dependencies установлены"
    
    # Установка браузеров для Playwright
    echo "🎭 Установка браузеров Playwright..."
    npx playwright install chromium
    echo "✅ Playwright браузеры установлены"
else
    echo "✅ PDF dependencies уже установлены"
fi

cd ../..

echo ""
echo "🎉 Настройка завершена!"
echo ""
echo "Следующие шаги:"
echo "1. ./scripts/run-local.sh  - Запустить сервисы"
echo "2. Открыть http://localhost:3000 в браузере"
echo ""