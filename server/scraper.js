import axios from 'axios';
import * as cheerio from 'cheerio';

const CRAWLBASE_JS_TOKEN = process.env.CRAWLBASE_JS_TOKEN;

// ── Resolve affiliate short URL to full Amazon URL ─────────────────────────
async function resolveAffiliateUrl(url) {
  try {
    const res = await axios.get(url, {
      maxRedirects: 5,
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    return res.request.res.responseUrl || url;
  } catch (e) {
    // Even if request fails, axios may have followed redirects
    if (e.request?.res?.responseUrl) return e.request.res.responseUrl;
    return url;
  }
}

// ── Extract ASIN from Amazon URL ───────────────────────────────────────────
function extractAsin(url) {
  const patterns = [
    /\/dp\/([A-Z0-9]{10})/,
    /\/gp\/product\/([A-Z0-9]{10})/,
    /\/product\/([A-Z0-9]{10})/,
    /\/ASIN\/([A-Z0-9]{10})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// ── Scrape Amazon product page via Crawlbase JS token ─────────────────────
async function scrapeAmazonProduct(amazonUrl) {
  const crawlbaseUrl = `https://api.crawlbase.com/?token=${CRAWLBASE_JS_TOKEN}&url=${encodeURIComponent(amazonUrl)}&wait=3000&ajax_wait=true`;

  const response = await axios.get(crawlbaseUrl, { timeout: 30000 });
  const html = response.data;
  const $ = cheerio.load(html);

  // ── Title ──────────────────────────────────────────────────────────────
  const title =
    $('#productTitle').text().trim() ||
    $('h1.a-size-large').text().trim() ||
    $('h1').first().text().trim();

  // ── Price ──────────────────────────────────────────────────────────────
  const price =
    $('.a-price .a-offscreen').first().text().trim() ||
    $('#priceblock_ourprice').text().trim() ||
    $('#priceblock_dealprice').text().trim() ||
    $('.a-price-whole').first().text().trim();

  // ── Hero image ─────────────────────────────────────────────────────────
  // Amazon loads images via JS — look for the data attribute first
  let heroImage = '';
  const imgData = $('#imgTagWrapperId img, #landingImage, #main-image').first();
  heroImage = imgData.attr('data-old-hires') ||
              imgData.attr('data-a-dynamic-image') ||
              imgData.attr('src') || '';

  // data-a-dynamic-image is a JSON object of {url: [w,h]} — grab the largest
  if (heroImage && heroImage.startsWith('{')) {
    try {
      const imgObj = JSON.parse(heroImage);
      const sorted = Object.entries(imgObj).sort((a, b) => b[1][0] - a[1][0]);
      heroImage = sorted[0]?.[0] || '';
    } catch {
      heroImage = '';
    }
  }

  // Fallback — grab first .a-dynamic-image src
  if (!heroImage) {
    heroImage = $('img.a-dynamic-image').first().attr('src') || '';
  }

  // ── Additional images ──────────────────────────────────────────────────
  const additionalImages = [];
  $('#altImages img, #imageBlock img').each((_, el) => {
    const src = $(el).attr('data-old-hires') || $(el).attr('src') || '';
    if (src && !src.includes('sprite') && !additionalImages.includes(src)) {
      additionalImages.push(src);
    }
  });

  // ── Bullet points / features ───────────────────────────────────────────
  const bullets = [];
  $('#feature-bullets ul li, #featurebullets_feature_div li').each((_, el) => {
    const text = $(el).text().trim();
    if (text && !text.toLowerCase().includes('make sure this fits') && text.length > 10) {
      bullets.push(text);
    }
  });

  // ── Brand ──────────────────────────────────────────────────────────────
  const brand =
    $('#bylineInfo').text().trim().replace('Brand: ', '').replace('Visit the ', '').replace(' Store', '') ||
    $('#brand').text().trim();

  // ── Rating ─────────────────────────────────────────────────────────────
  const rating = $('#acrPopover .a-size-base.a-color-base').first().text().trim() ||
                 $('span[data-hook="rating-out-of-text"]').first().text().trim();

  const reviewCount = $('#acrCustomerReviewText').first().text().trim();

  // ── Category ───────────────────────────────────────────────────────────
  const category = $('#wayfinding-breadcrumbs_feature_div .a-list-item').last().text().trim();

  return {
    asin: extractAsin(amazonUrl),
    url: amazonUrl,
    title: title || null,
    brand: brand || null,
    price: price || null,
    rating: rating || null,
    reviewCount: reviewCount || null,
    category: category || null,
    heroImage: heroImage || null,
    additionalImages: additionalImages.slice(0, 5),
    bullets: bullets.slice(0, 6),
    scrapedAt: new Date().toISOString(),
  };
}

// ── Main export: takes any Amazon or affiliate URL ─────────────────────────
export async function getProductData(inputUrl) {
  if (!CRAWLBASE_JS_TOKEN) {
    throw new Error('CRAWLBASE_JS_TOKEN not set in Replit Secrets');
  }

  // Step 1: resolve short/affiliate URL to full Amazon URL
  let amazonUrl = inputUrl;
  if (!inputUrl.includes('amazon.com')) {
    console.log('Resolving affiliate URL...');
    amazonUrl = await resolveAffiliateUrl(inputUrl);
  }

  if (!amazonUrl.includes('amazon.com')) {
    throw new Error(`Could not resolve to Amazon URL: ${amazonUrl}`);
  }

  console.log(`Scraping: ${amazonUrl}`);

  // Step 2: scrape via Crawlbase
  const product = await scrapeAmazonProduct(amazonUrl);

  if (!product.title) {
    throw new Error('Could not extract product data — page may not have loaded fully');
  }

  return product;
}
