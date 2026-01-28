# Multi-Service Docker Compose Example

A complete example of a web application with a PostgreSQL database.

## docker-compose.yml

```yaml
version: '3.8'

services:
  # Web Application
  web:
    build: 
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:secret@db:5432/myapp
      - REDIS_URL=redis://cache:6379
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_healthy
    networks:
      - app-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # PostgreSQL Database
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=secret
      - POSTGRES_DB=myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - app-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  cache:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - app-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

## Usage

### Start Services

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f web
```

### Access Services

```bash
# Web application
curl http://localhost:3000

# Connect to PostgreSQL
docker-compose exec db psql -U postgres -d myapp

# Connect to Redis
docker-compose exec cache redis-cli
```

### Stop Services

```bash
# Stop services
docker-compose down

# Stop and remove volumes (caution: deletes data!)
docker-compose down -v
```

## Environment Variables (.env file)

Create a `.env` file for environment-specific configuration:

```env
# Application
NODE_ENV=production
PORT=3000

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=myapp

# Redis
REDIS_PASSWORD=your_redis_password
```

Update docker-compose.yml to use .env:

```yaml
services:
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
```

## Development Override

### docker-compose.override.yml

This file is automatically used in development:

```yaml
version: '3.8'

services:
  web:
    build:
      target: development
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    command: npm run dev
    ports:
      - "3000:3000"
      - "9229:9229"  # Debug port
```

### docker-compose.prod.yml

For production deployment:

```yaml
version: '3.8'

services:
  web:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  db:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
    volumes:
      - /var/lib/postgresql/data:/var/lib/postgresql/data
```

Use with:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Database Initialization

### init.sql

```sql
-- Create tables
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO users (username, email) VALUES
    ('john_doe', 'john@example.com'),
    ('jane_smith', 'jane@example.com')
ON CONFLICT (username) DO NOTHING;
```

## Backup and Restore

### Backup Database

```bash
# Backup to file
docker-compose exec db pg_dump -U postgres myapp > backup.sql

# Backup with timestamp
docker-compose exec db pg_dump -U postgres myapp > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database

```bash
# Restore from file
docker-compose exec -T db psql -U postgres myapp < backup.sql
```

## Monitoring

### View Resource Usage

```bash
docker-compose ps
docker stats
```

### Check Health Status

```bash
docker-compose ps
docker inspect <container_name> --format='{{.State.Health.Status}}'
```

## Troubleshooting

### Service won't start
```bash
# Check logs
docker-compose logs web

# Rebuild without cache
docker-compose build --no-cache web
docker-compose up -d
```

### Database connection issues
```bash
# Check if database is ready
docker-compose exec db pg_isready -U postgres

# Check network connectivity
docker-compose exec web ping db
```

### Clear everything and restart
```bash
docker-compose down -v
docker-compose up --build -d
```

## Best Practices

✅ Use health checks for all services  
✅ Define networks explicitly  
✅ Use named volumes for data persistence  
✅ Set restart policies  
✅ Use environment variables for configuration  
✅ Implement proper dependency ordering  
✅ Use .env files for secrets (don't commit!)  
✅ Define resource limits in production  
✅ Enable logging configuration  
✅ Regular backups of persistent data  

## Security Notes

⚠️ Never commit `.env` files with secrets  
⚠️ Use strong passwords in production  
⚠️ Limit resource usage to prevent abuse  
⚠️ Use secrets management for sensitive data  
⚠️ Keep images updated for security patches  
