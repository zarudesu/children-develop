#!/bin/bash

echo "🔍 Проверка состояния сервисов ChildDev"
echo "====================================="

# Проверка Web сервиса
echo "🌐 Проверка Web сервиса..."
if curl -s http://localhost:3002 > /dev/null 2>&1; then
    echo "✅ Web сервис работает: http://localhost:3002"
else
    echo "❌ Web сервис недоступен"
fi

# Проверка PDF сервиса
echo "📄 Проверка PDF сервиса..."
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ PDF сервис работает: http://localhost:3001"
    
    # Получаем детальную информацию о PDF сервисе
    HEALTH_INFO=$(curl -s http://localhost:3001/health)
    echo "   Статус: $HEALTH_INFO"
else
    echo "❌ PDF сервис недоступен"
fi

echo ""

# Проверка процессов
if [ -f ".web.pid" ]; then
    WEB_PID=$(cat .web.pid)
    if ps -p $WEB_PID > /dev/null 2>&1; then
        echo "✅ Web процесс запущен (PID: $WEB_PID)"
    else
        echo "❌ Web процесс не найден"
        rm -f .web.pid
    fi
fi

if [ -f ".pdf.pid" ]; then
    PDF_PID=$(cat .pdf.pid)
    if ps -p $PDF_PID > /dev/null 2>&1; then
        echo "✅ PDF процесс запущен (PID: $PDF_PID)"
    else
        echo "❌ PDF процесс не найден"
        rm -f .pdf.pid
    fi
fi

echo ""
echo "📊 Использование портов:"
lsof -i :3002 -i :3001 2>/dev/null | grep LISTEN || echo "Нет активных процессов на портах 3002/3001"