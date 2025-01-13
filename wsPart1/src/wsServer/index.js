// Подключаем библиотеку ws
const WebSocket = require("ws");

// Запускаем WebSocket сервер локально на порту 3001
const server = new WebSocket.Server({
  port: 3001,
});

// Создаем массив для хранения всех сообщений
const messages = [];

// Делаем обработчик для подключения
server.on("connection", (ws) => {
  // Отправляем клиенту все сообщения в формате JSON, которые уже были отправлены
  console.log("Client connected"); // информируем в консоли о новом подключении
  ws.send(JSON.stringify(messages));

  // Делаем обработчик отправки сообщения
  ws.on("message", (message) => {
    // Получаем сообщение в виде строки
    message = message.toString();
    // Добавляем сообщение в конец массива
    messages.push(message);
    // Отправляем все сообщения в формате JSON всем клиентам
    server.clients.forEach((client) => {
      client.send(JSON.stringify(messages));
    });
  });

  // Делаем обработчик при закрытии сессии клиентом
  ws.on("close", () => {
    console.log("Client disconnected"); // информация в консоли о отключении клиента
    // Отправляем всем клиентам что кто-то отключился
    server.clients.forEach((client) => {
      client.send("Client disconnected");
    });
  });
});

// Делаем обработчик ошибок
server.on("error", (error) => {
  console.log(error); // Информация в консоли об ошибке
});

// Делаем обработчик закрытия сессии на сервере
server.on("close", () => {
  // Отправляем всем информацию о закрытии сессии
  server.clients.forEach((client) => {
    client.send("Server closed");
  });

  console.log("Server closed"); //Информация в консоли о закрытии сессии
});
