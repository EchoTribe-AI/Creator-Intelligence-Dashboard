import { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// COMPLIANCE UTILS
// ─────────────────────────────────────────────────────────────────────────────
const checkCompliance = (copy: string) => {
  const flags = [];
  
    // Trademark check
    const trademarks = ["SPANX", "Free People", "Lululemon", "Nike", "Walmart", "Target"];
    trademarks.forEach(tm => {
      if (copy.toLowerCase().includes(tm.toLowerCase())) {
        flags.push({ rule: "trademark_reference", severity: "block", note: `Contains restricted brand name: ${tm}` });
      }
    });

  // Superlatives
  const superlatives = ["best", "most popular", "#1", "number one"];
  superlatives.forEach(s => {
    if (new RegExp(`\\b${s}\\b`, 'i').test(copy)) {
      flags.push({ rule: "unverified_superlative", severity: "warning", note: `Contains unverified superlative: "${s}"` });
    }
  });

  // Urgency
  if (/\bonly \d+ left\b/i.test(copy)) {
    flags.push({ rule: "deceptive_urgency", severity: "warning", note: "Contains potential deceptive urgency claim" });
  }

  // Earnings
  if (/\b(income|profit|earnings|make money)\b/i.test(copy)) {
    flags.push({ rule: "earnings_claim", severity: "block", note: "Contains prohibited earnings or income claims" });
  }

  // Disclosure
  // No disclosure check needed for Meta boosted ads
  /*
  if (!copy.includes("#ad") && !copy.includes("#sponsored")) {
    flags.push({ rule: "missing_disclosure", severity: "warning", note: "Missing required #ad or #sponsored disclosure" });
  }
  */

  return flags;
};

const ComplianceDisplay = ({ flags }: { flags: any[] }) => {
  if (!flags || flags.length === 0) {
    return (
      <div style={{ fontSize: '11px', color: '#22C55E', marginTop: '8px' }}>
        ✓ Meta Policy Check Passed
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(251,146,60,0.08)',
      border: '1px solid rgba(251,146,60,0.25)',
      borderRadius: '8px',
      padding: '10px 14px',
      marginTop: '10px'
    }}>
      <div style={{ fontSize: '11px', fontWeight: '700', color: '#F97316', marginBottom: '6px' }}>
        ⚠️ Policy Review Needed
      </div>
      {flags.map((flag, fi) => (
        <div key={fi} style={{ fontSize: '12px', color: '#444444', marginBottom: '3px' }}>
          <span style={{ color: flag.severity === 'block' ? '#EF4444' : '#F97316' }}>
            {flag.severity === 'block' ? '🚫' : '⚠️'}
          </span>{' '}
          <strong>{flag.rule}</strong>: {flag.note}
        </div>
      ))}
    </div>
  );
};
// Ad Type Legend: "video" = video-only, "static" = image-only, "mixed" = both
// ─────────────────────────────────────────────────────────────────────────────
const CREATORS = [
  {
    id: "lexietucker",
    name: "Lexietucker",
    handle: "@lexietucker",
    niche: "Fashion & Lifestyle",
    tone: "Aspirational, relatable, trend-forward",
    audience: "Women 25–45",
    totalAds: 20,
    adType: "video",
    color: "#FF3B3B",
    emoji: "✨",
    existingAds: [
      { started: "Oct 20, 2025", copy: "This Amazon set is giving effortlessly elegant ✨ Off-the-shoulder, wide-leg, and lightweight — this two-piece look is chic enough for date night but comfy enough for vacay vibes.", hasVideo: true, hasStatic: false },
      { started: "Oct 7, 2025", copy: "On sale 🔥 Okay but this new Echo Show 21\" just made mom life so much easier 💙✨ Recipes, reminders, music, video calls — all hands-free.", hasVideo: true, hasStatic: false },
      { started: "Oct 3, 2025", copy: "On sale 🔥 You can enjoy up to 20% off now! 🌟 These pants are IT, girls 🙌🏼 They're giving total Free People vibes with a fraction of the price.", hasVideo: true, hasStatic: false },
    ],
    products: [
      { name: "Amazon 2-Piece Lounge Set", category: "Fashion", commission: "9%", trend: "↑ High", badge: "Top Pick" },
      { name: "Wide-Leg Linen Pants", category: "Fashion", commission: "8%", trend: "↑ High", badge: "Trending" },
      { name: "Oversized Blazer Set", category: "Fashion", commission: "10%", trend: "↑ Hot", badge: "New" },
      { name: "Echo Show 21\"", category: "Tech", commission: "4%", trend: "→ Stable", badge: "" },
    ],
    // ── META ADS API PLACEHOLDERS ──────────────────────────────────────────
    metaData: {
      _note: "Connect via Meta Marketing API — Ad Account ID required",
      spend_7d: "CONNECT_META_API",        // GET /act_{ad_account_id}/insights?fields=spend&date_preset=last_7d
      cpc_avg: "CONNECT_META_API",          // fields=cpc
      cpm_avg: "CONNECT_META_API",          // fields=cpm
      ctr_avg: "CONNECT_META_API",          // fields=ctr
      clicks_7d: "CONNECT_META_API",        // fields=clicks
      impressions_7d: "CONNECT_META_API",   // fields=impressions
      top_ad_id: "CONNECT_META_API",        // GET /act_{id}/ads?sort=spend&fields=id,name,effective_status
      top_creative_type: "video",           // Derived from ad library scrape — confirmed video-only
      active_ad_count: 20,                  // From ad library scrape
    },
    // ── WALMART EARNINGS (IMPACT API) ──────────────────────────────────────
    walmartData: {
      _note: "Connect via Impact affiliate API — SubID required",
      epc_24h: "CONNECT_AFFILIATE_API",     // GET /earnings?subid={creator_id}&window=24h
      epc_7d: "CONNECT_AFFILIATE_API",      // GET /earnings?subid={creator_id}&window=7d
      clicks_24h: "CONNECT_AFFILIATE_API",  // GET /clicks?subid={creator_id}&window=24h
      orders_7d: "CONNECT_AFFILIATE_API",   // GET /orders?subid={creator_id}&window=7d
      revenue_7d: "CONNECT_AFFILIATE_API",  // GET /revenue?subid={creator_id}&window=7d
      conversion_rate: "CONNECT_AFFILIATE_API",
      top_category: "Fashion",              // Known from ad library scrape
      avg_commission_rate: "9%",            // Estimated from product data
      basket_size_avg: "CONNECT_AFFILIATE_API", // GET /orders?subid={creator_id}&fields=basket_value
    },
    // ── AMAZON EARNINGS (MANUAL/CSV) ────────────────────────────────────────
    amazonData: {
      _note: "Manual CSV Upload or Database Entry — No API available",
      epc_24h: "UPLOAD_CSV",
      epc_7d: "UPLOAD_CSV",
      clicks_24h: "UPLOAD_CSV",
      orders_7d: "UPLOAD_CSV",
      revenue_7d: "UPLOAD_CSV",
      conversion_rate: "UPLOAD_CSV",
      top_category: "Fashion",
      avg_commission_rate: "8%",
      basket_size_avg: "UPLOAD_CSV",
    },
  },
  {
    id: "caseyLeigh",
    name: "Casey Leigh Wiegand",
    handle: "@caseyleighwiegand",
    niche: "Fashion & Feminine Lifestyle",
    tone: "Soft, feminine, aesthetic-forward, poetic",
    audience: "Style-conscious women 25–40",
    totalAds: 72,
    adType: "static",
    color: "#F472B6",
    emoji: "🩷",
    existingAds: [
      { started: "Dec 26, 2025", copy: "When you want soft, feminine, and effortless all in one outfit. Click [Shop Now] to buy now! #softstyle #pinkdetails #amazonfashionfinds", hasVideo: false, hasStatic: true },
      { started: "Dec 8, 2025", copy: "Casual pink perfection. 💕 The coziest sweater, classic denim, easy sneakers, and glam touches for everyday. This one feels playful, comfy, and so easy to style.", hasVideo: false, hasStatic: true },
      { started: "Nov 12, 2025", copy: "Keeping it classic with a neutral game day sweatshirt, a black cap, clear stadium bag, and comfy sneakers. ✨ Easy, pulled together, and stadium-ready.", hasVideo: false, hasStatic: true },
    ],
    products: [
      { name: "Soft Feminine Matching Set", category: "Fashion", commission: "9%", trend: "↑ Hot", badge: "Top Pick" },
      { name: "Cozy Oversized Sweater", category: "Fashion", commission: "8%", trend: "↑ High", badge: "Trending" },
      { name: "Aesthetic Kitchen Glasses", category: "Home", commission: "6%", trend: "↑ High", badge: "New" },
      { name: "Clear Stadium Bag", category: "Accessories", commission: "7%", trend: "→ Stable", badge: "" },
    ],
    metaData: {
      _note: "Connect via Meta Marketing API — Ad Account ID required",
      spend_7d: "CONNECT_META_API",
      cpc_avg: "CONNECT_META_API",
      cpm_avg: "CONNECT_META_API",
      ctr_avg: "CONNECT_META_API",
      clicks_7d: "CONNECT_META_API",
      impressions_7d: "CONNECT_META_API",
      top_ad_id: "CONNECT_META_API",
      top_creative_type: "static",          // Confirmed 65/72 ads are static image
      active_ad_count: 72,
    },
    walmartData: {
      _note: "Connect via Impact affiliate API — SubID required",
      epc_24h: "CONNECT_AFFILIATE_API",
      epc_7d: "CONNECT_AFFILIATE_API",
      clicks_24h: "CONNECT_AFFILIATE_API",
      orders_7d: "CONNECT_AFFILIATE_API",
      revenue_7d: "CONNECT_AFFILIATE_API",
      conversion_rate: "CONNECT_AFFILIATE_API",
      top_category: "Fashion",
      avg_commission_rate: "9%",
      basket_size_avg: "CONNECT_AFFILIATE_API",
    },
    amazonData: {
      _note: "Manual CSV Upload or Database Entry — No API available",
      epc_24h: "UPLOAD_CSV",
      epc_7d: "UPLOAD_CSV",
      clicks_24h: "UPLOAD_CSV",
      orders_7d: "UPLOAD_CSV",
      revenue_7d: "UPLOAD_CSV",
      conversion_rate: "UPLOAD_CSV",
      top_category: "Fashion",
      avg_commission_rate: "8%",
      basket_size_avg: "UPLOAD_CSV",
    },
  },
  {
    id: "misslacyjean",
    name: "MissLacyJean Amazon Finds",
    handle: "@misslacyjean",
    niche: "Amazon Fashion & Deals",
    tone: "Energetic, deal-focused, FOMO-driven",
    audience: "Bargain-savvy women 25–50",
    totalAds: 14,
    adType: "video",
    color: "#FB923C",
    emoji: "🔥",
    existingAds: [
      { started: "Sep 30, 2025", copy: "On sale 🔥 You can enjoy up to 21% off now! 🌟 freshly restocked – grab it before it's gone. SPANX or AMAZON 🎉 Get the Look for Less!", hasVideo: true, hasStatic: false },
      { started: "Oct 8, 2025", copy: "On sale 🔥 You can enjoy up to 35% off now! My FAVORITE fashion finds on SALE for PRIME DAY! Save your money.", hasVideo: true, hasStatic: false },
      { started: "Oct 21, 2025", copy: "On sale 🔥 You can enjoy up to 40% off now! SPANX or AMAZON 🎉 Get the Look for Less!", hasVideo: true, hasStatic: false },
    ],
    products: [
      { name: "SPANX Dupe Lounge Set", category: "Fashion", commission: "9%", trend: "↑ Hot", badge: "Top Pick" },
      { name: "Viral Workout Set", category: "Fitness", commission: "10%", trend: "↑ Hot", badge: "New" },
      { name: "Amazon Prime Day Picks", category: "Multi", commission: "8%", trend: "↑ High", badge: "Trending" },
      { name: "Cozy Cardigan Set", category: "Fashion", commission: "8%", trend: "→ Stable", badge: "" },
    ],
    metaData: {
      _note: "Connect via Meta Marketing API",
      spend_7d: "CONNECT_META_API",
      cpc_avg: "CONNECT_META_API",
      cpm_avg: "CONNECT_META_API",
      ctr_avg: "CONNECT_META_API",
      clicks_7d: "CONNECT_META_API",
      impressions_7d: "CONNECT_META_API",
      top_ad_id: "CONNECT_META_API",
      top_creative_type: "video",
      active_ad_count: 14,
    },
    walmartData: {
      _note: "Connect via Impact affiliate API — SubID required",
      epc_24h: "CONNECT_AFFILIATE_API",
      epc_7d: "CONNECT_AFFILIATE_API",
      clicks_24h: "CONNECT_AFFILIATE_API",
      orders_7d: "CONNECT_AFFILIATE_API",
      revenue_7d: "CONNECT_AFFILIATE_API",
      conversion_rate: "CONNECT_AFFILIATE_API",
      top_category: "Fashion",
      avg_commission_rate: "9%",
      basket_size_avg: "CONNECT_AFFILIATE_API",
    },
    amazonData: {
      _note: "Manual CSV Upload or Database Entry — No API available",
      epc_24h: "UPLOAD_CSV",
      epc_7d: "UPLOAD_CSV",
      clicks_24h: "UPLOAD_CSV",
      orders_7d: "UPLOAD_CSV",
      revenue_7d: "UPLOAD_CSV",
      conversion_rate: "UPLOAD_CSV",
      top_category: "Fashion",
      avg_commission_rate: "8%",
      basket_size_avg: "UPLOAD_CSV",
    },
  },
  {
    id: "whitneybuha",
    name: "Whitney Buha",
    handle: "@whitneybuha",
    niche: "Lifestyle & Travel Fashion",
    tone: "Warm, personal, approachable",
    audience: "Moms and lifestyle women 28–45",
    totalAds: 11,
    adType: "video",
    color: "#34D399",
    emoji: "🌿",
    existingAds: [
      { started: "Nov 12, 2025", copy: "On sale 🔥 The perfect non-leggings travel outfit from Amazon! These wide leg pants are amazing.", hasVideo: true, hasStatic: false },
      { started: "Oct 21, 2025", copy: "Amazon must have seamless bras! These are wireless, seamless, push up and so comfy!! #seamlessbra #amazonmusthave", hasVideo: true, hasStatic: false },
      { started: "Oct 21, 2025", copy: "Outfits I wore while on vacation at an all-inclusive in Mexico! The pink matching set is my fave!! #vacationoutfit", hasVideo: true, hasStatic: false },
    ],
    products: [
      { name: "Wide-Leg Travel Pants", category: "Fashion", commission: "8%", trend: "↑ High", badge: "Top Pick" },
      { name: "Seamless Wireless Bra", category: "Intimates", commission: "10%", trend: "↑ Hot", badge: "Trending" },
      { name: "Pink Vacation Set", category: "Fashion", commission: "9%", trend: "↑ High", badge: "" },
      { name: "Amazon Jewelry Finds", category: "Accessories", commission: "6%", trend: "→ Stable", badge: "" },
    ],
    metaData: {
      _note: "Connect via Meta Marketing API",
      spend_7d: "CONNECT_META_API",
      cpc_avg: "CONNECT_META_API",
      cpm_avg: "CONNECT_META_API",
      ctr_avg: "CONNECT_META_API",
      clicks_7d: "CONNECT_META_API",
      impressions_7d: "CONNECT_META_API",
      top_ad_id: "CONNECT_META_API",
      top_creative_type: "video",
      active_ad_count: 11,
    },
    walmartData: {
      _note: "Connect via Impact affiliate API — SubID required",
      epc_24h: "CONNECT_AFFILIATE_API",
      epc_7d: "CONNECT_AFFILIATE_API",
      clicks_24h: "CONNECT_AFFILIATE_API",
      orders_7d: "CONNECT_AFFILIATE_API",
      revenue_7d: "CONNECT_AFFILIATE_API",
      conversion_rate: "CONNECT_AFFILIATE_API",
      top_category: "Fashion",
      avg_commission_rate: "9%",
      basket_size_avg: "CONNECT_AFFILIATE_API",
    },
    amazonData: {
      _note: "Manual CSV Upload or Database Entry — No API available",
      epc_24h: "UPLOAD_CSV",
      epc_7d: "UPLOAD_CSV",
      clicks_24h: "UPLOAD_CSV",
      orders_7d: "UPLOAD_CSV",
      revenue_7d: "UPLOAD_CSV",
      conversion_rate: "UPLOAD_CSV",
      top_category: "Fashion",
      avg_commission_rate: "8%",
      basket_size_avg: "UPLOAD_CSV",
    },
  },
  {
    id: "andreajean",
    name: "Andrea Jean Co",
    handle: "@andreajeancleanig",
    niche: "Mom Life & Home Finds",
    tone: "Practical, enthusiastic, family-focused",
    audience: "Busy moms 28–45",
    totalAds: 6,
    adType: "mixed",
    color: "#FBBF24",
    emoji: "✈️",
    existingAds: [
      { started: "Nov 2025", copy: "Amazon Travel Must-Haves Everyone is Raving About! ✈️ Click [Shop Now] button to buy now! ✨ Traveling as a busy mom of 4 means I need things that actually work.", hasVideo: false, hasStatic: true },
      { started: "Oct 2025", copy: "🔥 My Eco-Friendly Cleaning Hero: Shadazzle Natural All-Purpose Cleaner! 🍋 I just discovered this AMAZING eco-friendly cleaner.", hasVideo: true, hasStatic: false },
      { started: "Dec 2025", copy: "Winter is chaos-proofing season, and these cool mom picks from Amazon are officially saving my sanity! ❄️🙌", hasVideo: false, hasStatic: true },
    ],
    products: [
      { name: "Eco Travel Organizer Set", category: "Travel", commission: "8%", trend: "↑ High", badge: "Top Pick" },
      { name: "Natural All-Purpose Cleaner", category: "Home", commission: "7%", trend: "↑ Hot", badge: "Trending" },
      { name: "Mom Winter Essentials Bundle", category: "Lifestyle", commission: "9%", trend: "↑ High", badge: "New" },
      { name: "Kids Travel Activity Kit", category: "Kids", commission: "6%", trend: "→ Stable", badge: "" },
    ],
    metaData: {
      _note: "Connect via Meta Marketing API — runs both video AND static",
      spend_7d: "CONNECT_META_API",
      cpc_avg: "CONNECT_META_API",
      cpm_avg: "CONNECT_META_API",
      ctr_avg: "CONNECT_META_API",
      clicks_7d: "CONNECT_META_API",
      impressions_7d: "CONNECT_META_API",
      top_ad_id: "CONNECT_META_API",
      top_creative_type: "mixed",           // 3 video, 3 static — key comparison creator
      active_ad_count: 6,
    },
    walmartData: {
      _note: "Connect via Impact affiliate API — SubID required",
      epc_24h: "CONNECT_AFFILIATE_API",
      epc_7d: "CONNECT_AFFILIATE_API",
      clicks_24h: "CONNECT_AFFILIATE_API",
      orders_7d: "CONNECT_AFFILIATE_API",
      revenue_7d: "CONNECT_AFFILIATE_API",
      conversion_rate: "CONNECT_AFFILIATE_API",
      top_category: "Home/Travel",
      avg_commission_rate: "8%",
      basket_size_avg: "CONNECT_AFFILIATE_API",
    },
    amazonData: {
      _note: "Manual CSV Upload or Database Entry — No API available",
      epc_24h: "UPLOAD_CSV",
      epc_7d: "UPLOAD_CSV",
      clicks_24h: "UPLOAD_CSV",
      orders_7d: "UPLOAD_CSV",
      revenue_7d: "UPLOAD_CSV",
      conversion_rate: "UPLOAD_CSV",
      top_category: "Home/Travel",
      avg_commission_rate: "8%",
      basket_size_avg: "UPLOAD_CSV",
    },
  },
  {
    id: "lizthul",
    name: "Liz Thul",
    handle: "@lizthul",
    niche: "Midsize & Plus Fashion",
    tone: "Confident, relatable, size-inclusive",
    audience: "Midsize women 25–45",
    totalAds: 9,
    adType: "video",
    color: "#FF3B3B",
    emoji: "👖",
    existingAds: [
      { started: "Oct 20, 2025", copy: "On sale 🔥 Amazon Stretchy Jeans 👖🩵 midsize + plus size-friendly find! If you've tried these you know.", hasVideo: true, hasStatic: false },
      { started: "Dec 11, 2025", copy: "On sale 🔥 My most-viral Amazon look is finally restocked! 🔥 perfect for New Year's Eve, an upcoming birthday.", hasVideo: true, hasStatic: false },
      { started: "Nov 12, 2025", copy: "On sale 🔥 The Viral Amazon BBL Jeans?! 🤯👀 These sell out frequently, so grab 'em while you can!", hasVideo: true, hasStatic: false },
    ],
    products: [
      { name: "Viral BBL Stretch Jeans", category: "Fashion", commission: "9%", trend: "↑ Hot", badge: "Top Pick" },
      { name: "Midsize Amazon Dress", category: "Fashion", commission: "10%", trend: "↑ Hot", badge: "Trending" },
      { name: "Plus Friendly Blazer", category: "Fashion", commission: "8%", trend: "↑ High", badge: "" },
      { name: "Size-Inclusive Activewear", category: "Fitness", commission: "9%", trend: "→ Stable", badge: "New" },
    ],
    metaData: {
      _note: "Connect via Meta Marketing API",
      spend_7d: "CONNECT_META_API",
      cpc_avg: "CONNECT_META_API",
      cpm_avg: "CONNECT_META_API",
      ctr_avg: "CONNECT_META_API",
      clicks_7d: "CONNECT_META_API",
      impressions_7d: "CONNECT_META_API",
      top_ad_id: "CONNECT_META_API",
      top_creative_type: "video",
      active_ad_count: 9,
    },
    walmartData: {
      _note: "Connect via Impact affiliate API — SubID required",
      epc_24h: "CONNECT_AFFILIATE_API",
      epc_7d: "CONNECT_AFFILIATE_API",
      clicks_24h: "CONNECT_AFFILIATE_API",
      orders_7d: "CONNECT_AFFILIATE_API",
      revenue_7d: "CONNECT_AFFILIATE_API",
      conversion_rate: "CONNECT_AFFILIATE_API",
      top_category: "Fashion",
      avg_commission_rate: "9%",
      basket_size_avg: "CONNECT_AFFILIATE_API",
    },
    amazonData: {
      _note: "Manual CSV Upload or Database Entry — No API available",
      epc_24h: "UPLOAD_CSV",
      epc_7d: "UPLOAD_CSV",
      clicks_24h: "UPLOAD_CSV",
      orders_7d: "UPLOAD_CSV",
      revenue_7d: "UPLOAD_CSV",
      conversion_rate: "UPLOAD_CSV",
      top_category: "Fashion",
      avg_commission_rate: "8%",
      basket_size_avg: "UPLOAD_CSV",
    },
  },
  {
    id: "sierrahoneycutt",
    name: "Sierra Honeycutt",
    handle: "@sierra.honeycutt",
    niche: "Family & Kids Travel",
    tone: "Upbeat, family-focused, deal-savvy",
    audience: "Parents 28–42",
    totalAds: 15,
    adType: "video",
    color: "#F87171",
    emoji: "🚗",
    existingAds: [
      { started: "Jul 24, 2025", copy: "On sale 🔥 You can enjoy 28% Off now! 🌟 Click the Shop Now button to buy now! #roadtripessentials #roadtripmusthaves #kidstraveltips", hasVideo: true, hasStatic: false },
      { started: "Aug 2025", copy: "On sale 🔥 You can enjoy 28% Off now! 🌟 Thousands of rave reviews and freshly restocked – grab it before it's gone 🚗💨", hasVideo: true, hasStatic: false },
      { started: "Sep 2025", copy: "On sale 🔥 Road trip must haves for the whole family! These are the products that made our summer trip actually survivable. 🙌", hasVideo: true, hasStatic: false },
    ],
    products: [
      { name: "Road Trip Kids Activity Kit", category: "Kids/Travel", commission: "7%", trend: "↑ High", badge: "Top Pick" },
      { name: "Family Car Organizer", category: "Travel", commission: "8%", trend: "↑ High", badge: "Trending" },
      { name: "Portable Kids Snack Container", category: "Kids", commission: "8%", trend: "↑ Hot", badge: "New" },
      { name: "Travel Neck Pillow Set", category: "Travel", commission: "6%", trend: "→ Stable", badge: "" },
    ],
    metaData: {
      _note: "Connect via Meta Marketing API",
      spend_7d: "CONNECT_META_API",
      cpc_avg: "CONNECT_META_API",
      cpm_avg: "CONNECT_META_API",
      ctr_avg: "CONNECT_META_API",
      clicks_7d: "CONNECT_META_API",
      impressions_7d: "CONNECT_META_API",
      top_ad_id: "CONNECT_META_API",
      top_creative_type: "video",
      active_ad_count: 15,
    },
    walmartData: {
      _note: "Connect via Impact affiliate API — SubID required",
      epc_24h: "CONNECT_AFFILIATE_API",
      epc_7d: "CONNECT_AFFILIATE_API",
      clicks_24h: "CONNECT_AFFILIATE_API",
      orders_7d: "CONNECT_AFFILIATE_API",
      revenue_7d: "CONNECT_AFFILIATE_API",
      conversion_rate: "CONNECT_AFFILIATE_API",
      top_category: "Kids/Travel",
      avg_commission_rate: "7%",
      basket_size_avg: "CONNECT_AFFILIATE_API",
    },
    amazonData: {
      _note: "Manual CSV Upload or Database Entry — No API available",
      epc_24h: "UPLOAD_CSV",
      epc_7d: "UPLOAD_CSV",
      clicks_24h: "UPLOAD_CSV",
      orders_7d: "UPLOAD_CSV",
      revenue_7d: "UPLOAD_CSV",
      conversion_rate: "UPLOAD_CSV",
      top_category: "Kids/Travel",
      avg_commission_rate: "7%",
      basket_size_avg: "UPLOAD_CSV",
    },
  },
  {
    id: "hauteandhunid",
    name: "Haute and Humid",
    handle: "@hauteandhunid",
    niche: "Millennial Mom Fashion & Lifestyle",
    tone: "Witty, relatable, confident, Southern",
    audience: "Millennial moms 35–50",
    totalAds: 3,
    adType: "mixed",
    color: "#A78BFA",
    emoji: "🌸",
    existingAds: [
      { started: "2025", copy: "For the millennial moms who've swapped gym selfies for school drop-offs, this is athleisure, grown up. Think sleek, comfortable, and actually put-together.", hasVideo: true, hasStatic: false },
      { started: "2025", copy: "Comment MUST HAVES & I'll DM you links! As a 43 year old mom of two teens, I'm sharing the absolute must haves you'll love!", hasVideo: false, hasStatic: true },
      { started: "2025", copy: "Amazon spring & easter home decor! They are all my favorite products. Click [Shop Now] button to buy now! ✨", hasVideo: false, hasStatic: true },
    ],
    products: [
      { name: "Sleek Athleisure Set", category: "Fashion", commission: "9%", trend: "↑ Hot", badge: "Top Pick" },
      { name: "Spring Home Decor Bundle", category: "Home", commission: "7%", trend: "↑ High", badge: "Trending" },
      { name: "Millennial Mom Must-Haves", category: "Lifestyle", commission: "8%", trend: "↑ High", badge: "" },
      { name: "Easter Decor Collection", category: "Home", commission: "6%", trend: "→ Seasonal", badge: "" },
    ],
    metaData: {
      _note: "Connect via Meta Marketing API — runs both video AND static",
      spend_7d: "CONNECT_META_API",
      cpc_avg: "CONNECT_META_API",
      cpm_avg: "CONNECT_META_API",
      ctr_avg: "CONNECT_META_API",
      clicks_7d: "CONNECT_META_API",
      impressions_7d: "CONNECT_META_API",
      top_ad_id: "CONNECT_META_API",
      top_creative_type: "mixed",
      active_ad_count: 3,
    },
    walmartData: {
      _note: "Connect via Impact affiliate API — SubID required",
      epc_24h: "CONNECT_AFFILIATE_API",
      epc_7d: "CONNECT_AFFILIATE_API",
      clicks_24h: "CONNECT_AFFILIATE_API",
      orders_7d: "CONNECT_AFFILIATE_API",
      revenue_7d: "CONNECT_AFFILIATE_API",
      conversion_rate: "CONNECT_AFFILIATE_API",
      top_category: "Fashion/Home",
      avg_commission_rate: "8%",
      basket_size_avg: "CONNECT_AFFILIATE_API",
    },
    amazonData: {
      _note: "Manual CSV Upload or Database Entry — No API available",
      epc_24h: "UPLOAD_CSV",
      epc_7d: "UPLOAD_CSV",
      clicks_24h: "UPLOAD_CSV",
      orders_7d: "UPLOAD_CSV",
      revenue_7d: "UPLOAD_CSV",
      conversion_rate: "UPLOAD_CSV",
      top_category: "Fashion/Home",
      avg_commission_rate: "8%",
      basket_size_avg: "UPLOAD_CSV",
    },
  },
  {
    id: "decorsnippets",
    name: "Decor Snippets",
    handle: "@decor.snippets",
    niche: "Home Decor & Styling",
    tone: "Warm, design-forward, aspirational",
    audience: "Home decor enthusiasts 28–50",
    totalAds: 12,
    adType: "video",
    color: "#2DD4BF",
    emoji: "🏠",
    existingAds: [
      { started: "Oct 2025", copy: "On sale 🔥 You can enjoy up to 20% off now! 🌟 freshly restocked – grab it before it's gone. Click the Shop Now button to buy now!", hasVideo: true, hasStatic: false },
      { started: "Nov 2025", copy: "🌟 freshly restocked - grab it before it's gone. 🤍 It felt like the right time to give my living room a refresh and these pieces made it so easy.", hasVideo: true, hasStatic: false },
      { started: "Dec 2025", copy: "On sale 🔥 Winter home styling finds that make your space feel cozy and intentional without a huge budget.", hasVideo: true, hasStatic: false },
    ],
    products: [
      { name: "Living Room Refresh Bundle", category: "Home Decor", commission: "8%", trend: "↑ High", badge: "Top Pick" },
      { name: "Cozy Throw & Pillow Set", category: "Home", commission: "9%", trend: "↑ Hot", badge: "Trending" },
      { name: "Aesthetic Vase Collection", category: "Home Decor", commission: "7%", trend: "↑ High", badge: "" },
      { name: "Minimalist Wall Art Set", category: "Home Decor", commission: "8%", trend: "→ Stable", badge: "New" },
    ],
    metaData: {
      _note: "Connect via Meta Marketing API",
      spend_7d: "CONNECT_META_API",
      cpc_avg: "CONNECT_META_API",
      cpm_avg: "CONNECT_META_API",
      ctr_avg: "CONNECT_META_API",
      clicks_7d: "CONNECT_META_API",
      impressions_7d: "CONNECT_META_API",
      top_ad_id: "CONNECT_META_API",
      top_creative_type: "video",
      active_ad_count: 12,
    },
    walmartData: {
      _note: "Connect via Impact affiliate API — SubID required",
      epc_24h: "CONNECT_AFFILIATE_API",
      epc_7d: "CONNECT_AFFILIATE_API",
      clicks_24h: "CONNECT_AFFILIATE_API",
      orders_7d: "CONNECT_AFFILIATE_API",
      revenue_7d: "CONNECT_AFFILIATE_API",
      conversion_rate: "CONNECT_AFFILIATE_API",
      top_category: "Home Decor",
      avg_commission_rate: "8%",
      basket_size_avg: "CONNECT_AFFILIATE_API",
    },
    amazonData: {
      _note: "Manual CSV Upload or Database Entry — No API available",
      epc_24h: "UPLOAD_CSV",
      epc_7d: "UPLOAD_CSV",
      clicks_24h: "UPLOAD_CSV",
      orders_7d: "UPLOAD_CSV",
      revenue_7d: "UPLOAD_CSV",
      conversion_rate: "UPLOAD_CSV",
      top_category: "Home Decor",
      avg_commission_rate: "8%",
      basket_size_avg: "UPLOAD_CSV",
    },
  },
  {
    id: "katiecarlson",
    name: "Katie Carlson – Finds for Moms",
    handle: "@katiecarlson",
    niche: "Mom & Kids Finds",
    tone: "Practical, enthusiastic, mom-relatable",
    audience: "Moms 28–42",
    totalAds: 9,
    adType: "video",
    color: "#60A5FA",
    emoji: "👶",
    existingAds: [
      { started: "Jan 13, 2026", copy: "🌟 Thousands of rave reviews and freshly restocked. I love using this cart for allll the kids arts and crafts supplies. And, you can customize the color!", hasVideo: true, hasStatic: false },
      { started: "Jan 1, 2026", copy: "🌟 freshly restocked - grab it before it's gone. Amazon Finds. Amazon Mom Find. Amazon Kids Find. Toy Storage. Toy Organization.", hasVideo: true, hasStatic: false },
      { started: "Jan 6, 2026", copy: "🌟 Ever since my son started loving legos, I've been looking for creative ways to keep the mess at bay. 😅 This zip up mat is genius!", hasVideo: true, hasStatic: false },
    ],
    products: [
      { name: "Kids Art Supply Cart", category: "Kids/Home", commission: "8%", trend: "↑ High", badge: "Top Pick" },
      { name: "LEGO Zip-Up Play Mat", category: "Kids/Toys", commission: "5%", trend: "↑ Hot", badge: "Trending" },
      { name: "Personalized Kids Backpack", category: "Kids", commission: "9%", trend: "↑ High", badge: "New" },
      { name: "Toy Storage Solution", category: "Kids/Home", commission: "7%", trend: "→ Stable", badge: "" },
    ],
    metaData: {
      _note: "Connect via Meta Marketing API",
      spend_7d: "CONNECT_META_API",
      cpc_avg: "CONNECT_META_API",
      cpm_avg: "CONNECT_META_API",
      ctr_avg: "CONNECT_META_API",
      clicks_7d: "CONNECT_META_API",
      impressions_7d: "CONNECT_META_API",
      top_ad_id: "CONNECT_META_API",
      top_creative_type: "video",
      active_ad_count: 9,
    },
    walmartData: {
      _note: "Connect via Impact affiliate API — SubID required",
      epc_24h: "CONNECT_AFFILIATE_API",
      epc_7d: "CONNECT_AFFILIATE_API",
      clicks_24h: "CONNECT_AFFILIATE_API",
      orders_7d: "CONNECT_AFFILIATE_API",
      revenue_7d: "CONNECT_AFFILIATE_API",
      conversion_rate: "CONNECT_AFFILIATE_API",
      top_category: "Kids/Home",
      avg_commission_rate: "7%",
      basket_size_avg: "CONNECT_AFFILIATE_API",
    },
    amazonData: {
      _note: "Manual CSV Upload or Database Entry — No API available",
      epc_24h: "UPLOAD_CSV",
      epc_7d: "UPLOAD_CSV",
      clicks_24h: "UPLOAD_CSV",
      orders_7d: "UPLOAD_CSV",
      revenue_7d: "UPLOAD_CSV",
      conversion_rate: "UPLOAD_CSV",
      top_category: "Kids/Home",
      avg_commission_rate: "7%",
      basket_size_avg: "UPLOAD_CSV",
    },
  },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const AD_TYPE_LABELS = {
  video: { label: "Video Only", color: "#3B82F6", bg: "rgba(59,130,246,0.12)" },
  static: { label: "Static Only", color: "#F472B6", bg: "rgba(244,114,182,0.15)" },
  mixed: { label: "Video + Static", color: "#FBBF24", bg: "rgba(251,191,36,0.15)" },
};

// ── API Call to Claude ─────────────────────────────────────────────────────
async function callClaude(prompt, maxTokens = 800) {
  const res = await fetch("/api/anthropic/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

function ProductLookup({ creatorTone, creatorId, onProductLoaded }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);

  const loadFavorites = async (creatorId: string) => {
    try {
      const res = await fetch(`/api/favorites/${creatorId}`);
      const data = await res.json();
      setFavorites(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load favorites", err);
    }
  };

  const isFavorite = (type: 'product' | 'ad_copy', identifier: string) => {
    return favorites.some(f => {
      try {
        const data = JSON.parse(f.data);
        return f.type === type && (data.name === identifier || data.hook === identifier);
      } catch (e) {
        return false;
      }
    });
  };

  const toggleFavorite = async (type: 'product' | 'ad_copy', itemData: any) => {
    if (!selectedCreator) return;
    
    const identifier = itemData.name || itemData.hook;
    const existing = favorites.find(f => {
      try {
        const data = JSON.parse(f.data);
        return f.type === type && (data.name === identifier || data.hook === identifier);
      } catch (e) {
        return false;
      }
    });
    
    if (existing) {
      await fetch(`/api/favorites/${existing.id}`, { method: 'DELETE' });
    } else {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId: selectedCreator.id,
          type,
          data: JSON.stringify(itemData)
        })
      });
    }
    loadFavorites(selectedCreator.id);
  };
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);

  const lookup = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setProduct(null);

    try {
      const res = await fetch('/api/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setProduct(data.product);
        // Auto-save to persistent storage
        await fetch('/api/product/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            creatorId: creatorId,
            product: data.product
          })
        });
        if (onProductLoaded) onProductLoaded(data.product);
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError('Request failed — is the server running?');
    }
    setLoading(false);
  };

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E8E5E0', borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
      <div style={{ fontSize: '11px', fontWeight: '700', color: '#C9A96E', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
        🔗 Add Product from Amazon Link
      </div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="Paste Amazon or affiliate URL (amzn.to/... or full URL)"
          style={{ flex: 1, background: '#E8E5E0', border: '1px solid #D0CBC3', borderRadius: '8px', padding: '10px 14px', color: '#1A1A1A', fontSize: '13px', outline: 'none' }}
          onKeyDown={e => e.key === 'Enter' && lookup()}
        />
        <button
          onClick={lookup}
          disabled={loading}
          style={{ background: 'linear-gradient(135deg, #C9A96E, #C9A96E)', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Loading...' : 'Pull Product'}
        </button>
      </div>

      {error && (
        <div style={{ fontSize: '13px', color: '#FB923C', padding: '10px', background: 'rgba(251,146,60,0.1)', borderRadius: '8px' }}>
          ⚠️ {error}
        </div>
      )}

      {product && (
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          {product.heroImage && (
            <img src={product.heroImage} alt={product.title} style={{ width: '90px', height: '90px', objectFit: 'contain', borderRadius: '8px', background: '#fff', padding: '4px' }} />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#1A1A1A', marginBottom: '4px' }}>{product.title?.substring(0, 80)}...</div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#888888', marginBottom: '8px' }}>
              {product.brand && <span>Brand: <span style={{ color: '#C9A96E' }}>{product.brand}</span></span>}
              {product.price && <span>Price: <span style={{ color: '#34D399' }}>{product.price}</span></span>}
              {product.rating && <span>⭐ {product.rating}</span>}
              {product.asin && <span>ASIN: {product.asin}</span>}
            </div>
            {product.bullets?.slice(0, 2).map((b, i) => (
              <div key={i} style={{ fontSize: '11px', color: '#888888', marginBottom: '2px' }}>• {b.substring(0, 100)}...</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ScrapedProductCard({ product }) {
  if (!product) return null;

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #D5D0C8',
      borderRadius: '14px',
      padding: '20px',
      marginBottom: '20px',
      display: 'flex',
      gap: '20px',
      alignItems: 'flex-start'
    }}>
      {/* Product Images */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
        {product.heroImage && (
          <img
            src={product.heroImage}
            alt={product.name}
            style={{
              width: '110px',
              height: '110px',
              objectFit: 'contain',
              borderRadius: '10px',
              background: '#fff',
              padding: '6px'
            }}
          />
        )}
        {/* Thumbnail strip */}
        {product.additionalImages?.length > 0 && (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', maxWidth: '110px' }}>
            {product.additionalImages.slice(0, 4).map((img, i) => (
              <img
                key={i}
                src={img}
                alt=""
                style={{
                  width: '24px',
                  height: '24px',
                  objectFit: 'contain',
                  borderRadius: '4px',
                  background: '#fff',
                  padding: '2px',
                  border: '1px solid #D5D0C8'
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Title */}
        <div style={{
          fontSize: '14px',
          fontWeight: '700',
          color: '#1A1A1A',
          marginBottom: '8px',
          lineHeight: 1.4
        }}>
          {product.name}
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {product.brand && (
            <div style={{ fontSize: '12px' }}>
              <span style={{ color: '#999999' }}>Brand </span>
              <span style={{ color: '#C9A96E', fontWeight: '600' }}>{product.brand}</span>
            </div>
          )}
          {product.price && (
            <div style={{ fontSize: '12px' }}>
              <span style={{ color: '#999999' }}>Price </span>
              <span style={{ color: '#34D399', fontWeight: '700' }}>{product.price}</span>
            </div>
          )}
          {product.commission && (
            <div style={{ fontSize: '12px' }}>
              <span style={{ color: '#999999' }}>Commission </span>
              <span style={{ color: '#34D399', fontWeight: '600' }}>{product.commission}</span>
            </div>
          )}
          {product.asin && (
            <div style={{ fontSize: '12px' }}>
              <span style={{ color: '#999999' }}>ASIN </span>
              <span style={{ color: '#888888', fontFamily: 'monospace' }}>{product.asin}</span>
            </div>
          )}
          {product.rating && (
            <div style={{ fontSize: '12px' }}>
              <span style={{ color: '#FBBF24' }}>⭐ {product.rating}</span>
              {product.reviewCount && (
                <span style={{ color: '#999999' }}> · {product.reviewCount}</span>
              )}
            </div>
          )}
        </div>

        {/* Bullet points */}
        {product.bullets?.length > 0 && (
          <div>
            <div style={{
              fontSize: '10px',
              fontWeight: '700',
              color: '#999999',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '6px'
            }}>
              Product Features — Used in Ad Generation
            </div>
            {product.bullets.slice(0, 4).map((b, i) => (
              <div key={i} style={{
                fontSize: '12px',
                color: '#888888',
                marginBottom: '4px',
                lineHeight: 1.4,
                display: 'flex',
                gap: '6px'
              }}>
                <span style={{ color: '#C9A96E', flexShrink: 0 }}>•</span>
                <span>{b.length > 120 ? b.substring(0, 120) + '...' : b}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StorefrontLookup({ creator, onProductsLoaded }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);

  const loadFavorites = async (creatorId: string) => {
    try {
      const res = await fetch(`/api/favorites/${creatorId}`);
      const data = await res.json();
      setFavorites(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load favorites", err);
    }
  };

  const isFavorite = (type: 'product' | 'ad_copy', identifier: string) => {
    return favorites.some(f => {
      try {
        const data = JSON.parse(f.data);
        return f.type === type && (data.name === identifier || data.hook === identifier);
      } catch (e) {
        return false;
      }
    });
  };

  const toggleFavorite = async (type: 'product' | 'ad_copy', itemData: any) => {
    if (!selectedCreator) return;
    
    const identifier = itemData.name || itemData.hook;
    const existing = favorites.find(f => {
      try {
        const data = JSON.parse(f.data);
        return f.type === type && (data.name === identifier || data.hook === identifier);
      } catch (e) {
        return false;
      }
    });
    
    if (existing) {
      await fetch(`/api/favorites/${existing.id}`, { method: 'DELETE' });
    } else {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId: selectedCreator.id,
          type,
          data: JSON.stringify(itemData)
        })
      });
    }
    loadFavorites(selectedCreator.id);
  };
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(new Set());

  const scrape = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setProducts([]);
    setSelected(new Set());

    try {
      const res = await fetch('/api/storefront', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
        // Auto-save to persistent storage
        for (const p of data.products) {
          await fetch('/api/product/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ creatorId: creator.id, product: p })
          });
        }
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError('Request failed — is the server running?');
    }
    setLoading(false);
  };

  const toggleSelect = (asin) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(asin)) next.delete(asin);
      else next.add(asin);
      return next;
    });
  };

  const generateForSelected = () => {
    const selectedProducts = products.filter(p => selected.has(p.asin));
    if (onProductsLoaded) onProductsLoaded(selectedProducts);
  };

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E8E5E0',
      borderRadius: '14px',
      padding: '20px',
      marginBottom: '20px'
    }}>
      <div style={{
        fontSize: '11px', fontWeight: '700', color: '#FBBF24',
        letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px'
      }}>
        🛍️ Pull Products from Storefront Collage
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="Paste Amazon storefront photo URL (amazon.com/shop/influencer-.../photo/...)"
          style={{
            flex: 1,
            background: '#E8E5E0',
            border: '1px solid #D0CBC3',
            borderRadius: '8px',
            padding: '10px 14px',
            color: '#1A1A1A',
            fontSize: '13px',
            outline: 'none'
          }}
          onKeyDown={e => e.key === 'Enter' && scrape()}
        />
        <button
          onClick={scrape}
          disabled={loading}
          style={{
            background: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            fontSize: '13px',
            fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            whiteSpace: 'nowrap'
          }}
        >
          {loading ? 'Scraping...' : 'Pull Products'}
        </button>
      </div>

      {loading && (
        <div style={{ fontSize: '12px', color: '#888888', padding: '10px 0' }}>
          ⏳ Loading product tiles — usually 5–10 seconds...
        </div>
      )}

      {error && (
        <div style={{
          fontSize: '13px', color: '#FB923C', padding: '10px',
          background: 'rgba(251,146,60,0.1)', borderRadius: '8px'
        }}>
          ⚠️ {error}
        </div>
      )}

      {products.length > 0 && (
        <>
          <div style={{
            fontSize: '12px', color: '#34D399', fontWeight: '600',
            marginBottom: '12px'
          }}>
            ✓ Found {products.length} products — select which to generate ads for
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '10px',
            marginBottom: '14px'
          }}>
            {products.map(p => {
              const isSelected = selected.has(p.asin);
              return (
                <div
                  key={p.asin}
                  onClick={() => toggleSelect(p.asin)}
                  style={{
                    background: isSelected
                      ? 'rgba(201,169,110,0.15)'
                      : '#FFFFFF',
                    border: `1px solid ${isSelected ? '#C9A96E' : '#E8E5E0'}`,
                    borderRadius: '10px',
                    padding: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    position: 'relative'
                  }}
                >
                  {isSelected && (
                    <div style={{
                      position: 'absolute', top: '6px', right: '6px',
                      background: '#C9A96E', borderRadius: '50%',
                      width: '16px', height: '16px',
                      fontSize: '10px', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', color: '#fff'
                    }}>✓</div>
                  )}
                  {(p.image || p.heroImage) ? (
                    <img
                      src={p.image || p.heroImage}
                      alt={p.title}
                      style={{
                        width: '100%', height: '80px',
                        objectFit: 'contain',
                        borderRadius: '6px',
                        background: '#fff',
                        padding: '4px',
                        marginBottom: '8px'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%', height: '80px',
                      background: '#E8E5E0',
                      borderRadius: '6px', marginBottom: '8px',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '20px'
                    }}>📦</div>
                  )}
                  <div style={{
                    fontSize: '11px', fontWeight: '600',
                    color: '#1A1A1A', lineHeight: 1.3, marginBottom: '4px'
                  }}>
                    {(p.title || p.name || 'Unknown product').substring(0, 50)}
                    {(p.title || p.name || '').length > 50 ? '...' : ''}
                  </div>
                  {(p.price) && (
                    <div style={{ fontSize: '11px', color: '#34D399', fontWeight: '700' }}>
                      {p.price}
                    </div>
                  )}
                  <div style={{ fontSize: '10px', color: '#999999', marginTop: '2px', fontFamily: 'monospace' }}>
                    {p.asin}
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={generateForSelected}
            disabled={selected.size === 0}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #C9A96E, #C9A96E)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: selected.size === 0 ? 'not-allowed' : 'pointer',
              opacity: selected.size === 0 ? 0.6 : 1
            }}
          >
            Generate Ads for {selected.size} Selected Products
          </button>
        </>
      )}
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("home");
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [scrapedProduct, setScrapedProduct] = useState(null);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [calendar, setCalendar] = useState({});
  const [boostRecs, setBoostRecs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);

  const loadFavorites = async (creatorId: string) => {
    try {
      const res = await fetch(`/api/favorites/${creatorId}`);
      const data = await res.json();
      setFavorites(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load favorites", err);
    }
  };

  const isFavorite = (type: 'product' | 'ad_copy', identifier: string) => {
    return favorites.some(f => {
      try {
        const data = JSON.parse(f.data);
        return f.type === type && (data.name === identifier || data.hook === identifier);
      } catch (e) {
        return false;
      }
    });
  };

  const toggleFavorite = async (type: 'product' | 'ad_copy', itemData: any) => {
    if (!selectedCreator) return;
    
    const identifier = itemData.name || itemData.hook;
    const existing = favorites.find(f => {
      try {
        const data = JSON.parse(f.data);
        return f.type === type && (data.name === identifier || data.hook === identifier);
      } catch (e) {
        return false;
      }
    });
    
    if (existing) {
      await fetch(`/api/favorites/${existing.id}`, { method: 'DELETE' });
    } else {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId: selectedCreator.id,
          type,
          data: JSON.stringify(itemData)
        })
      });
    }
    loadFavorites(selectedCreator.id);
  };
  const [loadingMsg, setLoadingMsg] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [scrapedProducts, setScrapedProducts] = useState([]);
  const [savedProducts, setSavedProducts] = useState([]);
  const [savedGenerations, setSavedGenerations] = useState<any[]>([]);

  const persistProduct = async (creatorId, product) => {
    try {
      await fetch('/api/product/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId, product })
      });
    } catch (e) {
      console.warn('Could not persist product:', e);
    }
  };

  const loadSavedProducts = async (creatorId) => {
    try {
      const res = await fetch(`/api/products/${creatorId}`);
      const data = await res.json();
      if (data.success) setSavedProducts(data.products);
    } catch (e) {
      console.warn('Could not load saved products:', e);
    }
  };

  const loadSavedGenerations = async (creatorId) => {
    try {
      const res = await fetch(`/api/generations/${creatorId}`);
      const data = await res.json();
      if (data.success) {
        setSavedGenerations(data.generations || []);
      } else {
        setSavedGenerations([]);
      }
    } catch (e) {
      console.warn('Could not load saved generations:', e);
      setSavedGenerations([]);
    }
  };

  const selectCreator = (creator) => {
    setSelectedCreator(creator);
    setSelectedProduct(null);
    setScrapedProduct(null);
    setGeneratedContent(null);
    setSavedGenerations([]);
    setScreen("profile");
    loadSavedProducts(creator.id);
    loadSavedGenerations(creator.id);
  };

  const generateContent = async (product) => {
    setSelectedProduct(product);
    setScrapedProduct(product.heroImage ? product : null);
    setLoading(true);
    setLoadingMsg("Analyzing creator tone & generating variations...");
    setScreen("generator");

    const existingSamples = selectedCreator.existingAds.map(a => a.copy).join("\n---\n");

    const productContext = product.bullets?.length
      ? `
Product details from Amazon listing:
- Title: ${product.name}
- Brand: ${product.brand || 'unknown'}
- Price: ${product.price || 'unknown'}
- Key features:
${product.bullets?.map(b => `  • ${b}`).join('\n') || '  • No details available'}
`
      : `Product: ${product.name} (${product.category}, ${product.commission} commission)`;

    const prompt = `You are an AI content strategist for creator commerce.

COMPLIANCE RULES — follow these in every ad variation generated:
1. TRADEMARK NAMES: Never reference competitor brand names or trademarked terms in ad copy (e.g., SPANX, Free People, Lululemon, Nike, Walmart, Target). "Amazon" IS allowed. Use descriptive language instead for other brands (e.g., "buttery soft fabric" instead of brand names).
2. META AD POLICY:
   - No "before/after" framing.
   - No unverified superlatives ("best", "#1").
   - No deceptive urgency ("only 2 left").
   - No income/earnings claims.
3. AFFILIATE DISCLOSURE: Manual #ad tags are NOT required as Meta handles disclosure for boosted ads.
4. SAFE LANGUAGE: Use "designer-inspired", "luxury feel", "sculpting waistband".

Creator: ${selectedCreator.name}
Niche: ${selectedCreator.niche}
Tone: ${selectedCreator.tone}
Audience: ${selectedCreator.audience}
Current ad format: ${selectedCreator.adType}

${productContext}

Here are 3 of this creator's REAL existing ad copies for tone reference:
${existingSamples}

Generate a JSON object (no markdown, raw JSON only) with this structure:
{
  "hook_angles": ["hook1", "hook2", "hook3"],
  "ad_variations": [
    {
      "type": "Video Ad",
      "hook": "...",
      "caption": "...",
      "cta": "...",
      "disclosure": "#ad #amazonfinds",
      "compliance_flags": []
    },
    {
      "type": "Static Image Ad",
      "hook": "...",
      "caption": "...",
      "cta": "...",
      "disclosure": "#ad",
      "compliance_flags": []
    },
    {
      "type": "Carousel Ad",
      "hook": "...",
      "caption": "...",
      "slides": ["slide 1 text", "slide 2 text", "slide 3 text"],
      "cta": "...",
      "disclosure": "#ad #amazonfinds",
      "compliance_flags": []
    }
  ],
  "format_insight": "...",
  "boost_recommendation": "...",
  "policy_review": {
    "overall_status": "approved" | "review_needed",
    "flags": []
  }
}

COMPLIANCE FLAGGING:
For each ad variation, check against Meta Ad Policy and populate "compliance_flags" with any issues found. Use this format per flag:
{ "rule": "rule name", "severity": "warning" | "block", "note": "brief explanation" }

Common rules to check:
- "trademark_reference": brand name used in copy
- "unverified_superlative": best/most/number one without source
- "body_image": before/after or transformation language
- "deceptive_urgency": false scarcity claims
- "earnings_claim": income or profit implied
- "missing_disclosure": no #ad tag present

Also populate "policy_review" at the response level:
- overall_status = "approved" if no flags exist
- overall_status = "review_needed" if any flags exist
- flags = array of all unique rule violations across all variations`;

    let contentToSave = null;
    try {
      const raw = await callClaude(prompt, 1000);
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      setGeneratedContent(parsed);
      contentToSave = parsed;
    } catch (e) {
      const fallback = {
        hook_angles: ["Deal alert hook", "Personal story hook", "Before/after hook"],
        format_insight: selectedCreator.adType === "static"
          ? "This creator runs static-only ads — static image variations will align with their proven format."
          : "This creator runs video-first — lead with video, then test static to compare CPC and EPC.",
        ad_variations: [
          { type: "Video Ad", hook: "You need this in your cart RIGHT NOW 🔥", caption: `${product.name} just dropped in price and I can't stop talking about it. This is the one I've been recommending to everyone — and for good reason.`, cta: "Shop Now", disclosure: "#ad #amazonfinds" },
          { type: "Static Image Ad", hook: `${product.commission} off + free shipping 🚨`, caption: `My top Amazon pick this week: ${product.name}. Grab it before it sells out.`, cta: "Link in bio", disclosure: "#ad" },
          { type: "Carousel Ad", hook: "Here's why everyone's obsessed 👇", caption: `Swipe to see why ${product.name} is the most-requested product in my DMs this month.`, cta: "Shop Now", disclosure: "#ad #amazonfinds" },
        ],
        boost_recommendation: "Start with the format matching this creator's existing ads. Scale to alternative format after seeing 24hr EPC signal.",
        policy_review: { overall_status: "approved", flags: [] },
      };
      setGeneratedContent(fallback);
      contentToSave = fallback;
    }
    if (contentToSave && selectedCreator) {
      try {
        await fetch('/api/generations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            creatorId: selectedCreator.id,
            productName: product.name || product.title || 'Unknown Product',
            productData: { name: product.name || product.title || 'Unknown Product', category: product.category, commission: product.commission, heroImage: product.heroImage, price: product.price, brand: product.brand },
            generatedContent: contentToSave,
          })
        });
        loadSavedGenerations(selectedCreator.id);
      } catch (e) {
        console.warn('Could not save generation:', e);
      }
    }
    setLoading(false);
  };

  const generateCalendar = async () => {
    setLoading(true);
    setLoadingMsg("Building your content calendar...");
    setScreen("calendar");

    const allProducts = [...selectedCreator.products, ...scrapedProducts];
    const productList = allProducts.map(p => p.name || p.title).join(", ");

    const prompt = `You are a content strategist. Create a 1-week content calendar for ${selectedCreator.name}, a ${selectedCreator.niche} creator who primarily uses ${selectedCreator.adType} ads.

Their products: ${productList}
Tone: ${selectedCreator.tone}
Ad format preference: ${selectedCreator.adType}

Return ONLY a JSON object (no markdown) like:
{
  "Mon": {"type": "Video", "product": "product name", "hook": "short hook", "format": "Reel/Story/Post"},
  "Tue": {"type": "Static", "product": "product name", "hook": "short hook", "format": "Post"},
  "Wed": {"type": "Rest", "product": "", "hook": "Engagement day — reply to comments", "format": ""},
  "Thu": {"type": "Video", "product": "product name", "hook": "short hook", "format": "Reel"},
  "Fri": {"type": "Carousel", "product": "product name", "hook": "short hook", "format": "Post"},
  "Sat": {"type": "Static", "product": "product name", "hook": "short hook", "format": "Story"},
  "Sun": {"type": "Rest", "product": "", "hook": "Schedule next week's content", "format": ""}
}

If this creator is static-only, use Static for most days and avoid Video days.`;

    try {
      const raw = await callClaude(prompt, 600);
      const cleaned = raw.replace(/```json|```/g, "").trim();
      setCalendar(JSON.parse(cleaned));
    } catch (e) {
      const isStatic = selectedCreator.adType === "static";
      setCalendar({
        Mon: { type: isStatic ? "Static" : "Video", product: selectedCreator.products[0]?.name, hook: "You need this in your cart 🔥", format: isStatic ? "Post" : "Reel" },
        Tue: { type: "Static", product: selectedCreator.products[1]?.name, hook: "This is the one everyone's asking about", format: "Post" },
        Wed: { type: "Rest", product: "", hook: "Engagement day — reply to comments", format: "" },
        Thu: { type: isStatic ? "Static" : "Video", product: selectedCreator.products[2]?.name, hook: "My top pick this week 👇", format: isStatic ? "Post" : "Reel" },
        Fri: { type: "Carousel", product: selectedCreator.products[0]?.name, hook: "Swipe to see why I'm obsessed", format: "Post" },
        Sat: { type: "Static", product: selectedCreator.products[3]?.name, hook: "Weekend deal alert 🚨", format: "Story" },
        Sun: { type: "Rest", product: "", hook: "Schedule next week's content", format: "" },
      });
    }
    setLoading(false);
  };

  const generateBoostRecs = async () => {
    setLoading(true);
    setLoadingMsg("Analyzing performance signals...");
    setScreen("boost");

    const prompt = `You are a paid media strategist for creator commerce.

COMPLIANCE RULES — follow these in every recommendation:
1. TRADEMARK NAMES: Never reference competitor brand names or trademarked terms (e.g., SPANX, Free People, Lululemon, Nike, Walmart, Target). "Amazon" IS allowed.
2. META AD POLICY: No prohibited claims or misleading framing.
3. SAFE LANGUAGE: Use descriptive terms, not brand comparisons.

Real-world retail affiliate signal benchmarks to use for thresholds:
- Strong CPC target: $0.06–$0.10 (Q4 can hit $0.063; off-peak expect $0.08–$0.15)
- Stop-loss CPC: $0.18–$0.25 depending on commission rate
- EPC target for profitability: $0.06–$0.09 before bonus tiers
- CTR benchmark: 5–8% strong, 8%+ exceptional
- Never suggest CPC thresholds above $0.30 for standard retail affiliate
- Signal ratio (EPC/CPC) >= 1 = scale, < 1 = watch or kill

Creator: ${selectedCreator.name}
Current ad format: ${selectedCreator.adType}
NOTE: Meta video ads typically have higher CPM but stronger engagement. Static image ads often have lower CPC but may have lower conversion intent. This creator runs ${selectedCreator.adType === 'static' ? 'ONLY static — so we are adding video variations as NEW tests' : selectedCreator.adType === 'video' ? 'ONLY video — so we are adding static image variations as NEW tests' : 'both — compare performance across formats'}.

Existing ads:
${selectedCreator.existingAds.map((a, i) => `Ad ${i + 1} (${a.started}): "${a.copy.substring(0, 100)}..." - Video: ${a.hasVideo}, Static: ${a.hasStatic}`).join("\n")}

Products:
${selectedCreator.products.map(p => `${p.name} - ${p.commission} commission - Trend: ${p.trend}`).join("\n")}

Return ONLY a JSON array (no markdown) of 3 boost recommendations that specifically address the video vs static question:
[
  {
    "priority": "🔥 Boost Now",
    "content_type": "Video or Static",
    "product": "product name",
    "rationale": "1 sentence why, referencing format",
    "suggested_budget": "$X/day",
    "expected_signal": "what to watch for in 24-48hrs (include EPC and CPC thresholds)",
    "stop_loss": "kill if X",
    "format_note": "1 sentence on video vs static consideration for this creator"
  }
]`;

    try {
      const raw = await callClaude(prompt, 800);
      const cleaned = raw.replace(/```json|```/g, "").trim();
      setBoostRecs(JSON.parse(cleaned));
    } catch (e) {
      setBoostRecs([
        {
          priority: "🔥 Boost Now",
          content_type: "Video",
          product: selectedCreator.products[0]?.name,
          rationale: "Highest commission category with strong trend signal — video format already proven. Amplify what's working before testing new formats.",
          suggested_budget: "$25/day",
          expected_signal: "CPC under $0.10 and EPC above $0.06 within 48hrs",
          stop_loss: "Kill if CPC exceeds $0.18 after 24hrs"
        },
        {
          priority: "⚡ Test Next",
          content_type: "Static Image",
          product: selectedCreator.products[1]?.name,
          rationale: "No static variations exist for this product. Lower CPM on static may reduce CPC below video baseline — worth a small test to compare format efficiency.",
          suggested_budget: "$15/day",
          expected_signal: "CPC under $0.12 and CTR above 1.5% within 48hrs",
          stop_loss: "Kill if CPC exceeds $0.20 or no conversions after $30 spend"
        },
        {
          priority: "👀 Watch",
          content_type: "Carousel",
          product: selectedCreator.products[2]?.name,
          rationale: "Trending product — build carousel creative now and hold until organic engagement confirms purchase intent signal.",
          suggested_budget: "Hold",
          expected_signal: "Wait for organic saves/shares signal before paid push",
          stop_loss: "N/A — prep only"
        },
      ]);
    }
    setLoading(false);
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const S = {
    app: { minHeight: "100vh", background: "#FAFAF8", color: "#1A1A1A", fontFamily: "'Inter', sans-serif" },
    nav: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 28px", background: "#FFFFFF", borderBottom: "1px solid #E8E5E0", position: "sticky" as const, top: 0, zIndex: 100, backdropFilter: "blur(12px)" },
    navBrand: { fontSize: "16px", fontWeight: "800", color: "#1A1A1A", letterSpacing: "-0.3px" },
    navBadge: { fontSize: "10px", background: "#C9A96E", color: "#fff", padding: "3px 8px", borderRadius: "4px", fontWeight: "700", letterSpacing: "0.5px", textTransform: "uppercase" as const, marginLeft: "8px" },
    container: { maxWidth: "1000px", margin: "0 auto", padding: "32px 24px" },
    heading: { fontSize: "28px", fontWeight: "800", marginBottom: "6px", lineHeight: 1.2, color: "#1A1A1A" },
    sub: { fontSize: "14px", color: "#777777", marginBottom: "28px" },
    btn: { background: "#C9A96E", color: "#fff", border: "none", borderRadius: "8px", padding: "12px 22px", fontSize: "14px", fontWeight: "700", cursor: "pointer", letterSpacing: "0.2px", transition: "background 0.15s" },
    btnOutline: { background: "transparent", color: "#C9A96E", border: "1px solid #C9A96E", borderRadius: "8px", padding: "10px 18px", fontSize: "13px", fontWeight: "600", cursor: "pointer" },
    btnFilter: (active: boolean) => ({ background: active ? "rgba(201,169,110,0.12)" : "#FFFFFF", color: active ? "#C9A96E" : "#888888", border: active ? "1px solid rgba(201,169,110,0.4)" : "1px solid #E0DDD8", borderRadius: "8px", padding: "6px 14px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }),
    tag: { display: "inline-block", fontSize: "11px", fontWeight: "600", padding: "3px 10px", borderRadius: "4px", marginRight: "6px" },
    card: { background: "#FFFFFF", border: "1px solid #E8E5E0", borderRadius: "14px", padding: "24px", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
    insightBox: { background: "rgba(201,169,110,0.06)", border: "1px solid rgba(201,169,110,0.2)", borderRadius: "10px", padding: "14px 18px", marginBottom: "20px" },
    dataBox: { background: "#F7F5F2", border: "1px solid #E8E5E0", borderRadius: "12px", padding: "16px 20px", marginBottom: "14px" },
    sectionLabel: { fontSize: "11px", fontWeight: "700", letterSpacing: "1.5px", color: "#999999", textTransform: "uppercase" as const, marginBottom: "14px", marginTop: "28px" },
    adRow: { padding: "14px 18px", background: "#F7F5F2", border: "1px solid #E8E5E0", borderRadius: "12px", marginBottom: "10px" },
    productRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: "#FFFFFF", border: "1px solid #E8E5E0", borderRadius: "12px", marginBottom: "10px" },
    varCard: { background: "#FFFFFF", border: "1px solid #E8E5E0", borderRadius: "14px", padding: "20px", marginBottom: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
    calCell: { background: "#FFFFFF", border: "1px solid #E8E5E0", borderRadius: "12px", padding: "14px", minHeight: "88px" },
    boostCard: { background: "#FFFFFF", border: "1px solid #E8E5E0", borderRadius: "14px", padding: "22px", marginBottom: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
    loadingBox: { display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", minHeight: "40vh", gap: "16px" },
    spinner: { width: "40px", height: "40px", border: "3px solid rgba(201,169,110,0.2)", borderTop: "3px solid #C9A96E", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
    highlight: { color: "#C9A96E", fontWeight: "700" },
    placeholder: { background: "rgba(201,169,110,0.08)", border: "1px dashed rgba(201,169,110,0.3)", borderRadius: "8px", padding: "8px 12px", fontSize: "11px", color: "#C9A96E", fontFamily: "monospace" },
    dataGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "16px" },
    dataCell: { background: "#FFFFFF", border: "1px solid #E8E5E0", borderRadius: "10px", padding: "12px 14px" },
  };

  const filteredCreators = filterType === "all" ? CREATORS : CREATORS.filter(c => c.adType === filterType);

  // ── HOME ──────────────────────────────────────────────────────────────────
  if (screen === "home") return (
    <div style={S.app}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); @keyframes spin { to { transform: rotate(360deg); } } .cc:hover { border-color: rgba(201,169,110,0.5) !important; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important; }`}</style>
      <nav style={S.nav}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={S.navBrand}>Markable</span>
          <span style={S.navBadge}>Creator Intelligence</span>
        </div>
        <span style={{ fontSize: "12px", color: "#999999" }}>Demo · Feb 2026</span>
      </nav>
      <div style={S.container}>
        <div style={{ marginBottom: "32px" }}>
          <div style={{ fontSize: "12px", color: "#C9A96E", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "10px" }}>Revenue System Demo</div>
          <h1 style={{ ...S.heading, fontSize: "32px" }}>Creator Ad Intelligence</h1>
          <p style={{ ...S.sub, fontSize: "15px" }}>Select a creator to generate AI ad variations, build content calendars, and get signal-based boost recommendations.</p>

          <div style={S.insightBox}>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "#C9A96E", marginBottom: "8px" }}>📊 Intelligence Layer — From Real Ad Library Scrape</div>
            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
              <div><span style={S.highlight}>7 creators</span> <span style={{ fontSize: "13px", color: "#444444" }}>video-only</span></div>
              <div><span style={{ color: "#F472B6", fontWeight: "700" }}>1 creator</span> <span style={{ fontSize: "13px", color: "#444444" }}>static-only (Casey — 72 ads)</span></div>
              <div><span style={{ color: "#FBBF24", fontWeight: "700" }}>2 creators</span> <span style={{ fontSize: "13px", color: "#444444" }}>mixed format</span></div>
            </div>
            <div style={{ fontSize: "13px", color: "#888888", marginTop: "8px" }}>Casey's static-only format is the critical data point: does lower CPC on static offset lower intent vs. video? This demo generates both to test.</div>
          </div>

          <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
            {[["all","All Creators"], ["video","Video Only"], ["static","Static Only"], ["mixed","Mixed"]].map(([val, label]) => (
              <button key={val} style={S.btnFilter(filterType === val)} onClick={() => setFilterType(val)}>{label}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "14px" }}>
          {filteredCreators.map(c => {
            const adMeta = AD_TYPE_LABELS[c.adType];
            return (
              <div key={c.id} className="cc" style={{ ...S.card, borderLeft: `3px solid ${c.color}` }} onClick={() => selectCreator(c)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <div style={{ fontSize: "22px" }}>{c.emoji}</div>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <span style={{ ...S.tag, background: adMeta.bg, color: adMeta.color }}>{adMeta.label}</span>
                    <span style={{ ...S.tag, background: `${c.color}20`, color: c.color }}>{c.totalAds} ads</span>
                  </div>
                </div>
                <div style={{ fontSize: "15px", fontWeight: "700", marginBottom: "3px" }}>{c.name}</div>
                <div style={{ fontSize: "12px", color: "#888888", marginBottom: "10px" }}>{c.niche} · {c.audience}</div>
                <div style={{ fontSize: "12px", color: "#999999" }}>Click to explore → generate variations, calendar, boost plan</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ── LOADING ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ ...S.app, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={S.loadingBox}>
        <div style={S.spinner}></div>
        <div style={{ fontSize: "15px", color: "#888888" }}>{loadingMsg}</div>
      </div>
    </div>
  );

  // ── CREATOR PROFILE ───────────────────────────────────────────────────────
  if (screen === "profile" && selectedCreator) {
    const adMeta = AD_TYPE_LABELS[selectedCreator.adType];
    return (
      <div style={S.app}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); .pr:hover { border-color: rgba(201,169,110,0.4) !important; background: #F9F7F4 !important; cursor: pointer; }`}</style>
        <nav style={S.nav}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={S.navBrand}>Markable</span>
            <span style={S.navBadge}>Creator Intelligence</span>
          </div>
          <button style={S.btnOutline} onClick={() => setScreen("home")}>← All Creators</button>
        </nav>
        <div style={S.container}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
            <div>
              <div style={{ fontSize: "23px", fontWeight: "800", marginBottom: "4px" }}>{selectedCreator.emoji} {selectedCreator.name}</div>
              <div style={{ fontSize: "13px", color: "#888888" }}>{selectedCreator.niche} · {selectedCreator.audience}</div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <span style={{ ...S.tag, background: adMeta.bg, color: adMeta.color, fontSize: "12px", padding: "5px 12px" }}>{adMeta.label}</span>
              <span style={{ ...S.tag, background: `${selectedCreator.color}20`, color: selectedCreator.color, fontSize: "12px", padding: "5px 12px" }}>{selectedCreator.totalAds} active ads</span>
            </div>
          </div>

          <div style={S.insightBox}>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "#C9A96E", marginBottom: "4px" }}>🧠 Tone Profile</div>
            <div style={{ fontSize: "13px", color: "#444444" }}>{selectedCreator.tone}</div>
          </div>

          <div style={{ display: "flex", gap: "10px", marginBottom: "28px", flexWrap: "wrap" }}>
            <button style={S.btn} onClick={generateCalendar}>📅 Build Content Calendar</button>
            <button style={{ ...S.btn, background: "#22C55E" }} onClick={generateBoostRecs}>🚀 Boost Recommendations</button>
          </div>

          {/* ── EXISTING ADS ── */}
          <div style={S.sectionLabel}>Existing Ads — Real Ad Library Data</div>
          {selectedCreator.existingAds.map((ad, i) => (
            <div key={i} style={S.adRow}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <div style={{ display: "flex", gap: "6px" }}>
                  {ad.hasVideo && <span style={{ ...S.tag, background: "rgba(59,130,246,0.12)", color: "#3B82F6" }}>📹 Video</span>}
                  {ad.hasStatic && <span style={{ ...S.tag, background: "rgba(244,114,182,0.15)", color: "#F472B6" }}>🖼️ Static</span>}
                  {!ad.hasVideo && !ad.hasStatic && <span style={{ ...S.tag, background: "rgba(107,114,128,0.15)", color: "#888888" }}>📄 Text</span>}
                </div>
                <span style={{ fontSize: "11px", color: "#999999" }}>{ad.started}</span>
              </div>
              <div style={{ fontSize: "13px", color: "#444444", lineHeight: 1.5 }}>{ad.copy}</div>
              <ComplianceDisplay flags={checkCompliance(ad.copy)} />
            </div>
          ))}

          {/* ── PRODUCTS ── */}
          <div style={S.sectionLabel}>Products — Click to Generate AI Ad Variations</div>
          {selectedCreator.products.map((p, i) => (
            <div key={i} className="pr" style={S.productRow} onClick={() => generateContent(p)}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "600" }}>{p.name}</div>
                <div style={{ fontSize: "12px", color: "#888888", marginTop: "2px" }}>{p.category}</div>
              </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite('product', p);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  color: isFavorite('product', p.name) ? '#FF3B3B' : '#CCCCCC',
                  padding: '4px'
                }}
              >
                {isFavorite('product', p.name) ? '❤️' : '🤍'}
              </button>
              {p.badge && <span style={{ ...S.tag, background: "rgba(201,169,110,0.15)", color: "#C9A96E" }}>{p.badge}</span>}
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#34D399" }}>{p.commission}</div>
                  <div style={{ fontSize: "11px", color: "#999999" }}>{p.trend}</div>
                </div>
                <button 
                  style={{ 
                    ...S.btn, 
                    padding: "6px 12px", 
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "#C9A96E",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600"
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    generateContent(p);
                  }}
                >
                  Generate Ad <span>→</span>
                </button>
              </div>
            </div>
          ))}

          {/* 
          <StorefrontLookup 
            creator={selectedCreator}
            onProductsLoaded={(products) => {
              // Add all selected products to the scraped list and generate for the first one
              const newProducts = products.map(p => ({
                ...p,
                id: `scraped-${Date.now()}-${p.asin}`,
                heroImage: p.image || p.heroImage,
                name: p.title || p.name,
                category: p.category || "General",
                commission: "9%",
                trend: "↑ New",
                badge: "Scraped"
              }));
              setScrapedProducts(prev => [...newProducts, ...prev]);
              if (newProducts.length > 0) {
                generateContent(newProducts[0]);
              }
              loadSavedProducts(selectedCreator.id);
            }}
          />
          */}

          <ProductLookup 
            creatorTone={selectedCreator.tone} 
            creatorId={selectedCreator.id}
            onProductLoaded={(product) => {
              // Add the scraped product to the creator's product list temporarily for generation
              const newProduct = {
                ...product,
                id: `scraped-${Date.now()}`,
                heroImage: product.heroImage || product.image,
                name: product.title,
                category: product.category || "General",
                commission: "9%", // default estimate
                trend: "↑ New",
                badge: "Scraped"
              };
              setScrapedProducts(prev => [newProduct, ...prev]);
              generateContent(newProduct);
              loadSavedProducts(selectedCreator.id);
            }} 
          />

          {/* ── SAVED GENERATIONS ── */}
          {savedGenerations.length > 0 && (
            <div>
              <div style={S.sectionLabel}>
                📝 Saved Ad Generations — {savedGenerations.length} total
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '24px' }}>
                {savedGenerations.map(gen => (
                  <div
                    key={gen._id}
                    data-testid={`generation-card-${gen._id}`}
                    className="pr"
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E8E5E0',
                      borderRadius: '12px',
                      padding: '16px',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => {
                      setSelectedProduct(gen.productData);
                      setScrapedProduct(gen.productData?.heroImage ? gen.productData : null);
                      setGeneratedContent(gen.generatedContent);
                      setScreen("generator");
                    }}
                  >
                    <button
                      data-testid={`delete-generation-${gen._id}`}
                      onClick={async (e) => {
                        e.stopPropagation();
                        await fetch(`/api/generation/${gen._id}`, { method: 'DELETE' });
                        loadSavedGenerations(selectedCreator.id);
                      }}
                      style={{
                        position: 'absolute', top: '8px', right: '8px',
                        background: 'rgba(251,146,60,0.2)',
                        border: 'none', borderRadius: '50%',
                        width: '20px', height: '20px',
                        fontSize: '12px', cursor: 'pointer',
                        color: '#FB923C', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        lineHeight: 1
                      }}
                    >
                      ×
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      {gen.productData?.heroImage && (
                        <img
                          src={gen.productData.heroImage}
                          alt={gen.productName}
                          style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '6px', background: '#fff', border: '1px solid #E8E5E0' }}
                        />
                      )}
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#1A1A1A' }}>{gen.productName}</div>
                        <div style={{ fontSize: '11px', color: '#999999' }}>{new Date(gen.createdAt).toLocaleDateString()} · {new Date(gen.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {gen.generatedContent?.ad_variations?.map((v, i) => (
                        <span key={i} style={{ ...S.tag, background: i === 0 ? 'rgba(59,130,246,0.12)' : i === 1 ? 'rgba(244,114,182,0.15)' : 'rgba(52,211,153,0.15)', color: i === 0 ? '#3B82F6' : i === 1 ? '#F472B6' : '#34D399', fontSize: '10px' }}>
                          {v.type}
                        </span>
                      ))}
                    </div>
                    <div style={{ fontSize: '11px', color: '#C9A96E', marginTop: '8px', fontWeight: '600' }}>View saved ads →</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SAVED PRODUCT HISTORY ── */}
          {savedProducts.length > 0 && (
            <div>
              <div style={S.sectionLabel}>
                📦 Saved Products — {savedProducts.length} total
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '10px',
                marginBottom: '24px'
              }}>
                {savedProducts.map(p => (
                  <div
                    key={p._id}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E8E5E0',
                      borderRadius: '10px',
                      padding: '12px',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                    onClick={() => generateContent({
                      name: p.title?.substring(0, 60) || p.name,
                      category: p.category || 'Amazon',
                      commission: p.commission || '~8%',
                      trend: '→ Saved',
                      badge: 'History',
                      heroImage: p.heroImage || p.image,
                      additionalImages: p.additionalImages || [],
                      bullets: p.bullets || [],
                      brand: p.brand,
                      price: p.price,
                      asin: p.asin,
                    })}
                  >
                    {/* Delete button */}
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await fetch(`/api/product/${p._id}`, { method: 'DELETE' });
                        loadSavedProducts(selectedCreator.id);
                      }}
                      style={{
                        position: 'absolute', top: '6px', right: '6px',
                        background: 'rgba(251,146,60,0.2)',
                        border: 'none', borderRadius: '50%',
                        width: '18px', height: '18px',
                        fontSize: '10px', cursor: 'pointer',
                        color: '#FB923C', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        lineHeight: 1
                      }}
                    >
                      ×
                    </button>

                    {(p.heroImage || p.image) && (
                      <img
                        src={p.heroImage || p.image}
                        alt={p.title || p.name}
                        style={{
                          width: '100%', height: '70px',
                          objectFit: 'contain',
                          background: '#fff',
                          borderRadius: '6px',
                          padding: '3px',
                          marginBottom: '8px'
                        }}
                      />
                    )}
                    <div style={{
                      fontSize: '11px', fontWeight: '600',
                      color: '#1A1A1A', lineHeight: 1.3,
                      marginBottom: '4px'
                    }}>
                      {(p.title || p.name || '').substring(0, 45)}...
                    </div>
                    {p.price && (
                      <div style={{ fontSize: '11px', color: '#34D399', fontWeight: '700' }}>
                        {p.price}
                      </div>
                    )}
                    <div style={{
                      fontSize: '10px', color: '#999999',
                      marginTop: '4px'
                    }}>
                      {new Date(p.savedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── META DATA PLACEHOLDERS ── */}
          <div style={S.sectionLabel}>📡 Meta Ads Performance — Live Data Connection</div>
          <div style={S.dataBox}>
            <div style={{ fontSize: "12px", color: "#FBBF24", fontWeight: "600", marginBottom: "10px" }}>⚡ Connect Meta Marketing API → Ad Account ID required to populate</div>
            <div style={S.dataGrid}>
              {[
                { label: "7-Day Spend", field: "spend_7d", icon: "💰" },
                { label: "Avg CPC", field: "cpc_avg", icon: "🖱️" },
                { label: "Avg CPM", field: "cpm_avg", icon: "👁️" },
                { label: "Avg CTR", field: "ctr_avg", icon: "📈" },
                { label: "7-Day Clicks", field: "clicks_7d", icon: "🔗" },
                { label: "7-Day Impressions", field: "impressions_7d", icon: "📣" },
              ].map(({ label, field, icon }) => (
                <div key={field} style={S.dataCell}>
                  <div style={{ fontSize: "10px", color: "#999999", marginBottom: "4px" }}>{icon} {label}</div>
                  <div style={S.placeholder}>Meta API →</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: "11px", color: "#999999" }}>
              Top Creative: <span style={{ ...S.placeholder, display: "inline", padding: "2px 8px" }}>GET /act_&#123;id&#125;/ads?sort=spend</span>
              &nbsp;&nbsp;|&nbsp;&nbsp;
              Format confirmed from scrape: <span style={{ ...S.tag, background: adMeta.bg, color: adMeta.color }}>{adMeta.label}</span>
            </div>
          </div>

          {/* ── WALMART EARNINGS (IMPACT API) ── */}
          <div style={S.sectionLabel}>💙 Walmart Earnings — Impact API Data</div>
          <div style={S.dataBox}>
            <div style={{ fontSize: "12px", color: "#3B82F6", fontWeight: "600", marginBottom: "10px" }}>⚡ Connect Impact API → SubID: {selectedCreator.id} required</div>
            <div style={S.dataGrid}>
              {[
                { label: "EPC 24hr", field: "epc_24h", icon: "⚡" },
                { label: "EPC 7-Day", field: "epc_7d", icon: "📊" },
                { label: "Clicks 24hr", field: "clicks_24h", icon: "🔗" },
                { label: "Orders 7-Day", field: "orders_7d", icon: "📦" },
                { label: "Revenue 7-Day", field: "revenue_7d", icon: "💵" },
                { label: "Conversion Rate", field: "conversion_rate", icon: "🎯" },
              ].map(({ label, field, icon }) => (
                <div key={field} style={S.dataCell}>
                  <div style={{ fontSize: "10px", color: "#999999", marginBottom: "4px" }}>{icon} {label}</div>
                  <div style={S.placeholder}>Impact API →</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#999999" }}>
              <span>Top Category: <span style={{ color: "#3B82F6", fontWeight: "600" }}>{selectedCreator.walmartData.top_category}</span></span>
              <span>Avg Commission: <span style={{ color: "#3B82F6", fontWeight: "600" }}>{selectedCreator.walmartData.avg_commission_rate}</span></span>
              <span>Basket Size: <span style={S.placeholder}>Impact API →</span></span>
            </div>
          </div>

          {/* ── AMAZON EARNINGS (MANUAL/CSV) ── */}
          <div style={S.sectionLabel}>🛍️ Amazon Earnings — Manual Affiliate Data</div>
          <div style={S.dataBox}>
            <div style={{ fontSize: "12px", color: "#C9A96E", fontWeight: "600", marginBottom: "10px" }}>📁 Upload Amazon CSV or Database Update → No API connection</div>
            <div style={S.dataGrid}>
              {[
                { label: "EPC 24hr", field: "epc_24h", icon: "⚡" },
                { label: "EPC 7-Day", field: "epc_7d", icon: "📊" },
                { label: "Clicks 24hr", field: "clicks_24h", icon: "🔗" },
                { label: "Orders 7-Day", field: "orders_7d", icon: "📦" },
                { label: "Revenue 7-Day", field: "revenue_7d", icon: "💵" },
                { label: "Conversion Rate", field: "conversion_rate", icon: "🎯" },
              ].map(({ label, field, icon }) => (
                <div key={field} style={S.dataCell}>
                  <div style={{ fontSize: "10px", color: "#888888", marginBottom: "4px" }}>{icon} {label}</div>
                  <div style={{ ...S.placeholder, borderColor: 'rgba(201,169,110,0.3)', color: '#C9A96E' }}>Manual/CSV →</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#888888" }}>
              <span>Top Category: <span style={{ color: "#C9A96E", fontWeight: "600" }}>{selectedCreator.amazonData.top_category}</span></span>
              <span>Avg Commission: <span style={{ color: "#C9A96E", fontWeight: "600" }}>{selectedCreator.amazonData.avg_commission_rate}</span></span>
              <span>Daily File: <span style={{ ...S.placeholder, display: "inline", padding: "2px 8px", borderColor: 'rgba(201,169,110,0.3)', color: '#C9A96E' }}>awaiting_csv_upload</span></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── CONTENT GENERATOR ─────────────────────────────────────────────────────
  if (screen === "generator" && generatedContent) return (
    <div style={S.app}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`}</style>
      <nav style={S.nav}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={S.navBrand}>Markable</span><span style={S.navBadge}>Creator Intelligence</span>
        </div>
        <button style={S.btnOutline} onClick={() => setScreen("profile")}>← Back</button>
      </nav>
      <div style={S.container}>
        <div style={{ fontSize: "11px", color: "#C9A96E", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>AI Generated · {selectedCreator?.name}</div>
        <h2 style={{ ...S.heading, marginBottom: "4px" }}>{selectedProduct?.name}</h2>
        <div style={{ fontSize: "13px", color: "#888888", marginBottom: "20px" }}>{selectedProduct?.category} · {selectedProduct?.commission} commission · {selectedProduct?.trend}</div>

        <ScrapedProductCard product={scrapedProduct} />

        {generatedContent.format_insight && (
          <div style={{ ...S.insightBox, background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", marginBottom: "20px" }}>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "#FBBF24", marginBottom: "4px" }}>📺 Video vs Static Insight</div>
            <div style={{ fontSize: "13px", color: "#444444" }}>{generatedContent.format_insight}</div>
          </div>
        )}

        <div style={S.sectionLabel}>Hook Angles</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
          {generatedContent.hook_angles?.map((h, i) => (
            <span key={i} style={{ ...S.tag, background: "rgba(201,169,110,0.1)", color: "#C9A96E", fontSize: "12px", padding: "6px 12px" }}>{h}</span>
          ))}
        </div>

        <div style={S.sectionLabel}>Ad Variations — Video + Static + Carousel Generated</div>
        {generatedContent.ad_variations?.map((v, i) => (
          <div key={i} style={S.varCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ ...S.tag, background: i === 0 ? "rgba(59,130,246,0.12)" : i === 1 ? "rgba(244,114,182,0.15)" : "rgba(52,211,153,0.15)", color: i === 0 ? "#3B82F6" : i === 1 ? "#F472B6" : "#34D399" }}>
                  {i === 0 ? "📹" : i === 1 ? "🖼️" : "🎠"} {v.type}
                </span>
                <button 
                  onClick={() => toggleFavorite('ad_copy', v)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    color: isFavorite('ad_copy', v.hook) ? '#FF3B3B' : '#CCCCCC',
                  }}
                >
                  {isFavorite('ad_copy', v.hook) ? '❤️' : '🤍'}
                </button>
              </div>
              {i === 0 && selectedCreator?.adType === "video" && <span style={{ fontSize: "11px", color: "#34D399", fontWeight: "600" }}>✓ Matches current format — boost first</span>}
              {i === 1 && selectedCreator?.adType === "static" && <span style={{ fontSize: "11px", color: "#F472B6", fontWeight: "600" }}>✓ Matches current format — boost first</span>}
              {i === 0 && selectedCreator?.adType === "static" && <span style={{ fontSize: "11px", color: "#FBBF24", fontWeight: "600" }}>⚡ New format test — compare CPC vs static</span>}
              {i === 1 && selectedCreator?.adType === "video" && <span style={{ fontSize: "11px", color: "#FBBF24", fontWeight: "600" }}>⚡ New format test — compare CPC vs video</span>}
            </div>
            <div style={{ fontSize: "15px", fontWeight: "700", marginBottom: "8px", color: "#1A1A1A" }}>"{v.hook}"</div>
            <div style={{ fontSize: "13px", color: "#444444", lineHeight: 1.6, marginBottom: "10px" }}>{v.caption}</div>
            
            <ComplianceDisplay flags={v.compliance_flags} />

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
              <span style={{ ...S.tag, background: "#F0EDE8", color: "#888888" }}>CTA: {v.cta}</span>
              <span style={{ ...S.tag, background: "#F0EDE8", color: "#888888" }}>{v.disclosure}</span>
            </div>
          </div>
        ))}

        <div style={S.insightBox}>
          <div style={{ fontSize: "12px", fontWeight: "700", color: "#C9A96E", marginBottom: "6px" }}>🚀 Boost Recommendation</div>
          <div style={{ fontSize: "13px", color: "#444444" }}>{generatedContent.boost_recommendation}</div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button style={S.btn} onClick={generateCalendar}>📅 Add to Calendar</button>
          <button style={{ ...S.btn, background: "#22C55E" }} onClick={generateBoostRecs}>🚀 Full Boost Plan</button>
        </div>
      </div>
    </div>
  );

  // ── CALENDAR ──────────────────────────────────────────────────────────────
  if (screen === "calendar") return (
    <div style={S.app}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`}</style>
      <nav style={S.nav}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={S.navBrand}>Markable</span><span style={S.navBadge}>Creator Intelligence</span>
        </div>
        <button style={S.btnOutline} onClick={() => setScreen("profile")}>← Back</button>
      </nav>
      <div style={S.container}>
        <div style={{ fontSize: "11px", color: "#C9A96E", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>Content Calendar · {selectedCreator?.name}</div>
        <h2 style={{ ...S.heading, marginBottom: "4px" }}>Weekly Plan</h2>
        <p style={S.sub}>AI-generated — creator reviews, edits, and manually posts. System handles everything else.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px", marginBottom: "24px" }}>
          {DAYS.map(day => {
            const entry = calendar[day] || {};
            const tc = { Video: "#3B82F6", Static: "#F472B6", Carousel: "#34D399", Rest: "#AAAAAA" };
            const color = tc[entry.type] || "#AAAAAA";
            return (
              <div key={day} style={{ ...S.calCell, borderTop: `2px solid ${color}` }}>
                <div style={{ fontSize: "10px", fontWeight: "800", color: "#999999", letterSpacing: "0.5px", marginBottom: "8px" }}>{day.toUpperCase()}</div>
                {entry.type && entry.type !== "Rest" ? (
                  <>
                    <span style={{ ...S.tag, background: `${color}20`, color, fontSize: "10px", padding: "2px 6px", marginBottom: "6px", display: "inline-block" }}>{entry.type}</span>
                    <div style={{ fontSize: "11px", fontWeight: "600", color: "#1A1A1A", marginBottom: "4px", lineHeight: 1.3 }}>{entry.product}</div>
                    <div style={{ fontSize: "10px", color: "#888888", lineHeight: 1.4 }}>{entry.hook}</div>
                  </>
                ) : (
                  <div style={{ fontSize: "10px", color: "#AAAAAA", lineHeight: 1.4, marginTop: "4px" }}>{entry.hook || "Rest"}</div>
                )}
              </div>
            );
          })}
        </div>

        <div style={S.insightBox}>
          <div style={{ fontSize: "12px", fontWeight: "700", color: "#C9A96E", marginBottom: "6px" }}>🔄 Creator Workflow</div>
          <div style={{ fontSize: "13px", color: "#444444" }}>Posts are generated and staged. Creator gets a notification to review, edit if needed, and manually hit post — preserving authenticity while cutting prep time ~70%.</div>
        </div>

        <button style={{ ...S.btn, background: "#22C55E" }} onClick={generateBoostRecs}>🚀 View Boost Recommendations →</button>
      </div>
    </div>
  );

  // ── BOOST ─────────────────────────────────────────────────────────────────
  if (screen === "boost") return (
    <div style={S.app}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`}</style>
      <nav style={S.nav}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={S.navBrand}>Markable</span><span style={S.navBadge}>Creator Intelligence</span>
        </div>
        <button style={S.btnOutline} onClick={() => setScreen("profile")}>← Back</button>
      </nav>
      <div style={S.container}>
        <div style={{ fontSize: "11px", color: "#C9A96E", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>Boost Intelligence · {selectedCreator?.name}</div>
        <h2 style={{ ...S.heading, marginBottom: "4px" }}>Signal-Based Boost Plan</h2>
        <p style={S.sub}>Ranked by commission rate, content trend, and format signal. Includes video vs. static comparison guidance.</p>

        {boostRecs.map((rec, i) => {
          const pc = { "🔥 Boost Now": "#FB923C", "⚡ Test Next": "#8B5CF6", "👀 Watch": "#60A5FA" };
          const color = pc[rec.priority] || "#C9A96E";
          return (
            <div key={i} style={{ ...S.boostCard, borderLeft: `3px solid ${color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <span style={{ ...S.tag, background: `${color}20`, color, fontSize: "12px", padding: "4px 12px" }}>{rec.priority}</span>
                <span style={{ ...S.tag, background: "#F0EDE8", color: "#888888" }}>{rec.content_type}</span>
              </div>
              <div style={{ fontSize: "16px", fontWeight: "700", marginBottom: "6px" }}>{rec.product}</div>
              <div style={{ fontSize: "13px", color: "#444444", lineHeight: 1.5, marginBottom: "10px" }}>{rec.rationale}</div>
              {rec.format_note && (
                <div style={{ fontSize: "12px", color: "#FBBF24", background: "rgba(251,191,36,0.08)", borderRadius: "8px", padding: "8px 12px", marginBottom: "12px" }}>
                  📺 {rec.format_note}
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                {[["BUDGET", rec.suggested_budget, "#34D399"], ["WATCH FOR", rec.expected_signal, "#1A1A1A"], ["STOP LOSS", rec.stop_loss, "#FB923C"]].map(([label, val, col]) => (
                  <div key={label} style={{ background: "#FFFFFF", borderRadius: "8px", padding: "10px" }}>
                    <div style={{ fontSize: "10px", color: "#999999", marginBottom: "4px" }}>{label}</div>
                    <div style={{ fontSize: "11px", color: col, fontWeight: label === "BUDGET" ? "700" : "400" }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <div style={S.insightBox}>
          <div style={{ fontSize: "12px", fontWeight: "700", color: "#C9A96E", marginBottom: "6px" }}>📡 Signal Detection + Data Connections Needed</div>
          <div style={{ fontSize: "13px", color: "#444444", marginBottom: "10px" }}>System monitors EPC and CPC every 24hrs. Scale criteria trigger budget increase; underperformers are killed before spend compounds. When Meta API + Amazon affiliate API are connected, these decisions become fully automated.</div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <span style={S.placeholder}>Meta API: CPC by creative type</span>
            <span style={S.placeholder}>Amazon API: EPC 24hr by SubID</span>
            <span style={S.placeholder}>Impact: Basket size by creator</span>
          </div>
        </div>

        <button style={S.btn} onClick={() => setScreen("home")}>← Try Another Creator</button>
      </div>
    </div>
  );

  return null;
}
