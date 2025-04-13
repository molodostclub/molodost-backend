FROM node:18-slim

WORKDIR /opt/

# Установка зависимостей для sharp и других нативных модулей
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    make \
    g++ \
    libvips-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Установка пакетов
COPY ./package.json ./package-lock.json ./
RUN npm install

# Копирование кода и сборка
COPY . .
RUN npm run build

EXPOSE 4000
CMD ["npm", "start"]