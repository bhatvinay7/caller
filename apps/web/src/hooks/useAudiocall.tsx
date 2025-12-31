"use client";

import { Socket } from "socket.io-client";
import { useRef, useCallback, RefObject } from "react";
import { getAudioStream } from "../webRtc/getStreamAccess";
import { createPeerConnection } from "../webRtc/connect-to-peer";
import { iceconfig } from "../webRtc/connection";
import useSocketConnection from "../hooks/useSocket";
import useUserDetail from "../hooks/usegetUserInfo"
export type UseAudioCallReturn = {
  startCall: (remoteAudioRef: RefObject<HTMLAudioElement>) => Promise<void>;
  addRemoteIce: (candidate: RTCIceCandidateInit) => Promise<void>;
  pcRef: React.RefObject<RTCPeerConnection | null>;
  socket: Socket | null;
};
export default function useAudioCall(channelId: string, receiverId: string): UseAudioCallReturn {
  const user = useUserDetail()
  const pcRef = useRef<RTCPeerConnection | null>(null);

  function receiveMessage(payload: { message: string; type: string }) {
    console.log(payload);
  }

  const { socket } = useSocketConnection(channelId, receiveMessage, user);

  const startCall = useCallback(
    async (remoteAudioRef: RefObject<HTMLAudioElement>) => {
      if (!socket) return;

      const localStream = await getAudioStream();
      if (!localStream) return;

      const { pc, createOfferAndSend, addIceCandidate } =
        createPeerConnection(iceconfig, socket, localStream, user, receiverId);

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

  const endCall = useCallback(async () => {
    console.log("Ending call");
    try {
      // 1. Stop local media tracks
      const streams = await getAudioStream();
      if (streams) {
        const tracks = streams.getTracks()
        tracks?.forEach(track => {
          track.stop(); // stop each track
        });
      }
      // 2. Close PeerConnection
      if (pcRef.current) {

        pcRef.current.onicecandidate = null;
        pcRef.current.ontrack = null;

        pcRef.current.getSenders().forEach(sender => {
          pcRef?.current?.removeTrack(sender);
        });

        pcRef.current.close();
        pcRef.current = null;


        // 3. (Optional) notify remote peer
        if (socket) {
          socket.emit("end-call", channelId);
        }
      }
    }
    catch (error: any) {
      console.log(`Error-->${error.message}`)
    }
  }, []);

  const addRemoteIce = useCallback(async (candidate: RTCIceCandidateInit) => {
    if (pcRef.current) {
      await pcRef.current.addIceCandidate(candidate);
    }
  }, []);

  return { startCall, addRemoteIce, pcRef, socket };
}
