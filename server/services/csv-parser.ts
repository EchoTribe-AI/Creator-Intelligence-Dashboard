import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import https from 'https';
import http from 'http';

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
  cached_thumbnail: string | null; // local path e.g. /creator-images/{slug}.jpg
  landing_url: string | null;      // decoded real destination URL
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
const CREATOR_IMAGES_DIR = path.resolve(process.cwd(), 'public', 'creator-images');
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

/**
 * Decode a landing page URL. Handles Facebook-wrapped URLs like
 * https://l.facebook.com/l.php?u=<encoded> by extracting and decoding the u= param.
 * Returns the clean destination URL, or null if rawUrl is falsy.
 */
export function extractLandingUrl(rawUrl: string | null): string | null {
  if (!rawUrl || !rawUrl.trim()) return null;
  const url = rawUrl.trim();
  try {
    if (url.includes('l.facebook.com') || url.includes('facebook.com/l.php')) {
      const parsed = new URL(url);
      const u = parsed.searchParams.get('u');
      if (u) {
        const decoded = decodeURIComponent(u);
        return decoded.split('?')[0];
      }
    }
    return url.split('?')[0];
  } catch {
    return url;
  }
}

/**
 * Fetch an image from imageUrl and save it to CREATOR_IMAGES_DIR/{slug}.jpg.
 * Returns the public URL path /creator-images/{slug}.jpg on success, null on failure.
 * Idempotent: skips the fetch if the file already exists and is a valid image.
 * Rejects redirect wrappers (l.facebook.com/l.php) and validates JPEG/PNG magic bytes.
 */
export async function cacheCreatorImage(imageUrl: string, slug: string): Promise<string | null> {
  if (!imageUrl || !imageUrl.trim()) return null;
  const trimmed = imageUrl.trim();

  // Skip Facebook redirect wrapper URLs — they are CTA links, not images
  if (trimmed.includes('l.facebook.com') || trimmed.includes('/l.php')) return null;
  // Skip non-http URLs
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return null;

  try {
    if (!fs.existsSync(CREATOR_IMAGES_DIR)) {
      fs.mkdirSync(CREATOR_IMAGES_DIR, { recursive: true });
    }
    const filename = `${slug}.jpg`;
    const filePath = path.join(CREATOR_IMAGES_DIR, filename);

    // If cached file exists, validate it is a real image before trusting it
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      if (stat.size > 0) {
        const buf = Buffer.alloc(4);
        const fd = fs.openSync(filePath, 'r');
        fs.readSync(fd, buf, 0, 4, 0);
        fs.closeSync(fd);
        const isJpeg = buf[0] === 0xFF && buf[1] === 0xD8;
        const isPng  = buf[0] === 0x89 && buf[1] === 0x50;
        if (isJpeg || isPng) return `/creator-images/${filename}`;
      }
      // Invalid cached file — delete and re-fetch
      fs.unlinkSync(filePath);
    }

    await new Promise<void>((resolve, reject) => {
      const urlObj = new URL(trimmed);
      const client = urlObj.protocol === 'https:' ? https : http;
      const req = client.get(urlObj, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if (res.statusCode && (res.statusCode >= 400 || res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 303)) {
          res.resume();
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        const contentType = res.headers['content-type'] ?? '';
        if (!contentType.startsWith('image/')) {
          res.resume();
          reject(new Error(`Not an image: ${contentType}`));
          return;
        }
        const fileStream = fs.createWriteStream(filePath);
        res.pipe(fileStream);
        fileStream.on('finish', () => { fileStream.close(); resolve(); });
        fileStream.on('error', (err) => { fs.unlink(filePath, () => {}); reject(err); });
      });
      req.on('error', reject);
      req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')); });
    });

    // Final validation: confirm the saved file is a real image
    const stat = fs.statSync(filePath);
    if (stat.size > 0) {
      const buf = Buffer.alloc(4);
      const fd = fs.openSync(filePath, 'r');
      fs.readSync(fd, buf, 0, 4, 0);
      fs.closeSync(fd);
      const isJpeg = buf[0] === 0xFF && buf[1] === 0xD8;
      const isPng  = buf[0] === 0x89 && buf[1] === 0x50;
      if (isJpeg || isPng) return `/creator-images/${filename}`;
    }
    fs.unlink(filePath, () => {});
    return null;
  } catch (err: any) {
    console.warn(`[image-cache] Failed to cache image for ${slug}: ${err.message}`);
    return null;
  }
}

// ── CSV Parsing ──────────────────────────────────────────────────────────────

/**
 * Detect if a CSV row uses Markable readable headers or raw CSS-class column names,
 * then return a normalized row with readable column names in both cases.
 */
function normalizeRow(row: Record<string, string>): Record<string, string> {
  if ('Ad Details' in row || 'Meta Library ID' in row) {
    return row; // Already Markable-style readable headers
  }
  // Mavely / URLGenius CSS-class column names
  return {
    'Meta Library ID':          row['x8t9es0 2']     ?? '',
    'Started Date':             row['x8t9es0 3']     ?? '',
    'Profile Image':            row['_8nqq src']     ?? '',
    'Influencer Facebook Page': row['xt0psk2 href']  ?? '',
    'Ad Details':               row['_4ik4']          ?? '',
    'Video URL':                row['x1lliihq src']  ?? '',
    'Content Image URL':        row['x15mokao src']  ?? '',
    '_raw_image_src':           row['_8nqq src']     ?? '', // profile image for thumbnail caching
    '_raw_cta_href':            row['x1hl2dhg href'] ?? '', // raw landing URL (may be FB-wrapped)
    'CTA Shop Now URL':         row['x1hl2dhg href'] ?? '',
  };
}

export function parseMetaAdCSV(csvText: string, platformId: string): { ads: MetaAd[]; skipped: number } {
  const result = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  const rows = result.data as Record<string, string>[];

  const ads: MetaAd[] = [];
  let skipped = 0;

  // Detect format from first row
  const firstRow = rows[0] ?? {};
  const isMarkable = 'Ad Details' in firstRow || 'Meta Library ID' in firstRow;

  for (const rawRow of rows) {
    const row = normalizeRow(rawRow);

    const rawLibraryId = (row['Meta Library ID'] ?? '').trim();
    const rawStartDate = (row['Started Date'] ?? '').trim();
    const profileImageUrl = (row['Profile Image'] ?? '').trim() || null;
    const fbPageUrl = (row['Influencer Facebook Page'] ?? '').trim() || null;
    const adCopy = (row['Ad Details'] ?? '').trim();
    const videoUrl = (row['Video URL'] ?? '').trim() || null;

    // Image URL to use for caching:
    // - Markable: Content Image URL (already a content image)
    // - Mavely/URLGenius: _8nqq src (profile image used as thumbnail)
    const imageUrl = isMarkable
      ? ((row['Content Image URL'] ?? '').trim() || null)
      : ((row['_raw_image_src'] ?? row['Profile Image'] ?? '').trim() || null);

    // Raw CTA/landing URL — may be Facebook-wrapped for non-Markable
    const rawCtaUrl = isMarkable
      ? ((row['CTA Shop Now URL'] ?? '').trim() || null)
      : ((row['_raw_cta_href'] ?? row['CTA Shop Now URL'] ?? '').trim() || null);

    const ctaUrl = rawCtaUrl;
    const landing_url = extractLandingUrl(rawCtaUrl);

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
      cached_thumbnail: null, // populated by importCSV after async caching
      landing_url,
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

  // Cache images for all ads that have an image_url
  for (const ad of parsedAds) {
    if (ad.image_url) {
      const slug = ad.library_id
        ? `${ad.creator_handle}_${ad.library_id}`.replace(/[^a-z0-9_-]/gi, '_')
        : `${ad.creator_handle}_${Date.now()}`;
      ad.cached_thumbnail = await cacheCreatorImage(ad.image_url, slug);
    }
  }

  let new_count = 0;
  let updated = 0;

  for (const ad of parsedAds) {
    const existingIndex = db.ads.findIndex(a => a._key === ad._key);
    if (existingIndex >= 0) {
      // Preserve existing cached_thumbnail if new import didn't produce one
      if (!ad.cached_thumbnail && db.ads[existingIndex].cached_thumbnail) {
        ad.cached_thumbnail = db.ads[existingIndex].cached_thumbnail;
      }
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
