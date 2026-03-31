# CodeSensei

> Your all-in-one platform for CS mastery 🎓

CodeSensei is a full-stack web application built for computer science students to generate structured practical reports, visualize data structures and algorithms, analyze codebase architecture, and prepare for vivas.

## ✨ Features

- **📝 Report Generator** — Paste code and get a structured practical report with Aim, Theory, Procedure, Code, Result, and Conclusion
- **🔬 DSA Visualizer** — Step-by-step visualization of Bubble Sort, Merge Sort, Stack, and Queue operations
- **🏗️ Architecture Viewer** — Auto-generate Mermaid class diagrams, flowcharts, and dependency graphs from code
- **🔐 Secure Auth** — JWT-based authentication with HTTP-only cookies and bcrypt password hashing
- **🌙 Dark/Light Mode** — System-aware theme switching

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Next.js 16 (App Router) |
| Styling | Tailwind CSS 4 |
| Data Fetching | TanStack Query |
| Backend | Next.js API Routes |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Diagrams | Mermaid.js |
| Validation | Zod |

## 🚀 Quick Start

### Prerequisites
- Node.js v22+ and npm v10+
- MongoDB (local or [Atlas](https://www.mongodb.com/cloud/atlas))

### Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd Code-Sensei

# Install dependencies
npm install

# Create .env.local (see docs/setup.md for details)
# Required: MONGODB_URI, JWT_SECRET

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and create an account to get started.

## 📂 Project Structure

```
src/
├── app/              # Next.js pages & API routes
├── components/       # React components (layout, providers)
├── hooks/            # Custom React hooks (useAuth, useApi)
├── lib/              # Utilities (DB, JWT, validation, middleware)
├── models/           # Mongoose data models
└── services/         # Business logic layer
```

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/architecture.md) | System design and data flow |
| [API Reference](docs/api.md) | All endpoints with examples |
| [Setup Guide](docs/setup.md) | Installation and configuration |
| [Security](docs/security.md) | Auth, cookies, and validation |
| [Contributing](docs/contributing.md) | How to contribute |

## 🔑 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login | ❌ |
| POST | `/api/auth/logout` | Logout | ❌ |
| GET | `/api/user/me` | Get profile | ✅ |
| POST | `/api/report/generate` | Generate report | ✅ |
| POST | `/api/analyze/codebase` | Analyze files | ✅ |
| POST | `/api/diagram/generate` | Generate diagrams | ✅ |
| POST | `/api/dsa/execute` | Execute algorithm | ✅ |

## 📝 License

This project is for educational purposes. See the [Contributing Guide](docs/contributing.md) for details on how to participate.

---

Built with ❤️ for CS students
