# Docker Refresh 🐳

A comprehensive repository to refresh and strengthen Docker knowledge through practical examples, guides, and hands-on exercises.

## 📚 Contents

### 1. [Docker Basics](docs/docker-basics.md)
- Installation and setup
- Core concepts (Images, Containers, Volumes, Networks)
- Essential Docker commands

### 2. [Dockerfile Examples](examples/dockerfiles/)
- Simple Dockerfile
- Multi-stage builds
- Best practices and optimization

### 3. [Docker Compose Examples](examples/docker-compose/)
- Single service setup
- Multi-service applications
- Networks and volumes configuration

### 4. [Practical Applications](examples/)
- [Node.js Application](examples/nodejs-app/)
- [Python Application](examples/python-app/)
- Database containers

### 5. [Docker Networking](examples/networking/)
- Bridge networks
- Host networks
- Custom networks

### 6. [Data Persistence](examples/volumes/)
- Named volumes
- Bind mounts
- Volume management

### 7. [Commands Cheat Sheet](docs/cheat-sheet.md)
Quick reference for commonly used Docker commands

### 8. [Best Practices & Security](docs/best-practices.md)
- Security considerations
- Performance optimization
- Production readiness

## 🚀 Quick Start

```bash
# Clone this repository
git clone https://github.com/Paula-Refaat/docker-refresh.git
cd docker-refresh

# Explore examples
cd examples/nodejs-app
docker build -t my-node-app .
docker run -p 3000:3000 my-node-app
```

## 📖 Learning Path

1. **Beginners**: Start with [Docker Basics](docs/docker-basics.md) and simple [Dockerfile examples](examples/dockerfiles/)
2. **Intermediate**: Explore [Docker Compose](examples/docker-compose/) and [networking examples](examples/networking/)
3. **Advanced**: Study [multi-stage builds](examples/dockerfiles/multi-stage/), [best practices](docs/best-practices.md), and security

## 🛠️ Prerequisites

- Docker installed on your system
- Basic command line knowledge
- Text editor of your choice

## 📝 Contributing

Feel free to add more examples or improve existing documentation!

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
