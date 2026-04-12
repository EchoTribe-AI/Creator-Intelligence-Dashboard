import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import type { Express } from "express";
import fs from "fs";
import https from "https";
import http, { createServer, type Server } from "http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { storage } from "./storage";
import { getProductData, getStorefrontProducts } from "./scraper.js";
import { saveProduct, getProductsByCreator, getAllProducts, deleteProduct, saveGeneration, getGenerationsByCreator, getGenerationById, deleteGeneration } from './db.js';
import { importCSV, queryAds, getCreatorsByPlatform, getStats, readPlatformsDb, readMetaAdsDb, writeMetaAdsDb, cacheCreatorImage, extractVideoThumbnail } from './services/csv-parser.js';

const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
const CREATOR_IMAGES_DIR = path.resolve(PUBLIC_DIR, 'creator-images');

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Serve public/ assets (creator-images, etc.) at all times — dev and prod
  app.use(express.static(PUBLIC_DIR));

  // Proxy endpoint for Anthropic API
  app.post("/api/anthropic/v1/messages", async (req, res) => {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
          "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        },
        body: JSON.stringify(req.body),
      });
      
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Scraper API endpoints
  app.post('/api/product', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'url is required' });
    try {
      const product = await getProductData(url);
      res.json({ success: true, product });
    } catch (err: any) {
      console.error('Scraper error:', err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ── POST /api/storefront  ──────────────────────────────────────────────────
  // Body: { url: "https://www.amazon.com/shop/influencer-xxx/photo/amzn1.xxx" }
  // Returns: array of all products in the storefront photo collage
  app.post('/api/storefront', async (req, res) => {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'url is required' });
    }

    if (!url.includes('amazon.com/shop')) {
      return res.status(400).json({ error: 'URL must be an Amazon storefront/shop URL' });
    }

    try {
      const products = await getStorefrontProducts(url);

      if (products.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'No products found — page may not have rendered fully. Try again.',
        });
      }

      res.json({ success: true, count: products.length, products });
    } catch (err: any) {
      console.error('Storefront scraper error:', err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ── POST /api/product/save ─────────────────────────────────────────────────
  // Save a scraped product to persistent storage
  // Body: { creatorId: string, product: object }
  app.post('/api/product/save', (req, res) => {
    const { creatorId, product } = req.body;
    if (!creatorId || !product) {
      return res.status(400).json({ error: 'creatorId and product required' });
    }
    try {
      const saved = saveProduct(creatorId, product);
      res.json({ success: true, product: saved });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ── GET /api/products/:creatorId ───────────────────────────────────────────
  // Get all saved products for a specific creator
  app.get('/api/products/:creatorId', (req, res) => {
    try {
      const products = getProductsByCreator(req.params.creatorId);
      res.json({ success: true, products });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ── GET /api/products ──────────────────────────────────────────────────────
  // Get all saved products across all creators
  app.get('/api/products', (req, res) => {
    try {
      const products = getAllProducts();
      res.json({ success: true, products });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ── DELETE /api/product/:id ────────────────────────────────────────────────
  // Delete a saved product by its _id
  app.delete('/api/product/:id', (req, res) => {
    try {
      deleteProduct(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ── FAVORITES ──────────────────────────────────────────────────────────────
  app.get('/api/favorites/:creatorId', async (req, res) => {
    try {
      const favs = await storage.getFavorites(req.params.creatorId);
      res.json(favs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/favorites', async (req, res) => {
    try {
      const fav = await storage.addFavorite(req.body);
      res.json(fav);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/favorites/:id', async (req, res) => {
    try {
      await storage.deleteFavorite(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── GENERATIONS ────────────────────────────────────────────────────────────
  app.post('/api/generations', (req, res) => {
    const { creatorId, productName, productData, generatedContent } = req.body;
    if (!creatorId || !generatedContent) {
      return res.status(400).json({ error: 'creatorId and generatedContent required' });
    }
    try {
      const saved = saveGeneration(creatorId, productName, productData, generatedContent);
      res.json({ success: true, generation: saved });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/generations/:creatorId', (req, res) => {
    try {
      const generations = getGenerationsByCreator(req.params.creatorId);
      res.json({ success: true, generations });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/generation/:id', (req, res) => {
    try {
      const generation = getGenerationById(req.params.id);
      if (!generation) return res.status(404).json({ success: false, error: 'Not found' });
      res.json({ success: true, generation });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/generation/:id', (req, res) => {
    try {
      deleteGeneration(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', scraper_active: !!process.env.CRAWLBASE_JS_TOKEN });
  });

  // ── PLATFORMS ──────────────────────────────────────────────────────────────
  app.get('/api/platforms', (_req, res) => {
    try {
      const { platforms } = readPlatformsDb();
      res.json({ success: true, platforms });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ── VIDEO PROXY (CORS passthrough for canvas thumbnail capture) ────────────
  // Only allows Meta CDN URLs. Forwards Range headers so seeking works.
  app.get('/api/video-proxy', (req, res) => {
    const { url } = req.query as { url?: string };
    if (!url) return res.status(400).end();

    let decodedUrl: string;
    try { decodedUrl = decodeURIComponent(url); } catch { return res.status(400).end(); }

    // Strict allowlist: only Meta CDN
    if (!/^https?:\/\/([a-z0-9-]+\.)?fbcdn\.net\//i.test(decodedUrl)) {
      return res.status(403).end();
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    let urlObj: URL;
    try { urlObj = new URL(decodedUrl); } catch { return res.status(400).end(); }

    const client = urlObj.protocol === 'https:' ? https : http;
    const proxyHeaders: Record<string, string> = { 'User-Agent': 'Mozilla/5.0' };
    if (req.headers.range) proxyHeaders['Range'] = req.headers.range as string;

    const proxyReq = client.get(urlObj, { headers: proxyHeaders }, (proxyRes) => {
      const status = proxyRes.statusCode || 200;
      const headers: Record<string, string | string[]> = {
        'Content-Type': proxyRes.headers['content-type'] || 'video/mp4',
      };
      if (proxyRes.headers['content-length']) headers['Content-Length'] = proxyRes.headers['content-length']!;
      if (proxyRes.headers['content-range']) headers['Content-Range'] = proxyRes.headers['content-range']!;
      if (proxyRes.headers['accept-ranges']) headers['Accept-Ranges'] = proxyRes.headers['accept-ranges']!;
      res.writeHead(status, headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', () => { if (!res.headersSent) res.status(502).end(); });
    proxyReq.setTimeout(15000, () => { proxyReq.destroy(); });
    req.on('close', () => proxyReq.destroy());
  });

  // ── CACHE VIDEO THUMBNAIL (base64 canvas frame → disk + meta_ads.json) ────
  app.post('/api/meta-ads/cache-thumbnail', express.json({ limit: '2mb' }), (req, res) => {
    const { ad_key, image_data } = req.body as { ad_key?: string; image_data?: string };
    if (!ad_key || !image_data) return res.status(400).json({ error: 'ad_key and image_data required' });

    const match = image_data.match(/^data:image\/(jpeg|png);base64,(.+)$/s);
    if (!match) return res.status(400).json({ error: 'Invalid image_data' });

    const imageBuffer = Buffer.from(match[2], 'base64');
    if (imageBuffer.length < 100) return res.status(400).json({ error: 'Image too small' });

    const safeKey = ad_key.replace(/[^a-z0-9_-]/gi, '_');
    const filename = `${safeKey}.jpg`;
    const filePath = path.join(CREATOR_IMAGES_DIR, filename);

    try {
      if (!fs.existsSync(CREATOR_IMAGES_DIR)) fs.mkdirSync(CREATOR_IMAGES_DIR, { recursive: true });
      fs.writeFileSync(filePath, imageBuffer);
      const cachedPath = `/creator-images/${filename}`;

      const db = readMetaAdsDb();
      const idx = db.ads.findIndex(a => a._key === ad_key);
      if (idx >= 0 && !db.ads[idx].cached_thumbnail) {
        db.ads[idx].cached_thumbnail = cachedPath;
        writeMetaAdsDb(db);
      }

      res.json({ success: true, cached_thumbnail: cachedPath });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── META ADS IMPORT ────────────────────────────────────────────────────────
  // Client sends raw CSV as text body; platform_id comes as query param.
  app.post('/api/meta-ads/import', express.text({ limit: '10mb' }), async (req, res) => {
    const { platform_id } = req.query as { platform_id?: string };
    const csv_text = req.body as string;
    if (!platform_id || !csv_text) {
      return res.status(400).json({ error: 'platform_id query param and CSV body required' });
    }
    try {
      const { platforms } = readPlatformsDb();
      if (!platforms.find(p => p.id === platform_id)) {
        return res.status(400).json({ error: `Unknown platform: ${platform_id}` });
      }
      const result = await importCSV(csv_text, platform_id);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ── META ADS CREATORS ──────────────────────────────────────────────────────
  app.get('/api/meta-ads/creators', (req, res) => {
    const { platform } = req.query as { platform?: string };
    if (!platform) return res.status(400).json({ error: 'platform query param required' });
    try {
      const creators = getCreatorsByPlatform(platform);
      res.json({ success: true, creators });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ── META ADS SEARCH ────────────────────────────────────────────────────────
  app.get('/api/meta-ads/search', (req, res) => {
    const { platform, creator, ad_type, q, limit, offset } = req.query as Record<string, string>;
    try {
      const result = queryAds({
        platform_id: platform,
        creator_handle: creator,
        ad_type: (ad_type as 'video' | 'static') || undefined,
        search: q,
        limit: limit ? parseInt(limit, 10) : 50,
        offset: offset ? parseInt(offset, 10) : 0,
      });
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ── META ADS STATS ─────────────────────────────────────────────────────────
  app.get('/api/meta-ads/stats', (_req, res) => {
    try {
      const stats = getStats();
      res.json({ success: true, ...stats });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ── BACKFILL THUMBNAILS ────────────────────────────────────────────────────
  // POST /api/meta-ads/backfill-thumbnails
  // Processes all ads in meta_ads.json that have a video_url or image_url but
  // no cached_thumbnail. Run this on Replit while Meta CDN URLs are still fresh.
  // Streams progress as newline-delimited JSON so the client can show live updates.
  app.post('/api/meta-ads/backfill-thumbnails', async (req, res) => {
    const db = readMetaAdsDb();

    // Candidates: have a media URL but no cached thumbnail
    const candidates = db.ads.filter(a =>
      !a.cached_thumbnail && (a.video_url || a.image_url)
    );

    res.setHeader('Content-Type', 'application/x-ndjson');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.flushHeaders();

    const write = (obj: object) => res.write(JSON.stringify(obj) + '\n');
    write({ type: 'start', total: candidates.length });

    let done = 0;
    let succeeded = 0;
    let failed = 0;

    for (const ad of candidates) {
      const slug = `${ad.creator_handle}_${ad.library_id}`.replace(/[^a-z0-9_-]/gi, '_');
      let result: string | null = null;

      if (ad.video_url) {
        result = await extractVideoThumbnail(ad.video_url, slug);
      } else if (ad.image_url) {
        result = await cacheCreatorImage(ad.image_url, slug);
      }

      if (result) {
        ad.cached_thumbnail = result;
        succeeded++;
      } else {
        failed++;
      }

      done++;
      if (done % 10 === 0 || done === candidates.length) {
        write({ type: 'progress', done, total: candidates.length, succeeded, failed });
      }
    }

    writeMetaAdsDb(db);
    write({ type: 'done', done, succeeded, failed });
    res.end();
  });

  if (process.env.NODE_ENV === 'production') {
    app.get(['/danny', '/danny/'], (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), "dist/public/index.html"));
    });
    app.get(['/brands', '/brands/'], (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), "dist/public/index.html"));
    });
  }

  return httpServer;
}
