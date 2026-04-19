/**
 * Groq API Service
 * ------------------
 * Integrates with the Groq API for fast LLM-based text generation.
 * Uses raw fetch (OpenAI-compatible endpoint) to avoid extra dependencies.
 * Model: llama-3.3-70b-versatile (fast, high quality, free tier).
 */

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// NOTE: llama-3.3-70b-versatile has 100k tokens/day on the free tier.
// Use this model only for report generation where quality matters.
// For all other AI features, use groqClient.js (llama-3.1-8b-instant, 500k/day).
const GROQ_MODEL = "llama-3.3-70b-versatile";

/**
 * Call the Groq chat completions API.
 *
 * @param {string} systemPrompt - System-level instruction
 * @param {string} userPrompt - User-level content/question
 * @param {Object} options - Optional overrides (temperature, max_tokens)
 * @returns {Promise<string>} The assistant's response text
 */
export async function callGroq(systemPrompt, userPrompt, options = {}) {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        throw new Error(
            "GROQ_API_KEY is not set. Add it to your .env.local file. "
            + "Get a free key at https://console.groq.com"
        );
    }

    const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            temperature: options.temperature ?? 0.7,
            // Default 2048: a 5-section report is ~1000-1400 output tokens.
            // 2048 gives headroom without burning the 100k/day free tier budget.
            max_tokens: options.max_tokens ?? 2048,
            response_format: { type: "json_object" },
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Groq API error:", response.status, errorBody);
        throw new Error(`Groq API returned ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
}

/**
 * Generate a structured academic report using Groq.
 *
 * @param {Object} params
 * @param {string} params.title - Report title (required)
 * @param {string} params.language - Programming language context
 * @param {string[]} params.headers - Ordered list of section headers
 * @param {string} [params.source_code] - Optional source code
 * @returns {Promise<Array<{header: string, content: string}>>} Report sections
 */
export async function generateReportWithGroq({ title, language, headers, source_code }) {
    const hasCode = source_code && source_code.trim().length > 0;

    const systemPrompt = `You are an expert academic report writer. You generate formal, well-structured practical/lab reports for computer science students.

RULES:
- Write in a formal, academic tone with technical depth and clarity.
- Aim should be same as the title given as input.Theory should be detailed and should explain the concepts used in the project.Procedure should be step by step and should be in bullet points.Result should be small(1-3 lines).Conclusion should be small(1-2 lines) and should explain what was learned from the project.
- Use proper technical terminology relevant to the topic and programming language.
- Do NOT use markdown formatting in the content (no #, **, etc.) — return plain text paragraphs.
- Return ONLY valid JSON in the exact format specified below. No extra text.

RESPONSE FORMAT:
{
  "sections": [
    { "header": "<section name>", "content": "<section content as a plain text paragraph>" }
  ]
}

The "sections" array must contain exactly one entry for each header provided, in the same order.`;

    let userPrompt = `Generate a formal academic report for the project titled: "${title}"
Programming Language: ${language}
Sections to generate (in this exact order): ${headers.join(", ")}

`;

    if (hasCode) {
        userPrompt += `The following source code is provided for this project. Incorporate implementation details, code structure analysis, and specific references to the code in relevant sections.

SOURCE CODE:
\`\`\`${language}
${source_code}
\`\`\`

Use the code to:
- Describe what the program specifically does in the Aim section (if present)
- Explain the actual algorithms and data structures used in the Theory section (if present)
- Detail the specific implementation steps based on the code in the Procedure section (if present)
- Describe the expected output/behavior based on the code in the Result section (if present)
- Summarize what was implemented and learned in the Conclusion section (if present)`;
    } else {
        userPrompt += `No source code is provided. Generate the report purely from the title.
Make intelligent assumptions about:
- What the project likely involves
- Common approaches and algorithms for this topic
- Expected implementation steps
- Typical results and outcomes

Write with enough detail that a student could use this as a comprehensive lab report guide.`;
    }

    const responseText = await callGroq(systemPrompt, userPrompt);

    try {
        const parsed = JSON.parse(responseText);

        if (!parsed.sections || !Array.isArray(parsed.sections)) {
            throw new Error("Invalid response structure — missing sections array");
        }

        // Validate that we got a section for each header
        return headers.map((header) => {
            const found = parsed.sections.find(
                (s) => s.header?.toLowerCase() === header.toLowerCase()
            );
            return {
                header,
                content: found?.content || `Content for "${header}" could not be generated.`,
            };
        });
    } catch (parseError) {
        console.error("Failed to parse Groq response:", parseError);
        console.error("Raw response:", responseText);
        throw new Error("Failed to parse AI response. Please try again.");
    }
}
