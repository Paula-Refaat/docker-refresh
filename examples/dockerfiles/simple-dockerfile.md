# Simple Dockerfile Example

This is a basic Dockerfile for a Node.js application.

## Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

## Building the Image

```bash
docker build -t simple-node-app .
```

## Running the Container

```bash
docker run -d -p 3000:3000 --name my-app simple-node-app
```

## Testing

```bash
curl http://localhost:3000
```

## Key Points

- **FROM**: Base image (Node.js 18 on Alpine Linux)
- **WORKDIR**: Set working directory inside container
- **COPY**: Copy package files first for better caching
- **RUN**: Execute commands (install dependencies)
- **EXPOSE**: Document which port the app uses
- **CMD**: Default command when container starts
