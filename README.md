# GTA 6 Rewards — Wallet Platform

Secure wallet-based authentication for GTA 6 Rewards. Zero server, zero database.

## Features

- **Create Wallet** — Generate a 12-word recovery phrase + 6-digit PIN
- **Recover Wallet** — Restore with your 12-word phrase on any device
- **PIN Unlock** — Quick access with AES-256-GCM encrypted storage
- **No Server** — Everything stored encrypted in your browser's localStorage
- **100% Free** — Host as static files on Cloudflare Pages, GitHub Pages, or Netlify

## Tech Stack

- **Next.js 14** (static export via `output: "export"`)
- **TypeScript** + **Tailwind CSS** + **Framer Motion**
- **Web Crypto API** — PBKDF2 (100k rounds) + AES-256-GCM
- **BIP39 Wordlist** — 2048-word standard recovery phrases

## Quick Start

```bash
npm install
npm run dev
```

## Build for Production

```bash
npm run build
```

Static files output to `out/` — deploy anywhere.

## Deploy (100% Free)

### Cloudflare Pages (recommended)
1. Drag `out/` folder into Cloudflare Pages dashboard
2. Site is live at `<name>.pages.dev`

### GitHub Pages
```bash
npm run build
git add out/ -f
git commit -m "deploy"
git push origin `git subtree split --prefix out main`:gh-pages --force
```

### Vercel / Netlify
Connect your GitHub repo — build command: `npm run build`, output: `out/`

## How It Works

```
First visit → Generate 12 words → Confirm → Set PIN → Dashboard
Recovery   → Enter 12 words → Set new PIN → Dashboard
Login      → Enter PIN → Decrypt wallet → Dashboard
Clear data → Enter 12 words → Recover
```

The 12-word phrase is **never stored** on your device — only on paper. The wallet is encrypted with your PIN using AES-256-GCM (key derived via PBKDF2, 100k iterations).
