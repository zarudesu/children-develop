# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files and tsconfig
COPY package*.json tsconfig.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage - используем официальный Playwright образ
FROM mcr.microsoft.com/playwright:v1.40.0-jammy AS runner

WORKDIR /app

# Copy built application and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/templates ./templates
COPY --from=builder /app/package*.json ./

# Install only production dependencies (Playwright уже установлен в образе)
RUN npm ci --only=production

# Create non-root user (pwuser уже существует в Playwright образе)
USER pwuser

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Start the application
CMD ["npm", "start"]
