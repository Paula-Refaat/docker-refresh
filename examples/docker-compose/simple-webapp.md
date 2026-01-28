# Simple Web Application with Docker Compose

A basic single-service Docker Compose example.

## docker-compose.yml

```yaml
version: '3.8'

services:
  web:
    image: nginx:alpine
    container_name: simple-web
    ports:
      - "8080:80"
    volumes:
      - ./html:/usr/share/nginx/html:ro
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 3s
      retries: 3
```

## Usage

### 1. Create Project Directory

```bash
mkdir simple-webapp && cd simple-webapp
```

### 2. Create HTML Content

```bash
mkdir html
cat > html/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple Docker Web App</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            backdrop-filter: blur(10px);
        }
        h1 { margin: 0 0 1rem 0; }
        .emoji { font-size: 4rem; margin-bottom: 1rem; }
    </style>
</head>
<body>
    <div class="container">
        <div class="emoji">🐳</div>
        <h1>Hello from Docker!</h1>
        <p>This is a simple web application running in a container.</p>
    </div>
</body>
</html>
EOF
```

### 3. Create docker-compose.yml

```bash
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  web:
    image: nginx:alpine
    container_name: simple-web
    ports:
      - "8080:80"
    volumes:
      - ./html:/usr/share/nginx/html:ro
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 3s
      retries: 3
EOF
```

### 4. Start the Application

```bash
# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 5. Access the Application

Open your browser and visit: http://localhost:8080

### 6. Stop the Application

```bash
# Stop services
docker-compose down
```

## Commands Reference

```bash
# Start services
docker-compose up            # Foreground
docker-compose up -d         # Background (detached)

# Stop services
docker-compose stop          # Stop but don't remove
docker-compose down          # Stop and remove containers

# View logs
docker-compose logs          # All logs
docker-compose logs -f       # Follow logs
docker-compose logs web      # Specific service

# View status
docker-compose ps

# Restart services
docker-compose restart

# Execute command in service
docker-compose exec web sh

# Update and restart
docker-compose up -d --force-recreate
```

## Customization

### Add Custom Nginx Configuration

```nginx
# nginx.conf
server {
    listen 80;
    server_name localhost;
    
    location / {
        root /usr/share/nginx/html;
        index index.html;
    }
    
    location /api {
        return 200 '{"status": "ok"}';
        add_header Content-Type application/json;
    }
}
```

Update docker-compose.yml:
```yaml
services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./html:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
```

### Add Environment Variables

```yaml
services:
  web:
    image: nginx:alpine
    ports:
      - "${PORT:-8080}:80"
    environment:
      - TZ=America/New_York
```

Create `.env` file:
```env
PORT=9000
```

### Add Multiple Pages

```bash
cat > html/about.html << 'EOF'
<!DOCTYPE html>
<html>
<head><title>About</title></head>
<body>
    <h1>About This App</h1>
    <p>A simple Docker Compose example.</p>
    <a href="/">Home</a>
</body>
</html>
EOF
```

## Troubleshooting

### Port already in use
```bash
# Use different port
docker-compose down
# Edit docker-compose.yml to use different port (e.g., 8081:80)
docker-compose up -d
```

### Changes not reflecting
```bash
# Force recreate containers
docker-compose up -d --force-recreate
```

### View container logs
```bash
docker-compose logs web
```

## Key Concepts

- **version**: Docker Compose file format version
- **services**: Define containers to run
- **ports**: Map host port to container port (host:container)
- **volumes**: Mount directories from host to container
- **restart**: Define restart policy
- **healthcheck**: Monitor service health

## Best Practices

✅ Use specific image versions in production  
✅ Mount volumes as read-only when possible  
✅ Implement health checks  
✅ Use environment variables for configuration  
✅ Set restart policies  
✅ Keep docker-compose.yml in version control  
✅ Don't commit sensitive data  

## Next Steps

- Add a database service
- Implement a backend API
- Add SSL/TLS with Let's Encrypt
- Set up logging and monitoring
- Deploy to production

Check out the [multi-service example](multi-service.md) to learn more!
