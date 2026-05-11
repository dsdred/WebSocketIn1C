# Bruno WebSocket Collection

## Как открыть коллекцию

1. Откройте Bruno.
2. Выберите `Open Collection`.
3. Укажите папку `E:\PRJ\KFU2026Ekb\PlanA\Raund3\bruno`.

Bruno прочитает `bruno.json` и покажет WebSocket-запросы коллекции.

## Что важно знать

- Каждый `.bru` в этой коллекции имеет `meta { type: ws }`, то есть это именно WebSocket-запросы, а не HTTP/REST.
- Каждый WebSocket request в Bruno открывает отдельную WS-сессию.
- `clientId` назначается сервером в момент подключения.
- Для `private`-сообщения нужно знать актуальный `clientId` клиента, который сейчас подключен.

## Что делает каждый запрос

- `ws-client-a.bru`: открывает отдельную WS-сессию клиента A.
- `ws-client-b.bru`: открывает отдельную WS-сессию клиента B.
- `ws-send-all.bru`: отправляет `broadcast` всем подключенным клиентам.
- `ws-send-to-client.bru`: отправляет `private` на `client-1`. При необходимости поменяйте значение `to` на актуальный `clientId`.
- `ws-send-to-missing-client.bru`: отправляет `private` на `client-999` и должен вернуть ошибку `Client not found`.

## Как протестировать broadcast

1. Запустите сервер `npm start`.
2. Откройте `ws-client-a.bru` и подключитесь.
3. Откройте `ws-client-b.bru` и подключитесь.
4. Убедитесь, что оба запроса получили `welcome`, а затем `clients` со списком активных клиентов.
5. Откройте `ws-send-all.bru` и отправьте сообщение.
6. Проверьте, что подключенные сессии получают сообщение вида `type: "message"` и `mode: "broadcast"`.

## Как протестировать private message

1. Подключите минимум две отдельные WS-сессии через `ws-client-a.bru` и `ws-client-b.bru`.
2. Посмотрите, какие `clientId` назначил сервер.
3. Откройте `ws-send-to-client.bru`.
4. Если нужно, замените поле `to` на актуальный `clientId`.
5. Отправьте сообщение и проверьте, что private-сообщение пришло целевому клиенту и отправителю.

## Как протестировать ошибку client not found

1. Запустите `ws-send-to-missing-client.bru`.
2. Отправьте сообщение с `to: "client-999"`.
3. Проверьте, что сервер вернул JSON-ошибку:

```json
{
  "type": "error",
  "message": "Client not found",
  "targetClientId": "client-999"
}
```
