"use client";

import { Socket } from "socket.io-client";
import { useRef, useCallback, RefObject } from "react";
import { getAudioStream } from "../webRtc/getStreamAccess";
import { createPeerConnection } from "../webRtc/connect-to-peer";
import { iceconfig } from "../webRtc/connection";
import useSocketConnection from "../hooks/useSocket";

export type UseAudioCallReturn = {
  startCall: (remoteAudioRef: RefObject<HTMLAudioElement>) => Promise<void>;
  addRemoteIce: (candidate: RTCIceCandidateInit) => Promise<void>;
  pcRef: React.RefObject<RTCPeerConnection | null>;
  socket: Socket | null;
};

export default function useAudioCall(): UseAudioCallReturn {
  const pcRef = useRef<RTCPeerConnection | null>(null);

  function receiveMessage(payload: { message: string; type: string }) {
    console.log(payload);
  }

  const { socket } = useSocketConnection("6uy47", receiveMessage);

  const startCall = useCallback(
    async (remoteAudioRef: RefObject<HTMLAudioElement>) => {
      if (!socket) return;

      const localStream = await getAudioStream();
      if (!localStream) return;

      const { pc, createOfferAndSend, addIceCandidate } =
        createPeerConnection(iceconfig, socket, localStream);

      pcRef.current = pc;

      pc.ontrack = (event) => {
        if (remoteAudioRef.current && event.streams[0]) {
          remoteAudioRef.current.srcObject = event.streams[0];
        }
      };

      await createOfferAndSend();

      socket.on("ice-candidate", (candidate: RTCIceCandidateInit) => {
        addIceCandidate(candidate);
      });
    },
    [socket]
  );

  const addRemoteIce = useCallback(async (candidate: RTCIceCandidateInit) => {
    if (pcRef.current) {
      await pcRef.current.addIceCandidate(candidate);
    }
  }, []);

  return { startCall, addRemoteIce, pcRef, socket };
}
