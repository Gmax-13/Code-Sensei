/**
 * TanStack Query Provider
 * ------------------------
 * Wraps the application with QueryClientProvider for
 * React Query data fetching, caching, and state management.
 */

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function QueryProvider({ children }) {
    // Create a new QueryClient per component instance
    // to prevent shared state between requests in SSR
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,      // 1 minute before refetch
                        retry: 1,                   // Retry once on failure
                        refetchOnWindowFocus: false, // Don't refetch on tab focus
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
