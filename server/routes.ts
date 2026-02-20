import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getProductData } from "./scraper.js";

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

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', crawlbase: !!process.env.CRAWLBASE_JS_TOKEN });
  });

  return httpServer;
}
