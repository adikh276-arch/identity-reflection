FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM node:20-alpine

WORKDIR /app

# Copy production dependencies and build artifacts
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/lib ./src/lib
COPY --from=builder /app/database ./database
COPY --from=builder /app/server.js ./server.js

# ENV required for Neon and Subpath
ENV DATABASE_URL=$DATABASE_URL
ENV NEON_PROJECT_ID=$NEON_PROJECT_ID
ENV NEON_API_KEY=$NEON_API_KEY

EXPOSE 80

CMD ["node", "server.js"]
