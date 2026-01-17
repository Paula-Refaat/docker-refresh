# Node.js Docker Application Example

A complete example of containerizing a Node.js Express application.

## Project Structure

```
nodejs-app/
├── Dockerfile
├── .dockerignore
├── package.json
├── server.js
└── README.md
```

## Files

### server.js

```javascript
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Docker Node.js App!',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API endpoint
app.get('/api/info', (req, res) => {
  res.json({
    hostname: require('os').hostname(),
    platform: process.platform,
    nodeVersion: process.version,
    memory: process.memoryUsage()
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### package.json

```json
{
  "name": "docker-nodejs-app",
  "version": "1.0.0",
  "description": "A simple Node.js app for Docker",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### Dockerfile

```dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY server.js ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start application
CMD ["npm", "start"]
```

### .dockerignore

```
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.dockerignore
Dockerfile
.vscode
coverage
.nyc_output
```

## Usage

### Build the Image

```bash
docker build -t nodejs-app .
```

### Run the Container

```bash
# Basic run
docker run -d -p 3000:3000 --name my-nodejs-app nodejs-app

# With environment variables
docker run -d \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  --name my-nodejs-app \
  nodejs-app

# With resource limits
docker run -d \
  -p 3000:3000 \
  --memory="512m" \
  --cpus="0.5" \
  --restart unless-stopped \
  --name my-nodejs-app \
  nodejs-app
```

### Test the Application

```bash
# Test root endpoint
curl http://localhost:3000

# Test health endpoint
curl http://localhost:3000/health

# Test info endpoint
curl http://localhost:3000/api/info
```

### View Logs

```bash
docker logs -f my-nodejs-app
```

### Stop and Remove

```bash
docker stop my-nodejs-app
docker rm my-nodejs-app
```

## Development Mode with Docker

### Dockerfile.dev

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

### Run in Development

```bash
# Build dev image
docker build -f Dockerfile.dev -t nodejs-app:dev .

# Run with volume mount for hot reload
docker run -d \
  -p 3000:3000 \
  -v $(pwd):/app \
  -v /app/node_modules \
  --name nodejs-app-dev \
  nodejs-app:dev
```

## Docker Compose (Optional)

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 10s
```

### Run with Docker Compose

```bash
docker-compose up -d
docker-compose logs -f
docker-compose down
```

## Best Practices Applied

✅ Use Alpine Linux for smaller image  
✅ Non-root user for security  
✅ Health check endpoint  
✅ Graceful shutdown handler  
✅ .dockerignore to exclude unnecessary files  
✅ npm ci for consistent installs  
✅ Only production dependencies  
✅ Proper signal handling  
✅ Environment variable configuration  
✅ Resource limits support  

## Troubleshooting

### Container exits immediately
```bash
docker logs my-nodejs-app
```

### Cannot connect to app
```bash
# Check if container is running
docker ps

# Check port mapping
docker port my-nodejs-app
```

### Memory issues
```bash
docker stats my-nodejs-app
```
