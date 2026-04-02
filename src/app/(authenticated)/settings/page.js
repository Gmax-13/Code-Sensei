/**
 * Settings Page
 * ---------------
 * User settings and profile management page.
 * Displays user profile information, theme preferences, and logout option.
 * Features a clean, card-based layout with consistent styling.
 */

"use client";

import { useUser, useLogout } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

/** Hook to track client-side mounting for hydration safety */
function useIsClient() {
    return useSyncExternalStore(
        () => () => {}, // no-op subscription
        () => true,
        () => false
    );
}

/** Sun icon for light mode */
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

/** Moon icon for dark mode */
function MoonIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
    );
}

/** Monitor icon for system preference */
function MonitorIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
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

/** Shield icon for role */
function ShieldIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    );
}

/** Calendar icon */
function CalendarIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    );
}

/** Mail icon */
function MailIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
        </svg>
    );
}

export default function SettingsPage() {
    const { user, isLoading } = useUser();
    const logout = useLogout();
    const { theme, setTheme } = useTheme();
    const isClient = useIsClient();

    const handleLogout = async () => {
        await logout.mutateAsync();
        window.location.href = "/";
    };

    const themeOptions = [
        { value: "light", label: "Light", desc: "Always use light theme", Icon: SunIcon },
        { value: "dark", label: "Dark", desc: "Always use dark theme", Icon: MoonIcon },
        { value: "system", label: "System", desc: "Follow OS preference", Icon: MonitorIcon },
    ];

    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-48" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-64" />
                <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* ---- Page Header ---- */}
            <div className="pb-2 border-b border-gray-200 dark:border-gray-800">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg">
                        <UserIcon className="w-5 h-5" />
                    </span>
                    Profile & Settings
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                    Manage your account settings and preferences.
                </p>
            </div>

            {/* ---- Profile Card ---- */}
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700/50 p-6 shadow-sm dark:shadow-none">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                    <div className="w-1 h-5 bg-blue-500 rounded-full" />
                    Profile Information
                </h3>

                <div className="flex flex-col sm:flex-row items-start gap-5">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-500/20">
                            {user?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                    </div>

                    {/* User details */}
                    <div className="flex-1 min-w-0 space-y-4 w-full">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                Full Name
                            </label>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                {user?.name || "—"}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                                <MailIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                                <div className="min-w-0">
                                    <label className="block text-xs text-gray-500 dark:text-gray-400">Email</label>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {user?.email || "—"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                                <ShieldIcon className="w-5 h-5 text-blue-400 dark:text-blue-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <label className="block text-xs text-gray-500 dark:text-gray-400">Role</label>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                        {user?.role || "user"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 sm:col-span-2">
                                <CalendarIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <label className="block text-xs text-gray-500 dark:text-gray-400">Member Since</label>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {user?.createdAt
                                            ? new Date(user.createdAt).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })
                                            : "—"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ---- Theme Preferences ---- */}
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700/50 p-6 shadow-sm dark:shadow-none">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                    <div className="w-1 h-5 bg-purple-500 rounded-full" />
                    Appearance
                </h3>

                {isClient ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {themeOptions.map((option) => {
                            const Icon = option.Icon;
                            const isSelected = theme === option.value;
                            return (
                                <button
                                    key={option.value}
                                    onClick={() => setTheme(option.value)}
                                    className={`
                                        flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200
                                        ${isSelected
                                            ? "border-blue-500 bg-blue-500/5 dark:bg-blue-500/10 shadow-sm"
                                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                        }
                                    `}
                                >
                                    <Icon className={`w-6 h-6 mb-2 ${isSelected ? "text-blue-500" : "text-gray-500 dark:text-gray-400"}`} />
                                    <span className={`text-sm font-semibold ${isSelected ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
                                        {option.label}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                                        {option.desc}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-28 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
                        ))}
                    </div>
                )}
            </div>

            {/* ---- Account Actions ---- */}
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700/50 p-6 shadow-sm dark:shadow-none">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                    <div className="w-1 h-5 bg-red-500 rounded-full" />
                    Account
                </h3>

                <button
                    onClick={handleLogout}
                    disabled={logout.isPending}
                    className="flex items-center gap-3 px-5 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 
                             text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30
                             transition-colors duration-200 font-medium
                             disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    <LogoutIcon className={`w-5 h-5 ${logout.isPending && "animate-pulse"}`} />
                    <span>{logout.isPending ? "Logging out..." : "Logout"}</span>
                </button>
            </div>

            {/* ---- About Section ---- */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700/50 p-5 bg-gray-50/50 dark:bg-gray-900/30">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    About CodeSensei
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Version 0.1.0 — Built for CS students to generate reports, understand codebases,
                    visualize algorithms, and prepare for vivas. Made with care using Next.js, React,
                    MongoDB, and Tailwind CSS.
                </p>
            </div>
        </div>
    );
}

