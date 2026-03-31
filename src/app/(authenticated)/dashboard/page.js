/**
 * Dashboard Page
 * ---------------
 * Main overview page showing feature cards and quick stats.
 * Serves as the hub for navigating to all features.
 */

"use client";

import Link from "next/link";
import { useUser } from "@/hooks/useAuth";

/** Feature cards displayed on the dashboard */
const FEATURES = [
    {
        title: "Report Generator",
        description: "Generate structured practical reports from your code with Aim, Theory, Procedure, Code, Result, and Conclusion.",
        icon: "📝",
        href: "/report",
        color: "from-blue-500 to-blue-700",
    },
    {
        title: "DSA Visualizer",
        description: "Step-by-step visualization of sorting algorithms (Bubble, Merge) and data structures (Stack, Queue).",
        icon: "🔬",
        href: "/visualizer",
        color: "from-purple-500 to-purple-700",
    },
    {
        title: "Architecture Viewer",
        description: "Paste your code and get auto-generated class diagrams, flowcharts, and dependency graphs.",
        icon: "🏗️",
        href: "/architecture",
        color: "from-emerald-500 to-emerald-700",
    },
    {
        title: "Settings",
        description: "Manage your profile, customize preferences, and configure your CodeSensei experience.",
        icon: "⚙️",
        href: "/settings",
        color: "from-orange-500 to-orange-700",
    },
];

export default function DashboardPage() {
    const { user } = useUser();

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* ---- Welcome Header ---- */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                <h1 className="text-3xl font-bold">
                    Welcome back{user?.name ? `, ${user.name}` : ""} 👋
                </h1>
                <p className="mt-2 text-blue-100 max-w-xl">
                    Your all-in-one platform for CS mastery. Generate reports, visualize
                    algorithms, and analyze architecture — all in one place.
                </p>
            </div>

            {/* ---- Quick Stats ---- */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Available Tools</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">4</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Algorithms</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">4</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 capitalize">
                        {user?.role || "User"}
                    </p>
                </div>
            </div>

            {/* ---- Feature Cards Grid ---- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {FEATURES.map((feature) => (
                    <Link key={feature.href} href={feature.href}>
                        <div
                            className="group bg-white dark:bg-gray-800 rounded-xl border 
                          border-gray-200 dark:border-gray-700 p-6
                          hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600
                          transition-all duration-300 cursor-pointer h-full"
                        >
                            <div className="flex items-start gap-4">
                                {/* Icon with gradient background */}
                                <div
                                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color}
                              flex items-center justify-center text-2xl
                              group-hover:scale-110 transition-transform duration-200`}
                                >
                                    {feature.icon}
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {feature.description}
                                    </p>
                                </div>

                                {/* Arrow indicator */}
                                <span className="text-gray-400 group-hover:text-blue-500 transition-colors text-xl">
                                    →
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
