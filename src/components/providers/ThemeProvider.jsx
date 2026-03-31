/**
 * Theme Provider Component
 * -------------------------
 * Provides dark/light theme support using next-themes.
 * Wraps children with the ThemeProvider and adds
 * attribute-based class switching for Tailwind dark mode.
 */

"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export default function ThemeProvider({ children }) {
    return (
        <NextThemesProvider
            attribute="class"       // Use class-based dark mode (for Tailwind)
            defaultTheme="system"   // Follow system preference by default
            enableSystem             // Enable system preference detection
            disableTransitionOnChange // Prevent flash during theme switch
        >
            {children}
        </NextThemesProvider>
    );
}
