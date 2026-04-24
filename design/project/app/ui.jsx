/* global React */
// Shared UI primitives for Route 67.

const Icon = {
  map: (c = 'currentColor') => <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 3L3 6v15l6-3 6 3 6-3V3l-6 3-6-3z" stroke={c} strokeWidth="2" strokeLinejoin="round"/><path d="M9 3v15M15 6v15" stroke={c} strokeWidth="2"/></svg>,
  list: (c = 'currentColor') => <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="4" cy="6" r="1.5" fill={c}/><circle cx="4" cy="12" r="1.5" fill={c}/><circle cx="4" cy="18" r="1.5" fill={c}/><path d="M9 6h12M9 12h12M9 18h12" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  trophy: (c = 'currentColor') => <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6 3h12v4a6 6 0 01-12 0V3z" stroke={c} strokeWidth="2" strokeLinejoin="round"/><path d="M3 4h3v3a3 3 0 003 3M21 4h-3v3a3 3 0 01-3 3M9 17h6M12 13v4M8 21h8" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  user: (c = 'currentColor') => <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke={c} strokeWidth="2"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  nav: (c = 'currentColor') => <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 11L21 3l-8 18-2-8-8-2z" stroke={c} strokeWidth="2" strokeLinejoin="round"/></svg>,
  camera: (c = 'currentColor') => <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 8h3l2-3h8l2 3h3v11H3V8z" stroke={c} strokeWidth="2" strokeLinejoin="round"/><circle cx="12" cy="13" r="4" stroke={c} strokeWidth="2"/></svg>,
  check: (c = 'currentColor') => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 12l5 5L20 6" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  close: (c = 'currentColor') => <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  chevR: (c = 'currentColor') => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 5l7 7-7 7" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chevL: (c = 'currentColor') => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 5l-7 7 7 7" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  flame: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2s5 5 5 10a5 5 0 01-10 0c0-2 1-3 2-5-3 3-5 6-5 9a8 8 0 1016 0c0-7-8-14-8-14z" fill="#FF6B35"/></svg>,
  search: (c = 'currentColor') => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke={c} strokeWidth="2"/><path d="M20 20l-3.5-3.5" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  layers: (c = 'currentColor') => <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 3l9 5-9 5-9-5 9-5z" stroke={c} strokeWidth="2" strokeLinejoin="round"/><path d="M3 13l9 5 9-5M3 18l9 5 9-5" stroke={c} strokeWidth="2" strokeLinejoin="round"/></svg>,
  target: (c = 'currentColor') => <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={c} strokeWidth="2"/><circle cx="12" cy="12" r="4" stroke={c} strokeWidth="2"/><path d="M12 1v3M12 20v3M1 12h3M20 12h3" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  share: (c = 'currentColor') => <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="6" cy="12" r="3" stroke={c} strokeWidth="2"/><circle cx="18" cy="5" r="3" stroke={c} strokeWidth="2"/><circle cx="18" cy="19" r="3" stroke={c} strokeWidth="2"/><path d="M8.5 10.5L15.5 6.5M8.5 13.5L15.5 17.5" stroke={c} strokeWidth="2"/></svg>,
};

function Pill({ children, bg, color, style = {}, weight = 700, size = 11 }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 8px', borderRadius: 999,
      background: bg, color,
      fontSize: size, fontWeight: weight, letterSpacing: 0.3,
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
      ...style,
    }}>{children}</span>
  );
}

function RarityChip({ rarity, size = 11 }) {
  const r = window.TOKENS.rarity[rarity];
  return (
    <Pill bg={r.color + '22'} color={r.color} size={size} style={{ border: `1px solid ${r.color}44` }}>
      {rarity === 'legendary' && '★ '}{r.label}
    </Pill>
  );
}

function Avatar({ name, bg = '#00B14F', size = 36, you = false }) {
  const initials = (name || '?').replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 800, letterSpacing: 0.5,
      flexShrink: 0, fontFamily: window.TOKENS.fontBody,
      boxShadow: you ? '0 0 0 3px #00B14F' : 'none',
    }}>
      {initials}
    </div>
  );
}

// Route 67 highway shield — Singapore colors, Route 66 shape
function Shield67({ size = 90 }) {
  const h = size * 1.055;
  return (
    <svg width={size} height={h} viewBox="0 0 110 116" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.5))' }}>
      <path d="M55 4 L104 22 L104 62 Q104 98 55 112 Q6 98 6 62 L6 22 Z" fill="#EF2B2D" stroke="#fff" strokeWidth="3"/>
      <path d="M55 13 L96 28 L96 62 Q96 91 55 103 Q14 91 14 62 L14 28 Z" fill="#fff"/>
      <path d="M55 13 L96 28 L96 38 L14 38 L14 28 Z" fill="#EF2B2D"/>
      <text x="55" y="34" textAnchor="middle" fontFamily="'Archivo Black', sans-serif" fontSize="13" fontWeight="900" fill="#fff" letterSpacing="3">ROUTE</text>
      <text x="55" y="82" textAnchor="middle" fontFamily="'Archivo Black', sans-serif" fontSize="48" fontWeight="900" fill="#EF2B2D" letterSpacing="-2">67</text>
      <path d="M14 90 L96 90 L96 98 Q55 108 14 98 Z" fill="#EF2B2D"/>
      <text x="55" y="97" textAnchor="middle" fontFamily="'Archivo Black', sans-serif" fontSize="9" fontWeight="900" fill="#fff" letterSpacing="1.5">SINGAPORE</text>
    </svg>
  );
}

// Inline SVG shield — for embedding inside other SVGs
function ShieldSVG({ x = 0, y = 0, size = 40 }) {
  const s = size / 110;
  return (
    <g transform={`translate(${x - size/2} ${y - (size * 116/110)/2}) scale(${s})`}>
      <path d="M55 4 L104 22 L104 62 Q104 98 55 112 Q6 98 6 62 L6 22 Z" fill="#EF2B2D" stroke="#fff" strokeWidth="3"/>
      <path d="M55 13 L96 28 L96 62 Q96 91 55 103 Q14 91 14 62 L14 28 Z" fill="#fff"/>
      <path d="M55 13 L96 28 L96 38 L14 38 L14 28 Z" fill="#EF2B2D"/>
      <text x="55" y="34" textAnchor="middle" fontFamily="'Archivo Black', sans-serif" fontSize="13" fontWeight="900" fill="#fff" letterSpacing="3">ROUTE</text>
      <text x="55" y="82" textAnchor="middle" fontFamily="'Archivo Black', sans-serif" fontSize="48" fontWeight="900" fill="#EF2B2D" letterSpacing="-2">67</text>
      <path d="M14 90 L96 90 L96 98 Q55 108 14 98 Z" fill="#EF2B2D"/>
      <text x="55" y="97" textAnchor="middle" fontFamily="'Archivo Black', sans-serif" fontSize="9" fontWeight="900" fill="#fff" letterSpacing="1.5">SINGAPORE</text>
    </g>
  );
}

// "67" logo mark — chunky gradient pill
function Logo67({ size = 32, dark = false }) {
  return (
    <div style={{
      width: size * 1.7, height: size, borderRadius: size * 0.3,
      background: 'linear-gradient(135deg, #00B14F 0%, #2BDB75 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: window.TOKENS.fontDisplay, color: '#fff',
      fontSize: size * 0.62, letterSpacing: -1,
      boxShadow: '0 4px 14px rgba(0,177,79,0.35)',
      flexShrink: 0,
    }}>67</div>
  );
}

function TabBar({ tab, onTab, theme }) {
  const T = theme;
  const tabs = [
    { id: 'map', label: 'Map', icon: Icon.map },
    { id: 'spots', label: 'Spots', icon: Icon.list },
    { id: 'hunt', label: null, icon: null }, // FAB slot
    { id: 'board', label: 'Ranks', icon: Icon.trophy },
    { id: 'me', label: 'Me', icon: Icon.user },
  ];
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      background: T.surface,
      borderTop: `1px solid ${T.border}`,
      paddingBottom: 18, paddingTop: 8,
      display: 'flex', justifyContent: 'space-around',
      alignItems: 'flex-end',
      zIndex: 30,
    }}>
      {tabs.map((t) => {
        if (t.id === 'hunt') {
          return (
            <button key="hunt" onClick={() => onTab('hunt')} style={{
              width: 62, height: 65, borderRadius: 0,
              background: 'transparent',
              border: 'none',
              marginTop: -30,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', padding: 0,
              flexShrink: 0,
            }}>
              <Shield67 size={58}/>
            </button>
          );
        }
        const active = tab === t.id;
        return (
          <button key={t.id} onClick={() => onTab(t.id)} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            color: active ? T.primary : T.textFaint,
            padding: '4px 8px',
          }}>
            {t.icon(active ? T.primary : T.textFaint)}
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.2 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Card({ children, theme, style = {} }) {
  return (
    <div style={{
      background: theme.surface, borderRadius: 18,
      border: `1px solid ${theme.border}`,
      boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset, 0 4px 16px rgba(10,58,31,0.04)',
      ...style,
    }}>{children}</div>
  );
}

function Stat({ label, value, sub, theme, style = {} }) {
  return (
    <div style={{
      flex: 1, padding: '14px 12px', textAlign: 'center',
      ...style,
    }}>
      <div style={{ fontFamily: window.TOKENS.fontDisplay, fontSize: 26, color: theme.text, letterSpacing: -0.5, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, fontWeight: 700, color: theme.textFaint, letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 6 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// Phone frame — simpler than iOS starter, matches our Grab vibe
function PhoneFrame({ children, theme, width = 390, height = 780, dark }) {
  return (
    <div style={{
      width, height, borderRadius: 46, padding: 8,
      background: dark ? '#000' : '#1a1a1a',
      boxShadow: '0 30px 70px rgba(10,58,31,0.25), 0 0 0 1px rgba(0,0,0,0.1)',
      flexShrink: 0,
      position: 'relative',
    }}>
      <div style={{
        width: '100%', height: '100%', borderRadius: 38, overflow: 'hidden',
        background: theme.bg, position: 'relative',
      }}>
        {/* dynamic island */}
        <div style={{
          position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
          width: 110, height: 32, borderRadius: 20, background: '#000', zIndex: 100,
        }}/>
        {/* status bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 28px 0', zIndex: 99,
          fontSize: 14, fontWeight: 600, color: theme.text,
          fontFamily: window.TOKENS.fontBody,
        }}>
          <span>9:41</span>
          <span style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            <svg width="16" height="10" viewBox="0 0 16 10"><rect x="0" y="6" width="3" height="4" rx="0.5" fill={theme.text}/><rect x="4" y="4" width="3" height="6" rx="0.5" fill={theme.text}/><rect x="8" y="2" width="3" height="8" rx="0.5" fill={theme.text}/><rect x="12" y="0" width="3" height="10" rx="0.5" fill={theme.text}/></svg>
            <svg width="22" height="10" viewBox="0 0 22 10"><rect x="0.5" y="0.5" width="19" height="9" rx="2" fill="none" stroke={theme.text} strokeOpacity="0.4"/><rect x="2" y="2" width="16" height="6" rx="1" fill={theme.text}/></svg>
          </span>
        </div>
        {/* home indicator */}
        <div style={{
          position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)',
          width: 130, height: 4, borderRadius: 2,
          background: theme.text, opacity: 0.3, zIndex: 100,
        }}/>
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Icon, Pill, RarityChip, Avatar, Logo67, Shield67, ShieldSVG, TabBar, Card, Stat, PhoneFrame });
