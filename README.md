# AI Assistant Web Client

Веб-клиент для тестирования AI Assistant приложения с поддержкой Docker.

## 🚀 Запуск в Docker

### Подготовка

1. Скопируйте этот проект в директорию с вашим backend сервером
2. Создайте `.env` файл с необходимыми переменными:

```env
# API Key для HMAC подписи (должен совпадать с backend)
VITE_API_KEY=your_secret_api_key

# Авторизация веб-клиента
VITE_USERNAME=admin
VITE_PASSWORD=password

# Firebase настройки
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcd1234
VITE_FIREBASE_REFRESH_TOKEN=your_firebase_refresh_token
```

### Запуск

**Вариант 1: Только веб-клиент (рекомендуется)**
```bash
# Если backend уже запущен отдельно
docker-compose -f docker-compose.client.yml up -d
```

**Вариант 2: Интеграция с существующим docker-compose**
```bash
# Добавьте секцию web-client из docker-compose.yml в ваш основной docker-compose файл
# Затем запустите:
docker-compose up -d
```

**Остановка:**
```bash
docker-compose -f docker-compose.client.yml down
```

### Доступ

- **Web Client**: http://localhost:3001
- **Backend API**: http://localhost:8000
- **Database**: localhost:5433

## 🛠 Разработка

### Локальный запуск

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev
```

### Сборка

```bash
# Сборка продакшен версии
npm run build

# Просмотр сборки
npm run preview
```

## 📝 Настройка Nginx (на сервере)

Если используете внешний nginx, добавьте прокси для веб-клиента:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Прокси для backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Прокси для веб-клиента
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🔧 Особенности Docker версии

- Переменные окружения передаются в runtime через `env-config.js`
- Поддержка внешнего nginx как прокси
- Оптимизированная многоэтапная сборка
- Автоматическая настройка CORS для backend запросов

## 📋 Функциональность

- ✅ Авторизация по логину/паролю
- ✅ Подключение к AI Assistant через LiveKit
- ✅ Обработка RPC команд (get-permissions, get-location, open-navigator)
- ✅ Отображение экранов онбординга (permissions, waypoints, paywall, navigator, main)
- ✅ Настройка разрешений (микрофон, геолокация, push)
- ✅ Мониторинг RPC запросов и ответов
- ✅ Поддержка аудио от агента