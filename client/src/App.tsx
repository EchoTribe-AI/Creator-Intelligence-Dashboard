import { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// CREATOR DATA — Real scrape from Markable Meta Ad Library
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
    color: "#C084FC",
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
    // ── AMAZON EARNINGS PLACEHOLDERS ──────────────────────────────────────
    amazonData: {
      _note: "Connect via Amazon Associates / Impact affiliate API — SubID required",
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
    amazonData: {
      _note: "Connect via Amazon Associates / Impact affiliate API — SubID required",
      epc_24h: "CONNECT_AFFILIATE_API",
      epc_7d: "CONNECT_AFFILIATE_API",
      clicks_24h: "CONNECT_AFFILIATE_API",
      orders_7d: "CONNECT_AFFILIATE_API",
      revenue_7d: "CONNECT_AFFILIATE_API",
      conversion_rate: "CONNECT_AFFILIATE_API",
      top_category: "Fashion",
      avg_commission_rate: "8%",
      basket_size_avg: "CONNECT_AFFILIATE_API",
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
    amazonData: {
      _note: "Connect via Amazon Associates / Impact affiliate API",
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
    amazonData: {
      _note: "Connect via Amazon Associates / Impact affiliate API",
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
    amazonData: {
      _note: "Connect via Amazon Associates / Impact affiliate API",
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
    color: "#818CF8",
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
    amazonData: {
      _note: "Connect via Amazon Associates / Impact affiliate API",
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
    amazonData: {
      _note: "Connect via Amazon Associates / Impact affiliate API",
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
    amazonData: {
      _note: "Connect via Amazon Associates / Impact affiliate API",
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
    amazonData: {
      _note: "Connect via Amazon Associates / Impact affiliate API",
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
    amazonData: {
      _note: "Connect via Amazon Associates / Impact affiliate API",
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
  },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const AD_TYPE_LABELS = {
  video: { label: "Video Only", color: "#818CF8", bg: "rgba(129,140,248,0.15)" },
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

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("home");
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [calendar, setCalendar] = useState({});
  const [boostRecs, setBoostRecs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [filterType, setFilterType] = useState("all");

  const selectCreator = (creator) => {
    setSelectedCreator(creator);
    setSelectedProduct(null);
    setGeneratedContent(null);
    setScreen("profile");
  };

  const generateContent = async (product) => {
    setSelectedProduct(product);
    setLoading(true);
    setLoadingMsg("Analyzing creator tone & generating variations...");
    setScreen("generator");

    const existingSamples = selectedCreator.existingAds.map(a => a.copy).join("\n---\n");

    const prompt = `You are an AI content strategist for creator commerce.

Creator: ${selectedCreator.name}
Niche: ${selectedCreator.niche}
Tone: ${selectedCreator.tone}
Audience: ${selectedCreator.audience}
Current ad format: ${selectedCreator.adType} (${selectedCreator.adType === 'static' ? 'this creator runs ONLY static image ads — generate variations optimized for static' : selectedCreator.adType === 'video' ? 'this creator runs video-first — generate video primary with static and carousel options' : 'this creator runs both video and static — generate variations for both'})

Product to promote: ${product.name} (${product.category}, ${product.commission} commission)

Here are 3 of this creator's REAL existing ad copies for tone reference:
${existingSamples}

Generate a JSON object (no markdown, raw JSON only) with this structure:
{
  "hook_angles": ["hook1", "hook2", "hook3"],
  "ad_variations": [
    {
      "type": "Video Ad",
      "hook": "opening hook line",
      "caption": "full ad caption 2-3 sentences in creator's exact tone",
      "cta": "call to action",
      "disclosure": "#ad #amazonfinds"
    },
    {
      "type": "Static Image Ad",
      "hook": "punchy headline for image overlay",
      "caption": "shorter caption for static — punchy and visual",
      "cta": "call to action",
      "disclosure": "#ad"
    },
    {
      "type": "Carousel Ad",
      "hook": "carousel opening line",
      "caption": "caption emphasizing multiple features across slides",
      "cta": "call to action",
      "disclosure": "#ad #amazonfinds"
    }
  ],
  "format_insight": "1 sentence insight on whether video or static would likely perform better for this creator based on their existing ad format and tone",
  "boost_recommendation": "1-2 sentence recommendation on which variation to boost first and why, referencing the 24hr EPC signal threshold"
}`;

    try {
      const raw = await callClaude(prompt, 1000);
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      setGeneratedContent(parsed);
    } catch (e) {
      setGeneratedContent({
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
      });
    }
    setLoading(false);
  };

  const generateCalendar = async () => {
    setLoading(true);
    setLoadingMsg("Building your content calendar...");
    setScreen("calendar");

    const prompt = `You are a content strategist. Create a 1-week content calendar for ${selectedCreator.name}, a ${selectedCreator.niche} creator who primarily uses ${selectedCreator.adType} ads.

Their products: ${selectedCreator.products.map(p => p.name).join(", ")}
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
        { priority: "🔥 Boost Now", content_type: selectedCreator.adType === "static" ? "Static Image" : "Video", product: selectedCreator.products[0]?.name, rationale: "Matches creator's proven format — highest probability of strong EPC signal.", suggested_budget: "$25/day", expected_signal: "EPC > $0.15 within 48hrs, CPC < $1.20", stop_loss: "Kill if CPC > $1.80 after 24hrs", format_note: selectedCreator.adType === "static" ? "Static-only creator — start here, then test video as a new format to compare CPC." : "Video-first creator — start here, then test static image to compare CPM and CPC." },
        { priority: "⚡ Test Next", content_type: selectedCreator.adType === "static" ? "Video" : "Static Image", product: selectedCreator.products[1]?.name, rationale: "Test the opposite format to this creator's current style — key insight for the pilot.", suggested_budget: "$15/day", expected_signal: "CTR > 1.2% within 48hrs, EPC > $0.10", stop_loss: "Kill if no conversions after $30 spend", format_note: "This is the critical video vs. static comparison — data from this test informs the full portfolio strategy." },
        { priority: "👀 Watch", content_type: "Carousel", product: selectedCreator.products[2]?.name, rationale: "Carousel format not yet tested — build now, launch when signal from first two tests confirms.", suggested_budget: "Hold", expected_signal: "Wait for organic engagement signal first", stop_loss: "N/A — prep only", format_note: "Carousel may bridge video and static — worth testing after baseline is established." },
      ]);
    }
    setLoading(false);
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const S = {
    app: { minHeight: "100vh", background: "#0A0A0F", color: "#E8E8F0", fontFamily: "'DM Sans', sans-serif" },
    nav: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 28px", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)" },
    navBrand: { fontSize: "15px", fontWeight: "700", color: "#fff" },
    navBadge: { fontSize: "10px", background: "linear-gradient(135deg, #C084FC, #818CF8)", color: "#fff", padding: "3px 8px", borderRadius: "20px", fontWeight: "700", marginLeft: "8px" },
    container: { maxWidth: "1000px", margin: "0 auto", padding: "32px 24px" },
    heading: { fontSize: "28px", fontWeight: "800", marginBottom: "6px", lineHeight: 1.2 },
    sub: { fontSize: "14px", color: "#9CA3AF", marginBottom: "28px" },
    btn: { background: "linear-gradient(135deg, #C084FC, #818CF8)", color: "#fff", border: "none", borderRadius: "10px", padding: "12px 22px", fontSize: "14px", fontWeight: "700", cursor: "pointer" },
    btnOutline: { background: "transparent", color: "#C084FC", border: "1px solid #C084FC", borderRadius: "10px", padding: "10px 18px", fontSize: "13px", fontWeight: "600", cursor: "pointer" },
    btnFilter: (active) => ({ background: active ? "rgba(192,132,252,0.2)" : "rgba(255,255,255,0.04)", color: active ? "#C084FC" : "#9CA3AF", border: active ? "1px solid rgba(192,132,252,0.4)" : "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "6px 14px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }),
    tag: { display: "inline-block", fontSize: "11px", fontWeight: "600", padding: "3px 10px", borderRadius: "20px", marginRight: "6px" },
    card: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "22px", cursor: "pointer", transition: "all 0.2s" },
    insightBox: { background: "rgba(192,132,252,0.08)", border: "1px solid rgba(192,132,252,0.2)", borderRadius: "12px", padding: "16px 20px", marginBottom: "20px" },
    dataBox: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "16px 20px", marginBottom: "14px" },
    sectionLabel: { fontSize: "11px", fontWeight: "700", letterSpacing: "1px", color: "#6B7280", textTransform: "uppercase", marginBottom: "14px", marginTop: "28px" },
    adRow: { padding: "14px 18px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", marginBottom: "10px" },
    productRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", marginBottom: "10px" },
    varCard: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "20px", marginBottom: "14px" },
    calCell: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "14px", minHeight: "88px" },
    boostCard: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "22px", marginBottom: "14px" },
    loadingBox: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "40vh", gap: "16px" },
    spinner: { width: "40px", height: "40px", border: "3px solid rgba(192,132,252,0.2)", borderTop: "3px solid #C084FC", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
    highlight: { color: "#C084FC", fontWeight: "700" },
    placeholder: { background: "rgba(251,191,36,0.08)", border: "1px dashed rgba(251,191,36,0.3)", borderRadius: "8px", padding: "8px 12px", fontSize: "11px", color: "#FBBF24", fontFamily: "monospace" },
    dataGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "16px" },
    dataCell: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "12px 14px" },
  };

  const filteredCreators = filterType === "all" ? CREATORS : CREATORS.filter(c => c.adType === filterType);

  // ── HOME ──────────────────────────────────────────────────────────────────
  if (screen === "home") return (
    <div style={S.app}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap'); @keyframes spin { to { transform: rotate(360deg); } } .cc:hover { border-color: rgba(192,132,252,0.4) !important; transform: translateY(-2px); background: rgba(255,255,255,0.07) !important; }`}</style>
      <nav style={S.nav}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={S.navBrand}>Markable</span>
          <span style={S.navBadge}>Creator Intelligence</span>
        </div>
        <span style={{ fontSize: "12px", color: "#6B7280" }}>Demo · Feb 2026 · 10 Creators</span>
      </nav>
      <div style={S.container}>
        <div style={{ marginBottom: "32px" }}>
          <div style={{ fontSize: "12px", color: "#C084FC", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "10px" }}>Revenue System Demo</div>
          <h1 style={{ ...S.heading, fontSize: "32px" }}>Creator Ad Intelligence</h1>
          <p style={{ ...S.sub, fontSize: "15px" }}>10 real Markable creators. Video-only, static-only, and mixed. Select any creator to generate AI ad variations, content calendars, and signal-based boost plans.</p>

          <div style={S.insightBox}>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "#C084FC", marginBottom: "8px" }}>📊 Portfolio Insight — From Real Ad Library Scrape</div>
            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
              <div><span style={S.highlight}>7 creators</span> <span style={{ fontSize: "13px", color: "#D1D5DB" }}>video-only</span></div>
              <div><span style={{ color: "#F472B6", fontWeight: "700" }}>1 creator</span> <span style={{ fontSize: "13px", color: "#D1D5DB" }}>static-only (Casey — 72 ads)</span></div>
              <div><span style={{ color: "#FBBF24", fontWeight: "700" }}>2 creators</span> <span style={{ fontSize: "13px", color: "#D1D5DB" }}>mixed format</span></div>
            </div>
            <div style={{ fontSize: "13px", color: "#9CA3AF", marginTop: "8px" }}>Casey's static-only format is the critical data point: does lower CPC on static offset lower intent vs. video? This demo generates both to test.</div>
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
                <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "10px" }}>{c.niche} · {c.audience}</div>
                <div style={{ fontSize: "12px", color: "#6B7280" }}>Click to explore → generate variations, calendar, boost plan</div>
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
        <div style={{ fontSize: "15px", color: "#9CA3AF" }}>{loadingMsg}</div>
      </div>
    </div>
  );

  // ── CREATOR PROFILE ───────────────────────────────────────────────────────
  if (screen === "profile" && selectedCreator) {
    const adMeta = AD_TYPE_LABELS[selectedCreator.adType];
    return (
      <div style={S.app}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap'); .pr:hover { border-color: rgba(192,132,252,0.3) !important; background: rgba(255,255,255,0.07) !important; cursor: pointer; }`}</style>
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
              <div style={{ fontSize: "13px", color: "#9CA3AF" }}>{selectedCreator.niche} · {selectedCreator.audience}</div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <span style={{ ...S.tag, background: adMeta.bg, color: adMeta.color, fontSize: "12px", padding: "5px 12px" }}>{adMeta.label}</span>
              <span style={{ ...S.tag, background: `${selectedCreator.color}20`, color: selectedCreator.color, fontSize: "12px", padding: "5px 12px" }}>{selectedCreator.totalAds} active ads</span>
            </div>
          </div>

          <div style={S.insightBox}>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "#C084FC", marginBottom: "4px" }}>🧠 Tone Profile</div>
            <div style={{ fontSize: "13px", color: "#D1D5DB" }}>{selectedCreator.tone}</div>
          </div>

          <div style={{ display: "flex", gap: "10px", marginBottom: "28px", flexWrap: "wrap" }}>
            <button style={S.btn} onClick={generateCalendar}>📅 Build Content Calendar</button>
            <button style={{ ...S.btn, background: "linear-gradient(135deg, #34D399, #059669)" }} onClick={generateBoostRecs}>🚀 Boost Recommendations</button>
          </div>

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
                  <div style={{ fontSize: "10px", color: "#6B7280", marginBottom: "4px" }}>{icon} {label}</div>
                  <div style={S.placeholder}>Meta API →</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: "11px", color: "#6B7280" }}>
              Top Creative: <span style={{ ...S.placeholder, display: "inline", padding: "2px 8px" }}>GET /act_&#123;id&#125;/ads?sort=spend</span>
              &nbsp;&nbsp;|&nbsp;&nbsp;
              Format confirmed from scrape: <span style={{ ...S.tag, background: adMeta.bg, color: adMeta.color }}>{adMeta.label}</span>
            </div>
          </div>

          {/* ── AMAZON DATA PLACEHOLDERS ── */}
          <div style={S.sectionLabel}>🛍️ Amazon Earnings — Daily Affiliate Data</div>
          <div style={S.dataBox}>
            <div style={{ fontSize: "12px", color: "#34D399", fontWeight: "600", marginBottom: "10px" }}>⚡ Connect Amazon Associates / Impact API → SubID: {selectedCreator.id} required</div>
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
                  <div style={{ fontSize: "10px", color: "#6B7280", marginBottom: "4px" }}>{icon} {label}</div>
                  <div style={S.placeholder}>Affiliate API →</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#6B7280" }}>
              <span>Top Category: <span style={{ color: "#34D399", fontWeight: "600" }}>{selectedCreator.amazonData.top_category}</span></span>
              <span>Avg Commission: <span style={{ color: "#34D399", fontWeight: "600" }}>{selectedCreator.amazonData.avg_commission_rate}</span></span>
              <span>Basket Size: <span style={S.placeholder}>Impact API →</span></span>
            </div>
          </div>

          {/* ── EXISTING ADS ── */}
          <div style={S.sectionLabel}>Existing Ads — Real Ad Library Data</div>
          {selectedCreator.existingAds.map((ad, i) => (
            <div key={i} style={S.adRow}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <div style={{ display: "flex", gap: "6px" }}>
                  {ad.hasVideo && <span style={{ ...S.tag, background: "rgba(129,140,248,0.15)", color: "#818CF8" }}>📹 Video</span>}
                  {ad.hasStatic && <span style={{ ...S.tag, background: "rgba(244,114,182,0.15)", color: "#F472B6" }}>🖼️ Static</span>}
                  {!ad.hasVideo && !ad.hasStatic && <span style={{ ...S.tag, background: "rgba(107,114,128,0.15)", color: "#9CA3AF" }}>📄 Text</span>}
                </div>
                <span style={{ fontSize: "11px", color: "#6B7280" }}>{ad.started}</span>
              </div>
              <div style={{ fontSize: "13px", color: "#D1D5DB", lineHeight: 1.5 }}>{ad.copy.substring(0, 200)}...</div>
            </div>
          ))}

          {/* ── PRODUCTS ── */}
          <div style={S.sectionLabel}>Products — Click to Generate AI Ad Variations</div>
          {selectedCreator.products.map((p, i) => (
            <div key={i} className="pr" style={S.productRow} onClick={() => generateContent(p)}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "600" }}>{p.name}</div>
                <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>{p.category}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {p.badge && <span style={{ ...S.tag, background: "rgba(192,132,252,0.15)", color: "#C084FC" }}>{p.badge}</span>}
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#34D399" }}>{p.commission}</div>
                  <div style={{ fontSize: "11px", color: "#6B7280" }}>{p.trend}</div>
                </div>
                <span style={{ color: "#C084FC", fontSize: "18px" }}>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── CONTENT GENERATOR ─────────────────────────────────────────────────────
  if (screen === "generator" && generatedContent) return (
    <div style={S.app}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>
      <nav style={S.nav}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={S.navBrand}>Markable</span><span style={S.navBadge}>Creator Intelligence</span>
        </div>
        <button style={S.btnOutline} onClick={() => setScreen("profile")}>← Back</button>
      </nav>
      <div style={S.container}>
        <div style={{ fontSize: "11px", color: "#C084FC", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>AI Generated · {selectedCreator?.name}</div>
        <h2 style={{ ...S.heading, marginBottom: "4px" }}>{selectedProduct?.name}</h2>
        <div style={{ fontSize: "13px", color: "#9CA3AF", marginBottom: "20px" }}>{selectedProduct?.category} · {selectedProduct?.commission} commission · {selectedProduct?.trend}</div>

        {generatedContent.format_insight && (
          <div style={{ ...S.insightBox, background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", marginBottom: "20px" }}>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "#FBBF24", marginBottom: "4px" }}>📺 Video vs Static Insight</div>
            <div style={{ fontSize: "13px", color: "#D1D5DB" }}>{generatedContent.format_insight}</div>
          </div>
        )}

        <div style={S.sectionLabel}>Hook Angles</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
          {generatedContent.hook_angles?.map((h, i) => (
            <span key={i} style={{ ...S.tag, background: "rgba(192,132,252,0.1)", color: "#C084FC", fontSize: "12px", padding: "6px 12px" }}>{h}</span>
          ))}
        </div>

        <div style={S.sectionLabel}>Ad Variations — Video + Static + Carousel Generated</div>
        {generatedContent.ad_variations?.map((v, i) => (
          <div key={i} style={S.varCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ ...S.tag, background: i === 0 ? "rgba(129,140,248,0.15)" : i === 1 ? "rgba(244,114,182,0.15)" : "rgba(52,211,153,0.15)", color: i === 0 ? "#818CF8" : i === 1 ? "#F472B6" : "#34D399" }}>
                {i === 0 ? "📹" : i === 1 ? "🖼️" : "🎠"} {v.type}
              </span>
              {i === 0 && selectedCreator?.adType === "video" && <span style={{ fontSize: "11px", color: "#34D399", fontWeight: "600" }}>✓ Matches current format — boost first</span>}
              {i === 1 && selectedCreator?.adType === "static" && <span style={{ fontSize: "11px", color: "#F472B6", fontWeight: "600" }}>✓ Matches current format — boost first</span>}
              {i === 0 && selectedCreator?.adType === "static" && <span style={{ fontSize: "11px", color: "#FBBF24", fontWeight: "600" }}>⚡ New format test — compare CPC vs static</span>}
              {i === 1 && selectedCreator?.adType === "video" && <span style={{ fontSize: "11px", color: "#FBBF24", fontWeight: "600" }}>⚡ New format test — compare CPC vs video</span>}
            </div>
            <div style={{ fontSize: "15px", fontWeight: "700", marginBottom: "8px", color: "#fff" }}>"{v.hook}"</div>
            <div style={{ fontSize: "13px", color: "#D1D5DB", lineHeight: 1.6, marginBottom: "10px" }}>{v.caption}</div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ ...S.tag, background: "rgba(255,255,255,0.05)", color: "#9CA3AF" }}>CTA: {v.cta}</span>
              <span style={{ ...S.tag, background: "rgba(255,255,255,0.05)", color: "#9CA3AF" }}>{v.disclosure}</span>
            </div>
          </div>
        ))}

        <div style={S.insightBox}>
          <div style={{ fontSize: "12px", fontWeight: "700", color: "#C084FC", marginBottom: "6px" }}>🚀 Boost Recommendation</div>
          <div style={{ fontSize: "13px", color: "#D1D5DB" }}>{generatedContent.boost_recommendation}</div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button style={S.btn} onClick={generateCalendar}>📅 Add to Calendar</button>
          <button style={{ ...S.btn, background: "linear-gradient(135deg, #34D399, #059669)" }} onClick={generateBoostRecs}>🚀 Full Boost Plan</button>
        </div>
      </div>
    </div>
  );

  // ── CALENDAR ──────────────────────────────────────────────────────────────
  if (screen === "calendar") return (
    <div style={S.app}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>
      <nav style={S.nav}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={S.navBrand}>Markable</span><span style={S.navBadge}>Creator Intelligence</span>
        </div>
        <button style={S.btnOutline} onClick={() => setScreen("profile")}>← Back</button>
      </nav>
      <div style={S.container}>
        <div style={{ fontSize: "11px", color: "#C084FC", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>Content Calendar · {selectedCreator?.name}</div>
        <h2 style={{ ...S.heading, marginBottom: "4px" }}>Weekly Plan</h2>
        <p style={S.sub}>AI-generated — creator reviews, edits, and manually posts. System handles everything else.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px", marginBottom: "24px" }}>
          {DAYS.map(day => {
            const entry = calendar[day] || {};
            const tc = { Video: "#818CF8", Static: "#F472B6", Carousel: "#34D399", Rest: "#4B5563" };
            const color = tc[entry.type] || "#4B5563";
            return (
              <div key={day} style={{ ...S.calCell, borderTop: `2px solid ${color}` }}>
                <div style={{ fontSize: "10px", fontWeight: "800", color: "#6B7280", letterSpacing: "0.5px", marginBottom: "8px" }}>{day.toUpperCase()}</div>
                {entry.type && entry.type !== "Rest" ? (
                  <>
                    <span style={{ ...S.tag, background: `${color}20`, color, fontSize: "10px", padding: "2px 6px", marginBottom: "6px", display: "inline-block" }}>{entry.type}</span>
                    <div style={{ fontSize: "11px", fontWeight: "600", color: "#E8E8F0", marginBottom: "4px", lineHeight: 1.3 }}>{entry.product}</div>
                    <div style={{ fontSize: "10px", color: "#9CA3AF", lineHeight: 1.4 }}>{entry.hook}</div>
                  </>
                ) : (
                  <div style={{ fontSize: "10px", color: "#4B5563", lineHeight: 1.4, marginTop: "4px" }}>{entry.hook || "Rest"}</div>
                )}
              </div>
            );
          })}
        </div>

        <div style={S.insightBox}>
          <div style={{ fontSize: "12px", fontWeight: "700", color: "#C084FC", marginBottom: "6px" }}>🔄 Creator Workflow</div>
          <div style={{ fontSize: "13px", color: "#D1D5DB" }}>Posts are generated and staged. Creator gets a notification to review, edit if needed, and manually hit post — preserving authenticity while cutting prep time ~70%.</div>
        </div>

        <button style={{ ...S.btn, background: "linear-gradient(135deg, #34D399, #059669)" }} onClick={generateBoostRecs}>🚀 View Boost Recommendations →</button>
      </div>
    </div>
  );

  // ── BOOST ─────────────────────────────────────────────────────────────────
  if (screen === "boost") return (
    <div style={S.app}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>
      <nav style={S.nav}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={S.navBrand}>Markable</span><span style={S.navBadge}>Creator Intelligence</span>
        </div>
        <button style={S.btnOutline} onClick={() => setScreen("profile")}>← Back</button>
      </nav>
      <div style={S.container}>
        <div style={{ fontSize: "11px", color: "#C084FC", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>Boost Intelligence · {selectedCreator?.name}</div>
        <h2 style={{ ...S.heading, marginBottom: "4px" }}>Signal-Based Boost Plan</h2>
        <p style={S.sub}>Ranked by commission rate, content trend, and format signal. Includes video vs. static comparison guidance.</p>

        {boostRecs.map((rec, i) => {
          const pc = { "🔥 Boost Now": "#FB923C", "⚡ Test Next": "#C084FC", "👀 Watch": "#60A5FA" };
          const color = pc[rec.priority] || "#C084FC";
          return (
            <div key={i} style={{ ...S.boostCard, borderLeft: `3px solid ${color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <span style={{ ...S.tag, background: `${color}20`, color, fontSize: "12px", padding: "4px 12px" }}>{rec.priority}</span>
                <span style={{ ...S.tag, background: "rgba(255,255,255,0.05)", color: "#9CA3AF" }}>{rec.content_type}</span>
              </div>
              <div style={{ fontSize: "16px", fontWeight: "700", marginBottom: "6px" }}>{rec.product}</div>
              <div style={{ fontSize: "13px", color: "#D1D5DB", lineHeight: 1.5, marginBottom: "10px" }}>{rec.rationale}</div>
              {rec.format_note && (
                <div style={{ fontSize: "12px", color: "#FBBF24", background: "rgba(251,191,36,0.08)", borderRadius: "8px", padding: "8px 12px", marginBottom: "12px" }}>
                  📺 {rec.format_note}
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                {[["BUDGET", rec.suggested_budget, "#34D399"], ["WATCH FOR", rec.expected_signal, "#E8E8F0"], ["STOP LOSS", rec.stop_loss, "#FB923C"]].map(([label, val, col]) => (
                  <div key={label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "10px" }}>
                    <div style={{ fontSize: "10px", color: "#6B7280", marginBottom: "4px" }}>{label}</div>
                    <div style={{ fontSize: "11px", color: col, fontWeight: label === "BUDGET" ? "700" : "400" }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <div style={S.insightBox}>
          <div style={{ fontSize: "12px", fontWeight: "700", color: "#C084FC", marginBottom: "6px" }}>📡 Signal Detection + Data Connections Needed</div>
          <div style={{ fontSize: "13px", color: "#D1D5DB", marginBottom: "10px" }}>System monitors EPC and CPC every 24hrs. Scale criteria trigger budget increase; underperformers are killed before spend compounds. When Meta API + Amazon affiliate API are connected, these decisions become fully automated.</div>
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
