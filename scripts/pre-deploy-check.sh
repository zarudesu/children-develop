#!/bin/bash

# Pre-deployment check script
set -e

echo "🔍 Pre-deployment checks for zardes.com/children/"
echo "================================================="

# Check if .env.production exists
if [ -f ".env.production" ]; then
    echo "✅ .env.production exists"
    if grep -q "zardes.com" .env.production; then
        echo "✅ Domain configured for zardes.com"
    else
        echo "❌ Domain not configured for zardes.com"
        exit 1
    fi
else
    echo "❌ .env.production missing"
    exit 1
fi

# Check if Docker files exist
if [ -f "services/web/Dockerfile" ] && [ -f "services/pdf/Dockerfile" ]; then
    echo "✅ Docker files present"
else
    echo "❌ Docker files missing"
    exit 1
fi

# Check if production compose exists
if [ -f "infra/docker/compose.prod.yml" ]; then
    echo "✅ Production compose configuration ready"
else
    echo "❌ Production compose missing"
    exit 1
fi

# Test build processes
echo "🏗️ Testing builds..."
cd services/web
if npm run build > /dev/null 2>&1; then
    echo "✅ Web service builds successfully"
else
    echo "❌ Web service build failed"
    exit 1
fi

cd ../pdf
if npm run build > /dev/null 2>&1; then
    echo "✅ PDF service builds successfully"
else
    echo "❌ PDF service build failed"
    exit 1
fi

cd ../..

echo ""
echo "✅ All checks passed! Ready for deployment"
echo ""
echo "🚀 To deploy run:"
echo "   ./scripts/deploy-vps.sh"
echo ""
echo "📋 Manual steps after deployment:"
echo "1. Add Nginx configuration to main zardes.com server"
echo "2. Reload Nginx: sudo nginx -s reload" 
echo "3. Test: https://zardes.com/children/filword"
