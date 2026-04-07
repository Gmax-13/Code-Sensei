/**
 * Report Generator Page
 * -----------------------
 * AI-powered report generation with customizable sections.
 * Features:
 * - Title-only generation (source code is optional)
 * - Dynamic header management (add, edit, delete, drag-to-reorder)
 * - Toggle for including source code
 * - Groq AI-powered content generation
 */

"use client";

import { useState, useRef, useCallback } from "react";
import { useGenerateReport } from "@/hooks/useApi";
import axios from "axios";

/** List of supported languages for the dropdown */
const LANGUAGES = [
    "javascript", "python", "java", "c", "cpp", "csharp",
    "ruby", "go", "rust", "php", "typescript", "html", "css",
];

/** Default section headers */
const DEFAULT_HEADERS = ["Aim", "Theory", "Procedure", "Result", "Conclusion"];

export default function ReportPage() {
    // Form state
    const [title, setTitle] = useState("");
    const [language, setLanguage] = useState("javascript");
    const [includeCode, setIncludeCode] = useState(false);
    const [sourceCode, setSourceCode] = useState("");
    const [headers, setHeaders] = useState([...DEFAULT_HEADERS]);
    const [titleError, setTitleError] = useState("");

    // Header editing state
    const [editingIndex, setEditingIndex] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [newHeaderValue, setNewHeaderValue] = useState("");
    const [showAddInput, setShowAddInput] = useState(false);

    // Drag and drop state
    const dragItem = useRef(null);
    const dragOverItem = useRef(null);

    // Generated report state
    const [report, setReport] = useState(null);
    const [exporting, setExporting] = useState(null);

    // TanStack Query mutation hook
    const generateReport = useGenerateReport();

    /** Handle title input with validation */
    const handleTitleChange = (e) => {
        setTitle(e.target.value);
        if (e.target.value.trim()) setTitleError("");
    };

    /** Handle form submission to generate the report */
    const handleGenerate = async () => {
        if (!title.trim()) {
            setTitleError("Report title is required");
            return;
        }

        try {
            const result = await generateReport.mutateAsync({
                title: title.trim(),
                language,
                headers,
                source_code: includeCode ? sourceCode : "",
            });
            setReport(result);
        } catch (err) {
            console.error("Report generation failed:", err);
        }
    };

    // ── Header Management ────────────────────────────────

    const handleEditHeader = (index) => {
        setEditingIndex(index);
        setEditValue(headers[index]);
    };

    const handleSaveEdit = (index) => {
        if (editValue.trim()) {
            const updated = [...headers];
            updated[index] = editValue.trim();
            setHeaders(updated);
        }
        setEditingIndex(null);
        setEditValue("");
    };

    const handleDeleteHeader = (index) => {
        if (headers.length <= 1) return; // Keep at least one header
        setHeaders(headers.filter((_, i) => i !== index));
    };

    const handleAddHeader = () => {
        if (newHeaderValue.trim()) {
            setHeaders([...headers, newHeaderValue.trim()]);
            setNewHeaderValue("");
            setShowAddInput(false);
        }
    };

    // ── Drag and Drop ────────────────────────────────────

    const handleDragStart = useCallback((index) => {
        dragItem.current = index;
    }, []);

    const handleDragEnter = useCallback((index) => {
        dragOverItem.current = index;
    }, []);

    const handleDragEnd = useCallback(() => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        if (dragItem.current === dragOverItem.current) {
            dragItem.current = null;
            dragOverItem.current = null;
            return;
        }

        const reordered = [...headers];
        const [removed] = reordered.splice(dragItem.current, 1);
        reordered.splice(dragOverItem.current, 0, removed);
        setHeaders(reordered);

        dragItem.current = null;
        dragOverItem.current = null;
    }, [headers]);

    /** Handle exporting the report to a specific format */
    const handleExport = async (format) => {
        if (!report) return;
        setExporting(format);

        try {
            const endpoints = {
                pdf: "/api/convert/pdf",
                docx: "/api/convert/docx",
                markdown: "/api/convert/markdown",
                latex: "/api/convert/latex",
                image: "/api/convert/image",
            };

            const res = await axios.post(endpoints[format], report, {
                responseType: "blob",
            });

            const extensions = {
                pdf: ".pdf",
                docx: ".docx",
                markdown: ".md",
                latex: ".tex",
                image: ".svg",
            };

            const blob = new Blob([res.data]);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${report.title || "report"}${extensions[format]}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error(`Export to ${format} failed:`, err);
        } finally {
            setExporting(null);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* ── Page Header ── */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    📝 Report Generator
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Generate AI-powered academic reports. Just enter a title — source code is optional.
                </p>
            </div>

            {/* ── Input Form ── */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">

                {/* Title input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Report Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="report-title-input"
                        type="text"
                        value={title}
                        onChange={handleTitleChange}
                        placeholder="e.g., Binary Search Implementation"
                        className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border rounded-lg 
                            text-gray-900 dark:text-white placeholder-gray-400 
                            focus:outline-none focus:ring-2 focus:ring-blue-500
                            ${titleError
                                ? "border-red-500 dark:border-red-500"
                                : "border-gray-300 dark:border-gray-600"
                            }`}
                    />
                    {titleError && (
                        <p className="mt-1 text-sm text-red-500">{titleError}</p>
                    )}
                </div>

                {/* Language selector */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Programming Language
                    </label>
                    <select
                        id="report-language-select"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 
                           dark:border-gray-600 rounded-lg text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {LANGUAGES.map((lang) => (
                            <option key={lang} value={lang}>
                                {lang.charAt(0).toUpperCase() + lang.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* ── Source Code Toggle ── */}
                <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Include Source Code
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Optional — enhances report with code-specific insights
                        </p>
                    </div>
                    <button
                        id="toggle-source-code"
                        type="button"
                        role="switch"
                        aria-checked={includeCode}
                        onClick={() => setIncludeCode(!includeCode)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
                            ${includeCode ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"}`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm
                                ${includeCode ? "translate-x-6" : "translate-x-1"}`}
                        />
                    </button>
                </div>

                {/* Source code textarea (conditional) */}
                <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out
                        ${includeCode ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}
                >
                    <div className="pt-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Source Code
                        </label>
                        <textarea
                            id="report-source-code"
                            value={sourceCode}
                            onChange={(e) => setSourceCode(e.target.value)}
                            rows={10}
                            placeholder="Paste your source code here..."
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 
                               dark:border-gray-600 rounded-lg text-gray-900 dark:text-white
                               placeholder-gray-400 font-mono text-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                        />
                    </div>
                </div>

                {/* ── Header Management ── */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Report Sections
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        Customize your report structure. Drag to reorder, click to edit.
                    </p>

                    <div className="space-y-2">
                        {headers.map((header, index) => (
                            <div
                                key={`${header}-${index}`}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragEnter={() => handleDragEnter(index)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => e.preventDefault()}
                                className="flex items-center gap-2 group"
                            >
                                {/* Drag handle */}
                                <div className="cursor-grab active:cursor-grabbing p-1 text-gray-400 
                                    hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    title="Drag to reorder"
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                        <circle cx="5" cy="3" r="1.5" />
                                        <circle cx="11" cy="3" r="1.5" />
                                        <circle cx="5" cy="8" r="1.5" />
                                        <circle cx="11" cy="8" r="1.5" />
                                        <circle cx="5" cy="13" r="1.5" />
                                        <circle cx="11" cy="13" r="1.5" />
                                    </svg>
                                </div>

                                {/* Section number badge */}
                                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center 
                                    bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 
                                    text-xs font-bold rounded-full">
                                    {index + 1}
                                </span>

                                {/* Header name (editable or display) */}
                                {editingIndex === index ? (
                                    <input
                                        type="text"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        onBlur={() => handleSaveEdit(index)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") handleSaveEdit(index);
                                            if (e.key === "Escape") {
                                                setEditingIndex(null);
                                                setEditValue("");
                                            }
                                        }}
                                        autoFocus
                                        className="flex-1 px-3 py-1.5 bg-white dark:bg-gray-600 border border-blue-500 
                                            rounded-lg text-sm text-gray-900 dark:text-white
                                            focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : (
                                    <span
                                        onClick={() => handleEditHeader(index)}
                                        className="flex-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 
                                            rounded-lg text-sm text-gray-800 dark:text-gray-200 
                                            cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 
                                            transition-colors"
                                        title="Click to edit"
                                    >
                                        {header}
                                    </span>
                                )}

                                {/* Delete button */}
                                <button
                                    onClick={() => handleDeleteHeader(index)}
                                    disabled={headers.length <= 1}
                                    className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 
                                        transition-colors disabled:opacity-30 disabled:cursor-not-allowed
                                        opacity-0 group-hover:opacity-100"
                                    title="Remove section"
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="4" y1="4" x2="12" y2="12" />
                                        <line x1="12" y1="4" x2="4" y2="12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Add header input */}
                    {showAddInput ? (
                        <div className="flex items-center gap-2 mt-3">
                            <input
                                type="text"
                                value={newHeaderValue}
                                onChange={(e) => setNewHeaderValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleAddHeader();
                                    if (e.key === "Escape") {
                                        setShowAddInput(false);
                                        setNewHeaderValue("");
                                    }
                                }}
                                autoFocus
                                placeholder="Section name..."
                                className="flex-1 px-3 py-1.5 bg-white dark:bg-gray-600 border border-gray-300 
                                    dark:border-gray-500 rounded-lg text-sm text-gray-900 dark:text-white 
                                    placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={handleAddHeader}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm 
                                    font-medium rounded-lg transition-colors"
                            >
                                Add
                            </button>
                            <button
                                onClick={() => { setShowAddInput(false); setNewHeaderValue(""); }}
                                className="px-3 py-1.5 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 
                                    dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 text-sm 
                                    rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            id="add-header-button"
                            onClick={() => setShowAddInput(true)}
                            className="mt-3 flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 
                                dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 
                                rounded-lg transition-colors"
                        >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="7" y1="2" x2="7" y2="12" />
                                <line x1="2" y1="7" x2="12" y2="7" />
                            </svg>
                            Add Section
                        </button>
                    )}
                </div>

                {/* Generate button */}
                <button
                    id="generate-report-button"
                    onClick={handleGenerate}
                    disabled={generateReport.isPending}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium
                     rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
                >
                    {generateReport.isPending ? (
                        <>
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Generating Report...
                        </>
                    ) : (
                        "✨ Generate Report"
                    )}
                </button>

                {/* Error display */}
                {generateReport.isError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm flex items-start gap-2">
                        <span className="mt-0.5">⚠️</span>
                        <span>
                            {generateReport.error?.response?.data?.error
                                || "Failed to generate report. Please try again."}
                        </span>
                    </div>
                )}
            </div>

            {/* ── Generated Report Output ── */}
            {report && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
                        {report.title}
                    </h2>

                    {/* Export buttons */}
                    <div className="flex flex-wrap gap-2">
                        {[
                            { format: "pdf", label: "PDF", icon: "📕" },
                            { format: "docx", label: "DOCX", icon: "📘" },
                            { format: "markdown", label: "Markdown", icon: "📝" },
                            { format: "latex", label: "LaTeX", icon: "📐" },
                            { format: "image", label: "SVG Image", icon: "🖼️" },
                        ].map(({ format, label, icon }) => (
                            <button
                                key={format}
                                onClick={() => handleExport(format)}
                                disabled={exporting !== null}
                                className="px-3 py-1.5 text-xs font-medium rounded-lg
                                    bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300
                                    hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600
                                    dark:hover:text-blue-400 border border-gray-200 dark:border-gray-600
                                    transition-all duration-200
                                    disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {exporting === format
                                    ? "⏳ Exporting..."
                                    : `${icon} Export ${label}`}
                            </button>
                        ))}
                    </div>

                    {/* Dynamic sections */}
                    {report.sections?.map((section, i) => (
                        <ReportSection
                            key={`${section.header}-${i}`}
                            title={section.header}
                            content={section.content}
                        />
                    ))}

                    {/* Metadata footer */}
                    <div className="text-xs text-gray-400 text-right border-t border-gray-200 dark:border-gray-700 pt-3">
                        Generated at: {new Date(report.generatedAt).toLocaleString()} | Language: {report.language}
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Reusable section component for report display.
 * @param {Object} props
 * @param {string} props.title - Section heading
 * @param {string} props.content - Section content text
 */
function ReportSection({ title, content }) {
    return (
        <div>
            <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
                {title}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                {content}
            </p>
        </div>
    );
}
