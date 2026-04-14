# Autonomous AI Internship Assistant

A complete local system that automates finding, ranking, and applying for internships using Google Gemini AI, Node.js, Playwright, and React.

## Prerequisites

1. **Node.js** (v18+)
2. **MongoDB** (Local instance running, or MongoDB Atlas cluster URL)
3. **Google Gemini API Key** (Free Tier is sufficient)
4. Chrome/Chromium installed for Playwright

## Folder Structure

```
linkedin-bot/
├── backend/      # Node.js, Express, Playwright, Mongoose
└── frontend/     # Vite, React, Tailwind CSS
```

## Step-by-Step Setup

### 1. Backend Setup

1. Open your terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Ensure you have a `.env` file in the `backend/` directory like so:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/linkedin_bot
   GEMINI_API_KEY=your_gemini_api_key_here
   LINKEDIN_SESSION_COOKIE=your_li_at_cookie_here
   ```
4. Start the backend:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup

1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Access the dashboard at `http://localhost:5173/`

## Deployment Guide (Optional)

This system is designed to run locally because it simulates your local browser context to prevent LinkedIn blockages. Deploying to a cloud server like AWS/Heroku usually triggers captchas or instant bans from LinkedIn for automation. 

If you must deploy:
1. **Frontend**: Can be built (`npm run build`) and served statically via Vercel or Netlify.
2. **Backend**: Deploy on a VPS (DigitalOcean Droplet) using PM2, but ensure you use high-quality rotating Residential Proxies and slow down the Playwright timers explicitly to avoid IP bans. Set all environment variables through your server's secret manager.
3. Configure your scheduler (`node-cron` in `src/scheduler/index.js`) to trigger based on your VPS server time.

## Legal Disclaimer
Using browser automation to scrape LinkedIn or perform actions on user behalf may violate their Terms of Service. Use this tool carefully and optionally only scrape publicly available fields with proper throttling (delays) inside Playwright scripts.
