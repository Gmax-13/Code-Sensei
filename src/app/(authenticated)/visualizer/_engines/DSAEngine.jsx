"use client";
import React, { useState } from 'react';
import { useExecuteDSA } from "@/hooks/useApi";
import { useTimeline } from "../_hooks/useTimeline";
import { useGroqAnnotation } from "../_hooks/useGroqAnnotation";
import Timeline from "../_components/Timeline";
import PlaybackControls from "../_components/PlaybackControls";
import AIAnnotationBadge from "../_components/AIAnnotationBadge";
import SortRenderer from "../_renderers/SortRenderer";
import StackRenderer from "../_renderers/StackRenderer";
import QueueRenderer from "../_renderers/QueueRenderer";
import TreeRenderer from "../_renderers/TreeRenderer";
import GraphRenderer from "../_renderers/GraphRenderer";
import DPTableRenderer from "../_renderers/DPTableRenderer";

const DSA_ALGORITHMS = [
    { value: "bubbleSort", label: "Bubble Sort", type: "sort" },
    { value: "mergeSort", label: "Merge Sort", type: "sort" },
    { value: "binaryTree", label: "Binary Search Tree", type: "tree" },
    { value: "bfsGraph", label: "BFS Graph", type: "graph" },
    { value: "dpLCS", label: "DP: LCS", type: "dp" },
    { value: "stack", label: "Stack", type: "ds" },
    { value: "queue", label: "Queue", type: "ds" }
];

export default function DSAEngine() {
    const [algorithm, setAlgorithm] = useState("bubbleSort");
    const [input, setInput] = useState("64, 34, 25, 12, 22, 11, 90");
    const [steps, setSteps] = useState([]);
    
    const execute = useExecuteDSA();
    const timeline = useTimeline(steps);
    
    const { annotation, isLoading } = useGroqAnnotation(
        timeline.currentStep,
        timeline.stepData?.description,
        algorithm,
        timeline.isPlaying
    );

    const handleExecute = async () => {
        try {
            let data = null;
            let operations = null;

            if (["bubbleSort", "mergeSort"].includes(algorithm)) {
                data = input.split(",").map(n => Number(n.trim())).filter(n => !isNaN(n));
            } else if (algorithm === "stack" || algorithm === "queue") {
                operations = input.split("\n").filter(l => l.trim()).map(line => {
                    const parts = line.trim().split(" ");
                    return { operation: parts[0]?.toLowerCase(), value: Number(parts[1]) || undefined };
                });
            } else if (algorithm === "binaryTree") {
                operations = input.split("\n").filter(l => l.trim()).map(val => ({ operation: "insert", value: Number(val.trim()) }));
            } else if (algorithm === "bfsGraph") {
                operations = {
                    startNode: "A",
                    graphData: {
                        nodes: [{id:"A"}, {id:"B"}, {id:"C"}, {id:"D"}, {id:"E"}],
                        edges: [{from:"A",to:"B"}, {from:"A",to:"C"}, {from:"B",to:"D"}, {from:"C",to:"E"}]
                    }
                };
            } else if (algorithm === "dpLCS") {
                const parts = input.split(",");
                operations = { str1: parts[0] || "ABCDGH", str2: parts[1] || "AEDFHR" };
            }

            const result = await execute.mutateAsync({ algorithm, data, operations });
            setSteps(result.steps || []);
        } catch (err) {
            console.error("Execute error:", err);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Control Panel */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4 shadow-sm">
                <div className="flex flex-wrap gap-2">
                    {DSA_ALGORITHMS.map(algo => (
                        <button key={algo.value}
                            onClick={() => { setAlgorithm(algo.value); setSteps([]); setInput(""); }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${algorithm === algo.value ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"}`}
                        >
                            {algo.label}
                        </button>
                    ))}
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Input Data
                    </label>
                    {["bubbleSort", "mergeSort", "dpLCS"].includes(algorithm) ? (
                        <input type="text" value={input} onChange={e => setInput(e.target.value)} 
                            placeholder={algorithm === "dpLCS" ? "string1, string2" : "e.g., 64, 34, 25"}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                    ) : algorithm === "bfsGraph" ? (
                        <div className="text-sm text-gray-500 italic bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                            Using a predefined sample graph (Nodes A-E) for demonstration.
                        </div>
                    ) : (
                        <textarea rows={4} value={input} onChange={e => setInput(e.target.value)}
                            placeholder={algorithm === "binaryTree" ? "10\n5\n15..." : "push 10\npop\n"}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                    )}
                </div>

                <button onClick={handleExecute} disabled={execute.isPending} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors">
                    {execute.isPending ? "Computing Steps..." : "Visualise Algorithm"}
                </button>
            </div>

            {/* Visualisation Canvas */}
            {steps.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col shadow-lg">
                    
                    <div className="flex-1 flex items-center justify-center min-h-[300px] mb-4 relative overflow-hidden rounded-xl border border-gray-100 dark:border-gray-700/50">
                        {algorithm.includes("Sort") && <SortRenderer step={timeline.stepData} />}
                        {algorithm === "stack" && <StackRenderer step={timeline.stepData} />}
                        {algorithm === "queue" && <QueueRenderer step={timeline.stepData} />}
                        {algorithm === "binaryTree" && <TreeRenderer step={timeline.stepData} />}
                        {algorithm === "bfsGraph" && <GraphRenderer step={timeline.stepData} />}
                        {algorithm === "dpLCS" && <DPTableRenderer step={timeline.stepData} />}
                    </div>

                    <div className="text-sm text-gray-800 dark:text-gray-200 font-medium mb-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-3 rounded-lg border border-blue-100 dark:border-blue-800/30">
                        {timeline.stepData?.description}
                    </div>

                    <AIAnnotationBadge annotation={annotation} isLoading={isLoading} />
                    
                    <Timeline totalSteps={timeline.totalSteps} currentStep={timeline.currentStep} setStep={timeline.setStep} />
                    
                    <div className="mt-4">
                        <PlaybackControls 
                            isPlaying={timeline.isPlaying} togglePlay={timeline.togglePlay}
                            next={timeline.next} prev={timeline.prev}
                            speed={timeline.speed} setSpeed={timeline.setSpeed}
                            canPrev={timeline.currentStep > 0} 
                            canNext={timeline.currentStep < steps.length - 1} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
