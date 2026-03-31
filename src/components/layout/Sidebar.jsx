/**
 * Sidebar Component
 * ------------------
 * Main navigation sidebar with links to all app pages.
 * Includes branding, nav links, and logout button.
 * Responsive: collapses on mobile with a toggle.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLogout } from "@/hooks/useAuth";

/** Navigation items with labels, paths, and emoji icons */
const NAV_ITEMS = [
    { label: "Dashboard", path: "/dashboard", icon: "📊" },
    { label: "Report", path: "/report", icon: "📝" },
    { label: "Visualizer", path: "/visualizer", icon: "🔬" },
    { label: "Architecture", path: "/architecture", icon: "🏗️" },
    { label: "Settings", path: "/settings", icon: "⚙️" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const logout = useLogout();
    const [mobileOpen, setMobileOpen] = useState(false);

    /** Handle logout and redirect to login page */
    const handleLogout = async () => {
        await logout.mutateAsync();
        window.location.href = "/";
    };

    return (
        <>
            {/* Mobile hamburger toggle */}
            <button
                className="fixed top-4 left-4 z-50 md:hidden bg-gray-800 text-white p-2 rounded-lg"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
            >
                {mobileOpen ? "✕" : "☰"}
            </button>

            {/* Sidebar panel */}
            <aside
                className={`
          fixed top-0 left-0 h-full w-64 bg-gray-900 text-white
          flex flex-col z-40 transition-transform duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:z-auto
        `}
            >
                {/* ---- Branding ---- */}
                <div className="p-6 border-b border-gray-700">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        CodeSensei
                    </h1>
                    <p className="text-xs text-gray-400 mt-1">Your CS Companion</p>
                </div>

                {/* ---- Navigation links ---- */}
                <nav className="flex-1 py-4 overflow-y-auto">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                onClick={() => setMobileOpen(false)}
                                className={`
                  flex items-center gap-3 px-6 py-3 text-sm
                  transition-colors duration-200
                  ${isActive
                                        ? "bg-blue-600/20 text-blue-400 border-r-2 border-blue-400"
                                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                                    }
                `}
                            >
                                <span className="text-lg">{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* ---- Logout button ---- */}
                <div className="p-4 border-t border-gray-700">
                    <button
                        onClick={handleLogout}
                        disabled={logout.isPending}
                        className="w-full px-4 py-2 text-sm text-gray-300 
                       hover:bg-red-600/20 hover:text-red-400
                       rounded-lg transition-colors duration-200"
                    >
                        {logout.isPending ? "Logging out..." : "🚪 Logout"}
                    </button>
                </div>
            </aside>

            {/* Mobile overlay backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}
        </>
    );
}
