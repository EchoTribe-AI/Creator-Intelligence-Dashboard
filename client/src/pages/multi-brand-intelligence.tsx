import { useState, useEffect } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface Platform {
  id: string;
  name: string;
  color: string;
  logo: string;
  description: string;
}

interface CreatorSummary {
  handle: string;
  display_name: string;
  profile_image_url: string | null;
  facebook_page_url: string | null;
  ad_count: number;
  video_count: number;
  static_count: number;
  latest_ad_date: string;
}

interface MetaAd {
  _key: string;
  library_id: string;
  platform_id: string;
  creator_handle: string;
  creator_display_name: string;
  profile_image_url: string | null;
  facebook_page_url: string | null;
  ad_copy: string;
  video_url: string | null;
  image_url: string | null;
  cta_url: string | null;
  ad_type: 'video' | 'static';
  start_date: string;
  imported_at: string;
}

interface DashboardStats {
  total_ads: number;
  by_platform: Record<string, { ad_count: number; creator_count: number }>;
  total_creators: number;
  last_import: string | null;
}

interface ImportState {
  isOpen: boolean;
  file: File | null;
  targetPlatformId: string;
  status: 'idle' | 'reading' | 'uploading' | 'done' | 'error';
  result: { new_count: number; updated: number; imported: number } | null;
  errorMessage: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLE OBJECT
// ─────────────────────────────────────────────────────────────────────────────

const S: any = {
  page: {
    minHeight: '100vh',
    background: '#F9FAFB',
    color: '#111827',
    fontFamily: "'DM Sans', sans-serif",
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 28px',
    background: 'rgba(255,255,255,0.8)',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
    backdropFilter: 'blur(12px)',
  },
  navBrand: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#111827',
    letterSpacing: '-0.3px',
  },
  container: {
    maxWidth: '1140px',
    margin: '0 auto',
    padding: '32px 24px',
  },
  card: {
    background: '#FFFFFF',
    border: '1px solid rgba(0,0,0,0.06)',
    borderRadius: '14px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '1.5px',
    color: '#6B7280',
    textTransform: 'uppercase' as const,
    marginBottom: '14px',
  },
  platformBtn: (active: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    marginBottom: '8px',
    padding: '12px',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left' as const,
    border: active ? '2px solid #C084FC' : '1px solid #E5E7EB',
    background: active ? '#FAF5FF' : '#fff',
    color: active ? '#7C3AED' : '#4B5563',
  }),
  filterChip: (active: boolean) => ({
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    border: active ? 'none' : '1px solid #E5E7EB',
    background: active ? '#C084FC' : '#F3F4F6',
    color: active ? '#fff' : '#6B7280',
  }),
  statLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginBottom: '6px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#111827',
    lineHeight: 1.2,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={S.card}>
      <div style={S.statLabel}>{label}</div>
      <div style={S.statValue}>{value}</div>
    </div>
  );
}

function AvatarCircle({
  src,
  fallbackLetter,
  size,
  color,
}: {
  src: string | null;
  fallbackLetter: string;
  size: number;
  color: string;
}) {
  const [imgError, setImgError] = useState(false);

  const fallback = (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.4,
        fontWeight: '800',
        color: '#fff',
        flexShrink: 0,
      }}
    >
      {fallbackLetter.toUpperCase()}
    </div>
  );

  if (!src || imgError) return fallback;

  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      onError={() => setImgError(true)}
    />
  );
}

function CreatorCard({
  creator,
  onClick,
  platformColor,
}: {
  creator: CreatorSummary;
  onClick: () => void;
  platformColor: string;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        ...S.card,
        cursor: 'pointer',
        transition: 'all 0.18s',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 14px rgba(0,0,0,0.08)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <AvatarCircle
          src={creator.profile_image_url}
          fallbackLetter={creator.display_name[0] ?? creator.handle[0] ?? '?'}
          size={48}
          color={platformColor}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: '700',
              fontSize: '14px',
              color: '#111827',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {creator.display_name}
          </div>
          <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>
            @{creator.handle}
          </div>
        </div>
        <div
          style={{
            background: '#FAF5FF',
            color: '#7C3AED',
            fontWeight: '700',
            fontSize: '12px',
            padding: '3px 8px',
            borderRadius: '6px',
            flexShrink: 0,
          }}
        >
          {creator.ad_count} ads
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          gap: '8px',
          paddingTop: '8px',
          borderTop: '1px solid #F3F4F6',
        }}
      >
        {creator.video_count > 0 && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: '600',
              color: '#6B7280',
              background: '#F3F4F6',
              padding: '3px 8px',
              borderRadius: '5px',
            }}
          >
            {creator.video_count} video
          </span>
        )}
        {creator.static_count > 0 && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: '600',
              color: '#6B7280',
              background: '#F3F4F6',
              padding: '3px 8px',
              borderRadius: '5px',
            }}
          >
            {creator.static_count} static
          </span>
        )}
      </div>
    </div>
  );
}

function AdCard({ ad }: { ad: MetaAd }) {
  const [imgError, setImgError] = useState(false);
  const truncated =
    ad.ad_copy && ad.ad_copy.length > 200 ? ad.ad_copy.slice(0, 200) + '…' : ad.ad_copy;

  return (
    <div style={{ ...S.card, display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280' }}>
          {ad.start_date
            ? new Date(ad.start_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : '—'}
        </div>
        <div
          style={{
            fontSize: '11px',
            fontWeight: '700',
            color: ad.ad_type === 'video' ? '#7C3AED' : '#0369A1',
            background: ad.ad_type === 'video' ? '#FAF5FF' : '#EFF6FF',
            padding: '3px 8px',
            borderRadius: '5px',
          }}
        >
          {ad.ad_type === 'video' ? 'VIDEO' : 'STATIC'}
        </div>
      </div>

      {/* Media thumbnail (image only — video thumbnails fall back gracefully) */}
      {ad.image_url && !imgError && (
        <img
          src={ad.image_url}
          alt=""
          style={{
            width: '100%',
            maxHeight: '180px',
            objectFit: 'cover',
            borderRadius: '8px',
            display: 'block',
          }}
          onError={() => setImgError(true)}
        />
      )}

      {/* Ad copy */}
      {truncated && (
        <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#374151', margin: 0 }}>
          {truncated}
        </p>
      )}

      {/* CTA link */}
      {ad.cta_url && (
        <a
          href={ad.cta_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '12px',
            fontWeight: '700',
            color: '#7C3AED',
            textDecoration: 'none',
            alignSelf: 'flex-start',
          }}
        >
          View Ad →
        </a>
      )}
    </div>
  );
}

function CreatorDetailView({
  creator,
  platformId,
  onBack,
}: {
  creator: CreatorSummary;
  platformId: string;
  onBack: () => void;
}) {
  const [ads, setAds] = useState<MetaAd[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(
      `/api/meta-ads/search?platform=${encodeURIComponent(platformId)}&creator=${encodeURIComponent(creator.handle)}&limit=50`
    )
      .then(r => r.json())
      .then(d => {
        setAds(d.ads || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [platformId, creator.handle]);

  return (
    <div>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          marginBottom: '20px',
          padding: '8px 14px',
          borderRadius: '8px',
          border: '1px solid #E5E7EB',
          background: '#fff',
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer',
          color: '#4B5563',
        }}
      >
        ← All Creators
      </button>

      {/* Creator header */}
      <div style={{ ...S.card, marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <AvatarCircle
            src={creator.profile_image_url}
            fallbackLetter={creator.display_name[0] ?? creator.handle[0] ?? '?'}
            size={64}
            color="#C084FC"
          />
          <div style={{ flex: 1 }}>
            <h2
              style={{
                fontSize: '22px',
                fontWeight: '800',
                color: '#111827',
                letterSpacing: '-0.4px',
                margin: 0,
              }}
            >
              {creator.display_name}
            </h2>
            <div style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '2px' }}>
              @{creator.handle}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={S.statLabel}>Total Ads</div>
              <div style={{ ...S.statValue, fontSize: '20px' }}>{creator.ad_count}</div>
            </div>
            <div
              style={{ width: '1px', height: '36px', background: '#E5E7EB' }}
            />
            <div style={{ textAlign: 'right' }}>
              <div style={S.statLabel}>Video</div>
              <div style={{ ...S.statValue, fontSize: '20px', color: '#7C3AED' }}>
                {creator.video_count}
              </div>
            </div>
            <div
              style={{ width: '1px', height: '36px', background: '#E5E7EB' }}
            />
            <div style={{ textAlign: 'right' }}>
              <div style={S.statLabel}>Static</div>
              <div style={{ ...S.statValue, fontSize: '20px', color: '#0369A1' }}>
                {creator.static_count}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ads grid */}
      {loading ? (
        <div
          style={{
            padding: '60px',
            textAlign: 'center',
            color: '#9CA3AF',
            fontSize: '14px',
          }}
        >
          Loading ads...
        </div>
      ) : ads.length === 0 ? (
        <div
          style={{
            padding: '60px',
            textAlign: 'center',
            color: '#9CA3AF',
            fontSize: '14px',
          }}
        >
          No ads found for this creator.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
          }}
        >
          {ads.map(ad => (
            <AdCard key={ad._key} ad={ad} />
          ))}
        </div>
      )}
    </div>
  );
}

function ImportWidget({
  platforms,
  defaultPlatformId,
  onImportDone,
}: {
  platforms: Platform[];
  defaultPlatformId: string;
  onImportDone: () => void;
}) {
  const [targetPlatformId, setTargetPlatformId] = useState(defaultPlatformId);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'reading' | 'uploading' | 'done' | 'error'>(
    'idle'
  );
  const [result, setResult] = useState<{
    new_count: number;
    updated: number;
    imported: number;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleImport() {
    if (!file) return;
    setStatus('reading');
    const reader = new FileReader();
    reader.onload = e => {
      const csvText = e.target?.result as string;
      setStatus('uploading');
      fetch(`/api/meta-ads/import?platform_id=${encodeURIComponent(targetPlatformId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: csvText,
      })
        .then(r => {
          if (!r.ok) throw new Error(`Server error: ${r.status}`);
          return r.json();
        })
        .then(d => {
          setResult(d);
          setStatus('done');
          setTimeout(() => {
            onImportDone();
          }, 3000);
        })
        .catch(err => {
          setErrorMessage(err.message || 'Import failed');
          setStatus('error');
        });
    };
    reader.readAsText(file);
  }

  return (
    <div
      style={{
        marginTop: '12px',
        padding: '16px',
        background: '#FAF5FF',
        borderRadius: '12px',
        border: '1px solid #E9D5FF',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      <div style={{ fontSize: '12px', fontWeight: '700', color: '#7C3AED', letterSpacing: '0.5px' }}>
        IMPORT CSV
      </div>

      {/* Platform selector */}
      <select
        value={targetPlatformId}
        onChange={e => setTargetPlatformId(e.target.value)}
        style={{
          width: '100%',
          padding: '8px 10px',
          borderRadius: '8px',
          border: '1px solid #E5E7EB',
          background: '#fff',
          fontSize: '13px',
          color: '#111827',
          fontWeight: '600',
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        {platforms.map(p => (
          <option key={p.id} value={p.id}>
            {p.logo} {p.name}
          </option>
        ))}
      </select>

      {/* File picker */}
      <label
        style={{
          display: 'block',
          padding: '14px',
          borderRadius: '8px',
          border: '1.5px dashed #C084FC',
          background: '#fff',
          textAlign: 'center',
          cursor: 'pointer',
          fontSize: '12px',
          color: '#7C3AED',
          fontWeight: '600',
        }}
      >
        {file ? (
          <span style={{ color: '#111827' }}>{file.name}</span>
        ) : (
          'Click to choose .csv file'
        )}
        <input
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={e => {
            const f = e.target.files?.[0] ?? null;
            setFile(f);
            setStatus('idle');
            setResult(null);
            setErrorMessage(null);
          }}
        />
      </label>

      {/* Status feedback */}
      {status === 'uploading' || status === 'reading' ? (
        <div style={{ fontSize: '13px', color: '#7C3AED', fontWeight: '600' }}>
          {status === 'reading' ? 'Reading file…' : 'Importing…'}
        </div>
      ) : status === 'done' && result ? (
        <div style={{ fontSize: '13px', color: '#059669', fontWeight: '600' }}>
          {result.new_count} new ads imported — closing in 3s
        </div>
      ) : status === 'error' && errorMessage ? (
        <div style={{ fontSize: '13px', color: '#DC2626', fontWeight: '600' }}>{errorMessage}</div>
      ) : null}

      {/* Import button */}
      <button
        onClick={handleImport}
        disabled={!file || status === 'reading' || status === 'uploading'}
        style={{
          width: '100%',
          padding: '10px',
          borderRadius: '8px',
          border: 'none',
          background: !file ? '#E5E7EB' : '#C084FC',
          color: !file ? '#9CA3AF' : '#fff',
          fontWeight: '700',
          fontSize: '13px',
          cursor: !file ? 'not-allowed' : 'pointer',
          transition: 'background 0.2s',
        }}
      >
        Import
      </button>
    </div>
  );
}

function EmptyState({ platformName }: { platformName: string | undefined }) {
  return (
    <div
      style={{
        padding: '60px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: '#FAF5FF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
        }}
      >
        📭
      </div>
      <div style={{ fontWeight: '800', fontSize: '18px', color: '#111827' }}>
        No ads imported yet
      </div>
      <div style={{ color: '#6B7280', fontSize: '14px', maxWidth: '320px', lineHeight: '1.5' }}>
        {platformName ? `No creator ads found for ${platformName}.` : 'No creator ads found.'} Use
        the Import CSV button in the sidebar to get started.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function MultiBrandIntelligence() {
  const [selectedPlatformId, setSelectedPlatformId] = useState<string>('markable');
  const [selectedCreator, setSelectedCreator] = useState<CreatorSummary | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [adTypeFilter, setAdTypeFilter] = useState<'all' | 'video' | 'static'>('all');
  const [creators, setCreators] = useState<CreatorSummary[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [importState, setImportState] = useState<ImportState>({
    isOpen: false,
    file: null,
    targetPlatformId: 'markable',
    status: 'idle',
    result: null,
    errorMessage: null,
  });

  // On mount: load platforms and stats
  useEffect(() => {
    fetch('/api/platforms')
      .then(r => r.json())
      .then(d => setPlatforms(d.platforms || []));
    fetchStats();
  }, []);

  function fetchStats() {
    fetch('/api/meta-ads/stats')
      .then(r => r.json())
      .then(d => setStats(d));
  }

  // When platform changes: load creators
  useEffect(() => {
    setSelectedCreator(null);
    fetch(`/api/meta-ads/creators?platform=${encodeURIComponent(selectedPlatformId)}`)
      .then(r => r.json())
      .then(d => setCreators(d.creators || []));
  }, [selectedPlatformId]);

  // Filtered creators (derived)
  const filteredCreators = creators.filter(c => {
    const matchSearch =
      !searchQuery ||
      c.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.handle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType =
      adTypeFilter === 'all' ||
      (adTypeFilter === 'video' && c.video_count > 0) ||
      (adTypeFilter === 'static' && c.static_count > 0);
    return matchSearch && matchType;
  });

  function handleImportDone() {
    setImportState(s => ({ ...s, isOpen: false, file: null, status: 'idle', result: null, errorMessage: null }));
    fetchStats();
    fetch(`/api/meta-ads/creators?platform=${encodeURIComponent(selectedPlatformId)}`)
      .then(r => r.json())
      .then(d => setCreators(d.creators || []));
  }

  const activePlatform = platforms.find(p => p.id === selectedPlatformId);

  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      {/* Nav */}
      <nav style={S.nav}>
        <div style={S.navBrand}>MULTI-BRAND INTELLIGENCE</div>
        <button
          onClick={() => {
            window.history.pushState({}, '', '/');
            window.dispatchEvent(new PopStateEvent('popstate'));
          }}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            background: '#fff',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Back to Dashboard
        </button>
      </nav>

      <div style={S.container}>
        {/* Stats bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            marginBottom: '28px',
          }}
        >
          <StatCard label="Total Ads" value={stats?.total_ads ?? 0} />
          <StatCard label="Total Creators" value={stats?.total_creators ?? 0} />
          <StatCard
            label="Last Import"
            value={
              stats?.last_import
                ? new Date(stats.last_import).toLocaleDateString()
                : 'Never'
            }
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '28px' }}>
          {/* Sidebar */}
          <aside>
            <div style={S.sectionLabel}>Platforms</div>

            {platforms.length === 0 && (
              <div style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '12px' }}>
                No platforms configured.
              </div>
            )}

            {platforms.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPlatformId(p.id)}
                style={S.platformBtn(selectedPlatformId === p.id)}
              >
                <span style={{ fontSize: '20px' }}>{p.logo}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '14px' }}>{p.name}</div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
                    {stats?.by_platform[p.id]?.ad_count ?? 0} ads &middot;{' '}
                    {stats?.by_platform[p.id]?.creator_count ?? 0} creators
                  </div>
                </div>
              </button>
            ))}

            {/* Import button */}
            <button
              onClick={() =>
                setImportState(s => ({
                  ...s,
                  isOpen: !s.isOpen,
                  targetPlatformId: selectedPlatformId,
                }))
              }
              style={{
                width: '100%',
                marginTop: '16px',
                padding: '10px',
                borderRadius: '10px',
                border: '1px dashed #C084FC',
                background: '#FAF5FF',
                color: '#7C3AED',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              + Import CSV
            </button>

            {/* Import widget (inline) */}
            {importState.isOpen && (
              <ImportWidget
                platforms={platforms}
                defaultPlatformId={importState.targetPlatformId}
                onImportDone={handleImportDone}
              />
            )}
          </aside>

          {/* Main content */}
          <main>
            {selectedCreator === null ? (
              <>
                {/* Search + filter */}
                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '20px',
                    alignItems: 'center',
                  }}
                >
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search creators..."
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #E5E7EB',
                      fontSize: '14px',
                      outline: 'none',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  />
                  {(['all', 'video', 'static'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setAdTypeFilter(t)}
                      style={S.filterChip(adTypeFilter === t)}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Creator grid */}
                {filteredCreators.length === 0 ? (
                  <EmptyState platformName={activePlatform?.name} />
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                      gap: '16px',
                    }}
                  >
                    {filteredCreators.map(c => (
                      <CreatorCard
                        key={c.handle}
                        creator={c}
                        onClick={() => setSelectedCreator(c)}
                        platformColor={activePlatform?.color ?? '#C084FC'}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <CreatorDetailView
                creator={selectedCreator}
                platformId={selectedPlatformId}
                onBack={() => setSelectedCreator(null)}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
