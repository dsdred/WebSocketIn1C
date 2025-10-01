const WebSocket = require('ws');
const url = require('url');

const wss = new WebSocket.Server({ port: 3001 });

// Graceful shutdown
process.on('SIGINT', () => {
  wss.clients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.close(1000, 'Server shutdown');
    }
  });
  wss.close();
  process.exit(0);
});

wss.on('connection', (ws, req) => {
  
  console.log('Client connected', req.url);

  // Get Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !validateBasicAuth(authHeader)) {
    console.log('Unauthorized connection attempt');
    ws.close(4001, 'Unauthorized');
    return;
  }

  console.log('Authorized connection attempt')
  ws.on('message', (message) => {
    console.log('Received message:', message);

    if (message === 'close') {
     // if (ws.readyState === WebSocket.OPEN) {
        // Явное закрытие с 1000
        ws.close(1000, 'Client requested close');
     // }
      return;
    }

    // Для демонстрации отправляем обратно
    if (ws.readyState === WebSocket.OPEN) {
      ws.send('Message received: ' + message);
    }
  });
  ws.on('close', (code, reason) => {
    console.log(`Client disconnected. Code: ${code}, Reason: ${reason}`);
  });
  ws.on('error', (error) => console.error('WebSocket error:', error));
  
  // Handle ping/pong for connection health
  ws.isAlive = true;
  ws.on('pong', () => ws.isAlive = true);
  
  ws.send(JSON.stringify({ type: "auth_success" }));

});

function validateBasicAuth(header) {
  if (!header.startsWith('Basic ')) return false;
  
  try {
    // Получаем base64 строку без "Basic "
    const base64Credentials = header.slice(6);
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    
    // credentials в формате "login:password"
    const [login, password] = credentials.split(':');

    // Проверка логина и пароля
    return login === 'myUser' && password === '123';
  } catch (error) {
    console.error('Error parsing Basic auth:', error);
    return false;
  }
}