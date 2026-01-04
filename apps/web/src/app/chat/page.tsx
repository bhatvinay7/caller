"use client"

import React, { useState, useCallback, useEffect } from 'react'
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    Button,
    Card,
    Input,
    ScrollArea,
    Separator,
    Badge
} from 'chat-ui'
import Link from 'next/link'
import { useSelector, useDispatch } from 'react-redux'
import { Search, Bell, MoreHorizontal, Phone, Video, Image as ImageIcon, Paperclip, Mic, Smile, Send, Check, CheckCheck } from 'lucide-react'
import { selectTheme, toggleTheme } from '../../lib/redux/featuresSlice/themeSlice'
import { sideBarState, toggleSidebar } from '../../lib/redux/featuresSlice/slideBarSlice'
import { setUserAction } from "../../lib/redux/featuresSlice/userActionSlice";
import { fetchrooms } from "../../utils/fetchConnections"
import AudioCallPage from '../../components/audioCall'
import useSocketConnection from '../../hooks/useSocket';
import useUserDetail from '../../hooks/usegetUserInfo';
import { RefObject } from 'react';

type connection = {
    username: string,
    id: string,
    roomId: string
}
import { Message } from "../../hooks/useSocket"
interface UserMessage {
    id: string,
    sender: string,
    message: string,
    sentAt: string,
    isMe: boolean
}
export default function ChatPage() {
    const [selectedChat, setSelectedChat] = useState<connection>({
        username: "",
        id: "",
        roomId: ""
    })
    const dispatch = useDispatch()
    const theme = useSelector(selectTheme)

    const isSidebarOpen = useSelector(sideBarState)
    const [rooms, setRooms] = useState<connection[]>([])
    const [messageInput, setMessageInput] = useState("")
    const [messages, setMessages] = useState<UserMessage[]>([])

    const receiveMessage = useCallback((payload: Message) => {
        console.log("New message received:", payload);
        if (payload.message && payload.type === "chat") {
            const newMessage: UserMessage = {
                id: Date.now().toString(),
                sender: payload.toUser, // Note: server usually sends fromUser, but following user's structure
                message: payload.message,
                sentAt: payload.sentAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isMe: false
            };
            setMessages(prev => {
                const updated = [...prev, newMessage];
                if (selectedChat.roomId) {
                    localStorage.setItem(`chat_${selectedChat.roomId}`, JSON.stringify(updated.slice(-100)));
                }
                return updated;
            });
        }
    }, [selectedChat.roomId]);

    const user = useUserDetail();
    const { startCall, createAnswerAndSend: answerCall, endCall, sendMessage } = useSocketConnection(selectedChat.roomId, selectedChat.id, receiveMessage)

    // Load messages from local storage
    useEffect(() => {
        if (selectedChat.roomId) {
            const saved = localStorage.getItem(`chat_${selectedChat.roomId}`);
            if (saved) {
                setMessages(JSON.parse(saved));
            } else {
                setMessages([]);
            }
        }
    }, [selectedChat.roomId]);

    useEffect(() => {
        async function fetch() {
            try {
                const response = await fetchrooms()
                setRooms(response)

            }
            catch (error) {
                console.log(error)
            }
        }
        fetch()
    }, [])
    const handleCall = useCallback(async (audioCallRef: RefObject<HTMLAudioElement> | null) => {
        if (audioCallRef) {
            const permission = await navigator.permissions.query({
                name: "microphone" as PermissionName,
            })
            if (permission.state === "denied") {
                alert("Microphone access is blocked. Enable it in browser settings.");
                return
            }
            await startCall(audioCallRef)

        }
    }, [])

    const handleAnswer = useCallback(async (audioCallRef: RefObject<HTMLAudioElement> | null) => {
        if (audioCallRef) {
            const permission = await navigator.permissions.query({
                name: "microphone" as PermissionName,
            })
            if (permission.state === "denied") {
                alert("Microphone access is blocked. Enable it in browser settings.");
                return
            }
            await answerCall(audioCallRef)
            dispatch(setUserAction("connected"))

        }
    }, [answerCall, dispatch])

    const handleHangup = useCallback(async (audioCallRef: RefObject<HTMLAudioElement> | null) => {
        if (audioCallRef) {
            endCall()
        }
    }, [endCall])

    const handleThemeToggle = useCallback(() => {
        dispatch(toggleTheme())
    }, [dispatch])

    const handleSidebarToggle = useCallback(() => {
        dispatch(toggleSidebar(!isSidebarOpen))
    }, [dispatch, isSidebarOpen])

    const handleSendMessage = useCallback(() => {
        if (!messageInput.trim() || !selectedChat.roomId) return;

        const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newMessage: UserMessage = {
            id: Date.now().toString(),
            sender: "Me",
            message: messageInput,
            sentAt: timeString,
            isMe: true
        };

        sendMessage({
            channelId: selectedChat.roomId,
            message: messageInput,
            sentAt: timeString
        });

        setMessages(prev => {
            const updated = [...prev, newMessage];
            localStorage.setItem(`chat_${selectedChat.roomId}`, JSON.stringify(updated.slice(-100)));
            return updated;
        });

        setMessageInput("");
    }, [messageInput, selectedChat.roomId, sendMessage]);

    return (
        <div className="flex h-screen bg-black/45  dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 overflow-hidden">
            {/* Mini Sidebar */}
            <div className={`${isSidebarOpen ? 'w-16' : 'w-0 overflow-hidden'} border-r border-zinc-200 dark:border-zinc-400/15 bg-zinc-50 dark:bg-zinc-900 flex flex-col items-center py-4 space-y-6 transition-all duration-300`}>
                <Link href="/">
                    <div className="w-10 h-10 rounded-xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black font-bold">C</div>
                </Link>
                <div className="flex-1 flex flex-col space-y-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSidebarToggle}
                        className="text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-900"
                    >
                        <span className="sr-only">Toggle Sidebar</span>
                        <div className="w-5 h-5 border-2 border-current rounded-sm" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-900">
                        <span className="sr-only">Contacts</span>
                        <div className="w-5 h-5 rounded-full border-2 border-current" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleThemeToggle}
                        className="text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-900"
                        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    >
                        <div className="w-5 h-5 flex items-center justify-center">
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </div>
                    </Button>
                </div>
                <div className="mt-auto">
                    <Avatar className="w-10 h-10 border border-zinc-200 dark:border-zinc-800">
                        <AvatarFallback>VB</AvatarFallback>
                    </Avatar>
                </div>
            </div>

            {/* Conversations Panel */}
            <div className="w-80 border-r relative border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col">
                <div className="p-4 pt-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="relative flex-1 mr-2">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <Input
                                placeholder="Search"
                                className="pl-9 bg-zinc-100 dark:bg-zinc-900 border-none h-10 rounded-xl"
                            />
                        </div>
                        <Button size="icon" className="w-10 h-10 rounded-xl bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </Button>
                    </div>

                    <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 px-1">Direct Messages</h2>
                </div>

                <ScrollArea className="flex-1 px-2">
                    <div className="space-y-1 pb-4">
                        {rooms?.map((chat) => (
                            <div
                                key={chat.id}
                                onClick={() => setSelectedChat(chat)}
                                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 group relative
                                    ${selectedChat?.id == chat.id
                                        ? 'bg-blue-50 dark:bg-blue-900/10'
                                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-900'
                                    }`}
                            >
                                <div className="relative">
                                    <Avatar className="w-12 h-12 border-2 border-white dark:border-zinc-950 shadow-sm">
                                        <AvatarFallback className={`text-sm font-bold ${selectedChat?.id == chat.id ? 'bg-blue-100 text-blue-600' : 'bg-zinc-100 text-zinc-500'}`}>{chat.username[0]}</AvatarFallback>
                                    </Avatar>
                                    {/* Online indicator mock */}
                                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-zinc-950 rounded-full"></span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className={`text-[15px] font-semibold truncate ${selectedChat?.id == chat.id ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-700 dark:text-zinc-300'}`}>{chat.username}</span>
                                        <span className="text-[11px] text-zinc-400 font-medium">12m</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className={`text-[13px] truncate pr-2 ${selectedChat?.id == chat.id ? 'text-zinc-600 dark:text-zinc-400 font-medium' : 'text-zinc-500'}`}>
                                            Hey, how are you?
                                        </p>
                                        <Badge className="bg-blue-500 h-5 min-w-[20px] px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center border-none shadow-sm shadow-blue-500/20">3</Badge>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Active Chat Area */}
            {
                selectedChat.id ? (
                    <div className="flex-1 flex flex-col bg-gray-100 dark:bg-black relative">
                        {/* Chat Header */}
                        <header className="h-20 border-b border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between px-8 bg-white dark:bg-zinc-950 z-10 transition-colors duration-300">
                            {/* ... header content ... */}
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Avatar className="w-12 h-12 ring-2 ring-white dark:ring-zinc-900 shadow-sm">
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-lg">{selectedChat.username[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-zinc-950 rounded-full"></span>
                                </div>
                                <div>
                                    <h2 className="font-bold text-zinc-900 dark:text-white text-lg tracking-tight mb-0.5">{selectedChat.username}</h2>
                                    <p className="text-xs text-zinc-500 font-medium flex items-center gap-1">
                                        <span>Active now</span>
                                        <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600"></span>
                                        <span>Local Time 9:41 AM</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="w-10 h-10 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900">
                                    <Search className="w-5 h-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="w-10 h-10 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900">
                                    <Bell className="w-5 h-5" />
                                </Button>
                                <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-2"></div>

                                <div className="flex items-center gap-2">
                                    <AudioCallPage
                                        mode="header"
                                        props={{
                                            handleCall: handleCall,
                                            handleAnswer: handleAnswer,
                                            handleHangup: handleHangup,
                                        }}
                                    />
                                    <Button variant="ghost" size="icon" className="w-10 h-10 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        </header>

                        {/* Messages Area */}
                        <div className="flex-1 relative overflow-hidden">
                            <AudioCallPage
                                mode="overlay"
                                props={{
                                    handleCall: handleCall,
                                    handleAnswer: handleAnswer,
                                    handleHangup: handleHangup,
                                }}
                            />
                            <ScrollArea className=" max-h-[100%] overflow-y-auto p-6 [&>[data-radix-scroll-area-viewport]]:scrollbar-thin [&>[data-radix-scroll-area-viewport]]:scrollbar-thumb-zinc-300 dark:[&>[data-radix-scroll-area-viewport]]:scrollbar-thumb-zinc-700">
                                <div className="space-y-6 max-w-4xl mx-auto">
                                    {messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`flex flex-col max-w-[75%] ${msg.isMe ? 'items-end' : 'items-start'}`}>
                                                <div className={`px-5 py-3 rounded-2xl text-[15px] leading-relaxed transition-all duration-200 ${msg.isMe
                                                    ? 'bg-blue-100 text-black dark:bg-white dark:text-black shadow-sm'
                                                    : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-100 dark:border-zinc-700/50 shadow-sm'
                                                    }`}>
                                                    {msg.message}
                                                </div>
                                                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 px-1 font-medium select-none">{msg.sentAt}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>

                        <footer className="p-6 bg-white dark:bg-zinc-900 z-10 transition-colors duration-300">
                            <div className="max-w-4xl mx-auto flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900/50 p-1.5 pl-2 rounded-full border border-zinc-100 dark:border-zinc-800/50 shadow-sm focus-within:ring-2 focus-within:ring-black/5 dark:focus-within:ring-white/10 transition-all">
                                <Button size="icon" variant="ghost" className="w-9 h-9 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-full hover:bg-zinc-200/50 dark:hover:bg-zinc-800">
                                    <Mic className="w-5 h-5" />
                                </Button>
                                <Button size="icon" variant="ghost" className="w-9 h-9 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-full hover:bg-zinc-200/50 dark:hover:bg-zinc-800">
                                    <ImageIcon className="w-5 h-5" />
                                </Button>
                                <Button size="icon" variant="ghost" className="w-9 h-9 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-full hover:bg-zinc-200/50 dark:hover:bg-zinc-800">
                                    <Paperclip className="w-5 h-5" />
                                </Button>

                                <Input
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Type Message..."
                                    className="bg-transparent border-none text-zinc-900 dark:text-white h-11 px-4 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-zinc-400 text-[15px] flex-1 min-w-0"
                                />
                                <Button
                                    onClick={handleSendMessage}
                                    disabled={!messageInput.trim()}
                                    size="icon"
                                    className={`rounded-full h-10 w-10 shrink-0 transition-all duration-300 mr-0.5 ${messageInput.trim()
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white scale-100 rotate-0 shadow-md shadow-blue-500/20'
                                        : 'bg-transparent text-zinc-300 dark:text-zinc-600 scale-90 rotate-0'
                                        }`}
                                >
                                    <Send className={`w-5 h-5 ${messageInput.trim() ? 'ml-0.5' : ''}`} />
                                </Button>
                            </div>
                        </footer>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-white dark:bg-zinc-950 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.03)_0%,transparent_100%)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_100%)]">
                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-3xl mx-auto flex items-center justify-center border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden mb-6">
                                <div className="w-8 h-8 bg-black dark:bg-white rotate-12" />
                            </div>
                            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Select a conversation</h3>
                            <p className="text-zinc-500 dark:text-zinc-500 max-w-xs mx-auto text-sm leading-relaxed">
                                Choose a friend from the list on the left to start messaging and audio calling.
                            </p>
                        </div>
                    </div>
                )
            }
        </div >
    )
}
