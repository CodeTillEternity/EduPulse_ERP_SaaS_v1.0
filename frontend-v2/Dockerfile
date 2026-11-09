# ==============================================================================
# EduPulse React Frontend - Production Multi-Stage Dockerfile
# Stage 1: Build production static distribution using Node 20 Alpine
# ==============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies deterministically
COPY package.json package-lock.json ./
RUN npm ci

# Copy application source code
COPY . .

# Compile TypeScript and bundle production assets with Vite
RUN npm run build

# ==============================================================================
# Stage 2: Production Nginx Alpine Web Server
# ==============================================================================
FROM nginx:alpine AS runtime

# Copy custom Nginx configuration supporting React Router SPA fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy bundled assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Set proper ownership for static assets
RUN chown -R nginx:nginx /usr/share/nginx/html

# Expose standard HTTP port
EXPOSE 80

# Health check to ensure web server is responding
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Run Nginx in foreground mode
CMD ["nginx", "-g", "daemon off;"]
