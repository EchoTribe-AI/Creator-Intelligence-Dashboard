/**
 * import-meta-ads.js
 *
 * Run from the project root:
 *   node import-meta-ads.js
 *
 * Single CSV file expected in the project root: creatorads_001.csv
 * Columns: Meta Library ID, Started Date, Influencer Facebook Page,
 *          Ad Details, Video URL, Content Image URL, CTA Shop Now URL, Ad Company
 *
 * Output: server/data/meta_ads.json
 * Deduplication key: _key = `${platform_id}_${library_id}`
 * Images cached to: public/creator-images/{handle}_{library_id}.jpg
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── CONFIG ────────────────────────────────────────────────────────────────────
const CSV_FILE = 'creatorads_001.csv';

const BRAND_TO_PLATFORM = {
  'Markable':          'markable',
  'URLGENI.US':        'urlgenius',
  'Mavely':            'mavely',
  'Creator Finds IQ':  'creator-finds-iq',
};

const OUTPUT_PATH         = path.join(__dirname, 'server', 'data', 'meta_ads.json');
const CREATOR_IMAGES_DIR  = path.join(__dirname, 'public', 'creator-images');

// ── HELPERS ───────────────────────────────────────────────────────────────────
const cleanLibraryId = (raw) => (raw ?? '').replace(/^Library ID:\s*/i, '').trim();
const cleanStartDate = (raw) => (raw ?? '').replace(/^Started running on\s*/i, '').trim();
const cleanStr       = (raw) => (raw ?? '').trim() || null;

function extractUrlHost(url) {
  if (!url?.trim()) return null;
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
}

function extractVideoExpiryFromUrl(url) {
  if (!url?.trim()) return null;
  try {
    const urlObj = new URL(url);
    const oeParam = urlObj.searchParams.get('oe');
    if (oeParam && /^\d+$/.test(oeParam)) {
      const timestamp = parseInt(oeParam, 10) * 1000;
      return new Date(timestamp).toISOString();
    }
  } catch {}
  return null;
}

function buildAdLibraryUrl(metaLibraryId) {
  if (!metaLibraryId?.trim()) return null;
  return `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&media_type=all&search_type=keyword_exactmatch&media_adv_details=all&view_all_by_impression_count=true&library_id=${metaLibraryId}`;
}

function extractCreatorHandle(fbUrl) {
  if (!fbUrl) return 'unknown';
  const slug = fbUrl.replace(/\/$/, '').split('/').pop() ?? '';
  return slug.toLowerCase() || 'unknown';
}

function extractLandingUrl(rawUrl) {
  if (!rawUrl) return null;
  const url = rawUrl.trim();
  try {
    if (url.includes('l.facebook.com') || url.includes('facebook.com/l.php')) {
      const parsed = new URL(url);
      const u = parsed.searchParams.get('u');
      if (u) return decodeURIComponent(u).split('?')[0];
    }
    return url.split('?')[0];
  } catch {
    return url;
  }
}

/**
 * Download imageUrl and save to CREATOR_IMAGES_DIR/{slug}.jpg.
 * Returns the public path /creator-images/{slug}.jpg, or null on failure.
 * Idempotent — skips if file already exists.
 */
async function cacheImage(imageUrl, slug) {
  if (!imageUrl) return null;
  try {
    if (!fs.existsSync(CREATOR_IMAGES_DIR)) {
      fs.mkdirSync(CREATOR_IMAGES_DIR, { recursive: true });
    }
    const filename = `${slug}.jpg`;
    const filePath = path.join(CREATOR_IMAGES_DIR, filename);
    if (fs.existsSync(filePath)) return `/creator-images/${filename}`;

    await new Promise((resolve, reject) => {
      const urlObj = new URL(imageUrl.trim());
      const client = urlObj.protocol === 'https:' ? https : http;
      const req = client.get(urlObj, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          res.resume();
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        const fileStream = fs.createWriteStream(filePath);
        res.pipe(fileStream);
        fileStream.on('finish', () => { fileStream.close(); resolve(); });
        fileStream.on('error', (err) => { try { fs.unlinkSync(filePath); } catch {} reject(err); });
      });
      req.on('error', reject);
      req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')); });
    });

    return `/creator-images/${filename}`;
  } catch (err) {
    return null;
  }
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
async function main() {
  const filePath = path.join(__dirname, CSV_FILE);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${CSV_FILE}`);
    process.exit(1);
  }

  console.log(`📂 Parsing ${CSV_FILE}…`);
  const raw = fs.readFileSync(filePath, 'utf-8').replace(/^\uFEFF/, '');
  const rows = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  });

  const seen    = new Map(); // _key → ad
  let skipped   = 0;
  let cached    = 0;
  let cacheErr  = 0;

  // Per-platform counters
  const platformCounts = {};
  const now = new Date().toISOString();

  for (const row of rows) {
    const rawLibraryId = (row['Meta Library ID'] ?? '').trim();
    if (!rawLibraryId.startsWith('Library ID:')) { skipped++; continue; }

    const library_id    = cleanLibraryId(rawLibraryId);
    const meta_library_id = library_id; // numeric ID
    const rawStartDate = row['Started Date'] ?? '';
    const start_date    = cleanStartDate(rawStartDate);
    const started_date_raw = rawStartDate.trim();
    const fbPageUrl     = cleanStr(row['Influencer Facebook Page']);
    const ad_copy       = (row['Ad Details'] ?? '').trim();
    const ad_company    = (row['Ad Company'] ?? '').trim();
    const video_url     = cleanStr(row['Video URL']);
    const content_image_url = cleanStr(row['Content Image URL']);
    const image_url     = content_image_url; // alias
    const cta_shop_now_url = cleanStr(row['CTA Shop Now URL']);
    const cta_url       = cta_shop_now_url;
    const landing_url   = extractLandingUrl(cta_url);
    const brand         = ad_company;
    if (!brand) { skipped++; continue; }
    const platform_id   = BRAND_TO_PLATFORM[brand] ?? brand.toLowerCase().replace(/\s+/g, '-');

    // Skip rows with no meaningful content
    if (!ad_copy && !video_url && !image_url) { skipped++; continue; }

    const creator_handle = extractCreatorHandle(fbPageUrl);

    // For numeric page IDs (e.g. 100025235762680), use ID as handle.
    // Display name: title-case slug for named handles, "Page {id}" for pure numeric.
    const isNumericHandle = /^\d+$/.test(creator_handle);
    const creator_display_name = isNumericHandle
      ? `Page ${creator_handle}`
      : creator_handle.charAt(0).toUpperCase() + creator_handle.slice(1);

    const _key = `${platform_id}_${library_id}`;
    platformCounts[platform_id] = (platformCounts[platform_id] ?? 0) + 1;

    // Derived media tracking fields
    const video_url_host = extractUrlHost(video_url);
    const video_url_expires_at = extractVideoExpiryFromUrl(video_url);
    const media_type = video_url ? 'video' : (image_url ? 'image' : 'unknown');
    const ad_library_url = buildAdLibraryUrl(meta_library_id);

    if (!seen.has(_key)) {
      seen.set(_key, {
        // Legacy fields (for backwards compat)
        _key,
        library_id,
        platform_id,
        creator_handle,
        creator_display_name,
        profile_image_url: null,       // not present in this CSV format
        facebook_page_url: fbPageUrl,
        ad_copy,
        video_url,
        image_url,
        cta_url,
        cached_thumbnail: null,        // filled in below
        landing_url,
        ad_type: video_url ? 'video' : 'static',
        start_date,
        imported_at: now,

        // New stable Meta fields for future media URL refreshes
        meta_library_id,
        started_date_raw,
        started_date: start_date || null,
        influencer_facebook_page_url: fbPageUrl,
        ad_details: ad_copy,
        content_image_url,
        cta_shop_now_url,
        ad_company,

        // Derived media tracking fields
        ad_library_url,
        video_url_host,
        video_url_expires_at,
        media_type,
        last_media_refresh_at: null,
        media_refresh_status: null,
        created_at: now,
        updated_at: now,
      });
    }
  }

  const allAds = Array.from(seen.values());

  // ── Cache static images ───────────────────────────────────────────────────
  console.log(`\n🖼️  Caching static ad images (${allAds.filter(a => a.image_url).length} to download)…`);
  for (const ad of allAds) {
    if (!ad.image_url) continue;
    const slug = `${ad.creator_handle}_${ad.library_id}`.replace(/[^a-z0-9_-]/gi, '_');
    const localPath = await cacheImage(ad.image_url, slug);
    if (localPath) {
      ad.cached_thumbnail = localPath;
      cached++;
    } else {
      cacheErr++;
    }
  }

  // ── Write output ──────────────────────────────────────────────────────────
  const outDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const timestamp = new Date().toISOString();
  const importLog = Object.entries(platformCounts).map(([platform_id, count]) => ({
    platform_id,
    imported: count,
    new_count: count,
    updated: 0,
    timestamp,
  }));

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify({
    ads:         allAds,
    last_import: timestamp,
    import_log:  importLog,
  }, null, 2));

  const creatorSet = new Set(allAds.map(a => `${a.platform_id}:${a.creator_handle}`));

  console.log('\n──────────────────────────────────────────────────');
  console.log(`✅  ${allAds.length} total ads | ${creatorSet.size} unique creator+platform combos`);
  console.log(`🖼️   ${cached} images cached | ${cacheErr} cache failures`);
  console.log(`📄  Output → ${OUTPUT_PATH}`);
  console.log('──────────────────────────────────────────────────\n');
  console.log('Platform breakdown:');
  for (const [pid, count] of Object.entries(platformCounts)) {
    console.log(`  ${pid}: ${count} ads`);
  }
}

main().catch(err => { console.error('❌ Fatal:', err); process.exit(1); });
