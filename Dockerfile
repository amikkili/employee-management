# ── STAGE 1: Build the React App ──────────────────
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json first (install dependencies)
COPY package.json package-lock.json ./
RUN npm install

# Copy all source code
COPY . .

# Build React for production (creates /dist folder)
RUN npm run build

# ── STAGE 2: Serve with Nginx ─────────────────────
FROM nginx:alpine

# Copy built React files into Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx config (important for React Router!)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]