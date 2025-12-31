"use client"

import React from 'react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge
} from 'chat-ui'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-black dark:selection:bg-white selection:text-white dark:selection:text-black">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black font-bold text-lg">C</div>
          <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Caller</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">Sign in</Link>
          <Button asChild className="bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200">
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <Badge variant="outline" className="mb-6 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 px-4 py-1 rounded-full text-xs uppercase tracking-widest font-semibold">
          Seamless Audio Experience
        </Badge>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-zinc-900 dark:text-white mb-8 max-w-4xl leading-[0.9]">
          CONNECT WITH <br />
          <span className="text-zinc-400 dark:text-zinc-500">CRYSTAL CLEAR</span> AUDIO.
        </h1>
        <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mb-12 leading-relaxed">
          The most beautiful and powerful audio calling app for remote teams and individuals.
          Private, secure, and blazingly fast.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Button size="lg" className="h-14 px-10 text-lg bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200" asChild>
            <Link href="/chat">Start a Call Now</Link>
          </Button>
          <Button variant="outline" size="lg" className="h-14 px-10 text-lg border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900">
            View Features
          </Button>
        </div>

        {/* Floating Cards (Background visual) */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
          <Card className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-6 text-left">
            <CardHeader className="p-0 mb-4">
              <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mb-2">
                <div className="w-4 h-4 rounded-full border-2 border-black dark:border-white" />
              </div>
              <CardTitle className="text-zinc-900 dark:text-white text-lg">HD Voice Quality</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-zinc-500 dark:text-zinc-400 text-sm">
              Experience unparalleled voice clarity with our advanced spatial audio processing engine.
            </CardContent>
          </Card>

          <Card className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-6 text-left">
            <CardHeader className="p-0 mb-4">
              <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mb-2">
                <div className="w-4 h-4 border-2 border-black dark:border-white rotate-45" />
              </div>
              <CardTitle className="text-zinc-900 dark:text-white text-lg">End-to-End Encrypted</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-zinc-500 dark:text-zinc-400 text-sm">
              Your conversations are yours. No one else can listen, not even us. Peer-to-peer security.
            </CardContent>
          </Card>

          <Card className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-6 text-left">
            <CardHeader className="p-0 mb-4">
              <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mb-2">
                <div className="w-4 h-4 bg-black dark:bg-white" />
              </div>
              <CardTitle className="text-zinc-900 dark:text-white text-lg">Real-time Chat</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-zinc-500 dark:text-zinc-400 text-sm">
              Coordinate effortlessly with integrated messaging before, during, and after calls.
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-900 py-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50 dark:grayscale dark:brightness-200">
            <div className="w-5 h-5 bg-black dark:bg-white rounded flex items-center justify-center text-[10px] text-white dark:text-black font-bold">C</div>
            <span className="font-bold tracking-tight text-zinc-900 dark:text-white">Caller © 2025</span>
          </div>
          <div className="flex gap-8 text-sm text-zinc-500 font-medium">
            <Link href="#" className="hover:text-black dark:hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-black dark:hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-black dark:hover:text-white transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-black dark:hover:text-white transition-colors">Github</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
