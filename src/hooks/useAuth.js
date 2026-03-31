/**
 * Authentication Hooks
 * ---------------------
 * Custom React hooks for authentication operations using TanStack Query.
 * Provides: useUser, useLogin, useRegister, useLogout
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

/**
 * Hook to fetch the current authenticated user.
 * Automatically caches and refetches as needed.
 *
 * @returns {{ user, isLoading, isError, error }}
 */
export function useUser() {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            const res = await axios.get("/api/user/me");
            return res.data.data.user;
        },
        retry: false, // Don't retry — user is either logged in or not
    });

    return {
        user: data || null,
        isLoading,
        isError,
        error,
    };
}

/**
 * Hook for user login mutation.
 * On success, invalidates the user query to refetch profile.
 *
 * @returns {UseMutationResult}
 */
export function useLogin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ email, password }) => {
            const res = await axios.post("/api/auth/login", { email, password });
            return res.data;
        },
        onSuccess: () => {
            // Refetch the user profile after successful login
            queryClient.invalidateQueries({ queryKey: ["user"] });
        },
    });
}

/**
 * Hook for user registration mutation.
 * On success, invalidates the user query (auto-login via cookie).
 *
 * @returns {UseMutationResult}
 */
export function useRegister() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ name, email, password }) => {
            const res = await axios.post("/api/auth/register", { name, email, password });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user"] });
        },
    });
}

/**
 * Hook for user logout mutation.
 * Clears the user cache on success.
 *
 * @returns {UseMutationResult}
 */
export function useLogout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const res = await axios.post("/api/auth/logout");
            return res.data;
        },
        onSuccess: () => {
            // Clear user data from cache
            queryClient.setQueryData(["user"], null);
            queryClient.invalidateQueries({ queryKey: ["user"] });
        },
    });
}
