/**
 * POST /api/ai/trace
 * -----------------------
 * Traces execution of source code and returns an ExecutionMap.
 *
 * FREE TIER OPTIMIZATIONS:
 *   - Uses llama-3.1-8b-instant (500k tokens/day) NOT 70b (100k/day)
 *   - JSON mode enforced → no wasted tokens on markdown/preamble
 *   - max_tokens capped at 1200 (10 frames × ~120 tokens each = ~1200 max)
 *   - Prompt trimmed to essentials — no verbose examples in system prompt
 *   - Input code capped at 4000 chars (beyond that is rarely needed for tracing)
 *   - Requests exactly 5–8 frames (not 5-15) to keep output predictable and small
 */

import { withAuth } from "@/lib/middleware";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { generateStructured } from "@/lib/groqClient";

// Tight system prompt — every token in a system prompt counts against your budget
const SYSTEM_PROMPT = `You are a code execution tracer for a student learning tool.
Simulate 5 to 8 key execution frames for the provided code. If no entry point exists, simulate a realistic one.

Return ONLY valid JSON (no markdown, no text outside JSON) in this exact shape:
{
  "language": string,
  "totalSteps": number,
  "hotPaths": [string],
  "frames": [
    {
      "stepIndex": number,
      "line": number,
      "description": string,
      "annotation": string,
      "variables": { "name": "value" },
      "callStack": [string],
      "highlightLines": [number]
    }
  ]
}
Rules: line numbers are 1-indexed. Variables reflect state AFTER the line executes. annotation explains WHY, not WHAT.`;

async function handler(request) {
    try {
        const body = await request.json();
        const { code, language = "javascript" } = body;

        if (!code || !code.trim()) {
            return errorResponse("Source code is required.", 400);
        }

        // Cap input at 4000 chars — beyond this rarely adds meaningful trace frames
        // and burns tokens fast on the free tier
        const trimmedCode = code.length > 4000
            ? code.slice(0, 4000) + "\n// ... (truncated for analysis)"
            : code;

        const userPrompt = `Trace this ${language} code:\n\`\`\`${language}\n${trimmedCode}\n\`\`\``;

        const rawText = await generateStructured(SYSTEM_PROMPT, userPrompt, {
            max_tokens: 1200,  // 10 frames × ~120 tokens = ~1200 worst case
            temperature: 0.2,  // low temp = consistent JSON, less hallucination
        });

        let parsed;
        try {
            parsed = JSON.parse(rawText);
        } catch (e) {
            console.error("Trace JSON parse failed:", rawText.slice(0, 300));
            return errorResponse("AI returned an invalid response. Please try again.", 500);
        }

        if (!parsed.frames || !Array.isArray(parsed.frames)) {
            return errorResponse("AI response missing required 'frames' array.", 500);
        }

        return successResponse(parsed);
    } catch (error) {
        console.error("Trace route error:", error);
        return errorResponse("Failed to generate execution trace.", 500);
    }
}

export const POST = withAuth(handler);
