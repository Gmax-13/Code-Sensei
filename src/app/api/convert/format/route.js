/**
 * POST /api/convert/format
 * --------------------------
 * General-purpose format-to-format converter.
 * Accepts text content in one format and converts to another.
 * Supports: markdown, latex, html, txt, json, csv
 * Protected endpoint — requires authentication.
 */

import { withAuth } from "@/lib/middleware";
import { errorResponse, successResponse } from "@/lib/apiResponse";

/** Supported format identifiers */
const SUPPORTED_FORMATS = ["markdown", "latex", "html", "txt", "json", "csv"];

async function handler(request) {
    try {
        const body = await request.json();
        const { content, from, to } = body;

        if (!content || typeof content !== "string") {
            return errorResponse("Content is required and must be a string.", 400);
        }
        if (!from || !SUPPORTED_FORMATS.includes(from)) {
            return errorResponse(`Invalid source format. Supported: ${SUPPORTED_FORMATS.join(", ")}`, 400);
        }
        if (!to || !SUPPORTED_FORMATS.includes(to)) {
            return errorResponse(`Invalid target format. Supported: ${SUPPORTED_FORMATS.join(", ")}`, 400);
        }
        if (from === to) {
            return successResponse({ converted: content, from, to });
        }

        const converted = convertFormat(content, from, to);

        return successResponse({ converted, from, to });
    } catch (error) {
        console.error("Format conversion error:", error);
        return errorResponse("Failed to convert format.", 500);
    }
}

export const POST = withAuth(handler);

// ──────────────────────────────────────────────
// Conversion logic
// ──────────────────────────────────────────────

/**
 * Convert text content between formats.
 * @param {string} content
 * @param {string} from
 * @param {string} to
 * @returns {string}
 */
function convertFormat(content, from, to) {
    // Normalize to an intermediate representation (plain structured text)
    const intermediate = parseFromFormat(content, from);

    // Render to target format
    return renderToFormat(intermediate, to);
}

/**
 * Parse source format into an intermediate structure.
 * @param {string} content
 * @param {string} format
 * @returns {Object}
 */
function parseFromFormat(content, format) {
    switch (format) {
        case "markdown":
            return parseMarkdown(content);
        case "html":
            return parseHtml(content);
        case "latex":
            return parseLatex(content);
        case "json":
            return parseJson(content);
        case "csv":
            return parseCsv(content);
        case "txt":
        default:
            return { type: "text", lines: content.split("\n"), raw: content };
    }
}

/**
 * Render intermediate structure to target format.
 * @param {Object} data
 * @param {string} format
 * @returns {string}
 */
function renderToFormat(data, format) {
    switch (format) {
        case "markdown":
            return renderMarkdown(data);
        case "html":
            return renderHtml(data);
        case "latex":
            return renderLatex(data);
        case "json":
            return renderJson(data);
        case "csv":
            return renderCsv(data);
        case "txt":
        default:
            return renderTxt(data);
    }
}

// ──────────────────────────────────────────────
// Parsers
// ──────────────────────────────────────────────

function parseMarkdown(content) {
    const lines = content.split("\n");
    const sections = [];
    let currentSection = { heading: "", body: [] };

    for (const line of lines) {
        const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
        if (headingMatch) {
            if (currentSection.heading || currentSection.body.length > 0) {
                sections.push(currentSection);
            }
            currentSection = { heading: headingMatch[2], level: headingMatch[1].length, body: [] };
        } else {
            currentSection.body.push(line);
        }
    }
    sections.push(currentSection);

    return { type: "structured", sections, raw: content };
}

function parseHtml(content) {
    // Simple HTML tag stripping for conversion purposes
    const textContent = content
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n\n")
        .replace(/<\/h[1-6]>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .trim();

    return { type: "text", lines: textContent.split("\n"), raw: content };
}

function parseLatex(content) {
    const textContent = content
        .replace(/\\documentclass.*?\n/g, "")
        .replace(/\\usepackage.*?\n/g, "")
        .replace(/\\begin\{document\}/g, "")
        .replace(/\\end\{document\}/g, "")
        .replace(/\\maketitle/g, "")
        .replace(/\\title\{(.*?)\}/g, "# $1")
        .replace(/\\section\{(.*?)\}/g, "\n## $1\n")
        .replace(/\\subsection\{(.*?)\}/g, "\n### $1\n")
        .replace(/\\textbf\{(.*?)\}/g, "$1")
        .replace(/\\textit\{(.*?)\}/g, "$1")
        .replace(/\\begin\{.*?\}/g, "")
        .replace(/\\end\{.*?\}/g, "")
        .replace(/\\item\s*/g, "- ")
        .replace(/\\[a-zA-Z]+\{?\}?/g, "")
        .trim();

    return { type: "text", lines: textContent.split("\n"), raw: content };
}

function parseJson(content) {
    try {
        const obj = JSON.parse(content);
        return { type: "json", data: obj, raw: content };
    } catch {
        return { type: "text", lines: content.split("\n"), raw: content };
    }
}

function parseCsv(content) {
    const lines = content.trim().split("\n");
    const rows = lines.map((line) =>
        line.split(",").map((cell) => cell.trim().replace(/^"|"$/g, ""))
    );
    return { type: "csv", rows, raw: content };
}

// ──────────────────────────────────────────────
// Renderers
// ──────────────────────────────────────────────

function renderMarkdown(data) {
    if (data.type === "structured") {
        return data.sections
            .map((s) => {
                const prefix = s.heading ? `${"#".repeat(s.level || 1)} ${s.heading}\n` : "";
                return prefix + s.body.join("\n");
            })
            .join("\n\n");
    }
    if (data.type === "csv") {
        if (data.rows.length === 0) return "";
        const header = `| ${data.rows[0].join(" | ")} |`;
        const sep = `| ${data.rows[0].map(() => "---").join(" | ")} |`;
        const body = data.rows
            .slice(1)
            .map((r) => `| ${r.join(" | ")} |`)
            .join("\n");
        return `${header}\n${sep}\n${body}`;
    }
    if (data.type === "json") {
        return "```json\n" + JSON.stringify(data.data, null, 2) + "\n```";
    }
    return data.lines ? data.lines.join("\n") : data.raw || "";
}

function renderHtml(data) {
    if (data.type === "structured") {
        const body = data.sections
            .map((s) => {
                const tag = `h${s.level || 1}`;
                const heading = s.heading ? `<${tag}>${escapeHtml(s.heading)}</${tag}>` : "";
                const paragraphs = s.body
                    .filter((l) => l.trim())
                    .map((l) => `<p>${escapeHtml(l)}</p>`)
                    .join("\n");
                return heading + "\n" + paragraphs;
            })
            .join("\n");
        return `<!DOCTYPE html>\n<html><head><meta charset="utf-8"><title>Document</title></head>\n<body>\n${body}\n</body></html>`;
    }
    if (data.type === "csv") {
        const rows = data.rows
            .map((r, i) => {
                const tag = i === 0 ? "th" : "td";
                return `<tr>${r.map((c) => `<${tag}>${escapeHtml(c)}</${tag}>`).join("")}</tr>`;
            })
            .join("\n");
        return `<!DOCTYPE html>\n<html><head><meta charset="utf-8"></head>\n<body><table border="1">\n${rows}\n</table></body></html>`;
    }
    if (data.type === "json") {
        return `<!DOCTYPE html>\n<html><head><meta charset="utf-8"></head>\n<body><pre>${escapeHtml(JSON.stringify(data.data, null, 2))}</pre></body></html>`;
    }
    const lines = (data.lines || [data.raw || ""])
        .map((l) => `<p>${escapeHtml(l)}</p>`)
        .join("\n");
    return `<!DOCTYPE html>\n<html><head><meta charset="utf-8"></head>\n<body>\n${lines}\n</body></html>`;
}

function renderLatex(data) {
    const preamble = "\\documentclass[12pt]{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage[margin=1in]{geometry}\n\\begin{document}\n";
    const postamble = "\n\\end{document}";

    if (data.type === "structured") {
        const body = data.sections
            .map((s) => {
                const heading = s.heading ? `\\section{${escapeLatexText(s.heading)}}` : "";
                const content = s.body
                    .filter((l) => l.trim())
                    .map((l) => escapeLatexText(l))
                    .join("\n\n");
                return heading + "\n" + content;
            })
            .join("\n\n");
        return preamble + body + postamble;
    }

    const content = (data.lines || [data.raw || ""])
        .map((l) => escapeLatexText(l))
        .join("\n\n");
    return preamble + content + postamble;
}

function renderJson(data) {
    if (data.type === "json") {
        return JSON.stringify(data.data, null, 2);
    }
    if (data.type === "csv") {
        const [header, ...rows] = data.rows;
        const objects = rows.map((row) => {
            const obj = {};
            header.forEach((key, i) => {
                obj[key] = row[i] || "";
            });
            return obj;
        });
        return JSON.stringify(objects, null, 2);
    }
    return JSON.stringify({ content: data.raw || (data.lines || []).join("\n") }, null, 2);
}

function renderCsv(data) {
    if (data.type === "csv") {
        return data.rows.map((r) => r.map(csvEscape).join(",")).join("\n");
    }
    if (data.type === "json" && Array.isArray(data.data)) {
        const keys = Object.keys(data.data[0] || {});
        const header = keys.map(csvEscape).join(",");
        const rows = data.data.map((row) => keys.map((k) => csvEscape(String(row[k] || ""))).join(","));
        return [header, ...rows].join("\n");
    }
    // Fallback: each line is a single CSV column
    return (data.lines || [data.raw || ""])
        .map((l) => csvEscape(l))
        .join("\n");
}

function renderTxt(data) {
    if (data.type === "structured") {
        return data.sections
            .map((s) => {
                const heading = s.heading ? `${s.heading}\n${"=".repeat(s.heading.length)}` : "";
                return heading + "\n" + s.body.join("\n");
            })
            .join("\n\n");
    }
    if (data.type === "csv") {
        return data.rows.map((r) => r.join("\t")).join("\n");
    }
    if (data.type === "json") {
        return JSON.stringify(data.data, null, 2);
    }
    return data.lines ? data.lines.join("\n") : data.raw || "";
}

// ──────────────────────────────────────────────
// Utilities
// ──────────────────────────────────────────────

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function escapeLatexText(text) {
    return text
        .replace(/\\/g, "\\textbackslash{}")
        .replace(/[&%$#_{}]/g, (m) => `\\${m}`)
        .replace(/~/g, "\\textasciitilde{}")
        .replace(/\^/g, "\\textasciicircum{}");
}

function csvEscape(text) {
    if (text.includes(",") || text.includes('"') || text.includes("\n")) {
        return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
}
