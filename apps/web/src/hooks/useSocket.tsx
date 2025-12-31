"use client";
import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import useUserDetail from "./usegetUserInfo";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL!;

type Message = { message: string; type: string };

const MAX_RETRY = 10;
const BASE_DELAY = 2000;
const MAX_DELAY = 30000;

function backOffDelay(retry: number) {
  return Math.min(2 ** retry * BASE_DELAY, MAX_DELAY);
}

export default function useSocketConnection(channelId: string,
    receiveMessage: (payload: Message) => void
  ): {
  socket: Socket | null;
  sendMessage: (payload: { channelId: string; message: string }) => void;
  initiateCall: (payload: {
    channelId: string;
    userId: string;
    sdp?: RTCSessionDescriptionInit;
    iceCandidate?: RTCIceCandidate;
  }) => void;
  sendIceCandidate: (payload: {
    channelId: string;
    userId: string;
    candidate: RTCIceCandidate;
  }) => void;
} {
  const socketRef = useRef<Socket | null>(null);
  const retryRef = useRef(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const user = useUserDetail();

  const connectSocket = useCallback(() => {
    if (!user?.userId) return;
    if (socketRef.current) return;

    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: true,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      retryRef.current = 0;

      socket.emit("register", {
        userId: user.userId,
        channelId: channelId ?? null,
      });
    });

    socket.on("message", (data: Message) => {
      receiveMessage(data);
    });

    socket.on("call", (data: Message) => {
      receiveMessage(data);
    });

    socket.on("end-call", (data: Message) => {
      receiveMessage(data);
    });

    socket.on("ice-candidate", (data: Message) => {
      receiveMessage(data);
    });

    socket.on("disconnect", () => {
      socketRef.current = null;

      if (retryRef.current >= MAX_RETRY) return;

      const delay = backOffDelay(retryRef.current);
      retryRef.current += 1;

      retryTimeoutRef.current = setTimeout(() => {
        connectSocket();
      }, delay);
    });
  }, [user?.userId, channelId]);

  useEffect(() => {
    connectSocket();

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [connectSocket]);

  const sendMessage = useCallback(
    (payload: { channelId: string; message: string }) => {
      socketRef.current?.emit("message", payload);
    },
    []
  );

  const initiateCall = useCallback(
    (payload: {
      channelId: string;
      userId: string;
      sdp?: RTCSessionDescriptionInit;
      iceCandidate?: RTCIceCandidate;
    }) => {
      socketRef.current?.emit("call", payload);
    },
    []
  );

  const sendIceCandidate = useCallback(
    (payload: {
      channelId: string;
      userId: string;
      candidate: RTCIceCandidate;
    }) => {
      socketRef.current?.emit("ice-candidate", payload);
    },
    []
  );

  return {
    socket: socketRef.current,
    sendMessage,
    initiateCall,
    sendIceCandidate,
  };
}
