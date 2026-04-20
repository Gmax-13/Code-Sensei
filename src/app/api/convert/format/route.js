/**
 * POST /api/convert/format
 * --------------------------
 * Format converter using DIRECT per-pair conversion functions.
 *
 * Each pair has its own dedicated function instead of an intermediate
 * representation — this prevents syntax bleed-through (e.g. **bold**
 * surviving in plain text output) that the old two-step approach caused.
 *
 * Supported pairs:
 *   markdown → html, txt, latex
 *   html     → markdown, txt
 *   latex    → txt, markdown
 *   txt      → html, markdown, latex
 *   json     → txt, markdown, html
 */

import { withAuth } from "@/lib/middleware";
import { errorResponse, successResponse } from "@/lib/apiResponse";

// ── Valid conversion pairs ────────────────────────────────────────────────────
const CONVERTERS = {
    "markdown|html":     markdownToHtml,
    "markdown|txt":      markdownToTxt,
    "markdown|latex":    markdownToLatex,
    "html|markdown":     htmlToMarkdown,
    "html|txt":          htmlToTxt,
    "latex|txt":         latexToTxt,
    "latex|markdown":    latexToMarkdown,
    "txt|html":          txtToHtml,
    "txt|markdown":      txtToMarkdown,
    "txt|latex":         txtToLatex,
    "json|txt":          jsonToTxt,
    "json|markdown":     jsonToMarkdown,
    "json|html":         jsonToHtml,
};

async function handler(request, context, user) {
    try {
        const body = await request.json();
        const { content, from, to } = body;

        if (!content || typeof content !== "string") {
            return errorResponse("Content is required and must be a string.", 400);
        }
        if (!from || !to) {
            return errorResponse("Both 'from' and 'to' formats are required.", 400);
        }
        if (from === to) {
            return successResponse({ converted: content, from, to });
        }

        const converterKey = `${from}|${to}`;
        const converterFn = CONVERTERS[converterKey];

        if (!converterFn) {
            return errorResponse(
                `Conversion from '${from}' to '${to}' is not supported. ` +
                `Supported pairs: ${Object.keys(CONVERTERS).join(", ")}`,
                400
            );
        }

        const converted = converterFn(content);
        return successResponse({ converted, from, to });
    } catch (error) {
        console.error("Format conversion error:", error);
        return errorResponse("Failed to convert format.", 500);
    }
}

export const POST = withAuth(handler);


// ════════════════════════════════════════════════════════════════════════════
// MARKDOWN source converters
// ════════════════════════════════════════════════════════════════════════════

/**
 * markdown → plain text
 * Properly strips ALL markdown syntax so **bold** becomes bold, not **bold**.
 */
function markdownToTxt(md) {
    return md
        // Remove fenced code blocks entirely (keep just the code content)
        .replace(/```[\w]*\n([\s\S]*?)```/g, (_, code) => code.trim())
        // Setext-style headings (underlined with === or ---)
        .replace(/^(.+)\n={2,}\s*$/gm, (_, t) => t.toUpperCase())
        .replace(/^(.+)\n-{2,}\s*$/gm, (_, t) => t)
        // ATX headings — strip the # markers
        .replace(/^#{1,6}\s+(.+?)(?:\s+#+)?$/gm, "$1")
        // Horizontal rules
        .replace(/^[-*_]{3,}\s*$/gm, "─".repeat(40))
        // Images — discard
        .replace(/!\[.*?\]\(.*?\)/g, "")
        // Links — keep display text only
        .replace(/\[(.+?)\]\(.*?\)/g, "$1")
        // Reference-style links
        .replace(/\[(.+?)\]\[.*?\]/g, "$1")
        // Bold+italic
        .replace(/\*{3}(.+?)\*{3}/g, "$1")
        .replace(/_{3}(.+?)_{3}/g, "$1")
        // Bold
        .replace(/\*{2}(.+?)\*{2}/g, "$1")
        .replace(/_{2}(.+?)_{2}/g, "$1")
        // Italic
        .replace(/\*(.+?)\*/g, "$1")
        .replace(/_(.+?)_/g, "$1")
        // Strikethrough
        .replace(/~~(.+?)~~/g, "$1")
        // Inline code
        .replace(/`(.+?)`/g, "$1")
        // Blockquotes — strip the >
        .replace(/^>\s?/gm, "")
        // Unordered lists — convert to bullet
        .replace(/^[ \t]*[-*+]\s+/gm, "• ")
        // Ordered lists — keep numbering
        .replace(/^[ \t]*(\d+)[.)]\s+/gm, "$1. ")
        // Collapse 3+ blank lines to 2
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

/**
 * markdown → HTML
 * Handles headings, bold, italic, code blocks, inline code, links, images,
 * unordered/ordered lists, blockquotes, horizontal rules, and paragraphs.
 */
function markdownToHtml(md) {
    let html = md
        // Normalize line endings
        .replace(/\r\n/g, "\n")
        // Fenced code blocks
        .replace(/```([\w]*)\n([\s\S]*?)```/g, (_, lang, code) =>
            `<pre><code${lang ? ` class="language-${lang}"` : ""}>${escapeHtml(code.trim())}</code></pre>`)
        // ATX headings
        .replace(/^#{6}\s+(.+)$/gm, "<h6>$1</h6>")
        .replace(/^#{5}\s+(.+)$/gm, "<h5>$1</h5>")
        .replace(/^#{4}\s+(.+)$/gm, "<h4>$1</h4>")
        .replace(/^#{3}\s+(.+)$/gm, "<h3>$1</h3>")
        .replace(/^#{2}\s+(.+)$/gm, "<h2>$1</h2>")
        .replace(/^#{1}\s+(.+)$/gm, "<h1>$1</h1>")
        // Setext headings
        .replace(/^(.+)\n={2,}$/gm, "<h1>$1</h1>")
        .replace(/^(.+)\n-{2,}$/gm, "<h2>$1</h2>")
        // Horizontal rules
        .replace(/^[-*_]{3,}\s*$/gm, "<hr>")
        // Blockquotes
        .replace(/^((?:>.*\n?)+)/gm, (block) => {
            const inner = block.replace(/^>\s?/gm, "").trim();
            return `<blockquote>${inner}</blockquote>`;
        })
        // Unordered lists
        .replace(/^((?:[ \t]*[-*+]\s+.+\n?)+)/gm, (block) => {
            const items = block.trim().split("\n")
                .map(l => `<li>${l.replace(/^[ \t]*[-*+]\s+/, "")}</li>`)
                .join("\n");
            return `<ul>\n${items}\n</ul>`;
        })
        // Ordered lists
        .replace(/^((?:[ \t]*\d+[.)]\s+.+\n?)+)/gm, (block) => {
            const items = block.trim().split("\n")
                .map(l => `<li>${l.replace(/^[ \t]*\d+[.)]\s+/, "")}</li>`)
                .join("\n");
            return `<ol>\n${items}\n</ol>`;
        })
        // Images (before links)
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
        // Links
        .replace(/\[(.+?)\]\((.+?)(?:\s+"(.+?)")?\)/g, (_, text, href, title) =>
            title ? `<a href="${href}" title="${title}">${text}</a>` : `<a href="${href}">${text}</a>`)
        // Bold+italic
        .replace(/\*{3}(.+?)\*{3}/g, "<strong><em>$1</em></strong>")
        .replace(/_{3}(.+?)_{3}/g, "<strong><em>$1</em></strong>")
        // Bold
        .replace(/\*{2}(.+?)\*{2}/g, "<strong>$1</strong>")
        .replace(/_{2}(.+?)_{2}/g, "<strong>$1</strong>")
        // Italic
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/_(.+?)_/g, "<em>$1</em>")
        // Strikethrough
        .replace(/~~(.+?)~~/g, "<s>$1</s>")
        // Inline code
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        // Paragraphs: blank-line-separated blocks not already wrapped in block tags
        .split(/\n{2,}/)
        .map(block => {
            const trimmed = block.trim();
            if (!trimmed) return "";
            if (/^<(h[1-6]|ul|ol|li|blockquote|pre|hr|img)/.test(trimmed)) return trimmed;
            return `<p>${trimmed.replace(/\n/g, "<br>")}</p>`;
        })
        .join("\n\n");

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Document</title>
  <style>
    body { font-family: sans-serif; max-width: 800px; margin: 2rem auto; line-height: 1.6; color: #1a1a1a; }
    pre  { background: #f4f4f4; padding: 1em; border-radius: 6px; overflow-x: auto; }
    code { font-family: monospace; background: #f0f0f0; padding: 0.1em 0.3em; border-radius: 3px; }
    pre code { background: none; padding: 0; }
    blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 1em; color: #555; }
    img { max-width: 100%; }
  </style>
</head>
<body>
${html.trim()}
</body>
</html>`;
}

/**
 * markdown → LaTeX
 * Converts headings, bold, italic, lists, code, links.
 */
function markdownToLatex(md) {
    const body = md
        .replace(/\r\n/g, "\n")
        // Fenced code blocks → verbatim
        .replace(/```[\w]*\n([\s\S]*?)```/g, (_, code) =>
            `\\begin{verbatim}\n${code.trim()}\n\\end{verbatim}`)
        // ATX headings
        .replace(/^#\s+(.+)$/gm,      (_, t) => `\\section{${escapeLatex(t)}}`)
        .replace(/^##\s+(.+)$/gm,     (_, t) => `\\subsection{${escapeLatex(t)}}`)
        .replace(/^###\s+(.+)$/gm,    (_, t) => `\\subsubsection{${escapeLatex(t)}}`)
        .replace(/^#{4,6}\s+(.+)$/gm, (_, t) => `\\paragraph{${escapeLatex(t)}}`)
        // Horizontal rule
        .replace(/^[-*_]{3,}\s*$/gm, "\\hrulefill")
        // Blockquote
        .replace(/^>\s?(.+)$/gm, (_, t) => `\\begin{quote}\n${escapeLatex(t)}\n\\end{quote}`)
        // Bold+italic
        .replace(/\*{3}(.+?)\*{3}/g, (_, t) => `\\textbf{\\textit{${escapeLatex(t)}}}`)
        // Bold
        .replace(/\*{2}(.+?)\*{2}/g, (_, t) => `\\textbf{${escapeLatex(t)}}`)
        .replace(/_{2}(.+?)_{2}/g,    (_, t) => `\\textbf{${escapeLatex(t)}}`)
        // Italic
        .replace(/\*(.+?)\*/g, (_, t) => `\\textit{${escapeLatex(t)}}`)
        .replace(/_(.+?)_/g,   (_, t) => `\\textit{${escapeLatex(t)}}`)
        // Inline code
        .replace(/`([^`]+)`/g, (_, t) => `\\texttt{${escapeLatex(t)}}`)
        // Links
        .replace(/\[(.+?)\]\((.+?)\)/g, (_, text, url) =>
            `\\href{${url}}{${escapeLatex(text)}}`)
        // Unordered lists
        .replace(/^((?:[ \t]*[-*+]\s+.+\n?)+)/gm, (block) => {
            const items = block.trim().split("\n")
                .map(l => `  \\item ${escapeLatex(l.replace(/^[ \t]*[-*+]\s+/, ""))}`)
                .join("\n");
            return `\\begin{itemize}\n${items}\n\\end{itemize}`;
        })
        // Ordered lists
        .replace(/^((?:[ \t]*\d+[.)]\s+.+\n?)+)/gm, (block) => {
            const items = block.trim().split("\n")
                .map(l => `  \\item ${escapeLatex(l.replace(/^[ \t]*\d+[.)]\s+/, ""))}`)
                .join("\n");
            return `\\begin{enumerate}\n${items}\n\\end{enumerate}`;
        })
        // Remaining text — escape LaTeX special chars
        .split("\n")
        .map(line => {
            // Don't escape lines that are already LaTeX commands
            if (/^\\|^\s*$/.test(line)) return line;
            return escapeLatex(line);
        })
        .join("\n");

    return `\\documentclass[12pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=1in]{geometry}
\\usepackage{hyperref}
\\usepackage{verbatim}
\\begin{document}

${body.trim()}

\\end{document}`;
}


// ════════════════════════════════════════════════════════════════════════════
// HTML source converters
// ════════════════════════════════════════════════════════════════════════════

/**
 * html → markdown
 * Converts common HTML tags to their Markdown equivalents.
 */
function htmlToMarkdown(html) {
    return html
        // Remove script/style blocks
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        // Code blocks
        .replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi,
            (_, code) => "```\n" + decodeHtmlEntities(code).trim() + "\n```")
        // Headings
        .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, t) => `\n# ${innerText(t)}\n`)
        .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, t) => `\n## ${innerText(t)}\n`)
        .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, t) => `\n### ${innerText(t)}\n`)
        .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, t) => `\n#### ${innerText(t)}\n`)
        .replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, (_, t) => `\n##### ${innerText(t)}\n`)
        .replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, (_, t) => `\n###### ${innerText(t)}\n`)
        // Bold / italic / strikethrough
        .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, (_, t) => `**${innerText(t)}**`)
        .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi,           (_, t) => `**${innerText(t)}**`)
        .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi,         (_, t) => `*${innerText(t)}*`)
        .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi,           (_, t) => `*${innerText(t)}*`)
        .replace(/<s[^>]*>([\s\S]*?)<\/s>/gi,           (_, t) => `~~${innerText(t)}~~`)
        .replace(/<del[^>]*>([\s\S]*?)<\/del>/gi,       (_, t) => `~~${innerText(t)}~~`)
        // Inline code
        .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_, t) => `\`${decodeHtmlEntities(t)}\``)
        // Links
        .replace(/<a[^>]+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi,
            (_, href, text) => `[${innerText(text)}](${href})`)
        // Images
        .replace(/<img[^>]+src="([^"]*)"[^>]*alt="([^"]*)"[^>]*/gi,
            (_, src, alt) => `![${alt}](${src})`)
        .replace(/<img[^>]+src="([^"]*)"[^>]*/gi, (_, src) => `![image](${src})`)
        // Lists
        .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, t) => `- ${innerText(t)}\n`)
        .replace(/<\/?[ou]l[^>]*>/gi, "\n")
        // Blockquotes
        .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi,
            (_, t) => innerText(t).trim().split("\n").map(l => `> ${l}`).join("\n"))
        // Paragraphs and line breaks
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n\n")
        .replace(/<hr\s*\/?>/gi, "\n---\n")
        // Strip remaining tags
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        // Collapse excess blank lines
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

/**
 * html → plain text
 * Strips all HTML and decodes entities.
 */
function htmlToTxt(html) {
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n\n")
        .replace(/<\/h[1-6]>/gi, "\n")
        .replace(/<\/li>/gi, "\n")
        .replace(/<hr\s*\/?>/gi, "\n" + "─".repeat(40) + "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}


// ════════════════════════════════════════════════════════════════════════════
// LaTeX source converters
// ════════════════════════════════════════════════════════════════════════════

/**
 * latex → plain text
 * Strips LaTeX commands and environments.
 */
function latexToTxt(latex) {
    return latex
        .replace(/\\documentclass.*\n/g, "")
        .replace(/\\usepackage.*\n/g, "")
        .replace(/\\begin\{document\}/g, "")
        .replace(/\\end\{document\}/g, "")
        .replace(/\\maketitle/g, "")
        .replace(/\\section\*?\{(.+?)\}/g, (_, t) => `\n${t.toUpperCase()}\n${"─".repeat(t.length)}\n`)
        .replace(/\\subsection\*?\{(.+?)\}/g, (_, t) => `\n${t}\n${"─".repeat(t.length)}\n`)
        .replace(/\\subsubsection\*?\{(.+?)\}/g, "\n$1\n")
        .replace(/\\textbf\{(.+?)\}/g, "$1")
        .replace(/\\textit\{(.+?)\}/g, "$1")
        .replace(/\\texttt\{(.+?)\}/g, "$1")
        .replace(/\\href\{[^}]+\}\{(.+?)\}/g, "$1")
        .replace(/\\begin\{verbatim\}([\s\S]*?)\\end\{verbatim\}/g, "$1")
        .replace(/\\begin\{itemize\}|\\end\{itemize\}/g, "")
        .replace(/\\begin\{enumerate\}|\\end\{enumerate\}/g, "")
        .replace(/\\item\s+/g, "• ")
        .replace(/\\begin\{quote\}([\s\S]*?)\\end\{quote\}/g, (_, t) => t.trim())
        .replace(/\\[a-zA-Z]+\{([^}]*)\}/g, "$1")
        .replace(/\\[a-zA-Z]+/g, "")
        .replace(/\{|\}/g, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

/**
 * latex → markdown
 * Best-effort conversion.
 */
function latexToMarkdown(latex) {
    return latex
        .replace(/\\documentclass.*\n/g, "")
        .replace(/\\usepackage.*\n/g, "")
        .replace(/\\begin\{document\}/g, "")
        .replace(/\\end\{document\}/g, "")
        .replace(/\\maketitle/g, "")
        .replace(/\\section\*?\{(.+?)\}/g, "\n# $1\n")
        .replace(/\\subsection\*?\{(.+?)\}/g, "\n## $1\n")
        .replace(/\\subsubsection\*?\{(.+?)\}/g, "\n### $1\n")
        .replace(/\\textbf\{(.+?)\}/g, "**$1**")
        .replace(/\\textit\{(.+?)\}/g, "*$1*")
        .replace(/\\texttt\{(.+?)\}/g, "`$1`")
        .replace(/\\href\{([^}]+)\}\{(.+?)\}/g, "[$2]($1)")
        .replace(/\\begin\{verbatim\}([\s\S]*?)\\end\{verbatim\}/g,
            (_, code) => "```\n" + code.trim() + "\n```")
        .replace(/\\begin\{itemize\}/g, "").replace(/\\end\{itemize\}/g, "")
        .replace(/\\begin\{enumerate\}/g, "").replace(/\\end\{enumerate\}/g, "")
        .replace(/\\item\s+/g, "- ")
        .replace(/\\begin\{quote\}([\s\S]*?)\\end\{quote\}/g,
            (_, t) => t.trim().split("\n").map(l => `> ${l}`).join("\n"))
        .replace(/\\hrulefill|\\hline/g, "---")
        .replace(/\\[a-zA-Z]+\{([^}]*)\}/g, "$1")
        .replace(/\\[a-zA-Z]+/g, "")
        .replace(/\{|\}/g, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}


// ════════════════════════════════════════════════════════════════════════════
// Plain text source converters
// ════════════════════════════════════════════════════════════════════════════

/**
 * txt → html
 * Wraps paragraphs in <p> tags, converts blank-line-separated blocks.
 */
function txtToHtml(txt) {
    const paragraphs = txt
        .split(/\n{2,}/)
        .map(block => {
            const trimmed = block.trim();
            if (!trimmed) return "";
            // Detect ALL-CAPS line as a de-facto heading
            if (/^[A-Z][A-Z\s\d]{3,}$/.test(trimmed)) {
                return `<h2>${escapeHtml(trimmed)}</h2>`;
            }
            return `<p>${escapeHtml(trimmed).replace(/\n/g, "<br>")}</p>`;
        })
        .filter(Boolean)
        .join("\n");

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Document</title>
  <style>body { font-family: sans-serif; max-width: 800px; margin: 2rem auto; line-height: 1.6; }</style>
</head>
<body>
${paragraphs}
</body>
</html>`;
}

/**
 * txt → markdown
 * Detects underline-style headings and ALL-CAPS headings.
 * Otherwise a text file is already valid Markdown.
 */
function txtToMarkdown(txt) {
    return txt
        // Setext-style underlines (=== or ---) already markdown — leave them
        // ALL-CAPS short lines → h2
        .replace(/^([A-Z][A-Z\s\d]{3,})$/gm, (line) => `## ${line.trim()}`)
        // Consecutive dashes as horizontal rule
        .replace(/^-{3,}\s*$/gm, "---")
        .trim();
}

/**
 * txt → LaTeX
 * Each blank-line-separated block becomes a paragraph.
 * ALL-CAPS lines become section headings.
 */
function txtToLatex(txt) {
    const body = txt
        .split(/\n{2,}/)
        .map(block => {
            const trimmed = block.trim();
            if (!trimmed) return "";
            if (/^[A-Z][A-Z\s\d]{3,}$/.test(trimmed)) {
                return `\\section{${escapeLatex(trimmed)}}`;
            }
            return escapeLatex(trimmed);
        })
        .filter(Boolean)
        .join("\n\n");

    return `\\documentclass[12pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=1in]{geometry}
\\begin{document}

${body}

\\end{document}`;
}


// ════════════════════════════════════════════════════════════════════════════
// JSON source converters
// ════════════════════════════════════════════════════════════════════════════

/**
 * json → plain text
 * Pretty-prints JSON. If it's an array of objects, renders as a table.
 */
function jsonToTxt(jsonStr) {
    let data;
    try { data = JSON.parse(jsonStr); } catch {
        return `[Invalid JSON]\n\n${jsonStr}`;
    }

    if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object") {
        // Render as an ASCII table
        const keys = Object.keys(data[0]);
        const rows = data.map(row => keys.map(k => String(row[k] ?? "")));
        const widths = keys.map((k, i) => Math.max(k.length, ...rows.map(r => r[i].length)));
        const sep    = widths.map(w => "─".repeat(w + 2)).join("┼");
        const header = keys.map((k, i) => ` ${k.padEnd(widths[i])} `).join("│");
        const body   = rows.map(row =>
            row.map((cell, i) => ` ${cell.padEnd(widths[i])} `).join("│")
        ).join(`\n${sep}\n`);
        return `${header}\n${sep}\n${body}`;
    }

    return JSON.stringify(data, null, 2);
}

/**
 * json → markdown
 * Arrays of objects → markdown table.
 * Objects → definition list.
 * Primitives → code block.
 */
function jsonToMarkdown(jsonStr) {
    let data;
    try { data = JSON.parse(jsonStr); } catch {
        return "```json\n" + jsonStr + "\n```";
    }

    if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object") {
        const keys   = Object.keys(data[0]);
        const header = `| ${keys.join(" | ")} |`;
        const sep    = `| ${keys.map(() => "---").join(" | ")} |`;
        const rows   = data.map(row =>
            `| ${keys.map(k => String(row[k] ?? "").replace(/\|/g, "\\|")).join(" | ")} |`
        );
        return [header, sep, ...rows].join("\n");
    }

    if (typeof data === "object" && data !== null && !Array.isArray(data)) {
        return Object.entries(data)
            .map(([k, v]) => `**${k}**: ${typeof v === "object" ? "`" + JSON.stringify(v) + "`" : v}`)
            .join("\n\n");
    }

    return "```json\n" + JSON.stringify(data, null, 2) + "\n```";
}

/**
 * json → html
 * Arrays of objects → HTML table.
 * Objects → definition list.
 * Otherwise → formatted code block.
 */
function jsonToHtml(jsonStr) {
    let data;
    try { data = JSON.parse(jsonStr); } catch {
        return `<pre><code>${escapeHtml(jsonStr)}</code></pre>`;
    }

    let bodyHtml;

    if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object") {
        const keys = Object.keys(data[0]);
        const thead = `<thead><tr>${keys.map(k => `<th>${escapeHtml(k)}</th>`).join("")}</tr></thead>`;
        const tbodyRows = data.map(row =>
            `<tr>${keys.map(k => `<td>${escapeHtml(String(row[k] ?? ""))}</td>`).join("")}</tr>`
        ).join("\n");
        bodyHtml = `<table>\n${thead}\n<tbody>\n${tbodyRows}\n</tbody>\n</table>`;
    } else if (typeof data === "object" && data !== null && !Array.isArray(data)) {
        const items = Object.entries(data)
            .map(([k, v]) => `<dt><strong>${escapeHtml(k)}</strong></dt><dd>${escapeHtml(JSON.stringify(v))}</dd>`)
            .join("\n");
        bodyHtml = `<dl>\n${items}\n</dl>`;
    } else {
        bodyHtml = `<pre><code>${escapeHtml(JSON.stringify(data, null, 2))}</code></pre>`;
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Data</title>
  <style>
    body  { font-family: sans-serif; max-width: 900px; margin: 2rem auto; line-height: 1.5; }
    table { border-collapse: collapse; width: 100%; }
    th,td { border: 1px solid #ccc; padding: 0.5em 0.8em; text-align: left; }
    th    { background: #f0f0f0; font-weight: 600; }
    tr:nth-child(even) { background: #fafafa; }
    dt    { font-weight: 600; margin-top: 0.5em; }
    dd    { margin-left: 1.5em; color: #444; }
    pre   { background: #f4f4f4; padding: 1em; border-radius: 6px; overflow-x: auto; }
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}


// ════════════════════════════════════════════════════════════════════════════
// Utility helpers
// ════════════════════════════════════════════════════════════════════════════

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function decodeHtmlEntities(text) {
    return text
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ");
}

/** Strip HTML tags from a string (for use inside converters) */
function innerText(html) {
    return decodeHtmlEntities(html.replace(/<[^>]+>/g, ""));
}

/** Escape LaTeX special characters in a text fragment */
function escapeLatex(text) {
    return String(text)
        .replace(/\\/g, "\\textbackslash{}")
        .replace(/[&%$#_{}]/g, m => `\\${m}`)
        .replace(/~/g, "\\textasciitilde{}")
        .replace(/\^/g, "\\textasciicircum{}");
}
