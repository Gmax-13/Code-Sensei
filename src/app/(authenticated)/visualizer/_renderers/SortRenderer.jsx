"use client";
import React from 'react';

export default function SortRenderer({ step }) {
    if (!step?.array) return null;
    const maxVal = Math.max(...step.array, 1);

    return (
        <div className="flex items-end justify-center gap-1 h-64 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg w-full">
            {step.array.map((value, idx) => {
                const isComparing = step.comparing?.includes(idx);
                const isSwapped = step.swapped && isComparing;
                let barColor = "bg-blue-500 text-blue-100";
                if (isSwapped) barColor = "bg-red-500 text-red-100";
                else if (isComparing) barColor = "bg-yellow-400 text-yellow-900";

                const height = `${Math.max((value / maxVal) * 100, 10)}%`;

                return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 max-w-[40px]">
                        <div
                            className={`w-full ${barColor} rounded-t-sm transition-all duration-300 flex items-end justify-center pb-1`}
                            style={{ height }}
                        >
                            <span className="text-[10px] font-mono opacity-80 rotate-90 sm:rotate-0 sm:text-xs">
                                {value}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
