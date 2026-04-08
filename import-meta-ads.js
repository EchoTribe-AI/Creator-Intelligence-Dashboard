/**
 * import-meta-ads.js
 *
 * Run from the project root:
 *   node import-meta-ads.js
 *
 * CSV files expected in the project root:
 *   Markable_Ads.csv  |  urlgenius-ads.csv  |  Mavely-ads.csv
 *
 * Output: server/data/meta_ads.json
 * Deduplication key: _key = `${platform_id}_${library_id}`
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── CONFIG ────────────────────────────────────────────────────────────────────
const CSV_FILES = [
  { file: 'Markable_Ads.csv',  platformId: 'markable'  },
  { file: 'urlgenius-ads.csv', platformId: 'urlgenius' },
  { file: 'Mavely-ads.csv',    platformId: 'mavely'    },
];

// Server reads from here — keep in sync with csv-parser.ts META_ADS_PATH
const OUTPUT_PATH = path.join(__dirname, 'server', 'data', 'meta_ads.json');

// ── HELPERS ───────────────────────────────────────────────────────────────────
const cleanLibraryId  = (raw) => (raw ?? '').replace(/^Library ID:\s*/i, '').trim();
const cleanStartDate  = (raw) => (raw ?? '').replace(/^Started running on\s*/i, '').trim();
const cleanStr        = (raw) => (raw ?? '').trim() || null;

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

// ── PARSER ────────────────────────────────────────────────────────────────────
// All 3 CSVs use CSS-class column headers (x8t9es0 2, _4ik4, etc.).
// We access by column name — relax_column_count handles varying widths.
function parseCSVFile(filePath, platformId) {
  const raw = fs.readFileSync(filePath, 'utf-8').replace(/^\uFEFF/, ''); // strip BOM
  const rows = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  });

  const ads = [];
  let skipped = 0;

  for (const row of rows) {
    const rawLibraryId = (row['x8t9es0 2'] ?? '').trim();

    // Only real ad rows begin with "Library ID:"
    if (!rawLibraryId.startsWith('Library ID:')) { skipped++; continue; }

    const library_id         = cleanLibraryId(rawLibraryId);
    const start_date         = cleanStartDate(row['x8t9es0 3']);
    const profile_image_url  = cleanStr(row['_8nqq src']);
    const facebook_page_url  = cleanStr(row['xt0psk2 href']);
    const ad_copy            = (row['_4ik4'] ?? '').trim();
    const video_url          = cleanStr(row['x1lliihq src']);
    // x15mokao src = content image (Mavely only); falls back to null for others
    const image_url          = cleanStr(row['x15mokao src']);
    const cta_url            = cleanStr(row['x1hl2dhg href']);
    const landing_url        = extractLandingUrl(cta_url);

    // Skip rows with no meaningful content
    if (!ad_copy && !video_url && !image_url) { skipped++; continue; }

    const creator_handle      = extractCreatorHandle(facebook_page_url);
    // x8t9es0 6 holds display name in Markable; falls back to slug for others
    const rawName             = (row['x8t9es0 6'] ?? '').trim();
    const creator_display_name =
      rawName && !rawName.startsWith('Library ID:') && !/^\d/.test(rawName)
        ? rawName
        : creator_handle.charAt(0).toUpperCase() + creator_handle.slice(1);

    ads.push({
      _key:                 `${platformId}_${library_id}`,
      library_id,
      platform_id:          platformId,
      creator_handle,
      creator_display_name,
      profile_image_url,
      facebook_page_url,
      ad_copy,
      video_url,
      image_url,
      cta_url,
      cached_thumbnail:     null,
      landing_url,
      ad_type:              video_url ? 'video' : 'static',
      start_date,
      imported_at:          new Date().toISOString(),
    });
  }

  return { ads, skipped };
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
function main() {
  const seen     = new Map(); // _key → ad
  const importLog = [];
  const timestamp = new Date().toISOString();

  for (const { file, platformId } of CSV_FILES) {
    const filePath = path.join(__dirname, file);

    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found, skipping: ${file}`);
      continue;
    }

    console.log(`📂 Parsing ${file} (${platformId})…`);

    let result;
    try {
      result = parseCSVFile(filePath, platformId);
    } catch (err) {
      console.error(`❌ Failed to parse ${file}:`, err.message);
      continue;
    }

    let new_count = 0;
    let updated   = 0;

    for (const ad of result.ads) {
      if (seen.has(ad._key)) {
        updated++;          // cross-file duplicate — keep first occurrence
      } else {
        seen.set(ad._key, ad);
        new_count++;
      }
    }

    const imported = new_count + updated;
    importLog.unshift({ platform_id: platformId, imported, new_count, updated, timestamp });

    console.log(`   ✅ ${new_count} new | ${updated} dupes skipped | ${result.skipped} non-ad rows`);
  }

  const allAds = Array.from(seen.values());

  // Ensure output directory exists
  const outDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Write in MetaAdsDb format (matches what csv-parser.ts / readMetaAdsDb expects)
  const output = {
    ads:         allAds,
    last_import: timestamp,
    import_log:  importLog,
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));

  const creatorSet = new Set(allAds.map(a => `${a.platform_id}:${a.creator_handle}`));

  console.log('\n──────────────────────────────────────────────────');
  console.log(`✅  ${allAds.length} total ads | ${creatorSet.size} unique creator+platform combos`);
  console.log(`📄  Output → ${OUTPUT_PATH}`);
  console.log('──────────────────────────────────────────────────\n');
  console.log('Platform breakdown:');
  for (const entry of importLog) {
    console.log(`  ${entry.platform_id}: ${entry.new_count} ads`);
  }
}

main();
