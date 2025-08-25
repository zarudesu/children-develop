#!/bin/bash

# Prepare repository for GitHub upload
set -e

echo "📦 Preparing ChildDev for GitHub repository..."

# Stop any running services
if [ -f ".web.pid" ]; then
    echo "⏹️  Stopping web service..."
    ./scripts/stop-local.sh
fi

# Remove any temporary/runtime files
echo "🧹 Cleaning up temporary files..."
rm -f .web.pid .pdf.pid
rm -rf logs/web.log logs/pdf.log
rm -rf services/web/.next
rm -rf services/*/node_modules
rm -f .env.local

# Create production environment template if it doesn't exist
if [ ! -f ".env.production.example" ]; then
    cp infra/env/.env.production.example .env.production.example
fi

# Create SSL directory structure (but keep certificates out of git)
mkdir -p infra/nginx/ssl
echo "# SSL certificates go here" > infra/nginx/ssl/README.md
echo "*.pem" > infra/nginx/ssl/.gitignore
echo "*.key" >> infra/nginx/ssl/.gitignore
echo "*.crt" >> infra/nginx/ssl/.gitignore

# Check if we have all required files
echo "✅ Checking required files..."

required_files=(
    "README.md"
    "CONTRIBUTING.md" 
    ".gitignore"
    "services/web/package.json"
    "services/pdf/package.json"
    "services/web/Dockerfile"
    "services/pdf/Dockerfile"
    "infra/docker/compose.prod.yml"
    "infra/nginx/nginx.conf"
    "scripts/deploy-prod.sh"
    "scripts/setup-ssl.sh"
    "docs/DEPLOYMENT.md"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (missing)"
    fi
done

echo ""
echo "🚀 Repository is ready for GitHub!"
echo ""
echo "Next steps:"
echo "1. git init"
echo "2. git add ."
echo "3. git commit -m 'Initial commit: ChildDev educational platform'"
echo "4. git branch -M main"
echo "5. git remote add origin https://github.com/zarudesu/children-develop.git"
echo "6. git push -u origin main"
echo ""
echo "🌐 GitHub repository: https://github.com/zarudesu/children-develop"
