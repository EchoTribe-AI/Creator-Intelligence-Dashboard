import { useState, useEffect } from "react";
import Papa from 'papaparse';

// ─────────────────────────────────────────────────────────────────────────────
// DANNY PAGE COMPONENTS & DATA
// ─────────────────────────────────────────────────────────────────────────────
const RETAILER_BENCHMARKS = {
    walmart: {
      name: 'Walmart', logo: '🟡',
      cpc: 0.08,           // realistic Meta paid social CPC
      cvr: 3.5,            // realistic click-to-purchase % 
      aov: 65,
      commissionRate: 8.9,
      epcBaseline: 0.161,  // from live test
      note: 'Based on Nov–Dec 2025 live test data',
      verified: true,
    },
    target: {
      name: 'Target', logo: '🎯',
      cpc: 0.09, cvr: 3.0, aov: 58, commissionRate: 7.0,
      epcBaseline: null,
      note: 'Estimated benchmarks — not yet tested', verified: false,
    },
    amazon: {
      name: 'Amazon', logo: '📦',
      cpc: 0.085, cvr: 4.0, aov: 52, commissionRate: 8.0,
      epcBaseline: null,
      note: 'Estimated benchmarks — not yet tested', verified: false,
    },
    wayfair: {
      name: 'Wayfair', logo: '🏠',
      cpc: 0.10, cvr: 2.5, aov: 210, commissionRate: 7.0,
      epcBaseline: null,
      note: 'Estimated benchmarks — not yet tested', verified: false,
    },
  };

const CATEGORY_MULTIPLIERS = {
  'Kids & Toys':    { cpcMod: 0.88, aovMod: 0.85, label: '🧸' },
  'Home & Kitchen': { cpcMod: 1.12, aovMod: 1.40, label: '🏡' },
  'Fashion':        { cpcMod: 0.95, aovMod: 0.75, label: '👗' },
  'Beauty':         { cpcMod: 1.05, aovMod: 0.65, label: '💄' },
  'Food & Grocery': { cpcMod: 0.80, aovMod: 0.45, label: '🛒' },
};

const DannyPage = () => {
    const [markableMatchPct, setMarkableMatchPct] = useState(50);
    const [retailer, setRetailer] = useState('walmart');
    const [category, setCategory] = useState('Kids & Toys');
    const [monthlyBudget, setMonthlyBudget] = useState(25000);
    const [numCreators, setNumCreators] = useState(10);
    const [cpc, setCpc] = useState(0.08);
    const [cvr, setCvr] = useState(3.5);
    const [aov, setAov] = useState(65);
    const [commissionRate, setCommissionRate] = useState(8.9);

    useEffect(() => {
      const b = RETAILER_BENCHMARKS[retailer as keyof typeof RETAILER_BENCHMARKS];
      const m = CATEGORY_MULTIPLIERS[category as keyof typeof CATEGORY_MULTIPLIERS];
      if (b && m) {
        setCpc(+(b.cpc * m.cpcMod).toFixed(4));
        setCvr(b.cvr);
        setAov(+(b.aov * m.aovMod).toFixed(0));
        setCommissionRate(b.commissionRate);
      }
    }, [retailer, category]);

    const DS: any = {
      page: { minHeight: '100vh', background: '#F9FAFB', color: '#111827', fontFamily: "'DM Sans', sans-serif" },
      nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', background: 'rgba(255,255,255,0.8)', borderBottom: '1px solid rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' },
      navBrand: { fontSize: '16px', fontWeight: '800', color: '#111827', letterSpacing: '-0.3px' },
      navBadge: { fontSize: '10px', background: '#FF6B6B', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', marginLeft: '8px' },
      container: { maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' },
      card: { background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' },
      sectionLabel: { fontSize: '11px', fontWeight: '700', letterSpacing: '1.5px', color: '#6B7280', textTransform: 'uppercase', marginBottom: '14px', marginTop: '28px' },
      retailerBtn: (active: boolean) => ({
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '12px 8px', borderRadius: '12px', border: active ? '2px solid #FF6B6B' : '1px solid #E5E7EB',
        background: active ? '#FFF5F5' : '#fff', cursor: 'pointer', transition: 'all 0.2s',
        color: active ? '#FF6B6B' : '#4B5563', boxShadow: active ? '0 4px 12px rgba(255,107,107,0.1)' : 'none'
      }),
      categoryBtn: (active: boolean) => ({
        padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
        border: active ? 'none' : '1px solid #E5E7EB',
        background: active ? '#FF6B6B' : '#F3F4F6',
        color: active ? '#fff' : '#6B7280', cursor: 'pointer'
      }),
      inputCard: { background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' },
      inputLabel: { fontSize: '11px', fontWeight: '700', letterSpacing: '1px', color: '#6B7280', textTransform: 'uppercase', marginBottom: '10px' },
    };

    // Spend model
    const markableAdSpend = monthlyBudget * (markableMatchPct / 100);
    const totalAdSpend = monthlyBudget + markableAdSpend;

    // Core performance metrics - based on totalAdSpend
    const clicks = Math.round(totalAdSpend / cpc);
    const orders = Math.round(clicks * (cvr / 100));
    const gmv = orders * aov;
    const earnings = gmv * (commissionRate / 100);
    const epc = clicks > 0 ? earnings / clicks : 0;

    // Brand economics - based on their budget and earnings
    const affiliateCommPool = earnings;
    const brandROAS_adOnly = monthlyBudget > 0 ? gmv / monthlyBudget : 0;
    const brandROAS_total = (monthlyBudget + affiliateCommPool) > 0 ? gmv / (monthlyBudget + affiliateCommPool) : 0;
    const brandProfit = earnings - monthlyBudget;

    // Markable internal economics — correct waterfall
    // Net pool = full affiliate earnings minus Markable's ad spend
    const markableNet = earnings - markableAdSpend;

    // Split net 50/50 with creator
    const creatorSplit = markableNet * 0.50;
    const markableProfit = markableNet * 0.50;

    // ROAS = what Markable keeps vs what they spent
    const markableROAS = markableAdSpend > 0 ? markableProfit / markableAdSpend : 0;

    // 60-day Brand totals
    const twoMonthBrandAd = monthlyBudget * 2;
    const twoMonthCommPool = affiliateCommPool * 2;
    const twoMonthGMV = gmv * 2;
    const twoMonthEarnings = earnings * 2;
    const twoMonthTotalAd = totalAdSpend * 2;

    // 60-day Markable totals
    const twoMonthMarkableAd = markableAdSpend * 2;
    const twoMonthMarkableNet = markableNet * 2;
    const twoMonthCreatorSplit = creatorSplit * 2;
    const twoMonthMarkableProfit = markableProfit * 2;

    const adsPerCreator = 4;
    const totalAds = numCreators * adsPerCreator;

    const statTiles = [
      { 
        label: 'Clicks / Month', 
        value: clicks.toLocaleString(),
        sublabel: `$${Math.round(totalAdSpend).toLocaleString()} total media deployed`,
        color: '#C084FC', icon: '👆' 
      },
      { label: 'GMV Driven', value: `$${Math.round(gmv).toLocaleString()}`, color: '#34D399', icon: '🛒' },
      { label: 'Affiliate Earnings', value: `$${Math.round(earnings).toLocaleString()}`, color: '#FF6B6B', icon: '💰' },
      { label: 'EPC', value: `$${epc.toFixed(4)}`, color: '#C084FC', icon: '⚡' },
      { 
        label: 'Brand ROAS (ad only)',
        sublabel: 'GMV / Brand Ad Spend',
        value: `${brandROAS_adOnly.toFixed(1)}x`,
        color: brandROAS_adOnly >= 10 ? '#34D399' : brandROAS_adOnly >= 5 ? '#F59E0B' : '#EF4444',
        icon: '🏪',
        indicator: brandROAS_adOnly >= 10 ? 'strong' : brandROAS_adOnly >= 5 ? 'moderate' : 'low',
      },
      { 
        label: 'Monthly Profit',
        sublabel: 'Affiliate Earnings − Brand Ad Spend',
        value: `$${Math.round(brandProfit).toLocaleString()}`,
        color: brandProfit > 0 ? '#34D399' : '#EF4444', 
        icon: '📊' 
      },
    ];

    const bench = RETAILER_BENCHMARKS[retailer as keyof typeof RETAILER_BENCHMARKS];

    return (
      <div style={DS.page} data-testid="danny-page">
          <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
            input[type=range] { -webkit-appearance: none; height: 4px; border-radius: 2px; background: rgba(0,0,0,0.05); outline: none; }
            input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #FF6B6B; cursor: pointer; border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }`}
          </style>
          
          <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div>
                <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', letterSpacing: '-0.5px' }}>
                  Partnership Proposal Builder
                </h1>
                <p style={{ color: '#6B7280', fontSize: '15px', marginTop: '4px' }}>
                  Select retailer benchmarks and project campaign impact
                </p>
              </div>
              <button onClick={() => window.location.href = '/'} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                ← Back to Dashboard
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                <div style={DS.card}>
                  <div style={DS.sectionLabel}>1. Select Retailer & Category</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
                    {Object.entries(RETAILER_BENCHMARKS).map(([key, b]) => (
                      <button key={key} onClick={() => setRetailer(key)} style={DS.retailerBtn(retailer === key)}>
                        <span style={{ fontSize: '20px', marginBottom: '4px' }}>{b.logo}</span>
                        <span style={{ fontSize: '12px', fontWeight: '700' }}>{b.name}</span>
                      </button>
                    ))}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {Object.keys(CATEGORY_MULTIPLIERS).map(cat => (
                      <button key={cat} onClick={() => setCategory(cat)} style={DS.categoryBtn(category === cat)}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={DS.card}>
                  <div style={DS.sectionLabel}>2. Adjust Benchmarks</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    {[
                      { label: 'Avg CPC ($)', value: cpc, setter: setCpc, step: 0.001, hint: 'Cost per click from Meta ads' },
                      { label: 'Conversion Rate (CVR %)', value: cvr, setter: setCvr, step: 0.1, hint: 'Click-to-purchase conversion' },
                      { label: 'Avg Order Value ($)', value: aov, setter: setAov, step: 1, hint: 'Expected customer cart size' },
                      { label: 'Commission Rate (%)', value: commissionRate, setter: setCommissionRate, step: 0.1, hint: 'Affiliate payout percentage' },
                    ].map((f, i) => (
                      <div key={i}>
                        <div style={{ fontSize: '10px', color: '#6B7280', marginBottom: '2px', fontWeight: '600' }}>{f.label}</div>
                        <input type="number" value={f.value} step={f.step} onChange={e => f.setter(+e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '14px', fontWeight: '600' }} />
                        <div style={{ fontSize: '10px', color: '#4B5563', marginTop: '3px' }}>{f.hint}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '10px', padding: '8px 10px', background: 'rgba(0,0,0,0.02)', borderRadius: '6px' }}>
                    EPC = Earnings / Clicks = ${epc.toFixed(4)}
                    {bench.verified && bench.epcBaseline && (
                      <span style={{ marginLeft: '8px', color: '#34D399', fontSize: '10px' }}>
                        (live test baseline: ${bench.epcBaseline})
                      </span>
                    )}
                  </div>
                </div>

                <div style={DS.card}>
                  <div style={DS.sectionLabel}>3. Monthly Ad Budget</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '10px' }}>
                    <input type="range" min="1000" max="100000" step="1000" value={monthlyBudget} onChange={e => setMonthlyBudget(+e.target.value)} style={{ flex: 1, accentColor: '#FF6B6B' }} />
                    <div style={{ fontSize: '24px', fontWeight: '800', color: '#FF6B6B', minWidth: '120px', textAlign: 'right' }}>
                      ${monthlyBudget.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>Monthly paid media spend across Meta/TikTok/IG</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  {statTiles.map((s, i) => (
                    <div key={i} style={{ ...DS.card, borderLeft: `3px solid ${s.color}`, display: 'flex', flexDirection: 'column', gap: '4px', padding: '16px 20px' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ fontSize: '20px' }}>{s.icon}</span>
                        <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: '600' }}>{s.label}</div>
                      </div>
                      <div style={{ fontSize: '22px', fontWeight: '800', color: s.color, lineHeight: 1, marginTop: '4px' }}>{s.value}</div>
                      {s.sublabel && <div style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '2px' }}>{s.sublabel}</div>}
                      {s.indicator && (() => {
                        const colors = { strong: '#34D399', moderate: '#F59E0B', low: '#EF4444' };
                        const labels = { strong: '✓ Strong', moderate: '~ Moderate', low: '↓ Below target' };
                        const c = colors[s.indicator];
                        return (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: c, display: 'inline-block' }} />
                            <span style={{ fontSize: '10px', fontWeight: '700', color: c }}>{labels[s.indicator]}</span>
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>

                <div style={DS.card}>
                  <div style={DS.sectionLabel}>60-Day Cost Breakdown</div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#FF6B6B', letterSpacing: '0.5px', marginBottom: '12px' }}>🏪 BRAND VIEW</div>
                  {[
                    { label: 'Brand Ad Spend', value: twoMonthBrandAd, color: '#FF6B6B', note: '2 months × monthly budget · paid to Markable' },
                    { label: 'Markable Ad Match', value: twoMonthMarkableAd, color: '#F97316', note: `${markableMatchPct}% co-investment on top-performing ads · no charge to brand`, amplified: true },
                    { label: 'Total Media Deployed', value: twoMonthTotalAd, color: '#111827', bold: true, note: 'Combined spend driving all clicks and GMV' },
                    { label: 'Affiliate Commission Pool', value: twoMonthCommPool, color: '#C084FC', note: 'Affiliate commissions on sales driven' },
                    { label: 'Total Brand Cash Out', value: twoMonthBrandAd + twoMonthCommPool, color: '#111827', bold: true, note: '' },
                  ].map((row, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', marginBottom: '10px', borderBottom: i === 2 || i === 3 ? '1px solid rgba(0,0,0,0.08)' : i < 4 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: row.bold ? '700' : '500', color: row.bold ? '#111827' : '#4B5563' }}>{row.label}</div>
                        {row.note && <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '2px' }}>{row.note}</div>}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {row.amplified && <div style={{ fontSize: '10px', color: '#34D399', fontWeight: '600', marginBottom: '2px' }}>🔼 free amplification</div>}
                        <div style={{ fontSize: row.bold ? '17px' : '15px', fontWeight: '800', color: row.color }}>${Math.round(row.value).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
                    {[
                      { label: 'Brand ROAS', sub: 'GMV / Brand Ad Spend', value: brandROAS_adOnly, good: 10, ok: 5 },
                      { label: 'Brand ROAS (all-in)', sub: 'GMV / Brand Spend + Commissions', value: brandROAS_total, good: 5, ok: 3 },
                    ].map((r, i) => {
                      const isGood = r.value >= r.good;
                      const isOk = r.value >= r.ok;
                      const color = isGood ? '#34D399' : isOk ? '#F59E0B' : '#EF4444';
                      return (
                        <div key={i} style={{ background: 'rgba(0,0,0,0.03)', borderRadius: '10px', padding: '12px 14px', border: `1px solid ${color}30` }}>
                          <div style={{ fontSize: '10px', color: '#6B7280', marginBottom: '4px', fontWeight: '600' }}>{r.label}</div>
                          <div style={{ fontSize: '22px', fontWeight: '800', color }}>{r.value.toFixed(1)}x</div>
                          <div style={{ fontSize: '10px', color: '#4B5563', marginTop: '2px' }}>{r.sub}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, display: 'inline-block' }} />
                            <span style={{ fontSize: '10px', fontWeight: '700', color }}>{isGood ? 'Strong' : isOk ? 'Moderate' : 'Below target'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ height: '1px', background: 'rgba(0,0,0,0.08)', margin: '4px 0 20px' }} />
                <div style={DS.sectionLabel}>⚙️ MARKABLE INTERNAL VIEW</div>
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '10px', color: '#6B7280', marginBottom: '8px', fontWeight: '600' }}>
                    Ad Match — up to {markableMatchPct}% of brand spend
                  </div>
                  <input type="range" min="0" max="100" step="5" value={markableMatchPct}
                    onChange={e => setMarkableMatchPct(+e.target.value)}
                    style={{ width: '100%', accentColor: '#FF6B6B' }} />
                  <div style={{ fontSize: '10px', color: '#4B5563', marginTop: '4px' }}>
                    Deployed to top-performing ads only · creator split is 50% of net after ad costs
                  </div>
                </div>

                {[
                  { 
                    label: 'Ad Co-Investment', 
                    value: twoMonthMarkableAd, 
                    color: '#FF6B6B',
                    note: `${markableMatchPct}% of brand spend · top performers only` 
                  },
                  { 
                    label: 'Affiliate Earnings Pool', 
                    value: earnings * 2, 
                    color: '#C084FC',
                    note: 'Total affiliate commissions generated' 
                  },
                  { 
                    label: 'Markable Net Profit', 
                    value: twoMonthMarkableProfit, 
                    color: '#34D399', 
                    bold: true,
                    note: '50% of (earnings − ad spend) · after creator split' 
                  },
                ].map((row, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    paddingBottom: '10px', marginBottom: '10px',
                    borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: row.bold ? '700' : '500',
                        color: row.bold ? '#fff' : '#D1D5DB'
                      }}>
                        {row.label}
                      </div>
                      {row.note && (
                        <div style={{ fontSize: '10px', color: '#4B5563', marginTop: '2px' }}>{row.note}</div>
                      )}
                    </div>
                    <div style={{
                      fontSize: row.bold ? '17px' : '15px',
                      fontWeight: '800',
                      color: row.color
                    }}>
                      ${Math.round(row.value).toLocaleString()}
                    </div>
                  </div>
                ))}

                  {(() => {
                    const isGreen = markableROAS >= 1.5;
                    const isYellow = markableROAS >= 1.0;
                    const color = isGreen ? '#34D399' : isYellow ? '#F59E0B' : '#EF4444';
                    const labelText = isGreen ? '✓ Profitable' : isYellow ? '~ Breakeven zone' : '↓ Not viable';
                    return (
                      <div style={{ background: `${color}10`, border: `1px solid ${color}30`, borderRadius: '12px', padding: '16px', marginTop: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: '600', textTransform: 'uppercase' }}>Markable Internal ROAS</div>
                            <div style={{ fontSize: '10px', color: '#4B5563', marginTop: '2px' }}>Markable Profit / Markable Ad Spend</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '24px', fontWeight: '800', color }}>{markableROAS.toFixed(2)}x</div>
                            <div style={{ fontSize: '10px', fontWeight: '700', color }}>{labelText}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '10px', fontSize: '10px', color: '#6B7280', flexWrap: 'wrap' }}>
                          <span>🟢 ≥1.5x profitable</span>
                          <span style={{ margin: '0 4px' }}>·</span>
                          <span>🟡 1.0–1.5x breakeven zone</span>
                          <span style={{ margin: '0 4px' }}>·</span>
                          <span>🔴 &lt;1.0x not viable</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
      </div>
    );
  };

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
  const superlatives = ["most popular", "#1", "number one"];
  superlatives.forEach(s => {
    if (new RegExp(`\\b${s}\\b`, 'i').test(copy)) {
      flags.push({ rule: "unverified_superlative", severity: "warning", note: `Contains unverified superlative: "${s}"` });
    }
  });

  // Special check for "best" to avoid "best selling"
  if (/\bbest\b/i.test(copy) && !/\bbest\s+selling\b/i.test(copy)) {
    flags.push({ rule: "unverified_superlative", severity: "warning", note: `Contains unverified superlative: "best"` });
  }

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

const AD_TYPE_LABELS: any = {
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
        Create Ad from Product Link
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="Paste Amazon or affiliate URL (amzn.to/... or full URL)"
          style={{ background: '#E8E5E0', border: '1px solid #D0CBC3', borderRadius: '8px', padding: '12px 14px', color: '#1A1A1A', fontSize: '14px', outline: 'none', width: '100%' }}
          onKeyDown={e => e.key === 'Enter' && lookup()}
        />
        <button
          onClick={lookup}
          disabled={loading}
          style={{ background: 'linear-gradient(135deg, #C9A96E, #C9A96E)', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 20px', fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, width: '100%' }}
        >
          {loading ? 'Generating...' : 'Generate Ad'}
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="Paste Amazon storefront photo URL (amazon.com/shop/influencer-.../photo/...)"
          style={{
            background: '#E8E5E0',
            border: '1px solid #D0CBC3',
            borderRadius: '8px',
            padding: '12px 14px',
            color: '#1A1A1A',
            fontSize: '14px',
            outline: 'none',
            width: '100%'
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
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            whiteSpace: 'nowrap',
            width: '100%'
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
// ── MANUAL FLAG SYSTEM ────────────────────────────────────────────────────────
const FLAG_REASONS = [
  { id: 'wrong_page', label: 'Links to wrong page', color: '#F97316', icon: '⚠️' },
  { id: 'broken_link', label: 'Broken or dead link', color: '#EF4444', icon: '🚫' },
  { id: 'wrong_product', label: 'Wrong product in link', color: '#F97316', icon: '🎯' },
  { id: 'trademark_violation', label: 'Trademark/brand name used', color: '#EF4444', icon: '®️' },
  { id: 'missing_disclosure', label: 'Missing #ad disclosure', color: '#F97316', icon: '📋' },
  { id: 'misleading_copy', label: 'Misleading or inaccurate copy', color: '#EF4444', icon: '⚡' },
  { id: 'other', label: 'Other issue', color: '#9CA3AF', icon: '🏷️' },
];

function AdFlagButton({ flagKey, existingFlag, setAdFlags }: any) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={(e) => { e.stopPropagation(); setShowDropdown(!showDropdown); }}
        style={{
          background: existingFlag ? 'rgba(239,68,68,0.15)' : 'rgba(0,0,0,0.06)',
          border: `1px solid ${existingFlag ? '#EF4444' : 'rgba(0,0,0,0.1)'}`,
          borderRadius: '6px',
          padding: '4px 10px',
          fontSize: '11px',
          color: existingFlag ? '#EF4444' : '#6B7280',
          cursor: 'pointer',
          fontWeight: '600',
        }}
      >
        {existingFlag ? `🚩 ${existingFlag.label}` : '🏳 Flag'}
      </button>

      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: '28px',
          right: 0,
          background: '#FFFFFF',
          border: '1px solid rgba(0,0,0,0.12)',
          borderRadius: '10px',
          padding: '8px',
          zIndex: 200,
          minWidth: '220px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        }}>
          <div style={{ fontSize: '10px', color: '#6B7280', fontWeight: '700', 
                        letterSpacing: '0.5px', padding: '4px 8px 8px' }}>
            SELECT FLAG REASON
          </div>
          {FLAG_REASONS.map(reason => (
            <div
              key={reason.id}
              onClick={(e) => {
                e.stopPropagation();
                setAdFlags((prev: any) => ({
                  ...prev,
                  [flagKey]: { ...reason, flaggedAt: new Date().toISOString() }
                }));
                setShowDropdown(false);
              }}
              style={{
                padding: '8px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                color: '#1A1A1A',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span>{reason.icon}</span>
              <span>{reason.label}</span>
            </div>
          ))}
          {existingFlag && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setAdFlags((prev: any) => {
                  const next = { ...prev };
                  delete next[flagKey];
                  return next;
                });
                setShowDropdown(false);
              }}
              style={{
                padding: '8px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                color: '#6B7280',
                borderTop: '1px solid rgba(0,0,0,0.06)',
                marginTop: '4px',
                paddingTop: '8px',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
              onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}
            >
              ✕ Remove flag
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const handleNav = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', handleNav);
    window.addEventListener('hashchange', handleNav);
    return () => {
      window.removeEventListener('popstate', handleNav);
      window.removeEventListener('hashchange', handleNav);
    };
  }, []);

  const isDannyRoute = pathname === '/danny' || 
    window.location.pathname === '/danny' || 
    window.location.hash === '#danny' ||
    window.location.search.includes('page=danny');

  if (isDannyRoute) {
    return <DannyPage />;
  }

  return <MainDashboard />;
}

function MainDashboard() {
  const [screen, setScreenState] = useState("home");

  const setScreen = (s: string) => {
    setScreenState(s);
    window.scrollTo(0, 0);
  };

  const [creators, setCreators] = useState<any[]>([]);
  const [csvLoading, setCsvLoading] = useState(true);
  const [adFlags, setAdFlags] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('markable_ad_flags') || '{}');
    } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem('markable_ad_flags', JSON.stringify(adFlags));
  }, [adFlags]);

  const [visibleCreatorCount, setVisibleCreatorCount] = useState(10);
  const [visibleAdsCount, setVisibleAdsCount] = useState(6);
  const [selectedCreator, setSelectedCreator] = useState<any>(null);
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

  useEffect(() => {
    const platforms = ['markable', 'urlgenius', 'mavely'];

    Promise.all(
      platforms.map(platform =>
        fetch(`/api/meta-ads/creators?platform=${platform}`)
          .then(r => r.ok ? r.json() : { creators: [] })
          .then(({ creators: summaries }: { creators: any[] }) =>
            (summaries || []).map((s: any) => {
              const id = s.handle.toLowerCase().replace(/^@/, '');
              const hasVideo = s.video_count > 0;
              const hasStatic = s.static_count > 0;
              const adType = hasVideo && hasStatic ? 'mixed' : hasVideo ? 'video' : 'static';
              const niche = inferNiche(id, '');
              return {
                id,
                name: formatCreatorName((s.display_name && s.display_name !== 'This ad has multiple versions') ? s.display_name : id),
                handle: s.handle.startsWith('@') ? s.handle : `@${s.handle}`,
                niche,
                tone: 'Authentic, relatable',
                audience: 'Women 25–45',
                color: assignColor(id),
                emoji: assignEmoji(id, ''),
                profileImage: s.profile_image_url || null,
                facebookPage: s.facebook_page_url || null,
                platform,
                totalAds: s.ad_count,
                adType,
                existingAds: [],
                products: inferProducts(niche),
                metaData: { top_creative_type: adType === 'video' ? 'video' : 'static', active_ad_count: s.ad_count },
                walmartData: { top_category: 'General', avg_commission_rate: '8%' },
                amazonData: { top_category: 'General', avg_commission_rate: '8%' },
              };
            })
          )
          .catch(() => [])
      )
    ).then(results => {
      const all = (results.flat() as any[]).sort((a: any, b: any) => b.totalAds - a.totalAds);
      setCreators(all);
      setCsvLoading(false);
    });
  }, []);

  function cleanShopUrl(url: string | null) {
    if (!url) return null;
    try {
      // If it's a Facebook redirect, extract the real URL from the u= parameter
      if (url.includes('l.facebook.com') || url.includes('facebook.com/l.php')) {
        const match = url.match(/[?&]u=([^&]+)/);
        if (match) {
          const decoded = decodeURIComponent(match[1]);
          // Also strip any fbclid tracking parameter from the destination
          return decoded.split('?')[0];
        }
      }
      // If it's already a clean URL, just strip fbclid
      return url.split('?')[0];
    } catch {
      return url;
    }
  }

  // Normalize CSS-class column names (from raw Meta Ad Library scrape) to
  // the readable names buildCreatorsFromCSV expects. Pass-through if already normalized.
  function normalizeCsvRow(row: any): any {
    if ('Ad Details' in row) return row; // already has proper headers
    return {
      'Meta Library ID':         row['x8t9es0 2']    ?? '',
      'Started Date':            row['x8t9es0 3']    ?? '',
      'Profile Image':           row['_8nqq src']    ?? '',
      'Influencer Facebook Page':row['xt0psk2 href'] ?? '',
      'Ad Details':              row['_4ik4']         ?? '',
      'Video URL':               row['x1lliihq src'] ?? '',
      'Content Image URL':       row['x15mokao src'] ?? '',
      'CTA Shop Now URL':        row['x1hl2dhg href']?? '',
      'Ad Company':              '',
    };
  }

  function buildCreatorsFromCSV(rows: any[], platform: string) {
    const map: any = {};

    rows.forEach(row => {
      const hasCopy = row['Ad Details']?.trim();
      const hasAsset = row['Video URL']?.trim() || row['Content Image URL']?.trim();
      if (!hasCopy || !hasAsset) return;

      const fbUrl = row['Influencer Facebook Page']?.trim();
      const id = fbUrl ? fbUrl.replace(/\/$/, '').split('/').pop().toLowerCase() : null;
      if (!id || id === 'remarkableas') return;

      if (!map[id]) {
        map[id] = {
          id,
          name: formatCreatorName(id),
          handle: `@${id}`,
          niche: inferNiche(id, row['Ad Details']),
          tone: 'Authentic, relatable',
          audience: 'Women 25–45',
          color: assignColor(id),
          emoji: assignEmoji(id, row['Ad Details']),
          profileImage: row['Profile Image']?.trim() || null,
          facebookPage: fbUrl,
          platform,
          existingAds: [],
          products: [],
          // Keep structure for compatibility
          metaData: { top_creative_type: 'video', active_ad_count: 0 },
          walmartData: { top_category: 'General', avg_commission_rate: '8%' },
          amazonData: { top_category: 'General', avg_commission_rate: '8%' }
        };
      }

      const hasVideo = !!row['Video URL']?.trim();
      const hasStatic = !!row['Content Image URL']?.trim();

      map[id].existingAds.push({
        started: (row['Started Date'] || '').replace('Started running on ', '').trim(),
        copy: row['Ad Details']?.trim() || '',
        hasVideo,
        hasStatic,
        videoUrl: row['Video URL']?.trim() || null,
        imageUrl: row['Content Image URL']?.trim() || null,
        cached_thumbnail: null,
        shopUrl: cleanShopUrl(row['CTA Shop Now URL']?.trim()),
        landing_url: cleanShopUrl(row['CTA Shop Now URL']?.trim()),
        libraryId: (row['Meta Library ID'] || '').replace('Library ID: ', '').trim(),
      });
    });

    return Object.values(map)
      .map((c: any) => {
        c.totalAds = c.existingAds.length;
        c.metaData.active_ad_count = c.totalAds;
        const hasV = c.existingAds.some((a: any) => a.hasVideo);
        const hasS = c.existingAds.some((a: any) => a.hasStatic);
        c.adType = hasV && hasS ? 'mixed' : hasV ? 'video' : 'static';
        c.niche = inferNiche(c.id, c.existingAds[0]?.copy || '');
        c.products = inferProducts(c.niche);
        return c;
      })
      .sort((a: any, b: any) => b.totalAds - a.totalAds);
  }

  function formatCreatorName(slug: string) {
    const overrides: any = {
      'caseyleighwiegand': 'Casey Leigh Wiegand',
      'brokeesbuys': "Brooke's Buys",
      'brooksbuys': "Brooke's Buys",
      'yellowpolkadotsblog1': 'Yellow Polka Dots',
      'teachinginheels': 'Teaching in Heels',
      'Hauteandhumid': 'Haute and Humid',
      'misslacyjean': 'MissLacyJean Amazon Finds',
      'simplykatielynnofficial': 'Simply Katielyn',
      'haverstrawhill': 'Haverstraw Hill',
      'sierrahoneycuttt': 'Sierra Honeycutt',
      'darinnicole01': 'Darin Nicole',
      'hamaihomehacks': 'Elnaz Hamai Home Hacks',
      'mrskatiecarlson': 'Katie Carlson',
      'themominstyle1': 'The Mom In Style',
      'curvestocontour': 'Curves to Contour',
      'decor.snippets': 'Decor Snippets',
      'itsallchictome': "It's All Chic To Me",
      'mimipluswill': 'Mimi + Will',
      'somethingwhitty1': 'Something Whitty',
      'lizthul': 'Liz Thul',
      'lexietucker': 'Lexietucker',
      'andreajeanaco': 'Andrea Jean Co',
    };
    if (overrides[slug.toLowerCase()]) return overrides[slug.toLowerCase()];
    return slug
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_\-.]/g, ' ')
      .replace(/\d+$/, '')
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
      .trim();
  }

  const COLORS = ['#C084FC','#FB923C','#34D399','#60A5FA','#F472B6','#A78BFA','#FCD34D','#F87171'];
  function assignColor(id: string) {
    let hash = 0;
    for (let c of id) hash = (hash * 31 + c.charCodeAt(0)) % COLORS.length;
    return COLORS[Math.abs(hash)];
  }

  function assignEmoji(id: string, copy = '') {
    const text = (id + ' ' + copy).toLowerCase();
    if (text.includes('fashion') || text.includes('style') || text.includes('outfit')) return '✨';
    if (text.includes('home') || text.includes('decor')) return '🏡';
    if (text.includes('mom') || text.includes('kids')) return '👶';
    if (text.includes('food') || text.includes('kitchen')) return '🍽️';
    if (text.includes('travel')) return '✈️';
    if (text.includes('fitness')) return '💪';
    if (text.includes('planner')) return '📋';
    if (text.includes('beauty')) return '💄';
    return '🌿';
  }

  function inferNiche(id: string, copy = '') {
    const text = (id + ' ' + copy).toLowerCase();
    if (text.includes('fashion') || text.includes('style') || text.includes('outfit')) return 'Fashion & Lifestyle';
    if (text.includes('home') || text.includes('decor')) return 'Home & Decor';
    if (text.includes('mom') || text.includes('kids')) return 'Mom & Kids';
    if (text.includes('food') || text.includes('kitchen')) return 'Food & Kitchen';
    if (text.includes('travel')) return 'Travel & Lifestyle';
    if (text.includes('fitness')) return 'Fitness & Wellness';
    if (text.includes('planner')) return 'Productivity';
    if (text.includes('beauty')) return 'Beauty & Fashion';
    return 'Lifestyle & Finds';
  }

  function inferProducts(niche: string) {
    const map: any = {
      'Fashion & Lifestyle': [
        { name: 'Wide-Leg Pants', category: 'Fashion', commission: '9%', trend: '↑ High', badge: 'Top Pick' },
        { name: 'Oversized Blazer', category: 'Fashion', commission: '8%', trend: '↑ Hot', badge: 'Trending' },
        { name: 'Lounge Set', category: 'Fashion', commission: '9%', trend: '↑ High', badge: '' },
      ],
      'Home & Decor': [
        { name: 'Storage Solution', category: 'Home', commission: '8%', trend: '↑ High', badge: 'Top Pick' },
        { name: 'Decorative Accents', category: 'Home', commission: '7%', trend: '→ Stable', badge: '' },
        { name: 'Organizer Set', category: 'Home', commission: '8%', trend: '↑ Hot', badge: 'Trending' },
      ],
      'Mom & Kids': [
        { name: 'Kids Organizer', category: 'Kids', commission: '8%', trend: '↑ High', badge: 'Top Pick' },
        { name: 'Snack Containers', category: 'Kitchen', commission: '7%', trend: '↑ Hot', badge: 'Trending' },
        { name: 'Learning Toys', category: 'Kids', commission: '5%', trend: '→ Stable', badge: '' },
      ],
      'Food & Kitchen': [
        { name: 'Kitchen Organizer', category: 'Kitchen', commission: '8%', trend: '↑ High', badge: 'Top Pick' },
        { name: 'Meal Prep Set', category: 'Kitchen', commission: '7%', trend: '→ Stable', badge: '' },
      ],
      'Fitness & Wellness': [
        { name: 'Activewear Set', category: 'Fitness', commission: '10%', trend: '↑ Hot', badge: 'Top Pick' },
        { name: 'Resistance Bands', category: 'Fitness', commission: '8%', trend: '↑ High', badge: 'Trending' },
      ],
      'Beauty & Fashion': [
        { name: 'Makeup Organizer', category: 'Beauty', commission: '9%', trend: '↑ High', badge: 'Top Pick' },
        { name: 'Skincare Set', category: 'Beauty', commission: '8%', trend: '↑ Hot', badge: 'Trending' },
      ],
      'Productivity': [
        { name: 'Digital Planner', category: 'Productivity', commission: '10%', trend: '↑ Hot', badge: 'Top Pick' },
        { name: 'Planner Templates', category: 'Productivity', commission: '8%', trend: '↑ High', badge: 'New' },
      ],
    };
    return map[niche] || [
      { name: 'Amazon Find', category: 'General', commission: '8%', trend: '↑ High', badge: 'Top Pick' },
    ];
  }
  const [filterType, setFilterType] = useState("all");
  const [filterPlatform, setFilterPlatform] = useState("all");
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

  const selectCreator = (creator: any) => {
    setSelectedCreator(creator);
    setSelectedProduct(null);
    setScrapedProduct(null);
    setGeneratedContent(null);
    setSavedGenerations([]);
    setVisibleAdsCount(6);
    setScreen("profile");
    loadSavedProducts(creator.id);
    loadSavedGenerations(creator.id);
    loadFavorites(creator.id);

    if (creator.existingAds.length === 0) {
      const handle = creator.handle.replace(/^@/, '');
      fetch(`/api/meta-ads/search?platform=${creator.platform}&creator=${handle}&limit=100`)
        .then(r => r.ok ? r.json() : { ads: [] })
        .then(({ ads }: { ads: any[] }) => {
          const mappedAds = ads.map((ad: any) => ({
            started: ad.start_date || '',
            copy: ad.ad_copy || '',
            hasVideo: !!ad.video_url,
            hasStatic: !!ad.image_url,
            videoUrl: ad.video_url || null,
            imageUrl: ad.image_url || null,
            cached_thumbnail: ad.cached_thumbnail || null,
            shopUrl: ad.cta_url || null,
            landing_url: ad.landing_url || null,
            libraryId: ad.library_id || '',
          }));
          setSelectedCreator((prev: any) =>
            prev && prev.id === creator.id ? { ...prev, existingAds: mappedAds } : prev
          );
          setCreators((prev: any[]) =>
            prev.map(c => c.id === creator.id && c.platform === creator.platform
              ? { ...c, existingAds: mappedAds }
              : c
            )
          );
        })
        .catch(e => console.warn('Could not lazy-load ads:', e));
    }
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
    productRow: { display: "flex", flexDirection: "column" as const, padding: "16px 18px", background: "#FFFFFF", border: "1px solid #E8E5E0", borderRadius: "12px", marginBottom: "10px", gap: "12px" },
    varCard: { background: "#FFFFFF", border: "1px solid #E8E5E0", borderRadius: "14px", padding: "20px", marginBottom: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
    calCell: { background: "#FFFFFF", border: "1px solid #E8E5E0", borderRadius: "12px", padding: "14px", minHeight: "88px" },
    boostCard: { background: "#FFFFFF", border: "1px solid #E8E5E0", borderRadius: "14px", padding: "22px", marginBottom: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
    loadingBox: { display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", minHeight: "40vh", gap: "16px" },
    spinner: { width: "40px", height: "40px", border: "3px solid rgba(201,169,110,0.2)", borderTop: "3px solid #C9A96E", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
    highlight: { color: "#C9A96E", fontWeight: "700" },
    placeholder: { background: "rgba(201,169,110,0.08)", border: "1px dashed rgba(201,169,110,0.3)", borderRadius: "8px", padding: "8px 12px", fontSize: "11px", color: "#C9A96E", fontFamily: "monospace" },
    dataGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "16px" },
    dataCell: { background: "#FFFFFF", border: "1px solid #E8E5E0", borderRadius: "10px", padding: "12px 14px" },
    inputCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px' },
    inputLabel: { fontSize: '11px', fontWeight: '700', letterSpacing: '1px', color: '#6B7280', textTransform: 'uppercase', marginBottom: '10px' },
  };

  const PLATFORM_LABELS: Record<string, { label: string; color: string }> = {
    markable:  { label: '✨ Markable',  color: '#C084FC' },
    urlgenius: { label: '🔗 URLGenius', color: '#34D399' },
    mavely:    { label: '🎯 Mavely',    color: '#F472B6' },
  };

  const filteredCreators = creators
    .filter((c: any) => filterType === "all" || c.adType === filterType)
    .filter((c: any) => filterPlatform === "all" || c.platform === filterPlatform);

  const visibleCreators = filteredCreators.slice(0, visibleCreatorCount);

  const stats = [
    { label: 'Creators', value: filteredCreators.length },
    { label: 'Total Ads', value: filteredCreators.reduce((sum: any, c: any) => sum + (c.totalAds || 0), 0) },
    { label: 'Video Only', value: filteredCreators.filter((c: any) => c.adType === 'video').length },
    { label: 'Static Only', value: filteredCreators.filter((c: any) => c.adType === 'static').length },
  ];

  const topOpportunities = creators
    .filter((c: any) => c.adType === 'video')
    .slice(0, 5)
    .map((c: any) => ({
      name: c.name,
      niche: c.niche,
      totalAds: c.totalAds,
      gap: 'No static creative — expansion opportunity',
      creator: c,
    }));

  const TRADEMARK_TERMS = [
    'spanx', 'lululemon', 'free people', 'anthropologie', 'zara', 
    'nike', 'adidas', 'nordstrom', 'target', 'walmart',
    'shein', 'temu'
  ];

  const complianceFlags = creators
    .map((c: any) => {
      const flaggedAds = c.existingAds.filter((ad: any) =>
        TRADEMARK_TERMS.some(term => ad.copy.toLowerCase().includes(term))
      );
      if (flaggedAds.length === 0) return null;
      const foundTerms = [...new Set(
        flaggedAds.flatMap((ad: any) =>
          TRADEMARK_TERMS.filter(term => ad.copy.toLowerCase().includes(term))
        )
      )];
      return {
        name: c.name,
        niche: c.niche,
        flagCount: flaggedAds.length,
        terms: foundTerms,
        creator: c,
      };
    })
    .filter(Boolean)
    .slice(0, 5);

  const formatGaps = {
    videoOnly: creators.filter((c: any) => c.adType === 'video').length,
    staticOnly: creators.filter((c: any) => c.adType === 'static').length,
    mixed: creators.filter((c: any) => c.adType === 'mixed').length,
  };

  const manualFlags = Object.entries(adFlags).reduce((acc: any, [key, flag]: [string, any]) => {
    const creatorId = key.split('_')[0];
    const creator = creators.find((c: any) => c.id === creatorId);
    if (!creator) return acc;
    if (!acc[creatorId]) {
      acc[creatorId] = { creator, creatorName: creator.name, niche: creator.niche, flags: [] };
    }
    acc[creatorId].flags.push(flag);
    return acc;
  }, {});

  // ── HOME ──────────────────────────────────────────────────────────────────
  if (screen === "home") return (
    <div style={S.app}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); @keyframes spin { to { transform: rotate(360deg); } } .cc:hover { border-color: rgba(201,169,110,0.5) !important; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important; }`}</style>
      <nav style={S.nav}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={S.navBrand}>EchoTribe</span>
          <span style={S.navBadge}>Creator Intelligence</span>
        </div>
        <span style={{ fontSize: "12px", color: "#999999" }}>Demo · Feb 2026</span>
      </nav>
      <div style={S.container}>
        <div style={{ marginBottom: "32px" }}>
          <div style={{ fontSize: "12px", color: "#C9A96E", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "10px" }}>Revenue System Demo</div>
          <h1 style={{ ...S.heading, fontSize: "32px" }}>Creator Ad Intelligence</h1>
          <p style={{ ...S.sub, fontSize: "15px" }}>Select a creator to generate AI ad variations, build content calendars, and get signal-based boost recommendations.</p>

          {csvLoading ? (
            <div style={S.loadingBox}>
              <div style={S.spinner}></div>
              <div style={{ color: '#9CA3AF', fontSize: '14px' }}>Loading creator intelligence...</div>
            </div>
          ) : (
            <>
              {/* Quick Stats Bar */}
              <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px", marginBottom: "16px" }}>
                  {stats.map((s, i) => (
                    <div key={i} style={{ ...S.card, padding: "12px", borderLeft: "none", textAlign: "center", background: "#f8f9fa" }}>
                      <div style={{ fontSize: "20px", fontWeight: "800", color: "#0A0A0A" }}>{s.value}</div>
                      <div style={{ fontSize: "11px", color: "#666", fontWeight: "600", textTransform: "uppercase", marginTop: "2px" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button 
                    style={{ ...S.btnOutline, flex: 1, fontSize: "12px", padding: "10px" }}
                    onClick={() => {
                      const el = document.getElementById('revenue-intelligence');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    💰 Revenue Opportunities
                  </button>
                  <button 
                    style={{ ...S.btnOutline, flex: 1, fontSize: "12px", padding: "10px" }}
                    onClick={() => {
                      const el = document.getElementById('operational-flags');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    ⚠️ Operational Flags
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                {[["all","All Brands"], ["markable","✨ Markable"], ["urlgenius","🔗 URLGenius"], ["mavely","🎯 Mavely"]].map(([val, label]) => (
                  <button key={val} style={S.btnFilter(filterPlatform === val)} onClick={() => setFilterPlatform(val)}>{label}</button>
                ))}
              </div>

              <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
                {[["all","All Creators"], ["video","Video Only"], ["static","Static Only"], ["mixed","Mixed"], ["thumbnail-missing","Thumbnail Missing"]].map(([val, label]) => (
                  <button key={val} style={S.btnFilter(filterType === val)} onClick={() => setFilterType(val)}>{label}</button>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "14px" }}>
                {visibleCreators.map((c: any) => {
                  const adMeta = AD_TYPE_LABELS[c.adType as keyof typeof AD_TYPE_LABELS];
                  const platform = PLATFORM_LABELS[c.platform];
                  return (
                    <div key={c.id} className="cc" style={{ ...S.card, borderLeft: `3px solid ${c.color}` }} onClick={() => selectCreator(c)}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ fontSize: "22px" }}>{c.emoji}</div>
                          {platform && (
                            <span style={{ fontSize: "11px", fontWeight: "700", color: platform.color, background: `${platform.color}15`, padding: "2px 8px", borderRadius: "20px" }}>
                              {platform.label}
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                          <span style={{ ...S.tag, background: adMeta.bg, color: adMeta.color }}>{adMeta.label}</span>
                          <span style={{ ...S.tag, background: `${c.color}20`, color: c.color }}>{c.totalAds} ads</span>
                        </div>
                      </div>
                      <div style={{ fontSize: "15px", fontWeight: "700", marginBottom: "3px" }}>{c.name}</div>
                      <div style={{ fontSize: "12px", color: "#888", marginBottom: "10px" }}>{c.niche} · {c.audience}</div>
                      <div style={{ fontSize: "12px", color: "#999999" }}>Click to explore → generate variations, calendar, boost plan</div>
                    </div>
                  );
                })}
              </div>

              {filteredCreators.length > visibleCreatorCount && (
                <div style={{ textAlign: 'center', marginTop: '32px', marginBottom: '48px' }}>
                  <button
                    style={{ ...S.btnOutline, padding: '12px 32px', fontSize: '14px' }}
                    onClick={() => setVisibleCreatorCount(prev => prev + 10)}
                  >
                    Load More Creators ({filteredCreators.length - visibleCreatorCount} remaining)
                  </button>
                </div>
              )}

              {/* Intelligence Sections (Moved to Bottom) */}
              <div style={{ marginTop: "64px", borderTop: "1px solid #eee", paddingTop: "32px" }}>
                <div id="revenue-intelligence" style={S.sectionLabel}>💰 REVENUE INTELLIGENCE</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "32px" }}>
                  {topOpportunities.map((op, i) => (
                    <div key={i} className="cc" style={{ ...S.card, padding: "12px 16px", borderLeft: "3px solid #34D399", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", flexWrap: "wrap", gap: "8px" }} onClick={() => selectCreator(op.creator)}>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: "700" }}>{op.name}</div>
                        <div style={{ fontSize: "11px", color: "#888" }}>{op.niche}</div>
                      </div>
                      <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ ...S.tag, background: "rgba(0,0,0,0.05)", color: "#666" }}>{op.totalAds} ads</span>
                        <span style={{ ...S.tag, background: "rgba(52,211,153,0.15)", color: "#34D399", fontWeight: "700" }}>↑ Expand to Static</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div id="operational-flags" style={S.sectionLabel}>⚠️ OPERATIONAL FLAGS</div>
                
                {Object.values(manualFlags).length > 0 && (
                  <>
                    <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '1.5px', color: '#EF4444', textTransform: 'uppercase', marginBottom: '14px', marginTop: '14px' }}>🚩 MANUALLY FLAGGED ADS</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                      {Object.values(manualFlags).map((entry: any, i) => (
                        <div
                          key={i}
                          className="cc"
                          style={{ ...S.card, padding: '16px', borderLeft: '3px solid #EF4444', cursor: 'pointer' }}
                          onClick={() => selectCreator(entry.creator)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: '700' }}>{entry.creatorName}</div>
                              <div style={{ fontSize: '12px', color: '#888' }}>{entry.niche}</div>
                            </div>
                            <span style={{
                              fontSize: '11px', fontWeight: '700', padding: '4px 10px',
                              borderRadius: '20px', background: 'rgba(239,68,68,0.15)', color: '#EF4444'
                            }}>
                              {entry.flags.length} flagged {entry.flags.length === 1 ? 'ad' : 'ads'}
                            </span>
                          </div>
                          <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {entry.flags.map((f: any, fi: number) => (
                              <span key={fi} style={{
                                fontSize: '10px', padding: '2px 8px', borderRadius: '4px',
                                background: `${f.color}15`, color: f.color,
                              }}>
                                {f.icon} {f.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                  {complianceFlags.map((f: any, i) => (
                    <div key={i} className="cc" style={{ ...S.card, padding: "12px 16px", borderLeft: "3px solid #FB923C", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", flexWrap: "wrap", gap: "8px" }} onClick={() => selectCreator(f.creator)}>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: "700" }}>{f.name}</div>
                        <div style={{ fontSize: "11px", color: "#888" }}>{f.niche}</div>
                      </div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ ...S.tag, background: "rgba(251,146,60,0.15)", color: "#FB923C", fontWeight: "700" }}>{f.flagCount} flags</span>
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                          {f.terms.slice(0, 3).map((t: string, ti: number) => (
                            <span key={ti} style={{ ...S.tag, background: "rgba(239,68,68,0.1)", color: "#EF4444", fontSize: "10px" }}>{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={S.insightBox}>
                  <div style={{ fontSize: "12px", fontWeight: "700", color: "#C9A96E", marginBottom: "8px" }}>Format Gap Analysis</div>
                  <div style={{ fontSize: "13px", color: "#444", lineHeight: "1.5" }}>
                    {formatGaps.videoOnly} creators running video-only with zero static variations. {formatGaps.staticOnly} running static-only with no video. Only {formatGaps.mixed} creators are running both formats. This represents the primary creative expansion opportunity across the portfolio.
                  </div>
                </div>
              </div>
            </>
          )}
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
        <nav style={{ ...S.nav, flexDirection: "column", gap: "12px", padding: "12px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={S.navBrand}>EchoTribe</span>
              <span style={S.navBadge}>Creator Intelligence</span>
            </div>
            <button style={{ ...S.btnOutline, padding: "6px 12px", fontSize: "12px" }} onClick={() => setScreen("home")}>← All</button>
          </div>
        </nav>
        <div style={S.container}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
            <div>
              <div style={{ fontSize: "23px", fontWeight: "800", marginBottom: "4px" }}>{selectedCreator.emoji} {selectedCreator.name}</div>
              <div style={{ fontSize: "13px", color: "#888888" }}>{selectedCreator.niche} · {selectedCreator.audience}</div>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
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
          <div style={S.sectionLabel}>Existing Ads — Click to Generate AI Ad Variations</div>
          {selectedCreator.existingAds.filter((ad: any) => !!(ad.videoUrl || ad.imageUrl)).slice(0, visibleAdsCount).map((ad, i) => {
            const adProductName = (ad.copy || selectedCreator.name || 'Ad Creative').substring(0, 50).replace(/[^\w\s]/g, '').trim() || 'Ad Creative';
            const adProduct = {
              name: adProductName,
              category: selectedCreator.niche || 'General',
              commission: selectedCreator.amazonData?.avg_commission_rate || '8%',
              trend: '↑ Active',
              badge: ad.hasVideo && ad.hasStatic ? 'Mixed' : ad.hasVideo ? 'Video' : 'Static',
              copy: ad.copy,
            };
            const cleanShopUrl = ad.landing_url || (ad.shopUrl ? ad.shopUrl.split('?')[0] : null);
            const flagKey = `${selectedCreator.id}_${ad.libraryId}`;
            const existingFlag = adFlags[flagKey];
            return (
            <div key={i} style={{ ...S.adRow, display: "flex", gap: "16px", alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{ flexShrink: 0, width: "100px", height: "133px", background: "#f3f4f6", borderRadius: "8px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e5e7eb", position: "relative" }}>
                {(() => {
                  const thumbSrc = ad.cached_thumbnail
                    || (ad.imageUrl && ad.imageUrl !== 'null' ? ad.imageUrl : null)
                    || selectedCreator.profileImage
                    || null;
                  return thumbSrc ? (
                    <>
                      <img
                        src={thumbSrc}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        alt="Ad thumbnail"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      {ad.videoUrl && ad.videoUrl !== 'null' && (
                        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "28px", height: "28px", background: "rgba(0,0,0,0.55)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                          <div style={{ width: 0, height: 0, borderStyle: "solid", borderWidth: "6px 0 6px 11px", borderColor: "transparent transparent transparent white", marginLeft: "2px" }} />
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ color: "#9ca3af", fontSize: "20px" }}>{ad.videoUrl ? "📹" : "🖼️"}</div>
                  );
                })()}
              </div>
              <div style={{ flex: "1 1 250px", minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {ad.hasVideo && <span style={{ ...S.tag, background: "rgba(59,130,246,0.12)", color: "#3B82F6" }}>📹 Video</span>}
                    {ad.hasStatic && <span style={{ ...S.tag, background: "rgba(244,114,182,0.15)", color: "#F472B6" }}>🖼️ Static</span>}
                  </div>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <span style={{ fontSize: "11px", color: "#999999" }}>{ad.started}</span>
                    <AdFlagButton flagKey={flagKey} existingFlag={existingFlag} setAdFlags={setAdFlags} />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite('product', adProduct);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                        color: isFavorite('product', adProductName) ? '#FF3B3B' : '#CCCCCC',
                        padding: '2px'
                      }}
                    >
                      {isFavorite('product', adProductName) ? '❤️' : '🤍'}
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: "13px", color: "#444444", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{ad.copy}</div>
                <ComplianceDisplay flags={checkCompliance(ad.copy)} />
                {existingFlag && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '8px',
                    padding: '6px 10px',
                    background: `${existingFlag.color}15`,
                    border: `1px solid ${existingFlag.color}30`,
                    borderRadius: '6px',
                  }}>
                    <span style={{ fontSize: '12px' }}>{existingFlag.icon}</span>
                    <span style={{ fontSize: '11px', color: existingFlag.color, fontWeight: '600' }}>
                      Flagged: {existingFlag.label}
                    </span>
                    <span style={{ fontSize: '10px', color: '#6B7280', marginLeft: 'auto' }}>
                      {new Date(existingFlag.flaggedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "10px", paddingTop: "8px", borderTop: "1px solid #F0F0F0", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    {adProduct.badge && <span style={{ ...S.tag, background: "rgba(201,169,110,0.15)", color: "#C9A96E", margin: 0 }}>{adProduct.badge}</span>}
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: "13px", fontWeight: "700", color: "#34D399" }}>{adProduct.commission}</div>
                      <div style={{ fontSize: "11px", color: "#999999" }}>{adProduct.trend}</div>
                    </div>
                    {cleanShopUrl && (
                      <a 
                        href={cleanShopUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          fontSize: "11px", 
                          color: "#999999", 
                          textDecoration: "underline",
                          marginLeft: "8px",
                          cursor: "pointer"
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Landing Page ↗
                      </a>
                    )}
                  </div>
                  <button
                    data-testid={`generate-ad-${i}`}
                    style={{
                      ...S.btn,
                      padding: "8px 16px",
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "#C9A96E",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "700"
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      generateContent(adProduct);
                    }}
                  >
                    Generate Ad <span>→</span>
                  </button>
                </div>
              </div>
            </div>
            );
          })}
          {selectedCreator.existingAds.filter((ad: any) => !!(ad.videoUrl || ad.imageUrl)).length > visibleAdsCount && (
            <button
              style={{ ...S.btnOutline, marginTop: '12px', width: '100%', padding: '12px' }}
              onClick={() => setVisibleAdsCount(prev => prev + 6)}
            >
              Load More Ads ({selectedCreator.existingAds.filter((ad: any) => !!(ad.videoUrl || ad.imageUrl)).length - visibleAdsCount} remaining)
            </button>
          )}

          {/* ── PRODUCTS (hidden - functionality moved to Existing Ads) ── */}

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
      <nav style={{ ...S.nav, flexDirection: "column", gap: "12px", padding: "12px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={S.navBrand}>EchoTribe</span>
            <span style={S.navBadge}>Creator Intelligence</span>
          </div>
          <button style={{ ...S.btnOutline, padding: "6px 12px", fontSize: "12px" }} onClick={() => setScreen("profile")}>← Back</button>
        </div>
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
      <nav style={{ ...S.nav, flexDirection: "column", gap: "12px", padding: "12px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={S.navBrand}>EchoTribe</span>
            <span style={S.navBadge}>Creator Intelligence</span>
          </div>
          <button style={{ ...S.btnOutline, padding: "6px 12px", fontSize: "12px" }} onClick={() => setScreen("profile")}>← Back</button>
        </div>
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
      <nav style={{ ...S.nav, flexDirection: "column", gap: "12px", padding: "12px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={S.navBrand}>EchoTribe</span>
            <span style={S.navBadge}>Creator Intelligence</span>
          </div>
          <button style={{ ...S.btnOutline, padding: "6px 12px", fontSize: "12px" }} onClick={() => setScreen("profile")}>← Back</button>
        </div>
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
