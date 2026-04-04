# ============================================
# MediCap — Dockerfile for Google Cloud Run
# v3.1 — SQLite + Google Cloud Services
# ============================================

FROM node:20-alpine AS production

# Install build tools for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including native builds)
RUN npm install --omit=dev && npm cache clean --force

# Copy application source
COPY server.js ./
COPY public/ ./public/
COPY services/ ./services/
COPY tests/ ./tests/

# Create data directory for SQLite
RUN mkdir -p /app/data

# Set environment
ENV NODE_ENV=production
ENV PORT=8080
ENV GOOGLE_CLOUD_PROJECT=medicap-cloud

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

# Run as non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S medicap -u 1001 -G nodejs && \
    chown -R medicap:nodejs /app/data
USER medicap

CMD ["node", "server.js"]
