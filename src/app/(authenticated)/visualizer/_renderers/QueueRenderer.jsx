"use client";
import React from 'react';

export default function QueueRenderer({ step }) {
    if (!step) return null;
    const queue = step.queue || [];
    return (
        <div className="flex flex-col items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-x-auto min-h-[160px]">
            <div className="flex items-center gap-2 min-w-max">
                <div className="text-xs text-gray-400 mr-2 font-mono">FRONT →</div>
                {queue.length === 0 ? (
                    <div className="text-gray-400 text-sm py-4 w-48 text-center italic">Queue is empty</div>
                ) : (
                    queue.map((item, idx) => (
                        <div key={idx} className={`w-16 h-16 flex items-center justify-center rounded border text-sm font-mono flex-shrink-0 shadow-sm transition-colors duration-300 ${idx === 0 ? "bg-green-500/20 border-green-500 text-green-700 dark:text-green-300" : idx === queue.length - 1 ? "bg-orange-500/20 border-orange-500 text-orange-700 dark:text-orange-300" : "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300"}`}>
                            {item}
                        </div>
                    ))
                )}
                <div className="text-xs text-gray-400 ml-2 font-mono">← REAR</div>
            </div>
            {step.result !== null && step.result !== undefined && (
                <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-700 dark:text-purple-300 text-sm animate-pulse">
                    Result: <span className="font-mono font-bold">{step.result}</span>
                </div>
            )}
        </div>
    );
}
