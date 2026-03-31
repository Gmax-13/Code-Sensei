/**
 * Theme Toggle Component
 * -----------------------
 * A simple button that toggles between dark and light themes.
 * Uses next-themes to manage the current theme state.
 */

"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch — only render after mount
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        // Return a placeholder with same dimensions to prevent layout shift
        return <div className="w-9 h-9" />;
    }

    /** Toggle between dark and light themes */
    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-colors duration-200
                 hover:bg-gray-200 dark:hover:bg-gray-700
                 text-gray-600 dark:text-gray-300"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
            {theme === "dark" ? "☀️" : "🌙"}
        </button>
    );
}
