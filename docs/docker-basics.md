# Docker Basics

## What is Docker?

Docker is a platform for developing, shipping, and running applications in containers. Containers package an application with all its dependencies, ensuring it runs consistently across different environments.

## Core Concepts

### 1. Images
- Read-only templates used to create containers
- Built from Dockerfile instructions
- Stored in registries (Docker Hub, private registries)

```bash
# Pull an image
docker pull nginx:latest

# List images
docker images

# Remove an image
docker rmi nginx:latest
```

### 2. Containers
- Runnable instances of images
- Isolated from the host system
- Lightweight and portable

```bash
# Run a container
docker run -d -p 80:80 --name webserver nginx

# List running containers
docker ps

# List all containers
docker ps -a

# Stop a container
docker stop webserver

# Remove a container
docker rm webserver
```

### 3. Volumes
- Persistent data storage
- Shared between host and container
- Survive container deletion

```bash
# Create a volume
docker volume create mydata

# List volumes
docker volume ls

# Use a volume
docker run -v mydata:/data nginx
```

### 4. Networks
- Enable container communication
- Multiple network drivers available
- Isolation and security

```bash
# Create a network
docker network create mynetwork

# List networks
docker network ls

# Connect container to network
docker run --network mynetwork nginx
```

## Installation

### Linux
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

### macOS
Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop)

### Windows
Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop)

## Essential Commands

### Image Management
```bash
docker pull <image>          # Download an image
docker build -t <name> .     # Build image from Dockerfile
docker images                # List images
docker rmi <image>           # Remove an image
docker tag <image> <tag>     # Tag an image
```

### Container Management
```bash
docker run <image>           # Create and start container
docker start <container>     # Start stopped container
docker stop <container>      # Stop running container
docker restart <container>   # Restart container
docker rm <container>        # Remove container
docker logs <container>      # View container logs
docker exec -it <container> /bin/bash  # Execute command in container
```

### System Management
```bash
docker system df            # Show disk usage
docker system prune         # Remove unused data
docker info                 # Display system information
docker version              # Show Docker version
```

## Dockerfile Basics

A Dockerfile is a text file containing instructions to build a Docker image.

```dockerfile
# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "start"]
```

## Docker Compose Basics

Docker Compose is a tool for defining and running multi-container applications.

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app
    environment:
      - NODE_ENV=development
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=secret
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Next Steps

- Explore [Dockerfile examples](../examples/dockerfiles/)
- Try [Docker Compose examples](../examples/docker-compose/)
- Learn [best practices](best-practices.md)
- Check the [commands cheat sheet](cheat-sheet.md)
