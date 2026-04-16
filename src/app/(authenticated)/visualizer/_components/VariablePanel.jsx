"use client";
import React from "react";

export default function VariablePanel({ variables }) {
    if (!variables || Object.keys(variables).length === 0) {
        return (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Variables</h3>
                <p className="text-sm text-gray-400 italic">No variables tracked</p>
            </div>
        );
    }

    return (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 h-full">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Variables</h3>
            <div className="space-y-2">
                {Object.entries(variables).map(([name, value]) => (
                    <div key={name} className="flex items-center justify-between font-mono text-sm">
                        <span className="text-purple-600 dark:text-purple-400 font-semibold">{name}</span>
                        <span className="text-gray-800 dark:text-gray-200 truncate max-w-[150px]" title={String(value)}>
                            {String(value)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
