# Docker Knowledge Refresh 🐳

A comprehensive repository to refresh and enhance Docker knowledge with practical examples, best practices, and detailed documentation.

## 📚 What's Inside

This repository contains:
- **Working Examples**: Node.js application with Docker and Docker Compose
- **Command Reference**: Complete guide to Docker commands
- **Best Practices**: Industry-standard Docker practices
- **Multi-Container Setup**: Redis, Nginx, and application orchestration
- **Real-World Scenarios**: Development and production configurations

## 🚀 Quick Start

### Prerequisites
- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
- Docker Compose installed (included with Docker Desktop)

### Run the Sample Application

1. **Clone the repository**
```bash
git clone https://github.com/Paula-Refaat/docker-refresh.git
cd docker-refresh
```

2. **Build and run with Docker**
```bash
docker build -t docker-refresh-app .
docker run -p 3000:3000 docker-refresh-app
```

3. **Or use Docker Compose**
```bash
docker-compose up -d
```

4. **Access the application**
```bash
curl http://localhost:3000
# or visit http://localhost:3000 in your browser
```

5. **Check health status**
```bash
curl http://localhost:3000/health
```

## 📖 Documentation

### [Docker Commands Reference](DOCKER_COMMANDS.md)
Comprehensive guide covering:
- Image management (build, pull, push, remove)
- Container operations (run, stop, logs, exec)
- Volume management
- Network configuration
- Docker Compose commands
- System maintenance

### [Best Practices](BEST_PRACTICES.md)
Learn Docker best practices:
- Dockerfile optimization
- Multi-stage builds
- Security considerations
- Image size reduction
- Development vs Production setups
- Common pitfalls to avoid

### [Examples](EXAMPLES.md)
Practical examples including:
- Python Flask applications
- Database containers (PostgreSQL, MySQL)
- Multi-container applications
- Environment variables
- Volume mounting
- Networking
- Build arguments

## 🏗️ Project Structure

```
docker-refresh/
├── app.js                  # Sample Node.js Express application
├── package.json            # Node.js dependencies
├── Dockerfile             # Multi-stage production Dockerfile
├── docker-compose.yml     # Multi-container orchestration
├── nginx.conf             # Nginx reverse proxy configuration
├── .dockerignore          # Files to exclude from Docker builds
├── .env.example           # Example environment variables
├── DOCKER_COMMANDS.md     # Complete Docker commands reference
├── BEST_PRACTICES.md      # Docker best practices guide
├── EXAMPLES.md            # Additional Docker examples
└── README.md              # This file
```

## 🎯 Key Features

### 1. Multi-Stage Dockerfile
Optimized production build with:
- Separate build and production stages
- Minimal final image size (~50MB)
- Non-root user for security
- Health checks included

### 2. Docker Compose Setup
Complete multi-container environment:
- **App**: Node.js Express application
- **Redis**: Caching layer
- **Nginx**: Reverse proxy
- Custom networks and volumes

### 3. Security Best Practices
- Non-root user execution
- Health checks
- Minimal base images (Alpine)
- .dockerignore optimization

## 🔧 Common Operations

### Build the image
```bash
docker build -t docker-refresh-app:latest .
```

### Run in development mode
```bash
docker run -p 3000:3000 -e NODE_ENV=development docker-refresh-app
```

### View logs
```bash
docker logs -f docker-refresh-app
```

### Stop all containers
```bash
docker-compose down
```

### Clean up
```bash
docker system prune -a
docker volume prune
```

## 🐛 Debugging

### Access container shell
```bash
docker exec -it docker-refresh-app sh
```

### View container stats
```bash
docker stats docker-refresh-app
```

### Inspect container
```bash
docker inspect docker-refresh-app
```

## 📊 Health Checks

The application includes built-in health checks:
- Endpoint: `/health`
- Interval: 30 seconds
- Timeout: 3 seconds
- Retries: 3

Check health status:
```bash
docker inspect --format='{{.State.Health.Status}}' docker-refresh-app
```

## 🌐 Networking

Containers communicate via the `app-network` bridge network:
```bash
# List networks
docker network ls

# Inspect network
docker network inspect app-network
```

## 💾 Volumes

Persistent data storage:
```bash
# List volumes
docker volume ls

# Inspect Redis data volume
docker volume inspect docker-refresh_redis-data
```

## 🔄 Continuous Learning

### Next Steps
1. Modify the application code and rebuild
2. Try adding new services to docker-compose.yml
3. Experiment with different base images
4. Practice multi-stage builds
5. Implement custom health checks
6. Set up development environment with volume mounts

### Additional Resources
- [Docker Official Documentation](https://docs.docker.com/)
- [Docker Hub](https://hub.docker.com/)
- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## 📝 Notes

- All examples use Alpine-based images for minimal size
- Production configurations use non-root users
- Health checks are implemented throughout
- Environment variables are used for configuration
- Volumes ensure data persistence

## 🤝 Contributing

Feel free to add more examples, improve documentation, or suggest best practices!

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🎓 Learning Objectives Covered

- ✅ Building Docker images
- ✅ Running containers
- ✅ Multi-stage builds
- ✅ Docker Compose orchestration
- ✅ Networking between containers
- ✅ Volume management
- ✅ Environment configuration
- ✅ Health checks
- ✅ Security best practices
- ✅ Image optimization
- ✅ Development workflows
- ✅ Production deployments

---

**Happy Dockerizing! 🐳**
