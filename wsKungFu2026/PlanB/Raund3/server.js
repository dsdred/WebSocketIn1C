const WebSocket = require('ws');

const PORT = Number(process.env.PORT) || 8080;
const wss = new WebSocket.Server({ port: PORT });
const clients = new Map();

let clientCounter = 0;

function log(message, details) {
  if (typeof details === 'undefined') {
    console.log(`[server] ${message}`);
    return;
  }

  console.log(`[server] ${message}`, details);
}

function createClientId() {
  clientCounter += 1;
  return `client-${clientCounter}`;
}

function getClientIds() {
  return Array.from(clients.keys());
}

function getPayloadText(payload) {
  if (typeof payload.message !== 'undefined') {
    return String(payload.message ?? '');
  }

  if (typeof payload.text !== 'undefined') {
    return String(payload.text ?? '');
  }

  return '';
}

function getTargetClientId(payload) {
  if (typeof payload.to === 'string') {
    return payload.to.trim();
  }

  if (typeof payload.targetClientId === 'string') {
    return payload.targetClientId.trim();
  }

  return '';
}

function sendJson(socket, payload) {
  if (socket.readyState !== WebSocket.OPEN) {
    return;
  }

  socket.send(JSON.stringify(payload));
}

function sendError(socket, message, extra = {}) {
  const payload = {
    type: 'error',
    message,
    ...extra
  };

  log('error', payload);
  sendJson(socket, payload);
}

function broadcast(payload) {
  const message = JSON.stringify(payload);

  for (const socket of clients.values()) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(message);
    }
  }
}

function broadcastClients() {
  const payload = {
    type: 'clients',
    clients: getClientIds()
  };

  log('clients list updated', payload.clients);
  broadcast(payload);
}

function handleBroadcast(fromClientId, payload) {
  const messageText = getPayloadText(payload);
  const messagePayload = {
    type: 'message',
    mode: 'broadcast',
    from: fromClientId,
    to: 'all',
    message: messageText,
    text: messageText,
    timestamp: new Date().toISOString()
  };

  log('broadcast', messagePayload);
  broadcast(messagePayload);
}

function handlePrivate(fromClientId, payload, senderSocket) {
  const targetClientId = getTargetClientId(payload);
  const targetSocket = clients.get(targetClientId);

  if (!targetSocket) {
    sendError(senderSocket, 'Client not found', { targetClientId });
    return;
  }

  const messageText = getPayloadText(payload);
  const messagePayload = {
    type: 'message',
    mode: 'private',
    from: fromClientId,
    to: targetClientId,
    message: messageText,
    text: messageText,
    timestamp: new Date().toISOString()
  };

  log('private message', messagePayload);
  sendJson(targetSocket, messagePayload);

  if (targetSocket !== senderSocket) {
    sendJson(senderSocket, messagePayload);
  }
}

function routeIncomingMessage(clientId, payload, socket) {
  if (payload.type === 'broadcast') {
    handleBroadcast(clientId, payload);
    return;
  }

  if (payload.type === 'private') {
    handlePrivate(clientId, payload, socket);
    return;
  }

  if (payload.type === 'message') {
    const targetClientId = getTargetClientId(payload);

    if (!targetClientId || targetClientId === 'all') {
      handleBroadcast(clientId, payload);
      return;
    }

    handlePrivate(clientId, payload, socket);
    return;
  }

  sendError(socket, 'Unknown message type');
}

wss.on('connection', (socket) => {
  const clientId = createClientId();

  clients.set(clientId, socket);
  log('client connected', clientId);

  sendJson(socket, {
    type: 'welcome',
    clientId,
    clients: getClientIds()
  });

  broadcastClients();

  socket.on('message', (rawMessage) => {
    const text = rawMessage.toString();
    log(`message received from ${clientId}`, text);

    let payload;

    try {
      payload = JSON.parse(text);
    } catch (error) {
      sendError(socket, 'Invalid JSON');
      return;
    }

    if (!payload || typeof payload !== 'object') {
      sendError(socket, 'Unknown message type');
      return;
    }

    routeIncomingMessage(clientId, payload, socket);
  });

  socket.on('close', () => {
    clients.delete(clientId);
    log('client disconnected', clientId);
    broadcastClients();
  });

  socket.on('error', (error) => {
    log(`socket error for ${clientId}`, error.message);
  });
});

wss.on('listening', () => {
  log(`WebSocket server is listening on ws://localhost:${PORT}`);
});

wss.on('error', (error) => {
  log('server error', error.message);
});
