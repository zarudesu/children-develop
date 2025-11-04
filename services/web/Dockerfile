# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm ci --silent

# Copy source code and build
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Create system user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy package.json and install ONLY production dependencies
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
RUN npm ci --only=production --silent && npm cache clean --force

# Copy built Next.js application
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Create data directory and copy template for global stats
RUN mkdir -p /app/data
COPY --from=builder /app/data/global-stats.json.template /app/data/

# Initialize global-stats.json if it doesn't exist (at build time)
RUN if [ ! -f /app/data/global-stats.json ]; then \
      cp /app/data/global-stats.json.template /app/data/global-stats.json; \
    fi

# Set ownership for data directory (before switching to nextjs user)
RUN chown -R nextjs:nodejs /app/data

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start Next.js server
CMD ["npm", "run", "start"]
