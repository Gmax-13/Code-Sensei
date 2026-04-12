"use client";
import React from "react";

export default function CallStackPanel({ callStack }) {
    if (!callStack || callStack.length === 0) {
        return (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Call Stack</h3>
                <p className="text-sm text-gray-400 italic">Empty stack</p>
            </div>
        );
    }

    return (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 h-full">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Call Stack</h3>
            <div className="flex flex-col gap-1">
                {[...callStack].reverse().map((func, i) => (
                    <div 
                        key={i} 
                        className={`px-3 py-1.5 rounded text-sm font-mono
                            ${i === 0 
                                ? "bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800" 
                                : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-transparent"}
                        `}
                    >
                        {func}()
                    </div>
                ))}
            </div>
        </div>
    );
}
