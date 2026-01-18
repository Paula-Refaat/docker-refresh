# Docker Examples

This directory contains various Docker examples to help refresh Docker knowledge.

## Example 1: Simple Web Application

See the root directory for a complete Node.js Express application example with:
- Multi-stage Dockerfile
- Docker Compose setup
- Nginx reverse proxy
- Redis integration

## Example 2: Python Flask Application

### app.py
```python
from flask import Flask, jsonify
import os

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({
        'message': 'Hello from Python Flask in Docker!',
        'environment': os.getenv('FLASK_ENV', 'development')
    })

@app.route('/health')
def health():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

### Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN adduser --disabled-password --gecos '' appuser && \
    chown -R appuser:appuser /app
USER appuser

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD python -c "import requests; requests.get('http://localhost:5000/health')"

CMD ["python", "app.py"]
```

### requirements.txt
```
Flask==2.3.3
requests==2.31.0
```

## Example 3: Database Container

### PostgreSQL with Docker
```bash
docker run -d \
  --name postgres-db \
  -e POSTGRES_PASSWORD=mysecretpassword \
  -e POSTGRES_DB=myapp \
  -v postgres-data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:15-alpine
```

### MySQL with Docker
```bash
docker run -d \
  --name mysql-db \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=myapp \
  -v mysql-data:/var/lib/mysql \
  -p 3306:3306 \
  mysql:8
```

## Example 4: Multi-Container Application

### docker-compose.yml
```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - app-network

  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/myapp
    depends_on:
      - db
      - redis
    networks:
      - app-network

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=myapp
    volumes:
      - db-data:/var/lib/postgresql/data
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  db-data:
  redis-data:
```

## Example 5: Development with Docker

### Dockerfile.dev
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Install nodemon for hot-reloading
RUN npm install -g nodemon

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

### docker-compose.dev.yml
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
```

## Example 6: Environment Variables

### Using .env file
```bash
# .env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@db:5432/myapp
REDIS_URL=redis://redis:6379
```

### docker-compose.yml
```yaml
services:
  app:
    env_file:
      - .env
    # Or inline
    environment:
      - NODE_ENV=${NODE_ENV}
      - PORT=${PORT}
```

## Example 7: Volume Mounting

### Bind Mount (Development)
```bash
docker run -v $(pwd):/app myapp
```

### Named Volume (Production)
```bash
docker volume create app-data
docker run -v app-data:/app/data myapp
```

## Example 8: Networking

### Create Custom Network
```bash
docker network create my-app-network
```

### Run Containers on Same Network
```bash
docker run -d --name db --network my-app-network postgres:15
docker run -d --name app --network my-app-network myapp
```

### Connect Existing Container
```bash
docker network connect my-app-network container-name
```

## Example 9: Docker Build Arguments

### Dockerfile
```dockerfile
ARG NODE_VERSION=18
FROM node:${NODE_VERSION}-alpine

ARG BUILD_DATE
ARG VERSION

LABEL build-date=${BUILD_DATE}
LABEL version=${VERSION}

WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "start"]
```

### Build with Arguments
```bash
docker build \
  --build-arg NODE_VERSION=20 \
  --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
  --build-arg VERSION=1.0.0 \
  -t myapp:1.0.0 .
```

## Example 10: Docker Secrets (Swarm)

### Create Secret
```bash
echo "my-secret-password" | docker secret create db_password -
```

### Use in Service
```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    secrets:
      - db_password
    environment:
      - POSTGRES_PASSWORD_FILE=/run/secrets/db_password

secrets:
  db_password:
    external: true
```

## Running the Examples

### Build and run the Node.js app
```bash
docker build -t docker-refresh-app .
docker run -p 3000:3000 docker-refresh-app
```

### Using Docker Compose
```bash
docker-compose up -d
docker-compose logs -f
docker-compose down
```

### Access the application
```bash
curl http://localhost:3000
curl http://localhost:3000/health
```

## Useful Commands for Learning

### Inspect running container
```bash
docker exec -it container-name sh
docker logs -f container-name
docker stats container-name
```

### Debug build issues
```bash
docker build --no-cache -t myapp .
docker run -it myapp sh
```

### Clean up
```bash
docker system prune -a
docker volume prune
docker network prune
```
