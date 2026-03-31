/**
 * Settings Page
 * ---------------
 * User settings and profile management page.
 * Displays user profile information and theme preferences.
 */

"use client";

import { useUser } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function SettingsPage() {
    const { user } = useUser();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch for theme rendering
    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* ---- Page Header ---- */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    ⚙️ Settings
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Manage your profile and preferences.
                </p>
            </div>

            {/* ---- Profile Card ---- */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Profile Information
                </h3>

                <div className="space-y-4">
                    {/* Avatar */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                            {user?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                            <p className="text-lg font-medium text-gray-900 dark:text-white">
                                {user?.name || "User"}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {user?.email || "—"}
                            </p>
                        </div>
                    </div>

                    {/* Profile fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div>
                            <label className="block text-sm text-gray-500 dark:text-gray-400">Name</label>
                            <p className="text-gray-900 dark:text-white font-medium">{user?.name || "—"}</p>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-500 dark:text-gray-400">Email</label>
                            <p className="text-gray-900 dark:text-white font-medium">{user?.email || "—"}</p>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-500 dark:text-gray-400">Role</label>
                            <p className="text-gray-900 dark:text-white font-medium capitalize">{user?.role || "user"}</p>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-500 dark:text-gray-400">Member Since</label>
                            <p className="text-gray-900 dark:text-white font-medium">
                                {user?.createdAt
                                    ? new Date(user.createdAt).toLocaleDateString()
                                    : "—"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ---- Theme Preferences ---- */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Appearance
                </h3>

                {mounted && (
                    <div className="flex flex-wrap gap-3">
                        {[
                            { value: "light", label: "☀️ Light", desc: "Always use light theme" },
                            { value: "dark", label: "🌙 Dark", desc: "Always use dark theme" },
                            { value: "system", label: "💻 System", desc: "Follow OS preference" },
                        ].map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setTheme(option.value)}
                                className={`flex-1 min-w-[140px] p-4 rounded-xl border-2 transition-all
                  ${theme === option.value
                                        ? "border-blue-500 bg-blue-500/10"
                                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                    }`}
                            >
                                <div className="text-2xl mb-2">{option.label.split(" ")[0]}</div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {option.label.split(" ").slice(1).join(" ")}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {option.desc}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ---- About Section ---- */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    About CodeSensei
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Version 0.1.0 — Built for CS students to generate reports, understand codebases,
                    visualize algorithms, and prepare for vivas. Made with ❤️ using Next.js, React,
                    MongoDB, and Tailwind CSS.
                </p>
            </div>
        </div>
    );
}
