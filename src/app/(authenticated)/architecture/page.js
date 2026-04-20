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
    const [code, setCode] = useState(`import { EventEmitter } from "events";
import { readFile, writeFile } from "fs/promises";
import { Logger } from "./utils/logger";

class Animal {
    constructor(name, sound) {
        this.name = name;
        this.sound = sound;
    }

    speak() {
        return \`\${this.name} says \${this.sound}!\`;
    }

    describe() {
        return \`I am \${this.name}\`;
    }
}

class Dog extends Animal {
    constructor(name) {
        super(name, "Woof");
        this.tricks = [];
    }

    learnTrick(trick) {
        this.tricks.push(trick);
    }

    performTricks() {
        return this.tricks.map(t => this.speak() + \` — \${t}\`);
    }
}

class Cat extends Animal {
    constructor(name) {
        super(name, "Meow");
    }

    purr() {
        return "Prrrr...";
    }
}

async function loadAnimals(filePath) {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw);
}

async function saveAnimals(filePath, animals) {
    await writeFile(filePath, JSON.stringify(animals, null, 2));
}

function createAnimal(type, name) {
    if (type === "dog") return new Dog(name);
    if (type === "cat") return new Cat(name);
    return new Animal(name, "...");
}

async function main() {
    const animals = await loadAnimals("./animals.json");
    const dog = createAnimal("dog", "Rex");
    dog.learnTrick("sit");
    dog.learnTrick("shake");
    const tricks = dog.performTricks();
    await saveAnimals("./output.json", tricks);
}

main();`);
    const [language, setLanguage] = useState("javascript");

    // Generated diagrams state
    const [diagrams, setDiagrams]         = useState(null);
    const [activeDiagram, setActiveDiagram] = useState("classDiagram");
    const [rawMode, setRawMode]             = useState(false);
    const [aiSummary, setAiSummary]         = useState(null);
    const [usedAI, setUsedAI]               = useState(false);
    const [showRawAI, setShowRawAI]         = useState(false);
    const [aiJson, setAiJson]               = useState(null);

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

    /**
     * Track whether the mermaid diagram rendered successfully.
     * Used to hide the React-managed placeholder text once innerHTML takes over.
     *
     * BUG FIX (removeChild error):
     * Previously, a React-managed placeholder <div> lived inside the mermaidRef
     * container. When renderDiagram() ran `innerHTML = ""`, it destroyed that
     * React-managed node. On the next reconciliation, React called
     * `removeChild(placeholder)` on mermaidRef — but the placeholder was already
     * gone, causing: "Failed to execute 'removeChild' on 'Node'".
     *
     * Fix: The mermaidRef container now renders with NO React children.
     * The placeholder is rendered as a sibling (outside the ref) and is
     * hidden via this state flag once mermaid takes over.
     */
    const [diagramRendered, setDiagramRendered] = useState(false);
    const [renderError, setRenderError] = useState(null);

    /** Re-render the mermaid diagram whenever the active diagram changes */
    const renderDiagram = useCallback(async () => {
        if (!mermaidReady || !diagrams || rawMode) return;

        const diagramCode = diagrams[activeDiagram];
        if (!diagramCode || !mermaidRef.current) return;

        try {
            const mermaid = (await import("mermaid")).default;
            // Clear previous content — safe because mermaidRef has NO React children
            mermaidRef.current.innerHTML = "";
            // Generate a unique ID for the diagram
            const id = `mermaid-${Date.now()}`;
            const { svg } = await mermaid.render(id, diagramCode);
            mermaidRef.current.innerHTML = svg;
            setDiagramRendered(true);
            setRenderError(null);
        } catch (err) {
            console.error("Mermaid render error:", err);
            // Store error in state instead of using innerHTML with React children
            setRenderError(diagramCode);
            setDiagramRendered(false);
        }
    }, [mermaidReady, diagrams, activeDiagram, rawMode]);

    useEffect(() => {
        // Reset render state when switching diagrams or toggling raw mode
        setDiagramRendered(false);
        setRenderError(null);
        renderDiagram();
    }, [renderDiagram]);

    /** Handle code submission to generate diagrams */
    const handleGenerate = async () => {
        if (!code.trim()) return;

        try {
            const result = await generateDiagram.mutateAsync({ code, language });
            setDiagrams(result.diagrams ?? result);
            setAiSummary(result.summary ?? null);
            setUsedAI(result.usedAI ?? false);
            setAiJson(result.aiJson ?? null);
            setShowRawAI(false);
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
                     rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {generateDiagram.isPending ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Generating with Groq AI...
                        </>
                    ) : (
                        <>
                            <span>✨</span>
                            Generate Diagrams
                            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono tracking-widest">AI</span>
                        </>
                    )}
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

                    {/* AI Summary Panel */}
                    {aiSummary && (
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-emerald-950/60 to-teal-950/40 border border-emerald-500/30">
                            <span className="shrink-0 px-1.5 py-0.5 bg-emerald-500/20 border border-emerald-500/40 rounded text-[10px] font-bold tracking-widest text-emerald-400 mt-0.5">
                                AI
                            </span>
                            <p className="text-sm text-emerald-200 leading-relaxed flex-1">{aiSummary}</p>
                            {aiJson && (
                                <button
                                    onClick={() => setShowRawAI(v => !v)}
                                    className="shrink-0 text-[10px] text-emerald-600 hover:text-emerald-400 font-mono underline"
                                >
                                    {showRawAI ? "hide" : "raw JSON"}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Collapsible Raw AI JSON */}
                    {showRawAI && aiJson && (
                        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto border border-gray-700">
                            <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                                {JSON.stringify(aiJson, null, 2)}
                            </pre>
                        </div>
                    )}

                    {/* Metadata */}
                    {diagrams.metadata && (
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>Classes: {diagrams.metadata.classes}</span>
                            <span>Functions: {diagrams.metadata.functions}</span>
                            <span>Imports: {diagrams.metadata.imports}</span>
                        </div>
                    )}

                    {/*
                      * Diagram rendering area
                      *
                      * BUG FIX (removeChild error):
                      * The mermaidRef container MUST NOT contain React-managed children.
                      * Mermaid rendering uses innerHTML to inject SVG, which destroys
                      * any existing DOM children. If React had tracked those children,
                      * it would later try removeChild() on nodes that no longer exist.
                      *
                      * Solution: Placeholder and error UI are rendered as SIBLINGS
                      * (outside/before the ref div), controlled via React state flags.
                      * The ref div is always empty from React's perspective.
                      */}
                    {rawMode ? (
                        /* Raw Mermaid code view */
                        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                            <pre className="text-sm text-gray-100 whitespace-pre-wrap">
                                <code>{currentDiagramCode}</code>
                            </pre>
                        </div>
                    ) : (
                        <div className="min-h-[200px] bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto relative">
                            {/* Placeholder — shown until mermaid renders successfully */}
                            {!diagramRendered && !renderError && (
                                <div className="flex items-center justify-center min-h-[200px]">
                                    <div className="text-gray-400 text-sm">Rendering diagram...</div>
                                </div>
                            )}

                            {/* Error fallback — rendered via React state, not innerHTML */}
                            {renderError && (
                                <div className="text-red-400 text-sm p-4">
                                    <p className="font-bold mb-2">Diagram render failed</p>
                                    <pre className="bg-gray-900 p-3 rounded text-xs overflow-x-auto">{renderError}</pre>
                                </div>
                            )}

                            {/*
                              * Mermaid output container — NO React children allowed.
                              * innerHTML is used by mermaid.render() to inject SVG here.
                              * Keeping this empty ensures React won't call removeChild
                              * on nodes it doesn't own.
                              */}
                            <div ref={mermaidRef} />
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
