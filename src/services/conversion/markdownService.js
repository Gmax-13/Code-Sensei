/**
 * Markdown Conversion Service
 * ----------------------------
 * Converts a structured report JSON into a clean Markdown string.
 * Pure function with no external dependencies.
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

    // Aim
    lines.push("## Aim");
    lines.push("");
    lines.push(report.aim || "_No aim provided._");
    lines.push("");

    // Theory
    lines.push("## Theory");
    lines.push("");
    lines.push(report.theory || "_No theory provided._");
    lines.push("");

    // Procedure
    if (report.procedure && report.procedure.length > 0) {
        lines.push("## Procedure");
        lines.push("");
        report.procedure.forEach((step, i) => {
            lines.push(`${i + 1}. ${step}`);
        });
        lines.push("");
    }

    // Code
    if (report.code) {
        lines.push("## Code");
        lines.push("");
        lines.push(`\`\`\`${lang}`);
        lines.push(report.code);
        lines.push("```");
        lines.push("");
    }

    // Result
    lines.push("## Result");
    lines.push("");
    lines.push(report.result || "_No result provided._");
    lines.push("");

    // Conclusion
    lines.push("## Conclusion");
    lines.push("");
    lines.push(report.conclusion || "_No conclusion provided._");
    lines.push("");

    return lines.join("\n");
}
