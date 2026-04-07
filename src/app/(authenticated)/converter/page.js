/**
 * Format Converter Page
 * ----------------------
 * Two-column layout for converting between common text formats.
 * Supports: Markdown, LaTeX, HTML, TXT, JSON, CSV.
 * Left panel = input, right panel = output.
 */

"use client";

import { useState } from "react";
import { useFormatConvert } from "@/hooks/useApi";

/** Supported formats with labels and extensions */
const FORMATS = [
    { value: "markdown", label: "Markdown", ext: ".md", icon: "📝" },
    { value: "latex", label: "LaTeX", ext: ".tex", icon: "📐" },
    { value: "html", label: "HTML", ext: ".html", icon: "🌐" },
    { value: "txt", label: "Plain Text", ext: ".txt", icon: "📄" },
    { value: "json", label: "JSON", ext: ".json", icon: "🔧" },
    { value: "csv", label: "CSV", ext: ".csv", icon: "📊" },
];

export default function ConverterPage() {
    const [inputContent, setInputContent] = useState("");
    const [outputContent, setOutputContent] = useState("");
    const [fromFormat, setFromFormat] = useState("markdown");
    const [toFormat, setToFormat] = useState("html");

    const formatConvert = useFormatConvert();

    /** Run conversion */
    const handleConvert = async () => {
        if (!inputContent.trim()) return;

        try {
            const result = await formatConvert.mutateAsync({
                content: inputContent,
                from: fromFormat,
                to: toFormat,
            });
            setOutputContent(result.converted || "");
        } catch (err) {
            console.error("Conversion failed:", err);
        }
    };

    /** Swap input/output formats and content */
    const handleSwap = () => {
        setFromFormat(toFormat);
        setToFormat(fromFormat);
        setInputContent(outputContent);
        setOutputContent(inputContent);
    };

    /** Download output as a file */
    const handleDownload = () => {
        if (!outputContent) return;
        const targetFormat = FORMATS.find((f) => f.value === toFormat);
        const blob = new Blob([outputContent], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `converted${targetFormat?.ext || ".txt"}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    /** Copy output to clipboard */
    const handleCopy = async () => {
        if (!outputContent) return;
        try {
            await navigator.clipboard.writeText(outputContent);
        } catch {
            /* fallback for non-HTTPS */
            const el = document.createElement("textarea");
            el.value = outputContent;
            document.body.appendChild(el);
            el.select();
            document.execCommand("copy");
            document.body.removeChild(el);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* ---- Page Header ---- */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    🔄 Format Converter
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Convert between Markdown, LaTeX, HTML, Plain Text, JSON, and CSV formats.
                </p>
            </div>

            {/* ---- Format Selectors ---- */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* From format */}
                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        From
                    </label>
                    <select
                        value={fromFormat}
                        onChange={(e) => setFromFormat(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300
                            dark:border-gray-600 rounded-lg text-gray-900 dark:text-white
                            focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                        {FORMATS.map((f) => (
                            <option key={f.value} value={f.value}>
                                {f.icon} {f.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Swap button */}
                <button
                    onClick={handleSwap}
                    className="mt-5 sm:mt-5 p-2.5 rounded-full bg-gray-100 dark:bg-gray-700
                        hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors
                        text-gray-600 dark:text-gray-300"
                    title="Swap formats"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
                        <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
                    </svg>
                </button>

                {/* To format */}
                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        To
                    </label>
                    <select
                        value={toFormat}
                        onChange={(e) => setToFormat(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300
                            dark:border-gray-600 rounded-lg text-gray-900 dark:text-white
                            focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                        {FORMATS.map((f) => (
                            <option key={f.value} value={f.value}>
                                {f.icon} {f.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* ---- Two-Column Editor ---- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Input Panel */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {FORMATS.find((f) => f.value === fromFormat)?.icon}{" "}
                            Input — {FORMATS.find((f) => f.value === fromFormat)?.label}
                        </span>
                        <span className="text-xs text-gray-400">
                            {inputContent.length.toLocaleString()} chars
                        </span>
                    </div>
                    <textarea
                        value={inputContent}
                        onChange={(e) => setInputContent(e.target.value)}
                        rows={16}
                        placeholder={`Paste your ${FORMATS.find((f) => f.value === fromFormat)?.label || "text"} content here...`}
                        className="w-full px-4 py-3 bg-transparent text-gray-900 dark:text-white
                            placeholder-gray-400 font-mono text-sm
                            focus:outline-none resize-none border-none"
                    />
                </div>

                {/* Output Panel */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {FORMATS.find((f) => f.value === toFormat)?.icon}{" "}
                            Output — {FORMATS.find((f) => f.value === toFormat)?.label}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={handleCopy}
                                disabled={!outputContent}
                                className="text-xs px-2.5 py-1 rounded bg-gray-200 dark:bg-gray-600
                                    text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500
                                    transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                title="Copy to clipboard"
                            >
                                📋 Copy
                            </button>
                            <button
                                onClick={handleDownload}
                                disabled={!outputContent}
                                className="text-xs px-2.5 py-1 rounded bg-gray-200 dark:bg-gray-600
                                    text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500
                                    transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                title="Download file"
                            >
                                ⬇️ Download
                            </button>
                        </div>
                    </div>
                    <textarea
                        value={outputContent}
                        readOnly
                        rows={16}
                        placeholder="Converted output will appear here..."
                        className="w-full px-4 py-3 bg-transparent text-gray-900 dark:text-white
                            placeholder-gray-400 font-mono text-sm
                            focus:outline-none resize-none border-none"
                    />
                </div>
            </div>

            {/* ---- Convert Button ---- */}
            <button
                onClick={handleConvert}
                disabled={formatConvert.isPending || !inputContent.trim() || fromFormat === toFormat}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600
                    hover:from-cyan-700 hover:to-blue-700 text-white font-medium
                    rounded-lg transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed
                    shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30"
            >
                {formatConvert.isPending ? "Converting..." : "🔄 Convert"}
            </button>

            {/* Same format warning */}
            {fromFormat === toFormat && inputContent.trim() && (
                <p className="text-center text-sm text-yellow-600 dark:text-yellow-400">
                    Source and target formats are the same. Select different formats to convert.
                </p>
            )}

            {/* Error display */}
            {formatConvert.isError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm text-center">
                    Conversion failed. Please check your input and try again.
                </div>
            )}
        </div>
    );
}
