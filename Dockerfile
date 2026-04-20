# مرحلة البناء
FROM node:18-alpine AS builder

WORKDIR /app

# نسخ ملفات package فقط أولاً للتخزين المؤقت
COPY package*.json ./

# تثبيت مع --production أولاً ثم dev dependencies
RUN npm ci --only=production --no-audit --no-fund || \
    npm install --production --no-audit --no-fund

# نسخ باقي الملفات
COPY . .

# متغيرات البيئة للبناء
ENV CI=false
ENV ESLINT_NO_DEV_ERRORS=true
ENV DISABLE_ESLINT_PLUGIN=true
ENV GENERATE_SOURCEMAP=false
ENV NODE_OPTIONS="--max-old-space-size=2048"

# بناء التطبيق
RUN npm run build

# مرحلة الإنتاج
FROM nginx:1.27-alpine

# نسخ ملفات البناء
COPY --from=builder /app/build /usr/share/nginx/html

# نسخ إعدادات nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# فحص الصحة
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/healthz || exit 1

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
