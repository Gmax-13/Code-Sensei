/**
 * DSA Visualizer Page
 * ---------------------
 * Full MVP page for visualizing data structures and algorithms.
 * Supports:
 *   - Bubble Sort (with step-by-step bar chart animation)
 *   - Merge Sort (with step-by-step split/merge visualization)
 *   - Stack simulation (push/pop/peek with visual stack)
 *   - Queue simulation (enqueue/dequeue/peek with visual queue)
 *
 * Each algorithm runs through the backend DSA engine API
 * and returns step-by-step states for animated playback.
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { useExecuteDSA } from "@/hooks/useApi";

/** Available algorithm options */
const ALGORITHMS = [
    { value: "bubbleSort", label: "Bubble Sort", type: "sort" },
    { value: "mergeSort", label: "Merge Sort", type: "sort" },
    { value: "stack", label: "Stack", type: "ds" },
    { value: "queue", label: "Queue", type: "ds" },
];

export default function VisualizerPage() {
    // Currently selected algorithm
    const [algorithm, setAlgorithm] = useState("bubbleSort");

    // Input for sorting algorithms (comma-separated numbers)
    const [arrayInput, setArrayInput] = useState("64, 34, 25, 12, 22, 11, 90");

    // Input for data structure operations
    const [dsInput, setDsInput] = useState("");

    // Steps returned from the API
    const [steps, setSteps] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // Playback speed in ms between steps
    const [speed, setSpeed] = useState(500);

    const executeDSA = useExecuteDSA();
    const timerRef = useRef(null);

    /** Auto-play through steps */
    useEffect(() => {
        if (isPlaying && currentStep < steps.length - 1) {
            timerRef.current = setTimeout(() => {
                setCurrentStep((prev) => prev + 1);
            }, speed);
        } else if (currentStep >= steps.length - 1) {
            setIsPlaying(false);
        }

        return () => clearTimeout(timerRef.current);
    }, [isPlaying, currentStep, steps.length, speed]);

    /** Get the type of the currently selected algorithm */
    const currentAlgoType = ALGORITHMS.find((a) => a.value === algorithm)?.type;

    /** Execute the selected algorithm */
    const handleExecute = async () => {
        setSteps([]);
        setCurrentStep(0);
        setIsPlaying(false);

        try {
            if (currentAlgoType === "sort") {
                // Parse comma-separated numbers
                const data = arrayInput.split(",").map((n) => parseInt(n.trim())).filter((n) => !isNaN(n));
                if (data.length === 0) return;

                const result = await executeDSA.mutateAsync({ algorithm, data });
                setSteps(result.steps || []);
            } else {
                // Parse data structure operations from textarea
                const operations = parseOperations(dsInput, algorithm);
                if (operations.length === 0) return;

                const result = await executeDSA.mutateAsync({ algorithm, operations });
                setSteps(result.steps || []);
            }
        } catch (err) {
            console.error("DSA execution failed:", err);
        }
    };

    /** Parse user input into operation objects for stack/queue */
    function parseOperations(input, algo) {
        const lines = input.split("\n").filter((l) => l.trim());
        return lines.map((line) => {
            const parts = line.trim().split(" ");
            const operation = parts[0]?.toLowerCase();
            const value = parts[1] ? parseInt(parts[1]) : undefined;

            if (algo === "stack") {
                if (["push", "pop", "peek"].includes(operation)) {
                    return { operation, value };
                }
            } else if (algo === "queue") {
                if (["enqueue", "dequeue", "peek"].includes(operation)) {
                    return { operation, value };
                }
            }
            return { operation, value };
        });
    }

    // Current step data for rendering
    const step = steps[currentStep] || null;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* ---- Page Header ---- */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    🔬 DSA Visualizer
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Step through algorithms and data structures visually.
                </p>
            </div>

            {/* ---- Controls Panel ---- */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                {/* Algorithm selector */}
                <div className="flex flex-wrap gap-2">
                    {ALGORITHMS.map((algo) => (
                        <button
                            key={algo.value}
                            onClick={() => { setAlgorithm(algo.value); setSteps([]); setCurrentStep(0); }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${algorithm === algo.value
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                }`}
                        >
                            {algo.label}
                        </button>
                    ))}
                </div>

                {/* Input area - different for sort vs data structures */}
                {currentAlgoType === "sort" ? (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Array (comma-separated numbers)
                        </label>
                        <input
                            type="text"
                            value={arrayInput}
                            onChange={(e) => setArrayInput(e.target.value)}
                            placeholder="e.g., 64, 34, 25, 12, 22, 11, 90"
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 
                         dark:border-gray-600 rounded-lg text-gray-900 dark:text-white
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Operations (one per line: {algorithm === "stack" ? "push 5 / pop / peek" : "enqueue 5 / dequeue / peek"})
                        </label>
                        <textarea
                            value={dsInput}
                            onChange={(e) => setDsInput(e.target.value)}
                            rows={6}
                            placeholder={
                                algorithm === "stack"
                                    ? "push 10\npush 20\npush 30\npop\npeek\npush 40"
                                    : "enqueue 10\nenqueue 20\nenqueue 30\ndequeue\npeek\nenqueue 40"
                            }
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 
                         dark:border-gray-600 rounded-lg text-gray-900 dark:text-white
                         placeholder-gray-400 font-mono text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                        />
                    </div>
                )}

                {/* Execute button */}
                <button
                    onClick={handleExecute}
                    disabled={executeDSA.isPending}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium
                     rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {executeDSA.isPending ? "Processing..." : "Execute"}
                </button>
            </div>

            {/* ---- Visualization Area ---- */}
            {steps.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                    {/* Playback controls */}
                    <div className="flex items-center gap-4 flex-wrap">
                        <button
                            onClick={() => setCurrentStep(0)}
                            className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                            ⏮ Start
                        </button>
                        <button
                            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                            className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                            ◀ Prev
                        </button>
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                        >
                            {isPlaying ? "⏸ Pause" : "▶ Play"}
                        </button>
                        <button
                            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                            className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                            Next ▶
                        </button>
                        <button
                            onClick={() => setCurrentStep(steps.length - 1)}
                            className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                            End ⏭
                        </button>

                        {/* Speed control */}
                        <div className="flex items-center gap-2 ml-auto">
                            <span className="text-sm text-gray-500">Speed:</span>
                            <input
                                type="range"
                                min={100}
                                max={2000}
                                step={100}
                                value={speed}
                                onChange={(e) => setSpeed(Number(e.target.value))}
                                className="w-24"
                            />
                            <span className="text-sm text-gray-400">{speed}ms</span>
                        </div>
                    </div>

                    {/* Step counter */}
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Step {currentStep + 1} of {steps.length}
                    </div>

                    {/* Step description */}
                    {step?.description && (
                        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-700 dark:text-blue-300 text-sm">
                            {step.description}
                        </div>
                    )}

                    {/* Visual rendering based on algorithm type */}
                    {currentAlgoType === "sort" ? (
                        <SortVisualization step={step} />
                    ) : algorithm === "stack" ? (
                        <StackVisualization step={step} />
                    ) : (
                        <QueueVisualization step={step} />
                    )}

                    {/* Step progress bar */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Bar chart visualization for sorting algorithms.
 * Highlights elements currently being compared or swapped.
 */
function SortVisualization({ step }) {
    if (!step?.array) return null;

    const maxVal = Math.max(...step.array, 1);

    return (
        <div className="flex items-end gap-1 h-64 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            {step.array.map((value, idx) => {
                // Determine bar color based on step state
                const isComparing = step.comparing?.includes(idx);
                const isSwapped = step.swapped && isComparing;

                let barColor = "bg-blue-500"; // Default
                if (isSwapped) barColor = "bg-red-500";      // Swapped
                else if (isComparing) barColor = "bg-yellow-400"; // Comparing

                const height = `${(value / maxVal) * 100}%`;

                return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                        <div
                            className={`w-full ${barColor} rounded-t-sm transition-all duration-300`}
                            style={{ height }}
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400">{value}</span>
                    </div>
                );
            })}
        </div>
    );
}

/**
 * Visual stack representation (vertical, top = top of stack).
 */
function StackVisualization({ step }) {
    if (!step) return null;

    const stack = step.stack || [];

    return (
        <div className="flex flex-col items-center gap-1 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            {/* Show "TOP" label */}
            <div className="text-xs text-gray-400 mb-2">← TOP</div>

            {stack.length === 0 ? (
                <div className="text-gray-400 text-sm py-8">Stack is empty</div>
            ) : (
                /* Render from top to bottom (reversed array) */
                [...stack].reverse().map((item, idx) => (
                    <div
                        key={idx}
                        className={`w-32 py-2 text-center rounded border text-sm font-mono
              ${idx === 0
                                ? "bg-green-500/20 border-green-500 text-green-700 dark:text-green-300" // Top element
                                : "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300"
                            }`}
                    >
                        {item}
                    </div>
                ))
            )}

            <div className="w-32 border-t-2 border-gray-400 dark:border-gray-500 mt-1" />
            <div className="text-xs text-gray-400">BOTTOM</div>

            {/* Show operation result */}
            {step.result !== null && step.result !== undefined && (
                <div className="mt-3 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-700 dark:text-purple-300 text-sm">
                    Result: <span className="font-mono font-bold">{step.result}</span>
                </div>
            )}
        </div>
    );
}

/**
 * Visual queue representation (horizontal, left = front).
 */
function QueueVisualization({ step }) {
    if (!step) return null;

    const queue = step.queue || [];

    return (
        <div className="flex flex-col items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex items-center gap-1">
                <div className="text-xs text-gray-400 mr-2">FRONT →</div>

                {queue.length === 0 ? (
                    <div className="text-gray-400 text-sm py-4">Queue is empty</div>
                ) : (
                    queue.map((item, idx) => (
                        <div
                            key={idx}
                            className={`w-16 py-3 text-center rounded border text-sm font-mono
                ${idx === 0
                                    ? "bg-green-500/20 border-green-500 text-green-700 dark:text-green-300" // Front
                                    : idx === queue.length - 1
                                        ? "bg-orange-500/20 border-orange-500 text-orange-700 dark:text-orange-300" // Rear
                                        : "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300"
                                }`}
                        >
                            {item}
                        </div>
                    ))
                )}

                <div className="text-xs text-gray-400 ml-2">← REAR</div>
            </div>

            {/* Show operation result */}
            {step.result !== null && step.result !== undefined && (
                <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-700 dark:text-purple-300 text-sm">
                    Result: <span className="font-mono font-bold">{step.result}</span>
                </div>
            )}
        </div>
    );
}
