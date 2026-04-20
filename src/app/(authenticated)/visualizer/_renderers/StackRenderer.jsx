"use client";
import React from "react";

/**
 * StackRenderer — animated vertical stack visualization.
 *
 * Improvements over v1:
 *  - Items slide in from the top using CSS @keyframes
 *  - TOP item glows with a green ring and pulsing scale
 *  - Operation badge (PUSH / POP / PEEK) shown with animated color
 *  - Numbered slots so students can track element positions
 *  - Wider, more readable cards
 */

export default function StackRenderer({ step }) {
    if (!step) return null;
    const stack = step.stack || [];
    const op    = step.operation?.toUpperCase();

    return (
        <div className="w-full h-full flex items-center justify-center bg-gray-950 rounded-xl p-6">
            <div className="flex flex-col items-center gap-2 w-48">

                {/* Operation badge */}
                {op && op !== "INIT" && (
                    <div className={`
                        mb-2 px-4 py-1 rounded-full text-xs font-bold tracking-widest border
                        transition-all duration-200 animate-op-flash
                        ${op === "PUSH"  ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : ""}
                        ${op === "POP"   ? "bg-rose-500/20    border-rose-500    text-rose-400"    : ""}
                        ${op === "PEEK"  ? "bg-purple-500/20  border-purple-500  text-purple-400"  : ""}
                    `}>
                        {op}
                    </div>
                )}

                {/* TOP label */}
                <div className="text-[11px] text-gray-500 font-mono tracking-widest self-start ml-1">▼ TOP</div>

                {/* Stack elements — rendered top-to-bottom (reversed) */}
                {stack.length === 0 ? (
                    <div className="text-gray-500 text-sm py-10 italic border border-dashed border-gray-700 rounded-lg w-full text-center">
                        Empty
                    </div>
                ) : (
                    [...stack].reverse().map((item, idx) => {
                        const isTop = idx === 0;
                        return (
                            <div
                                key={`${item}-${idx}`}
                                className={`
                                    w-full py-3 text-center rounded-lg border text-sm font-mono
                                    transition-all duration-300 animate-stack-in
                                    ${isTop
                                        ? "bg-emerald-500/15 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-500/20 scale-105"
                                        : "bg-blue-500/10 border-blue-500/30 text-blue-300"
                                    }
                                `}
                            >
                                <span className="text-gray-500 text-[10px] mr-2 font-sans">
                                    #{stack.length - idx}
                                </span>
                                {item}
                                {isTop && <span className="ml-2 text-emerald-400 text-[10px]">← top</span>}
                            </div>
                        );
                    })
                )}

                {/* Bottom wall */}
                <div className="w-full border-t-2 border-gray-600 mt-1" />
                <div className="text-[11px] text-gray-500 font-mono tracking-widest self-start ml-1">BOTTOM</div>

                {/* Result bubble */}
                {step.result != null && (
                    <div className="mt-4 px-5 py-2 bg-purple-500/15 border border-purple-500/40 rounded-full text-purple-300 text-sm font-mono animate-fade-in">
                        → <span className="font-bold">{step.result}</span>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes stack-in {
                    from { opacity: 0; transform: translateY(-12px) scaleY(0.8); }
                    to   { opacity: 1; transform: translateY(0)       scaleY(1);   }
                }
                @keyframes op-flash {
                    0%,100% { opacity: 1; }
                    50%     { opacity: 0.5; }
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.9); }
                    to   { opacity: 1; transform: scale(1);   }
                }
                .animate-stack-in  { animation: stack-in  0.25s ease-out; }
                .animate-op-flash  { animation: op-flash  0.5s ease-in-out 2; }
                .animate-fade-in   { animation: fade-in   0.3s ease-out; }
            `}</style>
        </div>
    );
}
