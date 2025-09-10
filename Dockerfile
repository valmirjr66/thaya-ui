FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm cache clean --force
RUN npm install --registry=https://registry.npmjs.org/

COPY . .
RUN npm run build

FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY env.sh /docker-entrypoint.d/env.sh
RUN chmod +x /docker-entrypoint.d/env.sh

EXPOSE 80