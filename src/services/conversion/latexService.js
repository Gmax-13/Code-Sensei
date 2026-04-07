/**
 * LaTeX Conversion Service
 * -------------------------
 * Converts a structured report JSON into a LaTeX document string.
 * Pure function with no external dependencies.
 * Supports dynamic sections[] format from AI-generated reports.
 */

/**
 * Escape special LaTeX characters in text.
 * @param {string} text
 * @returns {string}
 */
function escapeLatex(text) {
    if (!text) return "";
    return text
        .replace(/\\/g, "\\textbackslash{}")
        .replace(/[&%$#_{}]/g, (match) => `\\${match}`)
        .replace(/~/g, "\\textasciitilde{}")
        .replace(/\^/g, "\\textasciicircum{}");
}

/**
 * Convert a structured report to a LaTeX document string.
 *
 * @param {Object} report - Structured report object
 * @returns {string} LaTeX-formatted document
 */
export function convertToLatex(report) {
    const title = report.title || "Untitled Report";
    const dateStr = report.generatedAt
        ? new Date(report.generatedAt).toLocaleDateString()
        : new Date().toLocaleDateString();
    const lang = report.language || "text";

    const lines = [];

    // Preamble
    lines.push("\\documentclass[12pt,a4paper]{article}");
    lines.push("\\usepackage[utf8]{inputenc}");
    lines.push("\\usepackage[margin=1in]{geometry}");
    lines.push("\\usepackage{listings}");
    lines.push("\\usepackage{xcolor}");
    lines.push("\\usepackage{hyperref}");
    lines.push("");
    lines.push("% Code listing style");
    lines.push("\\lstset{");
    lines.push("  basicstyle=\\ttfamily\\small,");
    lines.push("  breaklines=true,");
    lines.push("  frame=single,");
    lines.push("  numbers=left,");
    lines.push("  numberstyle=\\tiny\\color{gray},");
    lines.push("  backgroundcolor=\\color{gray!5},");
    lines.push("  keywordstyle=\\color{blue},");
    lines.push("  commentstyle=\\color{green!50!black},");
    lines.push("  stringstyle=\\color{red!60!black},");
    lines.push("}");
    lines.push("");

    // Title
    lines.push(`\\title{${escapeLatex(title)}}`);
    lines.push(`\\date{${escapeLatex(dateStr)}}`);
    lines.push("\\author{}");
    lines.push("");
    lines.push("\\begin{document}");
    lines.push("\\maketitle");
    lines.push("");

    // ── Dynamic Sections ──
    if (report.sections && Array.isArray(report.sections)) {
        for (const section of report.sections) {
            lines.push(`\\section{${escapeLatex(section.header)}}`);
            lines.push(escapeLatex(section.content));
            lines.push("");
        }
    } else {
        // Legacy format fallback
        lines.push("\\section{Aim}");
        lines.push(escapeLatex(report.aim));
        lines.push("");

        lines.push("\\section{Theory}");
        lines.push(escapeLatex(report.theory));
        lines.push("");

        if (report.procedure && report.procedure.length > 0) {
            lines.push("\\section{Procedure}");
            lines.push("\\begin{enumerate}");
            report.procedure.forEach((step) => {
                lines.push(`  \\item ${escapeLatex(step)}`);
            });
            lines.push("\\end{enumerate}");
            lines.push("");
        }

        if (report.code) {
            lines.push("\\section{Code}");
            lines.push(`\\begin{lstlisting}[language=${lang}]`);
            lines.push(report.code);
            lines.push("\\end{lstlisting}");
            lines.push("");
        }

        lines.push("\\section{Result}");
        lines.push(escapeLatex(report.result));
        lines.push("");

        lines.push("\\section{Conclusion}");
        lines.push(escapeLatex(report.conclusion));
        lines.push("");
    }

    lines.push("\\end{document}");

    return lines.join("\n");
}
