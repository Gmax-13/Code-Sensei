/**
 * Code Explainer Service
 * -----------------------
 * Takes code and produces a structured explanation covering
 * what the code does, key concepts, and complexity analysis.
 * Uses the pluggable LLM client.
 */

import { llmCompleteJSON } from "./llmClient";

/**
 * Generate a structured explanation of the provided code.
 *
 * @param {Object} params
 * @param {string} params.code - Source code to explain
 * @param {string} params.language - Programming language (optional)
 * @returns {Promise<Object>} Structured explanation
 */
export async function explainCode({ code, language = "javascript" }) {
    const systemPrompt = `You are a patient, knowledgeable CS professor who explains code clearly.
Break down the provided code into an easy-to-understand explanation.

Respond with valid JSON:
{
  "explanation": "A clear, thorough explanation of what the code does and how it works.",
  "keyConcepts": ["concept1", "concept2", ...],
  "complexity": {
    "time": "O(...)",
    "space": "O(...)"
  },
  "suggestions": ["improvement1", "improvement2"]
}

Rules:
- Be thorough but concise
- Use language accessible to CS students
- Identify all key programming concepts used
- Provide accurate complexity analysis
- Give practical improvement suggestions`;

    const userPrompt = `Explain the following ${language} code:

\`\`\`${language}
${code}
\`\`\`

Provide a structured code explanation.`;

    const result = await llmCompleteJSON(systemPrompt, userPrompt);

    return {
        explanation: result.explanation || "No explanation generated.",
        keyConcepts: result.keyConcepts || [],
        complexity: result.complexity || { time: "N/A", space: "N/A" },
        suggestions: result.suggestions || [],
    };
}
