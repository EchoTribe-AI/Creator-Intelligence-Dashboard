import { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// CREATOR DATA — Real scrape from Markable Meta Ad Library
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

export default function MarkableDemoV3() {
  const [selectedCreator, setSelectedCreator] = useState(CREATORS[0]);
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", color: "#f8fafc", fontFamily: "Inter, system-ui, sans-serif", padding: "2rem" }}>
      {/* Header */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "800", background: "linear-gradient(to right, #60a5fa, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Markable Analytics V3
          </h1>
          <p style={{ color: "#94a3b8" }}>Real-time Creator & Ad Intelligence</p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button style={{ padding: "0.5rem 1rem", backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "0.5rem", color: "#f8fafc", cursor: "pointer" }}>
            Export Report
          </button>
          <button style={{ padding: "0.5rem 1rem", backgroundColor: "#3b82f6", border: "none", borderRadius: "0.5rem", color: "white", fontWeight: "600", cursor: "pointer" }}>
            Connect API
          </button>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "300px 1fr", gap: "2rem" }}>
        {/* Sidebar: Creator List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Creators</h3>
          {CREATORS.map(c => (
            <div
              key={c.id}
              onClick={() => setSelectedCreator(c)}
              style={{
                padding: "1rem",
                borderRadius: "0.75rem",
                backgroundColor: selectedCreator.id === c.id ? "#1e293b" : "transparent",
                border: "1px solid",
                borderColor: selectedCreator.id === c.id ? "#3b82f6" : "transparent",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem"
              }}
            >
              <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", backgroundColor: c.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem" }}>
                {c.emoji}
              </div>
              <div>
                <div style={{ fontWeight: "600", fontSize: "0.9375rem" }}>{c.name}</div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{c.handle}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Creator Profile Header */}
          <div style={{ padding: "1.5rem", backgroundColor: "#1e293b", borderRadius: "1rem", border: "1px solid #334155" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "700" }}>{selectedCreator.name}</h2>
                <p style={{ color: "#94a3b8" }}>{selectedCreator.niche} • {selectedCreator.audience}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ padding: "0.25rem 0.75rem", borderRadius: "1rem", backgroundColor: "#0f172a", border: "1px solid #334155", fontSize: "0.75rem", fontWeight: "600", color: selectedCreator.color }}>
                  {selectedCreator.adType.toUpperCase()} FOCUS
                </span>
              </div>
            </div>
            <p style={{ fontSize: "0.9375rem", color: "#cbd5e1", fontStyle: "italic" }}>"{selectedCreator.tone}"</p>
          </div>

          {/* Quick Stats Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
            <StatCard label="7d Spend" value={`$${selectedCreator.metaData.spend_7d.toLocaleString()}`} icon="💰" />
            <StatCard label="Avg CTR" value={`${selectedCreator.metaData.ctr_avg}%`} icon="🖱️" />
            <StatCard label="7d Revenue" value={`$${selectedCreator.amazonData.revenue_7d.toLocaleString()}`} icon="📈" />
            <StatCard label="Conv. Rate" value={`${selectedCreator.amazonData.conversion_rate}%`} icon="🎯" />
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "2rem", borderBottom: "1px solid #334155", paddingBottom: "0.5rem" }}>
            <Tab active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>Overview</Tab>
            <Tab active={activeTab === "ads"} onClick={() => setActiveTab("ads")}>Ad Library</Tab>
            <Tab active={activeTab === "products"} onClick={() => setActiveTab("products")}>Top Products</Tab>
          </div>

          {/* Tab Content */}
          <div style={{ minHeight: "400px" }}>
            {activeTab === "overview" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <div style={{ padding: "1.5rem", backgroundColor: "#1e293b", borderRadius: "1rem", border: "1px solid #334155" }}>
                  <h4 style={{ marginBottom: "1rem", fontWeight: "600" }}>Meta Ads Performance</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <StatRow label="Impressions" value={selectedCreator.metaData.impressions_7d.toLocaleString()} />
                    <StatRow label="Clicks" value={selectedCreator.metaData.clicks_7d.toLocaleString()} />
                    <StatRow label="Avg CPC" value={`$${selectedCreator.metaData.cpc_avg}`} />
                    <StatRow label="Avg CPM" value={`$${selectedCreator.metaData.cpm_avg}`} />
                  </div>
                </div>
                <div style={{ padding: "1.5rem", backgroundColor: "#1e293b", borderRadius: "1rem", border: "1px solid #334155" }}>
                  <h4 style={{ marginBottom: "1rem", fontWeight: "600" }}>Amazon Affiliate Metrics</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <StatRow label="7d Revenue" value={`$${selectedCreator.amazonData.revenue_7d.toLocaleString()}`} />
                    <StatRow label="EPC (7d)" value={`$${selectedCreator.amazonData.epc_7d}`} />
                    <StatRow label="Top Category" value={selectedCreator.amazonData.top_category} />
                    <StatRow label="Active Ads" value={selectedCreator.metaData.active_ad_count} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "ads" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {selectedCreator.existingAds.map((ad, i) => (
                  <div key={i} style={{ padding: "1.25rem", backgroundColor: "#1e293b", borderRadius: "1rem", border: "1px solid #334155" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                      <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Started {ad.started}</span>
                      <span style={{ fontSize: "0.75rem", color: "#60a5fa" }}>{ad.hasVideo ? "Video Ad" : "Static Ad"}</span>
                    </div>
                    <p style={{ fontSize: "0.875rem", lineHeight: "1.5", color: "#e2e8f0" }}>{ad.copy}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "products" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {selectedCreator.products.map((p, i) => (
                  <div key={i} style={{ padding: "1.25rem", backgroundColor: "#1e293b", borderRadius: "1rem", border: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: "600", fontSize: "0.9375rem" }}>{p.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{p.category} • {p.commission} comm.</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "0.75rem", color: p.trend.includes("↑") ? "#4ade80" : "#facc15" }}>{p.trend}</div>
                      {p.badge && <div style={{ fontSize: "0.625rem", backgroundColor: "#334155", padding: "0.125rem 0.375rem", borderRadius: "0.25rem", marginTop: "0.25rem" }}>{p.badge}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div style={{ padding: "1.25rem", backgroundColor: "#1e293b", borderRadius: "1rem", border: "1px solid #334155" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" }}>{label}</span>
        <span>{icon}</span>
      </div>
      <div style={{ fontSize: "1.25rem", fontWeight: "700" }}>{value}</div>
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ color: "#94a3b8", fontSize: "0.875rem" }}>{label}</span>
      <span style={{ fontWeight: "600" }}>{value}</span>
    </div>
  );
}

function Tab({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "0.5rem 0",
        backgroundColor: "transparent",
        border: "none",
        borderBottom: active ? "2px solid #3b82f6" : "2px solid transparent",
        color: active ? "#3b82f6" : "#94a3b8",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s"
      }}
    >
      {children}
    </button>
  );
}
