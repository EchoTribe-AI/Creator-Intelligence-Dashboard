# Markable — Creator Commerce Content Generator

## Overview

Markable is a creator commerce platform that helps generate ad content for Amazon affiliate creators. It scrapes Amazon product data, analyzes creator ad styles from Meta Ad Library data, and uses Claude (Anthropic) AI to generate personalized ad copy variations matching each creator's tone and audience.

The app is a full-stack TypeScript project with a React SPA frontend and Express backend. It includes an Amazon product scraper (via Crawlbase), a storefront photo scraper, persistent product history, and an AI content generation engine powered by the Anthropic API.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript, single-page application
- **Routing**: No router library — screen state is managed via `useState` in `App.tsx` (screens like "dashboard", "generator", etc.)
- **Styling**: Tailwind CSS with a custom dark brand theme (Markable coral/red `#FF3B3B` accent on near-black `#0A0A0A` background). CSS variables defined in `client/src/index.css`
- **UI Components**: shadcn/ui (new-york style) with Radix UI primitives. Components live in `client/src/components/ui/`
- **Data Fetching**: TanStack React Query for server state, plus direct `fetch` calls to backend API
- **Build Tool**: Vite with React plugin, outputs to `dist/public`
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend
- **Framework**: Express.js on Node with TypeScript (run via `tsx`)
- **Entry Point**: `server/index.ts` → registers routes, serves static files in production, uses Vite dev server in development
- **API Routes**: Defined in `server/routes.ts` — includes Anthropic proxy, product scraping, storefront scraping, and product CRUD
- **Anthropic Proxy**: `/api/anthropic/v1/messages` — proxies requests to Claude API using server-side `ANTHROPIC_API_KEY` secret
- **Amazon Scraper**: `server/scraper.js` — uses Crawlbase JS token to fetch rendered Amazon pages, then parses with Cheerio. Handles affiliate URL resolution, ASIN extraction, and product detail extraction
- **Storefront Scraper**: Also in `server/scraper.js` — scrapes Amazon influencer storefront photo pages for bulk product discovery
- **Standalone Scraper API**: `server/scraper-api.js` exists as a standalone Express server (port 3001) but the main app integrates scraping directly into `server/routes.ts`

### Data Storage
- **Primary Storage (Products)**: JSON file at `server/data/products.json` — simple file-based persistence for scraped product history. Managed by `server/db.js` with upsert-by-ASIN+creatorId logic
- **User Storage**: In-memory `MemStorage` class in `server/storage.ts` — stores users in a Map (not persistent across restarts)
- **Database Schema (Drizzle/PostgreSQL)**: `shared/schema.ts` defines a `users` table with Drizzle ORM targeting PostgreSQL. The `drizzle.config.ts` requires `DATABASE_URL` env var. This is set up but the app currently uses in-memory storage for users — Postgres can be provisioned and connected
- **Schema Push**: `npm run db:push` runs `drizzle-kit push` to sync schema to database

### Creator Data
- Creator profiles (name, niche, tone, audience, existing ad samples) are hardcoded in `client/src/App.tsx` as the `CREATORS` array
- Each creator includes placeholder fields for Meta Ads API data and Amazon Associates API data (marked as `CONNECT_META_API` / `CONNECT_AFFILIATE_API`)
- Products per creator are also defined in the hardcoded data, with scraped product details augmenting them at runtime

### Build & Deploy
- **Dev**: `npm run dev` — runs `tsx server/index.ts` with Vite dev middleware for HMR
- **Build**: `npm run build` — runs `script/build.ts` which builds client with Vite and bundles server with esbuild into `dist/index.cjs`
- **Production**: `npm start` — runs `node dist/index.cjs`, serves static files from `dist/public`
- Server dependencies are selectively bundled (allowlisted) during build to reduce cold start syscalls

## External Dependencies

### APIs & Services
- **Anthropic Claude API**: Used for AI content generation. Server proxies requests to avoid exposing API key. Requires `ANTHROPIC_API_KEY` in environment/secrets
- **Crawlbase**: JavaScript rendering API for scraping Amazon product pages and storefront photos. Requires `CRAWLBASE_JS_TOKEN` in environment/secrets. Uses JS token with wait/ajax parameters for dynamic content
- **Meta Marketing API**: Placeholder integration for pulling creator ad spend, CPC, CPM, CTR data. Not yet connected — fields marked `CONNECT_META_API`
- **Amazon Associates API**: Placeholder integration for affiliate earnings, clicks, orders. Not yet connected — fields marked `CONNECT_AFFILIATE_API`

### Database
- **PostgreSQL**: Configured via Drizzle ORM with `DATABASE_URL` environment variable. Currently only has a `users` table schema. The app can function without it (uses in-memory storage) but is ready for Postgres provisioning

### Key NPM Packages
- `express` — HTTP server
- `axios` — HTTP client for scraping and API calls
- `cheerio` — HTML parsing for Amazon scraping
- `drizzle-orm` + `drizzle-kit` + `drizzle-zod` — ORM and schema management
- `@tanstack/react-query` — client-side data fetching/caching
- `@radix-ui/*` — UI primitive components (via shadcn/ui)
- `tailwindcss` — utility-first CSS
- `zod` — schema validation
- `connect-pg-simple` — PostgreSQL session store (available but not actively used)