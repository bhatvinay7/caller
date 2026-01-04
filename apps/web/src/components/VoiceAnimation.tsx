"use client"

import React, { useMemo } from 'react'

export interface VoiceAnimationProps {
    isActive?: boolean;
    color?: 'green' | 'blue' | 'zinc';
}

export default function VoiceAnimation({ isActive = true, color = 'green' }: VoiceAnimationProps) {
    const bars = useMemo(() =>
        Array.from({ length: 16 }).map((_, i) => ({
            id: i,
            delay: `${i * 0.05}s`,
            duration: `${0.4 + Math.random() * 0.6}s`
        })), [])

    return (
        <div className="flex items-center justify-center gap-[4px] h-12 pt-1 px-4">
            {bars.map((bar) => (
                <div
                    key={bar.id}
                    className={`w-[4px] min-h-[4px] rounded-full transition-all duration-300 ${isActive
                        ? (color === 'green' ? 'bg-[#10b981]' : color === 'blue' ? 'bg-blue-500' : 'bg-zinc-900 dark:bg-white') + ' animate-voice-bar shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                        : 'bg-zinc-300 dark:bg-zinc-800 h-1 opacity-30'
                        }`}
                    style={{
                        animationDelay: bar.delay,
                        animationDuration: bar.duration,
                    }}
                />
            ))}
            <style jsx>{`
        @keyframes voice-bar {
          0%, 100% { height: 6px; }
          50% { height: 32px; }
        }
        .animate-voice-bar {
          animation: voice-bar ease-in-out infinite;
        }
      `}</style>
        </div>
    )
}
