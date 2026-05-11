# WebSocket Echo Demo

Минимальный demo-проект WebSocket echo-сервера и клиента в папке `PlanA/Raund1`.

Проект использует только одну внешнюю npm-зависимость:

- `ws`

## Команды подготовки

```powershell
cd "E:\PRJ\KFU2026Ekb\PlanA\Raund1"
npm init -y
npm install ws
```

## Что делает проект

- Поднимает WebSocket echo-сервер на `ws://localhost:8080`.
- Проверяет аутентификацию при каждом новом подключении через `req.headers`.
- Поддерживает два варианта аутентификации:
  - `x-login: admin` и `x-password: 123`
  - `x-token: secret123`
- После успешной аутентификации отправляет клиенту JSON:

```json
{
  "status": "connected",
  "message": "WebSocket connected"
}
```

- После этого сервер получает сообщение и отправляет его обратно тому же клиенту.
- В проекте есть Bruno-коллекция для проверки авторизации и echo-поведения.

## Состав проекта

- `server.js` - WebSocket echo-сервер с проверкой заголовков и логированием
- `index.html` - простой браузерный UI-клиент
- `README.md` - инструкция по запуску и тестированию
- `bruno/bruno.json` - описание Bruno-коллекции
- `bruno/collection.bru` - корневой Bruno collection-файл
- `bruno/ws-login-pass.bru` - WebSocket-запрос с `x-login` и `x-password`
- `bruno/ws-token.bru` - WebSocket-запрос с `x-token`
- `bruno/ws-invalid-auth.bru` - WebSocket-запрос с неверными данными

## Требования

- Node.js 18+ или новее
- npm
- установленная зависимость `ws`
- Bruno, если вы хотите протестировать через коллекцию

## Установка зависимостей

Если проект уже создан, достаточно выполнить:

```powershell
cd "E:\PRJ\KFU2026Ekb\PlanA\Raund1"
npm install
```

## Запуск сервера

```powershell
cd "E:\PRJ\KFU2026Ekb\PlanA\Raund1"
npm start
```

После запуска сервер будет слушать:

```text
ws://localhost:8080
```

## Как открыть клиент

Так как это один HTML-файл без сборки, откройте `index.html` напрямую в браузере:

- двойным кликом по файлу
- или через адресную строку браузера
- или через файловый менеджер

Путь к файлу:

```text
E:\PRJ\KFU2026Ekb\PlanA\Raund1\index.html
```

## Важное ограничение браузера

Обычный браузерный API `WebSocket` не умеет отправлять произвольные заголовки вроде:

- `x-login`
- `x-password`
- `x-token`

Поэтому строка вида:

```js
new WebSocket(url, {
  headers: {
    'x-login': 'admin',
    'x-password': '123'
  }
});
```

не работает в стандартном браузере.

Чтобы `index.html` оставался полезным как UI-demo, в нём используется совместимый браузерный обходной путь: credentials передаются через стандартный заголовок `Sec-WebSocket-Protocol`. При этом точная проверка аутентификации через `x-*` headers реализована и работает для:

- Bruno
- Node.js-клиентов на библиотеке `ws`

## Примеры WebSocket-подключений

### 1. Успешная авторизация через login/password в Node.js

```js
const WebSocket = require('ws');

const socket = new WebSocket('ws://localhost:8080', {
  headers: {
    'x-login': 'admin',
    'x-password': '123'
  }
});

socket.on('open', () => {
  socket.send('Hello from Node client');
});

socket.on('message', (data) => {
  console.log(data.toString());
});
```

### 2. Успешная авторизация через token в Node.js

```js
const WebSocket = require('ws');

const socket = new WebSocket('ws://localhost:8080', {
  headers: {
    'x-token': 'secret123'
  }
});

socket.on('open', () => {
  socket.send('Hello with token');
});

socket.on('message', (data) => {
  console.log(data.toString());
});
```

### 3. Неуспешная авторизация в Node.js

```js
const WebSocket = require('ws');

const socket = new WebSocket('ws://localhost:8080', {
  headers: {
    'x-login': 'wrong',
    'x-password': 'wrong'
  }
});

socket.on('close', (code, reason) => {
  console.log(code, reason.toString());
});
```

Ожидаемый результат:

- сервер закрывает соединение
- код закрытия: `4001`
- причина: `Unauthorized`

## Примеры аутентификации через headers

### Header-based login/password

```text
x-login: admin
x-password: 123
```

### Header-based token

```text
x-token: secret123
```

## Пример успешного подключения

Сценарий:

1. Запустите сервер.
2. Подключитесь через Bruno или Node.js-клиент с корректными заголовками.
3. Получите приветственный JSON.
4. Отправьте строку, например `Hello from Bruno`.
5. Получите ту же строку обратно.

Ожидаемое первое серверное сообщение:

```json
{
  "status": "connected",
  "message": "WebSocket connected"
}
```

Ожидаемое echo-сообщение:

```text
Hello from Bruno
```

## Пример неуспешной авторизации

Если передать, например:

```text
x-login: wrong
x-password: wrong
```

то сервер завершит соединение с:

```text
4001 Unauthorized
```

## Тестирование через Bruno

Откройте папку `bruno/` как коллекцию Bruno.

Внутри есть 3 WebSocket-запроса:

1. `ws-login-pass.bru` - успешная авторизация через `x-login` и `x-password`
2. `ws-token.bru` - успешная авторизация через `x-token`
3. `ws-invalid-auth.bru` - неуспешная авторизация

Каждый запрос:

- использует `meta { type: ws }`
- подключается к `ws://localhost:8080`
- содержит `body:ws`
- не использует HTTP/REST syntax
- не использует query params

## Как протестировать через Bruno

1. Запустите сервер командой `npm start`.
2. Откройте Bruno.
3. Импортируйте или откройте папку `E:\PRJ\KFU2026Ekb\PlanA\Raund1\bruno`.
4. Выберите `ws-login-pass` или `ws-token`.
5. Выполните WebSocket-запрос.
6. Убедитесь, что приходит сообщение `WebSocket connected`.
7. Убедитесь, что содержимое `body:ws` возвращается обратно как echo.
8. Проверьте `ws-invalid-auth` и убедитесь, что соединение закрывается с ошибкой авторизации.

## Тестирование через browser UI

1. Запустите сервер.
2. Откройте `index.html`.
3. Выберите метод аутентификации.
4. Введите:
   - `admin` / `123`
   - или `secret123`
5. Нажмите `Подключиться`.
6. После подключения отправьте сообщение кнопкой `Отправить` или клавишей Enter.
7. Убедитесь, что в истории есть:
   - системное сообщение о подключении
   - исходящее сообщение
   - входящее echo-сообщение

Важно: этот UI использует браузерный subprotocol fallback, потому что браузер не умеет отправлять `x-*` headers.

## Логирование

Сервер пишет в консоль:

- запуск сервера
- новое подключение
- снимок заголовков handshake
- успешную аутентификацию
- ошибку аутентификации
- получение сообщения
- отправку echo-сообщения
- отключение клиента
- серверные ошибки

## Возможные ошибки и причины

### `4001 Unauthorized`

Причины:

- неверные `x-login` / `x-password`
- неверный `x-token`
- заголовки авторизации вообще не были переданы
- в браузере пытались ожидать отправку `x-*` headers напрямую, что стандартный WebSocket API не поддерживает

### `ECONNREFUSED` или соединение не открывается

Причины:

- сервер ещё не запущен
- указан неверный порт
- локальный firewall блокирует соединение

### Нет echo-ответа

Причины:

- соединение закрылось до отправки сообщения
- сообщение не было отправлено после открытия сокета
- была ошибка авторизации

## Краткий сценарий запуска

```powershell
cd "E:\PRJ\KFU2026Ekb\PlanA\Raund1"
npm install
npm start
```

Дальше:

- откройте `index.html` для ручной browser-проверки
- или используйте Bruno-коллекцию из папки `bruno/`
