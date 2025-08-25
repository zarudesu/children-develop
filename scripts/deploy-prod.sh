#!/bin/bash

# Production deployment script for ChildDev
set -e

echo "🚀 Starting ChildDev production deployment..."

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ Error: .env.production file not found"
    echo "📋 Copy .env.production.example and update values:"
    echo "   cp infra/env/.env.production.example .env.production"
    exit 1
fi

# Load environment variables
export $(grep -v '^#' .env.production | xargs)

# Validate required environment variables
if [ -z "$DOMAIN" ] || [ -z "$NEXT_PUBLIC_APP_URL" ]; then
    echo "❌ Error: DOMAIN and NEXT_PUBLIC_APP_URL must be set in .env.production"
    exit 1
fi

echo "🔧 Building and starting services..."

# Navigate to docker directory
cd infra/docker

# Stop existing services
echo "⏹️  Stopping existing services..."
docker-compose -f compose.prod.yml down

# Build and start services
echo "🔨 Building images..."
docker-compose -f compose.prod.yml build --no-cache

echo "▶️  Starting services..."
docker-compose -f compose.prod.yml up -d

echo "⏳ Waiting for services to be ready..."
sleep 30

# Health check
echo "🏥 Checking service health..."
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Services are healthy!"
    echo "🌐 Application is available at: $NEXT_PUBLIC_APP_URL"
else
    echo "❌ Health check failed. Checking logs..."
    docker-compose -f compose.prod.yml logs --tail=50
    exit 1
fi

echo "✅ Deployment completed successfully!"
echo ""
echo "📊 Service Status:"
docker-compose -f compose.prod.yml ps
