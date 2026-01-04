"use client";
import { useRef, useCallback, RefObject, useEffect } from "react";
import useSocketConnection from './useSocket';
export type UseAudioCallReturn = {
  startCall: (
    remoteAudioRef: RefObject<HTMLAudioElement>,
  ) => Promise<void>;
  answerCall: (remoteAudioRef: RefObject<HTMLAudioElement>) => Promise<void>;
  endCall: () => Promise<void>;
};

import { Message } from "./useSocket"
export default function useAudioCall(
  channelId: string,
  receiverId: string,
): UseAudioCallReturn {

  function receiveMessage(payload: Message) {
    console.log(payload)
  }
  const { socket, startCall, createAnswerAndSend, stopCall, endCall: socketEndCall } = useSocketConnection(channelId, receiverId, receiveMessage);

  const answerCall = useCallback(async (remoteAudioRef: RefObject<HTMLAudioElement>) => {
    console.log("[useAudioCall] answerCall called");
    await createAnswerAndSend(remoteAudioRef);
  }, [createAnswerAndSend]);

  const startCallWithLog = useCallback(async (remoteAudioRef: RefObject<HTMLAudioElement>) => {
    console.log("[useAudioCall] startCall called");
    await startCall(remoteAudioRef);
  }, [startCall]);

  const endCall = useCallback(async () => {
    console.log("[useAudioCall] Initiating endCall");
    socketEndCall();
  }, [socketEndCall]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      socket?.off("ice-candidate");
    };
  }, [socket]);

  return { startCall: startCallWithLog, answerCall, endCall };
}
