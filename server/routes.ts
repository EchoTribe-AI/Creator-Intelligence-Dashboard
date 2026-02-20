import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getProductData, getStorefrontProducts } from "./scraper.js";

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

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', scraper_active: !!process.env.CRAWLBASE_JS_TOKEN });
  });

  return httpServer;
}
