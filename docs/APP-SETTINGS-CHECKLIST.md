# Azure App Service – Application settings checklist

Your app needs these in **Azure Portal → Web App (truwealth) → Configuration**.

---

## 0. Startup command (required)

The app is deployed as a **standalone** bundle. In **Configuration → General settings → Startup Command** set:

```bash
node server.js
```

Save and restart. Do **not** use `npm start`.

---

## 1. Application settings

In **Configuration → Application settings**, add any that are missing:

### 1. DATABASE_URL ✅ (you have this)

- **Name:** `DATABASE_URL`
- **Value:** Your PostgreSQL connection string (already set).

---

## 2. NEXTAUTH_URL

- **Name:** `NEXTAUTH_URL`
- **Value:** Your app’s public URL (no trailing slash):
  ```
  https://truwealth.azurewebsites.net
  ```

---

## 3. NEXTAUTH_SECRET (generate a random secret)

Used to sign cookies and tokens. Generate once and reuse the same value everywhere.

**Option A – On your Mac/Linux (Terminal):**
```bash
openssl rand -base64 32
```
Copy the output (e.g. `K7gNu3R...`). That is your secret.

**Option B – Online:** Use a generator like https://generate-secret.vercel.app/32 and copy the result.

- **Name:** `NEXTAUTH_SECRET`
- **Value:** The string you generated (e.g. `K7gNu3R...`).

---

## 4. GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (Google OAuth)

You need a **Google OAuth 2.0 Web application** client and its Client ID + Client Secret.

### Step 1: Open Google Cloud Console

1. Go to **[Google Cloud Console](https://console.cloud.google.com/)**.
2. Sign in with the Google account you want to use for “Sign in with Google”.
3. Create a project or select an existing one (top bar: project dropdown → **New project** or select one).

### Step 2: Enable Google+ API / People API (if needed)

- Go to **APIs & Services** → **Library**.
- Search for **“Google+ API”** or **“Google People API”** and enable it if your project doesn’t have it (some projects only need the OAuth consent screen).

### Step 3: Configure OAuth consent screen

1. **APIs & Services** → **OAuth consent screen**.
2. Choose **External** → **Create** (use **Internal** only if this is a Google Workspace org-only app).
3. Fill in the form:

   **App information**
   | Field | What to enter |
   |-------|-------------------------------|
   | **App name** | `TrueWealth` |
   | **User support email** | Your email (e.g. your Gmail). Users see this if they need help. |
   | **App logo** | (Optional) Upload a small logo; skip if you don’t have one. |

   **App domain** (optional; you can skip and click **Save and Continue**)
   | Field | What to enter |
   |-------|-------------------------------|
   | **Application home page** | `https://truwealth.azurewebsites.net` |
   | **Application privacy policy link** | Leave blank or add a URL to your privacy policy. |
   | **Application terms of service link** | Leave blank or add a URL to your terms. |

   **Developer contact information**
   | Field | What to enter |
   |-------|-------------------------------|
   | **Email addresses** | Your email (required). Google uses this to contact you about the app. |

   Then click **Save and Continue**.

4. **Scopes** → **Add or remove scopes** → ensure you have at least **email**, **profile**, **openid** (usually added by default for “Sign in with Google”). → **Save and Continue**.
5. **Test users** (only if status is “Testing”): click **+ Add users** and add the Gmail addresses that should be allowed to sign in (including yours). → **Save and Continue**.
6. **Summary** → **Back to dashboard**.

### Step 4: Create OAuth client credentials

1. **APIs & Services** → **Credentials**.
2. **+ Create credentials** → **OAuth client ID**.
3. **Application type:** **Web application**.
4. **Name:** e.g. `TrueWealth Production`.
5. **Authorized redirect URIs** → **+ Add URI** and add exactly:
   ```
   https://truwealth.azurewebsites.net/api/auth/callback/google
   ```
6. **Create**.
7. In the popup you’ll see **Client ID** and **Client secret**. Copy both (you can also open the client later from Credentials to see the secret again).

### Step 5: Add them in Azure

- **Name:** `GOOGLE_CLIENT_ID`  
  **Value:** The Client ID (looks like `123456789-xxx.apps.googleusercontent.com`).

- **Name:** `GOOGLE_CLIENT_SECRET`  
  **Value:** The Client secret (looks like `GOCSPX-...`).

---

## Summary: all 5 settings

| Name               | Where to get it |
|--------------------|------------------|
| `DATABASE_URL`     | Your PostgreSQL connection string (you have this). |
| `NEXTAUTH_URL`     | `https://truwealth.azurewebsites.net` |
| `NEXTAUTH_SECRET`  | Generate: `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | Google Cloud Console → Credentials → OAuth 2.0 Client ID |
| `GOOGLE_CLIENT_SECRET` | Same OAuth client → Client secret |

After adding or changing any value, click **Save** at the top of Application settings. The app will restart and use the new values.
