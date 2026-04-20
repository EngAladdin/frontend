### Stage 1: build React app
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY public ./public
COPY src ./src

ENV REACT_APP_API_URL=https://backend-production-d1ca.up.railway.app
ENV CI=false

RUN npm run build


### Stage 2: serve with nginx
FROM nginx:1.27-alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
