#!/bin/bash

# SSL certificate setup script for ChildDev
set -e

DOMAIN=${1:-"your-domain.com"}
EMAIL=${2:-"admin@${DOMAIN}"}
SSL_DIR="/Users/zardes/Projects/childdev-cl/infra/nginx/ssl"

echo "🔐 Setting up SSL certificates for $DOMAIN"

# Create SSL directory
mkdir -p "$SSL_DIR"

echo "📋 SSL Certificate Setup Options:"
echo ""
echo "1. 🔄 Let's Encrypt (Recommended for production)"
echo "   - Free, auto-renewing certificates"
echo "   - Requires domain to be pointing to your server"
echo ""
echo "2. 🧪 Self-signed (Development/Testing only)"
echo "   - Quick setup, browser warnings"
echo "   - Not recommended for production"
echo ""

read -p "Choose option (1 or 2): " choice

case $choice in
    1)
        echo "🔄 Setting up Let's Encrypt certificates..."
        echo ""
        echo "Prerequisites:"
        echo "- Domain $DOMAIN must point to this server"
        echo "- Ports 80 and 443 must be accessible"
        echo ""
        echo "Commands to run on your server:"
        echo "sudo apt update && sudo apt install -y certbot"
        echo "sudo certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --no-eff-email"
        echo "sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $SSL_DIR/"
        echo "sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $SSL_DIR/"
        echo "sudo chown $(id -u):$(id -g) $SSL_DIR/*.pem"
        ;;
    2)
        echo "🧪 Generating self-signed certificates..."
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout "$SSL_DIR/privkey.pem" \
            -out "$SSL_DIR/fullchain.pem" \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=$DOMAIN"
        echo "✅ Self-signed certificates generated"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo "✅ SSL setup completed!"
