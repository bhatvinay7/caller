"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import useUserDetail from "../hooks/usegetUserInfo";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL!;

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const user = useUserDetail();
    const registeredRef = useRef(false);

    useEffect(() => {
        if (!user.token || !user.userId) return;

        const s = io(SOCKET_URL, {
            transports: ["websocket"],
            autoConnect: true,
        });

        s.on("connect", () => {
            console.log("[SocketContext] Connected to signaling server");
            setIsConnected(true);
            s.emit("register", {
                userId: user.userId,
                token: user.token,
            });
            registeredRef.current = true;
        });

        s.on("disconnect", () => {
            console.log("[SocketContext] Disconnected from signaling server");
            setIsConnected(false);
            registeredRef.current = false;
        });

        const heartbeatInterval = setInterval(() => {
            if (s.connected) {
                // console.log("[SocketContext] Sending heartbeat");
                s.emit("heartbeat", { userId: user.userId });
            }
        }, 5000);

        setSocket(s);

        return () => {
            clearInterval(heartbeatInterval);
            s.disconnect();
        };
    }, [user.userId, user.token]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
