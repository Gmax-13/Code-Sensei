# CodeSensei Architecture

## System Overview

CodeSensei is built as a **Next.js 16** monolithic full-stack application using the App Router.
The backend runs as serverless API route handlers, and the frontend is a React SPA with server-side rendering support.

## Architecture Diagram

```
┌───────────────────────────────────────────────────┐
│                     CLIENT                        │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐   │
│  │ React    │  │ TanStack │  │   next-themes  │   │
│  │ Pages    │──│ Query    │  │   (dark/light) │   │
│  └──────────┘  └────┬─────┘  └───────────────┘   │
│                     │ HTTP (axios)                 │
├─────────────────────┼─────────────────────────────┤
│                     │                              │
│              NEXT.JS API ROUTES                    │
│  ┌──────────┐  ┌────┴─────┐  ┌───────────────┐   │
│  │ Auth     │  │ Feature  │  │  Middleware    │   │
│  │ Routes   │  │ Routes   │  │  (JWT verify)  │   │
│  └────┬─────┘  └────┬─────┘  └───────────────┘   │
│       │              │                             │
│  ┌────┴──────────────┴─────┐                       │
│  │     SERVICE LAYER       │                       │
│  │  ┌─────────────────┐   │                       │
│  │  │ reportService   │   │                       │
│  │  │ codebaseService │   │                       │
│  │  │ diagramService  │   │                       │
│  │  │ dsaService      │   │                       │
│  │  └─────────────────┘   │                       │
│  └─────────────────────────┘                       │
│                                                    │
│  ┌─────────────────────────┐                       │
│  │   MongoDB (Mongoose)    │                       │
│  │   User model            │                       │
│  └─────────────────────────┘                       │
└────────────────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── app/                        # Next.js App Router
│   ├── layout.js               # Root layout (providers)
│   ├── page.js                 # Login/Register page
│   ├── globals.css             # Global styles
│   ├── (authenticated)/        # Route group (protected)
│   │   ├── layout.js           # Auth guard layout
│   │   ├── dashboard/page.js
│   │   ├── report/page.js
│   │   ├── visualizer/page.js
│   │   ├── architecture/page.js
│   │   └── settings/page.js
│   └── api/                    # Backend API routes
│       ├── auth/register/route.js
│       ├── auth/login/route.js
│       ├── auth/logout/route.js
│       ├── user/me/route.js
│       ├── report/generate/route.js
│       ├── analyze/codebase/route.js
│       ├── diagram/generate/route.js
│       └── dsa/execute/route.js
├── components/
│   ├── layout/                 # Layout components
│   │   ├── Sidebar.jsx
│   │   ├── Topbar.jsx
│   │   ├── ThemeToggle.jsx
│   │   └── DashboardLayout.jsx
│   └── providers/              # React context providers
│       ├── QueryProvider.jsx
│       └── ThemeProvider.jsx
├── hooks/                      # Custom React hooks
│   ├── useAuth.js
│   └── useApi.js
├── lib/                        # Utilities and config
│   ├── dbConnect.js
│   ├── auth.js
│   ├── validations.js
│   ├── apiResponse.js
│   └── middleware.js
├── models/                     # Mongoose models
│   └── User.js
└── services/                   # Business logic
    ├── reportService.js
    ├── codebaseService.js
    ├── diagramService.js
    └── dsaService.js
```

## Data Flow

1. **Auth Flow**: User → Login Page → POST /api/auth/login → JWT issued as HTTP-only cookie → Redirected to Dashboard
2. **Feature Flow**: User → Feature Page → Hook (TanStack Query) → POST /api/[feature] → Middleware verifies JWT → Service processes request → JSON response → UI updates
3. **Diagram Flow**: Code input → diagramService parses structure → Generates Mermaid syntax → Client-side Mermaid.js renders SVG
