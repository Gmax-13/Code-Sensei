/**
 * Sidebar Context
 * ----------------
 * Provides global sidebar state (collapsed/expanded) with localStorage persistence.
 * Used by Sidebar, DashboardLayout, and any component needing sidebar state.
 *
 * BUG FIX (hydration mismatch):
 * Previously, isCollapsed was initialized from localStorage during render via
 * `useState(stored === "true")`. On the server, `stored` is always "false",
 * but on the client it could be "true" from localStorage — causing a hydration
 * mismatch that leads to DOM reconciliation errors (removeChild failures).
 *
 * Fix: Initialize isCollapsed as `false` (matching SSR), then sync the real
 * value from localStorage in a useEffect that runs after hydration completes.
 * A `mounted` flag tracks when the client-side sync is done, allowing
 * dependent components (e.g., Sidebar) to delay rendering until state is stable.
 */

"use client";

import { createContext, useContext, useCallback, useState, useEffect } from "react";

const SidebarContext = createContext(null);

const STORAGE_KEY = "codesensei-sidebar-collapsed";

export function SidebarProvider({ children }) {
    // Always initialize as false to match server render (hydration safety)
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    // Track when client-side localStorage sync is complete
    const [mounted, setMounted] = useState(false);

    // Sync collapsed state from localStorage AFTER hydration
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === "true") {
            setIsCollapsed(true);
        }
        setMounted(true);
    }, []);

    // Persist state changes to localStorage
    const toggleCollapse = useCallback(() => {
        setIsCollapsed((prev) => {
            const next = !prev;
            localStorage.setItem(STORAGE_KEY, String(next));
            return next;
        });
    }, []);

    const toggleMobile = useCallback(() => {
        setIsMobileOpen((prev) => !prev);
    }, []);

    const closeMobile = useCallback(() => {
        setIsMobileOpen(false);
    }, []);

    const value = {
        isCollapsed,
        isMobileOpen,
        toggleCollapse,
        toggleMobile,
        closeMobile,
        mounted,
    };

    return (
        <SidebarContext.Provider value={value}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within SidebarProvider");
    }
    return context;
}
