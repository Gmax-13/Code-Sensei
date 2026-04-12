"use client";
import React from "react";

export default function Timeline({ totalSteps, currentStep, setStep }) {
    if (totalSteps <= 1) return null;

    return (
        <div className="w-full mt-4 space-y-2">
            <div className="flex justify-between text-xs text-gray-400">
                <span>Start</span>
                <span>Step {currentStep + 1} / {totalSteps}</span>
                <span>End</span>
            </div>
            <div className="relative flex items-center h-4">
                <input
                    type="range"
                    min={0}
                    max={totalSteps - 1}
                    value={currentStep}
                    onChange={(e) => setStep(Number(e.target.value))}
                    className="w-full h-1 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 z-10 accent-blue-600"
                />
            </div>
        </div>
    );
}
