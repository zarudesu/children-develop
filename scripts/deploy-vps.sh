#!/bin/bash

# VPS Deployment script for ChildDev on zardes.com/children/
set -e

echo "🚀 Deploying ChildDev to zardes.com/children/"
echo "============================================"

VPS_HOST="zardes.com"
VPS_USER="root"  # или ваш пользователь
DEPLOY_PATH="/var/www/children-develop"
PROJECT_NAME="children-develop"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    local status=$1
    local message=$2
    case $status in
        "ok") echo -e "${GREEN}✅ ${message}${NC}" ;;
        "warning") echo -e "${YELLOW}⚠️  ${message}${NC}" ;;
        "error") echo -e "${RED}❌ ${message}${NC}" ;;
        "info") echo -e "${BLUE}ℹ️  ${message}${NC}" ;;
    esac
}

# Check if we can connect to VPS
print_status "info" "Checking connection to VPS..."
if ssh -o ConnectTimeout=5 ${VPS_USER}@${VPS_HOST} "echo 'Connected'" >/dev/null 2>&1; then
    print_status "ok" "VPS connection successful"
else
    print_status "error" "Cannot connect to VPS. Check your SSH keys and connection."
    echo "Setup: ssh-copy-id ${VPS_USER}@${VPS_HOST}"
    exit 1
fi

# Create deployment directory
print_status "info" "Setting up deployment directory..."
ssh ${VPS_USER}@${VPS_HOST} "mkdir -p ${DEPLOY_PATH}"

# Copy project files to VPS
print_status "info" "Uploading project files..."
rsync -avz --exclude='.git' \
           --exclude='node_modules' \
           --exclude='.next' \
           --exclude='dist' \
           --exclude='logs' \
           --exclude='.env.local' \
           . ${VPS_USER}@${VPS_HOST}:${DEPLOY_PATH}/

# Deploy on VPS
print_status "info" "Running deployment on VPS..."
ssh ${VPS_USER}@${VPS_HOST} << EOF
    set -e
    cd ${DEPLOY_PATH}
    
    echo "📦 Installing dependencies..."
    # Install Docker and Docker Compose if not installed
    if ! command -v docker &> /dev/null; then
        echo "Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        systemctl enable docker
        systemctl start docker
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo "Installing Docker Compose..."
        curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
    fi
    
    echo "🏗️ Building and starting containers..."
    cd infra/docker
    
    # Stop existing containers if running
    docker-compose -f compose.prod.yml down 2>/dev/null || true
    
    # Build and start new containers
    docker-compose -f compose.prod.yml build --no-cache
    docker-compose -f compose.prod.yml up -d
    
    echo "⏳ Waiting for services to be ready..."
    sleep 30
    
    echo "🔍 Checking service health..."
    if docker-compose -f compose.prod.yml ps | grep -q "Up"; then
        echo "✅ Services are running!"
    else
        echo "❌ Service check failed. Logs:"
        docker-compose -f compose.prod.yml logs --tail=20
    fi
EOF

print_status "ok" "Deployment completed!"
print_status "info" "Next steps:"
echo "1. Configure your main Nginx to proxy /children/ to the containers"
echo "2. Add SSL certificate for zardes.com"
echo "3. Test the application at https://zardes.com/children/"

echo ""
print_status "info" "Nginx configuration to add to your main server:"
echo "# Add this to your existing zardes.com server block:"
cat << 'NGINX_CONFIG'

    # ChildDev Application
    location /children/ {
        proxy_pass http://localhost:3002/children/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 10s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # ChildDev PDF API
    location /children/api/pdf/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # ChildDev static assets with caching
    location ~* /children/_next/static/ {
        proxy_pass http://localhost:3002;
        proxy_set_header Host $host;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

NGINX_CONFIG

echo ""
print_status "info" "After adding Nginx config, reload: sudo nginx -s reload"
