/**
 * Report Generator Service
 * -------------------------
 * AI-powered report generation using Groq LLM.
 * Accepts a title, language, custom headers, and optional source code.
 * Returns a structured report with dynamically generated sections.
 */

import { generateReportWithGroq } from "./groqService";

/** Default section headers if none are provided */
const DEFAULT_HEADERS = ["Aim", "Theory", "Procedure", "Result", "Conclusion"];

/**
 * Generate a structured academic report using AI.
 *
 * @param {Object} params
 * @param {string} params.title - Report title (required)
 * @param {string} [params.language] - Programming language (default: "javascript")
 * @param {string[]} [params.headers] - Section headers (default: Aim, Theory, Procedure, Result, Conclusion)
 * @param {string} [params.source_code] - Optional source code for code-aware generation
 * @returns {Promise<Object>} Structured report with title, metadata, and sections
 */
export async function generateReport({
    title,
    language = "javascript",
    headers = DEFAULT_HEADERS,
    source_code = "",
}) {
    // Call the Groq AI service to generate section content
    const sections = await generateReportWithGroq({
        title,
        language,
        headers,
        source_code,
    });

    // Build the structured report object
    return {
        title,
        language,
        generatedAt: new Date().toISOString(),
        sections,
    };
}
