import path from "path";
import { fileURLToPath } from "url";
import type { Express } from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getProductData, getStorefrontProducts } from "./scraper.js";
import { saveProduct, getProductsByCreator, getAllProducts, deleteProduct, saveGeneration, getGenerationsByCreator, getGenerationById, deleteGeneration } from './db.js';

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
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

  // Serve index.html for the /danny route to allow React to handle it
  app.get('/danny', (_req, res) => {
    res.sendFile(path.resolve(process.cwd(), "dist/public/index.html"));
  });

  return httpServer;
}
