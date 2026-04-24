// Hand-picked "67"-themed Singapore spots used when the Places API under-delivers.
// Each entry either has 67 in the name or a plausible "67 …" / "Block 67" /
// "Bus Stop 67" reference so the hunt still feels on-theme.

export type FallbackSpot = {
  name: string;
  address?: string;
  lat: number;
  lng: number;
};

export const FALLBACK_SPOTS: FallbackSpot[] = [
  { name: 'Block 67 Chomp Chomp', address: '67 Kent Ridge Road', lat: 1.2945, lng: 103.7722 },
  { name: '67 Kopitiam Lane', address: '67 Prince George\'s Park Rd', lat: 1.2908, lng: 103.7800 },
  { name: 'Bus Stop 67', address: 'Stop 67, Science Drive 2', lat: 1.2974, lng: 103.7806 },
  { name: 'Laksa @ $6.70', address: '67 Engineering Drive 1', lat: 1.3006, lng: 103.7707 },
  { name: '67 Lecture Theatre', address: 'Block 67, Business School', lat: 1.2937, lng: 103.7751 },
  { name: 'Lot 67 Parking', address: '67 Yusof Ishak Lane', lat: 1.2986, lng: 103.7744 },
  { name: 'Route 67 Shelter', address: 'Kent Vale Bus Stop 67', lat: 1.3014, lng: 103.7671 },
  { name: '67 UTown Corner', address: '67 Stephen Riady Way', lat: 1.3039, lng: 103.7730 },
  { name: 'Classroom 67', address: '67 Education Resource Ln', lat: 1.3042, lng: 103.7734 },
  { name: 'MRT Pillar 67', address: '67 Lower Kent Ridge Road', lat: 1.2935, lng: 103.7844 },
  { name: 'Blk 67 Clementi Hawker', address: '67 Clementi Ave 3', lat: 1.3113, lng: 103.7648 },
  { name: '67 West Coast Link', address: '67 Commonwealth Ave West', lat: 1.3152, lng: 103.7646 },
  { name: '67 Ayer Rajah Stall', address: '67 West Coast Drive', lat: 1.3046, lng: 103.7608 },
  { name: 'Biopolis Gate 67', address: '67 Biopolis Way', lat: 1.2991, lng: 103.7877 },
  { name: 'Timbre+ Bay 67', address: '67 Ayer Rajah Crescent', lat: 1.2965, lng: 103.7874 },
  { name: 'Fusionopolis Room 67', address: '67 Fusionopolis Way', lat: 1.2990, lng: 103.7880 },
  { name: 'Rochester Deck 67', address: '67 Rochester Drive', lat: 1.3052, lng: 103.7874 },
  { name: '67 Pasir Panjang Hut', address: '67 Pasir Panjang Road', lat: 1.2831, lng: 103.7824 },
  { name: 'Hawker 67 PP', address: '67 Pasir Panjang Food Centre', lat: 1.2782, lng: 103.7913 },
  { name: '67 Holland Ln', address: '67 Lorong Mambong', lat: 1.3109, lng: 103.7962 },
];
