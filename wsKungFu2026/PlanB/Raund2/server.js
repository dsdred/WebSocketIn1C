const fs = require('fs');
const https = require('https');
const path = require('path');
const WebSocket = require('ws');

const PORT = 8080;
const VALID_LOGIN = 'admin';
const VALID_PASSWORD = '123';
const VALID_TOKEN = 'secret123';

const CERT_DIR = path.join(__dirname, 'cert');
const KEY_PATH = path.join(CERT_DIR, 'key.pem');
const CERT_PATH = path.join(CERT_DIR, 'cert.pem');
const INDEX_PATH = path.join(__dirname, 'index.html');

const timestamp = () => new Date().toISOString();

const log = (scope, message, extra) => {
  const prefix = `[${timestamp()}] [${scope}] ${message}`;

  if (typeof extra === 'undefined') {
    console.log(prefix);
    return;
  }

  console.log(prefix, extra);
};

const getHeaderSnapshot = (headers) => ({
  'x-login': headers['x-login'] || null,
  'x-password': headers['x-password'] ? '***' : null,
  'x-token': headers['x-token'] ? '***' : null,
  'sec-websocket-protocol': headers['sec-websocket-protocol'] || null,
  origin: headers.origin || null,
  'user-agent': headers['user-agent'] || null
});

const parseBrowserProtocolAuth = (protocolHeader = '') => {
  const protocols = protocolHeader
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  for (const protocol of protocols) {
    const parts = protocol.split('.');

    if (parts.length === 4 && parts[0] === 'demo' && parts[1] === 'login') {
      return {
        type: 'browser-login-password',
        login: parts[2],
        password: parts[3]
      };
    }

    if (parts.length === 3 && parts[0] === 'demo' && parts[1] === 'token') {
      return {
        type: 'browser-token',
        token: parts[2]
      };
    }
  }

  return null;
};

const authorize = (headers) => {
  const loginHeader = headers['x-login'];
  const passwordHeader = headers['x-password'];
  const tokenHeader = headers['x-token'];

  /*
    The primary authentication flow remains header-based:
    1. x-login + x-password
    2. x-token

    Browser WebSocket API cannot send arbitrary custom headers, so the
    built-in HTML client uses Sec-WebSocket-Protocol as a compatibility
    fallback. Bruno and Node.js clients still authenticate via x-* headers.
  */
  if (typeof loginHeader !== 'undefined' || typeof passwordHeader !== 'undefined') {
    if (loginHeader === VALID_LOGIN && passwordHeader === VALID_PASSWORD) {
      return {
        ok: true,
        method: 'login/password'
      };
    }

    return {
      ok: false,
      reason: 'Invalid x-login or x-password header'
    };
  }

  if (typeof tokenHeader !== 'undefined') {
    if (tokenHeader === VALID_TOKEN) {
      return {
        ok: true,
        method: 'token'
      };
    }

    return {
      ok: false,
      reason: 'Invalid x-token header'
    };
  }

  const browserAuth = parseBrowserProtocolAuth(headers['sec-websocket-protocol']);

  if (browserAuth) {
    if (
      browserAuth.type === 'browser-login-password' &&
      browserAuth.login === VALID_LOGIN &&
      browserAuth.password === VALID_PASSWORD
    ) {
      return {
        ok: true,
        method: 'browser subprotocol login/password'
      };
    }

    if (browserAuth.type === 'browser-token' && browserAuth.token === VALID_TOKEN) {
      return {
        ok: true,
        method: 'browser subprotocol token'
      };
    }

    return {
      ok: false,
      reason: 'Invalid browser subprotocol credentials'
    };
  }

  return {
    ok: false,
    reason: 'Missing authentication headers'
  };
};

const ensureCertificates = () => {
  const missingFiles = [KEY_PATH, CERT_PATH].filter((filePath) => !fs.existsSync(filePath));

  if (missingFiles.length === 0) {
    return;
  }

  for (const filePath of missingFiles) {
    log('startup', `Missing certificate file: ${filePath}`);
  }

  log(
    'startup',
    'Generate certificates by running: powershell -ExecutionPolicy Bypass -File .\\generate-cert.ps1'
  );

  process.exit(1);
};

const serveIndex = (res) => {
  fs.readFile(INDEX_PATH, (error, html) => {
    if (error) {
      log('http', `Failed to read index.html: ${error.message}`);
      res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('Failed to load index.html');
      return;
    }

    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(html);
  });
};

ensureCertificates();

const httpsOptions = {
  key: fs.readFileSync(KEY_PATH),
  cert: fs.readFileSync(CERT_PATH)
};

const httpsServer = https.createServer(httpsOptions, (req, res) => {
  const requestUrl = req.url || '/';

  if (req.method === 'GET' && (requestUrl === '/' || requestUrl === '/index.html')) {
    serveIndex(res);
    return;
  }

  res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
  res.end('Not found');
});

const wss = new WebSocket.WebSocketServer({
  server: httpsServer,
  handleProtocols: (protocols) => protocols.values().next().value || false
});

httpsServer.on('error', (error) => {
  log('error', `HTTPS server error: ${error.message}`);
});

httpsServer.listen(PORT, () => {
  log('server', `HTTPS server started on https://localhost:${PORT}`);
  log('server', `WSS echo server started on wss://localhost:${PORT}`);
});

wss.on('connection', (ws, req) => {
  const clientAddress = req.socket.remoteAddress || 'unknown';

  log('connection', `New client connected from ${clientAddress}`);
  log('headers', 'Handshake headers snapshot', getHeaderSnapshot(req.headers));

  const auth = authorize(req.headers);

  if (!auth.ok) {
    log('auth', `Authentication failed for ${clientAddress}: ${auth.reason}`);
    ws.close(4001, 'Unauthorized');
    return;
  }

  log('auth', `Authentication succeeded for ${clientAddress} via ${auth.method}`);

  ws.send(
    JSON.stringify({
      status: 'connected',
      message: 'WSS connected'
    })
  );

  ws.on('message', (data, isBinary) => {
    const payload = isBinary ? data : data.toString();

    log('message', `Received message from ${clientAddress}`, payload);

    ws.send(payload, { binary: isBinary }, (error) => {
      if (error) {
        log('error', `Failed to send echo back to ${clientAddress}: ${error.message}`);
        return;
      }

      log('message', `Echo sent back to ${clientAddress}`, payload);
    });
  });

  ws.on('close', (code, reasonBuffer) => {
    const reason = reasonBuffer.toString() || 'no reason provided';
    log('connection', `Client disconnected from ${clientAddress}. Code: ${code}. Reason: ${reason}`);
  });

  ws.on('error', (error) => {
    log('error', `WebSocket error for ${clientAddress}: ${error.message}`);
  });
});

wss.on('error', (error) => {
  log('error', `WSS server error: ${error.message}`);
});
