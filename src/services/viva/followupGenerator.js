/**
 * Follow-up Generator Service
 * -----------------------------
 * Generates follow-up questions based on a previous question
 * and the student's answer (or lack thereof).
 * Uses the pluggable LLM client.
 */

import { llmCompleteJSON } from "./llmClient";

/**
 * Generate follow-up questions from a prior question and answer.
 *
 * @param {Object} params
 * @param {string} params.question - The original question that was asked
 * @param {string} params.answer - The student's answer (optional)
 * @param {string} params.code - Original code context (optional)
 * @param {string} params.difficulty - "easy" | "medium" | "hard"
 * @returns {Promise<Object>} Follow-up questions
 */
export async function generateFollowups({ question, answer = "", code = "", difficulty = "medium" }) {
    const systemPrompt = `You are a senior CS professor conducting a follow-up in a viva/interview.
Based on the student's answer to a previous question, generate probing follow-up questions.
Your tone is professional and encouraging but rigorous.

Difficulty: ${difficulty.toUpperCase()}

Respond with valid JSON:
{
  "followUpQuestions": ["...", "...", "..."],
  "hint": "A brief hint if the student seems stuck",
  "evaluation": "brief" | "good" | "excellent"
}

Rules:
- Generate 3 follow-up questions
- Make them progressively deeper
- If the answer is empty or weak, ask simpler clarifying questions
- If the answer is strong, push into edge cases and optimizations`;

    const userPrompt = `Previous question: ${question}

Student's answer: ${answer || "(No answer provided)"}

${code ? `Code context:\n\`\`\`\n${code}\n\`\`\`` : ""}

Generate follow-up questions.`;

    const result = await llmCompleteJSON(systemPrompt, userPrompt);

    return {
        followUpQuestions: result.followUpQuestions || [],
        hint: result.hint || "",
        evaluation: result.evaluation || "brief",
    };
}
