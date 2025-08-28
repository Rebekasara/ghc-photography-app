import { LocationCache } from './location-cache';
import { LOCATION_DATABASE, LocationDatabase } from './location-database';

export interface Location {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  timezone?: string;
  accuracy?: number;
  source?: 'gps' | 'ip' | 'manual' | 'cache';
  timestamp?: number;
  quality?: number;
}

export interface IPLocationResponse {
  lat: number;
  lon: number;
  city: string;
  country: string;
  timezone: string;
}

export class LocationService {
  private cache: LocationCache;
  private locationDatabase: LocationDatabase;
  private readonly IP_SERVICES = [
    'https://ipapi.co/json/',
    'https://ip-api.com/json/',
    'https://ipinfo.io/json'
  ];

  constructor() {
    this.cache = new LocationCache();
    this.locationDatabase = new LocationDatabase();
  }

  /**
   * Get user's current location with fallback strategies
   */
  async getCurrentLocation(): Promise<Location | null> {
    try {
      // Try cache first
      const cached = this.cache.get('current_location');
      if (cached && this.isLocationValid(cached)) {
        return cached;
      }

      // Try GPS first
      const gpsLocation = await this.getGPSLocation();
      if (gpsLocation) {
        this.cache.set('current_location', gpsLocation, 300000); // 5 minutes
        return gpsLocation;
      }

      // Fallback to IP-based location
      const ipLocation = await this.getIPLocation();
      if (ipLocation) {
        this.cache.set('current_location', ipLocation, 1800000); // 30 minutes
        return ipLocation;
      }

      return null;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  /**
   * Get location using browser's geolocation API
   */
  private async getGPSLocation(): Promise<Location | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      const timeout = setTimeout(() => {
        resolve(null);
      }, 10000); // 10 second timeout

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          clearTimeout(timeout);
          const { latitude, longitude, accuracy } = position.coords;
          
          // Reverse geocode to get city and country
          const geocoded = await this.reverseGeocode(latitude, longitude);
          
          const location: Location = {
            latitude,
            longitude,
            accuracy,
            source: 'gps',
            timestamp: Date.now(),
            quality: this.calculateLocationQuality({ latitude, longitude, accuracy, source: 'gps' }),
            ...geocoded
          };
          
          resolve(location);
        },
        (error) => {
          clearTimeout(timeout);
          console.warn('GPS location error:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  /**
   * Get location using IP-based services
   */
  private async getIPLocation(): Promise<Location | null> {
    for (const service of this.IP_SERVICES) {
      try {
        const response = await fetch(service, {
          timeout: 5000
        } as RequestInit);
        
        if (!response.ok) continue;
        
        const data: IPLocationResponse = await response.json();
        
        if (data.lat && data.lon) {
          const location: Location = {
            latitude: data.lat,
            longitude: data.lon,
            city: data.city,
            country: data.country,
            timezone: data.timezone,
            source: 'ip',
            timestamp: Date.now(),
            quality: this.calculateLocationQuality({
              latitude: data.lat,
              longitude: data.lon,
              source: 'ip'
            })
          };
          
          return location;
        }
      } catch (error) {
        console.warn(`IP service ${service} failed:`, error);
        continue;
      }
    }
    
    return null;
  }

  /**
   * Reverse geocode coordinates to get location details
   */
  private async reverseGeocode(lat: number, lon: number): Promise<Partial<Location>> {
    try {
      // First check our location database for nearby cities
      const nearestCity = this.locationDatabase.findNearestCity(lat, lon);
      if (nearestCity && this.calculateDistance(lat, lon, nearestCity.lat, nearestCity.lon) < 50) {
        return {
          city: nearestCity.city,
          country: nearestCity.country,
          timezone: nearestCity.timezone
        };
      }

      // Fallback to reverse geocoding service
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
        { timeout: 5000 } as RequestInit
      );
      
      if (response.ok) {
        const data = await response.json();
        return {
          city: data.city || data.locality,
          country: data.countryName,
          timezone: data.timezone?.name
        };
      }
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
    }
    
    return {};
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
   * Calculate location quality score (0-100)
   */
  private calculateLocationQuality(location: Partial<Location>): number {
    let score = 0;
    
    // Source quality
    switch (location.source) {
      case 'gps':
        score += 40;
        break;
      case 'ip':
        score += 20;
        break;
      case 'manual':
        score += 35;
        break;
      case 'cache':
        score += 10;
        break;
    }
    
    // Accuracy bonus (for GPS)
    if (location.accuracy) {
      if (location.accuracy < 10) score += 30;
      else if (location.accuracy < 50) score += 20;
      else if (location.accuracy < 100) score += 10;
    }
    
    // Completeness bonus
    if (location.city) score += 10;
    if (location.country) score += 10;
    if (location.timezone) score += 10;
    
    return Math.min(100, score);
  }

  /**
   * Check if location is still valid
   */
  private isLocationValid(location: Location): boolean {
    if (!location.timestamp) return false;
    
    const age = Date.now() - location.timestamp;
    const maxAge = location.source === 'gps' ? 300000 : 1800000; // 5 min for GPS, 30 min for IP
    
    return age < maxAge;
  }

  /**
   * Search for locations in the database
   */
  searchLocations(query: string): Location[] {
    const results = this.locationDatabase.search(query);
    return results.map(result => ({
      latitude: result.lat,
      longitude: result.lon,
      city: result.city,
      country: result.country,
      timezone: result.timezone,
      source: 'manual' as const,
      quality: 85
    }));
  }

  /**
   * Get popular photography locations
   */
  getPopularLocations(): Location[] {
    const popular = this.locationDatabase.getByCategory('landmark')
      .concat(this.locationDatabase.getByCategory('nature'))
      .slice(0, 20);
    
    return popular.map(location => ({
      latitude: location.lat,
      longitude: location.lon,
      city: location.city,
      country: location.country,
      timezone: location.timezone,
      source: 'manual' as const,
      quality: 90
    }));
  }
}