# Настройка AI Assistant Web Client

## Предварительные требования

1. **Node.js 18+** и npm/yarn
2. **Запущенный assistant-server** на порту 8000
3. **Запущенный LiveKit server** на порту 7880
4. **Firebase User ID** (любая строка-идентификатор)

## Пошаговая настройка

### 1. Настройка переменных окружения

Создайте файл `.env` в корне папки `web-client`:

```bash
# Static Firebase ID (замените на ваш уникальный ID)
VITE_FIREBASE_USER_ID=test-user-123

# Assistant Server (измените если нужно)
VITE_ASSISTANT_SERVER_URL=http://localhost:8000

# LiveKit Server (измените если нужно)
VITE_LIVEKIT_WS_URL=ws://localhost:7880
```

**Важно:** `VITE_FIREBASE_USER_ID` должен быть уникальным идентификатором пользователя. Это может быть любая строка, например:
- `user-123`
- `admin@example.com`
- `test-user-web-client`

### 2. Установка зависимостей

```bash
cd web-client
npm install
```

### 3. Запуск серверов

Перед запуском веб-клиента убедитесь, что запущены:

#### Assistant Server
```bash
cd assistant-server
# Следуйте инструкциям в README проекта
```

#### LiveKit Server
```bash
# Если используете Docker:
docker run --rm -p 7880:7880 -p 7881:7881 -p 7882:7882/udp livekit/livekit-server

# Или следуйте инструкциям на https://docs.livekit.io/home/self-hosting/local/
```

#### Assistant Worker
```bash
cd assistant-worker
# Следуйте инструкциям в README проекта
```

### 4. Запуск веб-клиента

```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:3000

## Проверка работы

1. **Откройте браузер** и перейдите на http://localhost:3000
2. **Проверьте**, что отображается ваш Firebase User ID в правом верхнем углу
3. **Нажмите "Подключиться к агенту"** - должно установиться соединение с LiveKit
4. **Разрешите доступ к микрофону** когда браузер запросит
5. **Попробуйте сказать что-то** или отправить сообщение в чате

## Возможные проблемы

### Firebase User ID не настроен

**Ошибка:** "Firebase User ID не найден в переменных окружения"

**Решение:**
- Убедитесь, что файл `.env` создан в корне папки `web-client`
- Проверьте, что переменная `VITE_FIREBASE_USER_ID` указана правильно
- Перезапустите сервер разработки (`npm run dev`)

### LiveKit подключение не работает

- Убедитесь, что LiveKit server запущен на правильном порту
- Проверьте переменную `VITE_LIVEKIT_WS_URL`
- Убедитесь, что assistant-server выдает валидные токены для вашего Firebase ID

### Assistant Server недоступен

- Проверьте, что сервер запущен на порту 8000
- Убедитесь, что CORS настроен для домена веб-клиента
- Проверьте переменную `VITE_ASSISTANT_SERVER_URL`
- Убедитесь, что assistant-server принимает ваш Firebase ID

### Микрофон не работает

- Убедитесь, что разрешили доступ к микрофону в браузере
- Попробуйте перезагрузить страницу и разрешить доступ заново
- Проверьте настройки браузера и операционной системы

### Агент не отвечает

- Убедитесь, что assistant-worker запущен и подключен к той же LiveKit комнате
- Проверьте логи assistant-worker на наличие ошибок
- Попробуйте отправить текстовое сообщение вместо голосового

## Настройка для разных пользователей

### Создание нескольких пользователей

Для тестирования с разными пользователями создайте разные `.env` файлы:

**.env.user1:**
```bash
VITE_FIREBASE_USER_ID=user-1
VITE_ASSISTANT_SERVER_URL=http://localhost:8000
VITE_LIVEKIT_WS_URL=ws://localhost:7880
```

**.env.user2:**
```bash
VITE_FIREBASE_USER_ID=user-2
VITE_ASSISTANT_SERVER_URL=http://localhost:8000
VITE_LIVEKIT_WS_URL=ws://localhost:7880
```

Затем запускайте с нужным файлом:
```bash
cp .env.user1 .env && npm run dev
```

### Смена пользователя

Чтобы переключиться на другого пользователя:
1. Остановите сервер разработки (Ctrl+C)
2. Измените `VITE_FIREBASE_USER_ID` в `.env`
3. Перезапустите сервер (`npm run dev`)

## Production развертывание

### Сборка

```bash
npm run build
```

### Настройка переменных для production

Создайте `.env.production`:

```bash
VITE_FIREBASE_USER_ID=production-user-id
VITE_ASSISTANT_SERVER_URL=https://your-api-domain.com
VITE_LIVEKIT_WS_URL=wss://your-livekit-domain.com
```

### Развертывание

Папку `dist` можно развернуть на любом статическом хостинге:

- **Vercel**: `vercel --prod`
- **Netlify**: Загрузите папку `dist`
- **GitHub Pages**: Настройте GitHub Actions
- **Firebase Hosting**: `firebase deploy`

## Отладка

### Включение детальных логов

Добавьте в браузере:

```javascript
localStorage.setItem('lk-log-level', 'debug');
```

### Просмотр WebRTC статистики

Откройте DevTools и перейдите на `chrome://webrtc-internals/` (в Chrome)

### Проверка отправляемых данных

В DevTools -> Network можно увидеть запросы к assistant-server и проверить:
- Правильно ли отправляется Firebase User ID в заголовке Authorization
- Возвращается ли корректный LiveKit токен 