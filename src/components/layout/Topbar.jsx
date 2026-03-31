/**
 * Topbar Component
 * -----------------
 * Horizontal top bar displayed above the main content area.
 * Shows the current page title, user info, and theme toggle.
 */

"use client";

import { usePathname } from "next/navigation";
import { useUser } from "@/hooks/useAuth";
import ThemeToggle from "./ThemeToggle";

/** Map route paths to display titles */
const PAGE_TITLES = {
    "/dashboard": "Dashboard",
    "/report": "Report Generator",
    "/visualizer": "DSA Visualizer",
    "/architecture": "Architecture Viewer",
    "/settings": "Settings",
};

export default function Topbar() {
    const pathname = usePathname();
    const { user } = useUser();

    const title = PAGE_TITLES[pathname] || "CodeSensei";

    return (
        <header
            className="h-16 border-b border-gray-200 dark:border-gray-700
                    bg-white dark:bg-gray-800 flex items-center
                    justify-between px-6"
        >
            {/* Left: page title (with left padding for mobile hamburger) */}
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white pl-10 md:pl-0">
                {title}
            </h2>

            {/* Right: theme toggle and user info */}
            <div className="flex items-center gap-4">
                <ThemeToggle />
                {user && (
                    <div className="flex items-center gap-2">
                        {/* Avatar circle with first initial */}
                        <div
                            className="w-8 h-8 rounded-full bg-blue-500 flex items-center
                          justify-center text-white text-sm font-bold"
                        >
                            {user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                            {user.name}
                        </span>
                    </div>
                )}
            </div>
        </header>
    );
}
