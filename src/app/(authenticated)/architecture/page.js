/**
 * Architecture Viewer Page
 * -------------------------
 * Full functionality Mermaid diagram generation page.
 * User pastes code, selects language, and the app generates:
 *   - Class Diagram
 *   - Flowchart
 *   - Dependency Graph
 *
 * Uses the backend diagram generator API and renders
 * Mermaid diagrams client-side via mermaid.js.
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useGenerateDiagram } from "@/hooks/useApi";

/** Available diagram types to display */
const DIAGRAM_TYPES = [
    { value: "classDiagram", label: "Class Diagram" },
    { value: "flowchart", label: "Flowchart" },
    { value: "dependencyGraph", label: "Dependency Graph" },
];

export default function ArchitecturePage() {
    // Input state
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("javascript");

    // Generated diagrams state
    const [diagrams, setDiagrams] = useState(null);
    const [activeDiagram, setActiveDiagram] = useState("classDiagram");
    const [rawMode, setRawMode] = useState(false);

    // Mermaid rendering
    const mermaidRef = useRef(null);
    const [mermaidReady, setMermaidReady] = useState(false);

    const generateDiagram = useGenerateDiagram();

    /** Initialize Mermaid.js on the client */
    useEffect(() => {
        if (typeof window !== "undefined") {
            import("mermaid").then((mermaid) => {
                mermaid.default.initialize({
                    startOnLoad: false,
                    theme: "dark",
                    securityLevel: "loose",
                });
                setMermaidReady(true);
            });
        }
    }, []);

    /** Re-render the mermaid diagram whenever the active diagram changes */
    const renderDiagram = useCallback(async () => {
        if (!mermaidReady || !diagrams || rawMode) return;

        const diagramCode = diagrams[activeDiagram];
        if (!diagramCode || !mermaidRef.current) return;

        try {
            const mermaid = (await import("mermaid")).default;
            
            const currentRef = mermaidRef.current;
            if (!currentRef) return;

            const id = `mermaid-${Date.now()}`;
            const { svg } = await mermaid.render(id, diagramCode);

            // Only update if component has not changed
            if (mermaidRef.current === currentRef) {
                currentRef.innerHTML = svg;
            }
        } catch (err) {
            console.error("Mermaid render error:", err);
            // Show the raw code on render failure
            const currentRef = mermaidRef.current;
            if (currentRef) {
                currentRef.innerHTML = `
        <div class="text-red-400 text-sm p-4">
          <p class="font-bold mb-2">Diagram render failed</p>
          <pre class="bg-gray-900 p-3 rounded text-xs overflow-x-auto">${diagramCode}</pre>
        </div>
      `;
            }
        }
    }, [mermaidReady, diagrams, activeDiagram, rawMode]);

    useEffect(() => {
        renderDiagram();
    }, [renderDiagram]);

    /** Handle code submission to generate diagrams */
    const handleGenerate = async () => {
        if (!code.trim()) return;

        try {
            const result = await generateDiagram.mutateAsync({ code, language });
            setDiagrams(result);
            setActiveDiagram("classDiagram");
        } catch (err) {
            console.error("Diagram generation failed:", err);
        }
    };

    /** Get the current diagram code text */
    const currentDiagramCode = diagrams ? diagrams[activeDiagram] : "";

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* ---- Page Header ---- */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    🏗️ Architecture Viewer
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Paste your code and get auto-generated Mermaid diagrams.
                </p>
            </div>

            {/* ---- Input Panel ---- */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                {/* Language selector */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Language
                    </label>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 
                       dark:border-gray-600 rounded-lg text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="typescript">TypeScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                    </select>
                </div>

                {/* Code input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Source Code
                    </label>
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        rows={12}
                        placeholder={`// Paste your code here...\nclass Animal {\n  constructor(name) {\n    this.name = name;\n  }\n  speak() {\n    console.log(this.name + " makes a noise.");\n  }\n}\n\nclass Dog extends Animal {\n  bark() {\n    console.log("Woof!");\n  }\n}`}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 
                       dark:border-gray-600 rounded-lg text-gray-900 dark:text-white
                       placeholder-gray-400 font-mono text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                    />
                </div>

                {/* Generate button */}
                <button
                    onClick={handleGenerate}
                    disabled={generateDiagram.isPending || !code.trim()}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium
                     rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {generateDiagram.isPending ? "Generating Diagrams..." : "Generate Diagrams"}
                </button>

                {/* Error display */}
                {generateDiagram.isError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
                        Failed to generate diagrams. Please try again.
                    </div>
                )}
            </div>

            {/* ---- Diagram Output ---- */}
            {diagrams && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                    {/* Diagram type tabs */}
                    <div className="flex flex-wrap items-center gap-2">
                        {DIAGRAM_TYPES.map((dt) => (
                            <button
                                key={dt.value}
                                onClick={() => setActiveDiagram(dt.value)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${activeDiagram === dt.value
                                        ? "bg-emerald-600 text-white"
                                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                    }`}
                            >
                                {dt.label}
                            </button>
                        ))}

                        {/* Raw/rendered toggle */}
                        <button
                            onClick={() => setRawMode(!rawMode)}
                            className="ml-auto px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm
                         text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                            {rawMode ? "Show Rendered" : "Show Raw"}
                        </button>
                    </div>

                    {/* Metadata */}
                    {diagrams.metadata && (
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>Classes: {diagrams.metadata.classes}</span>
                            <span>Functions: {diagrams.metadata.functions}</span>
                            <span>Imports: {diagrams.metadata.imports}</span>
                        </div>
                    )}

                    {/* Diagram rendering area */}
                    {rawMode ? (
                        /* Raw Mermaid code view */
                        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                            <pre className="text-sm text-gray-100 whitespace-pre-wrap">
                                <code>{currentDiagramCode}</code>
                            </pre>
                        </div>
                    ) : (
                        /* Rendered Mermaid diagram */
                        <div
                            key={activeDiagram + (rawMode ? "raw" : "render")}
                            ref={mermaidRef}
                            className="min-h-[200px] flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto"
                        >
                            <div className="text-gray-400 text-sm">Rendering diagram...</div>
                        </div>
                    )}

                    {/* Copy diagram code button */}
                    <div className="flex justify-end">
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(currentDiagramCode);
                            }}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm
                         text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600
                         transition-colors"
                        >
                            📋 Copy Mermaid Code
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
