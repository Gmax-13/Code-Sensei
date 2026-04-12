"use client";
import { useState, useEffect, useRef } from "react";

export function useTimeline(steps = []) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(500);
    const timerRef = useRef(null);

    // Reset when steps change
    useEffect(() => {
        setCurrentStep(0);
        setIsPlaying(false);
    }, [steps]);

    // Handle playback
    useEffect(() => {
        if (!isPlaying) {
            clearTimeout(timerRef.current);
            return;
        }

        if (currentStep >= steps.length - 1) {
            // End of steps
            setIsPlaying(false);
            return;
        }

        timerRef.current = setTimeout(() => {
            setCurrentStep(prev => prev + 1);
        }, speed);

        return () => clearTimeout(timerRef.current);
    }, [isPlaying, currentStep, steps.length, speed]);

    const play = () => setIsPlaying(true);
    const pause = () => setIsPlaying(false);
    const togglePlay = () => setIsPlaying(prev => !prev);
    const setStep = (index) => {
        setIsPlaying(false);
        setCurrentStep(Math.max(0, Math.min(index, steps.length - 1)));
    };
    const next = () => setStep(currentStep + 1);
    const prev = () => setStep(currentStep - 1);

    return {
        currentStep,
        isPlaying,
        speed,
        setSpeed,
        play,
        pause,
        togglePlay,
        setStep,
        next,
        prev,
        stepData: steps[currentStep] || null,
        totalSteps: steps.length
    };
}
