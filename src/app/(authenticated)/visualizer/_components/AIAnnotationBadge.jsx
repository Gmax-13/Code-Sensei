"use client";
import React from "react";

/**
 * AIAnnotationBadge — displays the Groq-generated "why" annotation for each step.
 *
 * Improvements over v1:
 *  - Fade+slide-up entrance animation when annotation arrives
 *  - Animated thinking state with typed-dots instead of spinning glyph
 *  - "AI" chip label so students know this is an AI insight
 *  - Subtle gradient background instead of flat amber
 */

export default function AIAnnotationBadge({ annotation, isLoading, tracerPreComputed }) {
    const text = annotation || tracerPreComputed;

    if (isLoading) {
        return (
            <div className="flex items-center gap-3 mt-3 px-4 py-3 rounded-lg
                bg-gradient-to-r from-amber-950/60 to-yellow-950/40
                border border-amber-500/30 animate-pulse">
                <span className="flex gap-0.5 items-end h-4">
                    <span className="w-1 h-1 rounded-full bg-amber-400 animate-bounce [animation-delay:0ms]" />
                    <span className="w-1 h-1 rounded-full bg-amber-400 animate-bounce [animation-delay:150ms]" />
                    <span className="w-1 h-1 rounded-full bg-amber-400 animate-bounce [animation-delay:300ms]" />
                </span>
                <span className="text-sm text-amber-400/80 italic">
                    Groq is analysing this step...
                </span>
            </div>
        );
    }

    if (!text) return null;

    return (
        <div className="flex items-start gap-3 mt-3 px-4 py-3 rounded-lg
            bg-gradient-to-r from-amber-950/60 to-yellow-950/40
            border border-amber-500/30 shadow-sm animate-badge-in">
            {/* AI chip */}
            <span className="shrink-0 mt-0.5 px-1.5 py-0.5 bg-amber-500/20 border border-amber-500/40
                rounded text-[10px] font-bold tracking-widest text-amber-400">
                AI
            </span>

            <p className="text-sm text-amber-200 leading-relaxed">
                {text}
            </p>

            <style>{`
                @keyframes badge-in {
                    from { opacity: 0; transform: translateY(6px); }
                    to   { opacity: 1; transform: translateY(0);   }
                }
                .animate-badge-in { animation: badge-in 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
}
