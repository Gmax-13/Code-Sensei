/**
 * Pluggable LLM Client
 * ----------------------
 * Abstraction layer for LLM API calls. Ships with a mock
 * implementation by default. To switch to a real provider:
 *
 *   1. Set LLM_PROVIDER="openai" (or "google") in your .env
 *   2. Set LLM_API_KEY="sk-..." in your .env
 *   3. Install the corresponding SDK (e.g., `npm install openai`)
 *
 * The rest of the app calls `llmComplete()` — no other changes needed.
 */

const LLM_PROVIDER = process.env.LLM_PROVIDER || "mock";
const LLM_API_KEY = process.env.LLM_API_KEY || "";
const LLM_MODEL = process.env.LLM_MODEL || "gpt-4o-mini";

/**
 * Send a prompt to the configured LLM and return the response text.
 *
 * @param {string} systemPrompt - System-level instruction
 * @param {string} userPrompt - User-level message/content
 * @param {Object} options - Optional overrides
 * @param {number} options.temperature - Sampling temperature (default 0.7)
 * @param {number} options.maxTokens - Max response tokens (default 2048)
 * @returns {Promise<string>} LLM response text
 */
export async function llmComplete(systemPrompt, userPrompt, options = {}) {
    const { temperature = 0.7, maxTokens = 2048 } = options;

    switch (LLM_PROVIDER) {
        case "openai":
            return await openaiComplete(systemPrompt, userPrompt, temperature, maxTokens);

        case "google":
            return await googleComplete(systemPrompt, userPrompt, temperature, maxTokens);

        case "mock":
        default:
            return mockComplete(systemPrompt, userPrompt);
    }
}

/**
 * Send a prompt and parse the response as JSON.
 * Falls back to wrapping the text in a { result } object.
 *
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @param {Object} options
 * @returns {Promise<Object>}
 */
export async function llmCompleteJSON(systemPrompt, userPrompt, options = {}) {
    const text = await llmComplete(systemPrompt, userPrompt, options);
    try {
        // Try to extract JSON from the response (handles markdown code fences)
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        const raw = jsonMatch ? jsonMatch[1].trim() : text.trim();
        return JSON.parse(raw);
    } catch {
        return { result: text };
    }
}

// ──────────────────────────────────────────────
// Provider implementations
// ──────────────────────────────────────────────

/** OpenAI-compatible provider */
async function openaiComplete(systemPrompt, userPrompt, temperature, maxTokens) {
    // Dynamic import so the SDK isn't required unless used
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey: LLM_API_KEY });

    const response = await client.chat.completions.create({
        model: LLM_MODEL,
        temperature,
        max_tokens: maxTokens,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ],
    });

    return response.choices[0]?.message?.content || "";
}

/** Google Generative AI provider */
async function googleComplete(systemPrompt, userPrompt, temperature, maxTokens) {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: LLM_API_KEY });

    const response = await ai.models.generateContent({
        model: LLM_MODEL || "gemini-2.0-flash",
        contents: `${systemPrompt}\n\n${userPrompt}`,
        config: {
            temperature,
            maxOutputTokens: maxTokens,
        },
    });

    return response.text || "";
}

/** Mock provider — returns structured fake responses for development */
function mockComplete(systemPrompt, userPrompt) {
    // Detect what kind of response is expected from the system prompt
    if (systemPrompt.includes("interview") || systemPrompt.includes("question")) {
        return JSON.stringify({
            mainQuestions: [
                "What is the overall purpose of this code?",
                "Explain the control flow and how data moves through the program.",
                "What design patterns or principles are used here?",
                "How would you test this code? What edge cases exist?",
                "What improvements would you make for production readiness?",
            ],
            followUpQuestions: [
                "Can you explain the time complexity of the main algorithm?",
                "How would you handle concurrent access to shared resources?",
                "What alternative approaches could achieve the same result?",
            ],
            conceptualQuestions: [
                "Explain the theoretical foundation behind the approach used in this code.",
                "Compare and contrast this implementation with other common paradigms.",
            ],
        });
    }

    if (systemPrompt.includes("follow-up") || systemPrompt.includes("followup")) {
        return JSON.stringify({
            followUpQuestions: [
                "Can you elaborate on your previous answer with a concrete example?",
                "What would happen if the input size increased by 100x?",
                "How does this relate to real-world system design?",
            ],
        });
    }

    if (systemPrompt.includes("explain")) {
        return JSON.stringify({
            explanation: "This code demonstrates a well-structured approach to the problem. It uses modular functions to separate concerns, handles edge cases gracefully, and follows clean coding patterns. The main logic processes input data through a series of transformations, producing the expected output efficiently.",
            keyConcepts: [
                "Modular design",
                "Error handling",
                "Data transformation pipeline",
            ],
            complexity: {
                time: "O(n)",
                space: "O(1)",
            },
        });
    }

    return JSON.stringify({ result: "Mock response — configure LLM_PROVIDER in .env for real output." });
}
