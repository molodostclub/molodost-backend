FROM node:18-alpine

# Установка зависимостей для sharp
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev nasm bash vips-dev

# === Шаг 1: Установим переменные окружения
ARG NODE_ENV=production
ARG NEXT_PUBLIC_API_URL=https://admin.molodost.club

ENV NODE_ENV=$NODE_ENV
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# === Шаг 2: Установка зависимостей
WORKDIR /opt/
COPY ./package.json ./package-lock.json ./
ENV PATH /opt/node_modules/.bin:$PATH
RUN npm install

# === Шаг 3: Сборка проекта
WORKDIR /opt/app
COPY . .
RUN npm run build

# === Шаг 4: Запуск (если SSR Next.js, то оставь как есть)
EXPOSE 3000
CMD ["npm", "start"]
