import express from 'express';
import cors from 'cors';
import { getProductData } from './scraper.js';

const app = express();
app.use(cors());
app.use(express.json());

// ── POST /api/product  ─────────────────────────────────────────────────────
// Body: { url: "https://amzn.to/xyz" or full Amazon URL }
// Returns: product title, images, bullets, price, brand, ASIN
app.post('/api/product', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'url is required' });
  }

  try {
    const product = await getProductData(url);
    res.json({ success: true, product });
  } catch (err) {
    console.error('Scraper error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/health ────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', crawlbase: !!process.env.CRAWLBASE_JS_TOKEN });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Scraper API running on port ${PORT}`));
