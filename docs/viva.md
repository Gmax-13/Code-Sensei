# Viva / Interview Mode — API & Architecture

## Overview

The Viva system generates structured interview questions, follow-ups, and code explanations from code input. It uses a **pluggable LLM client** — ships with mocked responses for development, and can be switched to OpenAI or Google Gemini by setting environment variables.

### Architecture

```
Code / Context → Service Layer → LLM Client → Structured JSON Output
```

---

## Endpoints

### POST `/api/viva/generate`

Generate a full set of interview questions from code.

**Request:**

```json
{
  "code": "function fibonacci(n) { ... }",
  "language": "javascript",
  "difficulty": "medium"
}
```

- `difficulty`: `"easy"` | `"medium"` | `"hard"` (default: `"medium"`)

**Response:**

```json
{
  "success": true,
  "data": {
    "questions": {
      "mainQuestions": ["Q1", "Q2", "Q3", "Q4", "Q5"],
      "followUpQuestions": ["F1", "F2", "F3"],
      "conceptualQuestions": ["C1", "C2"],
      "difficulty": "medium",
      "language": "javascript"
    }
  }
}
```

---

### POST `/api/viva/followup`

Generate follow-up questions based on a prior Q&A.

**Request:**

```json
{
  "question": "What is the time complexity?",
  "answer": "It's O(n).",
  "code": "...",
  "difficulty": "medium"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "followup": {
      "followUpQuestions": ["...", "...", "..."],
      "hint": "Consider the recursive calls...",
      "evaluation": "good"
    }
  }
}
```

---

### POST `/api/viva/explain`

Generate a structured explanation of code.

**Request:**

```json
{
  "code": "function bfs(graph, start) { ... }",
  "language": "javascript"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "explanation": {
      "explanation": "This code implements...",
      "keyConcepts": ["BFS", "Queue", "Graph traversal"],
      "complexity": { "time": "O(V+E)", "space": "O(V)" },
      "suggestions": ["Add visited set optimization", "..."]
    }
  }
}
```

---

## LLM Client Configuration

The LLM client (`src/services/viva/llmClient.js`) is a **plug-and-play** module. Configure it via environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `LLM_PROVIDER` | `"mock"` | Provider: `"mock"`, `"openai"`, or `"google"` |
| `LLM_API_KEY` | `""` | Your API key |
| `LLM_MODEL` | `"gpt-4o-mini"` | Model identifier |

### Switching to a real LLM

1. Add to `.env.local`:
   ```env
   LLM_PROVIDER=openai
   LLM_API_KEY=sk-your-key-here
   LLM_MODEL=gpt-4o-mini
   ```

2. Install the SDK:
   ```bash
   npm install openai
   # or for Google:
   npm install @google/genai
   ```

3. Restart the dev server. All Viva endpoints will now use real LLM responses.

---

## Service Files

| Service | Path | Purpose |
|---------|------|---------|
| LLM Client | `src/services/viva/llmClient.js` | Pluggable LLM abstraction |
| Question Generator | `src/services/viva/questionGenerator.js` | Interview question generation |
| Follow-up Generator | `src/services/viva/followupGenerator.js` | Progressive follow-up Q&A |
| Code Explainer | `src/services/viva/codeExplainer.js` | Structured code analysis |

---

## UI Page

**Route:** `/viva` (under authenticated layout)

### Features:
- Paste code textarea
- Language selector dropdown
- Difficulty toggle (Easy / Medium / Hard)
- Two action buttons: "Generate Questions" and "Explain Code"
- Tabbed results display for Questions vs. Explanation
- Questions grouped by type with color-coded cards
- Complexity analysis cards for explanations

---

## Authentication

All Viva endpoints are protected by the `withAuth` middleware. A valid JWT cookie is required.

---

## Prompt Engineering

The system uses carefully crafted prompts that:
- Emulate a senior CS professor conducting a viva examination
- Adapt question difficulty based on the selected level
- Require structured JSON output from the LLM
- Include rules for question count and type distribution
