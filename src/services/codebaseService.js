/**
 * Codebase Analyzer Service
 * --------------------------
 * Accepts an array of files and produces a summarized
 * text representation of the codebase. Useful for understanding
 * large projects at a glance.
 */

/**
 * Analyze a collection of files and produce a codebase summary.
 *
 * @param {Array<{name: string, content: string}>} files - Array of file objects
 * @returns {Object} Summary containing structure, stats, and analysis
 */
export function analyzeCodebase(files) {
    const summary = {
        totalFiles: files.length,
        totalLines: 0,
        languages: {},       // Language breakdown by file extension
        structure: [],       // Directory tree representation
        fileAnalyses: [],    // Per-file analysis
        overview: "",        // Human-readable overview
    };

    // Analyze each file
    files.forEach((file) => {
        const lines = file.content.split("\n");
        const lineCount = lines.length;
        summary.totalLines += lineCount;

        // Detect language from file extension
        const ext = file.name.split(".").pop()?.toLowerCase() || "unknown";
        const language = getLanguageFromExt(ext);
        summary.languages[language] = (summary.languages[language] || 0) + 1;

        // Extract file-level analysis
        const analysis = analyzeFile(file.name, file.content, language);
        summary.fileAnalyses.push(analysis);

        // Build structure entry
        summary.structure.push({
            path: file.name,
            language,
            lines: lineCount,
        });
    });

    // Generate human-readable overview
    const langBreakdown = Object.entries(summary.languages)
        .map(([lang, count]) => `${lang} (${count} files)`)
        .join(", ");

    summary.overview =
        `This codebase contains ${summary.totalFiles} file(s) with a total of ` +
        `${summary.totalLines} lines of code. Languages detected: ${langBreakdown}. ` +
        `${generateInsights(summary)}`;

    return summary;
}

/**
 * Analyze a single file for key metrics and patterns.
 *
 * @param {string} name - File name/path
 * @param {string} content - File content
 * @param {string} language - Detected language
 * @returns {Object} Analysis result for the file
 */
function analyzeFile(name, content, language) {
    const lines = content.split("\n");
    const functions = content.match(/function\s+\w+|const\s+\w+\s*=\s*\(/g) || [];
    const classes = content.match(/class\s+\w+/g) || [];
    const imports = content.match(/import\s+|require\(/g) || [];
    const comments = content.match(/\/\/.*|\/\*[\s\S]*?\*\//g) || [];

    // Calculate comment-to-code ratio
    const commentLines = comments.reduce((total, c) => total + c.split("\n").length, 0);
    const commentRatio = lines.length > 0 ? ((commentLines / lines.length) * 100).toFixed(1) : 0;

    return {
        name,
        language,
        lines: lines.length,
        functions: functions.length,
        classes: classes.length,
        imports: imports.length,
        commentRatio: `${commentRatio}%`,
        summary: `${name}: ${lines.length} lines, ${functions.length} functions, ${classes.length} classes`,
    };
}

/**
 * Map file extension to language name.
 * @param {string} ext
 * @returns {string}
 */
function getLanguageFromExt(ext) {
    const map = {
        js: "JavaScript",
        jsx: "JavaScript (JSX)",
        ts: "TypeScript",
        tsx: "TypeScript (TSX)",
        py: "Python",
        java: "Java",
        c: "C",
        cpp: "C++",
        cs: "C#",
        rb: "Ruby",
        go: "Go",
        rs: "Rust",
        php: "PHP",
        html: "HTML",
        css: "CSS",
        json: "JSON",
        md: "Markdown",
        yml: "YAML",
        yaml: "YAML",
        sql: "SQL",
    };
    return map[ext] || ext.toUpperCase();
}

/**
 * Generate insights based on overall codebase metrics.
 * @param {Object} summary
 * @returns {string}
 */
function generateInsights(summary) {
    const insights = [];

    if (summary.totalFiles > 10) {
        insights.push("This is a medium-to-large codebase.");
    }
    if (summary.totalLines > 1000) {
        insights.push("Significant amount of code — consider modular architecture reviews.");
    }

    const avgLines = summary.totalFiles > 0
        ? Math.round(summary.totalLines / summary.totalFiles)
        : 0;
    insights.push(`Average file length: ${avgLines} lines.`);

    return insights.join(" ");
}
