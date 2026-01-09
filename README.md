# GitHub Wrap

GitHub Wrap is a full-stack application that generates a **GitHub “Wrapped” style summary** for users by analyzing their GitHub activity. It fetches data from the GitHub API, processes meaningful insights, and presents them in a clean, interactive UI.

---

## Features

- Fetches GitHub user data using GitHub APIs  
- Generates contribution and repository insights  
- Clean and responsive frontend interface  
- Modular backend for easy feature expansion  
- Suitable for year-in-review or profile analytics  

---

## Tech Stack

### Frontend
- React
- Vite
- TypeScript
- CSS

### Backend
- Node.js
- TypeScript
- Express
- MongoDB

### Other
- GitHub REST API
- Vercel

---

## Project Architecture

```
Frontend (React + Vite)
        |
        v
Backend (Node.js + TypeScript)
        |
        v
 GitHub API & MongoDB
```

---

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or cloud)
- GitHub Personal Access Token

---

## Installation

### Clone the Repository

```
git clone https://github.com/Yashh-Bajaj/github-wrap.git
cd github-wrap
```

---

### Backend Setup

```
cd backend
npm install
```

Create a `.env` file inside `backend`:

```
GITHUB_TOKEN=your_github_token
MONGODB_URI=your_mongodb_connection_string
PORT=5000
```

Run the backend:

```
npm run dev
```

---

### Frontend Setup

```
cd frontend
npm install
npm run dev
```

Frontend will start on a Vite development server (usually http://localhost:5173).

---

## Usage

1. Open the frontend in your browser  
2. Enter a GitHub username  
3. View the generated GitHub Wrapped summary  

---

## Folder Structure

```
github-wrap/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   └── config/
│   └── server.ts
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── styles/
├── README.md
└── .gitignore
```

---

## Contributing

Contributions are welcome.

1. Fork the repository  
2. Create a new branch  
3. Commit your changes  
4. Push the branch  
5. Open a Pull Request  

---

## License

This project is licensed under the **MIT License**.

---

## Author

**Yash Bajaj**  
GitHub: https://github.com/Yashh-Bajaj
