"use client";
import React from "react";

/**
 * QueueRenderer — animated horizontal queue visualization.
 *
 * Improvements over v1:
 *  - FRONT item glows green, REAR item glows orange, connectors between items
 *  - Slide-in animation from the right for new elements (enqueue)
 *  - Operation badge at the top
 *  - Directional arrows between items to show FIFO flow
 *  - Wider cells, larger text, better contrast on dark canvas
 */

export default function QueueRenderer({ step }) {
    if (!step) return null;
    const queue = step.queue || [];
    const op    = step.operation?.toUpperCase();

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-950 rounded-xl p-6 gap-6">

            {/* Operation badge */}
            {op && op !== "INIT" && (
                <div className={`
                    px-4 py-1 rounded-full text-xs font-bold tracking-widest border animate-op-flash
                    ${op === "ENQUEUE" ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : ""}
                    ${op === "DEQUEUE" ? "bg-rose-500/20    border-rose-500    text-rose-400"    : ""}
                    ${op === "PEEK"    ? "bg-purple-500/20  border-purple-500  text-purple-400"  : ""}
                `}>
                    {op}
                </div>
            )}

            {/* Queue lane */}
            <div className="flex items-center gap-0 overflow-x-auto max-w-full pb-2">
                {/* FRONT label */}
                <div className="flex flex-col items-center mr-3 flex-shrink-0">
                    <span className="text-[10px] text-gray-500 font-mono tracking-widest">FRONT</span>
                    <span className="text-gray-500 text-lg mt-0.5">→</span>
                </div>

                {queue.length === 0 ? (
                    <div className="text-gray-500 text-sm py-8 px-16 italic border border-dashed border-gray-700 rounded-lg text-center">
                        Empty
                    </div>
                ) : (
                    queue.map((item, idx) => {
                        const isFront = idx === 0;
                        const isRear  = idx === queue.length - 1;
                        return (
                            <React.Fragment key={`${item}-${idx}`}>
                                <div className={`
                                    w-16 h-16 flex flex-col items-center justify-center rounded-lg border
                                    text-base font-mono flex-shrink-0
                                    transition-all duration-300 animate-queue-in
                                    ${isFront
                                        ? "bg-emerald-500/15 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-500/20 scale-110"
                                        : isRear
                                            ? "bg-orange-500/15 border-orange-400 text-orange-300 shadow-lg shadow-orange-500/20"
                                            : "bg-blue-500/10 border-blue-500/30 text-blue-300"
                                    }
                                `}>
                                    <span className="font-bold">{item}</span>
                                    {isFront && <span className="text-[9px] text-emerald-400 mt-0.5">front</span>}
                                    {isRear && !isFront && <span className="text-[9px] text-orange-400 mt-0.5">rear</span>}
                                </div>

                                {/* Arrow connector between items */}
                                {idx < queue.length - 1 && (
                                    <div className="text-gray-600 text-sm px-1 flex-shrink-0">→</div>
                                )}
                            </React.Fragment>
                        );
                    })
                )}

                {/* REAR label */}
                <div className="flex flex-col items-center ml-3 flex-shrink-0">
                    <span className="text-[10px] text-gray-500 font-mono tracking-widest">REAR</span>
                    <span className="text-gray-500 text-lg mt-0.5">←</span>
                </div>
            </div>

            {/* Result bubble */}
            {step.result != null && (
                <div className="px-5 py-2 bg-purple-500/15 border border-purple-500/40 rounded-full text-purple-300 text-sm font-mono animate-fade-in">
                    → <span className="font-bold">{step.result}</span>
                </div>
            )}

            <style>{`
                @keyframes queue-in {
                    from { opacity: 0; transform: translateX(16px) scale(0.9); }
                    to   { opacity: 1; transform: translateX(0)    scale(1);   }
                }
                @keyframes op-flash {
                    0%,100% { opacity: 1; }
                    50%     { opacity: 0.4; }
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.9); }
                    to   { opacity: 1; transform: scale(1);   }
                }
                .animate-queue-in { animation: queue-in  0.25s ease-out; }
                .animate-op-flash { animation: op-flash  0.5s ease-in-out 2; }
                .animate-fade-in  { animation: fade-in   0.3s ease-out; }
            `}</style>
        </div>
    );
}
