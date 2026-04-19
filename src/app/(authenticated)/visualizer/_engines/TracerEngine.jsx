"use client";
import React, { useState } from 'react';
import { useTracerExecution } from "../_hooks/useTracerExecution";
import { useTimeline } from "../_hooks/useTimeline";
import CodeMirrorEditor from "../_components/CodeMirrorEditor";
import PlaybackControls from "../_components/PlaybackControls";
import Timeline from "../_components/Timeline";
import VariablePanel from "../_components/VariablePanel";
import CallStackPanel from "../_components/CallStackPanel";
import AIAnnotationBadge from "../_components/AIAnnotationBadge";

const SAMPLE_CODE = `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
// Simulated call
fibonacci(4);`;

export default function TracerEngine() {
    const [code, setCode] = useState(SAMPLE_CODE);
    
    // API Hook
    const { frames, isAnalyzing, error, analyzeCode } = useTracerExecution();
    
    // Timeline Hook
    const timeline = useTimeline(frames);

    const handleAnalyze = () => {
        analyzeCode(code, "javascript");
    };

    const currentFrame = timeline.stepData;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-500">
            {/* LEFT PANEL: Editor */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex flex-col shadow-sm max-h-[800px]">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Source Code</h2>
                    <span className="text-[10px] font-mono px-2 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded">
                        AI auto-detects language
                    </span>
                </div>
                
                <div className="flex-1 overflow-hidden">
                    <CodeMirrorEditor 
                        value={code} 
                        onChange={setCode} 
                        language="javascript"
                        readOnly={frames.length > 0 && timeline.currentStep > 0} 
                        highlightLine={currentFrame?.line}
                    />
                </div>

                <div className="mt-4 space-y-2">
                    <button 
                        onClick={handleAnalyze} 
                        disabled={isAnalyzing || !code}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg disabled:opacity-50 shadow-md shadow-purple-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        {isAnalyzing ? (
                            <>
                                <span className="animate-spin text-lg">⚙</span>
                                Gemini is Tracing Execution...
                            </>
                        ) : (
                            <>
                                <span className="text-lg">✨</span>
                                Analyze & Trace Flow
                            </>
                        )}
                    </button>
                    {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">{error}</div>}
                </div>
            </div>

            {/* RIGHT PANEL: Debugger View */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col shadow-lg h-full min-h-[600px] max-h-[800px]">
                {frames.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 opacity-60">
                        <span className="text-5xl mb-4 grayscale">🧭</span>
                        <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Execution Map Empty</p>
                        <p className="text-sm text-center max-w-sm mt-2">Paste any code and let Gemini 2.5 Flash build a visual execution timeline.</p>
                    </div>
                ) : (
                    <div className="flex flex-col h-full gap-4">
                        <div className="grid grid-cols-2 gap-4 flex-none">
                            <VariablePanel variables={currentFrame?.variables} />
                            <CallStackPanel callStack={currentFrame?.callStack} />
                        </div>
                        
                        <div className="flex-none bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800/30 font-medium text-gray-800 dark:text-gray-200 shadow-sm mt-4">
                            {currentFrame?.description || "Execution step"}
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            <AIAnnotationBadge tracerPreComputed={currentFrame?.annotation} />
                        </div>
                        
                        <div className="flex-none pt-4 border-t border-gray-100 dark:border-gray-700/50 mt-2">
                            <Timeline totalSteps={timeline.totalSteps} currentStep={timeline.currentStep} setStep={timeline.setStep} />
                            <div className="mt-4">
                                <PlaybackControls 
                                    isPlaying={timeline.isPlaying} togglePlay={timeline.togglePlay}
                                    next={timeline.next} prev={timeline.prev}
                                    speed={timeline.speed} setSpeed={timeline.setSpeed}
                                    canPrev={timeline.currentStep > 0} 
                                    canNext={timeline.currentStep < frames.length - 1} 
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
