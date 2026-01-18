# Docker Best Practices

## Dockerfile Best Practices

### 1. Use Official Base Images
```dockerfile
# Good
FROM node:18-alpine

# Avoid
FROM ubuntu
RUN apt-get install nodejs
```

### 2. Use Specific Tags
```dockerfile
# Good
FROM node:18-alpine

# Avoid (unpredictable)
FROM node:latest
```

### 3. Multi-Stage Builds
Reduce final image size by using multi-stage builds:
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/index.js"]
```

### 4. Minimize Layers
```dockerfile
# Good - Single RUN command
RUN apk add --no-cache \
    git \
    curl \
    wget

# Avoid - Multiple layers
RUN apk add git
RUN apk add curl
RUN apk add wget
```

### 5. Leverage Build Cache
Order instructions from least to most frequently changing:
```dockerfile
FROM node:18-alpine
WORKDIR /app

# Dependencies change less frequently
COPY package*.json ./
RUN npm ci

# Source code changes frequently
COPY . .

CMD ["npm", "start"]
```

### 6. Use .dockerignore
Exclude unnecessary files from build context:
```
node_modules
npm-debug.log
.git
.env
README.md
```

### 7. Don't Run as Root
```dockerfile
# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to user
USER nodejs
```

### 8. Use COPY Instead of ADD
```dockerfile
# Good
COPY package.json .

# Use ADD only for auto-extraction
ADD archive.tar.gz /app
```

### 9. One Process Per Container
Each container should have a single responsibility.

### 10. Use Health Checks
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

## Image Optimization

### 1. Use Alpine Images
```dockerfile
FROM node:18-alpine  # ~170MB
# vs
FROM node:18  # ~900MB
```

### 2. Remove Temporary Files
```dockerfile
RUN apt-get update && \
    apt-get install -y package && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

### 3. Use .dockerignore
Reduce build context size.

### 4. Combine Commands
```dockerfile
RUN npm ci --only=production && \
    npm cache clean --force
```

## Security Best Practices

### 1. Don't Store Secrets in Images
```dockerfile
# Bad
ENV API_KEY=secret123

# Good - Use runtime secrets
docker run -e API_KEY=secret123 image
```

### 2. Scan Images for Vulnerabilities
```bash
docker scan image-name
```

### 3. Use Official Images
Prefer official images from Docker Hub.

### 4. Keep Images Updated
Regularly update base images to get security patches.

### 5. Use Non-Root Users
Always run containers as non-root users.

### 6. Limit Container Resources
```bash
docker run --memory="512m" --cpus="1" image
```

## Docker Compose Best Practices

### 1. Use Version 3.8+
```yaml
version: '3.8'
```

### 2. Use Environment Files
```yaml
services:
  app:
    env_file:
      - .env
```

### 3. Define Dependencies
```yaml
services:
  app:
    depends_on:
      - db
      - redis
```

### 4. Use Named Volumes
```yaml
volumes:
  db-data:
    driver: local
```

### 5. Configure Restart Policies
```yaml
services:
  app:
    restart: unless-stopped
```

### 6. Use Networks for Isolation
```yaml
networks:
  frontend:
  backend:

services:
  app:
    networks:
      - frontend
      - backend
```

## Development vs Production

### Development
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install  # Include dev dependencies
COPY . .
CMD ["npm", "run", "dev"]
```

### Production
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production  # Only production deps
COPY . .
USER nodejs
CMD ["npm", "start"]
```

## Monitoring and Logging

### 1. Use Health Checks
```yaml
services:
  app:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 3s
      retries: 3
```

### 2. Configure Logging
```yaml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 3. Monitor Resource Usage
```bash
docker stats
```

## Common Pitfalls to Avoid

1. ❌ Using `latest` tag
2. ❌ Running as root user
3. ❌ Storing secrets in images
4. ❌ Large image sizes
5. ❌ Not using .dockerignore
6. ❌ Installing unnecessary packages
7. ❌ Not cleaning up in same layer
8. ❌ Not leveraging layer caching
9. ❌ Copying entire project before installing dependencies
10. ❌ Not using health checks
