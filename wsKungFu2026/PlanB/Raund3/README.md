# WebSocket Demo

Минимальный demo-проект на Node.js с библиотекой `ws`. В проекте есть WebSocket-сервер на `ws://localhost:8080`, статический HTML-клиент без HTTP-сервера и Bruno-коллекция для ручной проверки сценариев `broadcast`, `private` и ошибок.

## Структура проекта

```text
PlanA/Raund3
|-- bruno/
|   |-- README.md
|   |-- bruno.json
|   |-- ws-client-a.bru
|   |-- ws-client-b.bru
|   |-- ws-send-all.bru
|   |-- ws-send-to-client.bru
|   |-- ws-send-to-missing-client.bru
|-- public/
|   `-- index.html
|-- package.json
|-- README.md
`-- server.js
```

## Установка зависимостей

```bash
cd "E:\PRJ\KFU2026Ekb\PlanA\Raund3"
npm install
```

Единственная npm-зависимость проекта: `ws`.

## Запуск сервера

```bash
cd "E:\PRJ\KFU2026Ekb\PlanA\Raund3"
npm start
```

Сервер запускается напрямую через `ws` и слушает адрес `ws://localhost:8080`.

## Открытие клиента

Откройте файл `public/index.html` двойным кликом или любым браузером как локальный файл. HTTP-сервер для клиента не нужен.

После открытия клиент умеет:

- подключаться к `ws://localhost:8080`
- показывать статус `disconnected`, `connecting`, `connected`, `error`
- показывать назначенный сервером `clientId`
- отображать список подключенных клиентов
- отправлять `broadcast` всем
- отправлять `private` конкретному `clientId`
- показывать входящие сообщения и ошибки с timestamp

## JSON-протокол

Все сообщения передаются только в JSON.

### Welcome от сервера

```json
{
  "type": "welcome",
  "clientId": "client-1",
  "clients": ["client-1", "client-2"]
}
```

### Обновление списка клиентов

```json
{
  "type": "clients",
  "clients": ["client-1", "client-2"]
}
```

### Broadcast от клиента

```json
{
  "type": "broadcast",
  "message": "Hello everyone"
}
```

### Broadcast от сервера

```json
{
  "type": "message",
  "mode": "broadcast",
  "from": "client-1",
  "message": "Hello everyone",
  "timestamp": "2026-01-01T12:00:00.000Z"
}
```

### Private от клиента

```json
{
  "type": "private",
  "to": "client-2",
  "message": "Hello client-2"
}
```

### Private от сервера

```json
{
  "type": "message",
  "mode": "private",
  "from": "client-1",
  "to": "client-2",
  "message": "Hello client-2",
  "timestamp": "2026-01-01T12:00:00.000Z"
}
```

## Ошибки

### Не найден клиент

```json
{
  "type": "error",
  "message": "Client not found",
  "targetClientId": "client-999"
}
```

### Невалидный JSON

```json
{
  "type": "error",
  "message": "Invalid JSON"
}
```

### Неизвестный тип сообщения

```json
{
  "type": "error",
  "message": "Unknown message type"
}
```

## Примеры тестирования через браузер

1. Запустите сервер командой `npm start`.
2. Откройте `public/index.html` в двух окнах браузера.
3. Нажмите `Connect` в обоих окнах.
4. В первом окне отправьте сообщение через `Send to all` и проверьте, что оно появилось в обеих историях.
5. Во втором окне выберите `clientId` первого окна и отправьте private-сообщение через `Send to client`.
6. Для проверки ошибки используйте Bruno или любой WS-клиент и отправьте `private` на `client-999`.

## Тестирование через Bruno

В папке `bruno/` лежит готовая WebSocket-коллекция с отдельными запросами на подключение и отправку сообщений.

- `ws-client-a.bru` и `ws-client-b.bru` открывают отдельные WS-сессии
- `ws-send-all.bru` отправляет `broadcast`
- `ws-send-to-client.bru` отправляет `private` на указанный `clientId`
- `ws-send-to-missing-client.bru` проверяет ошибку `Client not found`

Подробные шаги описаны в [bruno/README.md](./bruno/README.md).
