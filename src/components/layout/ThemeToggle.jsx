/**
 * Theme Toggle Component
 * -----------------------
 * A polished button that toggles between dark and light themes.
 * Uses next-themes to manage the current theme state with system preference support.
 * Features smooth transitions and SVG icons for a modern look.
 */

"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

// ... SunIcon and MoonIcon remain the same ...

function SunIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
    );
}

function MoonIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
    );
}

/** Hook to track client-side mounting for hydration safety */
function useIsClient() {
    return useSyncExternalStore(
        () => () => {}, // no-op subscription
        () => true,
        () => false
    );
}

export default function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const isClient = useIsClient();

    if (!isClient) {
        return (
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        );
    }

    const isDark = resolvedTheme === "dark";
    const nextTheme = isDark ? "light" : "dark";

    return (
        <button
            onClick={() => setTheme(nextTheme)}
            className={`
                relative w-10 h-10 rounded-xl flex items-center justify-center
                transition-all duration-300 ease-out
                hover:scale-105 active:scale-95
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
                ${isDark 
                    ? "bg-gray-800 text-amber-400 hover:bg-gray-700 shadow-inner" 
                    : "bg-amber-50 text-amber-600 hover:bg-amber-100 shadow-sm"
                }
            `}
            aria-label={`Switch to ${nextTheme} mode. Current theme: ${resolvedTheme}`}
            title={`Switch to ${nextTheme} mode`}
        >
            <span className="sr-only">{isDark ? "Dark mode" : "Light mode"}</span>
            {isDark ? (
                <SunIcon className="w-5 h-5 transition-transform duration-300 rotate-0 hover:rotate-12" />
            ) : (
                <MoonIcon className="w-5 h-5 transition-transform duration-300 rotate-0 hover:-rotate-12" />
            )}
        </button>
    );
}
