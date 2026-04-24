// Hand-picked NUS / One-North / Clementi spots used when the Places API underperforms.

export type FallbackSpot = {
  name: string;
  address?: string;
  lat: number;
  lng: number;
};

export const FALLBACK_SPOTS: FallbackSpot[] = [
  { name: 'The Deck', address: 'NUS Arts, 11 Arts Link', lat: 1.2945, lng: 103.7722 },
  { name: 'Supper Stretch', address: 'Prince George\'s Park, NUS', lat: 1.2908, lng: 103.7800 },
  { name: 'Frontier Kopitiam', address: 'Science Drive 2, NUS', lat: 1.2974, lng: 103.7806 },
  { name: 'Techno Edge', address: 'Engineering Drive 1, NUS', lat: 1.3006, lng: 103.7707 },
  { name: 'Fine Food', address: 'Business School, NUS', lat: 1.2937, lng: 103.7751 },
  { name: 'Terrace @ YIH', address: 'Yusof Ishak House, NUS', lat: 1.2986, lng: 103.7744 },
  { name: 'Kent Vale', address: '1 Kent Vale, NUS Staff Housing', lat: 1.3014, lng: 103.7671 },
  { name: 'Flavours @ UTown', address: 'UTown Stephen Riady Centre, NUS', lat: 1.3039, lng: 103.7730 },
  { name: 'Starbucks UTown', address: 'Education Resource Centre, NUS UTown', lat: 1.3042, lng: 103.7734 },
  { name: 'NUS Kent Ridge MRT', address: 'Lower Kent Ridge Road', lat: 1.2935, lng: 103.7844 },
  { name: 'Clementi 448 Market & Food Centre', address: '448 Clementi Ave 3', lat: 1.3113, lng: 103.7648 },
  { name: 'Clementi MRT', address: '3151 Commonwealth Avenue West', lat: 1.3152, lng: 103.7646 },
  { name: 'Ayer Rajah Food Centre', address: '503 West Coast Drive', lat: 1.3046, lng: 103.7608 },
  { name: 'One-North MRT', address: '30 Biopolis Way', lat: 1.2991, lng: 103.7877 },
  { name: 'Timbre+ One-North', address: '73A Ayer Rajah Crescent', lat: 1.2965, lng: 103.7874 },
  { name: 'Fusionopolis', address: '1 Fusionopolis Way', lat: 1.2990, lng: 103.7880 },
  { name: 'Rochester Mall', address: '35 Rochester Drive', lat: 1.3052, lng: 103.7874 },
  { name: 'Haw Par Villa MRT', address: '73 Pasir Panjang Road', lat: 1.2831, lng: 103.7824 },
  { name: 'Pasir Panjang Food Centre', address: '121 Pasir Panjang Road', lat: 1.2782, lng: 103.7913 },
  { name: 'Holland Village', address: 'Lorong Mambong', lat: 1.3109, lng: 103.7962 },
];
