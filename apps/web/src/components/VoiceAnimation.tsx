"use client"

import React, { useMemo } from 'react'

export interface VoiceAnimationProps {
    isActive?: boolean
}

export default function VoiceAnimation({ isActive = true }: VoiceAnimationProps) {
    const bars = useMemo(() =>
        [1, 2, 3, 4, 5, 6, 7, 8].map((i) => ({
            id: i,
            delay: `${i * 0.1}s`,
            duration: `${0.5 + Math.random() * 0.5}s`
        })), [])

    return (
        <div className="flex items-center justify-center gap-[3px] h-8 pt-1">
            {bars.map((bar) => (
                <div
                    key={bar.id}
                    className={`w-[3px] bg-zinc-900 dark:bg-white rounded-full transition-all duration-300 ${isActive ? 'animate-voice-bar' : 'h-1 opacity-20'
                        }`}
                    style={{
                        animationDelay: bar.delay,
                        animationDuration: bar.duration,
                        height: isActive ? 'auto' : '4px'
                    }}
                />
            ))}
            <style jsx>{`
        @keyframes voice-bar {
          0%, 100% { height: 4px; }
          50% { height: 24px; }
        }
        .animate-voice-bar {
          animation: voice-bar ease-in-out infinite;
        }
      `}</style>
        </div>
    )
}
