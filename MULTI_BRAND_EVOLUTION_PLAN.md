# 🎯 EchoTribe: Multi-Brand Evolution Plan
## Updating Existing Replit Project to Support Multi-Brand Creator Intelligence

**Status**: Ready to evolve existing codebase  
**Current State**: Single "Markable" brand with hardcoded creators, Claude API integration working  
**Target**: Multi-brand platform (Markable, URLGenius, Mavely) with CSV import & dynamic brand switching  

---

## 📋 What We're Keeping vs. What We're Changing

### ✅ What Works — Keep As-Is
1. **Claude API proxy** (`/api/anthropic/v1/messages`) — this is perfect
2. **Server infrastructure** (Express, routes.ts, storage.ts, db.js)
3. **Product scraping** (Amazon storefront scraper, product save/fetch)
4. **Generation history** (saved generations, content variants)
5. **Main styling patterns** (the "markable_demo_v3.jsx" UI looks great)
6. **Danny Page** (forecasting page at `/danny`)

### 🔄 What Needs Evolution
1. **Creator data storage** — from hardcoded arrays → file-based JSON per-platform
2. **App routing** — add `/brands` route for multi-brand view (keep existing `/` as default)
3. **CSV import** — new endpoint + UI widget for uploading scrapes
4. **Brand selector** — sidebar or top nav to switch between platforms
5. **Creator grid** — filtered by selected brand
6. **Data layer** — CSV parsing + deduplication logic

---

## 🏗️ Implementation Roadmap

### Phase 1: Data Architecture (Server-Side)

#### New Files to Create:

**1. `/server/data/platforms.json`** (similar to products.json pattern)
```json
{
  "platforms": [
    {
      "id": "markable",
      "name": "Markable",
      "color": "#C084FC",
      "logo": "✨",
      "description": "Markable creator network",
      "created_at": "2026-04-02"
    },
    {
      "id": "urlgenius",
      "name": "URLGenius",
      "color": "#34D399",
      "logo": "🔗",
      "description": "URLGenius platform"
    },
    {
      "id": "mavely",
      "name": "Mavely",
      "color": "#F472B6",
      "logo": "🎯",
      "description": "Mavely talent platform"
    }
  ]
}
```

**2. `/server/data/meta_ads.json`** (grows as CSVs are imported)
```json
{
  "ads": [
    {
      "id": "1657003929000112",
      "creator_name": "Kortney and Karlee",
      "creator_handle": "@kortneyandkarlee",
      "ad_copy": "Like and comment C276...",
      "ad_copy_short": "Like and comment C276 without...",
      "thumbnail_url": "https://...",
      "video_url": "https://...",
      "cta_url": "https://amzn.markable.ai/...",
      "cta_button_text": "Shop now",
      "ad_type": "video",
      "start_date": "Jan 12, 2026",
      "start_date_iso": "2026-01-12",
      "platform": "markable",
      "imported_at": "2026-04-02T10:30:00Z",
      "link_status": "active"
    }
  ],
  "last_import": "2026-04-02T10:30:00Z",
  "import_log": [
    { "platform": "markable", "count": 897, "timestamp": "2026-04-02T10:30:00Z" }
  ]
}
```

**3. `/server/services/csv-parser.ts`** (parse Meta Ad Library CSVs)
```typescript
export async function parseMetaAdCSV(
  csvText: string,
  platformId: string
): Promise<MetaAd[]> {
  // 1. Parse CSV rows
  // 2. Map garbled columns to clean schema
  // 3. Infer ad_type from video_url presence
  // 4. Parse start date to ISO format
  // 5. Dedup by ad_id
  return ads;
}

export async function importCSV(
  csvText: string,
  platformId: string,
  fileName: string
): Promise<ImportResult> {
  // Load existing meta_ads.json
  // Parse new CSV
  // Merge (skip duplicates, update existing if fields differ)
  // Write back to meta_ads.json
  // Return { imported: 750, new: 750, updated: 147 }
}
```

#### New Routes in `/server/routes.ts`:

```typescript
// Platforms
app.get('/api/platforms', (req, res) => {
  // Return list of all platforms
  // Response: { platforms: [...] }
});

app.post('/api/platforms', (req, res) => {
  // Create new platform
  // Body: { name, color, logo, description }
  // Response: { platform: {...}, success: true }
});

// Meta Ads
app.post('/api/meta-ads/import', async (req, res) => {
  // Upload + parse CSV for a platform
  // Body: { platform_id: "markable", csv_text: "..." }
  // Response: { imported: 750, new: 750, updated: 147 }
});

app.get('/api/meta-ads/search', (req, res) => {
  // Query ads with filters
  // Query params: ?platform=markable&creator_name=Kortney&ad_type=video&limit=50
  // Response: { ads: [...], total: 1825 }
});

app.get('/api/meta-ads/creators', (req, res) => {
  // Get unique creators for a platform
  // Query params: ?platform=markable
  // Response: { creators: [...] }
});

app.get('/api/meta-ads/stats', (req, res) => {
  // Dashboard stats
  // Response: { total_ads: 1825, platforms: {...}, creators: 156, ... }
});

// For backwards compatibility with existing demo
app.get('/api/markable/creators', (req, res) => {
  // Return hardcoded Markable creators (same as current CREATORS array)
  // This keeps the existing demo working
});
```

---

### Phase 2: Client-Side Changes

#### Update `/client/src/App.tsx`:

```jsx
import { useState, useEffect } from 'react';
import { DannyPage } from './pages/danny-page';
import { MarkableDemo } from './pages/markable-demo-v3';
import { MultiBrandIntelligence } from './pages/multi-brand-intelligence';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleNav = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handleNav);
    return () => window.removeEventListener('popstate', handleNav);
  }, []);

  // Route handling
  if (currentPath === '/danny' || currentPath === '/danny/') {
    return <DannyPage />;
  }
  
  if (currentPath === '/brands' || currentPath === '/brands/') {
    return <MultiBrandIntelligence />;
  }

  // Default: Markable demo (keep existing behavior)
  return <MarkableDemo />;
}
```

#### New File: `/client/src/pages/multi-brand-intelligence.tsx`

```jsx
// Main component for multi-brand view
// State:
//   - selectedPlatform: "markable" | "urlgenius" | "mavely"
//   - selectedCreator: null | CreatorData
//   - filterAdType: "all" | "video" | "static" | "carousel"
//   - searchQuery: string
//   - csvUploadProgress: 0-100

// UI Sections:
// 1. Nav bar: EchoTribe logo + "Back to Markable Demo" link
// 2. Left sidebar:
//    - Platform list with ad counts
//    - "Import CSV" button (drag-drop widget)
//    - Stats overview
// 3. Main area:
//    - Creator grid (filtered by platform)
//    - Search bar
//    - Pagination
// 4. Detail modal (on creator click):
//    - Creator name + platforms they're on
//    - All ads for creator across platforms
//    - Ad detail lightbox
```

#### Update `/client/src/pages/markable_demo_v3.jsx`:

**No changes needed** — it stays as a self-contained demo. Just rename the export.

---

## 📊 Data Flow Example: Importing a CSV

```
User uploads Markable CSV (897 ads)
         ↓
POST /api/meta-ads/import
  body: { platform_id: "markable", csv_text: "..." }
         ↓
parseMetaAdCSV()
  - Parse 897 rows
  - Clean columns
  - Extract ad_type from video_url presence
  - Infer start_date from "Started running on Jan 12, 2026"
         ↓
Load existing meta_ads.json (currently empty or has previous imports)
         ↓
Merge:
  - For each ad, check if id exists
  - If exists: update modified fields (link_status, imported_at)
  - If new: append to ads array
         ↓
Write back to meta_ads.json
  - Update last_import timestamp
  - Add entry to import_log
         ↓
Return to client:
  { imported: 897, new: 897, updated: 0, success: true }
         ↓
Client shows toast: "✅ 897 new ads imported from Markable"
         ↓
Client calls GET /api/meta-ads/stats
         ↓
Dashboard updates with new counts
```

---

## 🎨 UI Flow (Client)

### Landing Screen (Multi-Brand Intelligence)
```
┌──────────────────────────────────────────────────────────┐
│ EchoTribe          [Back to Markable Demo] [← Home]      │
├────────────────┬──────────────────────────────────────────┤
│ PLATFORMS      │ CREATORS FOR SELECTED PLATFORM          │
│                │                                         │
│ ✨ Markable    │ [Creator Card] [Creator Card]          │
│   897 ads      │ [Creator Card] [Creator Card]          │
│   156 creators │                                         │
│                │ [Pagination]                            │
│ 🔗 URLGenius   │                                         │
│   858 ads      │                                         │
│   142 creators │ [DETAIL MODAL on creator click]       │
│                │ ┌─────────────────────────────────────┐│
│ 🎯 Mavely      │ │ Kortney and Karlee                 ││
│   70 ads       │ │ Platforms: Markable, URLGenius    ││
│   34 creators  │ │ Total Ads: 47                       ││
│                │ │ Ad Types: Video (30), Static (17)   ││
│ [+ Import CSV] │ │                                     ││
│ (drag-drop)    │ │ [Ad List]                           ││
│                │ │ - [Ad] Thumbnail + copy             ││
│                │ │ - [Ad] Thumbnail + copy             ││
│                │ │ - [Ad] Thumbnail + copy             ││
│                │ └─────────────────────────────────────┘│
│                │                                         │
└────────────────┴──────────────────────────────────────────┘
```

### Import CSV Widget
```
[+ Import CSV]
  ↓ (click or drag file)
┌─────────────────────────────────────────────────┐
│ Drop CSV file here or click to browse           │
│                                                 │
│ Selected file: markable_meta_ads.csv            │
│ Platform: [Markable ▼] ← select which platform │
│                                                 │
│ [Cancel] [Import]                               │
└─────────────────────────────────────────────────┘
  ↓ (on Import click)
POST /api/meta-ads/import with CSV data
  ↓
Show progress: "Importing... 25% (225/897 ads)"
  ↓
✅ "897 ads imported from Markable"
  ↓
Dashboard auto-refreshes
```

---

## 🗂️ File Structure After Changes

```
Creator-Intelligence-Dashboard/
├── server/
│   ├── routes.ts                    (add 4 new endpoints)
│   ├── services/
│   │   └── csv-parser.ts            (NEW)
│   ├── data/
│   │   ├── platforms.json           (NEW)
│   │   ├── meta_ads.json            (NEW)
│   │   ├── products.json            (existing)
│   │   └── generations.json         (existing)
│   ├── index.ts                     (no changes)
│   ├── scraper.js                   (no changes)
│   └── db.js                        (no changes)
│
├── client/src/
│   ├── App.tsx                      (update routing logic)
│   ├── pages/
│   │   ├── markable_demo_v3.jsx     (existing, no changes)
│   │   ├── danny-page.tsx           (extract from App.tsx)
│   │   └── multi-brand-intelligence.tsx (NEW)
│   ├── components/
│   │   ├── PlatformSidebar.tsx      (NEW)
│   │   ├── CreatorGrid.tsx          (NEW)
│   │   ├── AdDetailModal.tsx        (NEW)
│   │   ├── CSVImportWidget.tsx      (NEW)
│   │   └── (existing UI components stay)
│   ├── hooks/
│   │   ├── useMetaAds.ts            (NEW)
│   │   ├── usePlatforms.ts          (NEW)
│   │   └── (existing hooks)
│   └── (rest of client stays the same)
│
├── shared/
│   └── markable-ads-v2.csv          (existing — can be migrated to server/data)
│
└── (all other files unchanged)
```

---

## 🚀 Implementation Priority (What to Build First)

### Build 1: Server Infrastructure
- [ ] Create `platforms.json` (3 platforms: Markable, URLGenius, Mavely)
- [ ] Create `meta_ads.json` (empty, ready for imports)
- [ ] Build `csv-parser.ts` (parseMetaAdCSV + importCSV functions)
- [ ] Add 5 new routes: import, search, creators, stats, + fallback
- [ ] Test CSV parsing with your 3 files (897 + 858 + 70 ads)

### Build 2: Client UI
- [ ] Build `multi-brand-intelligence.tsx` (main page structure)
- [ ] Build `PlatformSidebar.tsx` (platform list + stats)
- [ ] Build `CreatorGrid.tsx` (filter + display creators)
- [ ] Build `CSVImportWidget.tsx` (drag-drop + upload)
- [ ] Build `AdDetailModal.tsx` (full ad details + copy)
- [ ] Connect with `useMetaAds` hook (fetch + filter)
- [ ] Update `App.tsx` routing (add `/brands` path)
- [ ] Test end-to-end

### Build 3: Polish + Integration
- [ ] Link detection (check for expired links)
- [ ] Compliance flagging (re-use from existing demo if available)
- [ ] Search functionality (creator name, ad keywords)
- [ ] Analytics dashboard (stats, trends)
- [ ] Mobile responsiveness
- [ ] Deploy to Replit

---

## 🔗 Integration with Existing Features

### Claude API Integration (Existing)
The `/api/anthropic/v1/messages` proxy is already perfect. When the multi-brand view is ready, you can:
1. Click a creator → show their ads
2. Click an ad → generate variations using Claude (same as Markable demo)
3. Save generation to history (same as existing)

### Product Scraper (Existing)
When viewing a creator's ad:
- User can click "Extract products from this creator's storefront"
- Existing `/api/storefront` endpoint handles it
- Products saved per creator (same as existing)

### Danny Page (Existing)
- Completely unchanged
- Still at `/danny`
- Forecasting model stays as-is
- No changes needed

---

## 💡 Special Considerations

### CSV Column Mapping Challenge
Your CSVs have **garbled HTML class names** as headers:
```
x8t9es0 2, x8t9es0 3, x8t9es0 5, _8nqq src, xt0psk2 href, etc.
```

**Solution in `csv-parser.ts`:**
```typescript
const COLUMN_MAP = {
  0: 'ad_id',           // x8t9es0 2
  1: 'start_date',      // x8t9es0 3
  2: 'ad_details_link', // x8t9es0 5
  3: 'thumbnail_url',   // _8nqq src
  4: 'creator_page',    // xt0psk2 href
  5: 'creator_name',    // x8t9es0 6
  6: 'ad_copy',         // _4ik4
  7: 'video_url',       // x1lliihq src
  8: 'cta_url',         // x1hl2dhg href
  9: 'cta_button',      // x8t9es0 7
  // ... rest of columns mapped
};

// Usage in parser:
const row = csvRow.split('","');
const adId = row[COLUMN_MAP[0]];
const adCopy = row[COLUMN_MAP[6]];
```

### Backwards Compatibility
- Existing `/` route still shows Markable demo (with hardcoded creators as fallback)
- `/danny` route unchanged
- `/api/markable/*` endpoints added as fallback (return hardcoded data)
- All existing API endpoints remain operational

### Handling Link Expiration
Meta Ad Library links expire after some time. Solution:
1. When fetching ads, set `link_status: "active"` by default
2. Add optional daily check job that samples URLs
3. Mark as `link_status: "expired"` if response is 404
4. UI grays out expired ads

---

## 🎯 Success Criteria

✅ All 3 CSVs imported (1,825 ads queryable by platform/creator)
✅ Switch between platforms in sidebar
✅ Creator grid updates when platform changes
✅ Click creator → see all ads across platforms
✅ CSV import widget works (drag-drop, shows progress)
✅ Dashboard stats accurate and real-time
✅ Data persists (survives server restart)
✅ No breaking changes to existing Markable demo or Danny page

---

## 🔄 Next Steps

1. **Confirm this plan** — any adjustments needed?
2. **Start with Week 1 tasks** — CSV parser is the hardest part, do it first
3. **Load your 3 CSVs** into Replit and test parsing
4. **Build the backend routes** — should only take a few hours once parser works
5. **Then tackle UI** — copy patterns from existing markable_demo_v3.jsx
6. **Test end-to-end** — import → filter → detail view → modal
7. **Deploy + celebrate** 🎉

---

**Document Status**: Ready to implement  
**Estimated Timeline**: 2-3 weeks for full MVP  
**Risk Level**: Low (backwards compatible, keeps existing features intact)
