/**
 * Home / Auth Page (Login + Register)
 * -------------------------------------
 * Landing page with a tabbed login/register form.
 * Redirects to /dashboard after successful authentication.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLogin, useRegister, useUser } from "@/hooks/useAuth";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const login = useLogin();
  const register = useRegister();

  // Tab state: "login" or "register"
  const [tab, setTab] = useState("login");

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  /** Handle form submission for both login and register */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (tab === "login") {
        await login.mutateAsync({ email, password });
      } else {
        await register.mutateAsync({ name, email, password });
      }
      router.push("/dashboard");
    } catch (err) {
      // Extract error message from API response
      const message =
        err.response?.data?.error || "Something went wrong. Please try again.";
      setError(message);
    }
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse text-xl text-gray-500">Loading...</div>
      </div>
    );
  }

  // Don't render if user is already logged in (will redirect)
  if (user) return null;

  const isPending = login.isPending || register.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 p-4">
      <div className="w-full max-w-md">
        {/* ---- Branding ---- */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            CodeSensei
          </h1>
          <p className="text-gray-400 mt-2">
            Your all-in-one platform for CS mastery
          </p>
        </div>

        {/* ---- Auth Card ---- */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
          {/* Tab switcher */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => { setTab("login"); setError(""); }}
              className={`flex-1 py-3 text-sm font-medium transition-colors
                ${tab === "login"
                  ? "text-blue-400 border-b-2 border-blue-400 bg-gray-800"
                  : "text-gray-400 hover:text-gray-300"
                }`}
            >
              Login
            </button>
            <button
              onClick={() => { setTab("register"); setError(""); }}
              className={`flex-1 py-3 text-sm font-medium transition-colors
                ${tab === "register"
                  ? "text-blue-400 border-b-2 border-blue-400 bg-gray-800"
                  : "text-gray-400 hover:text-gray-300"
                }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Error banner */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Name field (register only) */}
            {tab === "register" && (
              <div>
                <label className="block text-sm text-gray-300 mb-1" htmlFor="name">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 
                             rounded-lg text-white placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Email field */}
            <div>
              <label className="block text-sm text-gray-300 mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 
                           rounded-lg text-white placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Password field */}
            <div>
              <label className="block text-sm text-gray-300 mb-1" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Min. 6 characters"
                className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 
                           rounded-lg text-white placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white 
                         font-medium rounded-lg transition-colors duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending
                ? "Please wait..."
                : tab === "login"
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </form>
        </div>

        {/* Footer tagline */}
        <p className="text-center text-gray-500 text-xs mt-6">
          Built for CS students, by CS students 🎓
        </p>
      </div>
    </div>
  );
}
