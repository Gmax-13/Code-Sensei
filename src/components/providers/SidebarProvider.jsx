/**
 * Sidebar Context
 * ----------------
 * Provides global sidebar state (collapsed/expanded) with localStorage persistence.
 * Used by Sidebar, DashboardLayout, and any component needing sidebar state.
 */

"use client";

import { createContext, useContext, useSyncExternalStore, useCallback, useState } from "react";

const SidebarContext = createContext(null);

const STORAGE_KEY = "codesensei-sidebar-collapsed";

/** Custom hook to read sidebar state from localStorage with SSR support */
function useSidebarStorage() {
    const getSnapshot = () => {
        if (typeof window === "undefined") return "false";
        return localStorage.getItem(STORAGE_KEY) ?? "false";
    };

    const getServerSnapshot = () => "false";

    const subscribe = (callback) => {
        const handleStorage = (e) => {
            if (e.key === STORAGE_KEY) callback();
        };
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    };

    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function SidebarProvider({ children }) {
    const stored = useSidebarStorage();
    const [isCollapsed, setIsCollapsed] = useState(stored === "true");
    const [isMobileOpen, setIsMobileOpen] = useState(false);

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
        mounted: true,
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
