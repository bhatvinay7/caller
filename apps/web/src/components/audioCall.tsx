"use client";

import { useRef ,RefObject} from "react";
import useAudioCall  from "../hooks/useAudiocall";

export default function AudioCallPage(channelId:string,receiverId:string) {
  // Correctly type the ref
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const { startCall } = useAudioCall(channelId,receiverId);
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Audio Call</h1>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => remoteAudioRef.current ? startCall(remoteAudioRef as RefObject<HTMLAudioElement>):()=>{}}
      >
       Call
      </button>
      <audio ref={remoteAudioRef} autoPlay className="mt-4" />
    </div>
  );
}
