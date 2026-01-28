# Docker Compose Examples

This directory contains various Docker Compose configurations for different scenarios.

## Examples Overview

1. [Simple Web App](simple-webapp.md) - Single service configuration
2. [Multi-Service App](multi-service.md) - Web app with database
3. [Full Stack App](full-stack.md) - Frontend, backend, and database
4. [Microservices](microservices.md) - Multiple interconnected services

## Quick Start

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Common Commands

```bash
# Build and start
docker-compose up --build

# Scale services
docker-compose up -d --scale worker=3

# Execute command in service
docker-compose exec web bash

# View service status
docker-compose ps

# Restart services
docker-compose restart
```

## Directory Structure

```
docker-compose/
├── README.md
├── simple-webapp.md
├── multi-service.md
├── full-stack.md
└── microservices.md
```
