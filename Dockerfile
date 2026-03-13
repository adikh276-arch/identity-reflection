# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy build files and server source
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/lib ./src/lib
COPY --from=builder /app/database ./database
COPY --from=builder /app/server.js ./server.js

# Expose port (Internal to container)
EXPOSE 80

# Environment variables (Can be overridden by Docker/Portainer/K8s)
ENV PORT=80
ENV NODE_ENV=production

# The start script in package.json uses tsx server.js
CMD ["npm", "start"]
