### Stage 1: build React app
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install --legacy-peer-deps
COPY public ./public
COPY src ./src
ENV REACT_APP_API_URL=https://backend-production-d1ca.up.railway.appRUN

npm run build
### Stage 2: serve with nginx
FROM nginx:1.27-alpine
LABEL service="dashboard-frontend"
# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf
# Our SPA nginx config
# Copy built React app
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD wget -qO- http://localhost:3000/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
