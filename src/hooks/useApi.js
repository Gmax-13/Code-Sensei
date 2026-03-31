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
        mutationFn: async ({ code, language, title }) => {
            const res = await axios.post("/api/report/generate", {
                code,
                language,
                title,
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
