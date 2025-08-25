#!/bin/bash

# Complete deployment checklist for ChildDev
set -e

echo "🚀 ChildDev Production Deployment Checklist"
echo "============================================"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "ok")
            echo -e "${GREEN}✅ ${message}${NC}"
            ;;
        "warning")
            echo -e "${YELLOW}⚠️  ${message}${NC}"
            ;;
        "error")
            echo -e "${RED}❌ ${message}${NC}"
            ;;
        "info")
            echo -e "${BLUE}ℹ️  ${message}${NC}"
            ;;
    esac
}

# Check prerequisites
echo -e "\n${BLUE}📋 Checking Prerequisites...${NC}"

if command_exists docker; then
    print_status "ok" "Docker is installed"
else
    print_status "error" "Docker is not installed"
    exit 1
fi

if command_exists docker-compose; then
    print_status "ok" "Docker Compose is installed"
else
    print_status "error" "Docker Compose is not installed"
    exit 1
fi
" ]; then
    print_status "ok" "PDF service Dockerfile exists"
else
    print_status "error" "PDF service Dockerfile is missing"
    exit 1
fi

if [ -f "infra/docker/compose.prod.yml" ]; then
    print_status "ok" "Production Docker Compose exists"
else
    print_status "error" "Production Docker Compose is missing"
    exit 1
fi

# Check nginx configuration
echo -e "\n${BLUE}🌐 Checking Nginx Configuration...${NC}"

if [ -f "infra/nginx/nginx.conf" ]; then
    print_status "ok" "Nginx configuration exists"
else
    print_status "error" "Nginx configuration is missing"
    exit 1
fi

# Check system resources
echo -e "\n${BLUE}💻 Checking System Resources...${NC}"

# Check available memory (in MB)
AVAILABLE_MEMORY=$(free -m | awk 'NR==2{printf "%.0f", $7}')
if [ "$AVAILABLE_MEMORY" -gt 1000 ]; then
    print_status "ok" "Available memory: ${AVAILABLE_MEMORY}MB"
else
    print_status "warning" "Low available memory: ${AVAILABLE_MEMORY}MB (recommended: >1GB)"
fi

# Check available disk space (in GB)
AVAILABLE_DISK=$(df -BG . | awk 'NR==2{printf "%.0f", $4}' | sed 's/G//')
if [ "$AVAILABLE_DISK" -gt 5 ]; then
    print_status "ok" "Available disk space: ${AVAILABLE_DISK}GB"
else
    print_status "warning" "Low disk space: ${AVAILABLE_DISK}GB (recommended: >5GB)"
fi

# Check if ports are available
echo -e "\n${BLUE}🔌 Checking Port Availability...${NC}"

if ! netstat -tuln | grep -q ":80 "; then
    print_status "ok" "Port 80 is available"
else
    print_status "warning" "Port 80 is in use"
fi

if ! netstat -tuln | grep -q ":443 "; then
    print_status "ok" "Port 443 is available"
else
    print_status "warning" "Port 443 is in use"
fi

# Final summary
echo -e "\n${GREEN}🎉 Pre-deployment Check Complete!${NC}"
echo -e "\n${BLUE}Next Steps:${NC}"
echo "1. Run: ./scripts/deploy-prod.sh"
echo "2. Monitor logs: docker-compose -f infra/docker/compose.prod.yml logs -f"
echo "3. Test the application at your domain"
echo ""
print_status "info" "Deployment script will handle the rest automatically"
