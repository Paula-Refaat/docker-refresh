# Docker Commands Reference

## Image Commands

### Build an image
```bash
docker build -t image-name:tag .
docker build -t docker-refresh-app:latest .
```

### List images
```bash
docker images
docker image ls
```

### Remove an image
```bash
docker rmi image-name:tag
docker image rm image-name:tag
```

### Pull an image from registry
```bash
docker pull nginx:alpine
docker pull node:18-alpine
```

### Push an image to registry
```bash
docker tag local-image:tag registry/image:tag
docker push registry/image:tag
```

### Inspect an image
```bash
docker inspect image-name:tag
docker history image-name:tag
```

## Container Commands

### Run a container
```bash
# Basic run
docker run image-name

# Run with name
docker run --name my-container image-name

# Run in detached mode
docker run -d image-name

# Run with port mapping
docker run -p 3000:3000 image-name

# Run with environment variables
docker run -e NODE_ENV=production image-name

# Run with volume
docker run -v /host/path:/container/path image-name

# Run with network
docker run --network my-network image-name

# Complete example
docker run -d --name my-app -p 3000:3000 -e NODE_ENV=production docker-refresh-app:latest
```

### List containers
```bash
# Running containers
docker ps

# All containers (including stopped)
docker ps -a

# Latest created container
docker ps -l
```

### Stop/Start/Restart containers
```bash
docker stop container-name
docker start container-name
docker restart container-name
```

### Remove containers
```bash
docker rm container-name
docker rm -f container-name  # Force remove running container
docker container prune  # Remove all stopped containers
```

### View container logs
```bash
docker logs container-name
docker logs -f container-name  # Follow logs
docker logs --tail 100 container-name  # Last 100 lines
```

### Execute commands in container
```bash
docker exec container-name command
docker exec -it container-name /bin/sh  # Interactive shell
docker exec -it container-name /bin/bash
```

### Inspect container
```bash
docker inspect container-name
docker stats container-name  # Live resource usage
docker top container-name  # Running processes
```

## Volume Commands

### Create a volume
```bash
docker volume create volume-name
```

### List volumes
```bash
docker volume ls
```

### Inspect a volume
```bash
docker volume inspect volume-name
```

### Remove volumes
```bash
docker volume rm volume-name
docker volume prune  # Remove unused volumes
```

## Network Commands

### Create a network
```bash
docker network create network-name
docker network create --driver bridge my-network
```

### List networks
```bash
docker network ls
```

### Inspect a network
```bash
docker network inspect network-name
```

### Connect/Disconnect container to network
```bash
docker network connect network-name container-name
docker network disconnect network-name container-name
```

### Remove network
```bash
docker network rm network-name
docker network prune  # Remove unused networks
```

## Docker Compose Commands

### Start services
```bash
docker-compose up
docker-compose up -d  # Detached mode
docker-compose up --build  # Rebuild images
```

### Stop services
```bash
docker-compose stop
docker-compose down  # Stop and remove containers
docker-compose down -v  # Also remove volumes
```

### View logs
```bash
docker-compose logs
docker-compose logs -f service-name
```

### List services
```bash
docker-compose ps
```

### Execute commands
```bash
docker-compose exec service-name command
```

### Build services
```bash
docker-compose build
docker-compose build --no-cache
```

## System Commands

### Clean up
```bash
docker system prune  # Remove unused data
docker system prune -a  # Remove all unused images
docker system prune -a --volumes  # Include volumes
```

### View disk usage
```bash
docker system df
```

### View system info
```bash
docker info
docker version
```

## Useful Tips

### Multi-stage builds
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
CMD ["npm", "start"]
```

### .dockerignore usage
Create a `.dockerignore` file to exclude files from build context:
```
node_modules
.git
*.md
.env
```

### Health checks
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000/health || exit 1
```
