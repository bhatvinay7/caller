import express from 'express';
import { createServer } from 'node:http';
import { Server, Socket } from 'socket.io';
import dotenv from "dotenv"
dotenv.config()
const FRONT_CLIENT_URL = process.env.FRONT_CLIENT_URL!
const PORT = 8080
const app = express();
import { authVerify } from './auth.verify';
const server = createServer(app);
const Status= ["calling","connecting","disconnected","connected"] as const
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
const activeCallsMap=new Map<string,{status:string,startTime:number}>()
io.on("connection", (socket: Socket) => {
  console.log("Socket connected:", socket.id);
  socket.on("register", ({ userId, channelId, token }: { userId: string, channelId: string, token: string }) => {
    try {
      authVerify(token)
    }
    catch (error) {
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
    }
  });
 
  socket.on("offer", ({ callerId,toUserId, offer,channelId }: { toUserId: string,callerId:string,channelId:string,offer: RTCSessionDescriptionInit }) => {
    const targetSocket = userSocketMap.get(toUserId);

    if (targetSocket) {
      activeCallsMap.set(channelId,{status:Status[1],startTime:0})
      targetSocket.emit("answer", {
        from: socketUserMap.get(socket),
        offer,
      });
    }
    else{
     if(userSocketMap.get(callerId)){
      userSocketMap.get(callerId)?.emit("reject-call",{message:"offine", type:"reject-call"})
     } 
    activeCallsMap?.delete(channelId)
    }
    socket.on("ice-candidate", ({ toUserId, channelId,candidate }: { toUserId: string,channelId:string, candidate: RTCIceCandidate }) => {
      const receiverSocket = userSocketMap.get(toUserId)
      if (receiverSocket) {
        activeCallsMap.set(channelId,{status:Status[1],startTime:0})
        receiverSocket.emit("ice-candidate", {
          candidate
        });
      }
    })
    socket.on("call",({channelId,userId}:{channelId:string,userId:string})=>{
      if(activeCallsMap?.get(channelId) && chatRooms.get(channelId)){
       const users=[...chatRooms?.get(channelId)!]
       const callSatus=activeCallsMap.get(channelId)
       activeCallsMap.set(channelId,{status:Status[3],startTime:new Date().getTime()})
       for (const user of users ){
        if(userSocketMap.get(user)){
          userSocketMap.get(user)?.emit("call-active",{userId:user,message:JSON.stringify(activeCallsMap?.get(channelId)?? ""),type:"call-active"})
        }
       }
      }
    })
     socket.on("end-call",(channelId:string)=>{
      if(activeCallsMap.get(channelId)){
        activeCallsMap.delete(channelId)
      }
     })
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
    })
    
  });
})

  server.listen(PORT, () => {
    console.log(`server running at ${PORT}`);
  });