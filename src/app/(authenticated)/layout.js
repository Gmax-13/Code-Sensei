/**
 * Dashboard Layout
 * ------------------
 * Shared layout for all authenticated pages inside /dashboard, /report, etc.
 * Wraps content with the DashboardLayout (Sidebar + Topbar).
 * Also checks authentication — redirects to "/" if not logged in.
 */

"use client";

import { useUser } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function AuthenticatedLayout({ children }) {
    const { user, isLoading, isError } = useUser();
    const router = useRouter();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isLoading && (isError || !user)) {
            router.push("/");
        }
    }, [user, isLoading, isError, router]);

    // Show loading skeleton while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-pulse text-xl text-gray-500">Loading...</div>
            </div>
        );
    }

    // Don't render content if not authenticated
    if (!user) return null;

    return <DashboardLayout>{children}</DashboardLayout>;
}
