/**
 * Groq AI Client
 * -----------------
 * Singleton wrapper for Groq SDK.
 * Used for fast, low-latency API calls (<300ms) like per-step annotations.
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

/**
 * Generate a quick annotation using the Groq API.
 * Uses llama-3.1-8b-instant for maximum speed.
 * 
 * @param {string} prompt - The prompt instructing the AI
 * @returns {Promise<string>} The generated annotation
 */
export async function generateFast(prompt) {
    if (!groqInstance) {
        throw new Error("Groq API key missing. Cannot generate fast annotation.");
    }

    const completion = await groqInstance.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.1-8b-instant",
        temperature: 0.3,
        max_tokens: 150,
    });

    return completion.choices[0]?.message?.content || "";
}
