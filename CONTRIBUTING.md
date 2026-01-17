# Contributing to Docker Refresh

Thank you for your interest in contributing to this Docker learning repository! This guide will help you get started.

## 🎯 How to Contribute

There are many ways to contribute to this project:

1. **Add new examples** - Share your Docker configurations and use cases
2. **Improve documentation** - Fix typos, clarify explanations, add details
3. **Create exercises** - Design hands-on challenges for learners
4. **Share best practices** - Document tips and tricks you've learned
5. **Report issues** - Found something that doesn't work? Let us know!
6. **Answer questions** - Help others in discussions

## 📋 Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR-USERNAME/docker-refresh.git
cd docker-refresh
```

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

### 3. Make Your Changes

Follow the structure and style of existing content.

### 4. Test Your Changes

```bash
# If you added Dockerfiles or docker-compose files, test them:
docker build -t test .
docker run test

# Or for docker-compose:
docker-compose up -d
docker-compose down
```

### 5. Commit Your Changes

```bash
git add .
git commit -m "Add: brief description of your changes"
```

### 6. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## 📝 Content Guidelines

### Documentation

- Use clear, concise language
- Include code examples
- Add comments to explain complex concepts
- Use proper markdown formatting
- Include links to official documentation when relevant

### Example Files

- Test all examples before submitting
- Include README.md with usage instructions
- Use best practices (security, optimization)
- Add comments in Dockerfiles
- Include .dockerignore when appropriate

### Code Style

**Dockerfiles:**
```dockerfile
# Use official base images
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy dependency files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Run as non-root user
USER node

# Document exposed ports
EXPOSE 3000

# Define startup command
CMD ["node", "server.js"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - app-data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 3s
      retries: 3

volumes:
  app-data:
```

## 🏗️ Project Structure

```
docker-refresh/
├── README.md                   # Main documentation
├── CONTRIBUTING.md             # This file
├── docs/                       # Guides and references
│   ├── docker-basics.md
│   ├── cheat-sheet.md
│   └── best-practices.md
├── examples/                   # Practical examples
│   ├── dockerfiles/
│   ├── docker-compose/
│   ├── nodejs-app/
│   ├── python-app/
│   ├── networking/
│   └── volumes/
└── exercises/                  # Hands-on challenges
    └── README.md
```

## ✅ Contribution Checklist

Before submitting a pull request, ensure:

- [ ] Code/examples are tested and working
- [ ] Documentation is clear and complete
- [ ] Markdown is properly formatted
- [ ] No sensitive information (passwords, keys) in code
- [ ] Examples follow best practices
- [ ] New files are in appropriate directories
- [ ] README files explain how to use the examples
- [ ] Commit messages are clear and descriptive

## 🎨 Content Ideas

### New Examples Needed

- [ ] Ruby on Rails application
- [ ] Java Spring Boot application
- [ ] .NET Core application
- [ ] PHP Laravel application
- [ ] Go application
- [ ] Elasticsearch setup
- [ ] RabbitMQ/Kafka setup
- [ ] Jenkins CI/CD pipeline
- [ ] Multi-stage build for different languages
- [ ] Docker Swarm examples
- [ ] Kubernetes migration guides

### Documentation Improvements

- [ ] Troubleshooting guide
- [ ] Performance tuning guide
- [ ] Windows-specific instructions
- [ ] macOS-specific instructions
- [ ] Docker Desktop alternatives
- [ ] Video tutorials
- [ ] Interactive examples
- [ ] Real-world case studies

### Exercises to Add

- [ ] Debugging exercises
- [ ] Security hardening exercises
- [ ] Performance optimization challenges
- [ ] Networking scenarios
- [ ] Multi-environment deployments
- [ ] Migration from VMs to containers

## 💬 Communication

- **Issues**: Use GitHub Issues for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Pull Requests**: Use PRs for code contributions

## 🐛 Reporting Issues

When reporting issues, please include:

1. **Description**: What's the problem?
2. **Steps to reproduce**: How can we see the issue?
3. **Expected behavior**: What should happen?
4. **Actual behavior**: What actually happens?
5. **Environment**: 
   - Docker version (`docker --version`)
   - Operating system
   - Any relevant error messages

Example:
```
**Description**: Container fails to start

**Steps to reproduce**:
1. Navigate to examples/nodejs-app
2. Run `docker build -t test .`
3. Run `docker run test`

**Expected**: Container starts successfully
**Actual**: Container exits with error code 1

**Environment**:
- Docker version: 24.0.5
- OS: Ubuntu 22.04
- Error: "npm: not found"
```

## 📜 Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Publishing others' private information
- Other unprofessional conduct

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in the README.md file and release notes.

## 📚 Resources

- [Docker Documentation](https://docs.docker.com/)
- [Markdown Guide](https://www.markdownguide.org/)
- [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)

## ❓ Questions?

If you have questions about contributing, feel free to:
- Open an issue with the "question" label
- Start a discussion
- Contact the maintainers

Thank you for contributing to Docker Refresh! 🐳
