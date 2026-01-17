# Docker Best Practices & Security

## Image Best Practices

### 1. Use Official Base Images
```dockerfile
# Good - Official image
FROM node:18-alpine

# Avoid - Unverified images
FROM random-user/node-custom
```

### 2. Use Specific Tags
```dockerfile
# Good - Specific version
FROM node:18.17-alpine3.18

# Avoid - Latest tag (unpredictable)
FROM node:latest
```

### 3. Minimize Layers
```dockerfile
# Good - Combined commands
RUN apt-get update && apt-get install -y \
    curl \
    git \
    vim \
    && rm -rf /var/lib/apt/lists/*

# Avoid - Multiple layers
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y git
RUN apt-get install -y vim
```

### 4. Use Multi-Stage Builds
```dockerfile
# Build stage
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/index.js"]
```

### 5. Order Dockerfile Instructions Properly
```dockerfile
# Good - Least to most frequently changed
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]

# Avoid - Frequent cache invalidation
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "start"]
```

### 6. Use .dockerignore
```
# .dockerignore
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.vscode
.idea
dist
coverage
*.test.js
```

## Security Best Practices

### 1. Don't Run as Root
```dockerfile
# Good - Non-root user
FROM node:18-alpine
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs
WORKDIR /app
COPY --chown=nodejs:nodejs . .
CMD ["node", "server.js"]

# Avoid - Running as root
FROM node:18-alpine
WORKDIR /app
COPY . .
CMD ["node", "server.js"]
```

### 2. Scan for Vulnerabilities
```bash
# Use Docker Scout or Snyk
docker scout cves myimage:latest

# Use Trivy
trivy image myimage:latest

# Use Snyk
snyk container test myimage:latest
```

### 3. Don't Store Secrets in Images
```dockerfile
# Bad - Secret in image
ENV API_KEY=secret123

# Good - Pass at runtime
# docker run -e API_KEY=secret123 myapp

# Better - Use secrets management
# Docker secrets, Kubernetes secrets, Vault, etc.
```

### 4. Use Read-Only Filesystem
```bash
docker run --read-only --tmpfs /tmp myapp
```

### 5. Limit Resources
```bash
# Limit memory and CPU
docker run -m 512m --cpus 1.0 myapp

# In docker-compose.yml
services:
  app:
    image: myapp
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### 6. Keep Images Updated
```bash
# Regularly rebuild images with updated base images
docker pull node:18-alpine
docker build --no-cache -t myapp .
```

### 7. Use Security Headers and HTTPS
```nginx
# nginx configuration
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

## Performance Optimization

### 1. Use Alpine Linux
```dockerfile
# Smaller image size
FROM node:18-alpine
# vs
FROM node:18  # Much larger
```

### 2. Leverage Build Cache
```dockerfile
# Copy dependencies first
COPY package*.json ./
RUN npm install

# Then copy source code
COPY . .
```

### 3. Remove Unnecessary Files
```dockerfile
RUN apt-get update && apt-get install -y \
    build-essential \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
```

### 4. Use Health Checks
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

### 5. Optimize for Production
```dockerfile
# Production-only dependencies
RUN npm ci --only=production

# Optimize Node.js
ENV NODE_ENV=production
```

## Container Best Practices

### 1. One Process Per Container
```bash
# Good - Separate containers
docker run -d nginx
docker run -d postgres

# Avoid - Multiple processes in one container
```

### 2. Use Named Volumes
```bash
# Good - Named volume
docker run -v mydata:/data postgres

# Avoid - Anonymous volume
docker run -v /data postgres
```

### 3. Use Networks for Communication
```bash
# Create network
docker network create myapp-network

# Run containers on same network
docker run --network myapp-network --name db postgres
docker run --network myapp-network --name web myapp
```

### 4. Log to stdout/stderr
```dockerfile
# Good - Logs to stdout
CMD ["node", "server.js"]

# Docker captures stdout/stderr
docker logs mycontainer
```

### 5. Use Restart Policies
```bash
docker run -d --restart unless-stopped myapp
```

## Production Readiness

### 1. Health Checks
```yaml
# docker-compose.yml
services:
  web:
    image: myapp
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### 2. Resource Limits
```yaml
services:
  web:
    image: myapp
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
        reservations:
          cpus: '1'
          memory: 512M
```

### 3. Logging Configuration
```yaml
services:
  web:
    image: myapp
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 4. Environment-Specific Configs
```bash
# Development
docker-compose -f docker-compose.yml up

# Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

### 5. Graceful Shutdown
```javascript
// Node.js example
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server')
  server.close(() => {
    console.log('HTTP server closed')
  })
})
```

## Monitoring and Debugging

### 1. Container Stats
```bash
docker stats
docker stats --no-stream
```

### 2. Inspect Containers
```bash
docker inspect mycontainer
docker inspect --format='{{.State.Status}}' mycontainer
```

### 3. View Logs
```bash
docker logs -f --tail 100 mycontainer
```

### 4. Execute Commands
```bash
docker exec -it mycontainer /bin/sh
```

### 5. Export Metrics
```yaml
# Prometheus monitoring
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"
```

## Common Pitfalls to Avoid

1. ❌ Running containers as root
2. ❌ Using latest tag in production
3. ❌ Storing secrets in images
4. ❌ Not using .dockerignore
5. ❌ Creating unnecessary layers
6. ❌ Not cleaning up unused resources
7. ❌ Ignoring security vulnerabilities
8. ❌ Not setting resource limits
9. ❌ Using anonymous volumes
10. ❌ Not implementing health checks

## Checklist for Production

- [ ] Use specific image tags
- [ ] Run as non-root user
- [ ] Scan for vulnerabilities
- [ ] Implement health checks
- [ ] Set resource limits
- [ ] Use multi-stage builds
- [ ] Configure logging
- [ ] Use secrets management
- [ ] Implement graceful shutdown
- [ ] Monitor container metrics
- [ ] Regular security updates
- [ ] Use .dockerignore
- [ ] Optimize image size
- [ ] Test in staging environment
- [ ] Document container requirements
