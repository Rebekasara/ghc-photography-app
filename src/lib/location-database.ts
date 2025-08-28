export interface LocationEntry {
  id: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
  timezone: string;
  population?: number;
  category: 'city' | 'landmark' | 'nature' | 'beach' | 'mountain';
  traffic: 'low' | 'medium' | 'high';
  bestMonths: number[]; // 1-12
  seoKeywords: string[];
  description?: string;
}

export const LOCATION_DATABASE: LocationEntry[] = [
  // Major Cities
  {
    id: 'nyc',
    city: 'New York',
    country: 'United States',
    lat: 40.7128,
    lon: -74.0060,
    timezone: 'America/New_York',
    population: 8336817,
    category: 'city',
    traffic: 'high',
    bestMonths: [4, 5, 6, 9, 10, 11],
    seoKeywords: ['new york golden hour', 'manhattan photography', 'nyc sunset', 'brooklyn bridge golden hour'],
    description: 'The city that never sleeps offers incredible urban photography opportunities'
  },
  {
    id: 'london',
    city: 'London',
    country: 'United Kingdom',
    lat: 51.5074,
    lon: -0.1278,
    timezone: 'Europe/London',
    population: 9648110,
    category: 'city',
    traffic: 'high',
    bestMonths: [5, 6, 7, 8, 9],
    seoKeywords: ['london golden hour', 'thames sunset', 'big ben photography', 'london bridge golden hour'],
    description: 'Historic architecture and the Thames provide stunning photography backdrops'
  },
  {
    id: 'paris',
    city: 'Paris',
    country: 'France',
    lat: 48.8566,
    lon: 2.3522,
    timezone: 'Europe/Paris',
    population: 2161000,
    category: 'city',
    traffic: 'high',
    bestMonths: [4, 5, 6, 7, 8, 9, 10],
    seoKeywords: ['paris golden hour', 'eiffel tower sunset', 'seine river photography', 'montmartre golden hour'],
    description: 'The City of Light offers romantic and architectural photography opportunities'
  },
  {
    id: 'tokyo',
    city: 'Tokyo',
    country: 'Japan',
    lat: 35.6762,
    lon: 139.6503,
    timezone: 'Asia/Tokyo',
    population: 37400068,
    category: 'city',
    traffic: 'high',
    bestMonths: [3, 4, 5, 10, 11],
    seoKeywords: ['tokyo golden hour', 'shibuya sunset', 'tokyo tower photography', 'cherry blossom golden hour'],
    description: 'Modern metropolis with traditional elements and stunning city views'
  },
  {
    id: 'sydney',
    city: 'Sydney',
    country: 'Australia',
    lat: -33.8688,
    lon: 151.2093,
    timezone: 'Australia/Sydney',
    population: 5312163,
    category: 'city',
    traffic: 'high',
    bestMonths: [3, 4, 5, 9, 10, 11],
    seoKeywords: ['sydney golden hour', 'opera house sunset', 'harbour bridge photography', 'bondi beach golden hour'],
    description: 'Iconic harbor city with world-famous landmarks and beautiful beaches'
  },
  {
    id: 'dubai',
    city: 'Dubai',
    country: 'United Arab Emirates',
    lat: 25.2048,
    lon: 55.2708,
    timezone: 'Asia/Dubai',
    population: 3400000,
    category: 'city',
    traffic: 'high',
    bestMonths: [11, 12, 1, 2, 3, 4],
    seoKeywords: ['dubai golden hour', 'burj khalifa sunset', 'dubai marina photography', 'desert golden hour'],
    description: 'Futuristic city with stunning architecture and desert landscapes'
  },
  {
    id: 'singapore',
    city: 'Singapore',
    country: 'Singapore',
    lat: 1.3521,
    lon: 103.8198,
    timezone: 'Asia/Singapore',
    population: 5850342,
    category: 'city',
    traffic: 'high',
    bestMonths: [2, 3, 4, 7, 8, 9],
    seoKeywords: ['singapore golden hour', 'marina bay sunset', 'gardens by the bay photography', 'singapore skyline'],
    description: 'Modern city-state with impressive architecture and urban gardens'
  },
  {
    id: 'hongkong',
    city: 'Hong Kong',
    country: 'Hong Kong',
    lat: 22.3193,
    lon: 114.1694,
    timezone: 'Asia/Hong_Kong',
    population: 7496981,
    category: 'city',
    traffic: 'high',
    bestMonths: [10, 11, 12, 3, 4, 5],
    seoKeywords: ['hong kong golden hour', 'victoria harbour sunset', 'peak photography', 'hong kong skyline'],
    description: 'Dramatic skyline and harbor views from Victoria Peak'
  },
  {
    id: 'barcelona',
    city: 'Barcelona',
    country: 'Spain',
    lat: 41.3851,
    lon: 2.1734,
    timezone: 'Europe/Madrid',
    population: 1620343,
    category: 'city',
    traffic: 'high',
    bestMonths: [4, 5, 6, 7, 8, 9, 10],
    seoKeywords: ['barcelona golden hour', 'sagrada familia sunset', 'park guell photography', 'barcelona beach'],
    description: 'Architectural marvels by Gaudí and beautiful Mediterranean coastline'
  },
  {
    id: 'rome',
    city: 'Rome',
    country: 'Italy',
    lat: 41.9028,
    lon: 12.4964,
    timezone: 'Europe/Rome',
    population: 2872800,
    category: 'city',
    traffic: 'high',
    bestMonths: [4, 5, 6, 9, 10],
    seoKeywords: ['rome golden hour', 'colosseum sunset', 'vatican photography', 'roman forum golden hour'],
    description: 'Ancient history meets modern life in the Eternal City'
  },

  // Natural Landmarks
  {
    id: 'grandcanyon',
    city: 'Grand Canyon',
    country: 'United States',
    lat: 36.1069,
    lon: -112.1129,
    timezone: 'America/Phoenix',
    category: 'nature',
    traffic: 'high',
    bestMonths: [4, 5, 6, 9, 10],
    seoKeywords: ['grand canyon golden hour', 'canyon sunset photography', 'arizona landscape'],
    description: 'One of the most spectacular natural wonders for landscape photography'
  },
  {
    id: 'santorini',
    city: 'Santorini',
    country: 'Greece',
    lat: 36.3932,
    lon: 25.4615,
    timezone: 'Europe/Athens',
    category: 'landmark',
    traffic: 'high',
    bestMonths: [4, 5, 6, 7, 8, 9, 10],
    seoKeywords: ['santorini golden hour', 'oia sunset', 'greek islands photography', 'cyclades golden hour'],
    description: 'Famous for its stunning sunsets and white-washed buildings'
  },
  {
    id: 'banff',
    city: 'Banff',
    country: 'Canada',
    lat: 51.4968,
    lon: -115.9281,
    timezone: 'America/Edmonton',
    category: 'nature',
    traffic: 'medium',
    bestMonths: [6, 7, 8, 9],
    seoKeywords: ['banff golden hour', 'canadian rockies photography', 'lake louise sunset', 'mountain photography'],
    description: 'Pristine mountain landscapes and crystal-clear lakes'
  },
  {
    id: 'bali',
    city: 'Bali',
    country: 'Indonesia',
    lat: -8.3405,
    lon: 115.0920,
    timezone: 'Asia/Makassar',
    category: 'beach',
    traffic: 'high',
    bestMonths: [4, 5, 6, 7, 8, 9],
    seoKeywords: ['bali golden hour', 'uluwatu sunset', 'rice terraces photography', 'bali beach sunset'],
    description: 'Tropical paradise with temples, rice terraces, and stunning beaches'
  },
  {
    id: 'iceland',
    city: 'Reykjavik',
    country: 'Iceland',
    lat: 64.1466,
    lon: -21.9426,
    timezone: 'Atlantic/Reykjavik',
    category: 'nature',
    traffic: 'medium',
    bestMonths: [6, 7, 8, 9],
    seoKeywords: ['iceland golden hour', 'northern lights photography', 'glacier photography', 'waterfall golden hour'],
    description: 'Dramatic landscapes with waterfalls, glaciers, and northern lights'
  },
  {
    id: 'maldives',
    city: 'Malé',
    country: 'Maldives',
    lat: 4.1755,
    lon: 73.5093,
    timezone: 'Indian/Maldives',
    category: 'beach',
    traffic: 'medium',
    bestMonths: [11, 12, 1, 2, 3, 4],
    seoKeywords: ['maldives golden hour', 'tropical sunset photography', 'overwater villa photography', 'coral reef'],
    description: 'Pristine tropical islands with crystal-clear waters and coral reefs'
  },
  {
    id: 'patagonia',
    city: 'El Calafate',
    country: 'Argentina',
    lat: -50.3378,
    lon: -72.2647,
    timezone: 'America/Argentina/Buenos_Aires',
    category: 'nature',
    traffic: 'low',
    bestMonths: [11, 12, 1, 2, 3],
    seoKeywords: ['patagonia golden hour', 'glacier photography', 'mountain landscape', 'torres del paine'],
    description: 'Rugged wilderness with glaciers, mountains, and pristine lakes'
  },
  {
    id: 'machu_picchu',
    city: 'Machu Picchu',
    country: 'Peru',
    lat: -13.1631,
    lon: -72.5450,
    timezone: 'America/Lima',
    category: 'landmark',
    traffic: 'high',
    bestMonths: [5, 6, 7, 8, 9],
    seoKeywords: ['machu picchu golden hour', 'inca ruins photography', 'andes mountains', 'peru landscape'],
    description: 'Ancient Incan citadel set high in the Andes Mountains'
  },
  {
    id: 'taj_mahal',
    city: 'Agra',
    country: 'India',
    lat: 27.1751,
    lon: 78.0421,
    timezone: 'Asia/Kolkata',
    category: 'landmark',
    traffic: 'high',
    bestMonths: [10, 11, 12, 1, 2, 3],
    seoKeywords: ['taj mahal golden hour', 'india monument photography', 'agra sunset', 'mughal architecture'],
    description: 'Iconic white marble mausoleum and UNESCO World Heritage Site'
  },
  {
    id: 'petra',
    city: 'Petra',
    country: 'Jordan',
    lat: 30.3285,
    lon: 35.4444,
    timezone: 'Asia/Amman',
    category: 'landmark',
    traffic: 'medium',
    bestMonths: [3, 4, 5, 10, 11],
    seoKeywords: ['petra golden hour', 'jordan archaeology', 'treasury sunset', 'desert photography'],
    description: 'Ancient city carved into rose-red sandstone cliffs'
  },

  // Beach Destinations
  {
    id: 'malibu',
    city: 'Malibu',
    country: 'United States',
    lat: 34.0259,
    lon: -118.7798,
    timezone: 'America/Los_Angeles',
    category: 'beach',
    traffic: 'high',
    bestMonths: [4, 5, 6, 7, 8, 9, 10],
    seoKeywords: ['malibu golden hour', 'california beach sunset', 'pacific coast photography', 'surf photography'],
    description: 'Stunning Pacific coastline with dramatic cliffs and pristine beaches'
  },
  {
    id: 'amalfi',
    city: 'Amalfi',
    country: 'Italy',
    lat: 40.6340,
    lon: 14.6027,
    timezone: 'Europe/Rome',
    category: 'beach',
    traffic: 'high',
    bestMonths: [5, 6, 7, 8, 9, 10],
    seoKeywords: ['amalfi coast golden hour', 'positano sunset', 'mediterranean photography', 'italian coastline'],
    description: 'Dramatic coastline with colorful cliffside villages'
  },
  {
    id: 'seychelles',
    city: 'Victoria',
    country: 'Seychelles',
    lat: -4.6796,
    lon: 55.4920,
    timezone: 'Indian/Mahe',
    category: 'beach',
    traffic: 'low',
    bestMonths: [4, 5, 10, 11],
    seoKeywords: ['seychelles golden hour', 'tropical beach photography', 'granite boulders', 'pristine beaches'],
    description: 'Pristine tropical beaches with unique granite boulder formations'
  },

  // Mountain Destinations
  {
    id: 'zermatt',
    city: 'Zermatt',
    country: 'Switzerland',
    lat: 46.0207,
    lon: 7.7491,
    timezone: 'Europe/Zurich',
    category: 'mountain',
    traffic: 'high',
    bestMonths: [6, 7, 8, 9],
    seoKeywords: ['zermatt golden hour', 'matterhorn photography', 'swiss alps sunset', 'mountain reflection'],
    description: 'Iconic Matterhorn peak and pristine Alpine scenery'
  },
  {
    id: 'everest_base_camp',
    city: 'Everest Base Camp',
    country: 'Nepal',
    lat: 28.0026,
    lon: 86.8528,
    timezone: 'Asia/Kathmandu',
    category: 'mountain',
    traffic: 'low',
    bestMonths: [3, 4, 5, 10, 11],
    seoKeywords: ['everest golden hour', 'himalaya photography', 'mountain sunrise', 'nepal landscape'],
    description: 'Base camp of the world\'s highest peak with stunning Himalayan views'
  },
  {
    id: 'torres_del_paine',
    city: 'Torres del Paine',
    country: 'Chile',
    lat: -50.9423,
    lon: -73.4068,
    timezone: 'America/Santiago',
    category: 'mountain',
    traffic: 'low',
    bestMonths: [11, 12, 1, 2, 3],
    seoKeywords: ['torres del paine golden hour', 'patagonia photography', 'chile landscape', 'mountain towers'],
    description: 'Dramatic granite towers and pristine Patagonian wilderness'
  }
];

export class LocationDatabase {
  private locations: LocationEntry[];

  constructor() {
    this.locations = LOCATION_DATABASE;
  }

  /**
   * Search locations by name or keywords
   */
  search(query: string): LocationEntry[] {
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) return [];

    return this.locations.filter(location => {
      const cityMatch = location.city.toLowerCase().includes(searchTerm);
      const countryMatch = location.country.toLowerCase().includes(searchTerm);
      const keywordMatch = location.seoKeywords.some(keyword => 
        keyword.toLowerCase().includes(searchTerm)
      );
      const descriptionMatch = location.description?.toLowerCase().includes(searchTerm) || false;
      
      return cityMatch || countryMatch || keywordMatch || descriptionMatch;
    }).slice(0, 10); // Limit results
  }

  /**
   * Get locations by category
   */
  getByCategory(category: LocationEntry['category']): LocationEntry[] {
    return this.locations.filter(location => location.category === category);
  }

  /**
   * Get locations by traffic level
   */
  getByTraffic(traffic: LocationEntry['traffic']): LocationEntry[] {
    return this.locations.filter(location => location.traffic === traffic);
  }

  /**
   * Get locations good for a specific month
   */
  getByMonth(month: number): LocationEntry[] {
    return this.locations.filter(location => 
      location.bestMonths.includes(month)
    );
  }

  /**
   * Get locations by country
   */
  getByCountry(country: string): LocationEntry[] {
    return this.locations.filter(location => 
      location.country.toLowerCase() === country.toLowerCase()
    );
  }

  /**
   * Find nearest city to given coordinates
   */
  findNearestCity(lat: number, lon: number): LocationEntry | null {
    if (this.locations.length === 0) return null;

    let nearest = this.locations[0];
    let minDistance = this.calculateDistance(lat, lon, nearest.lat, nearest.lon);

    for (const location of this.locations) {
      const distance = this.calculateDistance(lat, lon, location.lat, location.lon);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = location;
      }
    }

    return nearest;
  }

  /**
   * Get popular photography destinations
   */
  getPopularDestinations(): LocationEntry[] {
    return this.locations
      .filter(location => location.traffic === 'high')
      .slice(0, 20);
  }

  /**
   * Get hidden gems (low traffic locations)
   */
  getHiddenGems(): LocationEntry[] {
    return this.locations
      .filter(location => location.traffic === 'low')
      .slice(0, 10);
  }

  /**
   * Calculate distance between two coordinates in kilometers
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get location by ID
   */
  getById(id: string): LocationEntry | null {
    return this.locations.find(location => location.id === id) || null;
  }

  /**
   * Get all locations
   */
  getAll(): LocationEntry[] {
    return [...this.locations];
  }
}