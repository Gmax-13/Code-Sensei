"use client";
import React, { useState } from 'react';
import DSAEngine from './_engines/DSAEngine';
import TracerEngine from './_engines/TracerEngine';

export default function VisualizerPage() {
    const [activeTab, setActiveTab] = useState("dsa");

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <span className="text-4xl">💡</span>
                    Dual-Engine Visualizer
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                    {activeTab === "dsa" 
                        ? "Interactive Data Structures & Algorithms with Groq AI annotations."
                        : "Deep Code Execution Tracer powered by Gemini 2.5 Flash."}
                </p>
            </div>

            {/* Tab Selector */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setActiveTab("dsa")}
                    className={`flex-1 py-4 text-center font-medium transition-colors border-b-2 ${
                        activeTab === "dsa" 
                        ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10" 
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                >
                    <span className="mr-2">🧱</span>
                    DSA Engine
                </button>
                <button
                    onClick={() => setActiveTab("tracer")}
                    className={`flex-1 py-4 text-center font-medium transition-colors border-b-2 ${
                        activeTab === "tracer" 
                        ? "border-purple-600 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/10" 
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                >
                    <span className="mr-2">🕵️‍♂️</span>
                    Code Tracer Engine
                </button>
            </div>

            {/* Active Engine */}
            <div className="pt-2">
                {activeTab === "dsa" ? <DSAEngine /> : <TracerEngine />}
            </div>
        </div>
    );
}
