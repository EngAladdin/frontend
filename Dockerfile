### Stage 1: build React app
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install --legacy-peer-deps

COPY public ./public
COPY src ./src

# مهم: env لوحدها
ENV REACT_APP_API_URL=https://backend-production-d1ca.up.railway.app

RUN npm run build


### Stage 2: serve with nginx
FROM nginx:1.27-alpine

LABEL service="dashboard-frontend"

# remove default config
RUN rm /etc/nginx/conf.d/default.conf

# (لو عندك nginx.conf ضيفه هنا)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# copy build
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD wget -qO- http://localhost:3000/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
