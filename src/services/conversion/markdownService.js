/**
 * Markdown Conversion Service
 * ----------------------------
 * Converts a structured report JSON into a clean Markdown string.
 * Pure function with no external dependencies.
 * Supports dynamic sections[] format from AI-generated reports.
 */

/**
 * Convert a structured report to Markdown text.
 *
 * @param {Object} report - Structured report object
 * @returns {string} Markdown-formatted report
 */
export function convertToMarkdown(report) {
    const title = report.title || "Untitled Report";
    const dateStr = report.generatedAt
        ? new Date(report.generatedAt).toLocaleDateString()
        : new Date().toLocaleDateString();
    const lang = report.language || "text";

    const lines = [];

    lines.push(`# ${title}`);
    lines.push("");
    lines.push(`> Generated: ${dateStr} | Language: ${lang}`);
    lines.push("");
    lines.push("---");
    lines.push("");

    // ── Dynamic Sections ──
    if (report.sections && Array.isArray(report.sections)) {
        for (const section of report.sections) {
            lines.push(`## ${section.header}`);
            lines.push("");
            lines.push(section.content || `_No content for "${section.header}"._`);
            lines.push("");
        }
    } else {
        // Legacy format fallback
        lines.push("## Aim");
        lines.push("");
        lines.push(report.aim || "_No aim provided._");
        lines.push("");

        lines.push("## Theory");
        lines.push("");
        lines.push(report.theory || "_No theory provided._");
        lines.push("");

        if (report.procedure && report.procedure.length > 0) {
            lines.push("## Procedure");
            lines.push("");
            report.procedure.forEach((step, i) => {
                lines.push(`${i + 1}. ${step}`);
            });
            lines.push("");
        }

        if (report.code) {
            lines.push("## Code");
            lines.push("");
            lines.push(`\`\`\`${lang}`);
            lines.push(report.code);
            lines.push("```");
            lines.push("");
        }

        lines.push("## Result");
        lines.push("");
        lines.push(report.result || "_No result provided._");
        lines.push("");

        lines.push("## Conclusion");
        lines.push("");
        lines.push(report.conclusion || "_No conclusion provided._");
        lines.push("");
    }

    return lines.join("\n");
}
