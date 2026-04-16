"use client";
import React from "react";

export default function AIAnnotationBadge({ annotation, isLoading, tracerPreComputed }) {
    if (isLoading) {
        return (
            <div className="flex items-center gap-3 p-3 mt-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/20 rounded-lg animate-pulse">
                <span className="text-amber-500 animate-spin">⧗</span>
                <span className="text-sm text-amber-700 dark:text-amber-400">Groq is analysing this step...</span>
            </div>
        );
    }

    // `tracerPreComputed` is for Gemini frames which come full of annotations instantly
    const text = annotation || tracerPreComputed;

    if (!text) return null;

    return (
        <div className="flex items-start gap-3 p-4 mt-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/30 rounded-lg shadow-sm">
            <span className="text-amber-500 text-lg mt-0.5">🧠</span>
            <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
                {text}
            </p>
        </div>
    );
}
