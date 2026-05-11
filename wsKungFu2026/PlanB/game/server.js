"use strict";

const fs = require("fs");
const path = require("path");
const { WebSocketServer, WebSocket } = require("ws");

const configPath = path.join(__dirname, "config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

const port = Number(config.port);
const inactiveTimeoutMs = Number(config.inactiveTimeoutMs);
const pingIntervalMs = Number(config.pingIntervalMs);
const targetScore = Number(config.targetScore);

if (![port, inactiveTimeoutMs, pingIntervalMs, targetScore].every(Number.isFinite)) {
  throw new Error("Config values must be numeric.");
}

let score = 0;

const wss = new WebSocketServer({ port });

function getRandomTeam() {
  return Math.random() < 0.5 ? "plus" : "minus";
}

function markActivity(ws) {
  ws.lastActivityAt = Date.now();
}

function sendJson(ws, payload) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

function broadcast(payload) {
  const message = JSON.stringify(payload);

  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

function sendError(ws, message) {
  sendJson(ws, {
    type: "error",
    message
  });
}

function buildStatePayload() {
  return {
    type: "state",
    score,
    targetScore
  };
}

function announceVictory(winner) {
  broadcast({
    type: "victory",
    winner,
    message: `Команда ${winner} победила!`,
    score,
    targetScore
  });

  score = 0;
  broadcast(buildStatePayload());
}

function applyAction(ws, action) {
  score += action === "plus" ? 1 : -1;
  broadcast(buildStatePayload());

  if (score >= targetScore) {
    announceVictory("plus");
    return;
  }

  if (score <= -targetScore) {
    announceVictory("minus");
  }
}

function handleClientMessage(ws, rawMessage) {
  let payload;

  try {
    payload = JSON.parse(rawMessage.toString());
  } catch (error) {
    sendError(ws, "Invalid JSON.");
    return;
  }

  if (!payload || typeof payload !== "object") {
    sendError(ws, "Message must be a JSON object.");
    return;
  }

  if (payload.type !== "action") {
    sendError(ws, 'Unsupported message type. Expected "action".');
    return;
  }

  if (payload.action !== "plus" && payload.action !== "minus") {
    sendError(ws, 'Unsupported action. Expected "plus" or "minus".');
    return;
  }

  markActivity(ws);
  applyAction(ws, payload.action);
}

function terminateInactiveClients() {
  const now = Date.now();

  for (const client of wss.clients) {
    if (now - client.lastActivityAt > inactiveTimeoutMs) {
      console.log(`Closing inactive client (${client.team}) after ${inactiveTimeoutMs}ms.`);

      if (client.readyState === WebSocket.OPEN || client.readyState === WebSocket.CLOSING) {
        client.close(4000, "Inactive timeout");
      } else {
        client.terminate();
      }
    }
  }
}

function pingClients() {
  for (const client of wss.clients) {
    if (client.isAlive === false) {
      console.log(`Terminating unresponsive client (${client.team}).`);
      client.terminate();
      continue;
    }

    client.isAlive = false;
    client.ping();
  }
}

wss.on("connection", (ws) => {
  ws.team = getRandomTeam();
  ws.isAlive = true;
  markActivity(ws);

  console.log(`Client connected to team ${ws.team}.`);

  ws.on("pong", () => {
    ws.isAlive = true;
    markActivity(ws);
  });

  ws.on("message", (message) => {
    handleClientMessage(ws, message);
  });

  ws.on("close", (code, reasonBuffer) => {
    const reason = reasonBuffer.toString() || "no reason";
    console.log(`Client ${ws.team} disconnected. Code: ${code}. Reason: ${reason}.`);
  });

  ws.on("error", (error) => {
    console.error(`Client ${ws.team} error:`, error.message);
  });

  sendJson(ws, {
    type: "welcome",
    team: ws.team,
    score,
    targetScore
  });
});

const pingInterval = setInterval(pingClients, pingIntervalMs);
const inactivityCheckInterval = setInterval(
  terminateInactiveClients,
  Math.max(1000, Math.min(pingIntervalMs, inactiveTimeoutMs))
);

wss.on("listening", () => {
  console.log(`WebSocket server is running on ws://localhost:${port}`);
});

wss.on("close", () => {
  clearInterval(pingInterval);
  clearInterval(inactivityCheckInterval);
});

process.on("SIGINT", () => {
  console.log("Shutting down server...");
  clearInterval(pingInterval);
  clearInterval(inactivityCheckInterval);
  wss.close(() => process.exit(0));
});
