import { LocationDatabase } from './location-database';

export interface Location {
  lat: number;
  lon: number;
  city?: string;
  country?: string;
  timezone?: string;
}

export class LocationDisplayUtils {
  private static locationDb = new LocationDatabase();

  /**
   * Get a user-friendly display name for a location
   */
  static getDisplayName(location: Location): string {
    if (!location) return 'Unknown Location';

    // If we have city and country, use them
    if (location.city && location.country) {
      return `${location.city}, ${location.country}`;
    }

    // If we only have city, try to find country from database
    if (location.city) {
      const dbLocation = this.locationDb.search(location.city)[0];
      if (dbLocation) {
        return `${location.city}, ${dbLocation.country}`;
      }
      return location.city;
    }

    // If we only have country
    if (location.country) {
      return location.country;
    }

    // If we only have coordinates, try to find nearest city
    if (location.lat && location.lon) {
      const nearest = this.locationDb.findNearestCity(location.lat, location.lon);
      if (nearest) {
        return `Near ${nearest.city}, ${nearest.country}`;
      }
      return `${location.lat.toFixed(2)}°, ${location.lon.toFixed(2)}°`;
    }

    return 'Unknown Location';
  }

  /**
   * Get a short display name (city only or coordinates)
   */
  static getShortDisplayName(location: Location): string {
    if (!location) return 'Unknown';

    if (location.city) {
      return location.city;
    }

    if (location.lat && location.lon) {
      const nearest = this.locationDb.findNearestCity(location.lat, location.lon);
      if (nearest) {
        return nearest.city;
      }
      return `${location.lat.toFixed(1)}°, ${location.lon.toFixed(1)}°`;
    }

    return 'Unknown';
  }

  /**
   * Get city name with fallback to database lookup
   */
  static getCityName(location: Location): string {
    if (!location) return 'Unknown City';

    if (location.city) {
      // Validate city name (basic check)
      if (this.isValidCityName(location.city)) {
        return location.city;
      }
    }

    // Try to find city from coordinates
    if (location.lat && location.lon) {
      const nearest = this.locationDb.findNearestCity(location.lat, location.lon);
      if (nearest) {
        return nearest.city;
      }
    }

    return 'Unknown City';
  }

  /**
   * Get country name with fallback to database lookup
   */
  static getCountryName(location: Location): string {
    if (!location) return 'Unknown Country';

    if (location.country) {
      return location.country;
    }

    // Try to find country from city name
    if (location.city) {
      const dbLocation = this.locationDb.search(location.city)[0];
      if (dbLocation) {
        return dbLocation.country;
      }
    }

    // Try to find country from coordinates
    if (location.lat && location.lon) {
      const nearest = this.locationDb.findNearestCity(location.lat, location.lon);
      if (nearest) {
        return nearest.country;
      }
    }

    return 'Unknown Country';
  }

  /**
   * Format coordinates for display
   */
  static formatCoordinates(lat: number, lon: number, precision: number = 4): string {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : 'W';
    
    return `${Math.abs(lat).toFixed(precision)}°${latDir}, ${Math.abs(lon).toFixed(precision)}°${lonDir}`;
  }

  /**
   * Get timezone with fallback to database lookup
   */
  static getTimezone(location: Location): string {
    if (!location) return 'UTC';

    if (location.timezone) {
      return location.timezone;
    }

    // Try to find timezone from city
    if (location.city) {
      const dbLocation = this.locationDb.search(location.city)[0];
      if (dbLocation && dbLocation.timezone) {
        return dbLocation.timezone;
      }
    }

    // Try to find timezone from coordinates
    if (location.lat && location.lon) {
      const nearest = this.locationDb.findNearestCity(location.lat, location.lon);
      if (nearest && nearest.timezone) {
        return nearest.timezone;
      }
    }

    // Fallback to UTC
    return 'UTC';
  }

  /**
   * Get location description for SEO and display
   */
  static getLocationDescription(location: Location): string {
    if (!location) return 'Explore golden hour and blue hour times for photography.';

    const cityName = this.getCityName(location);
    const countryName = this.getCountryName(location);

    // Try to find description from database
    if (location.city) {
      const dbLocation = this.locationDb.search(location.city)[0];
      if (dbLocation && dbLocation.description) {
        return `${dbLocation.description} Perfect for golden hour photography in ${cityName}.`;
      }
    }

    // Try coordinates lookup
    if (location.lat && location.lon) {
      const nearest = this.locationDb.findNearestCity(location.lat, location.lon);
      if (nearest && nearest.description) {
        return `${nearest.description} Perfect for golden hour photography near ${nearest.city}.`;
      }
    }

    // Generic description
    if (cityName !== 'Unknown City') {
      return `Discover the best golden hour and blue hour times for photography in ${cityName}, ${countryName}.`;
    }

    return 'Explore golden hour and blue hour times for photography at this location.';
  }

  /**
   * Get SEO keywords for location
   */
  static getSEOKeywords(location: Location): string[] {
    const keywords: string[] = ['golden hour', 'blue hour', 'photography', 'sunset', 'sunrise'];

    if (!location) return keywords;

    const cityName = this.getCityName(location);
    const countryName = this.getCountryName(location);

    // Add location-specific keywords
    if (cityName !== 'Unknown City') {
      keywords.push(
        `${cityName.toLowerCase()} golden hour`,
        `${cityName.toLowerCase()} photography`,
        `${cityName.toLowerCase()} sunset`,
        `${cityName.toLowerCase()} sunrise`
      );
    }

    if (countryName !== 'Unknown Country') {
      keywords.push(
        `${countryName.toLowerCase()} photography`,
        `${countryName.toLowerCase()} golden hour`
      );
    }

    // Try to get keywords from database
    if (location.city) {
      const dbLocation = this.locationDb.search(location.city)[0];
      if (dbLocation && dbLocation.seoKeywords) {
        keywords.push(...dbLocation.seoKeywords);
      }
    }

    // Try coordinates lookup
    if (location.lat && location.lon) {
      const nearest = this.locationDb.findNearestCity(location.lat, location.lon);
      if (nearest && nearest.seoKeywords) {
        keywords.push(...nearest.seoKeywords);
      }
    }

    // Remove duplicates and return
    return [...new Set(keywords)];
  }

  /**
   * Check if a city name looks valid (basic validation)
   */
  private static isValidCityName(city: string): boolean {
    if (!city || typeof city !== 'string') return false;
    
    // Basic checks
    const trimmed = city.trim();
    if (trimmed.length < 2 || trimmed.length > 100) return false;
    
    // Check for obviously invalid patterns
    const invalidPatterns = [
      /^\d+$/, // Only numbers
      /^[^a-zA-Z]*$/, // No letters
      /^(unknown|null|undefined|n\/a)$/i, // Common invalid values
    ];
    
    return !invalidPatterns.some(pattern => pattern.test(trimmed));
  }

  /**
   * Get location category for filtering and display
   */
  static getLocationCategory(location: Location): string {
    if (!location) return 'unknown';

    // Try to find category from database
    if (location.city) {
      const dbLocation = this.locationDb.search(location.city)[0];
      if (dbLocation) {
        return dbLocation.category;
      }
    }

    // Try coordinates lookup
    if (location.lat && location.lon) {
      const nearest = this.locationDb.findNearestCity(location.lat, location.lon);
      if (nearest) {
        return nearest.category;
      }
    }

    return 'city'; // Default category
  }

  /**
   * Get best months for photography at this location
   */
  static getBestMonths(location: Location): number[] {
    if (!location) return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; // All months as fallback

    // Try to find best months from database
    if (location.city) {
      const dbLocation = this.locationDb.search(location.city)[0];
      if (dbLocation && dbLocation.bestMonths) {
        return dbLocation.bestMonths;
      }
    }

    // Try coordinates lookup
    if (location.lat && location.lon) {
      const nearest = this.locationDb.findNearestCity(location.lat, location.lon);
      if (nearest && nearest.bestMonths) {
        return nearest.bestMonths;
      }
    }

    // Fallback based on hemisphere
    if (location.lat !== undefined) {
      if (location.lat > 0) {
        // Northern hemisphere - avoid winter months
        return [4, 5, 6, 7, 8, 9, 10];
      } else {
        // Southern hemisphere - avoid their winter months
        return [1, 2, 3, 10, 11, 12];
      }
    }

    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; // All months as final fallback
  }

  /**
   * Check if current month is good for photography at this location
   */
  static isGoodMonth(location: Location, month?: number): boolean {
    const currentMonth = month || new Date().getMonth() + 1;
    const bestMonths = this.getBestMonths(location);
    return bestMonths.includes(currentMonth);
  }
}