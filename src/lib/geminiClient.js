/**
 * Gemini AI Client
 * -----------------
 * Singleton wrapper for Google's Generative AI SDK.
 * Used for deep-context tasks like the code execution tracer
 * and architecture analysis (long context window, high quality).
 *
 * Model: gemini-2.5-flash — stable, best price/performance (2026)
 * Only runs server-side (API routes). Never exposed to the client.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is not defined in .env.local");
}

let genAI = null;

if (GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

/**
 * Send a text prompt to Gemini and return the raw response text.
 *
 * @param {string} prompt - The full prompt string
 * @param {string} [modelName] - Optional model override (default: gemini-2.5-flash)
 * @returns {Promise<string>} The generated text
 */
export async function generateText(prompt, modelName = "gemini-2.5-flash") {
    if (!genAI) {
        throw new Error(
            "Gemini API key missing. Add GEMINI_API_KEY to .env.local"
        );
    }

    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    return result.response.text();
}
