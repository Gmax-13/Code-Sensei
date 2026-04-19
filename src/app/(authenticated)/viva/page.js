/**
 * Viva / Interview Mode Page
 * ----------------------------
 * Interactive mock-interview powered by Groq AI.
 *
 * Flow:
 *   1. Paste code → Generate Questions → get real Groq-generated questions
 *   2. Each question has an accordion: expand → type your answer → Get Follow-ups
 *   3. Groq evaluates the answer and returns 3 deeper questions + hint + badge
 *   4. Explain Code tab lives independently alongside Questions tab
 */

"use client";

import { useState } from "react";
import { useVivaGenerate, useVivaExplain, useVivaFollowup } from "@/hooks/useApi";

const LANGUAGES = [
    "javascript", "python", "java", "c", "cpp", "csharp",
    "typescript", "ruby", "go", "rust", "php",
];

const DIFFICULTIES = [
    { value: "easy",   label: "Easy",   color: "border-green-500  bg-green-500/10  text-green-500"  },
    { value: "medium", label: "Medium", color: "border-yellow-500 bg-yellow-500/10 text-yellow-500" },
    { value: "hard",   label: "Hard",   color: "border-red-500    bg-red-500/10    text-red-500"    },
];

const EVAL_STYLES = {
    brief:     { label: "Needs Work",  cls: "bg-red-500/15    text-red-400    border-red-500/30"    },
    good:      { label: "Good",        cls: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
    excellent: { label: "Excellent!",  cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
};

// ── Groups of questions shown in the Questions tab ─────────────────────────────
const GROUPS = [
    { key: "mainQuestions",       answersKey: "mainAnswers",         label: "Main Questions",         icon: "🎯", color: "purple" },
    { key: "followUpQuestions",   answersKey: "followUpAnswers",     label: "Follow-up Questions",    icon: "🔄", color: "blue"   },
    { key: "conceptualQuestions", answersKey: "conceptualAnswers",   label: "Deep Conceptual",        icon: "🧠", color: "emerald"},
];

const GROUP_COLORS = {
    purple:  { border: "border-purple-500/30",  bg: "bg-purple-500/5",  text: "text-purple-400",  badge: "bg-purple-500/20" },
    blue:    { border: "border-blue-500/30",    bg: "bg-blue-500/5",    text: "text-blue-400",    badge: "bg-blue-500/20"   },
    emerald: { border: "border-emerald-500/30", bg: "bg-emerald-500/5", text: "text-emerald-400", badge: "bg-emerald-500/20"},
};

export default function VivaPage() {
    const [code, setCode] = useState(`function binarySearch(arr, target, low = 0, high = arr.length - 1) {
    if (low > high) return -1;

    const mid = Math.floor((low + high) / 2);

    if (arr[mid] === target) return mid;
    if (arr[mid] < target)  return binarySearch(arr, target, mid + 1, high);
    return binarySearch(arr, target, low, mid - 1);
}

function linearSearch(arr, target) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === target) return i;
    }
    return -1;
}

const sorted = [2, 5, 8, 12, 16, 23, 38, 42, 55, 67];
console.log(binarySearch(sorted, 23));   // 5
console.log(linearSearch(sorted, 23));   // 5
console.log(binarySearch(sorted, 99));   // -1`);
    const [difficulty, setDifficulty] = useState("medium");

    // Results
    const [questions,   setQuestions]   = useState(null);
    const [explanation, setExplanation] = useState(null);
    const [activeTab,   setActiveTab]   = useState("questions");

    // Per-question interactive state: { [uid]: { expanded, answer, followup, loading } }
    const [qState, setQState] = useState({});

    const vivaGenerate = useVivaGenerate();
    const vivaExplain  = useVivaExplain();
    const vivaFollowup = useVivaFollowup();

    // ── Helpers ──────────────────────────────────────────────────────────────

    const patchQ = (uid, patch) =>
        setQState(prev => ({ ...prev, [uid]: { ...prev[uid], ...patch } }));

    /** Flatten all questions into a list with stable UIDs */
    function flattenQuestions(q) {
        if (!q) return [];
        return GROUPS.flatMap(g =>
            (q[g.key] || []).map((text, i) => ({
                uid:   `${g.key}-${i}`,
                group: g,
                text,
                answer: (q[g.answersKey] || [])[i],
            }))
        );
    }

    // ── Handlers ─────────────────────────────────────────────────────────────

    const handleGenerate = async () => {
        if (!code.trim()) return;
        try {
            const result = await vivaGenerate.mutateAsync({ code, difficulty });
            setQuestions(result);
            setQState({});        // reset accordion state on new generate
            setActiveTab("questions");
        } catch (err) {
            console.error("Viva generation failed:", err);
        }
    };

    const handleExplain = async () => {
        if (!code.trim()) return;
        try {
            const result = await vivaExplain.mutateAsync({ code });
            setExplanation(result);
            setActiveTab("explain");
        } catch (err) {
            console.error("Code explanation failed:", err);
        }
    };

    const handleFollowup = async (uid, questionText) => {
        const answer = qState[uid]?.answer || "";
        patchQ(uid, { loading: true });
        try {
            const result = await vivaFollowup.mutateAsync({
                question:   questionText,
                answer,
                difficulty,
            });
            patchQ(uid, { followup: result, loading: false });
        } catch (err) {
            console.error("Follow-up failed:", err);
            patchQ(uid, { loading: false });
        }
    };

    const isGenerating = vivaGenerate.isPending;
    const isExplaining = vivaExplain.isPending;
    const isLoading    = isGenerating || isExplaining;

    const flatQ = flattenQuestions(questions);

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    🎓 Viva / Interview Mode
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Paste your code, generate AI interview questions, and practise answering them.
                </p>
            </div>

            {/* ── Input Panel ── */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                {/* Difficulty only */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Difficulty
                    </label>
                    <div className="flex gap-2">
                        {DIFFICULTIES.map(d => (
                            <button
                                key={d.value}
                                onClick={() => setDifficulty(d.value)}
                                className={`flex-1 py-2.5 px-3 rounded-lg border text-sm font-semibold
                                    transition-all duration-200
                                    ${difficulty === d.value
                                        ? d.color
                                        : "bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                                    }`}
                            >
                                {d.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Code textarea */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Source Code
                        </label>
                        <span className="text-xs text-gray-400 font-mono">
                            {code.length.toLocaleString()} / 3000 chars
                        </span>
                    </div>
                    <textarea
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        rows={12}
                        placeholder="Paste your code here..."
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300
                            dark:border-gray-600 rounded-lg text-gray-900 dark:text-white
                            placeholder-gray-400 font-mono text-sm
                            focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
                    />
                    {code.length > 3000 && (
                        <p className="text-xs text-amber-500 mt-1">
                            ⚠ Only the first 3000 characters will be analysed (token budget).
                        </p>
                    )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !code.trim()}
                        className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium
                            rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                            flex items-center justify-center gap-2"
                    >
                        {isGenerating
                            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
                            : <><span>🎯</span> Generate Questions</>
                        }
                    </button>
                    <button
                        onClick={handleExplain}
                        disabled={isLoading || !code.trim()}
                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium
                            rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                            flex items-center justify-center gap-2"
                    >
                        {isExplaining
                            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analysing...</>
                            : <><span>💡</span> Explain Code</>
                        }
                    </button>
                </div>

                {(vivaGenerate.isError || vivaExplain.isError) && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                        Operation failed. Please try again.
                    </div>
                )}
            </div>

            {/* ── Results Panel ── */}
            {(questions || explanation) && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                        {questions && (
                            <button
                                onClick={() => setActiveTab("questions")}
                                className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors
                                    ${activeTab === "questions"
                                        ? "border-b-2 border-purple-500 text-purple-500 bg-purple-500/5"
                                        : "text-gray-500 hover:text-gray-300"
                                    }`}
                            >
                                🎯 Questions ({flatQ.length})
                            </button>
                        )}
                        {explanation && (
                            <button
                                onClick={() => setActiveTab("explain")}
                                className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors
                                    ${activeTab === "explain"
                                        ? "border-b-2 border-blue-500 text-blue-500 bg-blue-500/5"
                                        : "text-gray-500 hover:text-gray-300"
                                    }`}
                            >
                                💡 Explanation
                            </button>
                        )}
                    </div>

                    <div className="p-6 space-y-4">
                        {/* ── Questions tab ── */}
                        {activeTab === "questions" && questions && (
                            <div className="space-y-6">
                                {GROUPS.map(group => {
                                    const groupQs = flatQ.filter(q => q.group.key === group.key);
                                    if (groupQs.length === 0) return null;
                                    const c = GROUP_COLORS[group.color];
                                    return (
                                        <div key={group.key}>
                                            <h3 className={`text-base font-bold mb-3 flex items-center gap-2 ${c.text}`}>
                                                <span>{group.icon}</span>
                                                {group.label}
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${c.badge} ml-1`}>
                                                    {groupQs.length}
                                                </span>
                                            </h3>
                                            <div className="space-y-2">
                                                {groupQs.map((q, idx) => {
                                                    const qs       = qState[q.uid] || {};
                                                    const expanded = qs.expanded || false;
                                                    const followup = qs.followup;
                                                    const evalStyle = EVAL_STYLES[followup?.evaluation] || EVAL_STYLES.brief;

                                                    return (
                                                        <div key={q.uid} className={`rounded-xl border transition-all duration-200 ${c.border} ${expanded ? c.bg : ""}`}>
                                                            {/* Question header */}
                                                            <button
                                                                onClick={() => patchQ(q.uid, { expanded: !expanded })}
                                                                className="w-full flex items-start gap-3 px-4 py-3 text-left"
                                                            >
                                                                <span className={`text-xs font-mono font-bold mt-0.5 shrink-0 ${c.text}`}>
                                                                    Q{idx + 1}
                                                                </span>
                                                                <p className="text-sm text-gray-200 leading-relaxed flex-1">
                                                                    {q.text}
                                                                </p>
                                                                <span className={`text-xs shrink-0 transition-transform duration-200 ${c.text} ${expanded ? "rotate-180" : ""}`}>
                                                                    ▼
                                                                </span>
                                                            </button>

                                                            {/* Expanded: answer box + follow-up */}
                                                            {expanded && (
                                                                <div className="px-4 pb-4 space-y-3 border-t border-gray-700/50 pt-3">
                                                                    {/* Answer textarea */}
                                                                    <div>
                                                                        <label className="text-xs text-gray-400 font-mono mb-1 block">
                                                                            Your answer:
                                                                        </label>
                                                                        <textarea
                                                                            rows={3}
                                                                            value={qs.answer || ""}
                                                                            onChange={e => patchQ(q.uid, { answer: e.target.value })}
                                                                            placeholder="Type your answer here... (optional — even pressing the button with no answer is valid)"
                                                                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg
                                                                                text-gray-200 text-sm font-mono placeholder-gray-600
                                                                                focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                                                                        />
                                                                    </div>

                                                                    {/* Actions row: Follow-up & Show Answer */}
                                                                    <div className="flex items-center justify-between">
                                                                        {/* Follow-up button */}
                                                                        <button
                                                                            onClick={() => handleFollowup(q.uid, q.text)}
                                                                            disabled={qs.loading}
                                                                            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all
                                                                                ${qs.loading
                                                                                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                                                                                    : `${c.bg} ${c.text} border ${c.border} hover:opacity-80`
                                                                                }`}
                                                                        >
                                                                            {qs.loading
                                                                                ? <span className="flex items-center gap-1.5">
                                                                                    <span className="w-3 h-3 border border-gray-400/30 border-t-gray-400 rounded-full animate-spin" />
                                                                                    Getting follow-ups...
                                                                                  </span>
                                                                                : "Get Follow-ups →"
                                                                            }
                                                                        </button>

                                                                        {q.answer && (
                                                                            <button
                                                                                onClick={() => patchQ(q.uid, { showAnswer: !qs.showAnswer })}
                                                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                                                                                    ${qs.showAnswer ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-gray-800 text-gray-400 hover:text-gray-200 border border-gray-700"}
                                                                                `}
                                                                            >
                                                                                💡 {qs.showAnswer ? "Hide Answer" : "Show Model Answer"}
                                                                            </button>
                                                                        )}
                                                                    </div>

                                                                    {/* Model Answer Panel */}
                                                                    {qs.showAnswer && q.answer && (
                                                                        <div className="p-3 mt-2 bg-emerald-500/5 border border-emerald-500/20 rounded-lg animate-in fade-in zoom-in-95 duration-200">
                                                                            <p className="text-xs text-emerald-500/80 font-mono mb-1 uppercase tracking-wider font-bold">Model Answer</p>
                                                                            <p className="text-sm text-emerald-100/90 leading-relaxed">{q.answer}</p>
                                                                        </div>
                                                                    )}

                                                                    {/* Follow-up results */}
                                                                    {followup && (
                                                                        <div className="space-y-3 pt-1">
                                                                            {/* Evaluation badge */}
                                                                            <div className="flex items-center gap-2">
                                                                                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${evalStyle.cls}`}>
                                                                                    {evalStyle.label}
                                                                                </span>
                                                                                {followup.hint && (
                                                                                    <span className="text-xs text-amber-400 italic">
                                                                                        💡 {followup.hint}
                                                                                    </span>
                                                                                )}
                                                                            </div>

                                                                            {/* Follow-up questions */}
                                                                            <div className="space-y-1.5">
                                                                                <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Follow-up Questions</p>
                                                                                {(followup.followUpQuestions || []).map((fq, fi) => (
                                                                                    <div key={fi} className="flex items-start gap-2 p-2.5 bg-gray-900/60 border border-gray-700 rounded-lg">
                                                                                        <span className="text-[10px] font-mono text-gray-500 shrink-0 mt-0.5">F{fi + 1}</span>
                                                                                        <p className="text-sm text-gray-300">{fq}</p>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}

                                <div className="text-xs text-gray-500 font-mono text-right pt-2 border-t border-gray-700">
                                    {difficulty.toUpperCase()} · Powered by Groq llama-3.1-8b-instant
                                </div>
                            </div>
                        )}

                        {/* ── Explanation tab ── */}
                        {activeTab === "explain" && explanation && (
                            <div className="space-y-5">
                                {/* Explanation block */}
                                <div className="p-4 bg-blue-950/30 border border-blue-500/20 rounded-xl">
                                    <h3 className="text-sm font-bold text-blue-400 mb-2">📖 What this code does</h3>
                                    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                                        {explanation.explanation}
                                    </p>
                                </div>

                                {/* Key concepts chips */}
                                {explanation.keyConcepts?.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-bold text-emerald-400 mb-2">🏷 Key Concepts</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {explanation.keyConcepts.map((concept, i) => (
                                                <span key={i}
                                                    className="px-3 py-1 rounded-full bg-emerald-500/10
                                                        border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                                                    {concept}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Complexity */}
                                {explanation.complexity && (
                                    <div>
                                        <h3 className="text-sm font-bold text-orange-400 mb-2">⏱ Complexity</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                                                <p className="text-[10px] text-gray-500 font-mono mb-1">TIME</p>
                                                <p className="text-base font-mono font-bold text-orange-400">
                                                    {explanation.complexity.time}
                                                </p>
                                            </div>
                                            <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                                                <p className="text-[10px] text-gray-500 font-mono mb-1">SPACE</p>
                                                <p className="text-base font-mono font-bold text-orange-400">
                                                    {explanation.complexity.space}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Suggestions */}
                                {explanation.suggestions?.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-bold text-purple-400 mb-2">✨ Improvement Suggestions</h3>
                                        <ul className="space-y-2">
                                            {explanation.suggestions.map((s, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                                    <span className="text-purple-500 shrink-0">▸</span>
                                                    {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
