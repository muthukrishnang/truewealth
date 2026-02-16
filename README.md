# TrueWealth

Privacy-first net worth tracker. Track assets, tag them to goals, log expenses, and project growth with inflation.

Inspired by [FinBoom](https://www.finboom.app). Built with Next.js 14, NextAuth (Google), Prisma, and Tailwind.

## Features

- **Assets** – Stocks, mutual funds, real estate, gold, crypto, EPF, bonds, cash. Multi-currency (USD, EUR, GBP, INR, JPY).
- **Goals** – Create goals (retirement, emergency fund, etc.) and tag every asset to a goal. Track progress.
- **Expenses** – Log expenses by category (housing, food, transport, health, entertainment).
- **Net worth snapshots** – Freeze your portfolio at any time; view history on the dashboard.
- **Inflation calculator** – Real (inflation-adjusted) future value and “same purchasing power” projections.
- **Google sign-in** – One-click login with Gmail.
- **Privacy** – No broker or bank connections. Your data stays yours; export or delete anytime (you can add export/delete later).

## Quick start

1. **Clone and install**

   ```bash
   cd truewealth
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env.local` and set:

   - `DATABASE_URL` – PostgreSQL (e.g. local via Docker: `postgresql://postgres:postgres@localhost:5432/truewealth`)
   - `NEXTAUTH_URL="http://localhost:3000"`
   - `NEXTAUTH_SECRET` – run `openssl rand -base64 32`
   - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from [Google Cloud Console](https://console.cloud.google.com/) (OAuth 2.0 Web client, redirect URI `http://localhost:3000/api/auth/callback/google`)

3. **Database**

   ```bash
   docker compose up -d
   npx prisma generate
   npx prisma migrate deploy
   ```
   (Without Docker, use any PostgreSQL URL in `DATABASE_URL`.)

4. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000), sign in with Google, and use the dashboard.

## Deploy on Azure

- **End-to-end pipeline:** **[docs/PIPELINE.md](docs/PIPELINE.md)** – GitHub Actions build → run DB migrations → deploy to Azure App Service. Configure `AZURE_WEBAPP_PUBLISH_PROFILE` and `DATABASE_URL` secrets.
- **Full deployment guide:** **[DEPLOYMENT.md](./DEPLOYMENT.md)** – Azure App Service + PostgreSQL setup, App settings, Google OAuth

## Tech stack

- **Next.js 14** (App Router)
- **NextAuth.js** (Google provider)
- **Prisma** (PostgreSQL)
- **Tailwind CSS**
- **Recharts** (dashboard chart)
- **Zod** (validation)

## Project structure

- `src/app` – Routes (landing, login, dashboard, assets, goals, expenses, inflation)
- `src/app/api` – API routes (assets, goals, expenses, snapshots, auth)
- `src/components` – Shared UI (forms, lists, nav, inflation calculator)
- `src/lib` – Auth, Prisma client, FX rates, inflation helpers
- `prisma/schema.prisma` – Data models

## License

MIT
