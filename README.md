# WebSocketIn1C
[![OpenYellow](https://img.shields.io/endpoint?url=https://openyellow.org/data/badges/6/916237291.json)](https://openyellow.org/grid?data=top&repo=916237291)

Материалы для повторения действий из статей про WebSockets

![Infostart](https://raw.githubusercontent.com/dsdred/PAPI-tools/2febc0e31c3ef04eb9277150f1488b9f1b26164f/assets/img/svg/infostartlogo.svg)

[Поинтегрируем: WebSocket’ы в платформе 1С. Часть 1](https://infostart.ru/1c/articles/2280032/)

- *WebSocket server* - wsPart1\src\wsServer
- *Конфигурация 1С* - wsPart1\src\1СConf
- *Обработка отправки сообщения* - wsPart1\src\1CDataProcessors\1Shot

---

[Поинтегрируем: WebSocket’ы в платформе 1С. Часть 2](https://infostart.ru/1c/articles/2293957/)

- *Пример клиентской и серверной части Socket.IO* - wsPart2\src\socketio
- *WebSocket server* - wsPart2\src\wsServer
- *WebSocket client на HTML\JS* - wsPart2\src\wsClient
- *Конфигурация 1С* - wsPart2\src\1СConf

---

[Infostart Tech Event 2025. Материалы к докладу "WebSocket'ы — это не больно"](https://event.infostart.ru/2025/agenda/2458720/)

- *WebSocket server* - wsEvent\src\wsServer
- *Конфигурация 1С с примерами в обаботках* - wsEvent\src\1СConf
    - Обработка "StandardWebSocketClients" - Стандартная оработка выдернута из платфрормы 8.3.27
    - Обработка "wsАвторизация" - обработка с примером использования WebSocket-клиент из расширения
    - Обработка "wsДинамический" - обработка с примером программного создания WebSocket соединений на сервере и на клиенте
    - Обработка "СоединенияВебсокетов" - позволяет получать все запущенные сеансы на клиенте и на сервере. Позволяет завершать сеансы.
- *Расшиерение 1С* - wsEvent\src\1СExt

---


**Команды**

- Установка установщика пакетов [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

*npm install -g npm*

- Установка пакета [ws](https://www.npmjs.com/package/ws)

*npm install ws*

- Установка пакета [socket.io](https://socket.io/docs/v4/server-installation/)

*npm install socket.io*

- Запуск WebSocket сервера [nodejs](https://nodejs.org/)

*node index.js*

---


Продолжение следует...
