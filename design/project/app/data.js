// Sample 67 spots near NUS (National University of Singapore), Kent Ridge
// Coordinates are in a local normalized grid (0..1 in x/y) that we paint onto our
// stylized SVG map. Real lat/lng isn't needed for the mockup.
//
// Rarity weights loosely: most are common, a few rare, 1–2 legendary.

window.SPOTS = [
  { id: 's1',  name: '67 Lecture Theatre',        place: 'NUS Engineering',         rarity: 'legendary', x: 0.42, y: 0.48, emoji: '🎓', visitors: 1247, note: 'The og. Room 67, EA Building.', claim: '2m ago' },
  { id: 's2',  name: 'Bus Stop #67',              place: 'Kent Ridge MRT',          rarity: 'common',    x: 0.30, y: 0.52, emoji: '🚏', visitors: 3120, note: 'The stop everyone memes about.', claim: 'just now' },
  { id: 's3',  name: 'Block 67 Hostel',           place: 'Prince George\'s Park',   rarity: 'rare',      x: 0.55, y: 0.38, emoji: '🏠', visitors: 489, note: 'Iconic room numbers.', claim: '5m ago' },
  { id: 's4',  name: 'Laksa @ $6.70',             place: 'The Deck',                rarity: 'rare',      x: 0.48, y: 0.56, emoji: '🍜', visitors: 812, note: 'Price ending in .67 counts.', claim: '12m ago' },
  { id: 's5',  name: 'Car Park 67',               place: 'UTown Residence',         rarity: 'common',    x: 0.62, y: 0.28, emoji: '🅿️', visitors: 240, note: 'A classic.', claim: '1h ago' },
  { id: 's6',  name: '67m Elevation',             place: 'Kent Ridge Park',         rarity: 'common',    x: 0.38, y: 0.62, emoji: '⛰️', visitors: 156, note: 'The exact altitude marker.', claim: '3h ago' },
  { id: 's7',  name: 'Gate 67',                   place: 'NUS Sports Centre',       rarity: 'common',    x: 0.26, y: 0.42, emoji: '🚪', visitors: 340, note: '', claim: '—' },
  { id: 's8',  name: '$6.70 Kopi',                place: 'Frontier Canteen',        rarity: 'rare',      x: 0.44, y: 0.44, emoji: '☕',  visitors: 612, note: 'The large size.', claim: '25m ago' },
  { id: 's9',  name: 'Tree #67',                  place: 'Alumni Plaza',            rarity: 'common',    x: 0.52, y: 0.50, emoji: '🌳', visitors: 98,  note: 'Tagged by arborist.', claim: '—' },
  { id: 's10', name: 'Chili $6.70 Chicken Rice',  place: 'PGP Canteen',             rarity: 'common',    x: 0.58, y: 0.44, emoji: '🍗', visitors: 1050, note: '', claim: '8m ago' },
  { id: 's11', name: 'Locker 067',                place: 'Central Library',         rarity: 'common',    x: 0.47, y: 0.40, emoji: '🔒', visitors: 77, note: '', claim: '—' },
  { id: 's12', name: 'Km 6.7 Marker',             place: 'AYE Expressway',          rarity: 'legendary', x: 0.20, y: 0.60, emoji: '🛣️', visitors: 43,  note: 'Rare. Don\'t walk there.', claim: 'yesterday' },
];

// A precomputed "optimal route" — ordered list of spot IDs forming a loop from user
// (center) through a mix of rarities within the 2km inflation radius.
window.ROUTE_DEFAULT = ['s2', 's8', 's1', 's4', 's10', 's3', 's9', 's11'];

window.USER = {
  name: 'jamie.l',
  handle: '@jamie67',
  avatarBg: 'linear-gradient(135deg, #00B14F 0%, #2BDB75 100%)',
  initials: 'JL',
  totalVisited: 47,
  rank: 128,
  streak: 12,
  country: 'Singapore',
  city: 'Singapore',
  flag: '🇸🇬',
};

window.LEADERBOARD = {
  global: [
    { rank: 1,  name: 'sixsevenkingpin', flag: '🇺🇸', visited: 892, delta: '+14', avatar: '#FF6B6B' },
    { rank: 2,  name: 'madein67',        flag: '🇬🇧', visited: 743, delta: '+8',  avatar: '#4ECDC4' },
    { rank: 3,  name: 'pookie.67',       flag: '🇰🇷', visited: 701, delta: '+22', avatar: '#FFD93D' },
    { rank: 4,  name: 'sixty7.finesse',  flag: '🇨🇦', visited: 688, delta: '+3',  avatar: '#95E1D3' },
    { rank: 5,  name: 'cooked.gyatt',    flag: '🇦🇺', visited: 654, delta: '+11', avatar: '#C06EFF' },
    { rank: 6,  name: '67.delulu',       flag: '🇯🇵', visited: 612, delta: '+7',  avatar: '#FFA06B' },
    { rank: 7,  name: 'kai.senat',       flag: '🇧🇷', visited: 587, delta: '+18', avatar: '#6BCF7F' },
    { rank: 8,  name: 'rizz.lord.67',    flag: '🇿🇦', visited: 544, delta: '+4',  avatar: '#FF8FB1' },
    { rank: 9,  name: 'lowtaperfade',    flag: '🇲🇽', visited: 528, delta: '+15', avatar: '#4FC3F7' },
    { rank: 10, name: 'skibidi.map',     flag: '🇸🇬', visited: 511, delta: '+2',  avatar: '#FFD54F' },
  ],
  country: [
    { rank: 1, name: 'skibidi.map',      flag: '🇸🇬', visited: 511, delta: '+2',  avatar: '#FFD54F' },
    { rank: 2, name: 'merlion67',        flag: '🇸🇬', visited: 402, delta: '+9',  avatar: '#81C784' },
    { rank: 3, name: 'chickenrice.gyatt',flag: '🇸🇬', visited: 378, delta: '+12', avatar: '#FF9800' },
    { rank: 4, name: 'kopi.oh.67',       flag: '🇸🇬', visited: 301, delta: '+5',  avatar: '#A1887F' },
    { rank: 5, name: 'sengkang.rizzler', flag: '🇸🇬', visited: 289, delta: '+17', avatar: '#7986CB' },
    { rank: 6, name: 'hawker.hunter',    flag: '🇸🇬', visited: 244, delta: '+3',  avatar: '#F06292' },
  ],
  city: [
    { rank: 1, name: 'kentridge.kai',    flag: '🇸🇬', visited: 178, delta: '+8',  avatar: '#4DB6AC' },
    { rank: 2, name: 'nus.unlocker',     flag: '🇸🇬', visited: 164, delta: '+11', avatar: '#BA68C8' },
    { rank: 3, name: 'utown.drifter',    flag: '🇸🇬', visited: 142, delta: '+4',  avatar: '#FFB74D' },
    { rank: 4, name: 'deck.gourmet',     flag: '🇸🇬', visited: 119, delta: '+2',  avatar: '#4FC3F7' },
  ],
  friends: [
    { rank: 1, name: 'arjun_67',         flag: '🇸🇬', visited: 88,  delta: '+5',  avatar: '#F06292' },
    { rank: 2, name: 'weiling',          flag: '🇸🇬', visited: 72,  delta: '+3',  avatar: '#81C784' },
    { rank: 3, name: 'you',              flag: '🇸🇬', visited: 47,  delta: '+2',  avatar: '#00B14F', you: true },
    { rank: 4, name: 'daniyal',          flag: '🇸🇬', visited: 41,  delta: '+0',  avatar: '#FFB74D' },
    { rank: 5, name: 'mrs_chan',         flag: '🇸🇬', visited: 12,  delta: '+1',  avatar: '#BA68C8' },
  ],
};

window.BADGES = [
  { id: 'streak7',  name: '7-Day Hunter',     emoji: '🔥', earned: true,  desc: 'Check in 7 days in a row' },
  { id: 'first',    name: 'First 67',         emoji: '🥇', earned: true,  desc: 'Your very first 67' },
  { id: 'legend',   name: 'Legend Tier',      emoji: '👑', earned: true,  desc: 'Claim a legendary 67' },
  { id: 'nighthunt',name: 'Night Hunter',     emoji: '🌙', earned: true,  desc: 'Check in after midnight' },
  { id: 'social',   name: 'Crew of 67',       emoji: '🤝', earned: false, desc: 'Hunt with 3+ friends' },
  { id: 'globetrot',name: 'Globetrotter',     emoji: '🌍', earned: false, desc: 'Check in on 3 continents' },
];
