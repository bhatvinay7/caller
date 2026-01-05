import express from "express";
import { createServer } from "node:http";
import { Server, Socket } from "socket.io";
import dotenv from "dotenv";
import { authVerify } from "./auth.verify.js";

dotenv.config();

const FRONT_CLIENT_URL = process.env.FRONT_CLIENT_URL!;
const PORT = 8080;

const app = express();
const server = createServer(app);

const Status = ["calling", "ringing", "connecting","disconnected", "connected"] as const;

const io = new Server(server, {
  pingInterval: 25000,
  pingTimeout: 15000,
  cors: {
    origin: [FRONT_CLIENT_URL],
    credentials: true,
  },
});

const userSocketMap = new Map<string, Socket>();
const socketUserMap = new Map<Socket, string>();
const chatRooms = new Map<string, Set<string>>();
const activeCallsMap = new Map<
  string,
  { status: (typeof Status)[number]; startTime: number }
>();

io.on("connection", (socket: Socket) => {
  console.log("Socket connected:", socket.id);

  socket.on(
    "register",
    ({ userId, channelId, token }: { userId: string; channelId: string; token: string }) => {
      try {
        console.log("call verify")
        console.log(userId + " " + channelId)
        if (!token) return;
        authVerify(token);
        console.log(token)
      } catch(error) {
        return;
      }

      userSocketMap.set(userId, socket);
      socketUserMap.set(socket, userId);

      if (channelId) {
        if (!chatRooms.has(channelId)) {
          chatRooms.set(channelId, new Set());
        }
        chatRooms.get(channelId)!.add(userId);
      }
    }
  );
  socket.on("message",({channelId,message,toUser}:{channelId: string, message: string,toUser:string })=>{
   const user=userSocketMap.get(toUser)
   if(user){
    user.emit("message",{channelId,message,toUser,type:"chat"})
   }

  })
  socket.on(
    "offer",
    ({
      toUserId,
      channelId,
      offer,
    }: {
      toUserId: string;
      channelId: string;
      offer: RTCSessionDescriptionInit;
    }) => {
      console.log("user exists inside emit offer")
      const fromUser = socketUserMap.get(socket);
      if (!fromUser) return;

      const targetSocket = userSocketMap.get(toUserId);
      console.log("emit offer")
      if (!targetSocket) {
        userSocketMap
          .get(fromUser)
          ?.emit("reject-call", { message: "offline", type: "reject-call" });
        return;
      }

      activeCallsMap.set(channelId, {
       status: "ringing",
        startTime: Date.now(),
      });

      targetSocket.emit("offer", {
        from: fromUser,
        offer,
      });
    }
  );
// ackCallback:({status,message}:{status: string, message:string})=>void
  socket.on(
    "answer",
    ({
      toUserId,
      channelId,
      answer,
      ackCallback
    }: {
      toUserId: string;
      channelId: string;
      answer: RTCSessionDescriptionInit;
      ackCallback:({status,message}:{status: string, message:string})=>void
    },) => {

      const fromUser = socketUserMap.get(socket);
      console.log("emit answer")
      if (!fromUser) return;

      const targetSocket = userSocketMap.get(toUserId);
      if (!targetSocket) return;
       if (typeof ackCallback === 'function') {
       ackCallback({ status: 'ok', message: 'Server received your asnwer' });
      activeCallsMap.set(channelId, {
        status: "connected",
        startTime: Date.now(),
      });
     
      targetSocket.emit("answer", {
        from: fromUser,
        answer,
      });
}}
  );

  // ---------------- ICE ----------------
  socket.on(
    "ice-candidate",
    ({
      toUserId,
      channelId,
      candidate,
    }: {
      toUserId: string;
      channelId: string;
      candidate: RTCIceCandidateInit;
    }) => {
      const targetSocket = userSocketMap.get(toUserId);
      console.log("call ice-candidate")
      if (!targetSocket) return;

      activeCallsMap.set(channelId, {
        status: "ringing",
        startTime: Date.now(),
      });

      targetSocket.emit("ice-candidate", { candidate });
    }
  );

  socket.on("call", ({ channelId }: { channelId: string }) => {
    if (!activeCallsMap.has(channelId)) return;

    const users = chatRooms.get(channelId);
    if (!users) return;

    activeCallsMap.set(channelId, {
      status: "connected",
      startTime: Date.now(),
    });

    for (const user of users) {
      userSocketMap.get(user)?.emit("call-active", {
        channelId,
        status: activeCallsMap.get(channelId),
      });
    }
  });

  socket.on(
    "reject-call",
    ({ toUserId, message }: { toUserId: string; message?: string }) => {
      const targetSocket = userSocketMap.get(toUserId);
      if (targetSocket) {
        targetSocket.emit("reject-call", {
          from: socketUserMap.get(socket),
          message,
          type: "reject-call",
        });
      }
    }
  );

  socket.on(
    "ringing",
    ({ toUserId,channelId }: { toUserId: string,channelId:string }) => {
      const targetSocket = userSocketMap.get(toUserId);
      if (targetSocket) {
        targetSocket.emit("ringing", {
          from: socketUserMap.get(socket),
        });
          activeCallsMap.set(channelId, {
    status: "ringing",
    startTime: Date.now(),
  });
      }
    }
  );

  socket.on("end-call", (channelId: string) => {
    const users=chatRooms.get(channelId)?.values()
    let usersSentTo = 0;

if (users) {
  for (const userId of users) {
    if (usersSentTo >= 2) {
      break; // Stop after sending to 2 users
    }
    userSocketMap?.get(userId)?.emit("end-call",{action:"endcall",message:"call-ended"} );
    usersSentTo++;
  }
}
    activeCallsMap.delete(channelId);
  });


  socket.on("disconnect", () => {
    const userId = socketUserMap.get(socket);
    if (!userId) return;

    userSocketMap.delete(userId);
    socketUserMap.delete(socket);

    for (const users of chatRooms.values()) {
      users.delete(userId);
    }

    // Cleanup any active call involving this user
    for (const [channelId] of activeCallsMap.entries()) {
      activeCallsMap.delete(channelId);
    }

    console.log("Socket disconnected:", socket.id);
  });

  socket.on("heartbeat", (data: any) => {
    // Just keep the connection active
  });
});

server.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});
