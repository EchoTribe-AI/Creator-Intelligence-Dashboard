import { useState, useEffect } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// CREATOR DATA — Real scrape from Meta Ad Library
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
    metaData: {
      spend_7d: 12450,
      cpc_avg: 0.42,
      cpm_avg: 8.50,
      ctr_avg: 2.1,
      clicks_7d: 29642,
      impressions_7d: 1464705,
      active_ad_count: 20,
    },
    amazonData: {
      epc_7d: 1.12,
      revenue_7d: 33200,
      conversion_rate: 12.4,
      top_category: "Fashion",
    }
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
      spend_7d: 42300,
      cpc_avg: 0.18,
      cpm_avg: 4.20,
      ctr_avg: 3.8,
      clicks_7d: 235000,
      impressions_7d: 10071428,
      active_ad_count: 72,
    },
    amazonData: {
      epc_7d: 0.85,
      revenue_7d: 199750,
      conversion_rate: 14.2,
      top_category: "Fashion",
    }
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
    ],
    products: [
      { name: "SPANX Dupe Lounge Set", category: "Fashion", commission: "9%", trend: "↑ Hot", badge: "Top Pick" },
      { name: "Viral Workout Set", category: "Fitness", commission: "10%", trend: "↑ Hot", badge: "New" },
    ],
    metaData: {
      spend_7d: 8900,
      cpc_avg: 0.55,
      cpm_avg: 12.40,
      ctr_avg: 1.8,
      clicks_7d: 16181,
      impressions_7d: 717741,
      active_ad_count: 14,
    },
    amazonData: {
      epc_7d: 1.45,
      revenue_7d: 23462,
      conversion_rate: 10.5,
      top_category: "Fashion",
    }
  }
];

const DS: any = {
  page: { minHeight: '100vh', background: '#F9FAFB', color: '#111827', fontFamily: "'DM Sans', sans-serif" },
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', background: 'rgba(255,255,255,0.8)', borderBottom: '1px solid rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' },
  navBrand: { fontSize: '16px', fontWeight: '800', color: '#111827', letterSpacing: '-0.3px' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' },
  card: { background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' },
  sectionLabel: { fontSize: '11px', fontWeight: '700', letterSpacing: '1.5px', color: '#6B7280', textTransform: 'uppercase', marginBottom: '14px' },
  creatorBtn: (active: boolean) => ({
    display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
    padding: '12px', borderRadius: '12px', border: active ? '2px solid #FF6B6B' : '1px solid #E5E7EB',
    background: active ? '#FFF5F5' : '#fff', cursor: 'pointer', transition: 'all 0.2s',
    color: active ? '#FF6B6B' : '#4B5563', textAlign: 'left' as const
  }),
  tabBtn: (active: boolean) => ({
    padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600',
    border: 'none', background: active ? '#FF6B6B' : 'transparent',
    color: active ? '#fff' : '#6B7280', cursor: 'pointer', transition: 'all 0.2s'
  }),
  statValue: { fontSize: '24px', fontWeight: '800', color: '#111827', lineHeight: 1.2 },
  statLabel: { fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }
};

export default function MarkableDemoV3() {
  const [selectedCreator, setSelectedCreator] = useState(CREATORS[0]);
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div style={DS.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>
      
      {/* Navigation */}
      <nav style={DS.nav}>
        <div style={DS.navBrand}>AD INTELLIGENCE DASHBOARD</div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Export</button>
          <button style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#FF6B6B', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Connect Data</button>
        </div>
      </nav>

      <div style={DS.container}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '32px' }}>
          
          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={DS.sectionLabel}>Creators</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {CREATORS.map(c => (
                <button key={c.id} onClick={() => setSelectedCreator(c)} style={DS.creatorBtn(selectedCreator.id === c.id)}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                    {c.emoji}
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '14px' }}>{c.name}</div>
                    <div style={{ fontSize: '11px', opacity: 0.7 }}>{c.handle}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Header Card */}
            <div style={DS.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', letterSpacing: '-0.5px' }}>{selectedCreator.name}</h2>
                  <p style={{ color: '#6B7280', fontSize: '14px', marginTop: '2px' }}>{selectedCreator.niche} • {selectedCreator.audience}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: '#FF6B6B', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Primary Ad Format</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>{selectedCreator.adType.toUpperCase()}</div>
                </div>
              </div>
              <div style={{ marginTop: '16px', padding: '12px', background: '#F3F4F6', borderRadius: '10px', fontSize: '13px', fontStyle: 'italic', color: '#4B5563' }}>
                "{selectedCreator.tone}"
              </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div style={DS.card}>
                <div style={DS.statLabel}>7d Spend</div>
                <div style={DS.statValue}>${selectedCreator.metaData.spend_7d.toLocaleString()}</div>
              </div>
              <div style={DS.card}>
                <div style={DS.statLabel}>Avg CTR</div>
                <div style={DS.statValue}>{selectedCreator.metaData.ctr_avg}%</div>
              </div>
              <div style={DS.card}>
                <div style={DS.statLabel}>7d Revenue</div>
                <div style={DS.statValue}>${selectedCreator.amazonData.revenue_7d.toLocaleString()}</div>
              </div>
              <div style={DS.card}>
                <div style={DS.statLabel}>Conv. Rate</div>
                <div style={DS.statValue}>{selectedCreator.amazonData.conversion_rate}%</div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', background: '#F3F4F6', padding: '4px', borderRadius: '24px', alignSelf: 'flex-start' }}>
              <button onClick={() => setActiveTab("overview")} style={DS.tabBtn(activeTab === "overview")}>Overview</button>
              <button onClick={() => setActiveTab("ads")} style={DS.tabBtn(activeTab === "ads")}>Ad Library</button>
              <button onClick={() => setActiveTab("products")} style={DS.tabBtn(activeTab === "products")}>Top Products</button>
            </div>

            {/* Tab Content */}
            <div style={{ minHeight: '400px' }}>
              {activeTab === "overview" && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div style={DS.card}>
                    <div style={DS.sectionLabel}>Performance Metrics</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <StatRow label="Impressions" value={selectedCreator.metaData.impressions_7d.toLocaleString()} />
                      <StatRow label="Clicks" value={selectedCreator.metaData.clicks_7d.toLocaleString()} />
                      <StatRow label="Avg CPC" value={`$${selectedCreator.metaData.cpc_avg}`} />
                      <StatRow label="Avg CPM" value={`$${selectedCreator.metaData.cpm_avg}`} />
                    </div>
                  </div>
                  <div style={DS.card}>
                    <div style={DS.sectionLabel}>Conversion Metrics</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <StatRow label="EPC (7d)" value={`$${selectedCreator.amazonData.epc_7d}`} />
                      <StatRow label="Top Category" value={selectedCreator.amazonData.top_category} />
                      <StatRow label="Active Ads" value={selectedCreator.metaData.active_ad_count} />
                      <StatRow label="Revenue/Ad" value={`$${Math.round(selectedCreator.amazonData.revenue_7d / selectedCreator.metaData.active_ad_count).toLocaleString()}`} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "ads" && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {selectedCreator.existingAds.map((ad, i) => (
                    <div key={i} style={DS.card}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280' }}>STARTED {ad.started.toUpperCase()}</div>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#FF6B6B' }}>{ad.hasVideo ? "VIDEO" : "STATIC"} FORMAT</div>
                      </div>
                      <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#374151' }}>{ad.copy}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "products" && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {selectedCreator.products.map((p, i) => (
                    <div key={i} style={{ ...DS.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '15px', color: '#111827' }}>{p.name}</div>
                        <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>{p.category} • {p.commission} commission</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: p.trend.includes('↑') ? '#059669' : '#D97706' }}>{p.trend}</div>
                        {p.badge && <div style={{ fontSize: '10px', background: '#F3F4F6', color: '#4B5563', padding: '2px 8px', borderRadius: '4px', marginTop: '4px', fontWeight: '600' }}>{p.badge}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #F3F4F6' }}>
      <span style={{ color: '#6B7280', fontSize: '13px', fontWeight: '500' }}>{label}</span>
      <span style={{ fontWeight: '700', color: '#111827', fontSize: '14px' }}>{value}</span>
    </div>
  );
}
