"use client";
import { useEffect, useRef, useCallback, RefObject, useState } from "react";
import { userCredentials } from "types";
import { useIceConfig } from "./useIConnection";
import { getAudioStream } from "../../lib/getAudioStream";
import useUserAction from "../../hooks/useUserAction"
type OfferPayload = {
  caller: string;
  offer: RTCSessionDescriptionInit;
};

type AnswerPayload = {
  caller: string;
  answer: RTCSessionDescriptionInit;
};

export type UseConnectionPeerReturn = {
  pc: RTCPeerConnection | null;
  startCall: (
    remoteAudioRef: RefObject<HTMLAudioElement>,
  ) => Promise<void>;
  createAnswerAndSend: (
    remoteAudioRef: RefObject<HTMLAudioElement>
  ) => Promise<void>;
  handleIceCandidate: (candidate: RTCIceCandidateInit) => Promise<void>;
  handleOffer: (payload: OfferPayload) => Promise<void>;
  handleAnswer: (payload: AnswerPayload) => Promise<void>;
  stopCall: () => void;
  reSendOffer: () => void;
  reSendAnswer: () => void;
};

export function useConnectionPeer(
  user: userCredentials,
  receiverId: string,
  channelId: string,
  onSignal: (event: string, payload: any) => void,
  onSignalACK:(event:string,payload:any,ack:(err:any,response:{status:string,message:string})=>void)=>void
): UseConnectionPeerReturn {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const pendingIceRef = useRef<RTCIceCandidateInit[]>([]);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRefInt = useRef<RefObject<HTMLAudioElement> | null>(null);
  const onSignalRef = useRef(onSignal);
  const { action } = useUserAction()
  const lastOfferRef = useRef<RTCSessionDescriptionInit | null>(null);
   const lastAnswerRef = useRef<RTCSessionDescriptionInit | null>(null);
  const reTryIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const iceConfig = useIceConfig();
  const [sessionKey, setSessionKey] = useState(0);
  const answerRetryCountRef = useRef(0);
  const isAnswerInFlightRef = useRef(false);
  const MAX_RETRIES = 3;

  useEffect(() => {
    onSignalRef.current = onSignal;
  }, [onSignal]);

  useEffect(() => {
    if (pcRef.current) return;

    let mounted = true;

    try {
      const init = async () => {
        const pc = new RTCPeerConnection(iceConfig);
        pcRef.current = pc;

        pc.onicecandidate = event => {
          if (event.candidate) {
            console.log("[useConnectionPeer] Generated ICE candidate", event.candidate);
            onSignalRef.current("ice-candidate", {
              toUserId: receiverId,
              channelId,
              candidate: event.candidate.toJSON(),
            });
          }
        };

        pc.oniceconnectionstatechange = () => {
          console.log("[useConnectionPeer] ICE connection state:", pc.iceConnectionState);
        };

        pc.onconnectionstatechange = () => {
          console.log("[useConnectionPeer] Connection state:", pc.connectionState);
          if (pc.connectionState === "failed") {
            console.error("[useConnectionPeer] WebRTC connection FAILED. Check network/TURN.");
          }
        };

        pc.ontrack = event => {
          if (!mounted) return;
          console.log("[useConnectionPeer] Received remote track:", event.track.kind);
          const [remoteStream] = event.streams;
          if (remoteAudioRefInt.current?.current && remoteStream) {
            console.log("[useConnectionPeer] Mapping remote stream to audio element");
            remoteAudioRefInt.current.current.srcObject = remoteStream;
          } else {
            console.warn("[useConnectionPeer] Received track but remoteAudioRef or stream is missing", {
              ref: !!remoteAudioRefInt.current?.current,
              stream: !!remoteStream
            });
          }
        };
      };
      init();
    }
    catch (error: any) {
      console.log(error)
    }

    return () => {
      mounted = false;
      pcRef.current?.close();
      pcRef.current = null;
    };
  }, [receiverId, iceConfig, sessionKey]);

  // ... (keep intermediate handlers same) ...

  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    const pc = pcRef.current;
    if (!pc) return;
    if (!pc.remoteDescription) {
      pendingIceRef.current.push(candidate);
      return;
    }
    await pc.addIceCandidate(candidate);
  }, []);

  const handleOffer = useCallback(async (payload: OfferPayload) => {
    const pc = pcRef.current;
    console.log("[useConnectionPeer] handleOffer called. signalingState:", pc?.signalingState);
    if (!pc) return;
    // if (pc.signalingState === "have-remote-offer") {
    //  console.warn("[Receiver] Offer received while pending answer");
    //  return;
    // }
    try {
      await pc.setRemoteDescription(payload.offer);
      console.log("[useConnectionPeer] setRemoteDescription success. new state:", pc.signalingState);
      
      for (const c of pendingIceRef.current) {
        await pc.addIceCandidate(c);
      }
      pendingIceRef.current = [];
    } catch (err) {
      console.error("[useConnectionPeer] Error in handleOffer:", err);
    }
  }, []);

  const handleAnswer = useCallback(async (payload: AnswerPayload) => {
    const pc = pcRef.current;
    console.log("[useConnectionPeer] handleAnswer called. signalingState:", pc?.signalingState);
    if (!pc) return;
    try {
      // if(reTryIntervalRef.current){
        // clearTimeout(reTryIntervalRef.current)
        // reTryIntervalRef.current=null
      // }
      await pc.setRemoteDescription(payload.answer);
      console.log("[useConnectionPeer] setRemoteDescription (answer) success. new state:", pc.signalingState);

      for (const c of pendingIceRef.current) {
        await pc.addIceCandidate(c);
      }
      pendingIceRef.current = [];
    } catch (err) {
      console.error("[useConnectionPeer] Error in handleAnswer:", err);
    }
  }, []);

// --------------------------------------------------------------------- retryOffer
  const retryOffer = useCallback(async () => {
    if (pcRef?.current?.signalingState !== "have-local-offer") return;

    console.warn("[Caller] Retrying offer...");
    try {

      await pcRef.current.setLocalDescription({ type: "rollback" });

      lastOfferRef.current = null;
      const newOffer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(newOffer);

     lastOfferRef.current = newOffer;
         onSignalRef.current("offer", {
     toUserId: receiverId,
     channelId,
     offer: lastOfferRef.current,
   });
    } catch (err) {
      console.error("[Caller] Retry offer failed", err);
    }
  }, [pcRef.current, onSignalRef.current,receiverId,channelId]);
// --------------------------------------------------------------------- start call
  const startCall = useCallback(
    async (
      remoteAudioRef: RefObject<HTMLAudioElement>
    ) => {
      const pc = pcRef.current;
      console.log("[useConnectionPeer] startCall called. PC exists:", !!pc);
      if (!pc) return;

      remoteAudioRefInt.current = remoteAudioRef;

      if (!localStreamRef.current) {
        console.log("[useConnectionPeer] Fetching audio stream for caller");
        const stream = await getAudioStream();
        if (stream) {
          localStreamRef.current = stream;
          stream.getTracks().forEach(track => pc.addTrack(track, stream));
        }
      }

      console.log("[useConnectionPeer] Creating offer");
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      lastOfferRef.current = offer;

      console.log("[useConnectionPeer] Emitting offer via onSignalRef");
      onSignalRef.current("offer", {
        toUserId: receiverId,
        channelId,
        offer,
      });
      // reTryIntervalRef.current=setInterval(()=>{
        // retryOffer()
      // },10000)
    },
    [receiverId, channelId, user.userId]
  );
// ------------------------------------------------------------------------------------------
//safeAnswerRetry
const sendAnswerWithRetry = useCallback((answer:RTCSessionDescriptionInit) => {
  if (isAnswerInFlightRef.current) return;

  isAnswerInFlightRef.current = true;

  const trySend = () => {
    console.log(
      `[Answer] Sending attempt ${answerRetryCountRef.current + 1}`
    );

    onSignalACK(
      "answer",
      {
        toUserId: receiverId,
        channelId,
        answer,
      },
      (err:any,response) => {
        if (!err) {
          console.log("[Answer] ACK received");
          isAnswerInFlightRef.current = false;
          answerRetryCountRef.current = 0;
          return;
        }
        answerRetryCountRef.current++;

        if (answerRetryCountRef.current < MAX_RETRIES) {
          console.warn("[Answer] ACK failed → retrying");
          setTimeout(trySend, 500);
        } else {
          console.error("[Answer] Max retries reached");
          isAnswerInFlightRef.current = false;
          answerRetryCountRef.current = 0;

          // retry for answerSend
          reSendAnswer()
        }
      }
    );
  };

  trySend();
}, [receiverId, channelId,onSignalRef.current ]);



// --------------------------------------------------------------------------------------------
  const createAnswerAndSend = useCallback(async (
    remoteAudioRef: RefObject<HTMLAudioElement>
  ) => {
    const pc = pcRef.current;
    console.log("[useConnectionPeer] createAnswerAndSend called. PC exists:", !!pc);
    if (!pc) return;

    remoteAudioRefInt.current = remoteAudioRef;
    
    if (!localStreamRef.current) {
      console.log("[useConnectionPeer] Fetching audio stream for receiver");
      const stream = await getAudioStream();
      if (stream) {
        localStreamRef.current = stream;
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
      }
    }

    console.log("[useConnectionPeer] Creating answer. current state:", pc.signalingState);
    if(!lastAnswerRef.current){
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      lastAnswerRef.current=answer
      console.log("[useConnectionPeer] Emitting answer via onSignalRef");
      sendAnswerWithRetry(answer)
      // onSignalRef.current("answer", {
        // toUserId: receiverId,
        // channelId,
        // answer,
      // });
      // onSignalACK("answer",{ toUserId: receiverId,channelId,answer},(err,response)=>{
        // 
        // if(err){
        //  reSendOffer()
        // }
      // })
    }
  }, [receiverId, channelId, user.userId,lastAnswerRef.current]);
//-----------------------------------------------------------------------------------------------------------------

  const reSendOffer = useCallback(() => {
    if (lastOfferRef.current) {
      console.log("[useConnectionPeer] Re-sending offer via onSignalRef");
      onSignalRef.current("offer", {
        toUserId: receiverId,
        channelId,
        offer: lastOfferRef.current,
      });
    }
  }, [receiverId, channelId]);

   const reSendAnswer = useCallback(() => {
   if (lastAnswerRef.current) {
     console.log("[useConnectionPeer] Re-sending offer via onSignalRef");
     onSignalRef.current("answer", {
       toUserId: user.userId,
       channelId,
       offer: lastAnswerRef.current,
     });
   }
 }, [user.userId, channelId]);


  const stopCall = useCallback(() => {
    console.log("[useConnectionPeer] stopCall initiated");

    // 1. Stop all media tracks properly
    if (localStreamRef.current) {
      console.log("[useConnectionPeer] Stopping local media tracks");
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop(); // Fixed: track.sto -> track.stop()
      });
      localStreamRef.current = null;
    }

    // 2. Clean up RTCPeerConnection
    if (pcRef.current) {
      console.log("[useConnectionPeer] Closing RTCPeerConnection");

      // Remove listeners before closing to prevent memory leaks or late triggers
      pcRef.current.onicecandidate = null;
      pcRef.current.ontrack = null;
      pcRef.current.oniceconnectionstatechange = null;
      pcRef.current.onconnectionstatechange = null;
      pcRef.current.onsignalingstatechange = null; // Added for completeness

      pcRef.current.close();
      pcRef.current = null;
    }

    // 3. Reset signaling state
    pendingIceRef.current = [];
    lastOfferRef.current = null;
    lastAnswerRef.current=null

    // 4. Force re-initialization of the hook's internal logic
    setSessionKey(prev => prev + 1);
  }, []);

  return {
    pc: pcRef.current,
    startCall,
    createAnswerAndSend,
    handleIceCandidate,
    handleOffer,
    handleAnswer,
    stopCall,
    reSendOffer,
    reSendAnswer
  };
}
