# Full-Stack Application with Docker Compose

Complete example of a full-stack application with React frontend, Node.js backend, and PostgreSQL database.

## Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Frontend  │─────▶│   Backend   │─────▶│  Database   │
│  (React)    │      │  (Node.js)  │      │ (PostgreSQL)│
│  Port: 80   │      │  Port: 3000 │      │  Port: 5432 │
└─────────────┘      └─────────────┘      └─────────────┘
```

## docker-compose.yml

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  database:
    image: postgres:15-alpine
    container_name: fullstack-db
    environment:
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
      POSTGRES_DB: ${DB_NAME:-fullstack_db}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - backend-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Node.js Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: fullstack-backend
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: postgresql://${DB_USER:-postgres}:${DB_PASSWORD:-postgres}@database:5432/${DB_NAME:-fullstack_db}
      JWT_SECRET: ${JWT_SECRET:-your-secret-key}
    ports:
      - "3000:3000"
    depends_on:
      database:
        condition: service_healthy
    networks:
      - backend-network
      - frontend-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # React Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: fullstack-frontend
    environment:
      REACT_APP_API_URL: http://localhost:3000/api
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - frontend-network
    restart: unless-stopped

  # Nginx Reverse Proxy (Optional)
  nginx:
    image: nginx:alpine
    container_name: fullstack-nginx
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    ports:
      - "8080:80"
    depends_on:
      - frontend
      - backend
    networks:
      - frontend-network
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  frontend-network:
    driver: bridge
  backend-network:
    driver: bridge
    internal: true
```

## Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "dist/server.js"]
```

## Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

## Database Init Script

```sql
-- database/init.sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);

-- Insert sample data
INSERT INTO users (username, email, password_hash) VALUES
    ('admin', 'admin@example.com', '$2a$10$samplehash1'),
    ('user1', 'user1@example.com', '$2a$10$samplehash2')
ON CONFLICT (username) DO NOTHING;
```

## Nginx Configuration

```nginx
# nginx/nginx.conf
upstream backend {
    server backend:3000;
}

server {
    listen 80;
    server_name localhost;

    # Frontend
    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support (if needed)
    location /ws {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Environment Variables (.env)

```env
# Database
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=fullstack_db

# Backend
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production

# Frontend
REACT_APP_API_URL=http://localhost:3000/api
```

## Usage

### Start All Services

```bash
# Development
docker-compose up -d

# Production with rebuild
docker-compose up -d --build

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Development Mode

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      target: development
    volumes:
      - ./backend/src:/app/src
      - /app/node_modules
    environment:
      - NODE_ENV=development
    command: npm run dev

  frontend:
    build:
      context: ./frontend
      target: development
    volumes:
      - ./frontend/src:/app/src
      - /app/node_modules
    environment:
      - REACT_APP_API_URL=http://localhost:3000/api
    command: npm start
```

Run with:
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

## Accessing Services

- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:3000/api
- **Nginx Proxy**: http://localhost:8080
- **Database**: localhost:5432 (from host)

## Testing

```bash
# Test backend health
curl http://localhost:3000/api/health

# Test database connection
docker-compose exec backend node -e "require('./dist/db').testConnection()"

# Test frontend
curl http://localhost/
```

## Monitoring

```bash
# View resource usage
docker stats

# View container status
docker-compose ps

# Check health status
docker inspect fullstack-backend --format='{{.State.Health.Status}}'
```

## Backup Database

```bash
# Create backup
docker-compose exec database pg_dump -U postgres fullstack_db > backup.sql

# With timestamp
docker-compose exec database pg_dump -U postgres fullstack_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

## Restore Database

```bash
docker-compose exec -T database psql -U postgres fullstack_db < backup.sql
```

## Scaling Services

```bash
# Scale backend instances
docker-compose up -d --scale backend=3
```

## Production Considerations

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  backend:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1'
          memory: 1G
      restart_policy:
        condition: on-failure
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  frontend:
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

## Troubleshooting

### Backend can't connect to database
```bash
# Check database is ready
docker-compose exec database pg_isready -U postgres

# Check network connectivity
docker-compose exec backend ping database
```

### Frontend can't reach backend
```bash
# Check backend is running
docker-compose ps backend

# Check backend health
curl http://localhost:3000/api/health
```

### Database connection refused
```bash
# Check database logs
docker-compose logs database

# Restart database
docker-compose restart database
```

## Best Practices Applied

✅ Multi-stage builds for smaller images  
✅ Health checks for all services  
✅ Non-root users for security  
✅ Network segmentation (frontend/backend)  
✅ Environment variable configuration  
✅ Volume persistence for database  
✅ Proper dependency ordering  
✅ Resource limits in production  
✅ Logging configuration  
✅ Graceful shutdown support  
