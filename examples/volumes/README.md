# Docker Volumes and Data Persistence

Understanding Docker volumes and data management.

## Volume Types

### 1. Named Volumes (Recommended)

Managed by Docker, stored in Docker's storage directory.

```bash
# Create a named volume
docker volume create my-data

# Use in container
docker run -d \
  --name myapp \
  -v my-data:/app/data \
  myapp:latest

# List volumes
docker volume ls

# Inspect volume
docker volume inspect my-data

# Remove volume
docker volume rm my-data
```

### 2. Bind Mounts

Mount a specific directory from the host.

```bash
# Mount current directory
docker run -d \
  -v $(pwd):/app \
  -w /app \
  node:18-alpine \
  npm start

# Mount with read-only
docker run -d \
  -v $(pwd):/app:ro \
  nginx

# Mount specific file
docker run -d \
  -v $(pwd)/config.json:/app/config.json \
  myapp:latest
```

### 3. tmpfs Mounts (Linux only)

Stored in host memory, not persisted.

```bash
docker run -d \
  --tmpfs /tmp \
  myapp:latest

# With size limit
docker run -d \
  --tmpfs /tmp:rw,size=100m \
  myapp:latest
```

## Practical Examples

### Example 1: Database with Persistent Data

```bash
# Create volume for PostgreSQL
docker volume create postgres-data

# Run PostgreSQL with volume
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=secret \
  -v postgres-data:/var/lib/postgresql/data \
  postgres:15-alpine

# Data persists even after container removal
docker stop postgres
docker rm postgres

# Data still available for new container
docker run -d \
  --name postgres-new \
  -e POSTGRES_PASSWORD=secret \
  -v postgres-data:/var/lib/postgresql/data \
  postgres:15-alpine
```

### Example 2: Development with Hot Reload

```bash
# Mount source code for hot reload
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/src:/app/src \
  -v $(pwd)/public:/app/public \
  -v /app/node_modules \
  --name dev-server \
  myapp:dev
```

### Example 3: Shared Data Between Containers

```bash
# Create shared volume
docker volume create shared-data

# Container 1 writes data
docker run -d \
  --name writer \
  -v shared-data:/data \
  alpine \
  sh -c "while true; do echo $(date) >> /data/log.txt; sleep 5; done"

# Container 2 reads data
docker run -it \
  --name reader \
  -v shared-data:/data \
  alpine \
  tail -f /data/log.txt
```

## Docker Compose with Volumes

### Example 1: Named Volumes

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=secret
  
  web:
    build: .
    volumes:
      - uploads:/app/uploads
    ports:
      - "3000:3000"

volumes:
  postgres_data:
  uploads:
```

### Example 2: Bind Mounts

```yaml
version: '3.8'

services:
  web:
    build: .
    volumes:
      # Bind mount for development
      - ./src:/app/src
      - ./public:/app/public
      # Named volume for node_modules
      - node_modules:/app/node_modules
    ports:
      - "3000:3000"

volumes:
  node_modules:
```

### Example 3: Multiple Volume Types

```yaml
version: '3.8'

services:
  app:
    image: myapp:latest
    volumes:
      # Named volume for data persistence
      - app_data:/data
      
      # Bind mount for configuration
      - ./config:/config:ro
      
      # Bind mount for logs
      - ./logs:/var/log/app
      
      # tmpfs for temporary files
      - type: tmpfs
        target: /tmp
        tmpfs:
          size: 100000000  # 100MB

volumes:
  app_data:
```

## Volume Management Commands

```bash
# List volumes
docker volume ls

# Create volume
docker volume create my-volume

# Inspect volume
docker volume inspect my-volume

# Remove volume
docker volume rm my-volume

# Remove unused volumes
docker volume prune

# Remove all volumes
docker volume prune -a
```

## Volume Backup and Restore

### Backup Volume

```bash
# Backup to tar file
docker run --rm \
  -v my-volume:/data \
  -v $(pwd):/backup \
  alpine \
  tar czf /backup/backup.tar.gz -C /data .

# Backup with timestamp
docker run --rm \
  -v postgres-data:/data \
  -v $(pwd):/backup \
  alpine \
  tar czf /backup/backup_$(date +%Y%m%d_%H%M%S).tar.gz -C /data .
```

### Restore Volume

```bash
# Restore from tar file
docker run --rm \
  -v my-volume:/data \
  -v $(pwd):/backup \
  alpine \
  tar xzf /backup/backup.tar.gz -C /data
```

### Copy Between Volumes

```bash
# Create target volume
docker volume create target-volume

# Copy data from source to target
docker run --rm \
  -v source-volume:/source \
  -v target-volume:/target \
  alpine \
  sh -c "cp -av /source/* /target/"
```

## Advanced Volume Configuration

### Volume with Driver Options

```bash
docker volume create \
  --driver local \
  --opt type=nfs \
  --opt o=addr=192.168.1.1,rw \
  --opt device=:/path/to/dir \
  nfs-volume
```

### Volume Labels

```bash
docker volume create \
  --label environment=production \
  --label backup=daily \
  prod-data
```

### Inspect Volume Location

```bash
# Find volume on host
docker volume inspect my-volume --format '{{.Mountpoint}}'

# List files in volume (Linux)
sudo ls -la $(docker volume inspect my-volume --format '{{.Mountpoint}}')
```

## Common Patterns

### Development Environment

```yaml
version: '3.8'

services:
  app:
    build: .
    volumes:
      # Source code for hot reload
      - ./src:/app/src:cached
      
      # Prevent overwriting node_modules
      - /app/node_modules
      
      # Configuration
      - ./config.dev.json:/app/config.json:ro
    environment:
      - NODE_ENV=development
```

### Production Environment

```yaml
version: '3.8'

services:
  app:
    image: myapp:1.0.0
    volumes:
      # Only persistent data
      - app_data:/data
      
      # Read-only configuration
      - ./config.prod.json:/app/config.json:ro
      
      # Logs directory
      - ./logs:/var/log/app
    environment:
      - NODE_ENV=production

volumes:
  app_data:
    driver: local
```

### Database Backup Strategy

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    environment:
      - POSTGRES_PASSWORD=secret
  
  backup:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data:ro
      - ./backups:/backups
    command: >
      sh -c "while true; do
        pg_dump -U postgres -h db mydb > /backups/backup_$$(date +%Y%m%d_%H%M%S).sql;
        sleep 86400;
      done"
    depends_on:
      - db

volumes:
  postgres_data:
```

## Troubleshooting

### Volume Permission Issues

```bash
# Check volume permissions
docker run --rm -v my-volume:/data alpine ls -la /data

# Fix permissions
docker run --rm -v my-volume:/data alpine chown -R 1000:1000 /data
```

### Volume Not Empty

```bash
# Remove all data from volume
docker run --rm -v my-volume:/data alpine rm -rf /data/*

# Or remove and recreate volume
docker volume rm my-volume
docker volume create my-volume
```

### Find Containers Using Volume

```bash
docker ps -a --filter volume=my-volume
```

### Volume Space Issues

```bash
# Check volume size
docker system df -v

# Clean up unused volumes
docker volume prune
```

## Best Practices

✅ Use named volumes for data persistence  
✅ Use bind mounts for development only  
✅ Don't store sensitive data in volumes without encryption  
✅ Regular backups of important volumes  
✅ Document volume usage and purpose  
✅ Use .dockerignore to exclude unnecessary files  
✅ Set appropriate permissions on volumes  
✅ Use volume labels for organization  
✅ Monitor volume disk usage  
✅ Clean up unused volumes regularly  

## Performance Considerations

### Bind Mount Performance (macOS/Windows)

```yaml
# Use cached/delegated for better performance
services:
  web:
    volumes:
      - ./src:/app/src:cached      # Host -> Container
      - ./logs:/app/logs:delegated # Container -> Host
```

### Volume vs Bind Mount

- **Named Volumes**: Better performance, managed by Docker
- **Bind Mounts**: Direct access to host files, may be slower on macOS/Windows

## Security Considerations

⚠️ Bind mounts expose host filesystem to containers  
⚠️ Use read-only mounts when possible (`:ro`)  
⚠️ Don't expose sensitive host directories  
⚠️ Encrypt volumes with sensitive data  
⚠️ Regular security audits of volume contents  
⚠️ Implement backup and disaster recovery  
⚠️ Use appropriate file permissions  
⚠️ Monitor volume access patterns  

## Cleanup Script

```bash
#!/bin/bash
# cleanup-volumes.sh

echo "Removing stopped containers..."
docker container prune -f

echo "Removing unused volumes..."
docker volume prune -f

echo "Disk usage after cleanup:"
docker system df
```
