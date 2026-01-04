"use client";

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { incomingCallState, setIncomingCall, setUserAction } from '../lib/redux/featuresSlice/userActionSlice';
import { Button, Card } from 'chat-ui';
import { useSocket } from '../context/SocketContext';

export default function IncomingCallPopup() {
    const incomingCall = useSelector(incomingCallState);
    const dispatch = useDispatch();
    const { socket } = useSocket();

    if (!incomingCall) return null;

    const handleAccept = () => {
        dispatch(setUserAction("receivecall"));
        dispatch(setIncomingCall(null));
    };

    const handleReject = () => {
        if (socket && incomingCall.from) {
            socket.emit("reject-call", { toUserId: incomingCall.from, message: "declined" });
        }
        dispatch(setIncomingCall(null));
        dispatch(setUserAction("none"));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md">
            <Card className="w-80 p-8 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-2xl animate-in fade-in zoom-in duration-300 rounded-[2rem]">
                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="relative">
                        {/* Multiple pulsing rings */}
                        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20 scale-150" />
                        <div className="absolute inset-0 bg-green-500 rounded-full animate-pulse opacity-10 scale-125 delay-75" />

                        <div className="relative w-24 h-24 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center shadow-inner">
                            {/* Phone Icon animation placeholder */}
                            <div className="w-12 h-12 bg-green-600 dark:bg-green-500 rounded-2xl rotate-12 flex items-center justify-center shadow-lg transform active:scale-90 transition-transform">
                                <span className="text-3xl">📞</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">Incoming Audio Call</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-1 font-medium">From User {incomingCall.from}</p>
                    </div>

                    <div className="flex w-full gap-4 pt-2">
                        <Button
                            onClick={handleReject}
                            variant="destructive"
                            className="flex-1 h-12 rounded-2xl font-bold bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white border-none transition-all"
                        >
                            Decline
                        </Button>
                        <Button
                            onClick={handleAccept}
                            className="flex-1 h-12 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-black shadow-lg shadow-green-900/20 active:scale-95 transition-all"
                        >
                            Accept
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
