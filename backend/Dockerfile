# Multi-stage build for backend
FROM node:20-bullseye AS builder

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Copy Prisma schema before install so client generation can run in this stage
COPY backend/prisma ./prisma

# Install all dependencies in the builder stage.
RUN apt-get update && apt-get install -y libssl1.1 --no-install-recommends \
    && npm install --no-audit --no-fund --legacy-peer-deps

# Generate Prisma client during the build so the runtime image does not need prisma CLI
RUN npx prisma generate

# Copy source code
COPY backend/src ./src
COPY backend/tsconfig.json ./

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-bullseye

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Copy Prisma schema
COPY backend/prisma ./prisma

# Copy node_modules from builder stage (includes generated Prisma client)
COPY --from=builder /app/node_modules ./node_modules

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Install runtime OpenSSL dependency required by Prisma
RUN apt-get update && apt-get install -y libssl1.1 --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["node", "dist/server.js"]
