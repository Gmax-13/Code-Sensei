"use client";
import { useState } from "react";
import axios from "axios";

export function useTracerExecution() {
    const [frames, setFrames] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState(null);

    const analyzeCode = async (code, language) => {
        setIsAnalyzing(true);
        setError(null);
        try {
            const res = await axios.post("/api/ai/trace", { code, language });
            const executionMap = res.data.data;
            setFrames(executionMap.frames || []);
        } catch (err) {
            console.error("Analyze error:", err);
            setError(err.response?.data?.error || "Failed to analyze code");
            setFrames([]);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return {
        frames,
        isAnalyzing,
        error,
        analyzeCode,
        clear: () => {
            setFrames([]);
            setError(null);
        }
    };
}
