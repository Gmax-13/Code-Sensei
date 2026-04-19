/**
 * Code Explainer Service
 * -----------------------
 * Produces a structured explanation of code using Groq AI.
 *
 * Token budget: 550 max_tokens
 * Input cap:   3000 chars
 */

import { generateStructured } from "@/lib/groqClient";

const MAX_CODE_CHARS = 3000;

/**
 * Generate a structured explanation of the provided code.
 *
 * @param {Object} params
 * @param {string} params.code     - Source code to explain
 * @param {string} params.language - Programming language
 * @returns {Promise<Object>} Structured explanation
 */
export async function explainCode({ code, language = "javascript" }) {
    const snippet = code.slice(0, MAX_CODE_CHARS);

    const systemPrompt = `You are a CS professor explaining code to a student.
Respond ONLY with valid JSON:
{
  "explanation":  "2-3 sentences: what the code does and how",
  "keyConcepts":  ["concept1","concept2","concept3"],
  "complexity":   { "time": "O(...)", "space": "O(...)" },
  "suggestions":  ["improvement1","improvement2"]
}
Be concrete. Mention specific function/variable names from the code.`;

    const userPrompt = `Explain this ${language} code:\n\`\`\`${language}\n${snippet}\n\`\`\``;

    const rawJson = await generateStructured(systemPrompt, userPrompt, { max_tokens: 550 });
    const result  = JSON.parse(rawJson);

    return {
        explanation: result.explanation || "No explanation generated.",
        keyConcepts: result.keyConcepts || [],
        complexity:  result.complexity  || { time: "N/A", space: "N/A" },
        suggestions: result.suggestions || [],
    };
}
