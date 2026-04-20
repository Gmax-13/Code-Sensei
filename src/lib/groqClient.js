/**
 * Groq AI Client
 * -----------------
 * Singleton wrapper for the Groq SDK.
 *
 * Two exported functions — both use llama-3.1-8b-instant to stay within
 * the free tier's generous limits (500k tokens/day, 14,400 req/day):
 *
 *   generateFast()       — plain text, 150 tokens max. For one-sentence annotations.
 *   generateStructured() — JSON mode, configurable tokens. For structured outputs
 *                          like execution traces, where format reliability matters.
 *
 * The 70b model (llama-3.3-70b-versatile) is NOT used here — it has only
 * 100k tokens/day and 1,000 requests/day on the free tier.
 */

import Groq from "groq-sdk";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
    console.warn("GROQ_API_KEY is not defined in .env.local");
}

let groqInstance = null;

if (GROQ_API_KEY) {
    groqInstance = new Groq({ apiKey: GROQ_API_KEY });
}

/** Shared model — 8b is 5x more token-generous than 70b on the free tier */
const FAST_MODEL = "llama-3.1-8b-instant";

/**
 * Generate a short plain-text response (e.g. one-sentence DSA annotation).
 *
 * Supports two call signatures:
 *   generateFast(prompt)                → single-string, used by DSA annotator
 *   generateFast(system, user, options) → system+user, used by architecture/viva
 *
 * Token budget defaults to 150 (override via options.max_tokens).
 *
 * @param {string} systemOrPrompt
 * @param {string|null} [user]
 * @param {Object} [options]
 * @returns {Promise<string>}
 */
export async function generateFast(systemOrPrompt, user = null, options = {}) {
    if (!groqInstance) {
        throw new Error("Groq API key missing. Cannot generate annotation.");
    }

    const messages = user
        ? [
            { role: "system", content: systemOrPrompt },
            { role: "user",   content: user },
          ]
        : [{ role: "user", content: systemOrPrompt }];

    const completion = await groqInstance.chat.completions.create({
        messages,
        model: FAST_MODEL,
        temperature: options.temperature ?? 0.3,
        max_tokens:  options.max_tokens  ?? 150,
    });

    return completion.choices[0]?.message?.content || "";
}

/**
 * Generate a structured JSON response using the 8b model in JSON mode.
 * Use this when you need reliable JSON output at minimal token cost.
 *
 * @param {string} systemPrompt - System-level instruction (describes JSON schema)
 * @param {string} userPrompt   - User content / code to analyze
 * @param {Object} [options]
 * @param {number} [options.max_tokens=1500] - Cap output tokens (FREE TIER: keep low)
 * @param {number} [options.temperature=0.2] - Low temp for deterministic JSON
 * @returns {Promise<string>} Raw JSON string (parse in the caller)
 */
export async function generateStructured(systemPrompt, userPrompt, options = {}) {
    if (!groqInstance) {
        throw new Error("Groq API key missing. Cannot generate structured output.");
    }

    const completion = await groqInstance.chat.completions.create({
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user",   content: userPrompt },
        ],
        model: FAST_MODEL,
        response_format: { type: "json_object" },  // enforces valid JSON output
        temperature: options.temperature ?? 0.2,
        max_tokens: options.max_tokens ?? 1500,    // ~1000-1500 is enough for 5-10 frames
    });

    return completion.choices[0]?.message?.content || "{}";
}
