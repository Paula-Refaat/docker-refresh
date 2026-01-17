# Docker Exercises and Challenges

Hands-on exercises to practice and reinforce Docker concepts.

## 📚 Table of Contents

1. [Beginner Exercises](#beginner-exercises)
2. [Intermediate Exercises](#intermediate-exercises)
3. [Advanced Exercises](#advanced-exercises)
4. [Challenge Projects](#challenge-projects)

---

## Beginner Exercises

### Exercise 1: Running Your First Container

**Objective**: Get comfortable with basic Docker commands.

**Tasks**:
1. Pull the official nginx image
2. Run an nginx container in detached mode
3. Access it in your browser
4. View container logs
5. Stop and remove the container

**Commands to use**: `docker pull`, `docker run`, `docker ps`, `docker logs`, `docker stop`, `docker rm`

<details>
<summary>Solution</summary>

```bash
# Pull nginx image
docker pull nginx

# Run container
docker run -d -p 8080:80 --name my-nginx nginx

# Access in browser: http://localhost:8080

# View logs
docker logs my-nginx

# Stop container
docker stop my-nginx

# Remove container
docker rm my-nginx
```
</details>

---

### Exercise 2: Create a Simple Dockerfile

**Objective**: Build your first Docker image.

**Tasks**:
1. Create a directory for your project
2. Create a simple HTML file (index.html)
3. Write a Dockerfile to serve it with nginx
4. Build the image
5. Run a container from your image

<details>
<summary>Solution</summary>

```bash
# Create project directory
mkdir my-website && cd my-website

# Create HTML file
cat > index.html << 'EOF'
<!DOCTYPE html>
<html>
<head><title>My First Docker Site</title></head>
<body><h1>Hello from Docker!</h1></body>
</html>
EOF

# Create Dockerfile
cat > Dockerfile << 'EOF'
FROM nginx:alpine
COPY index.html /usr/share/nginx/html/
EXPOSE 80
EOF

# Build image
docker build -t my-website .

# Run container
docker run -d -p 8080:80 --name website my-website

# Test
curl http://localhost:8080
```
</details>

---

### Exercise 3: Working with Volumes

**Objective**: Understand data persistence with volumes.

**Tasks**:
1. Create a named volume
2. Run a container that writes data to the volume
3. Stop and remove the container
4. Run a new container with the same volume
5. Verify the data persists

<details>
<summary>Solution</summary>

```bash
# Create volume
docker volume create my-data

# Run container and write data
docker run -it --rm -v my-data:/data alpine sh -c "echo 'Hello Docker' > /data/message.txt"

# Run new container and read data
docker run -it --rm -v my-data:/data alpine cat /data/message.txt

# Output should be: Hello Docker

# Cleanup
docker volume rm my-data
```
</details>

---

## Intermediate Exercises

### Exercise 4: Multi-Container Application

**Objective**: Use Docker Compose to run multiple services.

**Tasks**:
1. Create a docker-compose.yml with:
   - A web service (nginx)
   - A database service (postgres)
2. Configure them to communicate
3. Add persistent storage for the database
4. Add health checks

<details>
<summary>Solution</summary>

```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
    depends_on:
      - db
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 3s
      retries: 3

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: myapp
    volumes:
      - db-data:/var/lib/postgresql/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  db-data:

networks:
  app-network:
```

```bash
# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs

# Stop services
docker-compose down
```
</details>

---

### Exercise 5: Build a Node.js API

**Objective**: Containerize a real application.

**Tasks**:
1. Create a simple Express.js API
2. Write a Dockerfile with best practices
3. Use multi-stage build
4. Add health check endpoint
5. Run as non-root user

<details>
<summary>Solution</summary>

```javascript
// server.js
const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Docker!' });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

```json
// package.json
{
  "name": "docker-api",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.2"
  },
  "scripts": {
    "start": "node server.js"
  }
}
```

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

FROM node:18-alpine
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder --chown=nodejs:nodejs /app/server.js ./
USER nodejs
EXPOSE 3000
HEALTHCHECK --interval=30s CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t my-api .
docker run -d -p 3000:3000 --name api my-api

# Test
curl http://localhost:3000/api/hello
curl http://localhost:3000/health
```
</details>

---

### Exercise 6: Docker Networking

**Objective**: Understand container networking.

**Tasks**:
1. Create a custom bridge network
2. Run two containers on this network
3. Test communication between containers
4. Create an isolated backend network
5. Connect containers to multiple networks

<details>
<summary>Solution</summary>

```bash
# Create networks
docker network create frontend
docker network create backend

# Run database (backend only)
docker run -d --name db --network backend postgres:15-alpine -e POSTGRES_PASSWORD=secret

# Run API (both networks) - using a long-running process for testing
docker run -d --name api --network backend node:18-alpine sh -c "while true; do sleep 30; done"
docker network connect frontend api

# Run web (frontend only)
docker run -d --name web --network frontend nginx:alpine

# Test connectivity
docker exec web ping api     # Should work
docker exec web ping db      # Should NOT work (isolated)
docker exec api ping db      # Should work

# Cleanup
docker stop web api db
docker rm web api db
docker network rm frontend backend
```
</details>

---

## Advanced Exercises

### Exercise 7: Optimize Image Size

**Objective**: Create the smallest possible production image.

**Tasks**:
1. Start with a Python Flask app
2. Optimize the Dockerfile to reduce image size
3. Compare sizes of different approaches
4. Achieve image size under 100MB

<details>
<summary>Solution</summary>

```python
# app.py
from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello():
    return 'Hello from optimized Docker!'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

```dockerfile
# Dockerfile - Optimized
FROM python:3.11-alpine AS builder
WORKDIR /app
RUN pip install --user flask gunicorn

FROM python:3.11-alpine
RUN adduser -D appuser
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY app.py .
USER appuser
ENV PATH=/root/.local/bin:$PATH
CMD ["gunicorn", "-b", "0.0.0.0:5000", "app:app"]
```

```bash
# Build and compare
docker build -t flask-optimized .
docker images flask-optimized

# Should be under 100MB!
```
</details>

---

### Exercise 8: Implement Health Checks

**Objective**: Add robust health checks to all services.

**Tasks**:
1. Create a multi-service application
2. Implement health check endpoints
3. Configure Docker health checks
4. Test automatic recovery
5. Monitor health status

<details>
<summary>Solution</summary>

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: secret
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
```

```bash
# Start services
docker-compose up -d

# Check health status
docker inspect --format='{{.State.Health.Status}}' <container_name>

# Watch health status
watch 'docker-compose ps'
```
</details>

---

### Exercise 9: Implement CI/CD Pipeline

**Objective**: Automate Docker image building and testing.

**Tasks**:
1. Create a GitHub Actions workflow
2. Build Docker image on push
3. Run tests in containers
4. Push to Docker Hub
5. Deploy to staging

<details>
<summary>Solution</summary>

```yaml
# .github/workflows/docker.yml
name: Docker CI/CD

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build image
        run: docker build -t myapp:${{ github.sha }} .
      
      - name: Run tests
        run: docker run myapp:${{ github.sha }} npm test
      
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Push to Docker Hub
        run: |
          docker tag myapp:${{ github.sha }} myuser/myapp:latest
          docker push myuser/myapp:latest
```
</details>

---

## Challenge Projects

### Challenge 1: Microservices Architecture

**Objective**: Build a complete microservices application.

**Requirements**:
- 3+ microservices (user service, product service, order service)
- API Gateway
- Service discovery
- Centralized logging
- Health monitoring
- Load balancing

**Bonus**: Use Docker Swarm or Kubernetes

---

### Challenge 2: Development Environment

**Objective**: Create a complete development environment.

**Requirements**:
- Multiple language runtimes (Node.js, Python, Go)
- Databases (PostgreSQL, MongoDB, Redis)
- Development tools (hot reload, debugger)
- Testing environment
- CI/CD integration

---

### Challenge 3: Monitoring Stack

**Objective**: Implement comprehensive monitoring.

**Requirements**:
- Prometheus for metrics
- Grafana for visualization
- ELK stack for logs
- AlertManager for alerts
- All services dockerized
- Custom dashboards

---

### Challenge 4: Secure Production Deployment

**Objective**: Deploy with security best practices.

**Requirements**:
- Non-root users
- Read-only filesystems
- Secrets management
- Network segmentation
- Resource limits
- Security scanning
- HTTPS/TLS
- Regular security updates

---

## Evaluation Checklist

For each exercise, verify:

- [ ] Container runs successfully
- [ ] Proper error handling
- [ ] Health checks implemented
- [ ] Logs are accessible
- [ ] Data persists correctly
- [ ] Networking works as expected
- [ ] Security best practices followed
- [ ] Image size optimized
- [ ] Documentation complete
- [ ] Clean up resources after testing

## Additional Resources

- Docker Documentation: https://docs.docker.com
- Docker Hub: https://hub.docker.com
- Play with Docker: https://labs.play-with-docker.com
- Docker Samples: https://github.com/dockersamples

## Tips for Success

1. Always read error messages carefully
2. Use `docker logs` to debug issues
3. Test incrementally
4. Keep images small and focused
5. Document your solutions
6. Clean up resources regularly
7. Practice regularly
8. Join Docker community forums

Happy Learning! 🐳
