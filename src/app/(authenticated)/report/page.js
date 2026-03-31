/**
 * Report Generator Page
 * -----------------------
 * Full MVP page for generating structured practical reports.
 * User pastes code, selects language, enters a title, and
 * the app generates a formatted report with all sections:
 * Aim, Theory, Procedure, Code, Result, Conclusion.
 */

"use client";

import { useState } from "react";
import { useGenerateReport } from "@/hooks/useApi";

/** List of supported languages for the dropdown */
const LANGUAGES = [
    "javascript", "python", "java", "c", "cpp", "csharp",
    "ruby", "go", "rust", "php", "typescript", "html", "css",
];

export default function ReportPage() {
    // Form state
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("javascript");
    const [title, setTitle] = useState("");

    // Generated report state
    const [report, setReport] = useState(null);

    // TanStack Query mutation hook
    const generateReport = useGenerateReport();

    /** Handle form submission to generate the report */
    const handleGenerate = async () => {
        if (!code.trim()) return;

        try {
            const result = await generateReport.mutateAsync({
                code,
                language,
                title: title || "Untitled Report",
            });
            setReport(result);
        } catch (err) {
            console.error("Report generation failed:", err);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* ---- Page Header ---- */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    📝 Report Generator
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Paste your code below and generate a complete structured practical report.
                </p>
            </div>

            {/* ---- Input Form ---- */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                {/* Title input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Report Title
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Binary Search Implementation"
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 
                       dark:border-gray-600 rounded-lg text-gray-900 dark:text-white
                       placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Language selector */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Programming Language
                    </label>
                    <select
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

                {/* Code textarea */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Source Code
                    </label>
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        rows={12}
                        placeholder="Paste your code here..."
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 
                       dark:border-gray-600 rounded-lg text-gray-900 dark:text-white
                       placeholder-gray-400 font-mono text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                    />
                </div>

                {/* Generate button */}
                <button
                    onClick={handleGenerate}
                    disabled={generateReport.isPending || !code.trim()}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium
                     rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {generateReport.isPending ? "Generating Report..." : "Generate Report"}
                </button>

                {/* Error display */}
                {generateReport.isError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
                        Failed to generate report. Please try again.
                    </div>
                )}
            </div>

            {/* ---- Generated Report Output ---- */}
            {report && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
                        {report.title}
                    </h2>

                    {/* Aim Section */}
                    <ReportSection title="Aim" content={report.aim} />

                    {/* Theory Section */}
                    <ReportSection title="Theory" content={report.theory} isMarkdown />

                    {/* Procedure Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
                            Procedure
                        </h3>
                        <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300">
                            {report.procedure?.map((step, i) => (
                                <li key={i} className="text-sm">{step}</li>
                            ))}
                        </ol>
                    </div>

                    {/* Code Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
                            Code
                        </h3>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                            <code>{report.code}</code>
                        </pre>
                    </div>

                    {/* Result Section */}
                    <ReportSection title="Result" content={report.result} />

                    {/* Conclusion Section */}
                    <ReportSection title="Conclusion" content={report.conclusion} />

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
