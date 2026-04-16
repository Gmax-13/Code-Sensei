"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

export function useGroqAnnotation(stepIndex, stepDescription, algorithm, isPlaying) {
    const [annotations, setAnnotations] = useState({}); // Cache: { [stepIndex]: "..." }
    const [isLoading, setIsLoading] = useState(false);
    
    // Clear cache when algorithm changes
    useEffect(() => {
        setAnnotations({});
    }, [algorithm]);

    useEffect(() => {
        if (isPlaying || stepIndex === undefined || !stepDescription) return;
        
        // If already cached, do nothing
        if (annotations[stepIndex]) return;

        // Fetch on pause after debounce
        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const res = await axios.post("/api/ai/annotate", {
                    algorithm,
                    stepDescription,
                    stepIndex,
                    context: "Previous step was " + (stepIndex > 0 ? "step " + (stepIndex - 1) : "None")
                });
                const { annotation } = res.data.data;
                setAnnotations(prev => ({ ...prev, [stepIndex]: annotation }));
            } catch (err) {
                console.error("Failed to fetch annotation", err);
            } finally {
                setIsLoading(false);
            }
        }, 600); // 600ms debounce

        return () => clearTimeout(timer);
    }, [stepIndex, stepDescription, algorithm, isPlaying]);

    return {
        annotation: annotations[stepIndex] || null,
        isLoading
    };
}
