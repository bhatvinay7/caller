import { useRef, RefObject, useEffect, useState } from "react";
import VoiceAnimation from './VoiceAnimation'
import useUserAction from "../hooks/useUserAction"
import {
  Button,
  Separator,
} from 'chat-ui'
import { Phone, PhoneOff, Mic, ShieldCheck, PhoneIncoming, Clock, MessageCircle, User } from 'lucide-react';
export default function AudioCallPage({ props, mode = "overlay" }: {
  props: {
    handleCall: (audioRef: RefObject<HTMLAudioElement>) => void,
    handleAnswer: (audioRef: RefObject<HTMLAudioElement>) => void,
    handleHangup: (audioRef: RefObject<HTMLAudioElement>) => void
  },
  mode?: "header" | "overlay"
}) {
  // Correctly type the ref
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const { userAction, action } = useUserAction()
  const [isAnswering, setIsAnswering] = useState(false);

  // Auto-answer when action is set to receivecall (from popup)
  useEffect(() => {
    if (action === "receivecall" && !isAnswering) {
      console.log("[AudioCallPage] Auto-answering call...");
      setIsAnswering(true);
      props.handleAnswer(remoteAudioRef as RefObject<HTMLAudioElement>);
    }
  }, [action, props, isAnswering]);

  useEffect(() => {
    if (action === "none" || action === "endcall") {
      setIsAnswering(false);
    }
  }, [action]);
  if (mode === "header") {
    return (
      <div className="flex items-center">
        {(action === "none" || action === "endcall") && (
          <Button
            onClick={() => { userAction("calling"), props.handleCall(remoteAudioRef as RefObject<HTMLAudioElement>) }}
            className="rounded-full flex items-center bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 
         dark:hover:bg-zinc-200 px-4 font-bold shadow-lg shadow-black/5 dark:shadow-white/5 transition-all 
          active:scale-95 h-9 gap-2"
          >
            <Phone className="w-4 h-4" />
            <span>Call</span>
          </Button>
        )}
        {(action !== "none" && action !== "endcall") && (
          <div className="text-xs font-bold text-emerald-500 animate-pulse px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
            Call Live
          </div>
        )}
        <audio ref={remoteAudioRef} autoPlay />
      </div>
    );
  }

  // Full-screen Overlay Mode
  if (action === "none" || action === "endcall") return null;

  // Incoming Call Modal
  if (action === "receivecall" && !isAnswering) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="w-80 bg-[#1A1A1A] p-8 rounded-3xl shadow-2xl border border-white/5 flex flex-col items-center animate-in zoom-in-95 duration-300">
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full border-4 border-[#1A1A1A] shadow-xl overflow-hidden relative z-10">
              <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                <User className="w-10 h-10 text-zinc-500" />
              </div>
            </div>
            <span className="absolute top-0 right-0 w-6 h-6 bg-green-500 border-4 border-[#1A1A1A] rounded-full z-20"></span>
          </div>

          <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Unknown</h2>
          <p className="text-zinc-400 text-sm mb-8 font-medium">is now calling...</p>

          <div className="flex gap-4 w-full">
            <Button
              onClick={() => { userAction("endcall"), props.handleHangup(remoteAudioRef as RefObject<HTMLAudioElement>) }}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold h-12 rounded-xl shadow-lg shadow-red-500/20 transition-all border-none"
            >
              Reject
            </Button>
            <Button
              onClick={() => { setIsAnswering(true), userAction("receivecall"), props.handleAnswer(remoteAudioRef as RefObject<HTMLAudioElement>) }}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-12 rounded-xl shadow-lg shadow-emerald-500/20 transition-all border-none"
            >
              Accept
            </Button>
          </div>
          <audio ref={remoteAudioRef} autoPlay />
        </div>
      </div>
    )
  }

  // Active Call Full Screen Overlay
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-between py-12 px-8 bg-zinc-950 text-zinc-100 backdrop-blur-3xl animate-in slide-in-from-bottom duration-500">
      {/* Top Info */}
      <div className="text-center space-y-6 flex-1 flex flex-col justify-center pb-20">
        <div className="w-40 h-40 bg-zinc-900 rounded-full flex items-center justify-center mx-auto border border-zinc-800 shadow-2xl relative">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-2xl opacity-50 animate-pulse"></div>
          <User className="w-16 h-16 text-zinc-600" strokeWidth={1.5} />
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-white">Unknown</h2>
          <p className="text-sm tracking-[0.2em] uppercase text-zinc-500 font-medium bg-zinc-900/50 py-1 px-3 rounded-full inline-block border border-zinc-800">
            {action === "calling" ? "Calling..." : "Connected"}
          </p>
        </div>
      </div>

      {/* Central Status Animation (Only if connected) */}
      {(action != "receivecall" || isAnswering) && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-60">
          <VoiceAnimation isActive={true} color="zinc" />
        </div>
      )}

      {/* Buttons */}
      <div className="w-full max-w-sm flex justify-around items-center h-32 px-4 pb-8">
        <Button
          size="icon"
          onClick={() => {
            setIsAnswering(false); // Reset receiving state
            userAction("endcall");
            props.handleHangup(remoteAudioRef as RefObject<HTMLAudioElement>)
          }}
          className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-[0_8px_30px_rgb(239,68,68,0.4)] hover:scale-105 transition-all duration-300 border-4 border-zinc-950 outline outline-1 outline-red-500/50"
        >
          <PhoneOff className="w-8 h-8 fill-current" />
        </Button>
      </div>

      <audio ref={remoteAudioRef} autoPlay />
    </div>
  );
}
