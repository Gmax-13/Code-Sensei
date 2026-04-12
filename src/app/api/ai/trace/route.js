/**
 * POST /api/ai/trace
 * -----------------------
 * Traces execution of uploaded source code using Gemini to build an ExecutionMap.
 * Powered by Gemini 2.5 Flash for deep context windows.
 */

import { withAuth } from "@/lib/middleware";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { generateText } from "@/lib/geminiClient";

/**
 * Builds the comprehensive prompt for tracing execution logic.
 */
function buildTracerPrompt(code, language) {
    return `You are an execution tracer and visual debugger for an educational tool.
Analyze this ${language} code and trace its execution as if it were run with typical/example inputs. If it's a function without a call, simulate a realistic call to it.

Code:
\`\`\`${language}
${code}
\`\`\`

Return ONLY valid JSON obeying this schema structure (NO markdown code blocks, NO text outside JSON):
{
  "language": "${language}",
  "totalSteps": number, // count of frames
  "hotPaths": [ "string identifying interesting parts like 'loop at line 4'" ],
  "frames": [
    {
      "stepIndex": number (starting at 0),
      "line": number (the 1-indexed line number being executed),
      "description": "Short description of what the line does, e.g. 'Initializing variable x'",
      "annotation": "A 'why' explanation of the logic, e.g. 'Loop continues because count < 10'",
      "variables": { "var1": value1_as_string_or_number, "var2": value2 },
      "callStack": [ "functionName" ],
      "highlightLines": [ lineNumber ]
    }
  ]
}

Make sure to map out 5 to 15 key execution frames demonstrating the flow. Focus on assignments, conditionals, loop branches, and returns. Variables must reflect the state *after* the line executes. Ensure that all line numbers match the provided code snippet properly. DO NOT surround your JSON with \`\`\`json blocks. Return JSON directly.`;
}

async function handler(request) {
    try {
        const body = await request.json();
        const { code, language = "javascript" } = body;

        if (!code) {
            return errorResponse("Source code is required.", 400);
        }

        const prompt = buildTracerPrompt(code, language);
        const rawText = await generateText(prompt);

        // Strip markdown backticks if Gemini includes them
        const cleaned = rawText
            .replace(/^```(?:json)?\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();

        let parsed;
        try {
            parsed = JSON.parse(cleaned);
        } catch (e) {
            console.error("Failed to parse Gemini trace output:", cleaned.slice(0, 500));
            return errorResponse("Gemini returned invalid JSON format.", 500);
        }

        return successResponse(parsed);
    } catch (error) {
        console.error("Gemini trace error:", error);
        return errorResponse("Failed to generate execution trace.", 500);
    }
}

export const POST = withAuth(handler);
