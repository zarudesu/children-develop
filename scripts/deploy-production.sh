#!/bin/bash

# ChildDev Production Deployment Script
# Server: children.hhivp.com
# User: root

set -e

echo "🚀 Развертывание ChildDev на продакшн сервер"
echo "=============================================="

# Production server config
PROD_SERVER="children.hhivp.com"
PROD_USER="chhh"
SSH_KEY="~/.ssh/childdev_prod"
DEPLOY_PATH="/home/chhh/childdev-cl"
REPO_URL="https://github.com/your-repo/childdev.git" # TODO: Update with actual repo

echo "📡 Подключение к серверу $PROD_SERVER..."

# First, copy the public key to server for authentication
echo "🔑 Настройка SSH ключа..."
ssh-copy-id -i ~/.ssh/childdev_prod.pub chhh@children.hhivp.com || echo "SSH key might already be configured"

# Deploy to production server
ssh -i ~/.ssh/childdev_prod chhh@children.hhivp.com << 'ENDSSH'
set -e

echo "🔄 Проверка системы..."
# User chhh doesn't have sudo rights, so skip system updates

echo "🐳 Проверка Docker..."
# Docker should already be installed and configured
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Обратитесь к администратору сервера."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не установлен. Обратитесь к администратору сервера."
    exit 1
fi

echo "📁 Подготовка директории развертывания..."
mkdir -p /home/chhh/childdev-cl
cd /home/chhh/childdev-cl

# If git repo exists, pull latest changes
if [ -d ".git" ]; then
    echo "🔄 Обновление кода..."
    git pull origin main
else
    echo "📥 Клонирование репозитория..."
    # For now, we'll create the structure manually since we don't have git repo yet
    mkdir -p services/{web,pdf}
    mkdir -p scripts
    mkdir -p infra
fi

echo "⚙️ Проверка Docker сервисов..."
docker --version
docker-compose --version

echo "✅ Сервер готов к развертыванию"

ENDSSH

echo "📦 Копирование файлов на сервер..."

# Copy the entire project to production server
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude '.next' --exclude 'dist' \
    -e "ssh -i ~/.ssh/childdev_prod" \
    ./ chhh@children.hhivp.com:/home/chhh/childdev-cl/

echo "🐳 Запуск Docker контейнеров на продакшн сервере..."

ssh -i ~/.ssh/childdev_prod chhh@children.hhivp.com << 'ENDSSH'
cd /home/chhh/childdev-cl

echo "🔨 Сборка и запуск контейнеров..."
docker-compose -f docker-compose.prod.yml down || true
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

echo "⏳ Ожидание готовности сервисов..."
sleep 30

echo "🩺 Проверка состояния контейнеров..."
docker-compose -f docker-compose.prod.yml ps

echo "🔍 Проверка health checks..."
docker-compose -f docker-compose.prod.yml exec -T childdev-web curl -f http://localhost:3002/api/health || echo "Web service health check failed"
docker-compose -f docker-compose.prod.yml exec -T childdev-pdf curl -f http://localhost:3001/health || echo "PDF service health check failed"

echo "📊 Просмотр логов..."
docker-compose -f docker-compose.prod.yml logs --tail=10

ENDSSH

echo "🎉 Развертывание завершено!"
echo ""
echo "🌐 Проверьте работу платформы:"
echo "   http://children.hhivp.com:3002"
echo ""
echo "📋 Полезные команды для управления:"
echo "   ssh -i ~/.ssh/childdev_prod chhh@children.hhivp.com"
echo "   docker-compose -f /home/chhh/childdev-cl/docker-compose.prod.yml ps"
echo "   docker-compose -f /home/chhh/childdev-cl/docker-compose.prod.yml logs -f"