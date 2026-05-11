# WSS Echo Demo

Минимальный demo-проект защищенного WebSocket echo-сервера и клиента в папке `PlanA/Raund2`.

Проект использует только одну внешнюю npm-зависимость:

- `ws`

Для HTTPS/WSS используются только встроенные модули Node.js:

- `https`
- `fs`
- `path`

## Что это за проект

Проект поднимает HTTPS-сервер и WSS echo-сервер на одном порту:

- `https://localhost:8080`
- `wss://localhost:8080`

После успешной авторизации сервер:

1. принимает WebSocket-подключение;
2. отправляет JSON-сообщение о подключении;
3. принимает входящее сообщение;
4. отправляет то же сообщение обратно как echo.

## Чем WSS отличается от WS

- `ws://` передает трафик без TLS-шифрования.
- `wss://` работает поверх TLS, как `https://`.
- `wss://` нужен, когда требуется защищенное локальное или боевое соединение.
- Для `wss://` серверу нужны сертификат и закрытый ключ.

В этом проекте используется self-signed certificate для локальной разработки.

## Структура проекта

```text
PlanA/Raund2/
|-- bruno/
|   |-- bruno.json
|   |-- collection.bru
|   |-- ws-login-pass.bru
|   |-- ws-token.bru
|   `-- ws-invalid-auth.bru
|-- cert/
|   |-- cert.pem
|   `-- key.pem
|-- node_modules/
|-- generate-cert.ps1
|-- index.html
|-- package.json
|-- package-lock.json
|-- README.md
`-- server.js
```

## Список файлов

- `server.js` - HTTPS/WSS echo-сервер, авторизация, логирование, отдача `index.html`
- `index.html` - браузерный клиент для ручной проверки WSS
- `generate-cert.ps1` - генерация self-signed certificate в PEM-формате
- `cert/key.pem` - закрытый ключ для HTTPS/WSS
- `cert/cert.pem` - сертификат для HTTPS/WSS
- `bruno/ws-login-pass.bru` - WSS-запрос с `x-login` и `x-password`
- `bruno/ws-token.bru` - WSS-запрос с `x-token`
- `bruno/ws-invalid-auth.bru` - WSS-запрос с неверной авторизацией
- `package.json` - npm-конфигурация проекта
- `README.md` - инструкция по запуску и тестированию

## Авторизация через headers

Сервер поддерживает два основных варианта header-based auth:

### Login / password

```text
x-login: admin
x-password: 123
```

### Token

```text
x-token: secret123
```

Query params не используются.

## Важное ограничение браузера

Стандартный браузерный API `WebSocket` не умеет отправлять произвольные headers вроде:

- `x-login`
- `x-password`
- `x-token`

Поэтому:

- Bruno и Node.js-клиенты используют точную авторизацию через `x-*` headers;
- `index.html` использует совместимый fallback через `Sec-WebSocket-Protocol`, чтобы UI можно было протестировать в обычном браузере;
- query params при этом не используются.

## Установка зависимостей

```powershell
cd "E:\PRJ\KFU2026Ekb\PlanA\Raund2"
npm install
```

В `package.json` должна быть только одна зависимость:

- `ws`

## Генерация сертификатов

В проекте уже должны существовать:

- `cert/key.pem`
- `cert/cert.pem`

Если нужно перевыпустить сертификаты, используйте PowerShell-скрипт:

```powershell
cd "E:\PRJ\KFU2026Ekb\PlanA\Raund2"
powershell -ExecutionPolicy Bypass -File .\generate-cert.ps1
```

### Предпочтительная OpenSSL-команда

Если OpenSSL есть в системе, эквивалентная команда выглядит так:

```powershell
openssl req -x509 -newkey rsa:2048 -nodes `
  -keyout cert/key.pem `
  -out cert/cert.pem `
  -days 365 `
  -subj "/CN=localhost"
```

## Self-signed certificate

В проекте используется self-signed certificate для локального HTTPS/WSS.

Это означает:

- сертификат не подписан доверенным публичным CA;
- браузер и инструменты разработки могут предупреждать о недоверенном сертификате;
- для локального тестирования это ожидаемое поведение.

## Запуск проекта

```powershell
cd "E:\PRJ\KFU2026Ekb\PlanA\Raund2"
npm install
npm start
```

Скрипт `start`:

```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

## Запуск HTTPS/WSS сервера

После запуска сервер слушает:

```text
https://localhost:8080
wss://localhost:8080
```

При старте `server.js` читает именно эти файлы:

```js
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, 'cert/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert/cert.pem'))
};
```

## Как открыть index.html

Есть два варианта:

1. Рекомендуемый: открыть в браузере `https://localhost:8080`.
2. Альтернативный: открыть файл `index.html` напрямую из проводника.

Локальный путь к файлу:

```text
E:\PRJ\KFU2026Ekb\PlanA\Raund2\index.html
```

Рекомендуется сначала открыть `https://localhost:8080` и вручную разрешить self-signed certificate.

## Как тестировать через браузер

1. Запустите сервер командой `npm start`.
2. Откройте `https://localhost:8080`.
3. Если браузер показывает предупреждение, вручную подтвердите переход на сайт.
4. Выберите способ аутентификации:
   - `admin` / `123`
   - или `secret123`
5. Нажмите `Подключиться`.
6. Отправьте любое сообщение.
7. Убедитесь, что в истории есть:
   - системное сообщение о подключении;
   - исходящее сообщение;
   - входящее echo-сообщение.

## Как тестировать через Bruno

Откройте папку:

```text
E:\PRJ\KFU2026Ekb\PlanA\Raund2\bruno
```

В коллекции есть только WebSocket-запросы:

- `ws-login-pass.bru`
- `ws-token.bru`
- `ws-invalid-auth.bru`

Каждый `.bru` файл содержит:

```bru
meta {
  type: ws
}
```

Подключение выполняется к:

```text
wss://localhost:8080
```

### Проверка `ws-login-pass.bru`

- URL: `wss://localhost:8080`
- headers:

```text
x-login: admin
x-password: 123
```

- ожидается сообщение `WSS connected`;
- сообщение из `body:ws` должно вернуться как echo.

### Проверка `ws-token.bru`

- URL: `wss://localhost:8080`
- headers:

```text
x-token: secret123
```

- ожидается успешное подключение и echo-ответ.

### Проверка `ws-invalid-auth.bru`

- URL: `wss://localhost:8080`
- headers:

```text
x-login: wrong
x-password: wrong
```

- ожидается закрытие соединения с кодом `4001`;
- echo-ответа быть не должно.

## Примеры WSS-подключения

### Node.js: login / password

```js
const WebSocket = require('ws');

const socket = new WebSocket('wss://localhost:8080', {
  rejectUnauthorized: false,
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

### Node.js: token

```js
const WebSocket = require('ws');

const socket = new WebSocket('wss://localhost:8080', {
  rejectUnauthorized: false,
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

### Node.js: invalid auth

```js
const WebSocket = require('ws');

const socket = new WebSocket('wss://localhost:8080', {
  rejectUnauthorized: false,
  headers: {
    'x-login': 'wrong',
    'x-password': 'wrong'
  }
});

socket.on('close', (code, reason) => {
  console.log(code, reason.toString());
});
```

## Как протестировать WSS локально

1. Убедитесь, что `cert/key.pem` и `cert/cert.pem` существуют.
2. Запустите `npm start`.
3. Проверьте открытие `https://localhost:8080`.
4. Подключитесь к `wss://localhost:8080` через:
   - браузерный UI;
   - Bruno;
   - или Node.js-клиент на `ws`.
5. Если клиент строгий к сертификату, для локальной проверки используйте локальное доверие сертификату или временно отключите проверку только в dev-сценарии.

## Инструкции для Windows

### Запуск

```powershell
cd "E:\PRJ\KFU2026Ekb\PlanA\Raund2"
npm install
powershell -ExecutionPolicy Bypass -File .\generate-cert.ps1
npm start
```

### Как импортировать cert.pem в доверенные сертификаты Windows

Через `certmgr.msc`:

1. Нажмите `Win + R`.
2. Введите `certmgr.msc`.
3. Откройте `Доверенные корневые центры сертификации` -> `Сертификаты`.
4. Правой кнопкой -> `Все задачи` -> `Импорт`.
5. Укажите файл `cert.pem`.
6. Оставьте хранилище `Доверенные корневые центры сертификации`.
7. Завершите импорт.

Если 1С работает не от текущего пользователя, а как служба или под другим пользователем, лучше импортировать в хранилище компьютера:

1. Нажмите `Win + R`.
2. Введите `mmc`.
3. `Файл` -> `Добавить или удалить оснастку`.
4. Выберите `Сертификаты` -> `Добавить`.
5. Выберите `Учетная запись компьютера`.
6. Дальше: `Локальный компьютер`.
7. Откройте `Сертификаты (локальный компьютер)` -> `Доверенные корневые центры сертификации` -> `Сертификаты`.
8. Импортируйте туда тот же `cert.pem`.

### Разрешить self-signed certificate в браузере

1. Откройте `https://localhost:8080`.
2. На странице предупреждения выберите переход на сайт вручную.
3. После этого повторите подключение к `wss://localhost:8080` из `index.html`.

### Проверка после импорта сертификата

1. После импорта откройте `https://localhost:8080`.
2. Если браузер больше не ругается на сертификат, это хороший знак.
3. Потом перезапустите 1С и попробуйте `wss` снова.

## Возможные ошибки

### Browser blocks self-signed certificate

Причина:

- браузер не доверяет локальному self-signed certificate.

Что делать:

1. Откройте `https://localhost:8080`.
2. Подтвердите переход на сайт вручную.
3. Перезагрузите страницу и повторите WSS-подключение.

### Missing `cert/key.pem`

Причина:

- отсутствует закрытый ключ для HTTPS/WSS.

Что делать:

```powershell
cd "E:\PRJ\KFU2026Ekb\PlanA\Raund2"
powershell -ExecutionPolicy Bypass -File .\generate-cert.ps1
```

### Missing `cert/cert.pem`

Причина:

- отсутствует сертификат для HTTPS/WSS.

Что делать:

```powershell
cd "E:\PRJ\KFU2026Ekb\PlanA\Raund2"
powershell -ExecutionPolicy Bypass -File .\generate-cert.ps1
```

### Bruno certificate trust issues

Причина:

- Bruno не доверяет self-signed certificate автоматически.

Что делать:

- разрешите локальный сертификат в настройках Bruno, если нужно;
- либо импортируйте сертификат в локальное доверенное окружение;
- затем повторите запрос к `wss://localhost:8080`.

### Port 8080 already in use

Причина:

- другой процесс уже слушает порт `8080`.

Что делать:

- остановите конфликтующий процесс;
- либо освободите порт `8080`;
- затем снова запустите `npm start`.

## Краткий сценарий запуска

```powershell
cd "E:\PRJ\KFU2026Ekb\PlanA\Raund2"
npm install
npm start
```

## Результат

После запуска проект предоставляет:

- HTTPS-страницу: `https://localhost:8080`
- WSS echo-сервер: `wss://localhost:8080`
- авторизацию через headers для Bruno и Node.js
- token auth
- login/password auth
- Bruno collection
- `index.html` клиент
