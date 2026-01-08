# github-wrap

This repository contains a small service that generates GitHub "wrapped" style summaries.

Structure:
- backend: Node/TypeScript API that fetches GitHub data and computes insights.
- frontend: Vite + React UI to display results.

Quick start (macOS / Linux):

1. Backend

```bash
cd backend
npm install
npm run dev
```

2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Notes:
- Ensure you set any required environment variables for GitHub API access in `backend/.env` if needed.
- The backend stores generated results in MongoDB; configure connection in `backend/src/config/db.ts`.
