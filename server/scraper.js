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

// ── Scrape all products from an Amazon storefront photo page ───────────────
// Input: URL like https://www.amazon.com/shop/influencer-xxx/photo/amzn1.xxx
// Output: array of { asin, title, brand, price, image, productUrl, affiliateTag }
export async function getStorefrontProducts(storefrontUrl) {
  if (!CRAWLBASE_JS_TOKEN) {
    throw new Error('CRAWLBASE_JS_TOKEN not set in Replit Secrets');
  }

  console.log(`Scraping storefront photo: ${storefrontUrl}`);

  // Use JS token with longer wait — page loads products dynamically
  const crawlbaseUrl = `https://api.crawlbase.com/?token=${CRAWLBASE_JS_TOKEN}&url=${encodeURIComponent(storefrontUrl)}&wait=5000&ajax_wait=true&scroll=true`;

  const response = await axios.get(crawlbaseUrl, { timeout: 45000 });
  const html = response.data;
  const $ = cheerio.load(html);

  const products = [];
  const seenAsins = new Set();

  // ── Extract product links ─────────────────────────────────────────────
  // Amazon storefront photo pages render product cards with dp/ links
  $('a[href*="/dp/"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const asinMatch = href.match(/\/dp\/([A-Z0-9]{10})/);
    if (!asinMatch) return;

    const asin = asinMatch[1];
    if (seenAsins.has(asin)) return;
    seenAsins.add(asin);

    // Build full product URL preserving affiliate tag if present
    let productUrl = href.startsWith('http') ? href : `https://www.amazon.com${href}`;

    // Extract affiliate tag from URL if present
    const tagMatch = productUrl.match(/tag=([^&]+)/);
    const affiliateTag = tagMatch ? tagMatch[1] : null;

    // Clean URL to just the dp URL for scraping
    const cleanUrl = `https://www.amazon.com/dp/${asin}`;

    // Try to get product details from the card itself
    const card = $(el).closest('[class*="card"], [class*="product"], [class*="item"], li, div').first();

    // Product image — look within the card or the link itself
    let image = '';
    const imgEl = card.find('img').first().length ? card.find('img').first() : $(el).find('img').first();
    image = imgEl.attr('src') || imgEl.attr('data-src') || '';

    // Title — look for text near the image
    let title = '';
    const titleEl = card.find('[class*="title"], [class*="name"], h2, h3, span[class*="text"]').first();
    title = titleEl.text().trim();

    // Price
    let price = '';
    const priceEl = card.find('[class*="price"], .a-price').first();
    price = priceEl.text().trim().replace(/\s+/g, ' ');

    // Brand
    let brand = '';
    const brandEl = card.find('[class*="brand"]').first();
    brand = brandEl.text().trim();

    products.push({
      asin,
      title: title || null,
      brand: brand || null,
      price: price || null,
      image: image || null,
      productUrl: cleanUrl,
      affiliateUrl: productUrl,
      affiliateTag: affiliateTag || null,
    });
  });

  // ── If card-level data was sparse, do a quick scrape of each product ──
  // Only if we got ASINs but missing titles/images from the page
  const needsEnrichment = products.filter(p => !p.title || !p.image);

  if (needsEnrichment.length > 0 && products.length > 0) {
    console.log(`Enriching ${needsEnrichment.length} products with individual scrapes...`);

    // Scrape up to 8 products concurrently (rate limit friendly)
    const enriched = await Promise.allSettled(
      needsEnrichment.slice(0, 8).map(async (p) => {
        try {
          const full = await scrapeAmazonProduct(p.productUrl);
          return { asin: p.asin, ...full };
        } catch {
          return p; // return original if scrape fails
        }
      })
    );

    // Merge enriched data back
    enriched.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        const idx = products.findIndex(p => p.asin === needsEnrichment[i].asin);
        if (idx !== -1) {
          const resValue = result.value;
          products[idx] = {
            ...products[idx],
            ...resValue,
            affiliateTag: products[idx].affiliateTag,
            affiliateUrl: products[idx].affiliateUrl,
          };
        }
      }
    });
  }

  console.log(`Found ${products.length} products in storefront photo`);
  return products;
}
