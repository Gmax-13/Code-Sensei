/**
 * POST /api/diagram/generate
 * ----------------------------
 * Generates Mermaid.js diagrams from source code using Groq AI.
 *
 * Two Groq calls per request (both use llama-3.1-8b-instant, ~1400 tokens total):
 *   1. generateStructured() → extracts classes, functions, imports, callEdges
 *   2. generateFast()       → produces a 1-2 sentence human summary
 *
 * Falls back to the regex-based diagramService if Groq fails.
 */

import { withAuth } from "@/lib/middleware";
import { diagramSchema } from "@/lib/validations";
import { generateDiagram, generateDiagramFromAI } from "@/services/diagramService";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { generateStructured, generateFast } from "@/lib/groqClient";

/** Hard cap on input to protect the free tier token budget. */
const MAX_CODE_CHARS = 4000;

/**
 * Build the structured-extraction prompt.
 * JSON mode is enforced by generateStructured() so we only need the schema.
 */
function buildExtractionPrompt(code, language) {
    const snippet = code.slice(0, MAX_CODE_CHARS);
    return {
        system: `You are a code structure analyser. 
Return ONLY a single valid JSON object — no markdown, no explanation.
Schema:
{
  "summary": "1-2 sentences describing what this code does and its purpose",
  "classes": [{ "name": "string", "parent": "string|null", "methods": ["string"] }],
  "functions": [{ "name": "string", "params": ["string"], "calls": ["string"] }],
  "imports": [{ "source": "string", "named": ["string"] }],
  "callEdges": [{ "from": "string", "to": "string" }]
}
callEdges should represent actual function/method call relationships visible in the code.
If a field has no items, return an empty array. Keep method/function names concise.`,
        user: `Language: ${language}\n\nCode:\n${snippet}`,
    };
}

async function handler(request, context, user) {
    try {
        // 1. Validate input
        const body = await request.json();
        const parsed = diagramSchema.safeParse(body);

        if (!parsed.success) {
            const message = parsed.error.errors[0]?.message || "Invalid input";
            return errorResponse(message, 400);
        }

        const { code, language } = parsed.data;

        // ── AI path ───────────────────────────────────────────────────────────
        let diagrams;
        let summary = null;
        let aiJson  = null;
        let usedAI  = false;

        try {
            // Call 1: structural extraction (JSON mode, 1200 tokens)
            const { system, user: userPrompt } = buildExtractionPrompt(code, language);
            const rawJson = await generateStructured(system, userPrompt, { max_tokens: 1200 });
            aiJson = JSON.parse(rawJson);

            // Call 2: one-line insight (plain text, 200 tokens)
            summary = await generateFast(
                "You are a senior code reviewer. Be concise.",
                `In 1-2 sentences, explain the architectural role of this ${language} code and one improvement suggestion:\n${code.slice(0, 800)}`,
                { max_tokens: 200 }
            );

            // Generate diagrams from AI-extracted structure
            diagrams = generateDiagramFromAI(aiJson);
            usedAI = true;
        } catch (aiErr) {
            // Groq failed (rate-limit, network, bad JSON) → fall back to regex
            console.warn("Groq diagram extraction failed, falling back to regex:", aiErr.message);
            diagrams = generateDiagram(parsed.data);
        }

        return successResponse({
            diagrams,
            summary,
            aiJson,
            usedAI,
            metadata: {
                classes:   aiJson?.classes?.length   ?? diagrams._meta?.classes   ?? 0,
                functions: aiJson?.functions?.length ?? diagrams._meta?.functions ?? 0,
                imports:   aiJson?.imports?.length   ?? diagrams._meta?.imports   ?? 0,
                language,
            },
        });
    } catch (error) {
        console.error("Diagram generation error:", error);
        return errorResponse("Failed to generate diagrams. Please try again.", 500);
    }
}

export const POST = withAuth(handler);
