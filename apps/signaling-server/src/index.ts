import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
const PORT=8080
const app = express();
const server = createServer(app);
const io = new Server(server);


io.on('connection', (socket) => {
  console.log('a user connected');
});

server.listen(PORT, () => {
  console.log(`server running at ${PORT}`);
});