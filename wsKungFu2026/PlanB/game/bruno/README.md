# Bruno WebSocket Collection

Коллекция в папке `bruno/` предназначена для ручного тестирования WebSocket-сервера игры через Bruno.

## Как открыть collection

1. Откройте Bruno.
2. Выберите `Open Collection`.
3. Укажите папку:

```text
E:\PRJ\KFU2026Ekb\PlanA\game\bruno
```

Bruno автоматически подхватит файл `bruno.json`.

## Как запускать WebSocket requests

- Все `.bru` в этой коллекции созданы как WebSocket requests.
- В каждом файле используется `meta { type: ws }`.
- Адрес подключения во всех запросах: `ws://localhost:8080`.
- Перед запуском запросов поднимите сервер командой `npm start`.

## Что делает каждый запрос

- `ws-connect-player-a.bru` — открывает отдельную WebSocket-сессию игрока A и показывает `welcome`.
- `ws-connect-player-b.bru` — открывает отдельную WebSocket-сессию игрока B и показывает `welcome`.
- `ws-plus-action.bru` — открывает отдельную WebSocket-сессию и отправляет действие `plus`.
- `ws-minus-action.bru` — открывает отдельную WebSocket-сессию и отправляет действие `minus`.
- `ws-invalid-message.bru` — открывает отдельную WebSocket-сессию и отправляет невалидное по протоколу сообщение для проверки `error`.

## Важное поведение Bruno

Каждый Bruno request открывает отдельную WebSocket session. Это значит, что:

- `ws-connect-player-a.bru` и `ws-connect-player-b.bru` не делят одну и ту же сессию между собой.
- `ws-plus-action.bru` и `ws-minus-action.bru` тоже работают как отдельные подключения.
- Для наблюдения общего `score` удобно держать открытыми Bruno-запросы на подключение и параллельно открыть один или несколько `public/index.html` в браузере.

## Как тестировать plus/minus actions

1. Запустите сервер `npm start`.
2. Откройте в Bruno `ws-connect-player-a.bru` и `ws-connect-player-b.bru`, чтобы наблюдать ответы сервера.
3. Запускайте `ws-plus-action.bru` и `ws-minus-action.bru`.
4. Убедитесь, что сервер возвращает `state`, а общий `score` меняется.
5. Проверьте в браузерном клиенте, что обновление счёта видно всем подключённым окнам.

## Как тестировать ошибки

1. Запустите `ws-invalid-message.bru`.
2. Убедитесь, что сервер отвечает JSON-сообщением вида:

```json
{
  "type": "error",
  "message": "..."
}
```

## Как наблюдать обновление score

- Откройте несколько локальных окон `public/index.html`.
- Дополнительно держите открытыми `ws-connect-player-a.bru` и `ws-connect-player-b.bru`.
- Отправляйте `plus` и `minus` через Bruno.
- Проверяйте, что все подключённые клиенты получают одинаковые `state` и событие `victory`, когда счёт достигает цели.
