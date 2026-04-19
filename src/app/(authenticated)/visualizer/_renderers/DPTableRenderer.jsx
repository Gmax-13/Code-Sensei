"use client";
import React from "react";

/**
 * DPTableRenderer — LCS dynamic programming table visualization.
 *
 * Improvements over v1:
 *  - Dark canvas (bg-gray-950) with high-contrast cell colors
 *  - Active cell has a glowing ring + scale-up effect via inline style
 *  - Match cells glow green, mismatch cells glow rose
 *  - Unfilled cells shown as subtle "·" instead of "-" on dark bg
 *  - Column/row headers clearly show the string characters
 *  - LCS length indicator at the bottom
 *  - Table scrolls horizontally for long strings
 */

export default function DPTableRenderer({ step }) {
    if (!step?.dp) return null;
    const { str1, str2, dp, i: currI, j: currJ, match } = step;

    const lcsLen = dp[dp.length - 1]?.[dp[0]?.length - 1] ?? "?";

    return (
        <div className="w-full h-full flex flex-col bg-gray-950 rounded-xl overflow-hidden">
            <div className="flex-1 overflow-auto p-4">
                <table className="border-collapse mx-auto">
                    <thead>
                        <tr>
                            {/* corner cell */}
                            <th className="w-10 h-10 border border-gray-800 bg-gray-900" />
                            {/* empty column for base-case (j=0) */}
                            <th className="w-10 h-10 border border-gray-800 bg-gray-900 text-gray-600 text-[11px] font-mono">∅</th>
                            {/* str2 characters */}
                            {str2.split("").map((ch, idx) => (
                                <th
                                    key={idx}
                                    className={`w-10 h-10 border text-[11px] font-mono font-bold transition-colors duration-200
                                        ${currJ === idx + 1
                                            ? "border-blue-500 bg-blue-900/40 text-blue-300"
                                            : "border-gray-800 bg-gray-900 text-gray-400"
                                        }`}
                                >
                                    {ch}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {dp.map((row, i) => (
                            <tr key={i}>
                                {/* row header */}
                                <th className={`w-10 h-10 border text-[11px] font-mono font-bold transition-colors duration-200
                                    ${currI === i && i > 0
                                        ? "border-blue-500 bg-blue-900/40 text-blue-300"
                                        : "border-gray-800 bg-gray-900 text-gray-400"
                                    }`}
                                >
                                    {i === 0 ? <span className="text-gray-600">∅</span> : str1[i - 1]}
                                </th>

                                {row.map((cell, j) => {
                                    const isCurrent = currI === i && currJ === j;
                                    const isFilled  = cell !== null && cell !== undefined;

                                    let cellStyle = "w-10 h-10 border text-center text-sm font-mono font-semibold transition-all duration-300 ";

                                    if (isCurrent) {
                                        cellStyle += match
                                            ? "border-emerald-400 bg-emerald-900/60 text-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                                            : "border-rose-400 bg-rose-900/60 text-rose-300 shadow-[0_0_8px_rgba(251,113,133,0.5)]";
                                    } else if (isFilled) {
                                        cellStyle += "border-gray-700 bg-gray-800/80 text-gray-300";
                                    } else {
                                        cellStyle += "border-gray-800 bg-gray-900 text-gray-700";
                                    }

                                    return (
                                        <td
                                            key={j}
                                            className={cellStyle}
                                            style={isCurrent ? { transform: "scale(1.1)", zIndex: 10, position: "relative" } : {}}
                                        >
                                            {isFilled ? cell : "·"}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Bottom strip — match indicator + LCS length */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-t border-gray-800 text-[11px] font-mono">
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Match → dp[i][j] = dp[i-1][j-1] + 1
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" /> No match → max(dp[i-1][j], dp[i][j-1])
                    </span>
                </div>
                <span className="text-gray-400">
                    LCS length so far: <span className="text-emerald-400 font-bold">{lcsLen}</span>
                </span>
            </div>
        </div>
    );
}
