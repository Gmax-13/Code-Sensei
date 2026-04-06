/**
 * Question Generator Service
 * ---------------------------
 * Generates structured interview/viva questions from code input.
 * Uses the pluggable LLM client — works with mock by default,
 * or any configured LLM provider.
 */

import { llmCompleteJSON } from "./llmClient";

/**
 * Generate viva/interview questions from code.
 *
 * @param {Object} params
 * @param {string} params.code - Source code to question about
 * @param {string} params.language - Programming language (optional)
 * @param {string} params.difficulty - "easy" | "medium" | "hard" (default "medium")
 * @returns {Promise<Object>} Structured question set
 */
export async function generateQuestions({ code, language = "javascript", difficulty = "medium" }) {
    const systemPrompt = buildSystemPrompt(difficulty);
    const userPrompt = buildUserPrompt(code, language, difficulty);

    const result = await llmCompleteJSON(systemPrompt, userPrompt);

    // Ensure proper structure even if LLM returns partial data
    return {
        mainQuestions: result.mainQuestions || [],
        followUpQuestions: result.followUpQuestions || [],
        conceptualQuestions: result.conceptualQuestions || [],
        difficulty,
        language,
    };
}

/**
 * Build the system prompt for the question generator.
 * @param {string} difficulty
 * @returns {string}
 */
function buildSystemPrompt(difficulty) {
    const difficultyInstructions = {
        easy: "Ask fundamental questions about syntax, basic logic, and simple concepts. Suitable for beginners.",
        medium: "Ask questions about design decisions, patterns, and moderate complexity concepts. Suitable for intermediate developers.",
        hard: "Ask deep questions about architecture, scalability, performance, and advanced CS concepts. Suitable for senior developers.",
    };

    return `You are a senior CS professor conducting a practical interview/viva examination.
Your tone is professional, concise, and probing. You sound like a real professor.

Difficulty level: ${difficulty.toUpperCase()}
${difficultyInstructions[difficulty] || difficultyInstructions.medium}

You MUST respond with valid JSON in exactly this structure:
{
  "mainQuestions": ["...", "...", "...", "...", "..."],
  "followUpQuestions": ["...", "...", "..."],
  "conceptualQuestions": ["...", "..."]
}

Rules:
- Generate exactly 5 main questions
- Generate exactly 3 follow-up questions
- Generate exactly 2 deep conceptual questions
- Questions should be specific to the provided code
- Questions should test understanding, not just recall
- Adapt complexity to the difficulty level`;
}

/**
 * Build the user prompt with the code context.
 * @param {string} code
 * @param {string} language
 * @param {string} difficulty
 * @returns {string}
 */
function buildUserPrompt(code, language, difficulty) {
    return `Analyze the following ${language} code and generate ${difficulty}-level interview questions:

\`\`\`${language}
${code}
\`\`\`

Generate structured interview questions as specified.`;
}
