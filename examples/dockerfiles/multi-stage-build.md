# Multi-Stage Build Example

Multi-stage builds help create smaller, more secure production images by separating build and runtime environments.

## Dockerfile

```dockerfile
# Stage 1: Build
FROM node:18 AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:18-alpine

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built artifacts from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

# Start application
CMD ["node", "dist/index.js"]
```

## Benefits

1. **Smaller Image Size**: Only production dependencies and built artifacts
2. **Better Security**: No build tools or source code in production image
3. **Clear Separation**: Build and runtime environments are separate
4. **Layer Optimization**: Each stage can be optimized independently

## Building

```bash
docker build -t multi-stage-app .
```

## Image Size Comparison

```bash
# Single-stage build: ~900MB
# Multi-stage build: ~150MB
docker images multi-stage-app
```

## Running

```bash
docker run -d -p 3000:3000 --name prod-app multi-stage-app
```

## Advanced Example with Testing

```dockerfile
# Stage 1: Dependencies
FROM node:18 AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Build
FROM node:18 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Test (optional, can be skipped in production)
FROM node:18 AS test
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run test

# Stage 4: Production
FROM node:18-alpine AS production
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
USER nodejs
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

## Building Specific Stage

```bash
# Build only up to test stage
docker build --target test -t myapp:test .

# Build production stage
docker build --target production -t myapp:prod .
```

## Key Points

- Use `AS` to name build stages
- Use `--from=<stage>` in COPY to copy from previous stages
- Choose lighter base images for final stage (alpine)
- Install only production dependencies in final stage
- Run as non-root user for security
- Add health checks for monitoring
