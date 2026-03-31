# Contributing to CodeSensei

Thank you for your interest in contributing! Here's how to get started.

## Getting Started

1. **Fork** the repository
2. **Clone** your fork:
   ```bash
   git clone https://github.com/<your-username>/Code-Sensei.git
   cd Code-Sensei
   ```
3. **Install dependencies**: `npm install`
4. **Set up environment**: Copy `.env.local` and configure MongoDB
5. **Start developing**: `npm run dev`

## Project Structure

```
src/
├── app/            → Pages and API routes (Next.js App Router)
├── components/     → Reusable React components
├── hooks/          → Custom React hooks
├── lib/            → Utilities (DB, auth, validation, middleware)
├── models/         → Mongoose models
└── services/       → Business logic services
```

## Development Guidelines

### Code Style
- **JavaScript** (ES modules) — no TypeScript
- Use **meaningful variable names** and **JSDoc comments**
- Keep functions small and focused (single responsibility)
- Use `const` over `let`; avoid `var`

### File Naming
- Components: `PascalCase.jsx` (e.g., `Sidebar.jsx`)
- Hooks: `camelCase.js` prefixed with `use` (e.g., `useAuth.js`)
- Services: `camelCase.js` suffixed with `Service` (e.g., `reportService.js`)
- API routes: `route.js` inside the appropriate folder

### Commit Messages
Follow conventional commits:
```
feat: add binary search visualization
fix: correct JWT cookie expiry calculation
docs: update API reference with new endpoint
style: improve sidebar hover states
```

### Adding a New Feature

1. **Service**: Create the business logic in `src/services/`
2. **API Route**: Add the endpoint in `src/app/api/`
3. **Hook**: Create a TanStack Query hook in `src/hooks/`
4. **Page**: Build the UI in `src/app/(authenticated)/`
5. **Docs**: Update `docs/api.md` with the new endpoint

### Adding a New DSA Algorithm

1. Add the algorithm function to `src/services/dsaService.js`
2. Return step-by-step state objects
3. Add a new `case` to the switch in `src/app/api/dsa/execute/route.js`
4. Add a visualization component in the visualizer page

## Pull Request Process

1. Create a feature branch: `git checkout -b feat/your-feature`
2. Make your changes
3. Ensure `npm run lint` passes
4. Ensure `npm run build` succeeds
5. Open a PR against `main` with a clear description

## Reporting Issues

Open a GitHub issue with:
- Steps to reproduce
- Expected vs actual behavior
- Browser/Node.js version
- Screenshots if applicable
