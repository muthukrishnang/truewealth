# End-to-end pipeline: GitHub → Azure App Service (with DB migrations)

This repo uses a single GitHub Actions workflow that **builds**, **runs production DB migrations**, and **deploys** to Azure App Service on every push to `main` (or on manual run).

## What the pipeline does

1. **Checkout** – Clone the repo.
2. **Install** – `npm ci`.
3. **Lint** – `npm run lint`.
4. **Prisma generate** – Generate the Prisma client.
5. **Build** – `npm run build` (Next.js).
6. **Run database migrations** – `npx prisma migrate deploy` against the **production** PostgreSQL using `DATABASE_URL` from GitHub secrets. This applies any new migrations before the new app version goes live.
7. **Package** – Zip `.next`, `node_modules`, `prisma`, `src`, config files, etc.
8. **Deploy** – Deploy the zip to Azure App Service using the publish profile.

So: **code push → lint → build → migrate DB → deploy**. DB changes are applied in CI; the app on Azure only needs the same `DATABASE_URL` in its Application settings.

## Required GitHub secrets

Add these in **GitHub repo → Settings → Secrets and variables → Actions**.

| Secret | Description |
|--------|-------------|
| `AZURE_WEBAPP_PUBLISH_PROFILE` | Azure App Service publish profile (XML). See below how to get it. |
| `DATABASE_URL` | Production PostgreSQL connection string (e.g. Azure Database for PostgreSQL). Must be set so the **Run database migrations** step can run `prisma migrate deploy`. |

Optional: if you use a different app name per environment, you can use a **GitHub variable** (e.g. `AZURE_WEBAPP_NAME`) or set it in the workflow `env` (default: `truewealth`).

## How to get the publish profile

1. Azure Portal → your **App Service** (Web App).
2. **Overview** or **Get publish profile**.
3. Download the **.PublishSettings** file (or copy the contents).
4. Copy the **entire XML** and paste it as the value of the `AZURE_WEBAPP_PUBLISH_PROFILE` secret in GitHub. (Do not commit this file; it contains credentials.)

## Setting `DATABASE_URL` in GitHub

- Use your **production** PostgreSQL URL (e.g. Azure Database for PostgreSQL).
- Example shape:  
  `postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require`
- This URL is used **only in CI** to run `prisma migrate deploy`. The same URL must be configured in **Azure App Service → Configuration → Application settings** as `DATABASE_URL` so the running app can connect to the same database.

## Setting the app name in the workflow

In `.github/workflows/azure-app-service.yml`, set:

```yaml
env:
  AZURE_WEBAPP_NAME: truewealth
```

Or use a GitHub variable: `${{ vars.AZURE_WEBAPP_NAME }}` and define `AZURE_WEBAPP_NAME` under Settings → Secrets and variables → Actions → Variables.

## App settings on Azure

Ensure the Web App has these in **Configuration → Application settings** (so the deployed app works and NextAuth works):

- `DATABASE_URL` – Same production PostgreSQL URL (as in GitHub secret).
- `NEXTAUTH_URL` – e.g. `https://truewealth.azurewebsites.net`
- `NEXTAUTH_SECRET` – Same value you use for production.
- `GOOGLE_CLIENT_ID` – Production Google OAuth client ID.
- `GOOGLE_CLIENT_SECRET` – Production Google OAuth client secret.

Google OAuth redirect URI must be:  
`https://truewealth.azurewebsites.net/api/auth/callback/google`

## Adding new DB changes

1. **Locally** (with local Postgres, e.g. `docker compose up -d` and `DATABASE_URL` in `.env.local`):
   ```bash
   npx prisma migrate dev --name your_migration_name
   ```
2. Commit the new folder under `prisma/migrations/` and push to `main`.
3. The pipeline will run `prisma migrate deploy` and apply the new migration to production, then deploy the new app.

## Running the workflow manually

**Actions** tab → **Build, migrate DB, and deploy to Azure** → **Run workflow** → Choose branch (e.g. `main`) → **Run workflow**.

## Troubleshooting

- **Migrations fail in CI** – Check that `DATABASE_URL` secret is set and is a valid PostgreSQL URL (and that the DB server allows connections from GitHub Actions IPs; Azure PostgreSQL can use “Allow public access” or VNet + self-hosted runner).
- **Deploy fails** – Check `AZURE_WEBAPP_PUBLISH_PROFILE` and that `AZURE_WEBAPP_NAME` matches the App Service name.
- **App starts but DB errors** – Ensure App Service has `DATABASE_URL` (and other env vars) set in Application settings.
