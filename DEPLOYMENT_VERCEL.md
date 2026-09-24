# Deploying DRISHTI-AID to Vercel

This repository is pre-configured for **1-click zero-config deployment to Vercel**.

Both the **Vite React UI** and the **Full-Stack Express API** (`/api/*` endpoints for SAR change detection, risk zones, A* routing, Copernicus satellite search, and GEE comparison) are structured to deploy seamlessly using Vercel's serverless runtime.

---

## Method 1: Deploy via GitHub (Recommended)

1. **Initialize Git & Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: setup for vercel deployment"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select your GitHub repository.
   - Framework Preset: **Vite** (automatically detected from `vercel.json`).
   - Root Directory: `./` (leave default).
   - Build Command: `npm run build` (leave default).
   - Output Directory: `dist` (leave default).

3. **Configure Environment Variables in Vercel**:
   Under **Project Settings > Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Google AI Gemini API Key (required for situational dispatch briefings).
   - *(Optional)* `COPERNICUS_CLIENT_ID` and `COPERNICUS_CLIENT_SECRET`: For live Copernicus Data Space Ecosystem queries.
   - *(Optional)* `EARTH_ENGINE_PROJECT_ID`, `EARTH_ENGINE_SERVICE_ACCOUNT_EMAIL`, and `EARTH_ENGINE_PRIVATE_KEY`: For Google Earth Engine satellite comparisons.
   - *(Optional)* `NASA_EARTHDATA_TOKEN`: For NASA GPM precipitation granules.
   - *(Optional)* `VITE_OPENWEATHER_API_KEY`: For live meteorological wind and rain layers.

4. **Click Deploy**:
   Vercel will build the frontend into `dist/` and expose the serverless backend functions under `/api/*`.

---

## Method 2: Deploy directly via Vercel CLI

If you prefer terminal deployment:

1. In your terminal, run:
   ```bash
   npx vercel
   ```

2. Log in with your Vercel account when prompted in the browser.

3. Confirm the project settings:
   - Set up and deploy: `Y`
   - Which scope: Select your team or personal account
   - Link to existing project: `N`
   - Project name: `drishti-aid`
   - Directory: `./`
   - Want to modify settings: `N`

4. For production release:
   ```bash
   npx vercel --prod
   ```

---

## Architecture on Vercel

- **Frontend**: Vite Single Page Application served globally via Vercel Edge CDN from `dist/`.
- **Backend API**: All `/api/*` endpoints (health, change detection, risk zones, routing, AI tactical briefing, Copernicus, Earth Engine, NASA) are handled by the Node.js Serverless Function in `api/index.ts` via the routing defined in `vercel.json`.
