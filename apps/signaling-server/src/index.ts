import express from 'express';
import { createServer } from 'node:http';
import { Server, Socket } from 'socket.io';
import dotenv from "dotenv"
dotenv.config()
const FRONT_CLIENT_URL=process.env.FRONT_CLIENT_URL!
const PORT = 8080
const app = express();
import { authVerify } from './auth.verify';
const server = createServer(app);
const io = new Server(server, {
  pingInterval: 25000,
  pingTimeout: 15000,
  cors: {
    origin: [FRONT_CLIENT_URL],
    credentials: true
  }
},);

const userSocketMap = new Map<string, Socket>()
const socketUserMap = new Map<Socket, string>()
const chatRooms = new Map<string, Set<string>>()
io.on("connection", (socket: Socket) => {
  console.log("Socket connected:", socket.id);
  socket.on("register", ({ userId, channelId,token }: { userId: string, channelId: string,token:string }) => {
    try{
      authVerify(token)
    }
    catch(error){
      userSocketMap.get(userId)?.emit("user is not authenticated")
      return
    }
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