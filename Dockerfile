FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Clean up default files
RUN rm -rf ./*

# Copy build artifacts to the subpath directory
COPY --from=builder /app/dist /usr/share/nginx/html/identity_reflection

# Configure Nginx
RUN rm /etc/nginx/conf.d/default.conf
COPY vite-nginx.conf /etc/nginx/conf.d/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
