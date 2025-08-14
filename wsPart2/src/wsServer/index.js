// Подключаем библиотеку ws
const WebSocket = require('ws');
// Запускаем WebSocket сервер локально на порту 3001
const server = new WebSocket.Server({ port: 3001 });

// Словарь для сопоставления userID и WebSocket
const userSockets = {}; 

// Режим с выводом в консоль логов
const debuglog = true;

// Делаем обработчик для подключения
server.on('connection', (ws) => {
  let userID;

  // обработчик сообщений
  ws.on('message', (message) => {
    const data = JSON.parse(message);

    // проверяем сообщение с типом регистрация
    if (data.type === 'register') {
      // При регистрации сохраняем соответствие data.id и ws
      userSockets[data.id] = ws;  
      
      if (debuglog) {
        console.log(`User ${data.id} registered`);
      }    

    // Проверяем сообщение с типом сообщение  
    } else if (data.type === 'message') {
      
      // если кому незаполнен, тогда отправляем всем кроме автора
      if (!data.to) {
        // Отправляем сообщение всем
        for (const id in userSockets) {
          
          // Проверяем, что получатель не совпадает с отправителем
          if (id !== data.from) {
            sendToUser(id, data.from, data.message);
          }
        }
      } else {
        // Отправляем сообщение конкретному пользователю
        sendToUser(data.to, data.from, data.message);
        if (debuglog) {
          console.log(`Message received from ${data.to}: ${data.message}`);
        }
      }

    }
  });

  ws.on('close', () => {
    // Удаляем соединение при отключении
    delete userSockets[userID];

    if (debuglog) {
      console.log(`Connection closed for ${userID}`);
      console.log(userSockets);
    }

  });
});

// Функция для отправки сообщения определенному пользователю
function sendToUser(id, idFrom, message) {
  
  const ws = userSockets[id];

  // проверяем что соединение есть и оно активно
  if (ws && ws.readyState === WebSocket.OPEN) {
    
    const textMessage = `${idFrom}: ${message}`;
    ws.send(textMessage);
    
    if (debuglog) {
      console.log(`Message sent to ${textMessage}`);
    }

  } else {
    
    // Если отправить сообщение неудалось, тогда сообщаем отправителю
    const textERR = `User ${id} not found or not connected`;

    if (debuglog) {
      console.log(textERR);
    }

    // Если нужно сообщение, что юзер не подключен или не найден. Получит отправитель.
    //if (id !== idFrom) {
    //  const senderWs = userSockets[idFrom];
    //  if (senderWs && senderWs.readyState === WebSocket.OPEN) {
    //    senderWs.send(textERR);
    // }
    //}
  }
}