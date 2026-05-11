Папка проекта:

E:\PRJ\KFU2026Ekb\PlanA\Raund3

Создай минимальный demo-проект на JavaScript с WebSocket-сервером и простым HTML-клиентом.

========================
ГЛАВНЫЕ ОГРАНИЧЕНИЯ
========================

Используй:
- Node.js
- библиотеку ws

Не используй:
- Express
- Socket.IO
- TypeScript
- Vite
- Webpack
- дополнительные npm-библиотеки

Не используй модуль http, если он не нужен для задачи.

Сервер должен работать напрямую через библиотеку ws:

ws://localhost:8080

========================
СТРУКТУРА ПРОЕКТА
========================

Создай файлы и папки:

- server.js
- package.json
- README.md
- public/index.html
- bruno/
- bruno/bruno.json
- bruno/ws-client-a.bru
- bruno/ws-client-b.bru
- bruno/ws-send-all.bru
- bruno/ws-send-to-client.bru
- bruno/ws-send-to-missing-client.bru
- bruno/README.md

========================
PACKAGE.JSON
========================

Создай package.json.

Единственная зависимость:

ws

Добавь scripts:

"scripts": {
  "start": "node server.js"
}

========================
SERVER.JS
========================

Создай WebSocket-сервер на Node.js с библиотекой ws.

Требования:

- Используй CommonJS:
  const WebSocket = require('ws');

- Порт вынеси в константу:
  const PORT = 8080;

- Сервер должен слушать:
  ws://localhost:8080

- Сервер должен поддерживать несколько одновременных подключений.

- Каждому подключенному клиенту назначай уникальный clientId:
  client-1
  client-2
  client-3
  ...

- Храни подключенных клиентов в Map:
  clientId -> ws connection

- После подключения отправляй новому клиенту welcome-сообщение в JSON:

{
  "type": "welcome",
  "clientId": "client-1",
  "clients": ["client-1", "client-2"]
}

- При подключении или отключении клиента рассылай всем клиентам обновленный список клиентов:

{
  "type": "clients",
  "clients": ["client-1", "client-2"]
}

========================
ФОРМАТ СООБЩЕНИЙ
========================

Все сообщения должны передаваться в JSON.

Клиент может отправлять сообщение всем:

{
  "type": "broadcast",
  "message": "Hello everyone"
}

Сервер должен переслать его всем подключенным клиентам:

{
  "type": "message",
  "mode": "broadcast",
  "from": "client-1",
  "message": "Hello everyone",
  "timestamp": "2026-01-01T12:00:00.000Z"
}

Клиент может отправлять сообщение конкретному клиенту:

{
  "type": "private",
  "to": "client-2",
  "message": "Hello client-2"
}

Сервер должен отправить сообщение только целевому клиенту и отправителю:

{
  "type": "message",
  "mode": "private",
  "from": "client-1",
  "to": "client-2",
  "message": "Hello client-2",
  "timestamp": "2026-01-01T12:00:00.000Z"
}

Если целевой clientId не найден, сервер должен вернуть отправителю ошибку:

{
  "type": "error",
  "message": "Client not found",
  "targetClientId": "client-999"
}

Если пришел невалидный JSON, сервер должен вернуть ошибку:

{
  "type": "error",
  "message": "Invalid JSON"
}

Если пришел неизвестный type, сервер должен вернуть ошибку:

{
  "type": "error",
  "message": "Unknown message type"
}

Добавь логирование:
- запуск сервера
- подключение клиента
- отключение клиента
- получение сообщения
- broadcast
- private message
- ошибки

========================
PUBLIC/INDEX.HTML
========================

Создай простой клиент на HTML + vanilla JavaScript.

Файл должен работать как локальный файл:

public/index.html

То есть его можно открыть двойным кликом в браузере без HTTP-сервера.

Клиент должен уметь:

- подключаться к:
  ws://localhost:8080

- показывать статус подключения:
  disconnected
  connecting
  connected
  error

- отображать свой clientId

- отображать список подключенных клиентов

- отправлять сообщение всем

- отправлять сообщение конкретному clientId

- отображать входящие сообщения

- отображать ошибки

Интерфейс должен содержать:

- кнопка "Подключиться"
- кнопка "Отключиться"
- статус подключения
- блок "Мой clientId"
- список клиентов
- textarea или input для сообщения
- кнопка "Отправить всем"
- select или input для clientId получателя
- кнопка "Отправить клиенту"
- история сообщений

Сообщения в истории показывай с timestamp.

Сделай простой, аккуратный CSS внутри index.html.

Не используй внешние CSS/JS-библиотеки.

========================
BRUNO COLLECTION
========================

Подготовь Bruno-коллекцию для проверки WebSocket-сервера.

Важно:
- Коллекция должна быть именно WebSocket.
- Не создавай HTTP/REST-запросы.
- Каждый request должен иметь:

meta {
  type: ws
}

Не завязывай подключение Bruno на environment, если это не обязательно.

Используй прямой URL:

ws://localhost:8080

Создай запросы:

1. ws-client-a.bru

Описание:
Подключение клиента A.

2. ws-client-b.bru

Описание:
Подключение клиента B.

3. ws-send-all.bru

Описание:
Отправка broadcast-сообщения всем клиентам.

Body:

{
  "type": "broadcast",
  "message": "Hello everyone from Bruno"
}

4. ws-send-to-client.bru

Описание:
Отправка private-сообщения конкретному клиенту.

Body:

{
  "type": "private",
  "to": "client-1",
  "message": "Private hello from Bruno"
}

5. ws-send-to-missing-client.bru

Описание:
Отправка сообщения в несуществующий clientId.

Body:

{
  "type": "private",
  "to": "client-999",
  "message": "This client does not exist"
}

Пример формата .bru:

meta {
  name: ws-send-all
  type: ws
  seq: 3
}

ws {
  url: ws://localhost:8080
}

body:ws {
  name: message 1
  content: '''
{
  "type": "broadcast",
  "message": "Hello everyone from Bruno"
}
'''
}

========================
BRUNO README
========================

Создай:

bruno/README.md

Объясни в нем:

- как открыть коллекцию в Bruno
- что каждый WebSocket request в Bruno открывает отдельную WS-сессию
- что clientId назначается сервером при подключении
- что для private message нужно знать актуальный clientId
- как протестировать broadcast
- как протестировать ошибку client not found

========================
README.MD
========================

Создай README.md в корне проекта.

README должен содержать:

- описание проекта
- структуру файлов
- установку зависимостей
- запуск сервера
- открытие клиента
- описание JSON-протокола
- примеры broadcast-сообщений
- примеры private-сообщений
- описание ошибок
- тестирование через браузер
- тестирование через Bruno

Команды:

cd "E:\PRJ\KFU2026Ekb\PlanA\Raund3"
npm install
npm start

========================
ФИНАЛЬНАЯ ПРОВЕРКА
========================

После создания проекта проверь:

- package.json существует
- server.js существует
- public/index.html существует
- README.md существует
- bruno collection существует
- сервер запускается без синтаксических ошибок
- зависимость только одна: ws

Можно проверить командой:

node --check server.js

========================
ФОРМАТ РЕЗУЛЬТАТА
========================

В конце ответа покажи:

1. Что было создано
2. Итоговую структуру файлов
3. Команды запуска
4. Как протестировать вручную:
   - открыть два окна index.html
   - подключить оба клиента
   - отправить сообщение всем
   - отправить сообщение конкретному clientId
   - проверить ошибку при отправке на client-999

Работай только в папке:

E:\PRJ\KFU2026Ekb\PlanA\Raund3