/**
 * Follow-up Generator Service
 * -----------------------------
 * Generates follow-up questions based on a student's answer.
 * Deliberately token-conservative: does NOT resend the full code
 * (the question itself carries enough context).
 *
 * Token budget: 350 max_tokens
 */

import { generateStructured } from "@/lib/groqClient";

/**
 * Generate follow-up questions from a prior Q&A exchange.
 *
 * @param {Object} params
 * @param {string} params.question   - The original question
 * @param {string} params.answer     - Student's answer (may be empty)
 * @param {string} params.difficulty - "easy" | "medium" | "hard"
 * @returns {Promise<Object>} { followUpQuestions, hint, evaluation }
 */
export async function generateFollowups({ question, answer = "", difficulty = "medium" }) {
    const answerQuality = answer.trim().length < 20 ? "incomplete/missing" : "provided";

    const systemPrompt = `You are a CS professor doing a follow-up viva. The student's answer was ${answerQuality}.
Respond ONLY with valid JSON:
{
  "followUpQuestions": ["q1","q2","q3"],
  "hint":              "one helpful nudge if answer was weak, else empty string",
  "evaluation":        "brief" | "good" | "excellent"
}
If answer was weak/missing: ask simpler clarifying questions. If strong: push into edge-cases & optimisations.`;

    const userPrompt = `Question: ${question}\nStudent answer: ${answer || "(no answer given)"}`;

    const rawJson = await generateStructured(systemPrompt, userPrompt, { max_tokens: 350 });
    const result  = JSON.parse(rawJson);

    return {
        followUpQuestions: result.followUpQuestions || [],
        hint:              result.hint              || "",
        evaluation:        result.evaluation        || "brief",
    };
}
