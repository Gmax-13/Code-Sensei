/**
 * Root Layout
 * -------------
 * The top-level layout for the entire Next.js application.
 * Wraps all pages with the QueryProvider and ThemeProvider.
 * Sets HTML metadata and fonts.
 */

import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";
import { SidebarProvider } from "@/components/providers/SidebarProvider";

/** Metadata for SEO and browser tab */
export const metadata = {
  title: "CodeSensei — Your CS Companion",
  description:
    "Generate structured reports, visualize algorithms, analyze codebases, and prepare for vivas — all in one platform.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {/* Google Fonts — Inter for clean typography */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      {/*
        * suppressHydrationWarning: next-themes may modify body classes
        * during hydration (adding/removing "dark" class). Without this,
        * React detects a mismatch between server and client attributes,
        * which can cascade into removeChild errors during reconciliation.
        */}
      <body suppressHydrationWarning className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <ThemeProvider>
          <QueryProvider>
            <SidebarProvider>
              {children}
            </SidebarProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
