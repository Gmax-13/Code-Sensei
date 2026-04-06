/**
 * Sidebar Component
 * ------------------
 * Collapsible navigation sidebar with links to all app pages.
 * Features:
 *   - Collapsible (expanded ↔ icon-only) with smooth animations
 *   - Mobile responsive (slide-in drawer with overlay)
 *   - Persistent state via localStorage
 *   - Smooth CSS transitions
 *   - Accessible with keyboard navigation
 */

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useLogout } from "@/hooks/useAuth";
import { useSidebar } from "@/components/providers/SidebarProvider";

/** Navigation items with labels, paths, and Lucide-style icon components */
const NAV_ITEMS = [
    {
        label: "Dashboard",
        path: "/dashboard",
        icon: ({ className }) => (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" />
            </svg>
        ),
    },
    {
        label: "Report",
        path: "/report",
        icon: ({ className }) => (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
            </svg>
        ),
    },
    {
        label: "Visualizer",
        path: "/visualizer",
        icon: ({ className }) => (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
        ),
    },
    {
        label: "Architecture",
        path: "/architecture",
        icon: ({ className }) => (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 12 22 17" /><polyline points="2 12 12 17 22 12" />
            </svg>
        ),
    },
    {
        label: "Converter",
        path: "/converter",
        icon: ({ className }) => (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
        ),
    },
    {
        label: "Viva Mode",
        path: "/viva",
        icon: ({ className }) => (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                <line x1="12" y1="6" x2="12" y2="10" /><line x1="12" y1="14" x2="12.01" y2="14" />
            </svg>
        ),
    },
    {
        label: "Settings",
        path: "/settings",
        icon: ({ className }) => (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
        ),
    },
];

/** Collapse toggle button icon (chevron) */
function CollapseIcon({ isCollapsed, className }) {
    return (
        <svg
            className={`${className} transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="15 18 9 12 15 6" />
        </svg>
    );
}

/** Logo icon component */
function LogoIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
        </svg>
    );
}

/** Logout icon component */
function LogoutIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    );
}

export default function Sidebar() {
    const pathname = usePathname();
    const logout = useLogout();
    const { isCollapsed, isMobileOpen, toggleCollapse, closeMobile, mounted } = useSidebar();

    const handleLogout = async () => {
        await logout.mutateAsync();
        window.location.href = "/";
    };

    // Don't render until mounted to prevent hydration mismatch
    if (!mounted) {
        return (
            <aside className="fixed top-0 left-0 h-full w-64 bg-gray-900 dark:bg-gray-950 z-40 hidden md:flex flex-col" />
        );
    }

    return (
        <>
            {/* ---- Mobile hamburger toggle ---- */}
            <button
                onClick={() => closeMobile()}
                className={`fixed top-4 left-4 z-50 md:hidden p-2.5 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 ${isMobileOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}
                aria-label="Open menu"
                aria-expanded={isMobileOpen}
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
            </button>

            {/* ---- Sidebar panel ---- */}
            <aside
                className={`
                    fixed top-0 left-0 h-full bg-gray-900 dark:bg-gray-950 
                    flex flex-col z-40 transition-all duration-300 ease-in-out
                    border-r border-gray-800 dark:border-gray-800
                    ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0 md:static md:z-auto
                    ${isCollapsed ? "md:w-20" : "w-64 md:w-64"}
                `}
            >
                {/* ---- Branding section ---- */}
                <div className={`flex items-center border-b border-gray-800 dark:border-gray-800 ${isCollapsed ? "md:justify-center md:p-4 md:h-16" : "p-5 h-16"}`}>
                    <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? "md:w-8" : "w-auto"} transition-all duration-300`}>
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <LogoIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className={`flex flex-col overflow-hidden transition-all duration-300 ${isCollapsed ? "md:w-0 md:opacity-0" : "w-auto opacity-100"}`}>
                            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent whitespace-nowrap">
                                CodeSensei
                            </h1>
                        </div>
                    </div>
                </div>

                {/* ---- Collapse toggle (desktop only) ---- */}
                <button
                    onClick={toggleCollapse}
                    className={`hidden md:flex items-center justify-center w-full py-2 border-b border-gray-800 dark:border-gray-800 text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 transition-colors ${isCollapsed ? "md:px-0" : "px-4"}`}
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <CollapseIcon isCollapsed={isCollapsed} className={`w-4 h-4 transition-all duration-300 ${isCollapsed ? "" : "mr-2"}`} />
                    <span className={`text-xs text-gray-500 overflow-hidden transition-all duration-300 ${isCollapsed ? "md:w-0 md:opacity-0" : "w-auto opacity-100"}`}>
                        Collapse
                    </span>
                </button>

                {/* ---- Navigation links ---- */}
                <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                onClick={() => closeMobile()}
                                className={`
                                    flex items-center mx-2 my-1 rounded-lg transition-all duration-200 group
                                    ${isCollapsed ? "md:justify-center md:px-0 md:py-3 md:mx-2" : "px-3 py-2.5"}
                                    ${isActive
                                        ? "bg-blue-600/15 text-blue-400 border-l-2 border-blue-500 md:border-l-0 md:border-r-2"
                                        : "text-gray-400 hover:bg-gray-800/60 hover:text-gray-200"
                                    }
                                `}
                                title={isCollapsed ? item.label : undefined}
                            >
                                <Icon className={`flex-shrink-0 transition-colors duration-200 ${isActive ? "text-blue-400" : "text-gray-500 group-hover:text-gray-300"} ${isCollapsed ? "md:w-6 md:h-6" : "w-5 h-5"}`} />
                                <span className={`ml-3 text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? "md:w-0 md:opacity-0 md:ml-0" : "w-auto opacity-100"}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* ---- Logout button ---- */}
                <div className={`border-t border-gray-800 dark:border-gray-800 ${isCollapsed ? "md:p-2" : "p-3"}`}>
                    <button
                        onClick={handleLogout}
                        disabled={logout.isPending}
                        className={`
                            flex items-center w-full rounded-lg transition-all duration-200
                            text-gray-400 hover:bg-red-500/10 hover:text-red-400
                            disabled:opacity-50 disabled:cursor-not-allowed
                            ${isCollapsed ? "md:justify-center md:p-2.5 md:mx-1" : "px-3 py-2.5 gap-3"}
                        `}
                        title={isCollapsed ? "Logout" : undefined}
                    >
                        <LogoutIcon className={`flex-shrink-0 w-5 h-5 ${logout.isPending && "animate-pulse"}`} />
                        <span className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? "md:w-0 md:opacity-0" : "w-auto opacity-100"}`}>
                            {logout.isPending ? "Logging out..." : "Logout"}
                        </span>
                    </button>
                </div>
            </aside>

            {/* ---- Mobile overlay backdrop ---- */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
                    onClick={() => closeMobile()}
                    aria-hidden="true"
                />
            )}
        </>
    );
}

