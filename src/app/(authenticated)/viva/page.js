/**
 * Viva / Interview Mode Page
 * ----------------------------
 * AI-driven interview preparation tool. Paste code,
 * select difficulty, and generate structured viva questions.
 * Also supports follow-up generation and code explanation.
 */

"use client";

import { useState } from "react";
import { useVivaGenerate, useVivaExplain } from "@/hooks/useApi";

/** Supported languages for the dropdown */
const LANGUAGES = [
    "javascript", "python", "java", "c", "cpp", "csharp",
    "ruby", "go", "rust", "php", "typescript",
];

/** Difficulty options */
const DIFFICULTIES = [
    { value: "easy", label: "Easy", color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30" },
    { value: "medium", label: "Medium", color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30" },
    { value: "hard", label: "Hard", color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30" },
];

export default function VivaPage() {
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("javascript");
    const [difficulty, setDifficulty] = useState("medium");
    const [questions, setQuestions] = useState(null);
    const [explanation, setExplanation] = useState(null);
    const [activeTab, setActiveTab] = useState("questions");

    const vivaGenerate = useVivaGenerate();
    const vivaExplain = useVivaExplain();

    /** Generate interview questions */
    const handleGenerate = async () => {
        if (!code.trim()) return;
        setExplanation(null);
        try {
            const result = await vivaGenerate.mutateAsync({ code, language, difficulty });
            setQuestions(result);
            setActiveTab("questions");
        } catch (err) {
            console.error("Viva generation failed:", err);
        }
    };

    /** Generate code explanation */
    const handleExplain = async () => {
        if (!code.trim()) return;
        setQuestions(null);
        try {
            const result = await vivaExplain.mutateAsync({ code, language });
            setExplanation(result);
            setActiveTab("explain");
        } catch (err) {
            console.error("Code explanation failed:", err);
        }
    };

    const isLoading = vivaGenerate.isPending || vivaExplain.isPending;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* ---- Page Header ---- */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    🎓 Viva / Interview Mode
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Paste your code and generate structured interview questions with AI-powered analysis.
                </p>
            </div>

            {/* ---- Input Section ---- */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                {/* Language + Difficulty Row */}
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Language selector */}
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Programming Language
                        </label>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300
                                dark:border-gray-600 rounded-lg text-gray-900 dark:text-white
                                focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            {LANGUAGES.map((lang) => (
                                <option key={lang} value={lang}>
                                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Difficulty selector */}
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Difficulty Level
                        </label>
                        <div className="flex gap-2">
                            {DIFFICULTIES.map((d) => (
                                <button
                                    key={d.value}
                                    onClick={() => setDifficulty(d.value)}
                                    className={`flex-1 py-2.5 px-3 rounded-lg border text-sm font-medium
                                        transition-all duration-200
                                        ${difficulty === d.value
                                            ? d.color + " border-current"
                                            : "bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                                        }`}
                                >
                                    {d.label}
                                </button>
                            ))}
                        </div>
                    </div>
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
                            focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
                    />
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !code.trim()}
                        className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium
                            rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {vivaGenerate.isPending ? "Generating Questions..." : "🎯 Generate Questions"}
                    </button>
                    <button
                        onClick={handleExplain}
                        disabled={isLoading || !code.trim()}
                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium
                            rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {vivaExplain.isPending ? "Analyzing..." : "💡 Explain Code"}
                    </button>
                </div>

                {/* Error display */}
                {(vivaGenerate.isError || vivaExplain.isError) && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
                        Operation failed. Please try again.
                    </div>
                )}
            </div>

            {/* ---- Results Section ---- */}
            {(questions || explanation) && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
                    {/* Tab switcher */}
                    <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-3">
                        <button
                            onClick={() => setActiveTab("questions")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                ${activeTab === "questions"
                                    ? "bg-purple-600/10 text-purple-600 dark:text-purple-400"
                                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                }`}
                            disabled={!questions}
                        >
                            🎯 Questions
                        </button>
                        <button
                            onClick={() => setActiveTab("explain")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                ${activeTab === "explain"
                                    ? "bg-blue-600/10 text-blue-600 dark:text-blue-400"
                                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                }`}
                            disabled={!explanation}
                        >
                            💡 Explanation
                        </button>
                    </div>

                    {/* Questions Tab */}
                    {activeTab === "questions" && questions && (
                        <div className="space-y-6">
                            {/* Main Questions */}
                            <QuestionGroup
                                title="Main Questions"
                                icon="🎯"
                                questions={questions.mainQuestions}
                                color="purple"
                            />
                            {/* Follow-up Questions */}
                            <QuestionGroup
                                title="Follow-up Questions"
                                icon="🔄"
                                questions={questions.followUpQuestions}
                                color="blue"
                            />
                            {/* Conceptual Questions */}
                            <QuestionGroup
                                title="Deep Conceptual Questions"
                                icon="🧠"
                                questions={questions.conceptualQuestions}
                                color="emerald"
                            />
                            {/* Difficulty badge */}
                            <div className="text-xs text-gray-400 text-right border-t border-gray-200 dark:border-gray-700 pt-3">
                                Difficulty: {questions.difficulty?.toUpperCase()} | Language: {questions.language}
                            </div>
                        </div>
                    )}

                    {/* Explanation Tab */}
                    {activeTab === "explain" && explanation && (
                        <div className="space-y-5">
                            {/* Main Explanation */}
                            <div>
                                <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
                                    Explanation
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                                    {explanation.explanation}
                                </p>
                            </div>

                            {/* Key Concepts */}
                            {explanation.keyConcepts?.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
                                        Key Concepts
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {explanation.keyConcepts.map((concept, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600
                                                    dark:text-emerald-400 text-xs font-medium border border-emerald-500/20"
                                            >
                                                {concept}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Complexity */}
                            {explanation.complexity && (
                                <div>
                                    <h3 className="text-lg font-semibold text-orange-600 dark:text-orange-400 mb-2">
                                        Complexity Analysis
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Time</p>
                                            <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                                                {explanation.complexity.time}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Space</p>
                                            <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                                                {explanation.complexity.space}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Suggestions */}
                            {explanation.suggestions?.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-2">
                                        Improvement Suggestions
                                    </h3>
                                    <ul className="space-y-2">
                                        {explanation.suggestions.map((suggestion, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                                <span className="text-purple-500 mt-0.5">▸</span>
                                                {suggestion}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/**
 * Reusable question group component.
 * @param {Object} props
 * @param {string} props.title
 * @param {string} props.icon
 * @param {string[]} props.questions
 * @param {string} props.color
 */
function QuestionGroup({ title, icon, questions, color }) {
    if (!questions || questions.length === 0) return null;

    const colorMap = {
        purple: "text-purple-600 dark:text-purple-400 bg-purple-500/5 border-purple-500/20",
        blue: "text-blue-600 dark:text-blue-400 bg-blue-500/5 border-blue-500/20",
        emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 border-emerald-500/20",
    };

    return (
        <div>
            <h3 className={`text-lg font-semibold mb-3 ${colorMap[color]?.split(" ")[0]} ${colorMap[color]?.split(" ")[1]}`}>
                {icon} {title}
            </h3>
            <div className="space-y-2">
                {questions.map((q, i) => (
                    <div
                        key={i}
                        className={`p-3 rounded-lg border ${colorMap[color]} transition-all duration-200 hover:shadow-sm`}
                    >
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            <span className="font-semibold text-gray-500 dark:text-gray-400 mr-2">
                                Q{i + 1}.
                            </span>
                            {q}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
