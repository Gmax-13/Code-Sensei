"use client";
import React from "react";

/**
 * MergeSortRenderer — dedicated tree-structured visualization for Merge Sort.
 *
 * Each step from the service has: { action, depth, array, left, right }
 * We build up a visible "history" of all steps so you can see:
 *   - The original array at depth 0
 *   - Splits indented level-by-level downward
 *   - Merge result rising back up, highlighted in green
 *
 * The current step's row is highlighted so the user tracks position.
 * Scrolls vertically when the split tree grows tall.
 */

const DEPTH_INDENT = 24; // px indent per depth level

const ACTION_STYLES = {
    "base-case": {
        border:  "border-purple-500/60",
        bg:      "bg-purple-900/20",
        chip:    "bg-purple-800/60 text-purple-300",
        label:   "BASE",
    },
    split: {
        border:  "border-amber-500/50",
        bg:      "bg-amber-900/10",
        chip:    "bg-amber-800/60 text-amber-300",
        label:   "SPLIT",
    },
    merge: {
        border:  "border-emerald-500/60",
        bg:      "bg-emerald-900/20",
        chip:    "bg-emerald-800/60 text-emerald-300",
        label:   "MERGE",
    },
};

/** A single coloured chip for each number in an array */
function ArrayChips({ arr, color = "blue" }) {
    const colorMap = {
        blue:   "bg-blue-800/60 text-blue-200",
        amber:  "bg-amber-800/60 text-amber-200",
        red:    "bg-rose-800/60 text-rose-200",
        green:  "bg-emerald-800/60 text-emerald-200",
        purple: "bg-purple-800/60 text-purple-200",
    };
    return (
        <div className="flex gap-1 flex-wrap">
            {arr.map((v, i) => (
                <span key={i} className={`px-2 py-0.5 rounded text-xs font-mono font-semibold ${colorMap[color]}`}>
                    {v}
                </span>
            ))}
        </div>
    );
}

export default function MergeSortRenderer({ step, allSteps, currentStepIdx }) {
    if (!step) return null;

    // Show all steps up to and including current so the tree builds as you step through
    const visibleSteps = allSteps ? allSteps.slice(0, currentStepIdx + 1) : [step];

    return (
        <div className="w-full h-full overflow-auto bg-gray-950 rounded-xl p-4 space-y-1">

            {/* Original array header */}
            {visibleSteps[0] && (
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-800">
                    <span className="text-[10px] font-mono text-gray-500 tracking-widest uppercase">Original</span>
                    <ArrayChips arr={visibleSteps[0].array} color="blue" />
                </div>
            )}

            {/* Step rows — one per visible step */}
            {visibleSteps.map((s, idx) => {
                const isCurrent = idx === visibleSteps.length - 1;
                const style = ACTION_STYLES[s.action] || ACTION_STYLES.split;
                const depth = s.depth ?? 0;

                return (
                    <div
                        key={idx}
                        className={`
                            flex items-center gap-3 px-3 py-2 rounded-lg border
                            transition-all duration-300
                            ${isCurrent ? `${style.bg} ${style.border} shadow-md` : "border-transparent opacity-50"}
                        `}
                        style={{ marginLeft: `${depth * DEPTH_INDENT}px` }}
                    >
                        {/* Depth connector line */}
                        {depth > 0 && (
                            <span className="text-gray-700 font-mono text-sm flex-shrink-0">
                                {"└─"}
                            </span>
                        )}

                        {/* Action chip */}
                        <span className={`text-[9px] font-bold tracking-widest px-2 py-0.5 rounded flex-shrink-0 ${style.chip}`}>
                            {style.label}
                        </span>

                        {/* Arrays displayed inline */}
                        {s.action === "split" && (
                            <div className="flex items-center gap-2 flex-wrap">
                                <ArrayChips arr={s.array} color="amber" />
                                <span className="text-gray-600 text-xs">→</span>
                                <ArrayChips arr={s.left}  color="blue" />
                                <span className="text-gray-600 text-xs">|</span>
                                <ArrayChips arr={s.right} color="red" />
                            </div>
                        )}
                        {s.action === "merge" && (
                            <div className="flex items-center gap-2 flex-wrap">
                                <ArrayChips arr={s.left}  color="blue" />
                                <span className="text-gray-600 text-xs">+</span>
                                <ArrayChips arr={s.right} color="red" />
                                <span className="text-gray-600 text-xs">→</span>
                                <ArrayChips arr={s.array} color="green" />
                            </div>
                        )}
                        {s.action === "base-case" && (
                            <ArrayChips arr={s.array} color="purple" />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
