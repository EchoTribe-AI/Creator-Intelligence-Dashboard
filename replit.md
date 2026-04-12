# EchoTribe — Creator Intelligence Dashboard

## Overview

EchoTribe is a creator commerce intelligence platform for analyzing Facebook/Meta ad activity across affiliate marketing platforms. It ingests ad library CSV exports from four affiliate platforms (Markable, URLGenius, Mavely, Creator Finds IQ), de-duplicates them into a unified database, and presents a searchable creator dashboard showing ad copy, thumbnails, and performance signals.

The app is a full-stack TypeScript project with a React SPA frontend and Express backend. No database — all ad data is stored in a flat JSON file (`server/data/meta_ads.json`).

## User Preferences

Preferred communication style: Simple, everyday language.

---

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript, single-page application
- **Routing**: No router library — screen state is managed via `useState` in `App.tsx`
- **Styling**: Tailwind CSS with dark brand theme. CSS variables defined in `client/src/index.css`
- **UI Components**: shadcn/ui (new-york style) with Radix UI primitives in `client/src/components/ui/`
- **Data Fetching**: TanStack React Query v5 for server state; `apiRequest` from `@lib/queryClient` for mutations
- **Build Tool**: Vite with React plugin, outputs to `dist/public`
- **Path Aliases**: `@/` → `client/src/`, `@shared/` → `shared/`, `@assets/` → `attached_assets/`

### Backend
- **Framework**: Express.js on Node with TypeScript (run via `tsx`)
- **Entry Point**: `server/index.ts` → registers routes, serves static files in production, uses Vite dev middleware in development
- **API Routes**: `server/routes.ts`
  - `GET /api/meta-ads/creators?platform=` — returns creator summaries for a platform
  - `GET /api/meta-ads/search?platform=&creator=&ad_type=&q=&limit=&offset=` — filtered ad search, returns full `MetaAd[]` with `cached_thumbnail`
  - `GET /api/meta-ads/stats` — platform/creator/ad counts
  - `POST /api/meta-ads/import?platform_id=` — import a CSV (body = raw CSV text)
- **CSV Parser / DB layer**: `server/services/csv-parser.ts` — all ad data CRUD, CSV ingestion, image caching logic

### Data Storage
- **Ad Data**: `server/data/meta_ads.json` — flat JSON with `{ ads: MetaAd[], last_import, import_log }`
- **Platform Config**: `server/data/platforms.json` — list of 4 platform definitions (id, name, color, logo, description)
- **No SQL database** — everything is file-based

---

## Data Model

### MetaAd (fields in `server/services/csv-parser.ts`)
```
_key                string   "${platform_id}_${library_id}"  (dedup key)
library_id          string   Meta Ad Library ID
platform_id         string   "markable" | "urlgenius" | "mavely" | "creator_finds_iq"
creator_handle      string   slug from FB URL (no @ prefix)
creator_display_name string  formatted handle
profile_image_url   null     always null (not in current CSV format)
facebook_page_url   string|null
ad_copy             string   "Ad Details" column
video_url           string|null
image_url           string|null  "Content Image URL" column (see KNOWN ISSUES)
cta_url             string|null
cached_thumbnail    string|null  local path e.g. /creator-images/{slug}.jpg
landing_url         string|null  decoded CTA destination (strips FB redirect wrapper)
ad_type             "video"|"static"  video if Video URL non-empty
start_date          string
imported_at         string   ISO timestamp
```

---

## Ad Data — Current State (as of April 2026)

### Single CSV Source
- File: `creatorads_001.csv` (not tracked in git — must be re-provided to re-import)
- 2,341 de-duplicated ads across 4 platforms
- 289 unique creators

### Platform Breakdown
| Platform | Notes |
|---|---|
| Markable | Largest dataset; "Content Image URL" column contains Facebook profile picture URLs (60×60), NOT ad creative images |
| URLGenius | **COLUMN MISMATCH** — CSV columns are shifted/mixed up; "Content Image URL" column is mapping to the wrong data. Needs re-export with correct column alignment. |
| Mavely | Mavely-format CSVs use CSS class names as column headers (not readable labels); `normalizeRow()` in csv-parser.ts handles the mapping |
| Creator Finds IQ | Smallest dataset |

### Thumbnail / Image Cache — Current State
- **`public/creator-images/`** — local static image cache, served by Vite at `/creator-images/*.jpg`
- **459 valid cached files** (down from original 1,072 claimed)
  - 454 are Facebook profile pictures (60×60 px) — these display but are not ad creative images
  - 5 are from other non-image URL types (near-zero utility)
- **608 files were purged** — they were 0-byte empty files created when the import script tried to download CTA redirect links (`l.facebook.com/l.php?u=...`) as if they were images. Now fixed.
- **975 video-only ads** — no cached thumbnail; displayed via `<video preload="metadata">` with first-frame seek to `0.001s`
- **~496 static ads** — no cached thumbnail; show emoji fallback

### Facebook CDN URL Expiry
- Facebook CDN URLs (both video and image) contain an `oe=` param (Unix hex timestamp) and expire ~April 13, 2026
- The 459 locally-cached image files persist after expiry since they are saved to disk
- The 975 video `video_url` values will stop working after expiry — no local cache exists for video frames
- Fix: use `ffmpeg` (available at `/nix/store/.../bin/ffmpeg`) to extract first frames from video URLs and save as `.jpg` before expiry

---

## Thumbnail Rendering Logic (App.tsx)

Priority chain for each ad card:
1. `ad.cached_thumbnail` — local `/creator-images/` path (served as static file)
2. `ad.imageUrl` (remote Facebook CDN — will expire April 13)
3. `selectedCreator.profileImage` — always `null` in current data
4. `<video preload="metadata">` element with `onLoadedMetadata` seek to `0.001s` (for video ads)
5. Emoji fallback (📹 or 🖼️) for ads with no media at all

### Image Validation Fix (April 2026)
`cacheCreatorImage()` in `csv-parser.ts` now:
- Skips Facebook redirect URLs (`l.facebook.com`, `/l.php`)
- Validates `Content-Type: image/*` header before saving
- Rejects 3xx redirects
- Validates JPEG/PNG magic bytes after download
- Re-validates existing cached files on next import (deletes corrupt/empty files)

---

## Import Pipeline

### Bulk import script: `import-meta-ads.js`
- Run from project root: `node import-meta-ads.js`
- Reads `creatorads_001.csv` from project root
- De-duplicates by `_key = ${platform_id}_${library_id}`
- For each static ad with `image_url`, calls `cacheCreatorImage()` to download and save locally
- Outputs `server/data/meta_ads.json`

### Per-platform CSV import (via UI or API)
- `POST /api/meta-ads/import?platform_id=markable` with CSV body
- Handled by `importCSV()` in `csv-parser.ts`
- Max 1,000 ads stored per platform

---

## Known Issues / Next Steps

1. **URLGenius column mismatch** — The URLGenius CSV export has columns in the wrong order or uses different header names than expected. The `normalizeRow()` function maps Mavely-style CSS class columns, but URLGenius may be exporting with shifted/incorrect column alignment. Need to compare a raw URLGenius CSV export against the column mapping to identify which fields are swapped.

2. **Static ad thumbnails show profile pics instead of product images** — The "Content Image URL" column in Markable CSVs contains the Facebook Page's profile photo URL (60×60px) rather than the actual ad creative image. To show real product/creative thumbnails, the CSV export needs to capture the ad creative image URL (Meta Ad Library shows this as the main image in the ad card).

3. **Video thumbnail expiry (April 13, 2026)** — All 975 `video_url` values are Facebook CDN links that expire. Plan: run `ffmpeg -i <video_url> -vframes 1 output.jpg` for each video ad before expiry to cache first frames locally. `ffmpeg` is available in the Nix environment.

4. **`profile_image_url` always null** — The unified CSV format has no profile image column. Creator cards show a letter-based avatar fallback instead of a real photo. Could be sourced from the `_raw_image_src` / `_8nqq src` column in Mavely-format CSVs if re-imported.

---

## File Structure

```
client/src/App.tsx          Main SPA — all UI, routing, creator dashboard, ad gallery
server/index.ts             Express entry point
server/routes.ts            All API route handlers
server/services/
  csv-parser.ts             CSV parsing, data model, image caching, queryAds, getCreators
server/data/
  meta_ads.json             Ad database (2,341 ads, 289 creators)
  platforms.json            Platform definitions (4 platforms)
public/creator-images/      Locally cached ad/profile images (~19MB, 459 valid files)
import-meta-ads.js          Bulk CSV import script (run with node)
```

---

## Build & Deploy

- **Dev**: `npm run dev` — Express + Vite dev middleware, port 5000
- **Build**: `npm run build` — Vite client build + esbuild server bundle → `dist/`
- **Production**: `npm start` — serves `dist/public` as static, runs `dist/index.cjs`
- **Routes**: `/danny` and `/brands` serve `index.html` in production (SPA catch-all)
