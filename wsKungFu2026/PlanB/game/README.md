# Mini WebSocket Game

Минимальный demo-проект на Node.js и `ws`: сервер хранит общий `score`, а каждый подключившийся клиент случайно получает команду `plus` или `minus` и влияет на общий счёт одной кнопкой. В проект также добавлена Bruno collection для WebSocket-тестов.

## Структура проекта

```text
PlanA/game
├── bruno
│   ├── bruno.json
│   ├── README.md
│   ├── ws-connect-player-a.bru
│   ├── ws-connect-player-b.bru
│   ├── ws-invalid-message.bru
│   ├── ws-minus-action.bru
│   └── ws-plus-action.bru
├── config.json
├── package.json
├── README.md
├── server.js
└── public
    └── index.html
```

## Установка зависимостей

```powershell
cd "E:\PRJ\KFU2026Ekb\PlanA\game"
npm install
```

## Запуск сервера

```powershell
cd "E:\PRJ\KFU2026Ekb\PlanA\game"
npm start
```

Сервер запускается на адресе `ws://localhost:8080`, если используется конфигурация по умолчанию.

## Открытие клиента

Откройте файл `public/index.html` напрямую из проводника или браузера как `file://.../public/index.html`.

Клиент не требует HTTP-сервера и подключается к:

```js
const WS_URL = "ws://localhost:8080";
```

При открытии страницы клиент подключается автоматически и показывает только важные события: подключение, победу, ошибки и отключение.

Если порт меняется в `config.json`, обновите эту константу в клиенте.

## Описание config.json

```json
{
  "port": 8080,
  "inactiveTimeoutMs": 30000,
  "pingIntervalMs": 10000,
  "targetScore": 100
}
```

- `port` — порт WebSocket-сервера.
- `inactiveTimeoutMs` — время бездействия клиента, после которого соединение закрывается.
- `pingIntervalMs` — интервал ping/pong-проверки.
- `targetScore` — значение счёта, при достижении которого команда побеждает.

## Правила игры

- Сервер хранит один общий `score`, стартовое значение равно `0`.
- При подключении клиент случайно получает команду `plus` или `minus`.
- Команда `plus` в браузерном клиенте отправляет действие `plus` и увеличивает `score` на `1`.
- Команда `minus` в браузерном клиенте отправляет действие `minus` и уменьшает `score` на `1`.
- Когда `score >= targetScore`, побеждает команда `plus`.
- Когда `score <= -targetScore`, побеждает команда `minus`.
- После победы сервер отправляет событие `victory`, затем сбрасывает `score` в `0` и рассылает обновлённое состояние.
- Поздравление в клиенте скрывается после следующего клика по игровой кнопке.

## JSON-протокол

### Welcome

```json
{
  "type": "welcome",
  "team": "plus",
  "score": 0,
  "targetScore": 100
}
```

### State

```json
{
  "type": "state",
  "score": 1,
  "targetScore": 100
}
```

### Action

```json
{
  "type": "action",
  "action": "plus"
}
```

или

```json
{
  "type": "action",
  "action": "minus"
}
```

### Victory

```json
{
  "type": "victory",
  "winner": "plus",
  "message": "Команда plus победила!",
  "score": 100,
  "targetScore": 100
}
```

После `victory` сервер отправляет ещё одно сообщение `state` со сброшенным `score = 0`.

### Error

```json
{
  "type": "error",
  "message": "Описание ошибки"
}
```

## Ping-pong

- Сервер использует `ws.ping()` через интервал `pingIntervalMs`.
- Для каждого клиента хранится флаг `isAlive`.
- При событии `pong` сервер помечает клиента как активного.
- Если клиент не отвечает на ping, сервер завершает соединение через `terminate()`.

## Таймаут неактивности

- Для каждого клиента хранится `lastActivityAt`.
- Время активности обновляется:
  - при подключении;
  - при получении валидного JSON-действия;
  - при получении `pong`.
- Если клиент неактивен дольше `inactiveTimeoutMs`, сервер закрывает соединение с кодом `4000` и причиной `Inactive timeout`.
- Отключение по таймауту логируется в консоль сервера.

## Bruno collection

В папке `bruno/` находится коллекция WebSocket-запросов для Bruno:

- `ws-connect-player-a.bru`
- `ws-connect-player-b.bru`
- `ws-plus-action.bru`
- `ws-minus-action.bru`
- `ws-invalid-message.bru`

Все Bruno-запросы используют именно формат WebSocket request и адрес `ws://localhost:8080`.

Подробнее сценарии описаны в [bruno/README.md](</E:/PRJ/KFU2026Ekb/PlanA/game/bruno/README.md>).

## Как протестировать вручную

1. Перейдите в папку проекта:

   ```powershell
   cd "E:\PRJ\KFU2026Ekb\PlanA\game"
   ```

2. Установите зависимости:

   ```powershell
   npm install
   ```

3. Запустите сервер:

   ```powershell
   npm start
   ```

4. Откройте несколько копий `public/index.html` в браузере.
5. Убедитесь, что страницы автоматически подключаются к серверу и получают случайные команды `plus` и `minus`.
6. Нажимайте `+` и `-` в разных окнах.
7. Проверьте, что `score` обновляется у всех клиентов в реальном времени.
8. Дождитесь победы одной из команд.
9. Убедитесь, что после `victory` счёт сбрасывается в `0`.

## Как протестировать через Bruno

1. Запустите сервер `npm start`.
2. Откройте папку `E:\PRJ\KFU2026Ekb\PlanA\game\bruno` как Bruno collection.
3. Запустите `ws-connect-player-a.bru` и `ws-connect-player-b.bru` для наблюдения за подключениями.
4. Запускайте `ws-plus-action.bru` и `ws-minus-action.bru`, чтобы менять `score`.
5. Запустите `ws-invalid-message.bru`, чтобы проверить обработку ошибок сервера.
6. Для наглядности держите открытыми один или несколько `public/index.html` и наблюдайте входящие `state` и `victory`.

## Возможные ошибки

- `Error: connect ECONNREFUSED 127.0.0.1:8080` — сервер не запущен или указан другой порт.
- `Invalid JSON` — клиент или внешний тест отправили некорректное сообщение.
- `Unsupported message type. Expected "action".` — отправлен JSON не по игровому протоколу.
- `Unsupported action. Expected "plus" or "minus".` — отправлено неизвестное действие.
- Закрытие с кодом `4000` — клиент был неактивен дольше `inactiveTimeoutMs`.
