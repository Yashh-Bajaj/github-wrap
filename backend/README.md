# GitHub Wrapped Backend

A backend service for generating GitHub user insights and statistics, similar to Spotify Wrapped for GitHub.

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.ts                # MongoDB connection
│   │   └── github.ts            # GitHub GraphQL client
│   │
│   ├── models/
│   │   └── WrappedResult.ts     # MongoDB schema
│   │
│   ├── services/
│   │   ├── github.service.ts    # GitHub GraphQL fetch logic
│   │   └── wrapped.service.ts   # Insight computation logic
│   │
│   ├── routes/
│   │   └── wrapped.routes.ts    # API routes
│   │
│   ├── controllers/
│   │   └── wrapped.controller.ts # Request handling
│   │
│   ├── utils/
│   │   ├── date.ts              # Year/month helpers
│   │   └── math.ts              # Aggregation helpers
│   │
│   ├── app.ts                   # Express app config
│   └── server.ts                # Server bootstrap
│
├── .env                         # Environment variables
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies
└── README.md                   # This file
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- GitHub Personal Access Token

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file with the following variables:
   ```
   MONGODB_URI=mongodb://localhost:27017/github-wrap
   GITHUB_TOKEN=your_github_token
   PORT=5000
   NODE_ENV=development
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Start the server:
   ```bash
   npm start
   ```

## Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Compile TypeScript
- `npm start` - Run compiled JavaScript
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## API Endpoints

### Generate Wrapped Stats
- **POST** `/api/wrapped/:username`
- Generate GitHub wrapped stats for a user
- Query params: `year` (optional, defaults to previous year)

### Get Wrapped Stats
- **GET** `/api/wrapped/:userId`
- Retrieve previously generated wrapped stats
- Query params: `year` (optional)

## Features

- Fetch GitHub user data via GraphQL API
- Calculate language distribution
- Analyze contribution patterns
- Track repository statistics
- Store results in MongoDB

## Technologies

- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **API Client**: graphql-request
- **Validation**: express-validator (recommended)

## Future Enhancements

- [ ] Caching layer for frequently requested users
- [ ] More detailed contribution analytics
- [ ] Visualization generation
- [ ] Email delivery of wrapped reports
- [ ] Social sharing features
