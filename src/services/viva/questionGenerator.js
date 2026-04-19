/**
 * Question Generator Service
 * ---------------------------
 * Generates structured interview/viva questions AND model answers in one Groq call.
 *
 * Token budget: 1400 max_tokens
 *   - 10 questions (5+3+2) × ~15 words = ~150 tokens
 *   - 10 answers × ~40 words           = ~500 tokens
 *   - JSON structure overhead           = ~100 tokens
 * Input cap: 3000 chars.
 */

import { generateStructured } from "@/lib/groqClient";

const MAX_CODE_CHARS = 3000;

/**
 * Generate viva/interview questions with model answers from code.
 *
 * @param {Object} params
 * @param {string} params.code       - Source code to question about
 * @param {string} params.difficulty - "easy" | "medium" | "hard"
 * @returns {Promise<Object>} Structured question+answer set
 */
export async function generateQuestions({ code, difficulty = "medium" }) {
    const snippet = code.slice(0, MAX_CODE_CHARS);

    const difficultyGuide = {
        easy:   "Focus on: what the code does, variable names, simple control flow. No jargon.",
        medium: "Focus on: design choices, algorithm efficiency, edge cases, patterns used.",
        hard:   "Focus on: time/space complexity, scalability, concurrency, architectural trade-offs.",
    };

    const systemPrompt = `You are a CS professor conducting a ${difficulty.toUpperCase()} viva.
${difficultyGuide[difficulty] || difficultyGuide.medium}
Respond ONLY with valid JSON matching this schema exactly:
{
  "mainQuestions":       ["q1","q2","q3","q4","q5"],
  "mainAnswers":         ["a1","a2","a3","a4","a5"],
  "followUpQuestions":   ["q1","q2","q3"],
  "followUpAnswers":     ["a1","a2","a3"],
  "conceptualQuestions": ["q1","q2"],
  "conceptualAnswers":   ["a1","a2"]
}
Rules:
- Exactly 5 main, 3 follow-up, 2 conceptual questions
- Every question index has a matching answer at the same index  
- Questions must reference actual function/variable names from the code
- Answers: 2-3 sentences, clear and direct, appropriate for ${difficulty} level`;

    const userPrompt = `Analyse this code and generate ${difficulty}-level viva questions with model answers:\n\`\`\`\n${snippet}\n\`\`\``;

    const rawJson = await generateStructured(systemPrompt, userPrompt, { max_tokens: 1400 });
    const result  = JSON.parse(rawJson);

    return {
        mainQuestions:       result.mainQuestions       || [],
        mainAnswers:         result.mainAnswers         || [],
        followUpQuestions:   result.followUpQuestions   || [],
        followUpAnswers:     result.followUpAnswers     || [],
        conceptualQuestions: result.conceptualQuestions || [],
        conceptualAnswers:   result.conceptualAnswers   || [],
        difficulty,
    };
}
