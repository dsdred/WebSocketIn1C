Скопируй весь проект из папки:

E:\PRJ\KFU2026Ekb\PlanA\Raund1

в новую папку:

E:\PRJ\KFU2026Ekb\PlanA\Raund2

После копирования доработай проект в папке Raund2 так, чтобы он запускался через WSS, а не WS.

Важно:
• Исходную папку Raund1 не изменяй.
• Все изменения выполняй только в папке Raund2.
• Весь функционал должен остаться тем же:
  - WebSocket echo server
  - аутентификация через headers
  - login/password auth
  - token auth
  - index.html клиент
  - Bruno collection
  - README.md

========================
ГЛАВНЫЕ ОГРАНИЧЕНИЯ
========================

• Используй только библиотеку ws.
• НЕ используй:
  - Express
  - Socket.IO
  - Vite
  - Webpack
  - TypeScript
  - дополнительные npm-библиотеки

• Для HTTPS/WSS используй только встроенные Node.js модули:
  - https
  - fs
  - path

• Единственная внешняя зависимость проекта:
  ws

========================
ЧТО НУЖНО СДЕЛАТЬ
========================

1. SERVER.JS
========================

Переделай сервер с ws:// на wss://.

Используй:
• HTTPS server
• библиотеку ws поверх HTTPS

WebSocket должен работать по адресу:

wss://localhost:8080

Порт оставь:
const PORT = 8080

Сохрани:
• echo server
• auth через headers
• logging
• весь существующий функционал

Auth должен продолжать работать через headers:

1. login/password:
x-login: admin
x-password: 123

2. token:
x-token: secret123

НЕ используй query params.

========================
СЕРТИФИКАТЫ
========================

В папке Raund2 обязательно создай папку:

cert/

И ОБЯЗАТЕЛЬНО создай внутри неё файлы:

cert/key.pem
cert/cert.pem

Нельзя ограничиваться только инструкцией в README.md.

Файлы сертификатов должны реально существовать в проекте после выполнения задачи.

Используй self-signed certificate.

Сгенерируй сертификаты автоматически.

Предпочтительно используй OpenSSL команду:

openssl req -x509 -newkey rsa:2048 -nodes ^
  -keyout cert/key.pem ^
  -out cert/cert.pem ^
  -days 365 ^
  -subj "/CN=localhost"

Если OpenSSL недоступен:
• создай PowerShell-скрипт:

generate-cert.ps1

который генерирует:
• cert/key.pem
• cert/cert.pem

После генерации:
• проверь, что файлы реально существуют
• server.js должен использовать именно:
  - cert/key.pem
  - cert/cert.pem

Пример:
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, 'cert/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert/cert.pem'))
};

========================
INDEX.HTML
========================

Обнови клиент:

• заменить:
  ws://localhost:8080

на:
  wss://localhost:8080

Весь UI должен остаться тем же:
• auth form
• login/password
• token auth
• message history
• connect button
• send button

Auth должен остаться через headers.

НЕ используй query params.

========================
BRUNO COLLECTION
========================

Обнови Bruno collection.

Все запросы должны использовать:

wss://localhost:8080

Коллекция должна оставаться именно Bruno WebSocket collection.

НЕ создавай HTTP/REST requests.

Каждый .bru файл должен содержать:

meta {
  type: ws
}

Пример:

meta {
  name: ws-login-pass
  type: ws
  seq: 1
}

ws {
  url: wss://localhost:8080
}

headers {
  x-login: admin
  x-password: 123
}

body:ws {
  name: message 1
  content: '''
Hello from Bruno
'''
}

Создай/обнови:
• ws-login-pass.bru
• ws-token.bru
• ws-invalid-auth.bru

Auth должен использовать только headers.

========================
README.MD
========================

Полностью обнови README.md под WSS версию проекта.

README.md должен содержать:

• описание проекта
• отличие WSS от WS
• структуру проекта
• список файлов
• установку зависимостей
• запуск проекта
• запуск HTTPS/WSS сервера
• описание self-signed certificate
• команды генерации сертификатов
• инструкции для Windows
• как открыть index.html
• как тестировать через Bruno
• примеры auth headers
• примеры подключения:
  wss://localhost:8080

Добавь раздел:
"Возможные ошибки"

Опиши:
• browser blocks self-signed certificate
• missing cert/key.pem
• missing cert/cert.pem
• Bruno certificate trust issues
• port 8080 already in use

Объясни:
• как разрешить self-signed certificate в браузере
• как протестировать WSS локально

========================
PACKAGE.JSON
========================

Проверь package.json.

Должна быть только зависимость:
ws

Добавь scripts:

"scripts": {
  "start": "node server.js"
}

========================
ФИНАЛЬНАЯ ПРОВЕРКА
========================

После выполнения задачи обязательно проверь:

• существует папка:
  cert/

• существуют файлы:
  cert/key.pem
  cert/cert.pem

• server.js запускается

• WSS работает:
  wss://localhost:8080

• Bruno подключается через WSS

• клиент index.html подключается через WSS

• auth через headers работает

========================
ФОРМАТ РЕЗУЛЬТАТА
========================

В результате:
1. Кратко опиши что было сделано
2. Покажи список изменённых файлов
3. Покажи команды запуска:

cd "E:\PRJ\KFU2026Ekb\PlanA\Raund2"
npm install
npm start

4. Покажи как протестировать:
• браузер
• Bruno
• WSS connection

НЕ изменяй Raund1.
Работай только с Raund2.