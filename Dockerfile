# Zakat Platform - Admin Portal Dockerfile
# React + Vite Development Server
# =========================================

FROM node:20-alpine

LABEL maintainer="Zakat Platform Team"
LABEL description="React Admin Portal for Zakat Platform"

WORKDIR /app

# Install dependencies first for caching
COPY package.json package-lock.json* ./
RUN npm install

# Copy source code
COPY . .

EXPOSE 3001

# Development server
CMD ["npm", "run", "dev"]
