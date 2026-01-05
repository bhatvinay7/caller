"use client";
import { useEffect, useRef, useCallback, useState } from "react";
import { Socket } from "socket.io-client";
import useUserDetail from './usegetUserInfo';
import useUserAction from "./useUserAction";
import { useConnectionPeer, UseConnectionPeerReturn } from "./webRtc/useConnectpeer";
import { useDispatch } from "react-redux";
import { setIncomingCall, setUserAction } from "../lib/redux/featuresSlice/userActionSlice";
import { useSocket } from "../context/SocketContext";

export type Message = { message: string; toUser: string; type: string; sentAt: string };

export default function useSocketConnection(channelId: string, receiverId: string, receiveMessage: (payload: Message) => void
): {
  socket: Socket | null;
  sendMessage: (payload: { channelId: string, message: string, sentAt: string }) => void;
  endCall: () => void;
} & UseConnectionPeerReturn {
  const { socket } = useSocket();
  const user = useUserDetail();
  const dispatch = useDispatch();

  const handlersRef = useRef({
    receiveMessage,
    handleIceCandidate: (() => { }) as (c: any) => void,
    handleOffer: (() => { }) as (p: any) => void,
    handleAnswer: (() => { }) as (p: any) => void,
    getAction: () => "none" as string,
  });

  const { action } = useUserAction();
  handlersRef.current.getAction = () => action;

  useEffect(() => {
    handlersRef.current.receiveMessage = receiveMessage;
  }, [receiveMessage]);

  const onSignal = useCallback((event: string, payload: any) => {
    if (socket) {
      console.log(`[useSocket] Emitting signal: ${event}`, payload);
      socket.emit(event, payload);
    }
  }, [socket]);
  const onSignalACK = useCallback((event: string, payload: any,ack:(err:any,response:{status:string,message:string})=>void) => {
  if (socket) {
    console.log(`[useSocket] Emitting signal with ack: ${event}`, payload);
    socket.emit(event, payload,ack);
  }
}, [socket]);

  const {
    pc,
    startCall,
    createAnswerAndSend,
    handleIceCandidate,
    handleOffer,
    handleAnswer,
    reSendOffer,
    reSendAnswer,
    stopCall,
  } = useConnectionPeer(
    user,
    receiverId || "",
    channelId,
    onSignal,
    onSignalACK

  );

  useEffect(() => {
    handlersRef.current.handleIceCandidate = handleIceCandidate;
    handlersRef.current.handleOffer = handleOffer;
    handlersRef.current.handleAnswer = handleAnswer;
  }, [handleIceCandidate, handleOffer, handleAnswer]);

  const ringingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reSendIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearRingingTimeout = useCallback(() => {
    if (ringingTimeoutRef.current) {
      clearTimeout(ringingTimeoutRef.current);
      ringingTimeoutRef.current = null;
    }
    if (reSendIntervalRef.current) {
      clearInterval(reSendIntervalRef.current);
      reSendIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.emit("register", {
      userId: user.userId,
      channelId: channelId,
      token: user.token
    });

    socket.on("message", (data: Message) => handlersRef.current.receiveMessage(data));
    socket.on("call", (data: Message) => handlersRef.current.receiveMessage(data));

    socket.on("end-call", (data: Message) => {
      console.log("[useSocket] Received end-call", data);
      clearRingingTimeout();
      stopCall();
      handlersRef.current.receiveMessage(data);
      dispatch(setUserAction("none"));
    });

    socket.on("ice-candidate", (data: any) => {
      handlersRef.current.handleIceCandidate(data.candidate);
    });

    socket.on("offer", (data: any) => {
      console.log("[useSocket] Received offer", data);
      socket.emit("ringing", { toUserId: data.from,channelId });

      dispatch(setIncomingCall({
        from: data.from,
        offer: data.offer,
        channelId: channelId
      }));
      handlersRef.current.handleOffer(data);
    });

    socket.on("ringing", (data: any) => {
      console.log("[useSocket] Receiver is ringing (delivery receipt received)");
      // Clear the re-send interval as we know the user got the popup
      if (reSendIntervalRef.current) {
        clearInterval(reSendIntervalRef.current);
        reSendIntervalRef.current = null;
      }
    });

    socket.on("answer", (data: any) => {
      console.log("[useSocket] Received answer", data);
      clearRingingTimeout();
      dispatch(setUserAction("startcall"));
      handlersRef.current.handleAnswer(data);
    });

    socket.on("reject-call", (data: any) => {
      console.log("[useSocket] Received reject-call", data);
      if (data.message === "offline") {
        if (!ringingTimeoutRef.current) {
          ringingTimeoutRef.current = setTimeout(() => {
            dispatch(setUserAction("none"));
            clearRingingTimeout();
          }, 60000);
        }

        // Start re-sending offer every 5s if not already doing so
        if (!reSendIntervalRef.current) {
          reSendIntervalRef.current = setInterval(() => {
            console.log("[useSocket] Re-sending offer to offline user...");
            reSendOffer();
          }, 5000);
        }
      } else {
        clearRingingTimeout();
        stopCall();
        dispatch(setUserAction("endcall"));
      }
      handlersRef.current.receiveMessage(data);
    });

    socket.on("call-active", (data: any) => {
      clearRingingTimeout();
      dispatch(setUserAction("connected"));
    });

    return () => {
      socket.off("message");
      socket.off("call");
      socket.off("end-call");
      socket.off("ice-candidate");
      socket.off("offer");
      socket.off("answer");
      socket.off("reject-call");
      socket.off("call-active");
    };
  }, [socket, user.userId, user.token, channelId, reSendOffer, clearRingingTimeout, dispatch, stopCall]);

  const sendMessage = useCallback(
    (payload: { channelId: string, message: string, sentAt: string }) => {
      socket?.emit("message", { ...payload, toUserId: receiverId, type: "chat" });
    },
    [socket, receiverId]
  );

  const endCall = useCallback(() => {
    console.log("[useSocket] Initiating endCall");
    clearRingingTimeout();
    stopCall();
    socket?.emit("end-call", { channelId, toUserId: receiverId });
    dispatch(setUserAction("none"));
  }, [socket, channelId, receiverId, clearRingingTimeout, stopCall, dispatch]);

  return {
    socket,
    pc,
    startCall,
    createAnswerAndSend,
    handleIceCandidate,
    handleOffer,
    handleAnswer,
    stopCall,
    endCall,
    reSendOffer,
    reSendAnswer,
    sendMessage
  };
}
