/**
 * Topbar Component
 * -----------------
 * Horizontal top bar displayed above the main content area.
 * Shows the current page title, user info with dropdown, and theme toggle.
 * Features improved styling, user menu, and mobile responsiveness.
 */

"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useUser, useLogout } from "@/hooks/useAuth";
import ThemeToggle from "./ThemeToggle";

/** Map route paths to display titles */
const PAGE_TITLES = {
    "/dashboard": "Dashboard",
    "/report": "Report Generator",
    "/visualizer": "DSA Visualizer",
    "/architecture": "Architecture Viewer",
    "/settings": "Settings",
};

/** Chevron down icon */
function ChevronDownIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
        </svg>
    );
}

/** User icon */
function UserIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}

/** Logout icon */
function LogoutIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    );
}

/** Settings icon */
function SettingsIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    );
}

export default function Topbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isLoading } = useUser();
    const logout = useLogout();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const title = PAGE_TITLES[pathname] || "CodeSensei";

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout.mutateAsync();
        window.location.href = "/";
    };

    const handleSettings = () => {
        router.push("/settings");
        setIsMenuOpen(false);
    };

    return (
        <header
            className="h-16 border-b border-gray-200 dark:border-gray-700/50
                    bg-white/80 dark:bg-gray-800/80 backdrop-blur-md
                    flex items-center justify-between px-4 md:px-6
                    sticky top-0 z-20"
        >
            {/* Left: page title (with left padding for mobile hamburger) */}
            <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 pl-12 md:pl-0">
                    {title}
                </h2>
            </div>

            {/* Right: theme toggle and user menu */}
            <div className="flex items-center gap-2 md:gap-4">
                <ThemeToggle />

                {isLoading ? (
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                ) : user ? (
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex items-center gap-2 p-1.5 rounded-xl
                                     hover:bg-gray-100 dark:hover:bg-gray-700/50
                                     transition-all duration-200
                                     focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            aria-expanded={isMenuOpen}
                            aria-haspopup="true"
                        >
                            {/* Avatar circle with first initial */}
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 
                                          flex items-center justify-center text-white text-sm font-bold
                                          shadow-sm">
                                {user.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block max-w-[120px] truncate">
                                {user.name}
                            </span>
                            <ChevronDownIcon className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`} />
                        </button>

                        {/* User dropdown menu */}
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-56 rounded-xl 
                                          bg-white dark:bg-gray-800 
                                          border border-gray-200 dark:border-gray-700
                                          shadow-lg dark:shadow-gray-900/20
                                          py-2 z-50 animate-fade-in">
                                {/* User info header */}
                                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700/50">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                        {user.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {user.email}
                                    </p>
                                    <span className="inline-flex items-center px-2 py-0.5 mt-2 rounded-full text-xs font-medium
                                                   bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 capitalize">
                                        {user.role || "user"}
                                    </span>
                                </div>

                                {/* Menu items */}
                                <div className="py-1">
                                    <button
                                        onClick={handleSettings}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300
                                                 hover:bg-gray-50 dark:hover:bg-gray-700/50
                                                 flex items-center gap-3 transition-colors"
                                    >
                                        <SettingsIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                        Settings
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        disabled={logout.isPending}
                                        className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400
                                                 hover:bg-red-50 dark:hover:bg-red-900/20
                                                 flex items-center gap-3 transition-colors
                                                 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <LogoutIcon className={`w-4 h-4 ${logout.isPending && "animate-pulse"}`} />
                                        {logout.isPending ? "Logging out..." : "Logout"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>
        </header>
    );
}
