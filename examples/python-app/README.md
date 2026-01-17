# Python Docker Application Example

A complete example of containerizing a Python Flask application.

## Project Structure

```
python-app/
├── Dockerfile
├── .dockerignore
├── requirements.txt
├── app.py
└── README.md
```

## Files

### app.py

```python
from flask import Flask, jsonify
import os
import platform
import sys
from datetime import datetime

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({
        'message': 'Welcome to Docker Python App!',
        'version': '1.0.0',
        'environment': os.getenv('FLASK_ENV', 'production')
    })

@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat()
    }), 200

@app.route('/api/info')
def info():
    return jsonify({
        'hostname': platform.node(),
        'platform': platform.platform(),
        'python_version': sys.version,
        'architecture': platform.machine()
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
```

### requirements.txt

```
Flask==3.0.0
gunicorn==21.2.0
```

### Dockerfile

```dockerfile
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY app.py .

# Create non-root user
RUN useradd -m -u 1001 appuser && \
    chown -R appuser:appuser /app

USER appuser

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5000/health')" || exit 1

# Run application with gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "app:app"]
```

### .dockerignore

```
__pycache__
*.pyc
*.pyo
*.pyd
.Python
env/
venv/
pip-log.txt
pip-delete-this-directory.txt
.pytest_cache/
.coverage
htmlcov/
dist/
build/
*.egg-info/
.git
.gitignore
README.md
.env
.vscode
.idea
*.log
```

## Usage

### Build the Image

```bash
docker build -t python-app .
```

### Run the Container

```bash
# Basic run
docker run -d -p 5000:5000 --name my-python-app python-app

# With environment variables
docker run -d \
  -p 5000:5000 \
  -e FLASK_ENV=production \
  -e PORT=5000 \
  --name my-python-app \
  python-app

# With resource limits
docker run -d \
  -p 5000:5000 \
  --memory="512m" \
  --cpus="0.5" \
  --restart unless-stopped \
  --name my-python-app \
  python-app
```

### Test the Application

```bash
# Test root endpoint
curl http://localhost:5000

# Test health endpoint
curl http://localhost:5000/health

# Test info endpoint
curl http://localhost:5000/api/info
```

### View Logs

```bash
docker logs -f my-python-app
```

### Stop and Remove

```bash
docker stop my-python-app
docker rm my-python-app
```

## Development Mode

### Dockerfile.dev

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir flask-cors debugpy

COPY . .

EXPOSE 5000

ENV FLASK_ENV=development
ENV FLASK_DEBUG=1

CMD ["python", "app.py"]
```

### Run in Development

```bash
# Build dev image
docker build -f Dockerfile.dev -t python-app:dev .

# Run with volume mount for hot reload
docker run -d \
  -p 5000:5000 \
  -v $(pwd):/app \
  -e FLASK_ENV=development \
  --name python-app-dev \
  python-app:dev
```

## Multi-Stage Build (Optimized)

```dockerfile
# Stage 1: Builder
FROM python:3.11-slim AS builder

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Stage 2: Runtime
FROM python:3.11-slim

WORKDIR /app

# Copy Python dependencies from builder
COPY --from=builder /root/.local /home/appuser/.local

# Copy application
COPY app.py .

# Create non-root user
RUN useradd -m -u 1001 appuser && \
    chown -R appuser:appuser /app

USER appuser

# Update PATH
ENV PATH=/home/appuser/.local/bin:$PATH

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5000/health')" || exit 1

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "app:app"]
```

## Docker Compose

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - PORT=5000
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:5000/health')"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 10s
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

### Run with Docker Compose

```bash
docker-compose up -d
docker-compose logs -f
docker-compose down
```

## Best Practices Applied

✅ Use slim Python image for smaller size  
✅ Non-root user for security  
✅ Health check endpoint  
✅ .dockerignore to exclude unnecessary files  
✅ pip --no-cache-dir to reduce image size  
✅ Only production dependencies  
✅ Gunicorn for production server  
✅ Environment variable configuration  
✅ Multi-stage build option  
✅ Resource limits support  

## Advanced: With PostgreSQL

### docker-compose.yml (with database)

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://postgres:secret@db:5432/myapp
      - FLASK_ENV=production
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped
  
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=secret
      - POSTGRES_DB=myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

## Troubleshooting

### Container exits immediately
```bash
docker logs my-python-app
```

### Module not found errors
```bash
# Rebuild with no cache
docker build --no-cache -t python-app .
```

### Port already in use
```bash
# Use different port
docker run -d -p 5001:5000 --name my-python-app python-app
```

### Check container health
```bash
docker inspect --format='{{.State.Health.Status}}' my-python-app
```
