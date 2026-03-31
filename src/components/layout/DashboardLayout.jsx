/**
 * Dashboard Layout
 * -----------------
 * Wraps authenticated pages with the Sidebar + Topbar layout.
 * Used as a shared layout for /dashboard, /report, /visualizer, etc.
 */

"use client";

import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function DashboardLayout({ children }) {
    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar on the left */}
            <Sidebar />

            {/* Main content area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top navigation bar */}
                <Topbar />

                {/* Page content with scroll */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
