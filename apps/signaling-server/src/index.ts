import express from 'express';
import { createServer } from 'node:http';
import { Server, Socket } from 'socket.io';
const PORT = 8080
const app = express();
const server = createServer(app);
const io = new Server(server, {
  pingInterval: 25000,
  pingTimeout: 15000
},);

const userSocketMap = new Map<string, Socket>()
const socketUserMap = new Map<Socket, string>()
const chatRooms = new Map<string, Set<string>>()
io.on("connection", (socket: Socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("register", ({ userId, channelId }: { userId: string, channelId: string }) => {


    userSocketMap.set(userId, socket);
    socketUserMap.set(socket, userId);
    if (channelId) {
      if (!chatRooms.has(channelId)) {
        chatRooms.set(channelId, new Set());
      }
      chatRooms.get(channelId)!.add(userId);

      socket.join(channelId);
    }
  });

  socket.on("call", ({ toUserId, offer }: { toUserId: string; offer: RTCSessionDescriptionInit }) => {
    const targetSocket = userSocketMap.get(toUserId);

    if (targetSocket) {
      targetSocket.emit("incoming-call", {
        from: socketUserMap.get(socket),
        offer,
      });
    }
  });

  socket.on("disconnect", () => {
    const userId = socketUserMap.get(socket);

    if (userId) {
      userSocketMap.delete(userId);
      socketUserMap.delete(socket);
      for (const users of chatRooms.values()) {

        users?.delete(userId);
      }
    }
    console.log("Socket disconnected:", socket.id);
  });
});


server.listen(PORT, () => {
  console.log(`server running at ${PORT}`);
});