const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const messages = [];

io.on('connection', (userConnection) => {
    userConnection.emit('connection', JSON.stringify(messages));

    userConnection.on('user_message', (message) => {
        messages.push(message);
        io.emit("user_message", message.toString());
    });
});


server.listen(3001, () => {
    console.log('listening on *:3001');
});