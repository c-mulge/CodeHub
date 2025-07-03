# CodeHub

A GitHub-like platform where users can register, login, upload, and manage code repositories. Built with Next.js (React), TypeScript, and Tailwind CSS.

## Features (MVP)
- User registration & login
- User profile page
- Create repositories/projects
- Upload code files (with syntax highlighting)
- View/download code files
- Edit/delete code files

## Tech Stack
- **Frontend/Backend:** Next.js (React, API routes)
- **Database:** MongoDB (Mongoose) or PostgreSQL (Prisma)
- **Authentication:** NextAuth.js
- **UI:** Tailwind CSS

## Project Structure
```
CodeHub/
  ├── components/         # React components
  ├── pages/              # Next.js pages (routes)
  │   ├── api/            # API routes
  │   ├── _app.tsx        # App entry
  │   ├── index.tsx       # Home page
  │   ├── login.tsx       # Login page
  │   ├── register.tsx    # Register page
  │   └── dashboard.tsx   # User dashboard
  ├── lib/                # Utility functions (e.g., db connection)
  ├── models/             # Database models (User, Repo, File)
  ├── public/             # Static assets
  ├── styles/             # Tailwind/global styles
  ├── .env.local          # Environment variables
  ├── next.config.js      # Next.js config
  ├── tailwind.config.js  # Tailwind config
  ├── tsconfig.json       # TypeScript config
  └── package.json        # Dependencies
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
2. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

---

## To Do
- Scaffold initial files and folders
- Implement authentication
- Build repository and file upload features 