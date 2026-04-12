"use client";
import React from 'react';

export default function StackRenderer({ step }) {
    if (!step) return null;
    const stack = step.stack || [];
    return (
        <div className="flex flex-col items-center gap-1 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-xs text-gray-400 mb-2">← TOP</div>
            {stack.length === 0 ? (
                <div className="text-gray-400 text-sm py-8">Stack is empty</div>
            ) : (
                [...stack].reverse().map((item, idx) => (
                    <div key={idx} className={`w-32 py-2 text-center rounded border text-sm font-mono transition-colors duration-300 ${idx === 0 ? "bg-green-500/20 border-green-500 text-green-700 dark:text-green-300" : "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300"}`}>
                        {item}
                    </div>
                ))
            )}
            <div className="w-32 border-t-2 border-gray-400 dark:border-gray-500 mt-1" />
            <div className="text-xs text-gray-400">BOTTOM</div>
            {step.result !== null && step.result !== undefined && (
                <div className="mt-3 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-700 dark:text-purple-300 text-sm animate-pulse">
                    Result: <span className="font-mono font-bold">{step.result}</span>
                </div>
            )}
        </div>
    );
}
