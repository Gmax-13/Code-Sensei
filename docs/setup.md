# CodeSensei Setup Guide

## Prerequisites

- **Node.js** v20.19+ or v22.13+ (recommended v22 LTS)
- **MongoDB** (local installation or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier)
- **npm** v10+

## Quick Start

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd Code-Sensei
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env.local` file in the project root (or copy from `.env.local.example`):

```env
# MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/codesensei

# JWT secret (change this for production!)
JWT_SECRET=codesensei-dev-secret-change-me-in-production

# JWT token expiry duration
JWT_EXPIRES_IN=7d

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Start MongoDB
**Local:** Make sure MongoDB is running on `localhost:27017`.

**Atlas:** Replace `MONGODB_URI` with your Atlas connection string:
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/codesensei
```

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Create an account
1. Go to http://localhost:3000
2. Click the **Register** tab
3. Enter your name, email, and password
4. You'll be redirected to the Dashboard

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Create production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint for code quality |

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "MONGODB_URI not defined" | Ensure `.env.local` exists and contains `MONGODB_URI` |
| Cannot connect to MongoDB | Check MongoDB is running; verify connection string |
| "Module not found" | Run `npm install` to install all dependencies |
| Port 3000 in use | Kill the process or use `npm run dev -- -p 3001` |
