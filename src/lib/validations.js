/**
 * Zod Validation Schemas
 * -----------------------
 * Centralized input validation schemas used across API endpoints.
 * All user inputs pass through these schemas before processing.
 */

import { z } from "zod";

/** Schema for user registration */
export const registerSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must be at most 50 characters")
        .trim(),
    email: z
        .string()
        .email("Invalid email address")
        .toLowerCase()
        .trim(),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .max(100, "Password must be at most 100 characters"),
});

/** Schema for user login */
export const loginSchema = z.object({
    email: z
        .string()
        .email("Invalid email address")
        .toLowerCase()
        .trim(),
    password: z
        .string()
        .min(1, "Password is required"),
});

/** Schema for report generation request */
export const reportSchema = z.object({
    code: z
        .string()
        .min(1, "Code or project description is required")
        .max(50000, "Input too large"),
    language: z
        .string()
        .optional()
        .default("javascript"),
    title: z
        .string()
        .optional()
        .default("Untitled Report"),
});

/** Schema for codebase analysis request */
export const codebaseSchema = z.object({
    files: z
        .array(
            z.object({
                name: z.string(),
                content: z.string(),
            })
        )
        .min(1, "At least one file is required"),
});

/** Schema for diagram generation request */
export const diagramSchema = z.object({
    code: z
        .string()
        .min(1, "Code is required for diagram generation"),
    language: z
        .string()
        .optional()
        .default("javascript"),
});

/** Schema for viva question generation */
export const vivaGenerateSchema = z.object({
    code: z
        .string()
        .min(1, "Code is required")
        .max(50000, "Input too large"),
    language: z
        .string()
        .optional()
        .default("javascript"),
    difficulty: z
        .enum(["easy", "medium", "hard"])
        .optional()
        .default("medium"),
});

/** Schema for viva follow-up generation */
export const vivaFollowupSchema = z.object({
    question: z
        .string()
        .min(1, "Original question is required"),
    answer: z
        .string()
        .optional()
        .default(""),
    code: z
        .string()
        .optional()
        .default(""),
    difficulty: z
        .enum(["easy", "medium", "hard"])
        .optional()
        .default("medium"),
});

/** Schema for viva code explanation */
export const vivaExplainSchema = z.object({
    code: z
        .string()
        .min(1, "Code is required")
        .max(50000, "Input too large"),
    language: z
        .string()
        .optional()
        .default("javascript"),
});

/** Schema for general format conversion */
export const formatConvertSchema = z.object({
    content: z
        .string()
        .min(1, "Content is required"),
    from: z
        .enum(["markdown", "latex", "html", "txt", "json", "csv"]),
    to: z
        .enum(["markdown", "latex", "html", "txt", "json", "csv"]),
});
