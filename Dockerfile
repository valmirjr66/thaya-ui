# Use official Node.js image for build stage
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm cache clean --force
RUN npm install

COPY . .
RUN npm run build

# Use lightweight web server to serve build artifacts
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy build artifacts from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx server
CMD ["nginx", "-g", "daemon off;"]