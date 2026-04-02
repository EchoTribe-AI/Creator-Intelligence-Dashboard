import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

// ── Types ────────────────────────────────────────────────────────────────────

export interface Platform {
  id: string;
  name: string;
  color: string;
  logo: string;
  description: string;
  created_at: string;
}

export interface MetaAd {
  _key: string;              // `${platform_id}_${library_id}`
  library_id: string;        // stripped "Library ID: " prefix
  platform_id: string;
  creator_handle: string;    // slug from FB URL e.g. "aloprofile" (no @ prefix)
  creator_display_name: string; // formatted: "aloprofile" → "Aloprofile"
  profile_image_url: string | null;
  facebook_page_url: string | null;
  ad_copy: string;           // "Ad Details" column
  video_url: string | null;
  image_url: string | null;
  cta_url: string | null;
  ad_type: 'video' | 'static'; // video if Video URL non-empty
  start_date: string;        // stripped "Started running on " prefix
  imported_at: string;       // ISO timestamp
}

export interface ImportResult {
  success: boolean;
  platform_id: string;
  imported: number;
  new_count: number;
  updated: number;
  skipped: number;
  timestamp: string;
  error?: string;
}

interface MetaAdsDb {
  ads: MetaAd[];
  last_import: string | null;
  import_log: Array<{
    platform_id: string;
    imported: number;
    new_count: number;
    updated: number;
    timestamp: string;
  }>;
}

export interface CreatorSummary {
  handle: string;
  display_name: string;
  profile_image_url: string | null;
  facebook_page_url: string | null;
  ad_count: number;
  video_count: number;
  static_count: number;
  latest_ad_date: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const META_ADS_PATH = path.resolve(process.cwd(), 'server', 'data', 'meta_ads.json');
const PLATFORMS_PATH = path.resolve(process.cwd(), 'server', 'data', 'platforms.json');
const MAX_ADS_PER_PLATFORM = 1000;

// ── Platforms DB ─────────────────────────────────────────────────────────────

export function readPlatformsDb(): { platforms: Platform[] } {
  try {
    const raw = fs.readFileSync(PLATFORMS_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { platforms: [] };
  }
}

// ── Meta Ads DB ──────────────────────────────────────────────────────────────

function ensureMetaAdsDb(): void {
  const dir = path.dirname(META_ADS_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(META_ADS_PATH)) {
    fs.writeFileSync(META_ADS_PATH, JSON.stringify({ ads: [], last_import: null, import_log: [] }, null, 2));
  }
}

function readMetaAdsDb(): MetaAdsDb {
  ensureMetaAdsDb();
  try {
    const raw = fs.readFileSync(META_ADS_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { ads: [], last_import: null, import_log: [] };
  }
}

function writeMetaAdsDb(data: MetaAdsDb): void {
  ensureMetaAdsDb();
  fs.writeFileSync(META_ADS_PATH, JSON.stringify(data, null, 2));
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export function extractCreatorHandle(fbUrl: string): string | null {
  if (!fbUrl || !fbUrl.trim()) return null;
  return fbUrl.replace(/\/$/, '').split('/').pop()?.toLowerCase() ?? null;
}

export function formatCreatorHandle(slug: string): string {
  if (!slug) return slug;
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

// ── CSV Parsing ──────────────────────────────────────────────────────────────

export function parseMetaAdCSV(csvText: string, platformId: string): { ads: MetaAd[]; skipped: number } {
  const result = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  const rows = result.data as Record<string, string>[];

  const ads: MetaAd[] = [];
  let skipped = 0;

  for (const row of rows) {
    const rawLibraryId = (row['Meta Library ID'] ?? '').trim();
    const rawStartDate = (row['Started Date'] ?? '').trim();
    const profileImageUrl = (row['Profile Image'] ?? '').trim() || null;
    const fbPageUrl = (row['Influencer Facebook Page'] ?? '').trim() || null;
    const adCopy = (row['Ad Details'] ?? '').trim();
    const videoUrl = (row['Video URL'] ?? '').trim() || null;
    const imageUrl = (row['Content Image URL'] ?? '').trim() || null;
    const ctaUrl = (row['CTA Shop Now URL'] ?? '').trim() || null;

    // Skip rows with no meaningful content
    if (!adCopy && !videoUrl && !imageUrl) {
      skipped++;
      continue;
    }

    const library_id = rawLibraryId.replace(/^Library ID:\s*/i, '');
    const start_date = rawStartDate.replace(/^Started running on\s*/i, '');

    const handle = fbPageUrl ? extractCreatorHandle(fbPageUrl) : null;
    const creator_handle = handle ?? 'unknown';
    const creator_display_name = formatCreatorHandle(creator_handle);

    const ad: MetaAd = {
      _key: `${platformId}_${library_id}`,
      library_id,
      platform_id: platformId,
      creator_handle,
      creator_display_name,
      profile_image_url: profileImageUrl,
      facebook_page_url: fbPageUrl,
      ad_copy: adCopy,
      video_url: videoUrl,
      image_url: imageUrl,
      cta_url: ctaUrl,
      ad_type: videoUrl ? 'video' : 'static',
      start_date,
      imported_at: new Date().toISOString(),
    };

    ads.push(ad);
  }

  return { ads, skipped };
}

// ── Import ────────────────────────────────────────────────────────────────────

export async function importCSV(csvText: string, platformId: string): Promise<ImportResult> {
  ensureMetaAdsDb();

  const { ads: parsedAds, skipped } = parseMetaAdCSV(csvText, platformId);
  const db = readMetaAdsDb();

  let new_count = 0;
  let updated = 0;

  for (const ad of parsedAds) {
    const existingIndex = db.ads.findIndex(a => a._key === ad._key);
    if (existingIndex >= 0) {
      db.ads[existingIndex] = ad; // replace in place (update)
      updated++;
    } else {
      db.ads.unshift(ad); // add to front (most recent first)
      new_count++;
    }
  }

  // Cap this platform's ads at MAX_ADS_PER_PLATFORM (most recent first — already unshifted)
  const thisPlatformAds = db.ads.filter(a => a.platform_id === platformId).slice(0, MAX_ADS_PER_PLATFORM);
  const otherPlatformAds = db.ads.filter(a => a.platform_id !== platformId);

  db.ads = [...thisPlatformAds, ...otherPlatformAds];

  const timestamp = new Date().toISOString();
  const imported = new_count + updated;

  db.last_import = timestamp;
  db.import_log.unshift({ platform_id: platformId, imported, new_count, updated, timestamp });

  writeMetaAdsDb(db);

  return {
    success: true,
    platform_id: platformId,
    imported,
    new_count,
    updated,
    skipped,
    timestamp,
  };
}

// ── Query ─────────────────────────────────────────────────────────────────────

export function queryAds(params: {
  platform_id?: string;
  creator_handle?: string;
  ad_type?: 'video' | 'static';
  search?: string;
  limit?: number;
  offset?: number;
}): { ads: MetaAd[]; total: number } {
  const db = readMetaAdsDb();
  const { platform_id, creator_handle, ad_type, search, limit = 50, offset = 0 } = params;

  let filtered = db.ads;

  if (platform_id) {
    filtered = filtered.filter(a => a.platform_id === platform_id);
  }
  if (creator_handle) {
    filtered = filtered.filter(a => a.creator_handle === creator_handle);
  }
  if (ad_type) {
    filtered = filtered.filter(a => a.ad_type === ad_type);
  }
  if (search) {
    const lower = search.toLowerCase();
    filtered = filtered.filter(a => a.ad_copy.toLowerCase().includes(lower));
  }

  const total = filtered.length;
  const ads = filtered.slice(offset, offset + limit);

  return { ads, total };
}

// ── Creators by Platform ──────────────────────────────────────────────────────

export function getCreatorsByPlatform(platformId: string): CreatorSummary[] {
  const db = readMetaAdsDb();
  const platformAds = db.ads.filter(a => a.platform_id === platformId);

  const groups = new Map<string, MetaAd[]>();
  for (const ad of platformAds) {
    const existing = groups.get(ad.creator_handle) ?? [];
    existing.push(ad);
    groups.set(ad.creator_handle, existing);
  }

  const summaries: CreatorSummary[] = [];

  for (const [handle, ads] of Array.from(groups.entries())) {
    const first = ads[0];
    const video_count = ads.filter(a => a.ad_type === 'video').length;
    const static_count = ads.filter(a => a.ad_type === 'static').length;

    // Find the latest start_date (lexicographic sort works for "Month DD, YYYY" if consistent,
    // but we store the raw stripped string — sort descending and take first)
    const latest_ad_date = ads
      .map(a => a.start_date)
      .filter(Boolean)
      .sort()
      .reverse()[0] ?? '';

    summaries.push({
      handle,
      display_name: first.creator_display_name,
      profile_image_url: first.profile_image_url,
      facebook_page_url: first.facebook_page_url,
      ad_count: ads.length,
      video_count,
      static_count,
      latest_ad_date,
    });
  }

  summaries.sort((a, b) => b.ad_count - a.ad_count);

  return summaries;
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export function getStats(): {
  total_ads: number;
  by_platform: Record<string, { ad_count: number; creator_count: number }>;
  total_creators: number;
  last_import: string | null;
  import_log: MetaAdsDb['import_log'];
} {
  const db = readMetaAdsDb();

  const by_platform: Record<string, { ad_count: number; creator_count: number }> = {};
  const allCreatorHandles = new Set<string>();

  for (const ad of db.ads) {
    if (!by_platform[ad.platform_id]) {
      by_platform[ad.platform_id] = { ad_count: 0, creator_count: 0 };
    }
    by_platform[ad.platform_id].ad_count++;
    allCreatorHandles.add(ad.creator_handle);
  }

  // Per-platform unique creator counts
  for (const [platformId, entry] of Object.entries(by_platform)) {
    const platformCreators = new Set(
      db.ads.filter(a => a.platform_id === platformId).map(a => a.creator_handle)
    );
    entry.creator_count = platformCreators.size;
  }

  return {
    total_ads: db.ads.length,
    by_platform,
    total_creators: allCreatorHandles.size,
    last_import: db.last_import,
    import_log: db.import_log,
  };
}
