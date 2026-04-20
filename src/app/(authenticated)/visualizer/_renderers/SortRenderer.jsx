"use client";
import React, { useEffect, useRef } from "react";

/**
 * SortRenderer — animated bar chart for sorting algorithms.
 *
 * Improvements over v1:
 *  - Bars use CSS custom properties for height so they transition smoothly
 *  - Swapped elements get a @keyframes "bounce-swap" shake animation
 *  - Gradient fills instead of flat colors — blue / amber / rose
 *  - Labels sit ABOVE the bar (always visible, never rotated)
 *  - Index numbers shown below each bar
 *  - Canvas fills full available height (no wasted empty space)
 */

const BAR_COLORS = {
    default:   { bg: "from-blue-500 to-blue-400",   shadow: "shadow-blue-500/40",  text: "text-blue-100" },
    comparing: { bg: "from-amber-400 to-yellow-300", shadow: "shadow-amber-400/40", text: "text-amber-900" },
    swapped:   { bg: "from-rose-500 to-red-400",     shadow: "shadow-rose-500/40",  text: "text-rose-100" },
};

export default function SortRenderer({ step }) {
    if (!step?.array) return null;

    const maxVal = Math.max(...step.array, 1);

    return (
        <div className="w-full h-full flex flex-col justify-end px-6 pb-4 pt-8 bg-gray-950 rounded-xl">
            {/* Bars */}
            <div className="flex items-end justify-center gap-2 flex-1">
                {step.array.map((value, idx) => {
                    const isComparing = step.comparing?.includes(idx);
                    const isSwapped   = step.swapped && isComparing;

                    const color = isSwapped
                        ? BAR_COLORS.swapped
                        : isComparing
                            ? BAR_COLORS.comparing
                            : BAR_COLORS.default;

                    const heightPct = Math.max((value / maxVal) * 100, 6);

                    return (
                        <div
                            key={idx}
                            className="flex flex-col items-center gap-1 flex-1 max-w-[52px]"
                            style={{ minWidth: 0 }}
                        >
                            {/* Value label above bar */}
                            <span className={`text-[11px] font-mono font-semibold transition-colors duration-200 ${
                                isSwapped ? "text-rose-400" : isComparing ? "text-amber-400" : "text-blue-300"
                            }`}>
                                {value}
                            </span>

                            {/* The bar itself */}
                            <div
                                className={`
                                    w-full rounded-t-md bg-gradient-to-t ${color.bg}
                                    shadow-lg ${color.shadow}
                                    transition-all duration-300 ease-out
                                    ${isSwapped ? "animate-swap-shake" : ""}
                                `}
                                style={{ height: `${heightPct}%` }}
                            />

                            {/* Index label below bar */}
                            <span className="text-[10px] text-gray-500 font-mono">{idx}</span>
                        </div>
                    );
                })}
            </div>

            {/* X-axis baseline */}
            <div className="h-px bg-gray-700 mt-1 mx-1" />

            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 justify-center">
                {[
                    { color: "bg-blue-500",   label: "Unsorted"  },
                    { color: "bg-amber-400",  label: "Comparing" },
                    { color: "bg-rose-500",   label: "Swapping"  },
                ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-1.5">
                        <div className={`w-2.5 h-2.5 rounded-sm ${color}`} />
                        <span className="text-[11px] text-gray-400">{label}</span>
                    </div>
                ))}
            </div>

            {/* Global keyframe injected via a style tag — no Tailwind plugin needed */}
            <style>{`
                @keyframes swap-shake {
                    0%   { transform: translateY(0) scaleX(1); }
                    25%  { transform: translateY(-8px) scaleX(1.05); }
                    50%  { transform: translateY(-4px) scaleX(0.97); }
                    75%  { transform: translateY(-10px) scaleX(1.03); }
                    100% { transform: translateY(0) scaleX(1); }
                }
                .animate-swap-shake { animation: swap-shake 0.35s ease-out; }
            `}</style>
        </div>
    );
}
