# ============================================
# MediCap — Dockerfile for Google Cloud Run
# ============================================

# Use official Node.js LTS image
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package.json ./

# Install production dependencies only
RUN npm install --omit=dev && npm cache clean --force

# Copy application source
COPY server.js ./
COPY public/ ./public/

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Expose port (Cloud Run uses PORT env variable)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

# Run as non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S medicap -u 1001 -G nodejs
USER medicap

# Start the server
CMD ["node", "server.js"]
