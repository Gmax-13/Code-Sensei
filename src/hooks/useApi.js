/**
 * Feature API Hooks
 * ------------------
 * Custom React hooks for the core feature APIs:
 * report generation, codebase analysis, diagram generation, and DSA execution.
 * All use TanStack Query mutations since they are POST-based operations.
 */

"use client";

import { useMutation } from "@tanstack/react-query";
import axios from "axios";

/**
 * Hook for generating structured reports from code.
 * @returns {UseMutationResult}
 */
export function useGenerateReport() {
    return useMutation({
        mutationFn: async ({ title, language, headers, source_code }) => {
            const res = await axios.post("/api/report/generate", {
                title,
                language,
                headers,
                source_code,
            });
            return res.data.data.report;
        },
    });
}

/**
 * Hook for analyzing a codebase (multiple files).
 * @returns {UseMutationResult}
 */
export function useAnalyzeCodebase() {
    return useMutation({
        mutationFn: async ({ files }) => {
            const res = await axios.post("/api/analyze/codebase", { files });
            return res.data.data.analysis;
        },
    });
}

/**
 * Hook for generating Mermaid diagrams from code.
 * @returns {UseMutationResult}
 */
export function useGenerateDiagram() {
    return useMutation({
        mutationFn: async ({ code, language }) => {
            const res = await axios.post("/api/diagram/generate", { code, language });
            return res.data.data.diagrams;
        },
    });
}

/**
 * Hook for executing DSA algorithms with step-by-step output.
 * @returns {UseMutationResult}
 */
export function useExecuteDSA() {
    return useMutation({
        mutationFn: async ({ algorithm, data, operations }) => {
            const res = await axios.post("/api/dsa/execute", {
                algorithm,
                data,
                operations,
            });
            return res.data.data.result;
        },
    });
}

/**
 * Hook for generating viva/interview questions from code.
 * @returns {UseMutationResult}
 */
export function useVivaGenerate() {
    return useMutation({
        mutationFn: async ({ code, language, difficulty }) => {
            const res = await axios.post("/api/viva/generate", {
                code,
                language,
                difficulty,
            });
            return res.data.data.questions;
        },
    });
}

/**
 * Hook for generating viva follow-up questions.
 * @returns {UseMutationResult}
 */
export function useVivaFollowup() {
    return useMutation({
        mutationFn: async ({ question, answer, code, difficulty }) => {
            const res = await axios.post("/api/viva/followup", {
                question,
                answer,
                code,
                difficulty,
            });
            return res.data.data.followup;
        },
    });
}

/**
 * Hook for generating code explanations.
 * @returns {UseMutationResult}
 */
export function useVivaExplain() {
    return useMutation({
        mutationFn: async ({ code, language }) => {
            const res = await axios.post("/api/viva/explain", {
                code,
                language,
            });
            return res.data.data.explanation;
        },
    });
}

/**
 * Hook for converting between text formats.
 * @returns {UseMutationResult}
 */
export function useFormatConvert() {
    return useMutation({
        mutationFn: async ({ content, from, to }) => {
            const res = await axios.post("/api/convert/format", {
                content,
                from,
                to,
            });
            return res.data.data;
        },
    });
}

