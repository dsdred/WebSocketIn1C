const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3003 });

wss.on('connection', (ws) => {
  ws.isAuthorized = false;

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (!ws.isAuthorized) {
      if (data.type === "auth" && validateToken(data.token)) {
        ws.isAuthorized = true;
        ws.send(JSON.stringify({ type: "auth_success" }));
      } else {
        ws.close(4001, "Unauthorized");
      }
    }
    // Обработка других сообщений только если авторизован
    if (ws.isAuthorized) {
      // ...
    }
  });
});

function validateToken(token) {
  // Ваша логика проверки JWT
  return token === "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30"; // пример
}