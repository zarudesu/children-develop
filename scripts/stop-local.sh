#!/bin/bash

echo "⏹️ Остановка сервисов ChildDev"
echo "============================"

# Остановка по PID файлам
if [ -f ".web.pid" ]; then
    WEB_PID=$(cat .web.pid)
    if ps -p $WEB_PID > /dev/null 2>&1; then
        kill $WEB_PID
        echo "✅ Web сервис остановлен (PID: $WEB_PID)"
    fi
    rm -f .web.pid
fi

if [ -f ".pdf.pid" ]; then
    PDF_PID=$(cat .pdf.pid)
    if ps -p $PDF_PID > /dev/null 2>&1; then
        kill $PDF_PID
        echo "✅ PDF сервис остановлен (PID: $PDF_PID)"
    fi
    rm -f .pdf.pid
fi

# Дополнительная очистка портов (если процессы "зависли")
echo "🧹 Очистка портов..."
lsof -ti :3002 | xargs kill -9 2>/dev/null || true
lsof -ti :3001 | xargs kill -9 2>/dev/null || true

echo "✅ Все сервисы остановлены"