# MockNepal - Exam Preparation & Mock Test Platform

Comprehensive online exam preparation and mock test platform tailored for Lok Sewa Aayog, Banking, Teacher Service Commission, and other competitive examinations in Nepal.

## 🚀 Features

- **Dynamic Exam & Subject Catalog**: Lok Sewa, Banking, and Teacher Service exam categories with detailed syllabus breakdown.
- **Adaptive Practice Engine**: Topic-wise practice sessions with instant answer validation, detailed explanations, and question bookmarking.
- **Full-Length Timed Mock Tests**: Realistic exam environment with negative marking, timers, mark-for-review, and auto-submission.
- **Mistake Bank & Spaced Repetition**: Dedicated mistake revision system tracking incorrect questions with progressive mastery stages.
- **Study Notes & Syllabi**: Integrated study notes, downloadable PDFs, and verified syllabus versions.
- **Daily Study Streaks & XP System**: Gamified study targets, daily missions, and performance analytics.
- **Admin Dashboard**: Manage exams, syllabi, questions, notes, and bulk Excel import/export.

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS / Tailwind-like modular styling
- **Database ORM**: Prisma ORM
- **Database**: SQLite (Local development) / PostgreSQL (Recommended for production on Vercel)
- **Icons**: Lucide React
- **Excel Processing**: SheetJS (xlsx)

## 💻 Getting Started Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/20781a05g8raj-droid/MockNepal.git
   cd MockNepal
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Initialize Database**:
   ```bash
   npx prisma generate
   npm run db:push
   npm run db:seed
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Deploying on Vercel

1. Push this repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com) and import the `MockNepal` repository.
3. Framework Preset: **Next.js**.
4. Build Command: `npm run build` (runs `prisma generate && next build`).
5. For full production persistence (allowing users to register and submit tests), connect a serverless PostgreSQL database (such as **Neon**, **Supabase**, or **Vercel Postgres**) and update `prisma/schema.prisma` with `provider = "postgresql"` and `DATABASE_URL`.
