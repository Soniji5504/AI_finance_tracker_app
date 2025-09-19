# AI Finance Tracker App

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge\&logo=nextdotjs\&logoColor=white)](https://nextjs.org)
[![Postgres](https://img.shields.io/badge/Postgres-31648A?style=for-the-badge\&logo=postgresql\&logoColor=white)](https://www.postgresql.org)
[![Inngest](https://img.shields.io/badge/Inngest-111827?style=for-the-badge)](https://www.inngest.com)
[![Resend](https://img.shields.io/badge/Resend-email?style=for-the-badge)](https://resend.com)
[![Tailwind](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge\&logo=tailwindcss\&logoColor=white)](https://tailwindcss.com)
[![Gemini](https://img.shields.io/badge/OpenAI-A100FF?style=for-the-badge\&logo=openai\&logoColor=white)](https://openai.com)
[![Google](https://img.shields.io/badge/Google-4285F4?style=for-the-badge\&logo=google\&logoColor=white)](https://developers.google.com)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge\&logo=vercel\&logoColor=white)](https://vercel.com)

---

# Overview

**AI Finance Tracker App** is a modern, full-stack personal finance application that helps users record, categorize and analyze income & expenses. It combines a clean Next.js UI with background processing and AI-powered receipt scanning to make bookkeeping fast and (almost) automatic.

This README is written for a public repository and is tailored to a setup that uses **PostgreSQL directly (no Prisma)**. Replace all placeholders and secrets with your real values before deploying.

---

# Table of Contents

* [Key Features](#key-features)
* [Tech Stack](#tech-stack)
* [Architecture (high level)](#architecture-high-level)
* [Quick start (local)](#quick-start-local)
* [Environment variables](#environment-variables)
* [Postgres setup (no Prisma)](#postgres-setup-no-prisma)
* [Background jobs (Inngest)](#background-jobs-inngest)
* [Receipt OCR & AI](#receipt-ocr--ai)
* [Email (Resend) setup](#email-resend-setup)
* [Running & debugging](#running--debugging)
* [Production deployment notes](#production-deployment-notes)
* [Security & best practices](#security--best-practices)
* [Contributing](#contributing)
* [Roadmap / Future work](#roadmap--future-work)
* [License](#license)
* [Contact](#contact)

---

# Key Features

* User registration and login (email & Google OAuth / click-to-signup flow)
* Add, edit and categorize transactions (income & expenses)
* Upload receipts; AI/OCR extracts merchant, date, amount and suggests categories
* Background processing of heavy tasks (receipt parsing, analytics, reminders) using **Inngest**
* Scheduled reminders (cron-like) that send transactional emails using **Resend**
* Dashboard showing summaries, trends and category breakdowns
* PostgreSQL database for reliable storage (direct SQL / migrations via SQL files)

---

# Tech Stack

* Next.js (App Router) — frontend & server functions
* PostgreSQL — primary relational database (no Prisma)
* Inngest — background job orchestration
* Resend — transactional emails
* Gemini (or other NLP) + OCR provider — receipt understanding & parsing
* Tailwind CSS — UI styling
* Vercel (recommended) — hosting for Next.js app

---

# Architecture (high level)

1. **Client (Next.js)** — UI, forms, receipt uploads, user dashboard.
2. **Server (Next.js API routes / server functions)** — authentication, API endpoints, short-running server logic.
3. **Database (Postgres)** — users, transactions, receipts, job metadata.
4. **Background workers (Inngest)** — receipt OCR, scheduled reminders, batch analytics.
5. **Email (Resend)** — transactional template sending.
6. **AI/OCR** — external APIs for parsing and extracting data from receipt images.

---

# Quick start (local)

> These commands assume you have Node.js and PostgreSQL installed locally.

1. Clone the repo:

```bash
git clone https://github.com/Soniji5504/AI_finance_tracker_app.git
cd AI_finance_tracker_app
```

2. Install dependencies:

```bash
npm install
# or
# yarn install
```

3. Create a `.env` from the example:

```bash
cp .env.example .env
```

4. Configure your Postgres database (see next section).

5. Run SQL migrations (if SQL migration files exist):

```bash
# Example using psql and an SQL file in `db/migrations/init.sql`
psql $DATABASE_URL -f db/migrations/init.sql
```

If the repo includes a `scripts` folder for migrations/seeds, run those instead (e.g. `node scripts/seed.js`).

6. Start the development server:

```bash
npm run dev
# open http://localhost:3000
```

7. (Optional) Start background worker locally (Inngest worker):

```bash
# depends on how worker is implemented; example:
npm run worker
```

---

# Environment variables

Create a `.env` file at the project root and fill the values. Example `.env.example` content to include in repo:

```env
# Database
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE

# Auth / Google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
JWT_SECRET=

# Inngest
INNGEST_CLIENT_KEY=
INNGEST_WEBHOOK_URL=

# Email (Resend)
RESEND_API_KEY=
EMAIL_FROM=your@domain.com

# AI / OCR
OPENAI_API_KEY=
OCR_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

> Keep `.env` out of source control. Add `.env` to `.gitignore`.

---

# Postgres setup (no Prisma)

If you are managing Postgres directly (no ORM migrations), here are recommended steps:

1. Create the database (example using psql):

```bash
# create DB
createdb finance_tracker_db

# or using psql
psql -c "CREATE DATABASE finance_tracker_db;"
```

2. Run initialization SQL (schema & tables). Create `db/migrations/init.sql` in the repo (if not present) and run:

```sql
-- Example schema (minimal)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  password_hash VARCHAR(255),
  google_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL, -- 'income' | 'expense'
  amount NUMERIC(12,2) NOT NULL,
  category VARCHAR(100),
  notes TEXT,
  receipt_url TEXT,
  parsed_json JSONB,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
```

Run this SQL with `psql`:

```bash
psql $DATABASE_URL -f db/migrations/init.sql
```

3. (Optional) Seed the database with sample data with a script (e.g. `scripts/seed.js`) or SQL file `db/migrations/seed.sql`.

4. Use a DB GUI (pgAdmin / TablePlus / DBeaver) or `psql` to inspect tables.

---

# Background jobs (Inngest)

* Inngest handles background tasks like receipt OCR, email reminders, and periodic analytics.
* Typical flow:

  * App enqueues an event (e.g., `receipt.uploaded`) to Inngest.
  * Inngest triggers a worker function that downloads the receipt image, calls the OCR provider, parses the result, and writes the parsed data into the DB.
* Locally, start the worker using the command the repo provides (e.g. `npm run worker`). Ensure `INNGEST_CLIENT_KEY` or webhook URL is configured in `.env`.

---

# Receipt OCR & AI

* Strategy used by the repo: upload image → background worker calls OCR provider (or OpenAI + OCR) → receives text → NLP model extracts merchant/date/amount/line items → store parsed JSON in `transactions.parsed_json`
* You can swap OCR providers freely (Tesseract, Google Vision OCR, OCR.space, etc.) depending on accuracy and price.
* For improved parsing, send OCR text to an LLM (OpenAI) to extract structured fields using a deterministic prompt+schema approach.

---

# Email (Resend) setup

* Resend is used for transactional emails (welcome, reminders, weekly digest).
* Add `RESEND_API_KEY` and `EMAIL_FROM` to `.env`.
* Use templates stored under `/emails` and send them via Resend SDK or HTTP API from server or worker code.

---

# Running & debugging

* Dev server: `npm run dev`
* Worker: `npm run worker` (if implemented)
* Lint: `npm run lint`
* Build: `npm run build` then `npm start` for production

Logs: check console output from Next.js and your worker process. For DB issues, connect via `psql` or GUI.

---

# Production deployment notes

* Host Next.js on Vercel (recommended) or any Node host. Configure environment variables in the host dashboard.
* Workers & Inngest functions can run on a separate host (Railway, Fly, Render, EC2) or serverless environment supported by Inngest.
* Use managed Postgres (Supabase, Neon, Heroku Postgres, AWS RDS) for production DB.
* Ensure email domain is verified with Resend or your SMTP provider.
* Use HTTPS everywhere and configure CORS and secure cookies for auth.

---

# Security & best practices

* Never commit secrets. Use `.env` or secret manager offered by your host.
* Use parameterized queries or prepared statements to avoid SQL injection.
* Hash passwords with a strong algorithm (bcrypt / argon2) if storing them.
* Validate & sanitize user-uploaded files (size, type). Scan for malware if necessary.
* Rate-limit public endpoints (auth, upload) to avoid abuse.

---

# Contributing

Thanks for considering contributing! Please follow these steps:

1. Fork the repo
2. Create a branch: `git checkout -b feat/your-feature`
3. Make changes & add tests where appropriate
4. Commit with meaningful messages
5. Open a Pull Request

Please follow the existing code style and keep PRs small & focused.

---

# Roadmap / Ideas

* Improve OCR accuracy & add multi-language support
* Budget forecasting (AI-powered)
* Multi-user household / shared accounts
* CSV/XLS export & PDF reports
* Native mobile app or PWA

---

# License

This project is open-source. Choose a license (MIT is recommended for maximum permissiveness). Example: `MIT`.

---

# Contact

* Repo: [https://github.com/Soniji5504/AI\_finance\_tracker\_app](https://github.com/Soniji5504/AI_finance_tracker_app)
* Author: Dhruv Soni 

---

> *Replace placeholder values and example SQL with your actual schema & scripts before publishing.*
