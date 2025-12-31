"use client"

import React, { useState, useCallback } from 'react'
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
import VoiceAnimation from '../../components/VoiceAnimation'
import { useSelector, useDispatch } from 'react-redux'
import { selectTheme, toggleTheme } from '../../lib/redux/featuresSlice/themeSlice'
import { sideBarState, toggleSidebar } from '../../lib/redux/featuresSlice/slideBarSlice'

// Mock data for initial UI
const CONVERSATIONS = [
    { id: 1, name: "Alice Johnson", lastMessage: "Hey, are we still calling today?", time: "10:30 AM", unread: 2, online: true },
    { id: 2, name: "Bob Smith", lastMessage: "The project looks great!", time: "Yesterday", unread: 0, online: false },
    { id: 3, name: "Charlie Brown", lastMessage: "I'll send the files over shortly.", time: "Monday", unread: 0, online: true },
    { id: 4, name: "David Wilson", lastMessage: "Can you hear me now?", time: "Dec 28", unread: 0, online: false },
]

const MESSAGES = [
    { id: 1, sender: "Alice", content: "Hey! How's it going?", sentAt: "10:25 AM", isMe: false },
    { id: 2, sender: "Me", content: "Going well! Just working on the audio calling feature.", sentAt: "10:26 AM", isMe: true },
    { id: 3, sender: "Alice", content: "That's awesome! Does it have animations?", sentAt: "10:27 AM", isMe: false },
    { id: 4, sender: "Me", content: "Yes, I'm adding a voice movement animation right now.", sentAt: "10:28 AM", isMe: true },
    { id: 5, sender: "Alice", content: "Can't wait to see it!", sentAt: "10:29 AM", isMe: false },
]

export default function ChatPage() {
    const dispatch = useDispatch()
    const theme = useSelector(selectTheme)
    console.log(theme)
    const isSidebarOpen = useSelector(sideBarState)

    const [selectedChat, setSelectedChat] = useState(CONVERSATIONS[0])
    const [messageInput, setMessageInput] = useState("")
    const [isCalling, setIsCalling] = useState(false)

    const handleCall = useCallback(() => {
        setIsCalling(true)
    }, [])

    const handleHangup = useCallback(() => {
        setIsCalling(false)
    }, [])

    const handleThemeToggle = useCallback(() => {
        dispatch(toggleTheme())
    }, [dispatch])

    const handleSidebarToggle = useCallback(() => {
        dispatch(toggleSidebar(!isSidebarOpen))
    }, [dispatch, isSidebarOpen])

    return (
        <div className="flex h-screen bg-white  dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 overflow-hidden">
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
            <div className="w-80 border-r relative border-zinc-200 dark:border-white/15 bg-white dark:bg-zinc-900 flex flex-col">
                {!isSidebarOpen ? <Button
     variant="ghost"
     size="icon"
     onClick={handleSidebarToggle}
     className="text-zinc-500 absolute right-1 top-4 dark:text-zinc-400 hover:text-black/35 dark:hover:text-white hover:bg-zinc-200 
dark:hover:bg-zinc-900"
 >
     <span className="sr-only">Toggle Sidebar</span>
     <div className="w-5 h-5 border-2 border-current rounded-sm" />
 </Button>:<></>}
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-900">
                    <h1 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Messages</h1>
                    <Input
                        placeholder="Search conversations..."
                        className="bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm h-9 shadow-inner"
                    />
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                        {CONVERSATIONS.map((chat) => (
                            <div
                                key={chat.id}
                                onClick={() => setSelectedChat(chat)}
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${selectedChat?.id === chat.id ? 'bg-zinc-100 dark:bg-zinc-900 shadow-md' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                                    }`}
                            >
                                <div className="relative">
                                    <Avatar className="w-11 h-11 ring-1 ring-zinc-200 dark:ring-zinc-800">
                                        <AvatarFallback>{chat.name[0]}</AvatarFallback>
                                    </Avatar>
                                    {chat.online && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-zinc-950 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{chat.name}</span>
                                        <span className="text-[10px] text-zinc-500">{chat.time}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate pr-2 font-light">{chat.lastMessage}</p>
                                        {chat.unread > 0 && (
                                            <Badge className="bg-black dark:bg-white text-white dark:text-black text-[10px] h-4 px-1 rounded-full font-bold">{chat.unread}</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Active Chat Area */}
            {selectedChat ? (
                <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900/80 relative">
                    {/* Chat Header */}
                    <header className="h-16 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between px-6 bg-white/80 dark:bg-zinc-900 backdrop-blur-xl z-10">
                        <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 ring-1 ring-zinc-200 dark:ring-zinc-800">
                                <AvatarFallback>{selectedChat.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="font-semibold text-zinc-900 dark:text-white leading-tight">{selectedChat.name}</h2>
                                <div className="flex items-center gap-1.5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${selectedChat.online ? 'bg-emerald-500' : 'bg-zinc-400 dark:bg-zinc-600'}`} />
                                    <span className="text-xs text-zinc-500 font-medium">{selectedChat.online ? 'Online' : 'Offline'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {!isCalling ? (
                                <>
                                    <Button variant="outline" size="icon" className="rounded-full border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 transition-all hover:scale-105">
                                        <div className="w-4 h-4 rounded-full border-2 border-current" />
                                    </Button>
                                    <Button
                                        onClick={handleCall}
                                        className="rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 px-6 font-bold shadow-lg shadow-black/5 dark:shadow-white/5 transition-all active:scale-95"
                                    >
                                        Call
                                    </Button>
                                </>
                            ) : (
                                <div className="flex items-center gap-4 bg-zinc-100 dark:bg-zinc-900 px-4 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800">
                                    <VoiceAnimation isActive={true} />
                                    <Separator orientation="vertical" className="h-4 bg-zinc-200 dark:bg-zinc-800" />
                                    <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 tabular-nums">00:42</span>
                                    <Button
                                        onClick={handleHangup}
                                        variant="destructive"
                                        size="sm"
                                        className="h-8 rounded-full px-4 text-xs font-bold hover:bg-red-600 transition-all active:scale-95 shadow-lg shadow-red-900/20"
                                    >
                                        Hang up
                                    </Button>
                                </div>
                            )}
                        </div>
                    </header>

                    {/* Messages Area */}
                    <ScrollArea className="flex-1 p-6">
                        <div className="space-y-6 max-w-4xl mx-auto">
                            <div className="flex justify-center mb-8">
                                <Badge variant="outline" className="text-[10px] border-zinc-200 dark:border-zinc-900 text-zinc-500 uppercase tracking-widest px-3 py-0.5 rounded-full font-bold">
                                    Today
                                </Badge>
                            </div>
                            {MESSAGES.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex flex-col max-w-[70%] ${msg.isMe ? 'items-end' : 'items-start'} group`}>
                                        <div className={`px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed transition-all ${msg.isMe
                                            ? ' bg-zinc-900 dark:bg-white text-white dark:text-black rounded-tr-none shadow-lg shadow-black/5 dark:shadow-white/5'
                                            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-tl-none border border-zinc-200 dark:border-zinc-800/50'
                                            }`}>
                                            {msg.content}
                                        </div>
                                        <span className="text-[10px] text-zinc-500 dark:text-zinc-600 mt-1.5 font-medium opacity-0 group-hover:opacity-100 transition-opacity">{msg.sentAt}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    {/* Footer Input */}
                    <footer className="p-4 bg-white/80 dark:bg-zinc-900 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-900/50">
                        <div className="max-w-4xl mx-auto flex items-center gap-3">
                            <div className="flex-1 relative">
                                <Input
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    placeholder="Type a message..."
                                    className="bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white h-12 px-5 rounded-2xl focus-visible:ring-1 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-700 focus-visible:border-zinc-400 dark:focus-visible:border-zinc-700 transition-all shadow-inner"
                                />
                            </div>
                            <Button
                                disabled={!messageInput.trim()}
                                size="icon"
                                className={`rounded-2xl h-12 w-12 transition-all ${messageInput.trim() ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-xl shadow-black/5 dark:shadow-white/5' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-700 border border-zinc-200 dark:border-zinc-800'
                                    }`}
                            >
                                {/* Send Icon Placeholder */}
                                <div className="w-0 h-0 border-y-[6px] border-y-transparent border-l-[10px] border-l-current ml-1" />
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
            )}
        </div>
    )
}
