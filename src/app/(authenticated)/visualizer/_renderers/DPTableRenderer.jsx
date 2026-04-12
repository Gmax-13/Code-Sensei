"use client";
import React from 'react';

export default function DPTableRenderer({ step }) {
    if (!step?.dp) return null;
    const { str1, str2, dp, i: currI, j: currJ, match } = step;

    return (
        <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-x-auto">
            <table className="border-collapse">
                <thead>
                    <tr>
                        <th className="p-2 border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800"></th>
                        <th className="p-2 border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500">Ø</th>
                        {str2.split('').map((char, idx) => (
                            <th key={idx} className={`p-2 border border-gray-300 dark:border-gray-700 font-mono ${currJ === idx + 1 ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
                                {char}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {dp.map((row, i) => (
                        <tr key={i}>
                            <th className={`p-2 border border-gray-300 dark:border-gray-700 font-mono ${currI === i && i > 0 ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
                                {i === 0 ? <span className="text-gray-500">Ø</span> : str1[i - 1]}
                            </th>
                            {row.map((cell, j) => {
                                const isCurrent = currI === i && currJ === j;
                                const isFilled = cell !== null;
                                
                                let cellClass = "p-2 border border-gray-300 dark:border-gray-700 text-center min-w-[3rem] transition-colors duration-300 ";
                                if (isCurrent) {
                                    cellClass += match ? "bg-green-300 dark:bg-green-600 text-green-900 dark:text-green-50 font-bold scale-105 shadow-sm relative z-10" : "bg-red-300 dark:bg-red-600 text-red-900 dark:text-red-50 font-bold scale-105 shadow-sm relative z-10";
                                } else if (isFilled) {
                                    cellClass += "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200";
                                } else {
                                    cellClass += "bg-gray-200 dark:bg-gray-700/50 text-transparent";
                                }

                                return (
                                    <td key={j} className={cellClass}>
                                        {isFilled ? cell : '-'}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
