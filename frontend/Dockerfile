# Stage 1: Build React Project
FROM node:20-alpine AS builder

WORKDIR /app

# Copy manifest & lockfile untuk caching layer
COPY package.json yarn.lock ./

# Install dependencies secara presisi menggunakan lockfile
RUN yarn install --frozen-lockfile

# Copy seluruh source code dan kompilasi bundle Vite/React
COPY . .
RUN yarn build

# Stage 2: Serve Production Assets via Nginx
FROM nginx:alpine

# Copy hasil build dist ke directory web server Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]