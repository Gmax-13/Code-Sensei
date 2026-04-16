"use client";
import React from "react";

export default function PlaybackControls({
    isPlaying,
    togglePlay,
    next,
    prev,
    speed,
    setSpeed,
    canPrev,
    canNext
}) {
    return (
        <div className="flex items-center flex-wrap gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <button
                onClick={prev}
                disabled={!canPrev}
                className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-200"
            >
                ◀ Prev
            </button>
            <button
                onClick={togglePlay}
                disabled={!canNext && !isPlaying}
                className="px-6 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 shadow-sm"
            >
                {isPlaying ? "⏸ Pause" : "▶ Play"}
            </button>
            <button
                onClick={next}
                disabled={!canNext}
                className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-200"
            >
                Next ▶
            </button>
            
            <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-gray-500 dark:text-gray-400">Speed</span>
                <input
                    title="Playback Speed"
                    type="range"
                    min={100}
                    max={2000}
                    step={100}
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-24 accent-blue-600 dark:accent-blue-500"
                    style={{ direction: 'rtl' }} // makes right=faster, left=slower (smaller wait time = faster)
                />
            </div>
        </div>
    );
}
