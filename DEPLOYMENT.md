# Deployment guide: Azure & hosting recommendations

## Best host for this app (recommendation)

| Use case | Service | Why |
|----------|---------|-----|
| **Recommended** | **Azure App Service** (Linux, Node) | Single place for Next.js (API + frontend), easy scaling, managed SSL, custom domain, fits Azure ecosystem. |
| Alternative | **Azure Static Web Apps** + **Azure Functions** | Cheaper for low traffic; requires splitting API into Functions and frontend as static export or hybrid. |
| Database | **Azure Database for PostgreSQL** or **Azure SQL** | Managed, backups, scaling. For production, switch from SQLite to one of these. |

**Summary:** Deploy the full Next.js app to **Azure App Service** and attach **Azure Database for PostgreSQL** (or Azure SQL) for production. Use **Azure Static Web Apps** only if you want to optimize cost and are okay refactoring to serverless.

---

## Deploy to Azure App Service

### 1. Prepare the app for production

- Set `DATABASE_URL` to an Azure PostgreSQL connection string (see below). For quick start you can keep SQLite and use App Service storage, but PostgreSQL is recommended.
- Set `NEXTAUTH_URL` to your production URL (e.g. `https://truewealth.azurewebsites.net`).
- Set `NEXTAUTH_SECRET` (e.g. `openssl rand -base64 32`).
- Create a Google OAuth client and set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Add your production redirect URI: `https://truewealth.azurewebsites.net/api/auth/callback/google`.

### 2. Create resources (Azure CLI)

```bash
# Login and set subscription
az login
az account set --subscription "Your Subscription Name"

# Resource group
az group create --name rg-truewealth --location eastus

# App Service plan (B1 or higher for always-on)
az appservice plan create --name plan-truewealth --resource-group rg-truewealth --is-linux --sku B1

# Web app (Node 24)
az webapp create --name truewealth --resource-group rg-truewealth --plan plan-truewealth --runtime "NODE:24-lts"

# PostgreSQL
az postgres flexible-server create --resource-group rg-truewealth --name pg-truewealth --location eastus --admin-user pgadmin --admin-password "YourSecurePassword123!" --sku-name Standard_B1ms --tier Burstable --version 15
az postgres flexible-server db create --resource-group rg-truewealth --server-name pg-truewealth --database-name truewealth
```

### 3. Set startup command (required for Next.js)

Azure must run your app instead of the default static site. In Azure Portal → your Web App → **Configuration** → **General settings** → **Startup Command**, set:

```bash
npm start
```

Save (and restart the app if needed). This runs `next start` so the deployed app serves correctly.

### 4. Configure App Settings

In Azure Portal → your Web App → Configuration → Application settings, add:

- `DATABASE_URL` – e.g. `postgresql://pgadmin:YourSecurePassword123!@pg-truewealth.postgres.database.azure.com:5432/truewealth?sslmode=require`
- `NEXTAUTH_URL` – `https://truewealth.azurewebsites.net`
- `NEXTAUTH_SECRET` – your secret
- `GOOGLE_CLIENT_ID` – from Google Cloud Console
- `GOOGLE_CLIENT_SECRET` – from Google Cloud Console

For **SQLite** (not recommended for production): use a path under `/home` so it persists, e.g. `file:/home/LogFiles/dev.db`, and ensure the app has write access.

### 5. Deploy code

**Option A – End-to-end pipeline (recommended)**  
The repo includes a **full CI/CD workflow** that on every push to `main`:

- Runs lint and build  
- Runs **production DB migrations** (`prisma migrate deploy`)  
- Deploys the app to Azure App Service  

See **[docs/PIPELINE.md](docs/PIPELINE.md)** for required GitHub secrets (`AZURE_WEBAPP_PUBLISH_PROFILE`, `DATABASE_URL`), how to get the publish profile, and how to add new DB migrations.

**Option B – Local deploy with Azure CLI**

```bash
npm run build
# Deploy the built app (Azure CLI will zip and deploy)
az webapp deployment source config-zip --resource-group rg-truewealth --name truewealth --src ./deploy.zip
```

Create `deploy.zip` from your project root including `node_modules`, `.next`, `package.json`, `prisma`, etc., or use:

```bash
npm run build
npx prisma generate
# Then use "Deploy to Web App" from VS Code Azure extension or Azure DevOps pipeline
```

### 6. Run migrations

Migrations are run **in the GitHub Actions pipeline** before each deploy (`npx prisma migrate deploy`). No need to run them manually on the server. For the first deploy, ensure `DATABASE_URL` is set in GitHub secrets so the pipeline can apply the initial migration.

---

## Using PostgreSQL on Azure

1. In `prisma/schema.prisma`, change:

   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Set `DATABASE_URL` in App Service to your Azure PostgreSQL connection string (with `?sslmode=require`).
3. Run `npx prisma db push` or `npx prisma migrate deploy` after deploy.

---

## Google (Gmail) login

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials.
2. Create OAuth 2.0 Client ID (Web application).
3. Add authorized redirect URI: `https://truewealth.azurewebsites.net/api/auth/callback/google`.
4. Put Client ID and Client Secret in App Service settings as above.

---

## Quick reference: where to run what

| What | Where |
|------|--------|
| Next.js app (API + UI) | Azure App Service |
| Database (production) | Azure Database for PostgreSQL (or Azure SQL with Prisma) |
| Auth | NextAuth with Google (no extra Azure service) |
| Secrets | App Service Application settings (or Azure Key Vault for stricter security) |

This keeps one app service, one database, and minimal configuration while staying deployable on Azure.

---

## Enable auto-deploy on push or merge to main

To have every **commit or merge to `main`** automatically build and deploy to Azure App Service:

### 1. In Azure Portal

1. Create the Web App and App Service plan (see **Create resources** above) if you haven’t already.
2. Set **Application settings** (Configuration → Application settings) as in **Configure App Settings** above: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
3. **Startup command** (optional): Azure App Service (Linux, Node) runs `npm start` by default, which runs `next start`. No change needed unless you use a custom command.
4. Get the **publish profile**:
   - Open your **App Service** (Web App) in the Azure Portal.
   - Click **Get publish profile** (or **Overview** → **Get publish profile**).
   - Download the `.PublishSettings` file and open it in a text editor.
   - Copy the **entire XML** (you’ll paste it into GitHub in the next step).

### 2. In GitHub

1. Open your repo → **Settings** → **Secrets and variables** → **Actions**.
2. Add these **repository secrets** (not variables):

   | Name | Value |
   |------|--------|
   | `AZURE_WEBAPP_PUBLISH_PROFILE` | The full XML content of the publish profile you copied. |
   | `DATABASE_URL` | Your **production** PostgreSQL connection string (same as in Azure App settings). The pipeline uses this to run `prisma migrate deploy` before each deploy. |

3. Ensure the workflow file is on `main`: `.github/workflows/azure-app-service.yml` (it runs on **push** to `main` and on **workflow_dispatch**).
4. If your App Service name is not `truewealth`, either:
   - Change the `AZURE_WEBAPP_NAME` value in `.github/workflows/azure-app-service.yml`, or  
   - Add a **variable** `AZURE_WEBAPP_NAME` in **Settings → Actions → Variables** and in the workflow use `${{ vars.AZURE_WEBAPP_NAME }}` for `app-name`.

### 3. Trigger a deploy

- **Automatic:** Push or merge to `main`. The workflow will run: lint → build → migrate DB → deploy.
- **Manual:** Repo → **Actions** → **Build, migrate DB, and deploy to Azure** → **Run workflow** → choose branch (e.g. `main`) → **Run workflow**.

After this setup, every push or merge to `main` will auto-deploy to your Azure App Service.
