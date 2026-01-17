# Docker Commands Cheat Sheet

## Image Commands

```bash
# Pull an image from Docker Hub
docker pull <image>:<tag>

# Build an image from Dockerfile
docker build -t <name>:<tag> .
docker build -t myapp:1.0 -f Dockerfile.prod .

# List all images
docker images
docker image ls

# Remove an image
docker rmi <image>
docker image rm <image>

# Remove unused images
docker image prune

# Tag an image
docker tag <source-image> <target-image>

# Push image to registry
docker push <image>:<tag>

# Save image to tar file
docker save -o myimage.tar myimage:latest

# Load image from tar file
docker load -i myimage.tar

# View image history
docker history <image>

# Inspect image details
docker inspect <image>
```

## Container Commands

```bash
# Run a container
docker run <image>
docker run -d <image>                    # Detached mode
docker run -it <image> /bin/bash         # Interactive mode
docker run -p 8080:80 <image>            # Port mapping
docker run --name mycontainer <image>    # Named container
docker run -v /host:/container <image>   # Volume mount
docker run --rm <image>                  # Auto-remove after exit

# List containers
docker ps                # Running containers
docker ps -a             # All containers
docker ps -q             # Container IDs only

# Start/Stop containers
docker start <container>
docker stop <container>
docker restart <container>
docker pause <container>
docker unpause <container>

# Remove containers
docker rm <container>
docker rm -f <container>              # Force remove
docker container prune                # Remove all stopped

# View logs
docker logs <container>
docker logs -f <container>            # Follow logs
docker logs --tail 100 <container>    # Last 100 lines

# Execute commands in container
docker exec <container> <command>
docker exec -it <container> /bin/bash
docker exec -it <container> sh

# Copy files
docker cp <container>:/path /host/path
docker cp /host/path <container>:/path

# View container processes
docker top <container>

# View container stats
docker stats
docker stats <container>

# Inspect container
docker inspect <container>

# View container changes
docker diff <container>

# Attach to running container
docker attach <container>
```

## Volume Commands

```bash
# Create a volume
docker volume create <volume-name>

# List volumes
docker volume ls

# Inspect volume
docker volume inspect <volume-name>

# Remove volume
docker volume rm <volume-name>

# Remove unused volumes
docker volume prune

# Use volume in container
docker run -v myvolume:/data <image>
docker run --mount source=myvolume,target=/data <image>
```

## Network Commands

```bash
# Create a network
docker network create <network-name>
docker network create --driver bridge mynetwork

# List networks
docker network ls

# Inspect network
docker network inspect <network-name>

# Connect container to network
docker network connect <network> <container>

# Disconnect container from network
docker network disconnect <network> <container>

# Remove network
docker network rm <network-name>

# Remove unused networks
docker network prune

# Run container on specific network
docker run --network <network-name> <image>
```

## Docker Compose Commands

```bash
# Start services
docker-compose up
docker-compose up -d              # Detached mode
docker-compose up --build         # Rebuild images

# Stop services
docker-compose down
docker-compose down -v            # Remove volumes
docker-compose down --rmi all     # Remove images

# View service logs
docker-compose logs
docker-compose logs -f            # Follow logs
docker-compose logs <service>     # Specific service

# List services
docker-compose ps

# Execute command in service
docker-compose exec <service> <command>
docker-compose exec web bash

# Build services
docker-compose build
docker-compose build --no-cache

# Start/stop services
docker-compose start
docker-compose stop
docker-compose restart

# Scale services
docker-compose up -d --scale web=3

# View configuration
docker-compose config

# Pull service images
docker-compose pull
```

## System Commands

```bash
# Show disk usage
docker system df

# Remove unused data
docker system prune
docker system prune -a            # Remove all unused images
docker system prune --volumes     # Include volumes

# Display system information
docker info

# Show Docker version
docker version

# Show running Docker processes
docker ps

# Show Docker events
docker events
docker events --since '2024-01-01'
```

## Registry Commands

```bash
# Login to registry
docker login
docker login <registry-url>

# Logout from registry
docker logout

# Search for images
docker search <term>
docker search nginx
```

## Debugging Commands

```bash
# View container logs
docker logs <container>

# Follow logs in real-time
docker logs -f <container>

# Inspect container/image
docker inspect <container/image>

# View running processes
docker top <container>

# View resource usage
docker stats

# View port mappings
docker port <container>

# View container changes
docker diff <container>

# Export container filesystem
docker export <container> > container.tar

# View Docker events
docker events
```

## Common Flags

```bash
-d, --detach          # Run in background
-it                   # Interactive with TTY
-p, --publish         # Publish ports (host:container)
-v, --volume          # Mount volume (host:container)
--name                # Assign container name
--rm                  # Remove container after exit
-e, --env             # Set environment variables
--network             # Connect to network
--restart             # Restart policy (no, on-failure, always, unless-stopped)
-w, --workdir         # Working directory inside container
--link                # Link to another container (legacy)
--memory              # Memory limit
--cpus                # CPU limit
```

## Quick Examples

```bash
# Run nginx web server
docker run -d -p 80:80 --name web nginx

# Run MySQL database
docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=secret mysql:8

# Run temporary Ubuntu container
docker run --rm -it ubuntu:22.04 bash

# Build and run custom app
docker build -t myapp .
docker run -d -p 3000:3000 myapp

# Run with environment variables
docker run -e DB_HOST=localhost -e DB_PORT=5432 myapp

# Run with volume mount
docker run -v $(pwd):/app -w /app node:18 npm install

# View logs of last 100 lines
docker logs --tail 100 -f mycontainer

# Clean up everything
docker system prune -a --volumes
```
