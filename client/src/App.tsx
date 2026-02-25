import { useState, useEffect } from "react";
import Papa from 'papaparse';
import { Switch, Route, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import MarkableDemoV3 from "@/pages/markable_demo_v3";

// ─────────────────────────────────────────────────────────────────────────────
// DATA UTILS
// ─────────────────────────────────────────────────────────────────────────────

function buildCreatorsFromCSV(rows: any[], company = 'Unknown') {
  const creatorMap: Record<string, any> = {};
  const NICHE_KEYWORDS: Record<string, string[]> = {
    'Fashion & Lifestyle': ['fashion','style','outfit','clothes','look','wear','dress','pants','set','lounge'],
    'Mom & Kids': ['mom','kid','baby','child','toy','lego','art','school','son','daughter'],
    'Home & Kitchen': ['home','kitchen','organiz','storage','clean','decor','couch','sofa'],
    'Beauty & Wellness': ['beauty','skin','makeup','serum','glow','hair','lash','brow'],
    'Fitness': ['workout','gym','fitness','yoga','legging','activewear','protein'],
  };

  rows.forEach((row) => {
    const pageUrl = row['Influencer Facebook Page'] || row['Facebook Page'] || '';
    const rawId = pageUrl.split('/').filter(Boolean).pop() || '';
    const id = rawId.toLowerCase().replace(/[^a-z0-9]/g, '') || `creator_${Math.random().toString(36).slice(2,7)}`;
    if (id === 'remarkableas' || !id) return;

    const copy = (row['Ad Details'] || row['Ad Copy'] || '').trim();
    const videoUrl = row['Video URL'] || row['video_url'] || '';
    const imageUrl = row['Content Image URL'] || row['image_url'] || '';
    const hasVideo = !!(videoUrl && videoUrl !== 'null' && videoUrl !== '');
    const hasStatic = !!(imageUrl && imageUrl !== 'null' && imageUrl !== '') && !hasVideo;
    const started = row['Started'] || row['Started Date'] || row['start_date'] || '';

    const copyLower = copy.toLowerCase();
    let niche = 'General';
    for (const [n, keywords] of Object.entries(NICHE_KEYWORDS)) {
      if (keywords.some(k => copyLower.includes(k))) { niche = n; break; }
    }

    const COLORS = ['#FF6B6B','#C084FC','#34D399','#60A5FA','#FB923C','#F472B6','#A78BFA'];
    const EMOJIS = ['✨','🔥','🌿','👶','💄','🏠','⚡'];

    if (!creatorMap[id]) {
      const idx = Object.keys(creatorMap).length % COLORS.length;
      creatorMap[id] = {
        id, company, name: rawId || id, handle: `@${id}`,
        niche, tone: 'Authentic, relatable', audience: 'General audience',
        totalAds: 0, color: COLORS[idx], emoji: EMOJIS[idx],
        adType: hasVideo ? 'video' : hasStatic ? 'static' : 'video',
        existingAds: [],
      };
    }

    creatorMap[id].totalAds++;
    if (hasVideo && creatorMap[id].adType === 'static') creatorMap[id].adType = 'mixed';
    if (hasStatic && creatorMap[id].adType === 'video') creatorMap[id].adType = 'mixed';

    creatorMap[id].existingAds.push({
      copy, videoUrl, imageUrl, hasVideo, hasStatic,
      started, libraryId: row['Meta Library ID'] || row['library_id'] || '',
      shopUrl: row['CTA Shop Now URL'] || row['shop_url'] || '',
    });
  });

  return Object.values(creatorMap);
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function CsvUploadModal({ onClose, onUpload }: { onClose: () => void; onUpload: (creators: any[], company: string) => void }) {
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File) => {
    if (!companyName.trim()) { setError('Please enter a company name first.'); return; }
    setError('');
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: (results) => {
        const creators = buildCreatorsFromCSV(results.data as any[], companyName.trim());
        onUpload(creators, companyName.trim());
        onClose();
      }
    });
  };

  const DS = {
    overlay: { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' },
    modal:   { background: '#fff', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' },
    input:   { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const },
    dropzone:(over: boolean) => ({ border: `2px dashed ${over ? '#FF6B6B' : '#E5E7EB'}`, borderRadius: '12px', padding: '32px', textAlign: 'center' as const, background: over ? '#FFF5F5' : '#F9FAFB', cursor: 'pointer', transition: 'all 0.2s' }),
    btn:     { background: '#FF6B6B', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 22px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', width: '100%' },
  };

  return (
    <div style={DS.overlay} onClick={onClose}>
      <div style={DS.modal} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#111827' }}>Upload Creator CSV</div>
            <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>Ads will be tagged with the company name for filtering</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#9CA3AF' }}>×</button>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Company Name *</label>
          <input style={DS.input} value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. Markable, BrandX, Agency ABC" />
          {error && <div style={{ fontSize: '12px', color: '#EF4444', marginTop: '6px' }}>{error}</div>}
        </div>
        <div style={DS.dropzone(dragOver)}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          onClick={() => { const i = document.createElement('input'); i.type = 'file'; i.accept = '.csv'; i.onchange = (e: any) => { const f = e.target.files[0]; if (f) handleFile(f); }; i.click(); }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>📂</div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Drop CSV here or click to browse</div>
          <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>Must have same column format as existing ad library exports</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DANNY PAGE (PARTNERSHIP PROPOSAL BUILDER)
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

    const markableAdSpend = monthlyBudget * (markableMatchPct / 100);
    const totalAdSpend = monthlyBudget + markableAdSpend;
    const clicks = Math.round(totalAdSpend / cpc);
    const orders = Math.round(clicks * (cvr / 100));
    const gmv = orders * aov;
    const earnings = gmv * (commissionRate / 100);
    const epc = clicks > 0 ? earnings / clicks : 0;
    const affiliateCommPool = earnings;
    const brandROAS_adOnly = monthlyBudget > 0 ? gmv / monthlyBudget : 0;
    const brandROAS_total = (monthlyBudget + affiliateCommPool) > 0 ? gmv / (monthlyBudget + affiliateCommPool) : 0;
    const brandProfit = earnings - monthlyBudget;
    const markableNet = earnings - markableAdSpend;
    const creatorSplit = markableNet * 0.50;
    const markableProfit = markableNet * 0.50;
    const markableROAS = markableAdSpend > 0 ? markableProfit / markableAdSpend : 0;
    const twoMonthBrandAd = monthlyBudget * 2;
    const twoMonthCommPool = affiliateCommPool * 2;
    const twoMonthGMV = gmv * 2;
    const twoMonthEarnings = earnings * 2;
    const twoMonthTotalAd = totalAdSpend * 2;
    const twoMonthMarkableAd = markableAdSpend * 2;
    const twoMonthMarkableNet = markableNet * 2;
    const twoMonthCreatorSplit = creatorSplit * 2;
    const twoMonthMarkableProfit = markableProfit * 2;

    const statTiles = [
      { label: 'Clicks / Month', value: clicks.toLocaleString(), sublabel: `$${Math.round(totalAdSpend).toLocaleString()} total media deployed`, color: '#C084FC', icon: '👆' },
      { label: 'GMV Driven', value: `$${Math.round(gmv).toLocaleString()}`, color: '#34D399', icon: '🛒' },
      { label: 'Affiliate Earnings', value: `$${Math.round(earnings).toLocaleString()}`, color: '#FF6B6B', icon: '💰' },
      { label: 'EPC', value: `$${epc.toFixed(4)}`, color: '#C084FC', icon: '⚡' },
      { label: 'Brand ROAS (ad only)', sublabel: 'GMV / Brand Ad Spend', value: `${brandROAS_adOnly.toFixed(1)}x`, color: brandROAS_adOnly >= 10 ? '#34D399' : brandROAS_adOnly >= 5 ? '#F59E0B' : '#EF4444', icon: '🏪', indicator: brandROAS_adOnly >= 10 ? 'strong' : brandROAS_adOnly >= 5 ? 'moderate' : 'low' },
      { label: 'Monthly Profit', sublabel: 'Affiliate Earnings − Brand Ad Spend', value: `$${Math.round(brandProfit).toLocaleString()}`, color: brandProfit > 0 ? '#34D399' : '#EF4444', icon: '📊' },
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
                <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', letterSpacing: '-0.5px' }}>Partnership Proposal Builder</h1>
                <p style={{ color: '#6B7280', fontSize: '15px', marginTop: '4px' }}>Select retailer benchmarks and project campaign impact</p>
              </div>
              <Link href="/">
                <button style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                  ← Back to Dashboard
                </button>
              </Link>
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
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
      </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [creators, setCreators] = useState<any[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filterCompany, setFilterCompany] = useState('all');

  useEffect(() => {
    fetch('/markable-ads-v2.csv')
      .then(r => r.text())
      .then(text => {
        Papa.parse(text, {
          header: true, skipEmptyLines: true,
          complete: (results) => {
            const parsed = buildCreatorsFromCSV(results.data as any[], 'Markable');
            setCreators(parsed);
          }
        });
      });
  }, []);

  const handleCsvUpload = (newCreators: any[], company: string) => {
    setCreators(prev => {
      const existingIds = new Set(newCreators.map((c: any) => c.id));
      const kept = prev.filter((c: any) => !existingIds.has(c.id));
      return [...kept, ...newCreators];
    });
    setFilterCompany(company);
  };

  const companies = ['all', ...Array.from(new Set(creators.map((c: any) => c.company).filter(Boolean)))];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        body { background-color: #F9FAFB; font-family: 'DM Sans', sans-serif; color: #111827; margin: 0; }
      `}</style>
      
      {showUploadModal && (
        <CsvUploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleCsvUpload}
        />
      )}

      <Switch>
        <Route path="/">
          <MainDashboard 
            creators={creators} 
            setShowUploadModal={setShowUploadModal} 
            filterCompany={filterCompany}
            setFilterCompany={setFilterCompany}
            companies={companies}
          />
        </Route>
        <Route path="/danny" component={DannyPage} />
        <Route path="/v3" component={MarkableDemoV3} />
      </Switch>
    </>
  );
}

function MainDashboard({ creators, setShowUploadModal, filterCompany, setFilterCompany, companies }: any) {
  const [filterType, setFilterType] = useState('all');

  const DS: any = {
    nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', background: 'rgba(255,255,255,0.8)', borderBottom: '1px solid rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' },
    card: { background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' },
    sectionLabel: { fontSize: '11px', fontWeight: '700', letterSpacing: '1.5px', color: '#6B7280', textTransform: 'uppercase', marginBottom: '14px' },
    filterBtn: (active: boolean) => ({
      padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
      background: active ? '#FF6B6B' : '#F3F4F6',
      color: active ? '#fff' : '#6B7280',
      border: active ? 'none' : '1px solid #E5E7EB',
      transition: 'all 0.2s'
    }),
  };

  const filteredCreators = creators.filter((c: any) => {
    const typeMatch = filterType === 'all' || c.adType === filterType;
    const companyMatch = filterCompany === 'all' || c.company === filterCompany;
    return typeMatch && companyMatch;
  });

  return (
    <div style={{ minHeight: '100vh' }}>
      <div style={DS.nav}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '18px', fontWeight: '800', color: '#111827', letterSpacing: '-0.3px' }}>Markable Intelligence</span>
          <span style={{ fontSize: '10px', background: '#FF6B6B', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', marginLeft: '8px' }}>Beta</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/danny">
            <button style={{ background: 'transparent', color: '#6B7280', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Proposal Builder</button>
          </Link>
          <Link href="/v3">
            <button style={{ background: 'transparent', color: '#6B7280', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>V3 Dashboard</button>
          </Link>
          <button
            style={{ background: 'transparent', color: '#FF6B6B', border: '1px solid #FF6B6B', borderRadius: '8px', padding: '7px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
            onClick={() => setShowUploadModal(true)}
          >
            + Upload CSV
          </button>
        </div>
      </div>

      <div style={DS.container}>
        <div style={{ marginBottom: '32px' }}>
          <div style={DS.sectionLabel}>Filters</div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {['all', 'video', 'static', 'mixed'].map(t => (
              <button key={t} onClick={() => setFilterType(t)} style={DS.filterBtn(filterType === t)}>
                {t.toUpperCase()}
              </button>
            ))}

            {companies.length > 1 && (
              <>
                <div style={{ width: '1px', height: '16px', background: '#E5E7EB', margin: '0 8px' }} />
                <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Company:</span>
                {companies.map(co => (
                  <button key={co} onClick={() => setFilterCompany(co)} style={DS.filterBtn(filterCompany === co)}>
                    {co === 'all' ? 'All Companies' : co}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {filteredCreators.map((c: any) => (
            <div key={c.id} style={{ ...DS.card, borderLeft: `4px solid ${c.color}`, transition: 'transform 0.2s', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span style={{ fontSize: '24px' }}>{c.emoji}</span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <Badge variant="outline" style={{ borderColor: '#E5E7EB', color: '#6B7280', textTransform: 'uppercase', fontSize: '9px' }}>{c.adType}</Badge>
                  {c.company && <span style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '4px' }}>{c.company}</span>}
                </div>
              </div>
              <div style={{ fontWeight: '800', fontSize: '16px', color: '#111827' }}>{c.name}</div>
              <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>{c.handle}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#111827' }}>{c.totalAds} Ads</span>
                <span style={{ fontSize: '11px', color: '#FF6B6B', fontWeight: '600' }}>View Profile →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
