# Docker Networking Examples

Understanding Docker networking and container communication.

## Network Types

### 1. Bridge Network (Default)

Containers on the same bridge network can communicate with each other.

```bash
# Create a bridge network
docker network create my-bridge-network

# Run containers on the network
docker run -d --name web --network my-bridge-network nginx
docker run -d --name api --network my-bridge-network node:18-alpine

# Containers can communicate using container names
docker exec web ping api
```

### 2. Host Network

Container shares the host's network stack.

```bash
# Run with host network
docker run -d --network host nginx

# No port mapping needed - uses host ports directly
# Access at http://localhost:80
```

### 3. None Network

Container has no network access.

```bash
docker run -d --network none alpine sleep 3600
```

## Practical Examples

### Example 1: Web App with Database

```bash
# Create network
docker network create app-network

# Run database
docker run -d \
  --name postgres \
  --network app-network \
  -e POSTGRES_PASSWORD=secret \
  postgres:15-alpine

# Run web app (can connect to database using hostname 'postgres')
docker run -d \
  --name webapp \
  --network app-network \
  -p 3000:3000 \
  -e DATABASE_URL=postgresql://postgres:secret@postgres:5432/mydb \
  myapp:latest

# Test connection
docker exec webapp ping postgres
```

### Example 2: Multiple Networks

Containers can connect to multiple networks.

```bash
# Create networks
docker network create frontend
docker network create backend

# Database on backend only
docker run -d \
  --name db \
  --network backend \
  postgres:15-alpine

# API on both networks
docker run -d \
  --name api \
  --network backend \
  myapi:latest

docker network connect frontend api

# Web on frontend only
docker run -d \
  --name web \
  --network frontend \
  -p 80:80 \
  nginx
```

### Example 3: Custom DNS

```bash
# Create network with custom DNS
docker network create \
  --dns 8.8.8.8 \
  --dns 8.8.4.4 \
  my-network

docker run -d --network my-network nginx
```

## Docker Compose Networking

### Example 1: Default Network

```yaml
version: '3.8'

services:
  web:
    image: nginx
    ports:
      - "80:80"
  
  api:
    image: node:18-alpine
    # Can access web using 'web' hostname
```

### Example 2: Custom Networks

```yaml
version: '3.8'

services:
  web:
    image: nginx
    networks:
      - frontend
  
  api:
    image: node:18-alpine
    networks:
      - frontend
      - backend
  
  db:
    image: postgres:15-alpine
    networks:
      - backend

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true  # No external access
```

### Example 3: Network Aliases

```yaml
version: '3.8'

services:
  web:
    image: nginx
    networks:
      app-network:
        aliases:
          - webserver
          - www
  
  api:
    image: node:18-alpine
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

## Network Commands

```bash
# List networks
docker network ls

# Inspect network
docker network inspect my-network

# Create network
docker network create my-network

# Remove network
docker network rm my-network

# Connect container to network
docker network connect my-network my-container

# Disconnect container from network
docker network disconnect my-network my-container

# Cleanup unused networks
docker network prune
```

## Advanced Configuration

### Custom Subnet and Gateway

```bash
docker network create \
  --subnet=172.20.0.0/16 \
  --gateway=172.20.0.1 \
  custom-network

# Run with specific IP
docker run -d \
  --network custom-network \
  --ip 172.20.0.10 \
  nginx
```

### Network Encryption (Overlay)

For Docker Swarm:

```bash
docker network create \
  --driver overlay \
  --opt encrypted \
  secure-network
```

## Testing Connectivity

### Test container-to-container communication

```bash
# Start two containers on same network
docker run -d --name server --network my-net nginx
docker run -it --name client --network my-net alpine sh

# Inside client container
ping server
wget -O- http://server:80
```

### Inspect container networking

```bash
# View container's networks
docker inspect my-container --format='{{json .NetworkSettings.Networks}}'

# View container's IP address
docker inspect my-container --format='{{.NetworkSettings.IPAddress}}'
```

## Port Mapping

```bash
# Map single port
docker run -p 8080:80 nginx

# Map to specific host IP
docker run -p 127.0.0.1:8080:80 nginx

# Map random host port
docker run -p 80 nginx

# Map multiple ports
docker run -p 80:80 -p 443:443 nginx

# View port mappings
docker port my-container
```

## Common Scenarios

### Load Balancing with Multiple Instances

```yaml
version: '3.8'

services:
  web:
    image: nginx
    deploy:
      replicas: 3
    networks:
      - app-network
  
  loadbalancer:
    image: nginx:alpine
    ports:
      - "80:80"
    networks:
      - app-network
    depends_on:
      - web

networks:
  app-network:
```

### Service Discovery

```yaml
version: '3.8'

services:
  service-a:
    image: myapp:latest
    networks:
      - shared
    environment:
      - SERVICE_B_URL=http://service-b:3000
  
  service-b:
    image: myapp:latest
    networks:
      - shared

networks:
  shared:
```

## Troubleshooting

### Container can't connect to another

```bash
# Check if on same network
docker network inspect my-network

# Check container logs
docker logs my-container

# Test DNS resolution
docker exec my-container nslookup other-container
docker exec my-container ping other-container
```

### Port conflicts

```bash
# Check what's using the port
sudo netstat -tulpn | grep :8080

# Use different port
docker run -p 8081:80 nginx
```

### Network isolation not working

```bash
# Verify network driver
docker network inspect my-network

# Check firewall rules
sudo iptables -L
```

## Best Practices

✅ Use custom bridge networks instead of default bridge  
✅ Give networks descriptive names  
✅ Use network aliases for service discovery  
✅ Implement network segmentation for security  
✅ Use internal networks for databases  
✅ Document network architecture  
✅ Test network connectivity during development  
✅ Use health checks to verify network services  
✅ Monitor network performance  
✅ Clean up unused networks regularly  

## Security Considerations

⚠️ Limit exposed ports to only what's necessary  
⚠️ Use internal networks for backend services  
⚠️ Implement network policies in production  
⚠️ Monitor network traffic for anomalies  
⚠️ Use encryption for sensitive data in transit  
⚠️ Keep network configuration simple and documented  
