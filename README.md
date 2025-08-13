# Discover - Daily Tech News

A pixel-accurate, dark-themed, card-based news app built with React + Vite + Tailwind.

## Quickstart

1. Install Node.js LTS (18+). On Windows, download from https://nodejs.org or via winget:
   ```powershell
   winget install --id OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
   ```
2. Create `.env.local` in the project root with your NewsAPI key:
   ```env
   VITE_NEWS_API_KEY=YOUR_KEY_HERE
   ```
3. Install and run:
   ```bash
   npm install
   npm run dev
   ```

## Features
- Tabs: Tech & Science, Finance, Arts & Culture (active tab styled in blue)
- Rounded image cards, bold white headlines, light gray 2-line descriptions (truncated)
- Author avatar + name, bookmark + headphones icons
- Smooth hover animations, fully responsive
- Open article in a new tab on card click
- Bottom nav with search input and 4 icons
- Optional text-to-speech using the browser SpeechSynthesis API

## Deploy (Render)
A `render.yaml` is included. Create a new Web Service on Render and set `VITE_NEWS_API_KEY` in environment variables. Build command: `npm install && npm run build`. Publish directory: `dist`.
