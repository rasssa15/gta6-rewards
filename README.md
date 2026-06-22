# GTA 6 Rewards — Gaming Rewards Platform

A world-class gaming rewards platform with AI-powered content generation, reward system, scratch cards, leaderboards, and full admin panel.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** SQLite (dev) / PostgreSQL (prod)
- **Auth:** NextAuth.js (Credentials, Google, Discord)
- **AI:** Puter.js (free AI for article generation, image gen, SEO)
- **State:** Zustand (state management), React Hot Toast (notifications)

## Features

### 🎮 Gaming Platform
- Cinematic GTA 6-themed hero section with live user counter
- Gaming news with categories (GTA 6, Rockstar, PlayStation, Xbox, PC, Nintendo, Esports)
- Full article pages with reading progress, bookmarks, share buttons
- Rewards center with redeemable items (Steam, PlayStation, Xbox gift cards)
- Scratch card system with real canvas scratching effect + confetti
- Achievement system with 15+ achievements across multiple categories
- Daily challenges with progress tracking
- Global leaderboard (daily, weekly, monthly, all-time)
- Referral program with shareable links + tracking
- Rewarded ad system (earn points + scratch cards)

### 🤖 AI Content Automation
- Powered by **Puter.js** (free, no API key required)
- AI article generation with customizable style, length, tone
- AI image generation for article thumbnails
- AI SEO metadata generation (titles, descriptions, tags)
- AI content categorization
- Content rewriting and summarization

### 👑 Admin Panel
- Overview dashboard with real-time analytics
- User management with search and filtering
- Article management (create, edit, publish)
- Reward management (add, edit, track stock)
- AI Generator tools in admin panel
- Platform settings configuration
- Complete analytics suite

### 🔒 Security
- Rate limiting, CSRF protection
- Secure authentication with NextAuth.js
- Role-based access control (user/admin)
- Audit logging via point transactions
- SQL injection protection via Prisma

## Quick Start

### 1. Clone & Install

```bash
git clone <repo-url> gta6-rewards
cd gta6-rewards
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env
# Edit .env if needed (defaults work for local development)
```

### 3. Setup Database

```bash
npx prisma generate
npx prisma db push
```

### 4. Seed Database

```bash
npx ts-node prisma/seed.ts
```

This creates:
- **Admin:** admin@gta6rewards.com / admin123
- **User:** player@gta6rewards.com / user123
- 15 achievements
- 12 rewards
- 5 daily challenges
- 8 news articles
- Site settings

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Using AI Features (Puter.js)

Puter.js provides **free AI capabilities** without requiring API keys:

1. Go to [puter.com](https://puter.com) and create a free account
2. Stay logged into Puter.com in your browser
3. Navigate to the **Admin Panel → AI Generator** tab
4. The Puter.js script loads automatically when you visit the AI tab
5. Generate articles, images, SEO metadata, and more

AI features available:
- **Article Generation:** Enter a topic, choose style/length/tone
- **Image Generation:** Generate article thumbnails from descriptions
- **SEO Generation:** Auto-generate meta titles, descriptions, tags
- **Categorization:** Auto-classify content into gaming categories

## Deployment (Supabase + Vercel — 100% Free)

### 1. Create Supabase Database

1. Go to [supabase.com](https://supabase.com) → **Start your project** (sign up with GitHub)
2. **New project** → name: `gta6-rewards`, set a strong DB password, pick region
3. Wait ~1-2 min for provisioning
4. Go to **Project Settings → Database → Connection string**
5. Copy the **URI** for PgBouncer (port 6543) — looks like:
   ```
   postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
   ```

### 2. Set Environment Variables in Vercel

When deploying (via GitHub import or CLI), set these:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Supabase pooled connection string (port 6543 with `?pgbouncer=true&connection_limit=1`) |
| `NEXTAUTH_SECRET` | Run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `JWT_SECRET` | Same as above, different output |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |

The build command (`vercel.json`) runs:
```bash
npx prisma generate && npx prisma migrate deploy && next build
```

### 3. Seed Production Database

After first successful deploy, seed your Supabase database:

```bash
DATABASE_URL="postgresql://postgres.xxxxx:password@db.xxxxx.supabase.co:5432/postgres" npx prisma db seed
```

### Free Tier Limits (2026)

| Service | Limit | Good For |
|---|---|---|
| **Supabase Free** | 500MB DB, 5GB bandwidth, 50k MAU | Thousands of users |
| **Vercel Hobby** | 100k serverless invocations/day, 100GB bandwidth, SSL | Moderate traffic |
| **Puter.js AI** | Free, no API key needed | Unlimited AI generations |

## Project Structure

```
gta6-rewards/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── admin/         # Admin panel
│   │   ├── auth/          # Login/Register
│   │   ├── dashboard/     # User dashboard
│   │   ├── news/          # News listing & articles
│   │   ├── rewards/       # Rewards center
│   │   ├── leaderboard/   # Leaderboard
│   │   ├── challenges/    # Daily challenges
│   │   └── achievements/  # Achievements
│   ├── components/
│   │   ├── layout/        # Header, Footer
│   │   ├── home/          # Homepage sections
│   │   ├── ui/            # Reusable UI components
│   │   ├── scratch/       # Scratch card component
│   │   ├── admin/         # Admin components
│   │   └── ...
│   ├── lib/
│   │   ├── auth/          # Auth configuration
│   │   ├── ai/            # Puter.js AI integration
│   │   └── utils/         # Utilities
│   └── types/             # TypeScript types
├── public/
├── .env
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` — Create account
- `POST /api/auth/callback/credentials` — Login
- `GET /api/auth/me` — Get current user
- `GET /api/auth/admin` — Check admin status

### Content
- `GET /api/articles` — List articles (paginated, filterable)
- `GET /api/articles/[slug]` — Get article with comments
- `POST /api/articles/bookmark` — Toggle bookmark

### Rewards
- `GET /api/rewards` — List available rewards
- `POST /api/rewards/redeem` — Redeem a reward
- `GET /api/rewards/redeem` — Get redemption history

### Scratch Cards
- `GET /api/scratch-cards` — Get user's scratch cards
- `POST /api/scratch-cards` — Open a scratch card

### Challenges
- `GET /api/challenges/daily` — Get daily challenges with progress
- `POST /api/challenges/daily` — Complete a challenge

### Leaderboard
- `GET /api/leaderboard` — Get leaderboard (period, limit params)

### Ads
- `POST /api/ads/watch` — Complete a rewarded ad watch

### Points
- `GET /api/points` — Get transaction history and stats

### Referrals
- `GET /api/referrals` — Get referral stats and link

### Achievements
- `GET /api/achievements` — List all achievements (with user progress)

### Admin
- `GET /api/admin/analytics` — Platform analytics
- `GET /api/admin/users` — User management
- `GET/POST /api/admin/articles` — Article management
- `GET/POST/PATCH /api/admin/rewards` — Reward management
- `GET/PUT /api/admin/settings` — Platform settings

## Scoring System

| Action | Points |
|--------|--------|
| Daily Login | +5 |
| Read Article | +1 |
| Share Article | +2 |
| Watch Ad | +2 |
| Complete Challenge | +10 |
| Referral | +50 |
| Achievement Unlock | +15 |
| Scratch Card | 1-50 (random) |

## Rank System

| Level | Rank |
|-------|------|
| 1-7 | Bronze |
| 8-14 | Silver |
| 15-19 | Gold |
| 20-29 | Platinum |
| 30-39 | Diamond |
| 40+ | Legend |

## License

MIT
